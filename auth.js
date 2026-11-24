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

  function isBackendAvailable() {
    return window.location.protocol === 'http:' || window.location.protocol === 'https:';
  }

  function skIcon(name, opts = {}) {
    return (window.Sketchy && typeof window.Sketchy.icon === 'function')
      ? window.Sketchy.icon(name, opts)
      : '';
  }

  function formatDateTime(ms) {
    if (!ms) return '';
    try {
      const d = new Date(Number(ms));
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

    if (!isBackendAvailable()) {
      iconEl.setAttribute('data-sketchy', 'user');
      iconEl.innerHTML = skIcon('user', { size: 16 });
      labelEl.textContent = 'Offline';
      btn.classList.add('bg-stone-200', 'hover:bg-stone-300');
      btn.title = 'Đang chạy tệp file:// offline (chạy trên server hoặc .bat để đăng nhập)';
      return;
    }

    if (currentUser) {
      iconEl.setAttribute('data-sketchy', 'cloud');
      iconEl.innerHTML = skIcon('cloud', { size: 16, accent: '#a7f3d0' });
      labelEl.textContent = currentUser.displayName || currentUser.username;
      btn.classList.add('bg-emerald-200', 'hover:bg-emerald-300');
      btn.title = `Đã đăng nhập: ${currentUser.username} (Bấm để xem phiên & đồng bộ)`;
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
    } else {
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
      if (data && data.authenticated && data.user) {
        setSessionState(data);
        updateHeaderAuthUI();
        await pullOrPushScheduleAfterAuth();
      } else if (sessionStorage.getItem(GUEST_FLAG_KEY) !== '1') {
        openAuthModal('login');
      }
    } catch (_) {}
  }

  function initAuth() {
    document.getElementById('btn-open-auth')?.addEventListener('click', () => openAuthModal());
    document.getElementById('btn-close-auth-modal')?.addEventListener('click', closeAuthModal);
    document.getElementById('modal-auth')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-auth') closeAuthModal();
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
    getUser: () => currentUser,
    queueRemoteSave,
    syncNowToServer,
    openAuthModal
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
})();
