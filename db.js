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
        created_at TEXT NOT NULL,
        last_login_at TEXT NOT NULL
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

    // Migrate any pre-existing legacy JSON records into SQLite once
    const existingUsersCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
    if (existingUsersCount === 0 && fs.existsSync(USERS_FILE)) {
      const legacyUsers = readJsonSafe(USERS_FILE, []);
      if (Array.isArray(legacyUsers) && legacyUsers.length > 0) {
        const insUser = db.prepare(`
          INSERT OR IGNORE INTO users (id, username, username_lower, display_name, password_hash, created_at, last_login_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
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
            u.createdAt || new Date().toISOString(),
            u.lastLoginAt || new Date().toISOString()
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
      INSERT INTO users (id, username, username_lower, display_name, password_hash, created_at, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const stmtUpdateLogin = db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?');
    const stmtUpdateProfile = db.prepare('UPDATE users SET display_name = ?, password_hash = ? WHERE id = ?');

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
        createdAt: row.created_at,
        lastLoginAt: row.last_login_at
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
          user.createdAt,
          user.lastLoginAt
        );
        return this.findUserById(user.id);
      },

      touchUserLogin(userId, isoTime) {
        stmtUpdateLogin.run(isoTime, userId);
      },

      updateUserProfile(userId, displayName, passwordHash) {
        stmtUpdateProfile.run(displayName, passwordHash, userId);
        return this.findUserById(userId);
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
  return {
    engine: 'json',
    dbPath: DATA_DIR,

    findUserByUsername(username) {
      const lower = String(username || '').trim().toLowerCase();
      const users = readJsonSafe(USERS_FILE, []);
      return users.find(u => u && (u.usernameLower || u.username.toLowerCase()) === lower) || null;
    },

    findUserById(userId) {
      const users = readJsonSafe(USERS_FILE, []);
      return users.find(u => u && u.id === userId) || null;
    },

    createUser(user) {
      const users = readJsonSafe(USERS_FILE, []);
      const record = {
        ...user,
        usernameLower: user.username.toLowerCase()
      };
      users.push(record);
      writeJsonAtomic(USERS_FILE, users);
      return record;
    },

    touchUserLogin(userId, isoTime) {
      const users = readJsonSafe(USERS_FILE, []);
      const target = users.find(u => u && u.id === userId);
      if (target) {
        target.lastLoginAt = isoTime;
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
      return target;
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
