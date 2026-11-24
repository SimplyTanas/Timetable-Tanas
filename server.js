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

  function authenticateRequest(req) {
    const token = extractAuthToken(req);
    if (!token) return null;

    const session = store.findActiveSession(hashToken(token));
    if (!session) return null;

    const user = store.findUserById(session.userId);
    if (!user) return null;

    return {
      token,
      session,
      rawUser: user,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        createdAt: user.createdAt
      }
    };
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
        const newUser = store.createUser({
          id: 'u_' + crypto.randomBytes(8).toString('hex'),
          username: rawUser,
          displayName: displayName || rawUser,
          passwordHash: hashPassword(password),
          createdAt: nowIso,
          lastLoginAt: nowIso
        });

        const { token, expiresAt } = createUserSession(newUser.id, rememberMe);
        return sendJson(
          res,
          201,
          {
            ok: true,
            user: {
              id: newUser.id,
              username: newUser.username,
              displayName: newUser.displayName,
              createdAt: newUser.createdAt
            },
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

        store.touchUserLogin(user.id, new Date().toISOString());

        const { token, expiresAt } = createUserSession(user.id, rememberMe);
        return sendJson(
          res,
          200,
          {
            ok: true,
            user: {
              id: user.id,
              username: user.username,
              displayName: user.displayName || user.username,
              createdAt: user.createdAt
            },
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
      const auth = authenticateRequest(req);
      if (!auth) {
        return sendJson(res, 401, { ok: false, error: 'Bạn cần đăng nhập để cập nhật tài khoản.' });
      }
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
          user: {
            id: updatedUser.id,
            username: updatedUser.username,
            displayName: updatedUser.displayName,
            createdAt: updatedUser.createdAt
          }
        });
      } catch (err) {
        return sendJson(res, err.status || 400, { ok: false, error: 'Không thể cập nhật hồ sơ.' });
      }
    }

    // Logout
    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const token = extractAuthToken(req);
      if (token) {
        store.deleteSession(hashToken(token));
      }
      return sendJson(res, 200, { ok: true }, { 'Set-Cookie': buildClearCookie(req) });
    }

    // Check current session
    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const auth = authenticateRequest(req);
      if (!auth) {
        return sendJson(res, 200, { authenticated: false, user: null });
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
      const auth = authenticateRequest(req);
      if (!auth) {
        return sendJson(res, 401, { ok: false, error: 'Vui lòng đăng nhập để đồng bộ lịch cá nhân.' });
      }

      if (req.method === 'GET') {
        const data = store.getSchedule(auth.user.id);
        if (!data) {
          return sendJson(res, 200, {
            ok: true,
            exists: false,
            data: null,
            storage: store.getStats(auth.user.id)
          });
        }
        return sendJson(res, 200, {
          ok: true,
          exists: true,
          data,
          storage: store.getStats(auth.user.id)
        });
      }

      if (req.method === 'PUT' || req.method === 'POST') {
        try {
          const body = await readBodyJson(req, 4 * 1024 * 1024);
          if (!body || !Array.isArray(body.boards) || !Array.isArray(body.tasks)) {
            return sendJson(res, 400, { ok: false, error: 'Dữ liệu thời gian biểu không hợp lệ.' });
          }
          const saved = store.saveSchedule(auth.user.id, {
            boards: body.boards,
            tasks: body.tasks,
            deviceMode: body.deviceMode || 'desktop',
            theme: body.theme || 'light',
            layout: body.layout || 'columns',
            streak: body.streak || null,
            preferences: body.preferences && typeof body.preferences === 'object' ? body.preferences : {},
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
