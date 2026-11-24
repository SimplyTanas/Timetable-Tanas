/**
 * Thời Gian Biểu Tanas — Production Fullstack Server
 * Pure Node.js HTTP server powered by SQLite (`node:sqlite` via db.js, JSON fallback) providing:
 * - Static frontend asset serving (strict allowlist)
 * - Cookie/Bearer Auth API (Register, Login, Logout, Profile/Password update, Session Check)
 *   with 30-day "Remember Me" persistence
 * - Per-user schedule & preferences persistence in DATA_DIR/tanas.db (or schedules/<userId>.json)
 * - Loopback-only /api/data endpoint for local Windows .bat compatibility
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createStorage } = require('./db');

const ROOT = path.resolve(__dirname);
const PORT = Number(process.env.PORT) || 58123;
const HOST = process.env.HOST || (process.env.PORT ? '0.0.0.0' : '127.0.0.1');
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'));
const LOCAL_COMPAT_FILE = path.join(ROOT, 'schedule-data.json');

const SESSION_COOKIE_NAME = 'tanas_session';
const REMEMBER_MAX_AGE_SEC = 30 * 24 * 60 * 60; // 30 days
const EPHEMERAL_TTL_MS = 24 * 60 * 60 * 1000;  // 24 hours fallback TTL for non-remembered sessions
const ONLINE_WINDOW_MS = 2 * 60 * 1000;        // 2 minutes active window for Online indicator

const STATIC_ALLOWLIST = new Set([
  'index.html',
  'app.js',
  'auth.js',
  'studio.js',
  'sketchy.js',
  'style.css',
  'logo.png'
]);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon'
};

// In-memory rate limiter for auth endpoints
const authRateMap = new Map();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  try {
    const expected = Buffer.from(keyHex, 'hex');
    const actual = crypto.scryptSync(String(password), salt, expected.length);
    if (expected.length !== actual.length) return false;
    return crypto.timingSafeEqual(expected, actual);
  } catch (_) {
    return false;
  }
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function getOrCreateVaultKey(dirPath) {
  const keyFile = path.join(dirPath, '.vault.key');
  try {
    if (fs.existsSync(keyFile)) {
      const hex = fs.readFileSync(keyFile, 'utf8').trim();
      if (/^[0-9a-f]{64}$/i.test(hex)) {
        return Buffer.from(hex, 'hex');
      }
    }
  } catch (_) {}
  const key = crypto.randomBytes(32);
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(keyFile, key.toString('hex'), { encoding: 'utf8', mode: 0o600 });
  } catch (_) {}
  return key;
}

function encryptVaultText(vaultKey, plaintext) {
  const clean = String(plaintext || '');
  if (!clean) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', vaultKey, iv);
  const encrypted = Buffer.concat([cipher.update(clean, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptVaultText(vaultKey, payload) {
  const raw = String(payload || '');
  if (!raw || !raw.startsWith('v1:')) return '';
  try {
    const [, ivHex, tagHex, dataHex] = raw.split(':');
    const decipher = crypto.createDecipheriv('aes-256-gcm', vaultKey, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const plain = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
    return plain.toString('utf8');
  } catch (_) {
    return '';
  }
}

function maskApiKey(rawKey) {
  const k = String(rawKey || '').trim();
  if (!k) return '';
  if (k.length <= 8) return `••••${k.slice(-2)}`;
  return `${k.slice(0, 6)}••••${k.slice(-4)}`;
}

function formatLocalDayStr(tsOrIso) {
  const d = new Date(tsOrIso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach(part => {
    const eq = part.indexOf('=');
    if (eq === -1) return;
    const key = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    if (!key) return;
    try {
      out[key] = decodeURIComponent(val);
    } catch (_) {
      out[key] = val;
    }
  });
  return out;
}

function isSecureRequest(req) {
  if (process.env.COOKIE_SECURE === '1') return true;
  const proto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  return proto === 'https';
}

function buildSessionCookie(req, token, rememberMe, expiresAtMs) {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax'
  ];
  if (rememberMe) {
    parts.push(`Max-Age=${REMEMBER_MAX_AGE_SEC}`);
    parts.push(`Expires=${new Date(expiresAtMs).toUTCString()}`);
  }
  if (isSecureRequest(req)) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

function buildClearCookie(req) {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ];
  if (isSecureRequest(req)) parts.push('Secure');
  return parts.join('; ');
}

function isLoopbackIp(req) {
  if (req.headers['x-forwarded-for']) return false;
  const addr = req.socket?.remoteAddress || '';
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

function sendJson(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders
  });
  res.end(JSON.stringify(payload));
}

function readBodyJson(req, maxBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    req.on('data', chunk => {
      total += chunk.length;
      if (total > maxBytes) {
        const err = new Error('PAYLOAD_TOO_LARGE');
        err.status = 413;
        req.destroy();
        reject(err);
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve(text ? JSON.parse(text) : {});
      } catch (_) {
        const err = new Error('INVALID_JSON');
        err.status = 400;
        reject(err);
      }
    });
    req.on('error', err => reject(err));
  });
}

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const entry = authRateMap.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  authRateMap.set(ip, entry);
  return entry.count <= 30;
}

function extractAuthToken(req) {
  const cookies = parseCookies(req);
  if (cookies[SESSION_COOKIE_NAME]) return cookies[SESSION_COOKIE_NAME];
  const authHeader = String(req.headers.authorization || '');
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return '';
}

function createTanasServer(dataDir = DATA_DIR) {
  const store = createStorage(dataDir);
  const vaultKey = getOrCreateVaultKey(dataDir);
  const seenThrottleMap = new Map();
  const configuredAdminUser = String(process.env.TANAS_ADMIN_USER || '').trim();

  function isRootAdminUser(user) {
    if (!configuredAdminUser || !user) return false;
    const uname = String(user.usernameLower || user.username || '').toLowerCase();
    return uname === configuredAdminUser.toLowerCase();
  }

  function ensureDefaultAdmin() {
    const adminPass = String(process.env.TANAS_ADMIN_PASSWORD || '');
    if (!configuredAdminUser || !adminPass) return;
    if (!/^[a-zA-Z0-9._-]{3,32}$/.test(configuredAdminUser) || adminPass.length < 6) return;

    const existing = store.findUserByUsername(configuredAdminUser);
    if (!existing) {
      const nowIso = new Date().toISOString();
      store.createUser({
        id: 'u_admin_' + crypto.randomBytes(6).toString('hex'),
        username: configuredAdminUser,
        displayName: configuredAdminUser,
        passwordHash: hashPassword(adminPass),
        role: 'admin',
        createdAt: nowIso,
        lastLoginAt: nowIso,
        lastSeenAt: 0
      });
    } else if (existing.role !== 'admin' && !existing.isBanned) {
      store.updateUserRole(existing.id, 'admin');
    }
  }
  ensureDefaultAdmin();

  function serializePublicUser(user) {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      role: user.role === 'admin' ? 'admin' : 'user',
      isBanned: Boolean(user.isBanned),
      bannedReason: user.bannedReason || '',
      createdAt: user.createdAt
    };
  }

  function touchSeenThrottled(userId, force = false) {
    const now = Date.now();
    const prev = seenThrottleMap.get(userId) || 0;
    if (force || now - prev >= 15000) {
      seenThrottleMap.set(userId, now);
      store.updateLastSeen(userId, now);
    }
  }

  function authenticateRequest(req, options = {}) {
    const token = extractAuthToken(req);
    if (!token) return null;

    const session = store.findActiveSession(hashToken(token));
    if (!session) return null;

    const user = store.findUserById(session.userId);
    if (!user) return null;

    if (user.isBanned) {
      store.deleteUserSessions(user.id);
      return {
        banned: true,
        bannedReason: user.bannedReason || 'Tài khoản đã bị quản trị viên khóa.',
        rawUser: user
      };
    }

    if (!options.skipSeenTouch) {
      touchSeenThrottled(user.id, Boolean(options.forceSeenTouch));
    }

    return {
      token,
      session,
      rawUser: user,
      user: serializePublicUser(user)
    };
  }

  function requireAuth(req, res, options = {}) {
    const auth = authenticateRequest(req, options);
    if (!auth) {
      sendJson(res, 401, { ok: false, error: 'Vui lòng đăng nhập để tiếp tục.' });
      return null;
    }
    if (auth.banned) {
      sendJson(
        res,
        403,
        { ok: false, banned: true, error: `Tài khoản đã bị khóa: ${auth.bannedReason}` },
        { 'Set-Cookie': buildClearCookie(req) }
      );
      return null;
    }
    return auth;
  }

  function requireAdmin(req, res) {
    const auth = requireAuth(req, res);
    if (!auth) return null;
    if (auth.user.role !== 'admin') {
      sendJson(res, 403, { ok: false, error: 'Chỉ tài khoản Quản trị viên (Admin) mới có quyền truy cập.' });
      return null;
    }
    return auth;
  }

  function createUserSession(userId, rememberMe) {
    const token = crypto.randomBytes(32).toString('base64url');
    const now = Date.now();
    const ttlMs = rememberMe ? REMEMBER_MAX_AGE_SEC * 1000 : EPHEMERAL_TTL_MS;
    const expiresAt = now + ttlMs;

    store.createSession({
      tokenHash: hashToken(token),
      userId,
      rememberMe: Boolean(rememberMe),
      createdAt: now,
      expiresAt
    });
    return { token, rememberMe: Boolean(rememberMe), expiresAt };
  }

  async function handleApi(req, res, pathname) {
    // Healthcheck
    if (pathname === '/api/health' || pathname === '/health') {
      return sendJson(res, 200, {
        ok: true,
        service: 'thoi-gian-bieu-tanas',
        version: '3.1.0',
        storage: store.engine,
        rememberDays: 30
      });
    }

    // Register new user
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const clientIp = String(req.socket?.remoteAddress || 'unknown');
      if (!checkRateLimit(clientIp)) {
        return sendJson(res, 429, { ok: false, error: 'Bạn thao tác quá nhanh, vui lòng thử lại sau vài phút.' });
      }
      try {
        const body = await readBodyJson(req, 64 * 1024);
        const rawUser = String(body.username || '').trim();
        const password = String(body.password || '');
        const displayName = String(body.displayName || rawUser).trim().slice(0, 50);
        const rememberMe = Boolean(body.rememberMe);

        if (!/^[a-zA-Z0-9._-]{3,32}$/.test(rawUser)) {
          return sendJson(res, 400, {
            ok: false,
            error: 'Tên đăng nhập gồm 3–32 ký tự chữ, số hoặc dấu . _ - (không khoảng trắng).'
          });
        }
        if (password.length < 6 || password.length > 128) {
          return sendJson(res, 400, {
            ok: false,
            error: 'Mật khẩu cần tối thiểu 6 ký tự.'
          });
        }

        if (store.findUserByUsername(rawUser)) {
          return sendJson(res, 409, { ok: false, error: 'Tên đăng nhập này đã có người sử dụng.' });
        }

        const nowIso = new Date().toISOString();
        const nowMs = Date.now();
        const newUser = store.createUser({
          id: 'u_' + crypto.randomBytes(8).toString('hex'),
          username: rawUser,
          displayName: displayName || rawUser,
          passwordHash: hashPassword(password),
          role: 'user',
          createdAt: nowIso,
          lastLoginAt: nowIso,
          lastSeenAt: nowMs
        });

        const { token, expiresAt } = createUserSession(newUser.id, rememberMe);
        return sendJson(
          res,
          201,
          {
            ok: true,
            user: serializePublicUser(newUser),
            rememberMe,
            expiresAt,
            storage: store.getStats(newUser.id)
          },
          { 'Set-Cookie': buildSessionCookie(req, token, rememberMe, expiresAt) }
        );
      } catch (err) {
        return sendJson(res, err.status || 400, { ok: false, error: 'Dữ liệu đăng ký không hợp lệ.' });
      }
    }

    // Login user
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const clientIp = String(req.socket?.remoteAddress || 'unknown');
      if (!checkRateLimit(clientIp)) {
        return sendJson(res, 429, { ok: false, error: 'Thử đăng nhập quá nhiều lần, vui lòng đợi chút.' });
      }
      try {
        const body = await readBodyJson(req, 64 * 1024);
        const rawUser = String(body.username || '').trim();
        const password = String(body.password || '');
        const rememberMe = Boolean(body.rememberMe);

        const user = store.findUserByUsername(rawUser);
        if (!user || !verifyPassword(password, user.passwordHash)) {
          return sendJson(res, 401, { ok: false, error: 'Sai tên đăng nhập hoặc mật khẩu.' });
        }
        if (user.isBanned) {
          return sendJson(res, 403, {
            ok: false,
            banned: true,
            error: `Tài khoản đã bị khóa: ${user.bannedReason || 'Liên hệ quản trị viên.'}`
          });
        }

        store.touchUserLogin(user.id, new Date().toISOString(), Date.now());

        const { token, expiresAt } = createUserSession(user.id, rememberMe);
        return sendJson(
          res,
          200,
          {
            ok: true,
            user: serializePublicUser(user),
            rememberMe,
            expiresAt,
            storage: store.getStats(user.id)
          },
          { 'Set-Cookie': buildSessionCookie(req, token, rememberMe, expiresAt) }
        );
      } catch (err) {
        return sendJson(res, err.status || 400, { ok: false, error: 'Yêu cầu đăng nhập không hợp lệ.' });
      }
    }

    // Update profile (displayName & optional password change)
    if (pathname === '/api/auth/profile' && (req.method === 'PUT' || req.method === 'PATCH')) {
      const auth = requireAuth(req, res);
      if (!auth) return;
      try {
        const body = await readBodyJson(req, 64 * 1024);
        const nextDisplay = String(body.displayName || auth.user.displayName).trim().slice(0, 50);
        if (!nextDisplay) {
          return sendJson(res, 400, { ok: false, error: 'Tên hiển thị không được để trống.' });
        }

        let nextPassHash = auth.rawUser.passwordHash;
        const currentPassword = String(body.currentPassword || '');
        const newPassword = String(body.newPassword || '');
        if (newPassword) {
          if (!verifyPassword(currentPassword, auth.rawUser.passwordHash)) {
            return sendJson(res, 401, { ok: false, error: 'Mật khẩu hiện tại chưa chính xác.' });
          }
          if (newPassword.length < 6 || newPassword.length > 128) {
            return sendJson(res, 400, { ok: false, error: 'Mật khẩu mới cần tối thiểu 6 ký tự.' });
          }
          nextPassHash = hashPassword(newPassword);
        }

        const updatedUser = store.updateUserProfile(auth.user.id, nextDisplay, nextPassHash);
        return sendJson(res, 200, {
          ok: true,
          user: serializePublicUser(updatedUser)
        });
      } catch (err) {
        return sendJson(res, err.status || 400, { ok: false, error: 'Không thể cập nhật hồ sơ.' });
      }
    }

    // Heartbeat ping for real-time Online presence
    if (pathname === '/api/auth/ping' && req.method === 'POST') {
      const auth = requireAuth(req, res, { forceSeenTouch: true });
      if (!auth) return;
      return sendJson(res, 200, { ok: true, serverTime: Date.now() });
    }

    // Logout
    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const auth = authenticateRequest(req, { skipSeenTouch: true });
      const token = extractAuthToken(req);
      if (token) {
        store.deleteSession(hashToken(token));
      }
      if (auth && !auth.banned) {
        seenThrottleMap.delete(auth.user.id);
        store.updateLastSeen(auth.user.id, 0);
      }
      return sendJson(res, 200, { ok: true }, { 'Set-Cookie': buildClearCookie(req) });
    }

    // Check current session
    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const auth = authenticateRequest(req);
      if (!auth) {
        return sendJson(res, 200, { authenticated: false, user: null });
      }
      if (auth.banned) {
        return sendJson(
          res,
          200,
          {
            authenticated: false,
            banned: true,
            bannedReason: auth.bannedReason,
            user: null
          },
          { 'Set-Cookie': buildClearCookie(req) }
        );
      }
      return sendJson(res, 200, {
        authenticated: true,
        user: auth.user,
        rememberMe: auth.session.rememberMe,
        expiresAt: auth.session.expiresAt,
        storage: store.getStats(auth.user.id)
      });
    }

    // Per-user schedule & preferences persistence API (authenticated)
    if (pathname === '/api/schedule') {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const buildOwnerAiPrefs = () => {
        const decryptedKey = decryptVaultText(vaultKey, auth.rawUser.aiKeyEnc);
        if (!auth.rawUser.aiProvider && !auth.rawUser.aiModel && !decryptedKey) return null;
        return {
          aiProvider: auth.rawUser.aiProvider || 'gemini',
          aiModel: auth.rawUser.aiModel || '',
          aiEndpoint: auth.rawUser.aiEndpoint || '',
          aiApiKey: decryptedKey || ''
        };
      };

      if (req.method === 'GET') {
        const data = store.getSchedule(auth.user.id);
        const aiPrefs = buildOwnerAiPrefs();
        if (!data) {
          return sendJson(res, 200, {
            ok: true,
            exists: false,
            data: null,
            aiPrefs,
            storage: store.getStats(auth.user.id)
          });
        }
        const mergedPrefs = { ...(data.preferences || {}) };
        if (aiPrefs) {
          if (aiPrefs.aiProvider) mergedPrefs.aiProvider = aiPrefs.aiProvider;
          if (aiPrefs.aiModel) mergedPrefs.aiModel = aiPrefs.aiModel;
          if (aiPrefs.aiEndpoint) mergedPrefs.aiEndpoint = aiPrefs.aiEndpoint;
          if (aiPrefs.aiApiKey) mergedPrefs.aiApiKey = aiPrefs.aiApiKey;
        }
        return sendJson(res, 200, {
          ok: true,
          exists: true,
          data: { ...data, preferences: mergedPrefs },
          aiPrefs,
          storage: store.getStats(auth.user.id)
        });
      }

      if (req.method === 'PUT' || req.method === 'POST') {
        try {
          const body = await readBodyJson(req, 4 * 1024 * 1024);
          if (!body || !Array.isArray(body.boards) || !Array.isArray(body.tasks)) {
            return sendJson(res, 400, { ok: false, error: 'Dữ liệu thời gian biểu không hợp lệ.' });
          }
          const incomingPrefs = body.preferences && typeof body.preferences === 'object' ? { ...body.preferences } : {};
          const hasExplicitKey = Object.prototype.hasOwnProperty.call(incomingPrefs, 'aiApiKey');
          const cleanRawKey = hasExplicitKey ? String(incomingPrefs.aiApiKey || '').trim() : '';
          delete incomingPrefs.aiApiKey;

          if (hasExplicitKey || incomingPrefs.aiProvider || incomingPrefs.aiModel || incomingPrefs.aiEndpoint) {
            const nextKeyEnc = hasExplicitKey
              ? (cleanRawKey ? encryptVaultText(vaultKey, cleanRawKey) : '')
              : (auth.rawUser.aiKeyEnc || '');
            const nextKeyMask = hasExplicitKey
              ? (cleanRawKey ? maskApiKey(cleanRawKey) : '')
              : (auth.rawUser.aiKeyMask || '');
            store.updateUserAiConfig(auth.user.id, {
              provider: incomingPrefs.aiProvider ?? auth.rawUser.aiProvider ?? '',
              model: incomingPrefs.aiModel ?? auth.rawUser.aiModel ?? '',
              endpoint: incomingPrefs.aiEndpoint ?? auth.rawUser.aiEndpoint ?? '',
              keyEnc: nextKeyEnc,
              keyMask: nextKeyMask,
              updatedAt: hasExplicitKey ? Date.now() : (auth.rawUser.aiUpdatedAt || Date.now())
            });
          }

          const saved = store.saveSchedule(auth.user.id, {
            boards: body.boards,
            tasks: body.tasks,
            deviceMode: body.deviceMode || 'desktop',
            theme: body.theme || 'light',
            layout: body.layout || 'columns',
            streak: body.streak || null,
            preferences: incomingPrefs,
            updatedAt: Number(body.updatedAt) || Date.now()
          });
          return sendJson(res, 200, {
            ok: true,
            updatedAt: saved.updatedAt,
            storage: store.getStats(auth.user.id)
          });
        } catch (err) {
          return sendJson(res, err.status || 400, { ok: false, error: 'Không thể lưu dữ liệu lên server.' });
        }
      }

      return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' });
    }

    // Admin User Management APIs
    if (pathname === '/api/admin/users' && req.method === 'GET') {
      const auth = requireAdmin(req, res);
      if (!auth) return;

      const urlObj = new URL(req.url || pathname, 'http://127.0.0.1');
      const reqDays = Number(urlObj.searchParams.get('days')) || 14;
      const days = [7, 14, 30].includes(reqDays) ? reqDays : 14;

      const now = Date.now();
      const rawUsers = store.listUsersWithStats();

      const mappedUsers = rawUsers.map(u => {
        const isOnline = !u.isBanned && u.lastSeenAt > 0 && (now - u.lastSeenAt) <= ONLINE_WINDOW_MS;
        return {
          id: u.id,
          username: u.username,
          displayName: u.displayName || u.username,
          role: u.role === 'admin' ? 'admin' : 'user',
          isRootAdmin: isRootAdminUser(u),
          isBanned: Boolean(u.isBanned),
          bannedReason: u.bannedReason || '',
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt,
          lastSeenAt: u.lastSeenAt || 0,
          isOnline,
          activeSessionCount: u.activeSessionCount || 0,
          boardCount: u.boardCount || 0,
          taskCount: u.taskCount || 0,
          scheduleUpdatedAt: u.scheduleUpdatedAt || null,
          aiKey: {
            hasKey: Boolean(u.aiKeyEnc),
            provider: u.aiProvider || '',
            model: u.aiModel || '',
            endpoint: u.aiEndpoint || '',
            masked: u.aiKeyMask || '',
            updatedAt: u.aiUpdatedAt || 0
          }
        };
      });

      // Build daily participant growth & activity chart series
      const dayBuckets = [];
      const baseDate = new Date();
      baseDate.setHours(0, 0, 0, 0);
      for (let offset = days - 1; offset >= 0; offset--) {
        const d = new Date(baseDate.getTime() - offset * 24 * 60 * 60 * 1000);
        const key = formatLocalDayStr(d);
        const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        dayBuckets.push({ date: key, label, signups: 0, active: 0, cumulative: 0 });
      }
      const firstDayKey = dayBuckets[0].date;
      const bucketByKey = new Map(dayBuckets.map(b => [b.date, b]));
      let priorSignups = 0;

      for (const u of mappedUsers) {
        const createdDay = formatLocalDayStr(u.createdAt);
        if (createdDay && createdDay < firstDayKey) {
          priorSignups += 1;
        } else if (createdDay && bucketByKey.has(createdDay)) {
          bucketByKey.get(createdDay).signups += 1;
        }

        const activeDay = formatLocalDayStr(u.lastSeenAt || u.lastLoginAt);
        if (activeDay && bucketByKey.has(activeDay)) {
          bucketByKey.get(activeDay).active += 1;
        }
      }

      let runningTotal = priorSignups;
      for (const b of dayBuckets) {
        runningTotal += b.signups;
        b.cumulative = runningTotal;
      }

      return sendJson(res, 200, {
        ok: true,
        serverTime: now,
        onlineWindowSec: Math.round(ONLINE_WINDOW_MS / 1000),
        summary: {
          totalUsers: mappedUsers.length,
          onlineCount: mappedUsers.filter(u => u.isOnline).length,
          adminCount: mappedUsers.filter(u => u.role === 'admin').length,
          bannedCount: mappedUsers.filter(u => u.isBanned).length,
          apiKeyCount: mappedUsers.filter(u => u.aiKey.hasKey).length
        },
        chart: {
          days,
          series: dayBuckets
        },
        users: mappedUsers
      });
    }

    const adminRoleMatch = pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/role$/);
    if (adminRoleMatch && (req.method === 'PATCH' || req.method === 'PUT' || req.method === 'POST')) {
      const auth = requireAdmin(req, res);
      if (!auth) return;

      const targetId = adminRoleMatch[1];
      const target = store.findUserById(targetId);
      if (!target) {
        return sendJson(res, 404, { ok: false, error: 'Không tìm thấy người dùng.' });
      }
      try {
        const body = await readBodyJson(req, 32 * 1024);
        const nextRole = body.role === 'admin' ? 'admin' : (body.role === 'user' ? 'user' : '');
        if (!nextRole) {
          return sendJson(res, 400, { ok: false, error: 'Vai trò không hợp lệ (chỉ nhận admin hoặc user).' });
        }
        if (target.id === auth.user.id && nextRole !== 'admin') {
          return sendJson(res, 400, { ok: false, error: 'Không thể tự hạ quyền Admin của chính bạn.' });
        }
        if (isRootAdminUser(target) && nextRole !== 'admin') {
          return sendJson(res, 400, { ok: false, error: `Không thể hạ quyền tài khoản Admin gốc ${target.username}.` });
        }

        const updated = store.updateUserRole(target.id, nextRole);
        return sendJson(res, 200, { ok: true, user: serializePublicUser(updated) });
      } catch (err) {
        return sendJson(res, err.status || 400, { ok: false, error: 'Không thể cập nhật quyền.' });
      }
    }

    const adminBanMatch = pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/ban$/);
    if (adminBanMatch && (req.method === 'PATCH' || req.method === 'PUT' || req.method === 'POST')) {
      const auth = requireAdmin(req, res);
      if (!auth) return;

      const targetId = adminBanMatch[1];
      const target = store.findUserById(targetId);
      if (!target) {
        return sendJson(res, 404, { ok: false, error: 'Không tìm thấy người dùng.' });
      }
      try {
        const body = await readBodyJson(req, 32 * 1024);
        const shouldBan = Boolean(body.banned);
        if (shouldBan && target.id === auth.user.id) {
          return sendJson(res, 400, { ok: false, error: 'Không thể tự khóa tài khoản của chính bạn.' });
        }
        if (shouldBan && isRootAdminUser(target)) {
          return sendJson(res, 400, { ok: false, error: `Không thể khóa tài khoản Admin gốc ${target.username}.` });
        }

        const reason = shouldBan
          ? (String(body.reason || '').trim() || 'Vi phạm quy định hoặc bị Admin tạm khóa.')
          : '';
        const updated = store.setUserBanned(target.id, shouldBan, reason);
        return sendJson(res, 200, { ok: true, user: serializePublicUser(updated) });
      } catch (err) {
        return sendJson(res, err.status || 400, { ok: false, error: 'Không thể cập nhật trạng thái khóa.' });
      }
    }

    const adminAiKeyMatch = pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/ai-key$/);
    if (adminAiKeyMatch) {
      const auth = requireAdmin(req, res);
      if (!auth) return;

      const targetId = adminAiKeyMatch[1];
      const target = store.findUserById(targetId);
      if (!target) {
        return sendJson(res, 404, { ok: false, error: 'Không tìm thấy người dùng.' });
      }

      if (req.method === 'GET') {
        const decrypted = decryptVaultText(vaultKey, target.aiKeyEnc);
        return sendJson(res, 200, {
          ok: true,
          userId: target.id,
          username: target.username,
          displayName: target.displayName || target.username,
          provider: target.aiProvider || '',
          model: target.aiModel || '',
          endpoint: target.aiEndpoint || '',
          masked: target.aiKeyMask || '',
          apiKey: decrypted,
          updatedAt: target.aiUpdatedAt || 0
        });
      }

      if (req.method === 'PUT' || req.method === 'POST') {
        try {
          const body = await readBodyJson(req, 64 * 1024);
          const provider = String(body.provider || target.aiProvider || 'gemini').trim().slice(0, 32);
          const model = String(body.model || target.aiModel || '').trim().slice(0, 100);
          const endpoint = String(body.endpoint || target.aiEndpoint || '').trim().slice(0, 300);
          const rawKey = String(body.apiKey || '').trim();
          if (!rawKey) {
            return sendJson(res, 400, { ok: false, error: 'Vui lòng nhập API Key hợp lệ (hoặc dùng nút Xóa Key).' });
          }

          const updated = store.updateUserAiConfig(target.id, {
            provider,
            model,
            endpoint,
            keyEnc: encryptVaultText(vaultKey, rawKey),
            keyMask: maskApiKey(rawKey),
            updatedAt: Date.now()
          });
          return sendJson(res, 200, {
            ok: true,
            aiKey: {
              hasKey: Boolean(updated.aiKeyEnc),
              provider: updated.aiProvider,
              model: updated.aiModel,
              endpoint: updated.aiEndpoint,
              masked: updated.aiKeyMask,
              updatedAt: updated.aiUpdatedAt
            }
          });
        } catch (err) {
          return sendJson(res, err.status || 400, { ok: false, error: 'Không thể lưu API Key.' });
        }
      }

      if (req.method === 'DELETE') {
        store.updateUserAiConfig(target.id, {
          provider: target.aiProvider || '',
          model: target.aiModel || '',
          endpoint: target.aiEndpoint || '',
          keyEnc: '',
          keyMask: '',
          updatedAt: Date.now()
        });
        return sendJson(res, 200, { ok: true });
      }

      return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' });
    }

    // Loopback-only legacy local disk endpoint for desktop .bat workflow
    if (pathname === '/api/data') {
      if (!isLoopbackIp(req)) {
        return sendJson(res, 403, { ok: false, error: 'Endpoint chỉ dành cho localhost cục bộ.' });
      }
      const origin = req.headers.origin;
      if (origin && !origin.startsWith(`http://${HOST}:`) && !origin.startsWith('http://127.0.0.1:') && !origin.startsWith('http://localhost:')) {
        return sendJson(res, 403, { ok: false, error: 'Forbidden Origin' });
      }

      if (req.method === 'GET') {
        try {
          if (!fs.existsSync(LOCAL_COMPAT_FILE)) return sendJson(res, 200, { exists: false });
          const parsed = JSON.parse(fs.readFileSync(LOCAL_COMPAT_FILE, 'utf8'));
          return sendJson(res, 200, { exists: true, data: parsed });
        } catch (_) {
          return sendJson(res, 200, { exists: false });
        }
      }

      if (req.method === 'POST') {
        try {
          const parsed = await readBodyJson(req, 4 * 1024 * 1024);
          if (!parsed || !Array.isArray(parsed.boards) || !Array.isArray(parsed.tasks)) {
            return sendJson(res, 400, { ok: false, error: 'Invalid schedule payload' });
          }
          const tmp = `${LOCAL_COMPAT_FILE}.${process.pid}.${Date.now()}.tmp`;
          fs.writeFileSync(tmp, JSON.stringify(parsed, null, 2), 'utf8');
          fs.renameSync(tmp, LOCAL_COMPAT_FILE);
          return sendJson(res, 200, { ok: true });
        } catch (err) {
          return sendJson(res, err.status || 400, { ok: false, error: 'Invalid JSON' });
        }
      }

      return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' });
    }

    return sendJson(res, 404, { ok: false, error: 'API Not Found' });
  }

  const server = http.createServer((req, res) => {
    const rawUrl = (req.url || '/').split('?')[0];

    if (rawUrl === '/health' || rawUrl.startsWith('/api/')) {
      handleApi(req, res, rawUrl);
      return;
    }

    let relPath;
    try {
      relPath = decodeURIComponent(rawUrl === '/' ? 'index.html' : rawUrl.replace(/^\/+/, ''));
    } catch (_) {
      res.writeHead(400);
      return res.end('Bad Request');
    }

    if (!STATIC_ALLOWLIST.has(relPath)) {
      res.writeHead(404);
      return res.end('Not Found');
    }

    const filePath = path.resolve(ROOT, relPath);
    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        res.writeHead(404);
        return res.end('Not Found');
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      });
      fs.createReadStream(filePath).pipe(res);
    });
  });

  server._storage = store;
  return server;
}

function startServer(port = PORT, host = HOST) {
  const server = createTanasServer();
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use.`);
      process.exit(0);
    }
    console.error('Server error:', err);
    process.exit(1);
  });
  server.listen(port, host, () => {
    console.log(`Thoi Gian Bieu Tanas running at http://${host}:${port} (storage: ${server._storage.engine})`);
  });
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { createTanasServer, startServer };
