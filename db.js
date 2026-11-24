/**
 * Thời Gian Biểu Tanas — Server Storage Engine
 * Uses Node.js built-in SQLite (`node:sqlite`, available in Node >= 22.5) with WAL mode,
 * foreign keys, and automatic migration from legacy JSON files.
 * Gracefully falls back to atomic JSON files if `node:sqlite` is unavailable.
 */

const fs = require('fs');
const path = require('path');

function createStorage(dataDir) {
  const DATA_DIR = path.resolve(dataDir);
  const SCHEDULES_DIR = path.join(DATA_DIR, 'schedules');
  const USERS_FILE = path.join(DATA_DIR, 'users.json');
  const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
  const DB_FILE = path.join(DATA_DIR, 'tanas.db');

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(SCHEDULES_DIR, { recursive: true });

  function readJsonSafe(filePath, fallback) {
    try {
      if (!fs.existsSync(filePath)) return fallback;
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) {
      return fallback;
    }
  }

  function writeJsonAtomic(filePath, data) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
  }

  function sanitizeSafeId(id) {
    return String(id || '').replace(/[^a-zA-Z0-9_-]/g, '');
  }

  // Try built-in Node SQLite first
  let DatabaseSync = null;
  try {
    ({ DatabaseSync } = require('node:sqlite'));
  } catch (_) {
    DatabaseSync = null;
  }

  if (DatabaseSync) {
    const db = new DatabaseSync(DB_FILE);
    db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        username_lower TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        is_banned INTEGER NOT NULL DEFAULT 0,
        banned_reason TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        last_login_at TEXT NOT NULL,
        last_seen_at INTEGER NOT NULL DEFAULT 0,
        ai_provider TEXT NOT NULL DEFAULT '',
        ai_model TEXT NOT NULL DEFAULT '',
        ai_endpoint TEXT NOT NULL DEFAULT '',
        ai_key_enc TEXT NOT NULL DEFAULT '',
        ai_key_mask TEXT NOT NULL DEFAULT '',
        ai_updated_at INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        remember_me INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

      CREATE TABLE IF NOT EXISTS user_schedules (
        user_id TEXT PRIMARY KEY,
        boards_json TEXT NOT NULL,
        tasks_json TEXT NOT NULL,
        device_mode TEXT NOT NULL DEFAULT 'desktop',
        theme TEXT NOT NULL DEFAULT 'light',
        layout TEXT NOT NULL DEFAULT 'columns',
        streak_json TEXT,
        preferences_json TEXT,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Migrate existing SQLite users table columns cleanly if upgrading from v3.0/v3.1
    const existingCols = new Set(db.prepare('PRAGMA table_info(users)').all().map(c => c.name));
    const userMigrations = [
      ['role', "TEXT NOT NULL DEFAULT 'user'"],
      ['is_banned', 'INTEGER NOT NULL DEFAULT 0'],
      ['banned_reason', "TEXT NOT NULL DEFAULT ''"],
      ['last_seen_at', 'INTEGER NOT NULL DEFAULT 0'],
      ['ai_provider', "TEXT NOT NULL DEFAULT ''"],
      ['ai_model', "TEXT NOT NULL DEFAULT ''"],
      ['ai_endpoint', "TEXT NOT NULL DEFAULT ''"],
      ['ai_key_enc', "TEXT NOT NULL DEFAULT ''"],
      ['ai_key_mask', "TEXT NOT NULL DEFAULT ''"],
      ['ai_updated_at', 'INTEGER NOT NULL DEFAULT 0']
    ];
    for (const [col, def] of userMigrations) {
      if (!existingCols.has(col)) {
        db.exec(`ALTER TABLE users ADD COLUMN ${col} ${def}`);
      }
    }

    // Migrate any pre-existing legacy JSON records into SQLite once
    const existingUsersCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
    if (existingUsersCount === 0 && fs.existsSync(USERS_FILE)) {
      const legacyUsers = readJsonSafe(USERS_FILE, []);
      if (Array.isArray(legacyUsers) && legacyUsers.length > 0) {
        const insUser = db.prepare(`
          INSERT OR IGNORE INTO users (
            id, username, username_lower, display_name, password_hash,
            role, is_banned, banned_reason, created_at, last_login_at, last_seen_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insSess = db.prepare(`
          INSERT OR IGNORE INTO sessions (token_hash, user_id, remember_me, created_at, expires_at)
          VALUES (?, ?, ?, ?, ?)
        `);
        const insSched = db.prepare(`
          INSERT OR REPLACE INTO user_schedules (user_id, boards_json, tasks_json, device_mode, theme, layout, streak_json, preferences_json, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const u of legacyUsers) {
          if (!u || !u.id || !u.username || !u.passwordHash) continue;
          insUser.run(
            u.id,
            u.username,
            u.usernameLower || u.username.toLowerCase(),
            u.displayName || u.username,
            u.passwordHash,
            u.role === 'admin' ? 'admin' : 'user',
            u.isBanned ? 1 : 0,
            u.bannedReason || '',
            u.createdAt || new Date().toISOString(),
            u.lastLoginAt || new Date().toISOString(),
            Number(u.lastSeenAt) || 0
          );

          const schedFile = path.join(SCHEDULES_DIR, `${sanitizeSafeId(u.id)}.json`);
          const sData = readJsonSafe(schedFile, null);
          if (sData && Array.isArray(sData.boards) && Array.isArray(sData.tasks)) {
            insSched.run(
              u.id,
              JSON.stringify(sData.boards),
              JSON.stringify(sData.tasks),
              sData.deviceMode || 'desktop',
              sData.theme || 'light',
              sData.layout || 'columns',
              sData.streak ? JSON.stringify(sData.streak) : null,
              sData.preferences ? JSON.stringify(sData.preferences) : null,
              Number(sData.updatedAt) || Date.now()
            );
          }
        }

        const now = Date.now();
        const legacySessions = readJsonSafe(SESSIONS_FILE, []);
        if (Array.isArray(legacySessions)) {
          for (const s of legacySessions) {
            if (s && s.tokenHash && s.userId && Number(s.expiresAt) > now) {
              insSess.run(s.tokenHash, s.userId, s.rememberMe ? 1 : 0, Number(s.createdAt) || now, Number(s.expiresAt));
            }
          }
        }
      }
    }

    const stmtFindUserByLower = db.prepare('SELECT * FROM users WHERE username_lower = ?');
    const stmtFindUserById = db.prepare('SELECT * FROM users WHERE id = ?');
    const stmtInsertUser = db.prepare(`
      INSERT INTO users (id, username, username_lower, display_name, password_hash, role, created_at, last_login_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const stmtUpdateLogin = db.prepare('UPDATE users SET last_login_at = ?, last_seen_at = ? WHERE id = ?');
    const stmtUpdateLastSeen = db.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?');
    const stmtUpdateProfile = db.prepare('UPDATE users SET display_name = ?, password_hash = ? WHERE id = ?');
    const stmtUpdateRole = db.prepare('UPDATE users SET role = ? WHERE id = ?');
    const stmtSetBanned = db.prepare('UPDATE users SET is_banned = ?, banned_reason = ?, last_seen_at = CASE WHEN ? = 1 THEN 0 ELSE last_seen_at END WHERE id = ?');
    const stmtUpdateAiConfig = db.prepare(`
      UPDATE users
      SET ai_provider = ?, ai_model = ?, ai_endpoint = ?, ai_key_enc = ?, ai_key_mask = ?, ai_updated_at = ?
      WHERE id = ?
    `);
    const stmtListUsersWithStats = db.prepare(`
      SELECT
        u.*,
        (SELECT COUNT(*) FROM sessions s WHERE s.user_id = u.id AND s.expires_at > ?) AS active_sessions,
        us.boards_json,
        us.tasks_json,
        us.updated_at AS schedule_updated_at
      FROM users u
      LEFT JOIN user_schedules us ON us.user_id = u.id
      ORDER BY u.last_seen_at DESC, u.created_at DESC
    `);

    const stmtPruneSessions = db.prepare('DELETE FROM sessions WHERE expires_at <= ?');
    const stmtInsertSession = db.prepare(`
      INSERT INTO sessions (token_hash, user_id, remember_me, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const stmtFindSession = db.prepare('SELECT * FROM sessions WHERE token_hash = ? AND expires_at > ?');
    const stmtDeleteSession = db.prepare('DELETE FROM sessions WHERE token_hash = ?');
    const stmtDeleteUserSessions = db.prepare('DELETE FROM sessions WHERE user_id = ?');

    const stmtGetSchedule = db.prepare('SELECT * FROM user_schedules WHERE user_id = ?');
    const stmtUpsertSchedule = db.prepare(`
      INSERT INTO user_schedules (user_id, boards_json, tasks_json, device_mode, theme, layout, streak_json, preferences_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        boards_json = excluded.boards_json,
        tasks_json = excluded.tasks_json,
        device_mode = excluded.device_mode,
        theme = excluded.theme,
        layout = excluded.layout,
        streak_json = excluded.streak_json,
        preferences_json = excluded.preferences_json,
        updated_at = excluded.updated_at
    `);

    function mapUser(row) {
      if (!row) return null;
      return {
        id: row.id,
        username: row.username,
        usernameLower: row.username_lower,
        displayName: row.display_name,
        passwordHash: row.password_hash,
        role: row.role === 'admin' ? 'admin' : 'user',
        isBanned: Boolean(row.is_banned),
        bannedReason: row.banned_reason || '',
        createdAt: row.created_at,
        lastLoginAt: row.last_login_at,
        lastSeenAt: Number(row.last_seen_at) || 0,
        aiProvider: row.ai_provider || '',
        aiModel: row.ai_model || '',
        aiEndpoint: row.ai_endpoint || '',
        aiKeyEnc: row.ai_key_enc || '',
        aiKeyMask: row.ai_key_mask || '',
        aiUpdatedAt: Number(row.ai_updated_at) || 0
      };
    }

    return {
      engine: 'sqlite',
      dbPath: DB_FILE,

      findUserByUsername(username) {
        return mapUser(stmtFindUserByLower.get(String(username || '').trim().toLowerCase()));
      },

      findUserById(userId) {
        return mapUser(stmtFindUserById.get(userId));
      },

      createUser(user) {
        stmtInsertUser.run(
          user.id,
          user.username,
          user.username.toLowerCase(),
          user.displayName || user.username,
          user.passwordHash,
          user.role === 'admin' ? 'admin' : 'user',
          user.createdAt,
          user.lastLoginAt,
          Number(user.lastSeenAt) || 0
        );
        return this.findUserById(user.id);
      },

      touchUserLogin(userId, isoTime, seenMs = Date.now()) {
        stmtUpdateLogin.run(isoTime, seenMs, userId);
      },

      updateLastSeen(userId, seenMs = Date.now()) {
        stmtUpdateLastSeen.run(Number(seenMs) || 0, userId);
      },

      updateUserProfile(userId, displayName, passwordHash) {
        stmtUpdateProfile.run(displayName, passwordHash, userId);
        return this.findUserById(userId);
      },

      updateUserRole(userId, role) {
        const cleanRole = role === 'admin' ? 'admin' : 'user';
        stmtUpdateRole.run(cleanRole, userId);
        return this.findUserById(userId);
      },

      setUserBanned(userId, banned, reason = '') {
        const flag = banned ? 1 : 0;
        const cleanReason = banned ? String(reason || '').trim().slice(0, 200) : '';
        stmtSetBanned.run(flag, cleanReason, flag, userId);
        if (banned) {
          stmtDeleteUserSessions.run(userId);
        }
        return this.findUserById(userId);
      },

      updateUserAiConfig(userId, cfg) {
        stmtUpdateAiConfig.run(
          String(cfg.provider || ''),
          String(cfg.model || ''),
          String(cfg.endpoint || ''),
          String(cfg.keyEnc || ''),
          String(cfg.keyMask || ''),
          Number(cfg.updatedAt) || 0,
          userId
        );
        return this.findUserById(userId);
      },

      listUsersWithStats() {
        const now = Date.now();
        return stmtListUsersWithStats.all(now).map(row => {
          const user = mapUser(row);
          let boardCount = 0;
          let taskCount = 0;
          try {
            if (row.boards_json) boardCount = JSON.parse(row.boards_json).length;
            if (row.tasks_json) taskCount = JSON.parse(row.tasks_json).length;
          } catch (_) {}
          return {
            ...user,
            activeSessionCount: Number(row.active_sessions) || 0,
            boardCount,
            taskCount,
            scheduleUpdatedAt: Number(row.schedule_updated_at) || null
          };
        });
      },

      createSession(session) {
        stmtPruneSessions.run(Date.now());
        stmtInsertSession.run(
          session.tokenHash,
          session.userId,
          session.rememberMe ? 1 : 0,
          session.createdAt,
          session.expiresAt
        );
      },

      findActiveSession(tokenHash) {
        const row = stmtFindSession.get(tokenHash, Date.now());
        if (!row) return null;
        return {
          tokenHash: row.token_hash,
          userId: row.user_id,
          rememberMe: Boolean(row.remember_me),
          createdAt: row.created_at,
          expiresAt: row.expires_at
        };
      },

      deleteSession(tokenHash) {
        stmtDeleteSession.run(tokenHash);
      },

      deleteUserSessions(userId) {
        stmtDeleteUserSessions.run(userId);
      },

      getSchedule(userId) {
        const row = stmtGetSchedule.get(userId);
        if (!row) return null;
        try {
          return {
            boards: JSON.parse(row.boards_json),
            tasks: JSON.parse(row.tasks_json),
            deviceMode: row.device_mode || 'desktop',
            theme: row.theme || 'light',
            layout: row.layout || 'columns',
            streak: row.streak_json ? JSON.parse(row.streak_json) : null,
            preferences: row.preferences_json ? JSON.parse(row.preferences_json) : {},
            updatedAt: row.updated_at
          };
        } catch (_) {
          return null;
        }
      },

      saveSchedule(userId, payload) {
        const updatedAt = Number(payload.updatedAt) || Date.now();
        stmtUpsertSchedule.run(
          userId,
          JSON.stringify(payload.boards),
          JSON.stringify(payload.tasks),
          payload.deviceMode || 'desktop',
          payload.theme || 'light',
          payload.layout || 'columns',
          payload.streak ? JSON.stringify(payload.streak) : null,
          payload.preferences ? JSON.stringify(payload.preferences) : null,
          updatedAt
        );
        return { updatedAt };
      },

      getStats(userId) {
        const totalUsers = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
        const row = stmtGetSchedule.get(userId);
        const taskCount = row ? (JSON.parse(row.tasks_json || '[]')).length : 0;
        const boardCount = row ? (JSON.parse(row.boards_json || '[]')).length : 0;
        return {
          engine: 'sqlite (data/tanas.db)',
          totalUsers,
          taskCount,
          boardCount,
          updatedAt: row ? row.updated_at : null
        };
      },

      close() {
        db.close();
      }
    };
  }

  // Fallback atomic JSON store (for Node < 22.5 environments)
  function normalizeJsonUser(u) {
    if (!u) return null;
    return {
      id: u.id,
      username: u.username,
      usernameLower: u.usernameLower || String(u.username || '').toLowerCase(),
      displayName: u.displayName || u.username,
      passwordHash: u.passwordHash,
      role: u.role === 'admin' ? 'admin' : 'user',
      isBanned: Boolean(u.isBanned),
      bannedReason: u.bannedReason || '',
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      lastSeenAt: Number(u.lastSeenAt) || 0,
      aiProvider: u.aiProvider || '',
      aiModel: u.aiModel || '',
      aiEndpoint: u.aiEndpoint || '',
      aiKeyEnc: u.aiKeyEnc || '',
      aiKeyMask: u.aiKeyMask || '',
      aiUpdatedAt: Number(u.aiUpdatedAt) || 0
    };
  }

  return {
    engine: 'json',
    dbPath: DATA_DIR,

    findUserByUsername(username) {
      const lower = String(username || '').trim().toLowerCase();
      const users = readJsonSafe(USERS_FILE, []);
      return normalizeJsonUser(users.find(u => u && (u.usernameLower || u.username.toLowerCase()) === lower));
    },

    findUserById(userId) {
      const users = readJsonSafe(USERS_FILE, []);
      return normalizeJsonUser(users.find(u => u && u.id === userId));
    },

    createUser(user) {
      const users = readJsonSafe(USERS_FILE, []);
      const record = normalizeJsonUser({
        ...user,
        usernameLower: user.username.toLowerCase(),
        lastSeenAt: Number(user.lastSeenAt) || 0
      });
      users.push(record);
      writeJsonAtomic(USERS_FILE, users);
      return record;
    },

    touchUserLogin(userId, isoTime, seenMs = Date.now()) {
      const users = readJsonSafe(USERS_FILE, []);
      const target = users.find(u => u && u.id === userId);
      if (target) {
        target.lastLoginAt = isoTime;
        target.lastSeenAt = seenMs;
        writeJsonAtomic(USERS_FILE, users);
      }
    },

    updateLastSeen(userId, seenMs = Date.now()) {
      const users = readJsonSafe(USERS_FILE, []);
      const target = users.find(u => u && u.id === userId);
      if (target) {
        target.lastSeenAt = Number(seenMs) || 0;
        writeJsonAtomic(USERS_FILE, users);
      }
    },

    updateUserProfile(userId, displayName, passwordHash) {
      const users = readJsonSafe(USERS_FILE, []);
      const target = users.find(u => u && u.id === userId);
      if (!target) return null;
      target.displayName = displayName;
      target.passwordHash = passwordHash;
      writeJsonAtomic(USERS_FILE, users);
      return normalizeJsonUser(target);
    },

    updateUserRole(userId, role) {
      const users = readJsonSafe(USERS_FILE, []);
      const target = users.find(u => u && u.id === userId);
      if (!target) return null;
      target.role = role === 'admin' ? 'admin' : 'user';
      writeJsonAtomic(USERS_FILE, users);
      return normalizeJsonUser(target);
    },

    setUserBanned(userId, banned, reason = '') {
      const users = readJsonSafe(USERS_FILE, []);
      const target = users.find(u => u && u.id === userId);
      if (!target) return null;
      target.isBanned = Boolean(banned);
      target.bannedReason = banned ? String(reason || '').trim().slice(0, 200) : '';
      if (banned) {
        target.lastSeenAt = 0;
        this.deleteUserSessions(userId);
      }
      writeJsonAtomic(USERS_FILE, users);
      return normalizeJsonUser(target);
    },

    updateUserAiConfig(userId, cfg) {
      const users = readJsonSafe(USERS_FILE, []);
      const target = users.find(u => u && u.id === userId);
      if (!target) return null;
      target.aiProvider = String(cfg.provider || '');
      target.aiModel = String(cfg.model || '');
      target.aiEndpoint = String(cfg.endpoint || '');
      target.aiKeyEnc = String(cfg.keyEnc || '');
      target.aiKeyMask = String(cfg.keyMask || '');
      target.aiUpdatedAt = Number(cfg.updatedAt) || 0;
      writeJsonAtomic(USERS_FILE, users);
      return normalizeJsonUser(target);
    },

    listUsersWithStats() {
      const now = Date.now();
      const users = readJsonSafe(USERS_FILE, []).map(normalizeJsonUser).filter(Boolean);
      const sessions = readJsonSafe(SESSIONS_FILE, []).filter(s => s && Number(s.expiresAt) > now);
      return users
        .map(u => {
          const sched = this.getSchedule(u.id);
          return {
            ...u,
            activeSessionCount: sessions.filter(s => s.userId === u.id).length,
            boardCount: sched ? sched.boards.length : 0,
            taskCount: sched ? sched.tasks.length : 0,
            scheduleUpdatedAt: sched ? sched.updatedAt : null
          };
        })
        .sort((a, b) => (b.lastSeenAt - a.lastSeenAt) || String(b.createdAt).localeCompare(String(a.createdAt)));
    },

    createSession(session) {
      const now = Date.now();
      const sessions = readJsonSafe(SESSIONS_FILE, []).filter(s => s && Number(s.expiresAt) > now);
      sessions.push(session);
      writeJsonAtomic(SESSIONS_FILE, sessions.slice(-500));
    },

    findActiveSession(tokenHash) {
      const now = Date.now();
      const sessions = readJsonSafe(SESSIONS_FILE, []);
      const active = sessions.filter(s => s && Number(s.expiresAt) > now);
      if (active.length !== sessions.length) writeJsonAtomic(SESSIONS_FILE, active);
      return active.find(s => s.tokenHash === tokenHash) || null;
    },

    deleteSession(tokenHash) {
      const sessions = readJsonSafe(SESSIONS_FILE, []).filter(s => s && s.tokenHash !== tokenHash);
      writeJsonAtomic(SESSIONS_FILE, sessions);
    },

    deleteUserSessions(userId) {
      const sessions = readJsonSafe(SESSIONS_FILE, []).filter(s => s && s.userId !== userId);
      writeJsonAtomic(SESSIONS_FILE, sessions);
    },

    getSchedule(userId) {
      const file = path.join(SCHEDULES_DIR, `${sanitizeSafeId(userId)}.json`);
      const data = readJsonSafe(file, null);
      if (!data || !Array.isArray(data.boards) || !Array.isArray(data.tasks)) return null;
      return data;
    },

    saveSchedule(userId, payload) {
      const file = path.join(SCHEDULES_DIR, `${sanitizeSafeId(userId)}.json`);
      const updatedAt = Number(payload.updatedAt) || Date.now();
      writeJsonAtomic(file, { ...payload, updatedAt });
      return { updatedAt };
    },

    getStats(userId) {
      const users = readJsonSafe(USERS_FILE, []);
      const data = this.getSchedule(userId);
      return {
        engine: 'json (data/schedules)',
        totalUsers: users.length,
        taskCount: data ? data.tasks.length : 0,
        boardCount: data ? data.boards.length : 0,
        updatedAt: data ? data.updatedAt : null
      };
    },

    close() {}
  };
}

module.exports = { createStorage };
