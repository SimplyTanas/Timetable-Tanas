/**
 * Thời Gian Biểu Tanas — Frontend Authentication & Cloud Schedule Sync Client
 * Connects cleanly to backend Auth & Schedule REST APIs (/api/auth/*, /api/schedule)
 * with 30-day "Remember Me" HttpOnly cookie sessions + offline/guest fallback.
 */

(function () {
  'use strict';

  const GUEST_FLAG_KEY = 'tanas_guest_mode_session';

  let currentUser = null;
  let currentRememberMe = true;
  let currentExpiresAt = null;
  let currentStorageStats = null;
  let currentLastSyncAt = null;
  let activeAuthMode = 'login'; // 'login' | 'register'
  let syncQueueTimer = null;
  let pingIntervalId = null;
  let adminPollTimerId = null;
  let adminState = {
    days: 14,
    data: null,
    lastSig: '',
    search: '',
    filter: 'all',
    banTarget: null,
    keyTarget: null
  };

  function isBackendAvailable() {
    return window.location.protocol === 'http:' || window.location.protocol === 'https:';
  }

  function skIcon(name, opts = {}) {
    return (window.Sketchy && typeof window.Sketchy.icon === 'function')
      ? window.Sketchy.icon(name, opts)
      : '';
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatRelativeTime(ms) {
    const t = Number(ms);
    if (!t) return 'Chưa rõ';
    const diffSec = Math.max(0, Math.floor((Date.now() - t) / 1000));
    if (diffSec < 60) return `${diffSec} giây trước`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} giờ trước`;
    return `${Math.floor(diffHr / 24)} ngày trước`;
  }

  function isAdminUser() {
    return Boolean(currentUser && currentUser.role === 'admin' && !currentUser.isBanned);
  }

  function startHeartbeat() {
    stopHeartbeat();
    if (!isBackendAvailable() || !currentUser) return;
    pingIntervalId = setInterval(() => {
      if (currentUser && document.visibilityState === 'visible') {
        sendHeartbeatPing();
      }
    }, 45000);
  }

  function stopHeartbeat() {
    if (pingIntervalId) {
      clearInterval(pingIntervalId);
      pingIntervalId = null;
    }
  }

  async function sendHeartbeatPing() {
    if (!isBackendAvailable() || !currentUser) return;
    try {
      const res = await fetch('/api/auth/ping', {
        method: 'POST',
        credentials: 'same-origin'
      });
      if (res.status === 403 || res.status === 401) {
        const body = await res.json().catch(() => null);
        if (body && body.banned) {
          handleForcedBannedLogout(body.error || 'Tài khoản của bạn đã bị khóa bởi Admin.');
        } else {
          handleForcedBannedLogout('Phiên đăng nhập đã hết hạn hoặc bị thu hồi. Vui lòng đăng nhập lại.');
        }
      }
    } catch (_) {}
  }

  function handleForcedBannedLogout(reason) {
    stopHeartbeat();
    clearTimeout(syncQueueTimer);
    syncQueueTimer = null;
    closeAdminModal();
    currentUser = null;
    currentRememberMe = false;
    currentExpiresAt = null;
    currentStorageStats = null;
    currentLastSyncAt = null;
    window.ScheduleAPI?.resetToDefaultView?.('guest');
    updateHeaderAuthUI();
    renderAuthModalView();
    openAuthModal('login');
    setAuthError(reason || 'Tài khoản đã bị khóa bởi quản trị viên.');
    window.ScheduleAPI?.showToast(reason || 'Tài khoản đã bị khóa.', 5000);
  }

  function formatDateTime(val) {
    if (!val) return '';
    try {
      const d = typeof val === 'number' || /^\d+$/.test(String(val))
        ? new Date(Number(val))
        : new Date(val);
      if (Number.isNaN(d.getTime())) return '';
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return '';
    }
  }

  function setNoticeBox(boxId, msg) {
    const box = document.getElementById(boxId);
    if (!box) return;
    if (!msg) {
      box.textContent = '';
      box.classList.add('hidden');
    } else {
      box.textContent = msg;
      box.classList.remove('hidden');
    }
  }

  function setAuthError(msg) {
    setNoticeBox('auth-error-box', msg);
  }

  function setSessionState(data) {
    currentUser = data?.user || null;
    currentRememberMe = Boolean(data?.rememberMe);
    currentExpiresAt = data?.expiresAt || null;
    if (data?.storage) {
      currentStorageStats = data.storage;
      if (data.storage.updatedAt) {
        currentLastSyncAt = data.storage.updatedAt;
      }
    }
  }

  function setAuthLoading(isLoading) {
    const btn = document.getElementById('btn-auth-submit');
    if (!btn) return;
    btn.disabled = isLoading;
    if (isLoading) {
      btn.dataset.prevText = btn.textContent;
      btn.textContent = activeAuthMode === 'register' ? 'Đang tạo tài khoản...' : 'Đang đăng nhập...';
      btn.classList.add('opacity-70');
    } else {
      btn.textContent = activeAuthMode === 'register' ? 'Tạo Tài Khoản & Đăng Nhập' : 'Đăng Nhập Ngay';
      btn.classList.remove('opacity-70');
    }
  }

  function updateHeaderAuthUI() {
    const btn = document.getElementById('btn-open-auth');
    const iconEl = document.getElementById('icon-auth-status');
    const labelEl = document.getElementById('header-auth-label');
    if (!btn || !iconEl || !labelEl) return;

    btn.classList.remove(
      'bg-rose-200', 'hover:bg-rose-300',
      'bg-emerald-200', 'hover:bg-emerald-300',
      'bg-stone-200', 'hover:bg-stone-300'
    );

    const adminHeaderBtn = document.getElementById('btn-open-admin');
    if (adminHeaderBtn) {
      adminHeaderBtn.classList.toggle('hidden', !isAdminUser());
    }

    if (!isBackendAvailable()) {
      iconEl.setAttribute('data-sketchy', 'user');
      iconEl.innerHTML = skIcon('user', { size: 16 });
      labelEl.textContent = 'Offline';
      btn.classList.add('bg-stone-200', 'hover:bg-stone-300');
      btn.title = 'Đang chạy tệp file:// offline (chạy trên server hoặc .bat để đăng nhập)';
      return;
    }

    if (currentUser) {
      iconEl.setAttribute('data-sketchy', isAdminUser() ? 'shield' : 'cloud');
      iconEl.innerHTML = skIcon(isAdminUser() ? 'shield' : 'cloud', {
        size: 16,
        accent: isAdminUser() ? '#fde047' : '#a7f3d0'
      });
      labelEl.textContent = currentUser.displayName || currentUser.username;
      btn.classList.add('bg-emerald-200', 'hover:bg-emerald-300');
      btn.title = `Đã đăng nhập: ${currentUser.username}${isAdminUser() ? ' [Admin]' : ''} (Bấm để xem phiên & đồng bộ)`;
    } else {
      iconEl.setAttribute('data-sketchy', 'user');
      iconEl.innerHTML = skIcon('user', { size: 16, accent: '#fecdd3' });
      labelEl.textContent = 'Đăng nhập';
      btn.classList.add('bg-rose-200', 'hover:bg-rose-300');
      btn.title = 'Đăng nhập hoặc Đăng ký tài khoản (ghi nhớ 30 ngày)';
    }
  }

  function switchAuthTab(mode) {
    activeAuthMode = mode === 'register' ? 'register' : 'login';
    setAuthError('');

    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    const displayGroup = document.getElementById('auth-display-name-group');
    const submitBtn = document.getElementById('btn-auth-submit');
    const passInput = document.getElementById('auth-password');

    if (tabLogin && tabRegister) {
      tabLogin.classList.toggle('bg-pink-300', activeAuthMode === 'login');
      tabLogin.classList.toggle('font-black', activeAuthMode === 'login');
      tabLogin.classList.toggle('border', activeAuthMode === 'login');
      tabLogin.classList.toggle('border-stone-800', activeAuthMode === 'login');
      tabLogin.classList.toggle('text-stone-900', activeAuthMode === 'login');
      tabLogin.classList.toggle('text-stone-600', activeAuthMode !== 'login');

      tabRegister.classList.toggle('bg-amber-200', activeAuthMode === 'register');
      tabRegister.classList.toggle('font-black', activeAuthMode === 'register');
      tabRegister.classList.toggle('border', activeAuthMode === 'register');
      tabRegister.classList.toggle('border-stone-800', activeAuthMode === 'register');
      tabRegister.classList.toggle('text-stone-900', activeAuthMode === 'register');
      tabRegister.classList.toggle('text-stone-600', activeAuthMode !== 'register');
    }

    if (displayGroup) {
      displayGroup.classList.toggle('hidden', activeAuthMode !== 'register');
    }
    if (passInput) {
      passInput.setAttribute('autocomplete', activeAuthMode === 'register' ? 'new-password' : 'current-password');
    }
    if (submitBtn) {
      submitBtn.textContent = activeAuthMode === 'register' ? 'Tạo Tài Khoản & Đăng Nhập' : 'Đăng Nhập Ngay';
    }
  }

  function renderAuthModalView() {
    const loggedOutView = document.getElementById('auth-logged-out-view');
    const loggedInView = document.getElementById('auth-logged-in-view');
    const offlineNotice = document.getElementById('auth-offline-notice');

    if (!isBackendAvailable()) {
      loggedOutView?.classList.remove('hidden');
      loggedInView?.classList.add('hidden');
      offlineNotice?.classList.remove('hidden');
    } else if (currentUser) {
      offlineNotice?.classList.add('hidden');
      loggedOutView?.classList.add('hidden');
      loggedInView?.classList.remove('hidden');

      const nameEl = document.getElementById('auth-profile-display-name');
      const userEl = document.getElementById('auth-profile-username');
      const rememberBadge = document.getElementById('auth-profile-remember-badge');
      const expiryEl = document.getElementById('auth-profile-expiry');

      if (nameEl) nameEl.textContent = currentUser.displayName || currentUser.username;
      if (userEl) userEl.textContent = `@${currentUser.username}`;
      if (rememberBadge) {
        rememberBadge.textContent = currentRememberMe
          ? 'Ghi nhớ 30 ngày đang bật'
          : 'Phiên tạm thời (tới khi đóng trình duyệt)';
      }
      if (expiryEl) {
        expiryEl.textContent = currentExpiresAt
          ? `Hết hạn phiên: ${formatDateTime(currentExpiresAt)}`
          : 'Đang hoạt động';
      }

      const engineEl = document.getElementById('auth-storage-engine');
      const summaryEl = document.getElementById('auth-storage-summary');
      const syncEl = document.getElementById('auth-storage-sync');
      const localState = window.ScheduleAPI?.getState?.();
      const boardsCount = currentStorageStats?.boardCount ?? localState?.boards?.length ?? 0;
      const tasksCount = currentStorageStats?.taskCount ?? localState?.tasks?.length ?? 0;

      if (engineEl) {
        engineEl.textContent = currentStorageStats?.engine || 'sqlite (data/tanas.db)';
      }
      if (summaryEl) {
        summaryEl.textContent = `${boardsCount} bảng • ${tasksCount} công việc`;
      }
      if (syncEl) {
        const ts = currentLastSyncAt || currentStorageStats?.updatedAt;
        syncEl.textContent = ts ? `Đã lưu: ${formatDateTime(ts)}` : 'Chưa lưu trên server';
      }

      const profileNameInput = document.getElementById('profile-display-name');
      if (profileNameInput && !profileNameInput.matches(':focus')) {
        profileNameInput.value = currentUser.displayName || currentUser.username;
      }

      document.getElementById('auth-profile-role-badge')?.classList.toggle('hidden', !isAdminUser());
      document.getElementById('btn-modal-open-admin')?.classList.toggle('hidden', !isAdminUser());
    } else {
      document.getElementById('auth-profile-role-badge')?.classList.add('hidden');
      document.getElementById('btn-modal-open-admin')?.classList.add('hidden');
      offlineNotice?.classList.add('hidden');
      loggedInView?.classList.add('hidden');
      loggedOutView?.classList.remove('hidden');
      switchAuthTab(activeAuthMode);
    }
  }

  function openAuthModal(mode = null) {
    if (mode) activeAuthMode = mode;
    const modal = document.getElementById('modal-auth');
    if (!modal) return;
    const box = modal.querySelector('.sketch-box');
    if (box) {
      box.style.position = '';
      box.style.left = '';
      box.style.top = '';
      box.style.right = '';
      box.style.bottom = '';
      box.style.width = '';
      box.style.transform = '';
      box.style.margin = '';
    }
    setAuthError('');
    renderAuthModalView();
    modal.classList.remove('hidden');
    window.Sketchy?.hydrate(modal);
  }

  function closeAuthModal() {
    const modal = document.getElementById('modal-auth');
    if (!modal) return;
    modal.classList.add('hidden');
    const box = modal.querySelector('.sketch-box');
    if (box) {
      box.style.position = '';
      box.style.left = '';
      box.style.top = '';
      box.style.right = '';
      box.style.bottom = '';
      box.style.width = '';
      box.style.transform = '';
      box.style.margin = '';
    }
  }

  async function pullOrPushScheduleAfterAuth() {
    if (!isBackendAvailable() || !currentUser || !window.ScheduleAPI) return;
    try {
      const res = await fetch('/api/schedule', { cache: 'no-store', credentials: 'same-origin' });
      if (res.status === 403 || res.status === 401) {
        const errBody = await res.json().catch(() => null);
        if (errBody && errBody.banned) handleForcedBannedLogout(errBody.error);
        return;
      }
      if (!res.ok) return;
      const body = await res.json();
      if (body && body.storage) {
        currentStorageStats = body.storage;
      }
      if (body && body.exists && body.data && Array.isArray(body.data.boards) && Array.isArray(body.data.tasks)) {
        window.ScheduleAPI.applyRemoteSchedule(body.data, currentUser.id);
        currentLastSyncAt = body.data.updatedAt || body.storage?.updatedAt || Date.now();
      } else {
        // Brand-new account: only upload guest schedule; never leak previous user's stale local storage
        const eligible = window.ScheduleAPI.isGuestDataEligibleForUpload
          ? window.ScheduleAPI.isGuestDataEligibleForUpload(currentUser.id)
          : true;
        if (!eligible && window.ScheduleAPI.resetToDefaultView) {
          window.ScheduleAPI.resetToDefaultView(currentUser.id);
        } else {
          window.ScheduleAPI.setDataOwner?.(currentUser.id);
        }
        if (body && body.aiPrefs && window.StudioModules?.applyPreferences) {
          window.StudioModules.applyPreferences(body.aiPrefs);
        }
        await syncNowToServer(true);
      }
      renderAuthModalView();
    } catch (_) {}
  }

  async function syncNowToServer(silent = false) {
    if (!isBackendAvailable() || !currentUser || !window.ScheduleAPI) return false;
    try {
      const payload = window.ScheduleAPI.getExportPayload();
      const res = await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      if (res.status === 403) {
        const errBody = await res.json().catch(() => null);
        if (errBody && errBody.banned) {
          handleForcedBannedLogout(errBody.error);
          return false;
        }
      }
      if (!res.ok) return false;
      const body = await res.json().catch(() => null);
      if (body && body.storage) {
        currentStorageStats = body.storage;
      }
      currentLastSyncAt = (body && body.updatedAt) || Date.now();
      localStorage.setItem('schedule_last_saved_at', String(currentLastSyncAt));
      window.ScheduleAPI.setDataOwner?.(currentUser.id);
      const modal = document.getElementById('modal-auth');
      if (modal && !modal.classList.contains('hidden')) {
        renderAuthModalView();
      }
      if (!silent) {
        window.ScheduleAPI.showToast('Đã đồng bộ lịch lên máy chủ thành công!');
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function queueRemoteSave() {
    if (!isBackendAvailable() || !currentUser) return;
    clearTimeout(syncQueueTimer);
    syncQueueTimer = setTimeout(() => {
      syncNowToServer(true);
    }, 250);
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');

    if (!isBackendAvailable()) {
      setAuthError('Bạn đang mở trực tiếp từ file:// nên chưa kết nối máy chủ. Hãy chạy qua server hoặc Mo-Thoi-Gian-Bieu.bat.');
      return;
    }

    const username = document.getElementById('auth-username')?.value.trim() || '';
    const password = document.getElementById('auth-password')?.value || '';
    const displayName = document.getElementById('auth-display-name')?.value.trim() || '';
    const rememberMe = Boolean(document.getElementById('auth-remember-me')?.checked);

    if (!username || !password) {
      setAuthError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    const endpoint = activeAuthMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const body = activeAuthMode === 'register'
      ? { username, password, displayName, rememberMe }
      : { username, password, rememberMe };

    setAuthLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthError(data.error || 'Đăng nhập thất bại, vui lòng thử lại.');
        return;
      }

      setSessionState(data);
      const passInput = document.getElementById('auth-password');
      if (passInput) passInput.value = '';
      sessionStorage.removeItem(GUEST_FLAG_KEY);
      updateHeaderAuthUI();
      startHeartbeat();
      await pullOrPushScheduleAfterAuth();
      closeAuthModal();

      const msg = currentRememberMe
        ? `Chào mừng ${currentUser.displayName}! Đã ghi nhớ đăng nhập 30 ngày.`
        : `Chào mừng ${currentUser.displayName}! Đăng nhập thành công.`;
      window.ScheduleAPI?.showToast(msg, 4000);
    } catch (_) {
      setAuthError('Không kết nối được máy chủ xác thực.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setNoticeBox('profile-error-box', '');
    if (!isBackendAvailable() || !currentUser) return;

    const displayName = document.getElementById('profile-display-name')?.value.trim() || '';
    const currentPassword = document.getElementById('profile-current-pass')?.value || '';
    const newPassword = document.getElementById('profile-new-pass')?.value || '';

    if (!displayName) {
      setNoticeBox('profile-error-box', 'Tên hiển thị không được để trống.');
      return;
    }
    if (newPassword && !currentPassword) {
      setNoticeBox('profile-error-box', 'Vui lòng nhập mật khẩu cũ để đổi mật khẩu.');
      return;
    }

    const saveBtn = document.getElementById('btn-profile-save');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Đang lưu...';
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ displayName, currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.user) {
        setNoticeBox('profile-error-box', data.error || 'Không thể cập nhật hồ sơ.');
        return;
      }

      currentUser = data.user;
      const curPassEl = document.getElementById('profile-current-pass');
      const newPassEl = document.getElementById('profile-new-pass');
      if (curPassEl) curPassEl.value = '';
      if (newPassEl) newPassEl.value = '';
      document.getElementById('form-auth-profile')?.classList.add('hidden');
      updateHeaderAuthUI();
      renderAuthModalView();
      window.ScheduleAPI?.showToast('Đã cập nhật hồ sơ tài khoản trên máy chủ!');
    } catch (_) {
      setNoticeBox('profile-error-box', 'Lỗi kết nối máy chủ khi lưu hồ sơ.');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Lưu lên Server';
      }
    }
  }

  async function handleLogout() {
    stopHeartbeat();
    closeAdminModal();
    clearTimeout(syncQueueTimer);
    syncQueueTimer = null;
    if (isBackendAvailable()) {
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      } catch (_) {}
    }
    currentUser = null;
    currentRememberMe = false;
    currentExpiresAt = null;
    currentStorageStats = null;
    currentLastSyncAt = null;
    document.getElementById('form-auth-profile')?.classList.add('hidden');
    window.ScheduleAPI?.resetToDefaultView?.('guest');
    updateHeaderAuthUI();
    renderAuthModalView();
    window.ScheduleAPI?.showToast('Đã đăng xuất và dọn dữ liệu riêng tư khỏi trình duyệt.');
  }

  async function checkInitialSession() {
    updateHeaderAuthUI();
    if (!isBackendAvailable()) return;

    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'same-origin' });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.banned) {
        handleForcedBannedLogout(`Tài khoản đã bị khóa: ${data.bannedReason || 'Liên hệ quản trị viên.'}`);
        return;
      }
      if (data && data.authenticated && data.user) {
        setSessionState(data);
        updateHeaderAuthUI();
        startHeartbeat();
        await pullOrPushScheduleAfterAuth();
      } else if (sessionStorage.getItem(GUEST_FLAG_KEY) !== '1') {
        openAuthModal('login');
      }
    } catch (_) {}
  }

  // --- Admin User Management Dashboard ---
  function closeAdminModal() {
    if (adminPollTimerId) {
      clearInterval(adminPollTimerId);
      adminPollTimerId = null;
    }
    const modal = document.getElementById('modal-admin');
    if (!modal) return;
    modal.classList.add('hidden');
    document.getElementById('admin-ban-panel')?.classList.add('hidden');
    document.getElementById('admin-key-panel')?.classList.add('hidden');
  }

  async function openAdminModal() {
    if (!isAdminUser()) {
      window.ScheduleAPI?.showToast('Chỉ tài khoản Admin mới có quyền mở bảng quản lý.');
      return;
    }
    closeAuthModal();
    const modal = document.getElementById('modal-admin');
    if (!modal) return;
    setNoticeBox('admin-error-box', '');
    modal.classList.remove('hidden');
    window.Sketchy?.hydrate(modal);
    await loadAdminUsers();
    if (adminPollTimerId) clearInterval(adminPollTimerId);
    adminPollTimerId = setInterval(() => {
      if (!modal.classList.contains('hidden') && isAdminUser()) {
        loadAdminUsers(true);
      }
    }, 15000);
  }

  function renderAdminDaysButtons() {
    document.querySelectorAll('.btn-admin-days').forEach(btn => {
      const d = Number(btn.getAttribute('data-days')) || 14;
      const active = d === adminState.days;
      btn.classList.toggle('bg-amber-200', active);
      btn.classList.toggle('text-stone-900', active);
      btn.classList.toggle('border', active);
      btn.classList.toggle('border-stone-800', active);
      btn.classList.toggle('text-stone-600', !active);
      btn.classList.toggle('dark:text-stone-300', !active);
    });
  }

  function renderAdminChart(chart) {
    const wrap = document.getElementById('admin-chart-wrap');
    if (!wrap) return;
    const series = chart?.series || [];
    if (series.length === 0) {
      wrap.innerHTML = '<div class="text-xs text-stone-500 py-6 text-center">Chưa có dữ liệu biểu đồ.</div>';
      return;
    }

    const W = Math.max(640, series.length * 36);
    const H = 175;
    const padL = 32;
    const padR = 16;
    const padT = 18;
    const padB = 30;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const baseY = padT + innerH;

    const maxBar = Math.max(1, ...series.map(s => Math.max(s.signups || 0, s.active || 0)));
    const maxCum = Math.max(1, ...series.map(s => s.cumulative || 0));
    const slotW = innerW / series.length;
    const barW = Math.max(5, Math.min(13, slotW * 0.34));

    const gridLines = [0, 0.5, 1].map(frac => {
      const y = baseY - innerH * frac;
      const val = Math.round(maxBar * frac);
      return `
        <line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="currentColor" stroke-opacity="0.16" stroke-dasharray="3 3" stroke-width="1"/>
        <text x="${padL - 5}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="10" font-weight="700" fill="currentColor" opacity="0.65">${val}</text>
      `;
    }).join('');

    const labelStep = series.length > 16 ? 3 : (series.length > 9 ? 2 : 1);
    const cumPoints = [];

    const barsSvg = series.map((pt, idx) => {
      const cx = padL + idx * slotW + slotW / 2;
      const activeH = ((pt.active || 0) / maxBar) * innerH;
      const signupH = ((pt.signups || 0) / maxBar) * innerH;
      const activeY = baseY - activeH;
      const signupY = baseY - signupH;

      const cumY = baseY - ((pt.cumulative || 0) / maxCum) * innerH;
      cumPoints.push({ x: cx, y: cumY, val: pt.cumulative || 0, label: pt.label });

      const showXLabel = idx % labelStep === 0 || idx === series.length - 1;
      const tip = `${pt.label}: ${pt.signups} đăng ký mới, ${pt.active} hoạt động, tổng ${pt.cumulative} TV`;

      return `
        <g>
          <title>${escapeHtml(tip)}</title>
          <rect x="${(cx - barW - 1).toFixed(1)}" y="${signupY.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(2, signupH).toFixed(1)}" rx="3" fill="#f472b6" fill-opacity="0.88" stroke="#292524" stroke-width="1"/>
          <rect x="${(cx + 1).toFixed(1)}" y="${activeY.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(2, activeH).toFixed(1)}" rx="3" fill="#38bdf8" fill-opacity="0.88" stroke="#292524" stroke-width="1"/>
          ${showXLabel ? `<text x="${cx.toFixed(1)}" y="${(baseY + 15).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor" opacity="0.72">${escapeHtml(pt.label)}</text>` : ''}
        </g>
      `;
    }).join('');

    const polyStr = cumPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const dotsSvg = cumPoints.map(p => `
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.2" fill="#10b981" stroke="#292524" stroke-width="1.2">
        <title>${escapeHtml(`${p.label}: Tổng ${p.val} thành viên`)}</title>
      </circle>
    `).join('');

    wrap.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" class="w-full min-w-[520px] h-44 text-stone-800 dark:text-stone-200 select-none">
        ${gridLines}
        <line x1="${padL}" y1="${baseY}" x2="${W - padR}" y2="${baseY}" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.4"/>
        ${barsSvg}
        <polyline fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" points="${polyStr}"/>
        ${dotsSvg}
      </svg>
    `;
  }

  function renderAdminUsersList() {
    const container = document.getElementById('admin-users-list');
    if (!container || !adminState.data) return;

    const users = adminState.data.users || [];
    const q = adminState.search.trim().toLowerCase();
    const filter = adminState.filter;

    const filtered = users.filter(u => {
      if (filter === 'online' && !u.isOnline) return false;
      if (filter === 'offline' && u.isOnline) return false;
      if (filter === 'admin' && u.role !== 'admin') return false;
      if (filter === 'banned' && !u.isBanned) return false;
      if (filter === 'has-key' && !u.aiKey?.hasKey) return false;

      if (!q) return true;
      const hay = `${u.username} ${u.displayName} ${u.aiKey?.provider || ''} ${u.aiKey?.model || ''}`.toLowerCase();
      return hay.includes(q);
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div class="p-6 text-center rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 text-stone-500 font-bold">Không tìm thấy tài khoản phù hợp bộ lọc.</div>';
      return;
    }

    container.innerHTML = filtered.map(u => {
      const isSelf = currentUser && u.id === currentUser.id;
      const isRootAdmin = Boolean(u.isRootAdmin);
      const canModifyAuthority = !isSelf && !isRootAdmin;

      const presenceHtml = u.isBanned
        ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-500 text-[10px] font-black">Đã Ban</span>'
        : (u.isOnline
            ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-600 text-[10px] font-black"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>Online</span>'
            : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-[10px] font-bold">Offline · ${u.lastSeenAt ? escapeHtml(formatRelativeTime(u.lastSeenAt)) : 'Chưa hoạt động'}</span>`);

      const roleBadge = u.role === 'admin'
        ? '<span class="px-2 py-0.5 rounded-full bg-amber-300 text-stone-900 border border-stone-800 text-[10px] font-black">ADMIN</span>'
        : '<span class="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-300 dark:border-stone-600 text-[10px] font-bold">Thành viên</span>';

      const keyBadge = u.aiKey?.hasKey
        ? `<div class="inline-flex flex-wrap items-center gap-1.5 text-[11px] bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-400/70 px-2.5 py-1 rounded-xl">
             ${skIcon('key', { size: 12, accent: '#fde047' })}
             <span class="font-black text-indigo-900 dark:text-indigo-200">${escapeHtml(u.aiKey.provider || 'AI')}${u.aiKey.model ? ` · ${escapeHtml(u.aiKey.model)}` : ''}</span>
             <code class="font-mono text-[10px] bg-white/80 dark:bg-stone-900 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-700">${escapeHtml(u.aiKey.masked || 'Đã mã hóa')}</code>
           </div>`
        : '<span class="text-[11px] text-stone-400 font-semibold italic">Chưa gắn API Key AI</span>';

      const banReasonLine = u.isBanned && u.bannedReason
        ? `<div class="text-[11px] text-rose-700 dark:text-rose-300 font-bold mt-1">Lý do khóa: ${escapeHtml(u.bannedReason)}</div>`
        : '';

      const uid = escapeHtml(u.id);
      return `
        <div class="p-3.5 rounded-2xl border-2 ${u.isBanned ? 'border-rose-400 bg-rose-50/40 dark:bg-rose-950/20' : 'border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-900/70'} flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div class="min-w-0 flex-1 space-y-1.5">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="font-black text-sm text-stone-900 dark:text-white">${escapeHtml(u.displayName)}</span>
              <span class="text-[11px] font-bold text-stone-500">@${escapeHtml(u.username)}</span>
              ${isSelf ? '<span class="px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 text-[10px] font-black">Bạn</span>' : ''}
              ${roleBadge}
              ${presenceHtml}
            </div>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              <span>${u.boardCount} bảng • ${u.taskCount} công việc</span>
              <span>Tham gia: ${escapeHtml(formatDateTime(u.createdAt) || '—')}</span>
              <span>Phiên hoạt động: ${u.activeSessionCount}</span>
            </div>
            <div class="pt-0.5">${keyBadge}</div>
            ${banReasonLine}
          </div>

          <div class="flex flex-wrap items-center gap-1.5 flex-shrink-0">
            <button type="button" class="btn-admin-key btn-cute bg-indigo-200 hover:bg-indigo-300 text-stone-900 px-2.5 py-1.5 text-[11px] font-black" data-user-id="${uid}">
              ${skIcon('key', { size: 12, accent: '#fef08a' })}
              <span>${u.aiKey?.hasKey ? 'Xem / Sửa Key' : 'Gán API Key'}</span>
            </button>
            ${canModifyAuthority ? `
              <button type="button" class="btn-admin-role btn-cute ${u.role === 'admin' ? 'bg-stone-200 hover:bg-stone-300' : 'bg-amber-300 hover:bg-amber-400'} text-stone-900 px-2.5 py-1.5 text-[11px] font-black" data-user-id="${uid}" data-next-role="${u.role === 'admin' ? 'user' : 'admin'}">
                ${skIcon('shield', { size: 12, accent: '#fef08a' })}
                <span>${u.role === 'admin' ? 'Hạ quyền' : 'Cấp Admin'}</span>
              </button>
              <button type="button" class="btn-admin-ban btn-cute ${u.isBanned ? 'bg-emerald-300 hover:bg-emerald-400' : 'bg-rose-300 hover:bg-rose-400'} text-stone-900 px-2.5 py-1.5 text-[11px] font-black" data-user-id="${uid}" data-is-banned="${u.isBanned ? '1' : '0'}">
                ${skIcon('ban', { size: 12 })}
                <span>${u.isBanned ? 'Gỡ Ban' : 'Ban'}</span>
              </button>
            ` : '<span class="px-2 py-1 text-[10px] font-bold text-stone-400">Admin mặc định</span>'}
          </div>
        </div>
      `;
    }).join('');
  }

  async function loadAdminUsers(silent = false) {
    if (!isAdminUser()) return;
    if (!silent) setNoticeBox('admin-error-box', '');
    try {
      const res = await fetch(`/api/admin/users?days=${adminState.days}`, {
        cache: 'no-store',
        credentials: 'same-origin'
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data?.banned) {
          handleForcedBannedLogout(data.error);
          return;
        }
        setNoticeBox('admin-error-box', data?.error || 'Không tải được danh sách người dùng.');
        return;
      }

      adminState.data = data;
      const sum = data.summary || {};
      const setTxt = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.textContent = String(v ?? 0);
      };
      setTxt('admin-kpi-total', sum.totalUsers);
      setTxt('admin-kpi-online', sum.onlineCount);
      setTxt('admin-kpi-admins', sum.adminCount);
      setTxt('admin-kpi-banned', sum.bannedCount);
      setTxt('admin-kpi-keys', sum.apiKeyCount);

      const liveEl = document.getElementById('admin-live-status');
      if (liveEl) {
        liveEl.textContent = `Cập nhật lúc ${formatDateTime(data.serverTime)} • Ngưỡng Online: ${data.onlineWindowSec || 120}s`;
      }

      renderAdminDaysButtons();
      const nextSig = JSON.stringify({ sum: data.summary, chart: data.chart, users: data.users, days: adminState.days });
      if (!silent || nextSig !== adminState.lastSig) {
        adminState.lastSig = nextSig;
        renderAdminChart(data.chart);
        renderAdminUsersList();
      }
    } catch (_) {
      if (!silent) setNoticeBox('admin-error-box', 'Lỗi kết nối khi tải bảng Admin.');
    }
  }

  async function toggleUserRole(userId, nextRole) {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ role: nextRole })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNoticeBox('admin-error-box', data.error || 'Không thể đổi quyền.');
        return;
      }
      window.ScheduleAPI?.showToast(
        nextRole === 'admin'
          ? `Đã cấp quyền Admin cho @${data.user.username}!`
          : `Đã chuyển @${data.user.username} về Thành viên.`
      );
      await loadAdminUsers(true);
    } catch (_) {
      setNoticeBox('admin-error-box', 'Lỗi kết nối khi cập nhật quyền.');
    }
  }

  function openBanPanel(userObj) {
    adminState.banTarget = userObj;
    document.getElementById('admin-key-panel')?.classList.add('hidden');
    const panel = document.getElementById('admin-ban-panel');
    const label = document.getElementById('admin-ban-target-label');
    const input = document.getElementById('admin-ban-reason-input');
    if (label) label.textContent = `${userObj.displayName} (@${userObj.username})`;
    if (input) input.value = userObj.bannedReason || '';
    panel?.classList.remove('hidden');
    panel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    input?.focus();
  }

  async function submitBanAction(userId, banned, reason = '') {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ banned, reason })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNoticeBox('admin-error-box', data.error || 'Không thể thay đổi trạng thái khóa.');
        return;
      }
      document.getElementById('admin-ban-panel')?.classList.add('hidden');
      adminState.banTarget = null;
      window.ScheduleAPI?.showToast(
        banned
          ? `Đã khóa tài khoản @${data.user.username} và ngắt toàn bộ phiên.`
          : `Đã gỡ Ban cho @${data.user.username}!`
      );
      await loadAdminUsers(true);
    } catch (_) {
      setNoticeBox('admin-error-box', 'Lỗi kết nối khi thực hiện Ban.');
    }
  }

  async function openKeyPanel(userObj) {
    adminState.keyTarget = userObj;
    document.getElementById('admin-ban-panel')?.classList.add('hidden');
    const panel = document.getElementById('admin-key-panel');
    const label = document.getElementById('admin-key-target-label');
    const provEl = document.getElementById('admin-key-provider');
    const modelEl = document.getElementById('admin-key-model');
    const endpointEl = document.getElementById('admin-key-endpoint');
    const valEl = document.getElementById('admin-key-value');
    const visBtn = document.getElementById('btn-admin-key-vis');

    if (label) label.textContent = `${userObj.displayName} (@${userObj.username})`;
    if (valEl) {
      valEl.type = 'password';
      valEl.value = '';
    }
    if (visBtn) visBtn.textContent = 'Hiện';
    panel?.classList.remove('hidden');
    panel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userObj.id)}/ai-key`, {
        cache: 'no-store',
        credentials: 'same-origin'
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        if (provEl) provEl.value = data.provider === 'openai' ? 'openai' : 'gemini';
        if (modelEl) modelEl.value = data.model || '';
        if (endpointEl) endpointEl.value = data.endpoint || '';
        if (valEl) valEl.value = data.apiKey || '';
      }
    } catch (_) {}
  }

  async function saveAdminUserKey() {
    if (!adminState.keyTarget) return;
    const provider = document.getElementById('admin-key-provider')?.value || 'gemini';
    const model = document.getElementById('admin-key-model')?.value.trim() || '';
    const endpoint = document.getElementById('admin-key-endpoint')?.value.trim() || '';
    const apiKey = document.getElementById('admin-key-value')?.value.trim() || '';

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(adminState.keyTarget.id)}/ai-key`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ provider, model, endpoint, apiKey })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNoticeBox('admin-error-box', data.error || 'Không thể lưu API Key.');
        return;
      }
      if (currentUser && adminState.keyTarget.id === currentUser.id && window.StudioModules?.applyPreferences) {
        window.StudioModules.applyPreferences({
          aiProvider: provider,
          aiModel: model,
          aiEndpoint: endpoint,
          aiApiKey: apiKey
        });
      }
      document.getElementById('admin-key-panel')?.classList.add('hidden');
      window.ScheduleAPI?.showToast(`Đã lưu AI API Key cho @${adminState.keyTarget.username}!`);
      await loadAdminUsers(true);
    } catch (_) {
      setNoticeBox('admin-error-box', 'Lỗi kết nối khi lưu API Key.');
    }
  }

  async function deleteAdminUserKey() {
    if (!adminState.keyTarget) return;
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(adminState.keyTarget.id)}/ai-key`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNoticeBox('admin-error-box', data.error || 'Không thể xóa API Key.');
        return;
      }
      if (currentUser && adminState.keyTarget.id === currentUser.id && window.StudioModules?.applyPreferences) {
        window.StudioModules.applyPreferences({ aiApiKey: '', resetAiKey: true });
      }
      document.getElementById('admin-key-panel')?.classList.add('hidden');
      window.ScheduleAPI?.showToast(`Đã xóa AI API Key của @${adminState.keyTarget.username}.`);
      await loadAdminUsers(true);
    } catch (_) {
      setNoticeBox('admin-error-box', 'Lỗi kết nối khi xóa API Key.');
    }
  }

  function initAuth() {
    document.getElementById('btn-open-auth')?.addEventListener('click', () => openAuthModal());
    document.getElementById('btn-close-auth-modal')?.addEventListener('click', closeAuthModal);
    document.getElementById('modal-auth')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-auth') closeAuthModal();
    });

    document.getElementById('btn-open-admin')?.addEventListener('click', openAdminModal);
    document.getElementById('btn-modal-open-admin')?.addEventListener('click', openAdminModal);
    document.getElementById('btn-close-admin-modal')?.addEventListener('click', closeAdminModal);
    document.getElementById('modal-admin')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-admin') closeAdminModal();
    });
    document.getElementById('btn-admin-refresh')?.addEventListener('click', () => loadAdminUsers(false));

    document.querySelectorAll('.btn-admin-days').forEach(btn => {
      btn.addEventListener('click', () => {
        adminState.days = Number(btn.getAttribute('data-days')) || 14;
        loadAdminUsers(false);
      });
    });

    document.getElementById('admin-search-input')?.addEventListener('input', (e) => {
      adminState.search = e.target.value || '';
      renderAdminUsersList();
    });
    document.getElementById('admin-filter-select')?.addEventListener('change', (e) => {
      adminState.filter = e.target.value || 'all';
      renderAdminUsersList();
    });

    document.getElementById('admin-users-list')?.addEventListener('click', (e) => {
      const roleBtn = e.target.closest('.btn-admin-role');
      if (roleBtn) {
        toggleUserRole(roleBtn.getAttribute('data-user-id'), roleBtn.getAttribute('data-next-role'));
        return;
      }
      const banBtn = e.target.closest('.btn-admin-ban');
      if (banBtn) {
        const uid = banBtn.getAttribute('data-user-id');
        const userObj = (adminState.data?.users || []).find(u => u.id === uid);
        if (!userObj) return;
        if (banBtn.getAttribute('data-is-banned') === '1') {
          submitBanAction(uid, false, '');
        } else {
          openBanPanel(userObj);
        }
        return;
      }
      const keyBtn = e.target.closest('.btn-admin-key');
      if (keyBtn) {
        const uid = keyBtn.getAttribute('data-user-id');
        const userObj = (adminState.data?.users || []).find(u => u.id === uid);
        if (userObj) openKeyPanel(userObj);
      }
    });

    document.getElementById('btn-admin-cancel-ban')?.addEventListener('click', () => {
      document.getElementById('admin-ban-panel')?.classList.add('hidden');
      adminState.banTarget = null;
    });
    document.getElementById('btn-admin-confirm-ban')?.addEventListener('click', () => {
      if (!adminState.banTarget) return;
      const reason = document.getElementById('admin-ban-reason-input')?.value.trim() || '';
      submitBanAction(adminState.banTarget.id, true, reason);
    });

    document.getElementById('btn-admin-key-close')?.addEventListener('click', () => {
      document.getElementById('admin-key-panel')?.classList.add('hidden');
      adminState.keyTarget = null;
    });
    document.getElementById('btn-admin-key-vis')?.addEventListener('click', (e) => {
      const inp = document.getElementById('admin-key-value');
      if (!inp) return;
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      e.currentTarget.textContent = show ? 'Ẩn' : 'Hiện';
    });
    document.getElementById('btn-admin-key-copy')?.addEventListener('click', async () => {
      const val = document.getElementById('admin-key-value')?.value || '';
      if (!val) {
        window.ScheduleAPI?.showToast('Tài khoản này chưa có API Key để sao chép.');
        return;
      }
      try {
        await navigator.clipboard.writeText(val);
        window.ScheduleAPI?.showToast('Đã sao chép API Key vào clipboard!');
      } catch (_) {}
    });
    document.getElementById('btn-admin-key-save')?.addEventListener('click', saveAdminUserKey);
    document.getElementById('btn-admin-key-delete')?.addEventListener('click', deleteAdminUserKey);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && currentUser) {
        sendHeartbeatPing();
      }
    });

    document.getElementById('tab-auth-login')?.addEventListener('click', () => switchAuthTab('login'));
    document.getElementById('tab-auth-register')?.addEventListener('click', () => switchAuthTab('register'));
    document.getElementById('form-auth')?.addEventListener('submit', handleAuthSubmit);

    document.getElementById('btn-toggle-profile-edit')?.addEventListener('click', () => {
      const form = document.getElementById('form-auth-profile');
      if (!form) return;
      form.classList.toggle('hidden');
      setNoticeBox('profile-error-box', '');
      if (!form.classList.contains('hidden') && currentUser) {
        const input = document.getElementById('profile-display-name');
        if (input) input.value = currentUser.displayName || currentUser.username;
      }
    });
    document.getElementById('btn-cancel-profile-edit')?.addEventListener('click', () => {
      document.getElementById('form-auth-profile')?.classList.add('hidden');
      setNoticeBox('profile-error-box', '');
    });
    document.getElementById('form-auth-profile')?.addEventListener('submit', handleProfileSubmit);

    document.getElementById('btn-toggle-auth-pass')?.addEventListener('click', () => {
      const passInput = document.getElementById('auth-password');
      if (passInput) {
        passInput.type = passInput.type === 'password' ? 'text' : 'password';
      }
    });

    document.getElementById('btn-auth-guest')?.addEventListener('click', () => {
      sessionStorage.setItem(GUEST_FLAG_KEY, '1');
      closeAuthModal();
      window.ScheduleAPI?.showToast('Đang dùng chế độ Khách (chỉ lưu trên trình duyệt này).');
    });

    document.getElementById('btn-auth-sync-now')?.addEventListener('click', () => {
      syncNowToServer(false);
    });
    document.getElementById('btn-auth-logout')?.addEventListener('click', handleLogout);

    checkInitialSession();
  }

  window.TanasAuth = {
    isLoggedIn: () => Boolean(currentUser),
    isAdmin: isAdminUser,
    getUser: () => currentUser,
    queueRemoteSave,
    syncNowToServer,
    openAuthModal,
    openAdminModal
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
})();
