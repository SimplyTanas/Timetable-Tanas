/**
 * Studio Features Module for Thời Gian Biểu Tanas
 * Includes:
 * 1. Focus Music & YouTube Player Widget (YouTube Iframe + Offline Web Audio Ambient Synth)
 * 2. Pomodoro Focus Timer + Audio Chime
 * 3. Browser Notifications & Real-time Live Task Refresh
 * 4. AI Assistant Drawer with API integration (Gemini Interactions / Classic / OpenAI-Compatible + Tool Calling)
 */

(function () {
  'use strict';

  const AI_STORAGE_KEY = 'schedule_app_ai_config_v1';
  const NOTIF_STORAGE_KEY = 'schedule_app_notif_v1';
  const NOTIFIED_MAP_KEY = 'schedule_app_notified_today_v1';
  const STUDIO_PREFS_KEY = 'schedule_app_studio_prefs_v1';

  // --- Shared Audio Context for Chime & Offline Ambient Synth ---
  let audioCtx = null;
  let masterGain = null;
  let ambientNodes = [];
  let ambientInterval = null;
  let ambientPlaying = false;
  let currentAmbientPreset = 'lofi';

  function ensureAudioContext() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      audioCtx = new AudioCtx();
      masterGain = audioCtx.createGain();
      const volSlider = document.getElementById('music-volume');
      const initialVol = volSlider ? Number(volSlider.value) / 100 : 0.45;
      masterGain.gain.value = initialVol;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playGentleChime() {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);

      gain.gain.setValueAtTime(0.001, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.14 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.9);
    });
  }

  function createPinkNoiseBuffer(ctx, seconds = 4) {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  function stopAmbientAudio() {
    ambientNodes.forEach(node => {
      try {
        if (typeof node.stop === 'function') node.stop();
        if (typeof node.disconnect === 'function') node.disconnect();
      } catch (_) {}
    });
    ambientNodes = [];
    if (ambientInterval) {
      clearInterval(ambientInterval);
      ambientInterval = null;
    }
    ambientPlaying = false;
    updateAmbientUI();
  }

  function startAmbientPreset(preset = 'lofi') {
    stopAmbientAudio();
    const ctx = ensureAudioContext();
    if (!ctx) {
      window.ScheduleAPI?.showToast('Trình duyệt không hỗ trợ Web Audio API.');
      return;
    }

    currentAmbientPreset = preset;
    ambientPlaying = true;

    if (preset === 'rain') {
      const src = ctx.createBufferSource();
      src.buffer = createPinkNoiseBuffer(ctx, 5);
      src.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 900;
      bandpass.Q.value = 0.65;

      const rainGain = ctx.createGain();
      rainGain.gain.value = 0.75;

      src.connect(bandpass);
      bandpass.connect(rainGain);
      rainGain.connect(masterGain);
      src.start();
      ambientNodes.push(src, bandpass, rainGain);
    } else if (preset === 'ocean') {
      const src = ctx.createBufferSource();
      src.buffer = createPinkNoiseBuffer(ctx, 6);
      src.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 420;

      const waveGain = ctx.createGain();
      waveGain.gain.value = 0.45;

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.14; // ~7 second wave cycle
      lfoGain.gain.value = 0.35;

      lfo.connect(lfoGain);
      lfoGain.connect(waveGain.gain);
      src.connect(lowpass);
      lowpass.connect(waveGain);
      waveGain.connect(masterGain);

      src.start();
      lfo.start();
      ambientNodes.push(src, lfo, lfoGain, lowpass, waveGain);
    } else if (preset === 'focus') {
      const src = ctx.createBufferSource();
      src.buffer = createPinkNoiseBuffer(ctx, 5);
      src.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 260;

      const warmGain = ctx.createGain();
      warmGain.gain.value = 0.8;

      src.connect(lowpass);
      lowpass.connect(warmGain);
      warmGain.connect(masterGain);
      src.start();
      ambientNodes.push(src, lowpass, warmGain);
    } else {
      // 'lofi': Soft ambient electric piano chords + gentle vinyl warmth
      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 329.63]  // G6
      ];
      let step = 0;

      const triggerChord = () => {
        if (!ambientPlaying || !audioCtx) return;
        const now = audioCtx.currentTime;
        const notes = chords[step % chords.length];
        step++;

        notes.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const filter = audioCtx.createBiquadFilter();
          const g = audioCtx.createGain();

          osc.type = i % 2 === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(950, now);

          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(0.09, now + 0.35 + i * 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, now + 3.4);

          osc.connect(filter);
          filter.connect(g);
          g.connect(masterGain);

          osc.start(now + i * 0.06);
          osc.stop(now + 3.5);
        });
      };

      triggerChord();
      ambientInterval = setInterval(triggerChord, 3200);
    }

    updateAmbientUI();
  }

  function skIcon(name, opts = {}) {
    return (window.Sketchy && typeof window.Sketchy.icon === 'function')
      ? window.Sketchy.icon(name, opts)
      : '';
  }

  function updateAmbientUI() {
    const btnToggle = document.getElementById('btn-ambient-toggle');
    const statusLabel = document.getElementById('ambient-status-label');
    const miniPill = document.getElementById('music-mini-pill');
    const miniLabel = document.getElementById('music-mini-label');

    const presetNames = {
      lofi: 'Lofi Piano Nhẹ',
      rain: 'Tiếng Mưa Rơi',
      ocean: 'Sóng Biển Thư Giãn',
      focus: 'Quán Cà Phê Tập Trung'
    };

    document.querySelectorAll('.btn-ambient-preset').forEach(btn => {
      const p = btn.getAttribute('data-preset');
      if (p === currentAmbientPreset && ambientPlaying) {
        btn.classList.add('ring-2', 'ring-emerald-500', 'bg-emerald-100', 'dark:bg-emerald-950/60');
      } else {
        btn.classList.remove('ring-2', 'ring-emerald-500', 'bg-emerald-100', 'dark:bg-emerald-950/60');
      }
    });

    if (btnToggle) {
      btnToggle.innerHTML = ambientPlaying
        ? `${skIcon('pause', { size: 14 })}<span>Tạm Dừng</span>`
        : `${skIcon('play', { size: 14 })}<span>Phát Nhạc</span>`;
      btnToggle.classList.toggle('bg-rose-300', ambientPlaying);
      btnToggle.classList.toggle('bg-emerald-300', !ambientPlaying);
    }
    if (statusLabel) {
      statusLabel.textContent = ambientPlaying
        ? `Đang phát: ${presetNames[currentAmbientPreset] || 'Nhạc Chill'}`
        : 'Đang tạm dừng';
    }
    if (miniLabel) {
      miniLabel.textContent = ambientPlaying
        ? presetNames[currentAmbientPreset]
        : 'Góc Nhạc';
    }
    if (miniPill && document.getElementById('music-widget')?.classList.contains('hidden') && ambientPlaying) {
      miniPill.classList.remove('hidden');
    }
  }

  // --- Music Widget & YouTube URL Parser ---
  function parseYouTubeUrl(rawUrl) {
    if (!rawUrl) return null;
    const str = rawUrl.trim();
    try {
      // Handle bare 11-char video ID
      if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
        return { type: 'video', id: str, watchUrl: `https://www.youtube.com/watch?v=${str}` };
      }
      const url = new URL(str.startsWith('http') ? str : `https://${str}`);
      const host = url.hostname.replace(/^www\./, '');
      const listId = url.searchParams.get('list');

      if (host === 'youtu.be') {
        const vid = url.pathname.split('/').filter(Boolean)[0];
        if (vid) return { type: 'video', id: vid, listId, watchUrl: str };
      }
      if (host.includes('youtube.com')) {
        if (url.pathname.startsWith('/playlist') && listId) {
          return { type: 'playlist', id: listId, watchUrl: str };
        }
        const vParam = url.searchParams.get('v');
        if (vParam) return { type: 'video', id: vParam, listId, watchUrl: str };

        const parts = url.pathname.split('/').filter(Boolean);
        if (['embed', 'shorts', 'live'].includes(parts[0]) && parts[1]) {
          return { type: 'video', id: parts[1], listId, watchUrl: `https://www.youtube.com/watch?v=${parts[1]}` };
        }
      }
    } catch (_) {}
    return null;
  }

  function switchMusicTab(tabName) {
    const ytPanel = document.getElementById('music-panel-youtube');
    const ambPanel = document.getElementById('music-panel-ambient');
    document.querySelectorAll('.btn-music-tab').forEach(btn => {
      const isTarget = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('bg-rose-300', isTarget && tabName === 'youtube');
      btn.classList.toggle('bg-emerald-300', isTarget && tabName === 'ambient');
      btn.classList.toggle('text-stone-900', isTarget);
      btn.classList.toggle('font-black', isTarget);
      btn.classList.toggle('border', isTarget);
      btn.classList.toggle('border-stone-800', isTarget);
      btn.classList.toggle('text-stone-600', !isTarget);
    });
    if (ytPanel) ytPanel.classList.toggle('hidden', tabName !== 'youtube');
    if (ambPanel) ambPanel.classList.toggle('hidden', tabName !== 'ambient');
  }

  function openMusicWidget(tab = null) {
    const widget = document.getElementById('music-widget');
    const miniPill = document.getElementById('music-mini-pill');
    if (widget) widget.classList.remove('hidden');
    if (miniPill) miniPill.classList.add('hidden');
    if (tab) switchMusicTab(tab);
  }

  function playYouTubeUrl(url, title = '', forceEmbed = false) {
    const parsed = parseYouTubeUrl(url);
    if (!parsed) {
      window.ScheduleAPI?.showToast('Link YouTube chưa đúng định dạng.');
      return false;
    }

    // Stop offline synth so two tracks don't clash
    if (ambientPlaying) stopAmbientAudio();

    openMusicWidget('youtube');

    const inputEl = document.getElementById('input-yt-url');
    if (inputEl) inputEl.value = url;

    const container = document.getElementById('yt-player-container');
    const titleEl = document.getElementById('yt-current-title');
    const extBtn = document.getElementById('btn-open-yt-external');
    const tipEl = document.getElementById('yt-file-protocol-tip');

    const isHttp = window.location.protocol === 'http:' || window.location.protocol === 'https:';
    const originParam = isHttp ? `&origin=${encodeURIComponent(window.location.origin)}` : '';
    const embedSrc = parsed.type === 'playlist'
      ? `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(parsed.id)}&autoplay=1&playsinline=1&enablejsapi=1${originParam}`
      : `https://www.youtube.com/embed/${encodeURIComponent(parsed.id)}?autoplay=1&rel=0&playsinline=1&enablejsapi=1${originParam}${parsed.listId ? `&list=${encodeURIComponent(parsed.listId)}` : ''}`;

    if (container) {
      if (!isHttp && !forceEmbed) {
        const thumbUrl = parsed.type === 'video'
          ? `https://i.ytimg.com/vi/${encodeURIComponent(parsed.id)}/hqdefault.jpg`
          : '';
        container.innerHTML = `
          <div class="relative w-full h-full flex flex-col items-center justify-center p-3 gap-2 text-center bg-stone-950 overflow-hidden">
            ${thumbUrl ? `<img src="${thumbUrl}" alt="YouTube preview" class="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none">` : ''}
            <div class="relative z-10 space-y-2 max-w-[270px]">
              <p class="text-[11px] font-bold text-stone-100 leading-snug">
                Trình duyệt ẩn Referer khi mở trực tiếp <code class="px-1 py-0.5 rounded bg-stone-800 text-amber-300">file://</code> (gây Lỗi 153 trên YouTube).
              </p>
              <div class="flex flex-wrap items-center justify-center gap-1.5">
                <a href="${parsed.watchUrl}" target="_blank" rel="noopener noreferrer" class="btn-cute bg-rose-400 hover:bg-rose-500 text-stone-900 px-2.5 py-1 text-[11px] font-black">Mở YouTube ↗</a>
                <button type="button" id="btn-yt-force-embed" class="px-2 py-1 rounded-lg border border-stone-500 bg-stone-800/90 hover:bg-stone-700 text-stone-200 text-[10px] font-bold">Thử phát tại đây</button>
                <button type="button" id="btn-yt-switch-offline" class="px-2 py-1 rounded-lg border border-emerald-500 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-[10px] font-bold">Nhạc Offline</button>
              </div>
            </div>
          </div>
        `;
        document.getElementById('btn-yt-force-embed')?.addEventListener('click', () => {
          playYouTubeUrl(url, title, true);
        });
        document.getElementById('btn-yt-switch-offline')?.addEventListener('click', () => {
          switchMusicTab('ambient');
        });
      } else {
        container.innerHTML = `<iframe class="w-full h-full" src="${embedSrc}" title="YouTube player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
      }
    }
    if (titleEl) {
      titleEl.textContent = title || (parsed.type === 'playlist' ? 'Playlist YouTube' : `Video (${parsed.id})`);
    }
    if (extBtn) {
      extBtn.href = parsed.watchUrl;
      extBtn.classList.remove('hidden');
    }
    if (tipEl) {
      tipEl.classList.toggle('hidden', isHttp);
    }
    window.ScheduleAPI?.showToast(`Đang mở YouTube: ${title || parsed.id}`);
    return true;
  }

  // --- Pomodoro Timer ---
  const pomo = {
    minutes: 25,
    remainingSec: 25 * 60,
    running: false,
    intervalId: null,
    taskTitle: 'Phiên tập trung tự do'
  };

  function formatMMSS(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updatePomoUI() {
    const display = document.getElementById('pomo-time-display');
    const headerLabel = document.getElementById('header-pomo-label');
    const btnToggle = document.getElementById('btn-pomo-toggle');
    const taskLabel = document.getElementById('pomo-active-task');

    const str = formatMMSS(pomo.remainingSec);
    if (display) display.textContent = str;
    if (headerLabel) headerLabel.textContent = str;
    if (btnToggle) {
      btnToggle.innerHTML = pomo.running
        ? `${skIcon('pause', { size: 13 })}<span>Tạm dừng</span>`
        : `${skIcon('play', { size: 13 })}<span>Bắt đầu</span>`;
    }
    if (taskLabel) {
      taskLabel.textContent = pomo.taskTitle;
    }
    if (pomo.running) {
      document.title = `(${str}) Thời Gian Biểu Tanas`;
    } else {
      document.title = 'Thời Gian Biểu Tanas';
    }
  }

  function stopPomodoroInterval() {
    if (pomo.intervalId) {
      clearInterval(pomo.intervalId);
      pomo.intervalId = null;
    }
    pomo.running = false;
  }

  function startPomodoro(minutes = null, taskTitle = null) {
    if (minutes !== null && !isNaN(minutes)) {
      stopPomodoroInterval();
      pomo.minutes = Number(minutes);
      pomo.remainingSec = pomo.minutes * 60;
    }
    if (taskTitle) {
      pomo.taskTitle = taskTitle;
    }

    const widget = document.getElementById('pomodoro-widget');
    if (widget) widget.classList.remove('hidden');

    if (!pomo.running) {
      pomo.running = true;
      pomo.intervalId = setInterval(() => {
        if (pomo.remainingSec > 0) {
          pomo.remainingSec--;
          updatePomoUI();
        } else {
          stopPomodoroInterval();
          updatePomoUI();
          playGentleChime();
          sendScheduleNotification('Hết phiên Pomodoro!', `Đã hoàn thành ${pomo.minutes} phút cho "${pomo.taskTitle}". Nghỉ ngơi chút nhé!`);
          window.ScheduleAPI?.showToast(`Hoàn thành ${pomo.minutes} phút tập trung!`, 5000);
        }
      }, 1000);
    }
    updatePomoUI();
  }

  function pausePomodoro() {
    stopPomodoroInterval();
    updatePomoUI();
  }

  function syncPomoModeButtons(minutes) {
    const mins = Number(minutes) || 25;
    document.querySelectorAll('.btn-pomo-mode').forEach(b => {
      const active = Number(b.getAttribute('data-minutes')) === mins;
      b.classList.toggle('bg-pink-200', active);
      b.classList.toggle('text-stone-900', active);
      b.classList.toggle('border-stone-800', active);
      b.classList.toggle('bg-stone-100', !active);
      b.classList.toggle('dark:bg-stone-800', !active);
      b.classList.toggle('text-stone-700', !active);
      b.classList.toggle('dark:text-stone-300', !active);
      b.classList.toggle('border-stone-400', !active);
    });
  }

  function resetPomodoro(minutes = pomo.minutes) {
    stopPomodoroInterval();
    pomo.minutes = Number(minutes);
    pomo.remainingSec = pomo.minutes * 60;
    syncPomoModeButtons(pomo.minutes);
    updatePomoUI();
  }

  // --- Notifications & Live Schedule Checker ---
  let notificationsEnabled = localStorage.getItem(NOTIF_STORAGE_KEY) === '1';

  function updateNotificationBellUI() {
    const icon = document.getElementById('icon-notif-bell');
    const btn = document.getElementById('btn-toggle-notifications');
    const iconName = notificationsEnabled ? 'bell' : 'bell-off';
    if (icon) {
      icon.setAttribute('data-sketchy', iconName);
      icon.setAttribute('data-accent', notificationsEnabled ? '#fef08a' : '');
      icon.innerHTML = skIcon(iconName, { size: 16, accent: notificationsEnabled ? '#fef08a' : '' });
    }
    if (btn) {
      btn.classList.toggle('bg-yellow-200', notificationsEnabled);
      btn.classList.toggle('bg-stone-100', !notificationsEnabled);
      btn.title = notificationsEnabled ? 'Đang bật thông báo nhắc lịch' : 'Bật thông báo nhắc lịch';
    }
  }

  function sendScheduleNotification(title, body) {
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch (_) {}
    }
  }

  function parseHHMMToMinutes(hhmm) {
    if (!hhmm || !hhmm.includes(':')) return null;
    const [h, m] = hhmm.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  function checkLiveAndReminders() {
    if (!window.ScheduleAPI) return;
    window.ScheduleAPI.refreshUI();

    const { boards, tasks } = window.ScheduleAPI.getState();
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let notifiedMap = {};
    try {
      const saved = JSON.parse(localStorage.getItem(NOTIFIED_MAP_KEY) || '{}');
      if (saved.date === todayDate) notifiedMap = saved.items || {};
    } catch (_) {}

    let changed = false;
    tasks.forEach(task => {
      if (task.completed || !task.remindMinutes || Number(task.remindMinutes) <= 0) return;
      const board = boards.find(b => b.id === task.boardId);
      // Only remind if board is today (or no day-named boards exist)
      const anyDay = boards.some(b => {
        const lower = (b.title || '').toLowerCase();
        return ['thứ hai', 'thứ 2', 'thứ ba', 'thứ 3', 'thứ tư', 'thứ 4', 'thứ năm', 'thứ 5', 'thứ sáu', 'thứ 6', 'thứ bảy', 'thứ 7', 'chủ nhật'].some(d => lower.includes(d));
      });
      if (anyDay && board && !window.ScheduleAPI.isBoardMatchingDay(board.title)) return;

      const startMins = parseHHMMToMinutes(task.startTime);
      if (startMins === null) return;
      const triggerAt = startMins - Number(task.remindMinutes);

      if (nowMins >= triggerAt && nowMins <= startMins + 1 && !notifiedMap[task.id]) {
        notifiedMap[task.id] = true;
        changed = true;
        playGentleChime();
        const msg = Number(task.remindMinutes) === 1
          ? `Đến giờ: ${task.title} (${task.startTime})`
          : `Sắp tới giờ (${task.startTime}): ${task.title}`;
        window.ScheduleAPI.showToast(`🔔 ${msg}`, 6000);
        sendScheduleNotification('Nhắc Lịch Thời Gian Biểu', msg);
      }
    });

    if (changed) {
      localStorage.setItem(NOTIFIED_MAP_KEY, JSON.stringify({ date: todayDate, items: notifiedMap }));
    }
  }

  // --- AI Assistant Configuration & Tool Calling ---
  const AI_TOOLS = [
    {
      name: 'get_schedule',
      description: 'Lấy thời gian hiện tại và toàn bộ danh sách bảng, công việc, ghi chú hiện có của người dùng.',
      parameters: { type: 'object', properties: {} }
    },
    {
      name: 'add_note_or_task',
      description: 'Thêm một công việc mới hoặc ghi chú nhanh vào thời gian biểu. Dùng khi người dùng muốn ghi chú, thêm lịch học, nhắc việc mới.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Tên công việc hoặc nội dung ghi chú ngắn gọn.' },
          board: { type: 'string', description: 'Tên ngày/bảng, ví dụ: "hôm nay", "ngày mai", "Thứ Hai", "Thứ Ba", "Chủ Nhật"... Mặc định là hôm nay.' },
          startTime: { type: 'string', description: 'Giờ bắt đầu định dạng HH:MM (24h), ví dụ "20:00".' },
          endTime: { type: 'string', description: 'Giờ kết thúc định dạng HH:MM (24h), ví dụ "21:30".' },
          category: { type: 'string', description: 'Một trong: "Học bài", "Công việc", "Thể thao", "Sáng tạo & Chill", "Ăn uống & Nghỉ ngơi", "Mục tiêu quan trọng", "Việc cá nhân".' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Mức độ ưu tiên.' },
          notes: { type: 'string', description: 'Ghi chú chi tiết thêm nếu có.' },
          youtubeUrl: { type: 'string', description: 'Link YouTube đính kèm nếu người dùng cung cấp.' },
          subtasks: { type: 'array', items: { type: 'string' }, description: 'Danh sách các đầu việc con nhỏ bên trong nếu có.' },
          isHabit: { type: 'boolean', description: 'True nếu là thói quen lặp lại.' }
        },
        required: ['title']
      }
    },
    {
      name: 'complete_task',
      description: 'Đánh dấu một công việc trong thời gian biểu là đã hoàn thành.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Từ khóa hoặc tên công việc cần đánh dấu hoàn thành.' }
        },
        required: ['query']
      }
    },
    {
      name: 'control_music',
      description: 'Mở nhạc tập trung offline (Lofi piano, tiếng mưa, sóng biển, quán cà phê), phát một đường link YouTube cụ thể, hoặc tạm dừng nhạc.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['play_ambient', 'play_youtube', 'pause'], description: 'Loại thao tác phát nhạc.' },
          preset: { type: 'string', enum: ['lofi', 'rain', 'ocean', 'focus'], description: 'Thể loại nhạc chill offline (khi action là play_ambient).' },
          youtubeUrl: { type: 'string', description: 'Link YouTube video hoặc playlist (khi action là play_youtube). Có thể dùng link YouTube do user đưa hoặc một kênh radio lofi hợp lệ như https://www.youtube.com/watch?v=jfKfPfyJRdk.' },
          title: { type: 'string', description: 'Tên hiển thị cho video/bản nhạc.' }
        },
        required: ['action']
      }
    },
    {
      name: 'control_pomodoro',
      description: 'Điều khiển đồng hồ đếm ngược tập trung Pomodoro.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['start', 'pause', 'reset'], description: 'Hành động.' },
          minutes: { type: 'number', description: 'Số phút (mặc định 25, nghỉ 5 hoặc 15).' },
          taskTitle: { type: 'string', description: 'Tên việc đang tập trung làm.' }
        },
        required: ['action']
      }
    }
  ];

  let aiConfig = {
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: ''
  };

  let chatMessages = [];
  let currentInteractionId = null;

  function loadAIConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem(AI_STORAGE_KEY) || '{}');
      aiConfig = { ...aiConfig, ...saved };
    } catch (_) {}

    const providerEl = document.getElementById('ai-provider');
    const endpointEl = document.getElementById('ai-endpoint');
    const modelSelEl = document.getElementById('ai-model-select');
    const modelCustomEl = document.getElementById('ai-model-custom');
    const keyEl = document.getElementById('ai-api-key');

    if (providerEl) providerEl.value = aiConfig.provider || 'gemini';
    if (endpointEl) endpointEl.value = aiConfig.endpoint || 'https://api.openai.com/v1/chat/completions';
    if (keyEl) keyEl.value = aiConfig.apiKey || '';

    syncAIProviderUI();

    if (aiConfig.provider === 'openai') {
      if (modelCustomEl) modelCustomEl.value = aiConfig.model || 'gpt-4o-mini';
    } else if (modelSelEl) {
      const exists = Array.from(modelSelEl.options).some(o => o.value === aiConfig.model);
      modelSelEl.value = exists ? aiConfig.model : 'gemini-3.8-flash';
    }
    updateAIBadge();
  }

  function syncAIProviderUI() {
    const provider = document.getElementById('ai-provider')?.value || 'gemini';
    const endpointGroup = document.getElementById('ai-endpoint-group');
    const modelSel = document.getElementById('ai-model-select');
    const modelCustom = document.getElementById('ai-model-custom');
    if (provider === 'openai') {
      if (endpointGroup) endpointGroup.classList.remove('hidden');
      if (modelSel) modelSel.classList.add('hidden');
      if (modelCustom) modelCustom.classList.remove('hidden');
    } else {
      if (endpointGroup) endpointGroup.classList.add('hidden');
      if (modelSel) modelSel.classList.remove('hidden');
      if (modelCustom) modelCustom.classList.add('hidden');
    }
  }

  function updateAIBadge() {
    const badge = document.getElementById('ai-model-badge');
    if (!badge) return;
    if (aiConfig.apiKey) {
      badge.textContent = aiConfig.model || 'Đã kết nối';
      badge.className = 'text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-500';
    } else {
      badge.textContent = 'Chưa gắn Key';
      badge.className = 'text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 border border-amber-500';
    }
  }

  function buildSystemInstruction() {
    const timeInfo = window.ScheduleAPI?.getCurrentTimeInfo() || { date: '', weekday: '', time: '' };
    const stateSnap = window.ScheduleAPI?.getState() || { boards: [], tasks: [] };
    const boardSummary = stateSnap.boards.map(b => b.title).join(', ');
    return [
      'Bạn là Trợ Lý AI thân thiện, thông minh tích hợp trong ứng dụng Thời Gian Biểu Tanas.',
      `Thời điểm hiện tại: ${timeInfo.weekday}, ngày ${timeInfo.date}, lúc ${timeInfo.time}.`,
      `Các bảng hiện có: ${boardSummary}.`,
      'Khả năng của bạn:',
      '- Trò chuyện, lên kế hoạch học tập/làm việc, góp ý sắp xếp thời gian biểu.',
      '- Khi người dùng yêu cầu GHI CHÚ, LÊN LỊCH, THÊM VIỆC hoặc ĐÁNH DẤU XONG: hãy gọi tool `add_note_or_task` hoặc `complete_task` ngay lập tức.',
      '- Khi người dùng yêu cầu MỞ NHẠC, BẬT NHẠC CHILL, TIẾNG MƯA, SÓNG BIỂN hoặc PHÁT YOUTUBE: hãy gọi tool `control_music` (`play_ambient` cho nhạc offline mượt 100%, hoặc `play_youtube` nếu người dùng đưa link YouTube hoặc muốn YouTube).',
      '- Khi người dùng muốn BẬT ĐỒNG HỒ TẬP TRUNG / POMODORO: gọi `control_pomodoro`.',
      '- Trả lời ngắn gọn, tự nhiên bằng tiếng Việt, không bịa thông tin.'
    ].join('\n');
  }

  function executeAITool(name, args = {}) {
    switch (name) {
      case 'get_schedule': {
        const info = window.ScheduleAPI.getCurrentTimeInfo();
        const { boards, tasks } = window.ScheduleAPI.getState();
        return {
          ok: true,
          now: info,
          boards: boards.map(b => ({ id: b.id, title: b.title })),
          tasks: tasks.map(t => ({
            id: t.id,
            board: (boards.find(b => b.id === t.boardId) || {}).title || t.boardId,
            title: t.title,
            startTime: t.startTime,
            endTime: t.endTime,
            completed: t.completed,
            notes: t.notes || ''
          }))
        };
      }
      case 'add_note_or_task': {
        const created = window.ScheduleAPI.createTask(args);
        return {
          ok: true,
          actionLabel: `Đã ghi vào ${created.boardTitle}: "${created.task.title}" (${created.task.startTime} - ${created.task.endTime})`,
          task: created.task
        };
      }
      case 'complete_task': {
        const updated = window.ScheduleAPI.completeTask(args.query);
        if (!updated) {
          return { ok: false, error: `Không tìm thấy việc chưa hoàn thành khớp với "${args.query}"` };
        }
        return {
          ok: true,
          actionLabel: `Đã đánh dấu hoàn thành: "${updated.title}"`,
          taskTitle: updated.title
        };
      }
      case 'control_music': {
        if (args.action === 'pause') {
          stopAmbientAudio();
          return { ok: true, actionLabel: 'Đã tạm dừng nhạc nền' };
        }
        if (args.action === 'play_youtube') {
          const url = args.youtubeUrl || 'https://www.youtube.com/watch?v=jfKfPfyJRdk';
          const ok = playYouTubeUrl(url, args.title || 'YouTube Study');
          return {
            ok,
            actionLabel: ok ? `Đã mở YouTube: ${args.title || url}` : 'Link YouTube không hợp lệ'
          };
        }
        const preset = args.preset || 'lofi';
        openMusicWidget('ambient');
        startAmbientPreset(preset);
        const names = { lofi: 'Lofi Piano', rain: 'Tiếng Mưa Rơi', ocean: 'Sóng Biển', focus: 'Quán Cà Phê' };
        return {
          ok: true,
          actionLabel: `Đang phát nhạc chill: ${names[preset] || preset}`
        };
      }
      case 'control_pomodoro': {
        if (args.action === 'pause') {
          pausePomodoro();
          return { ok: true, actionLabel: 'Đã tạm dừng Pomodoro' };
        }
        if (args.action === 'reset') {
          resetPomodoro(args.minutes || 25);
          return { ok: true, actionLabel: 'Đã đặt lại đồng hồ Pomodoro' };
        }
        const mins = Number(args.minutes) || 25;
        startPomodoro(mins, args.taskTitle || 'Tập trung cùng Trợ Lý AI');
        return { ok: true, actionLabel: `Đang đếm Pomodoro ${mins} phút` };
      }
      default:
        return { ok: false, error: `Tool không hỗ trợ: ${name}` };
    }
  }

  function formatSafeChatText(text) {
    if (!text) return '';
    const escaped = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-stone-200 dark:bg-stone-700 font-mono text-[10px]">$1</code>')
      .replace(/\n/g, '<br>');
  }

  function renderChatMessages() {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;

    if (chatMessages.length === 0) {
      container.innerHTML = `
        <div class="p-3 rounded-2xl border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-900 shadow-sm space-y-1.5">
          <div class="font-black text-indigo-700 dark:text-indigo-300 inline-flex items-center gap-1.5">
            ${skIcon('bot', { size: 16, accent: '#c7d2fe' })}
            <span>Xin chào! Mình là Trợ Lý AI Sổ Tay</span>
          </div>
          <p class="text-stone-600 dark:text-stone-300 leading-relaxed">
            Bạn có thể trò chuyện với mình, hoặc nhờ mình làm nhanh:
          </p>
          <ul class="list-disc pl-4 space-y-0.5 text-stone-600 dark:text-stone-300">
            <li><em>"Ghi giúp mình 20:00 học tiếng Anh hôm nay"</em></li>
            <li><em>"Mở nhạc Lofi chill"</em> hoặc <em>"Bật tiếng mưa rơi"</em></li>
            <li><em>"Mở video YouTube https://..."</em></li>
            <li><em>"Bắt đầu đồng hồ Pomodoro 25 phút"</em></li>
          </ul>
          ${!aiConfig.apiKey ? `
            <div class="pt-1">
              <button type="button" onclick="document.getElementById('ai-settings-panel').classList.remove('hidden')" class="px-2.5 py-1 rounded-xl bg-amber-200 text-stone-900 border border-stone-800 font-black text-[11px] hover:bg-amber-300 transition inline-flex items-center gap-1.5">
                ${skIcon('settings', { size: 13 })}
                <span>Bấm vào đây để gắn API Key (Gemini / OpenAI)</span>
              </button>
            </div>
          ` : ''}
        </div>
      `;
      return;
    }

    container.innerHTML = chatMessages.map(msg => {
      if (msg.role === 'user') {
        return `
          <div class="flex justify-end">
            <div class="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm bg-indigo-500 text-white font-semibold shadow-sm border border-stone-800">
              ${formatSafeChatText(msg.text)}
            </div>
          </div>
        `;
      }
      const actionsHtml = (msg.actions && msg.actions.length > 0)
        ? `<div class="mt-2 flex flex-wrap gap-1">${msg.actions.map(a => `<span class="inline-block px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border border-emerald-400 text-[10px] font-bold">${formatSafeChatText(a)}</span>`).join('')}</div>`
        : '';

      return `
        <div class="flex justify-start">
          <div class="max-w-[90%] px-3 py-2 rounded-2xl rounded-tl-sm bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 border-2 border-stone-800 dark:border-stone-600 shadow-sm">
            <div class="leading-relaxed">${formatSafeChatText(msg.text)}</div>
            ${actionsHtml}
          </div>
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
  }

  async function callGeminiInteractions(userText, actionLabels) {
    const model = aiConfig.model || 'gemini-3.8-flash';
    const tools = AI_TOOLS.map(t => ({
      type: 'function',
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }));

    const callEndpoint = async (payload) => {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': aiConfig.apiKey,
          'Api-Revision': '2026-05-20'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText.slice(0, 220)}`);
      }
      return res.json();
    };

    const sysInstruction = buildSystemInstruction();
    let payload = {
      model,
      system_instruction: sysInstruction,
      input: userText,
      tools,
      store: true
    };
    if (currentInteractionId) {
      payload.previous_interaction_id = currentInteractionId;
    }

    let data = await callEndpoint(payload);
    if (data.id) currentInteractionId = data.id;

    let safetyTurns = 0;
    while (safetyTurns < 5) {
      safetyTurns++;
      const steps = Array.isArray(data.steps) ? data.steps : (Array.isArray(data.outputs) ? data.outputs : []);
      const fnCalls = steps.filter(s => s.type === 'function_call');
      if (fnCalls.length === 0) {
        const textParts = [];
        steps.filter(s => s.type === 'model_output').forEach(s => {
          if (Array.isArray(s.content)) {
            s.content.forEach(c => {
              if (c.type === 'text' && c.text) textParts.push(c.text);
            });
          } else if (typeof s.text === 'string') {
            textParts.push(s.text);
          }
        });
        return textParts.join('\n').trim() || (actionLabels.length ? 'Mình đã thực hiện xong rồi nhé!' : 'Đã nhận!');
      }

      const fnResults = fnCalls.map(fc => {
        const out = executeAITool(fc.name, fc.arguments || {});
        if (out.actionLabel) actionLabels.push(out.actionLabel);
        return {
          type: 'function_result',
          name: fc.name,
          call_id: fc.id,
          result: out
        };
      });

      data = await callEndpoint({
        model,
        system_instruction: sysInstruction,
        previous_interaction_id: data.id || currentInteractionId,
        input: fnResults,
        tools,
        store: true
      });
      if (data.id) currentInteractionId = data.id;
    }
    return 'Đã xử lý xong các thao tác bạn yêu cầu!';
  }

  async function callGeminiClassic(userText, actionLabels) {
    const model = aiConfig.model || 'gemini-3.8-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(aiConfig.apiKey)}`;

    const contents = [
      ...chatMessages.slice(-8, -1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })),
      { role: 'user', parts: [{ text: userText }] }
    ];

    const tools = [{
      functionDeclarations: AI_TOOLS.map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }))
    }];

    for (let turn = 0; turn < 5; turn++) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: buildSystemInstruction() }] },
          contents,
          tools
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText.slice(0, 220)}`);
      }
      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const fnParts = parts.filter(p => p.functionCall);

      if (fnParts.length === 0) {
        return parts.map(p => p.text || '').join('').trim() || 'Mình đã thực hiện xong nhé!';
      }

      contents.push({ role: 'model', parts });
      const responseParts = fnParts.map(fp => {
        const fc = fp.functionCall;
        const out = executeAITool(fc.name, fc.args || {});
        if (out.actionLabel) actionLabels.push(out.actionLabel);
        return {
          functionResponse: {
            name: fc.name,
            response: out
          }
        };
      });
      contents.push({ role: 'function', parts: responseParts });
    }
    return 'Đã thực hiện xong!';
  }

  async function callOpenAICompatible(userText, actionLabels) {
    const endpoint = aiConfig.endpoint || 'https://api.openai.com/v1/chat/completions';
    const model = aiConfig.model || 'gpt-4o-mini';

    const messages = [
      { role: 'system', content: buildSystemInstruction() },
      ...chatMessages.slice(-10, -1).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      })),
      { role: 'user', content: userText }
    ];

    const tools = AI_TOOLS.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    }));

    for (let turn = 0; turn < 5; turn++) {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.apiKey}`
        },
        body: JSON.stringify({ model, messages, tools })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText.slice(0, 220)}`);
      }
      const data = await res.json();
      const msg = data.choices?.[0]?.message;
      if (!msg) throw new Error('Không nhận được phản hồi hợp lệ từ API.');

      const toolCalls = msg.tool_calls || [];
      if (toolCalls.length === 0) {
        return (msg.content || '').trim() || 'Đã xử lý xong!';
      }

      messages.push(msg);
      for (const tc of toolCalls) {
        let parsedArgs = {};
        try {
          parsedArgs = tc.function?.arguments ? JSON.parse(tc.function.arguments) : {};
        } catch (_) {}
        const out = executeAITool(tc.function?.name, parsedArgs);
        if (out.actionLabel) actionLabels.push(out.actionLabel);
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(out)
        });
      }
    }
    return 'Đã xử lý xong!';
  }

  async function handleAISubmit(userText) {
    const cleanText = (userText || '').trim();
    if (!cleanText) return;

    chatMessages.push({ role: 'user', text: cleanText });
    renderChatMessages();

    if (!aiConfig.apiKey) {
      document.getElementById('ai-settings-panel')?.classList.remove('hidden');
      chatMessages.push({
        role: 'assistant',
        text: 'Bạn chưa nhập **API Key**. Vui lòng mở mục **⚙️ Cài đặt** bên trên để dán Gemini API Key (hoặc OpenAI-Compatible Key) trước khi trò chuyện với AI nhé!'
      });
      renderChatMessages();
      return;
    }

    const sendBtn = document.getElementById('btn-ai-send');
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = '...';
    }

    const actionLabels = [];
    try {
      let reply = '';
      if (aiConfig.provider === 'openai') {
        reply = await callOpenAICompatible(cleanText, actionLabels);
      } else if (aiConfig.provider === 'gemini-classic') {
        reply = await callGeminiClassic(cleanText, actionLabels);
      } else {
        try {
          reply = await callGeminiInteractions(cleanText, actionLabels);
        } catch (err) {
          // Graceful fallback to generateContent if custom header or Interactions endpoint fails on file:// CORS
          const msg = String(err.message || '');
          if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('404')) {
            reply = await callGeminiClassic(cleanText, actionLabels);
          } else {
            throw err;
          }
        }
      }
      chatMessages.push({ role: 'assistant', text: reply, actions: actionLabels });
    } catch (error) {
      chatMessages.push({
        role: 'assistant',
        text: `Không gọi được API (${error.message}). Bạn hãy kiểm tra lại API Key, Model hoặc kết nối mạng trong phần ⚙️ Cài đặt nhé!`,
        actions: actionLabels
      });
    } finally {
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Gửi';
      }
      renderChatMessages();
    }
  }

  // --- Event Setup ---
  function getPreferences() {
    const volSlider = document.getElementById('music-volume');
    const volume = volSlider ? Math.max(0, Math.min(100, Number(volSlider.value))) : 45;
    return {
      notificationsEnabled: Boolean(notificationsEnabled),
      ambientPreset: currentAmbientPreset || 'lofi',
      musicVolume: Number.isFinite(volume) ? volume : 45,
      pomoMinutes: Math.max(1, Math.min(180, Number(pomo.minutes) || 25)),
      aiProvider: aiConfig.provider === 'openai' ? 'openai' : 'gemini',
      aiEndpoint: aiConfig.endpoint || 'https://api.openai.com/v1/chat/completions',
      aiModel: aiConfig.model || 'gemini-3.8-flash'
    };
  }

  function persistLocalStudioPrefs() {
    const prefs = getPreferences();
    try {
      localStorage.setItem(STUDIO_PREFS_KEY, JSON.stringify({
        ambientPreset: prefs.ambientPreset,
        musicVolume: prefs.musicVolume,
        pomoMinutes: prefs.pomoMinutes
      }));
    } catch (_) {}
  }

  function loadLocalStudioPrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem(STUDIO_PREFS_KEY) || '{}');
      if (saved && typeof saved === 'object') {
        applyPreferences(saved, true);
      }
    } catch (_) {}
  }

  function applyPreferences(prefs, silent = false) {
    if (!prefs || typeof prefs !== 'object') return false;

    if (typeof prefs.notificationsEnabled === 'boolean') {
      notificationsEnabled = prefs.notificationsEnabled;
      localStorage.setItem(NOTIF_STORAGE_KEY, notificationsEnabled ? '1' : '0');
      updateNotificationBellUI();
    }

    if (typeof prefs.ambientPreset === 'string' && ['lofi', 'rain', 'ocean', 'focus'].includes(prefs.ambientPreset)) {
      currentAmbientPreset = prefs.ambientPreset;
      updateAmbientUI();
    }

    if (typeof prefs.musicVolume === 'number' && Number.isFinite(prefs.musicVolume)) {
      const vol = Math.max(0, Math.min(100, Math.round(prefs.musicVolume)));
      const volSlider = document.getElementById('music-volume');
      if (volSlider) volSlider.value = String(vol);
      if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(vol / 100, audioCtx.currentTime);
      }
    }

    if (typeof prefs.pomoMinutes === 'number' && Number.isFinite(prefs.pomoMinutes) && !pomo.running) {
      const mins = Math.max(1, Math.min(180, Math.round(prefs.pomoMinutes)));
      pomo.minutes = mins;
      pomo.remainingSec = mins * 60;
      syncPomoModeButtons(mins);
      updatePomoUI();
    }

    if (prefs.aiProvider || prefs.aiModel || prefs.aiEndpoint) {
      const provider = prefs.aiProvider === 'openai' ? 'openai' : 'gemini';
      aiConfig = {
        ...aiConfig,
        provider,
        endpoint: typeof prefs.aiEndpoint === 'string' && prefs.aiEndpoint.trim()
          ? prefs.aiEndpoint.trim()
          : (aiConfig.endpoint || 'https://api.openai.com/v1/chat/completions'),
        model: typeof prefs.aiModel === 'string' && prefs.aiModel.trim()
          ? prefs.aiModel.trim()
          : (provider === 'openai' ? 'gpt-4o-mini' : 'gemini-3.8-flash')
      };
      try {
        localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(aiConfig));
      } catch (_) {}
      loadAIConfig();
      renderChatMessages();
    }

    if (!silent) {
      persistLocalStudioPrefs();
    }
    return true;
  }

  function initStudio() {
    // Music widget controls
    const btnMusicHeader = document.getElementById('btn-toggle-music-widget');
    const musicWidget = document.getElementById('music-widget');
    const musicMiniPill = document.getElementById('music-mini-pill');

    btnMusicHeader?.addEventListener('click', () => {
      if (musicWidget?.classList.contains('hidden')) {
        openMusicWidget();
      } else {
        musicWidget?.classList.add('hidden');
      }
    });
    document.getElementById('btn-minimize-music')?.addEventListener('click', () => {
      musicWidget?.classList.add('hidden');
      musicMiniPill?.classList.remove('hidden');
      updateAmbientUI();
    });
    document.getElementById('btn-close-music')?.addEventListener('click', () => {
      musicWidget?.classList.add('hidden');
      musicMiniPill?.classList.add('hidden');
    });
    musicMiniPill?.addEventListener('click', () => openMusicWidget());

    document.querySelectorAll('.btn-music-tab').forEach(btn => {
      btn.addEventListener('click', () => switchMusicTab(btn.getAttribute('data-tab')));
    });

    document.getElementById('btn-play-yt')?.addEventListener('click', () => {
      const url = document.getElementById('input-yt-url')?.value || '';
      playYouTubeUrl(url);
    });
    document.getElementById('input-yt-url')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        playYouTubeUrl(e.target.value);
      }
    });
    document.querySelectorAll('.btn-yt-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        playYouTubeUrl(btn.getAttribute('data-yt-url'), btn.getAttribute('data-yt-title'));
      });
    });

    document.querySelectorAll('.btn-ambient-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        startAmbientPreset(btn.getAttribute('data-preset'));
        persistLocalStudioPrefs();
        window.TanasAuth?.queueRemoteSave();
      });
    });
    document.getElementById('btn-ambient-toggle')?.addEventListener('click', () => {
      if (ambientPlaying) {
        stopAmbientAudio();
      } else {
        startAmbientPreset(currentAmbientPreset);
      }
    });
    const volSlider = document.getElementById('music-volume');
    volSlider?.addEventListener('input', (e) => {
      if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(Number(e.target.value) / 100, audioCtx.currentTime);
      }
    });
    volSlider?.addEventListener('change', () => {
      persistLocalStudioPrefs();
      window.TanasAuth?.queueRemoteSave();
    });

    // Pomodoro widget controls
    const pomoWidget = document.getElementById('pomodoro-widget');
    document.getElementById('btn-toggle-pomo-widget')?.addEventListener('click', () => {
      pomoWidget?.classList.toggle('hidden');
    });
    document.getElementById('btn-close-pomo')?.addEventListener('click', () => {
      pomoWidget?.classList.add('hidden');
    });
    document.querySelectorAll('.btn-pomo-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = Number(btn.getAttribute('data-minutes')) || 25;
        resetPomodoro(mins);
        persistLocalStudioPrefs();
        window.TanasAuth?.queueRemoteSave();
      });
    });
    document.getElementById('btn-pomo-toggle')?.addEventListener('click', () => {
      if (pomo.running) {
        pausePomodoro();
      } else {
        startPomodoro();
      }
    });
    document.getElementById('btn-pomo-reset')?.addEventListener('click', () => resetPomodoro());
    updatePomoUI();

    // Browser Notifications toggle
    updateNotificationBellUI();
    document.getElementById('btn-toggle-notifications')?.addEventListener('click', async () => {
      if (!notificationsEnabled) {
        if ('Notification' in window && Notification.permission === 'default') {
          try {
            await Notification.requestPermission();
          } catch (_) {}
        }
        notificationsEnabled = true;
        localStorage.setItem(NOTIF_STORAGE_KEY, '1');
        playGentleChime();
        window.ScheduleAPI?.showToast('Đã bật nhắc lịch (kèm chuông báo trong ứng dụng)!');
      } else {
        notificationsEnabled = false;
        localStorage.setItem(NOTIF_STORAGE_KEY, '0');
        window.ScheduleAPI?.showToast('Đã tắt thông báo nhắc lịch.');
      }
      updateNotificationBellUI();
      window.TanasAuth?.queueRemoteSave();
    });

    // AI Assistant controls
    const aiPanel = document.getElementById('ai-chat-panel');
    const aiFab = document.getElementById('btn-ai-fab');
    const openAIPanel = () => {
      aiPanel?.classList.remove('hidden');
      aiFab?.classList.add('hidden');
      renderChatMessages();
    };
    const closeAIPanel = () => {
      aiPanel?.classList.add('hidden');
      aiFab?.classList.remove('hidden');
    };

    document.getElementById('btn-toggle-ai-drawer')?.addEventListener('click', () => {
      if (aiPanel?.classList.contains('hidden')) openAIPanel();
      else closeAIPanel();
    });
    aiFab?.addEventListener('click', openAIPanel);
    document.getElementById('btn-ai-close')?.addEventListener('click', closeAIPanel);

    document.getElementById('btn-ai-settings-toggle')?.addEventListener('click', () => {
      document.getElementById('ai-settings-panel')?.classList.toggle('hidden');
    });
    document.getElementById('btn-ai-clear')?.addEventListener('click', () => {
      chatMessages = [];
      currentInteractionId = null;
      renderChatMessages();
    });
    document.getElementById('ai-provider')?.addEventListener('change', syncAIProviderUI);
    document.getElementById('btn-toggle-key-vis')?.addEventListener('click', () => {
      const input = document.getElementById('ai-api-key');
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });
    document.getElementById('btn-save-ai-settings')?.addEventListener('click', () => {
      const provider = document.getElementById('ai-provider')?.value || 'gemini';
      const endpoint = document.getElementById('ai-endpoint')?.value.trim() || 'https://api.openai.com/v1/chat/completions';
      const model = provider === 'openai'
        ? (document.getElementById('ai-model-custom')?.value.trim() || 'gpt-4o-mini')
        : (document.getElementById('ai-model-select')?.value || 'gemini-3.8-flash');
      const apiKey = document.getElementById('ai-api-key')?.value.trim() || '';

      aiConfig = { provider, endpoint, model, apiKey };
      localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(aiConfig));
      currentInteractionId = null;
      updateAIBadge();
      document.getElementById('ai-settings-panel')?.classList.add('hidden');
      renderChatMessages();
      window.TanasAuth?.queueRemoteSave();
      window.ScheduleAPI?.showToast('Đã lưu cài đặt API Trợ Lý AI!');
    });

    document.querySelectorAll('.btn-ai-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        handleAISubmit(prompt);
      });
    });

    document.getElementById('form-ai-chat')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('input-ai-prompt');
      if (!input) return;
      const text = input.value;
      input.value = '';
      handleAISubmit(text);
    });

    loadAIConfig();
    loadLocalStudioPrefs();
    renderChatMessages();
    setupDraggableWindows();
    setupHorizontalDragScroll();

    // Live check loop every 30 seconds
    setInterval(checkLiveAndReminders, 30000);
    setTimeout(checkLiveAndReminders, 1500);
  }

  // --- Draggable Floating Tabs & Modals (.drag-window-handle) ---
  function setupDraggableWindows() {
    let activeDrag = null;

    document.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const handle = e.target.closest('.drag-window-handle');
      if (!handle) return;
      if (e.target.closest('button, a, input, select, textarea, label, [role="button"]')) return;

      const win = handle.closest('.sketch-box');
      if (!win || win.offsetWidth === 0) return;

      const rect = win.getBoundingClientRect();
      activeDrag = {
        win,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        origLeft: rect.left,
        origTop: rect.top,
        width: rect.width,
        moved: false
      };
      e.preventDefault();
    });

    document.addEventListener('pointermove', (e) => {
      if (!activeDrag) return;
      const dx = e.clientX - activeDrag.startX;
      const dy = e.clientY - activeDrag.startY;
      if (!activeDrag.moved && Math.hypot(dx, dy) < 3) return;

      if (!activeDrag.moved) {
        activeDrag.moved = true;
        const { win, origLeft, origTop, width } = activeDrag;
        win.style.position = 'fixed';
        win.style.left = `${origLeft}px`;
        win.style.top = `${origTop}px`;
        win.style.right = 'auto';
        win.style.bottom = 'auto';
        win.style.width = `${width}px`;
        win.style.transform = 'none';
        win.style.margin = '0';
        win.classList.add('is-window-dragging');
      }

      const maxLeft = Math.max(8, window.innerWidth - activeDrag.width - 8);
      const maxTop = Math.max(10, window.innerHeight - 52);
      const nextLeft = Math.min(Math.max(8, activeDrag.origLeft + dx), maxLeft);
      const nextTop = Math.min(Math.max(10, activeDrag.origTop + dy), maxTop);

      activeDrag.win.style.left = `${nextLeft}px`;
      activeDrag.win.style.top = `${nextTop}px`;
    });

    const endDrag = () => {
      if (!activeDrag) return;
      activeDrag.win.classList.remove('is-window-dragging');
      activeDrag = null;
    };
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', endDrag);

    // Double-click title bar to snap floating panel or modal back to its default position
    document.addEventListener('dblclick', (e) => {
      const handle = e.target.closest('.drag-window-handle');
      if (!handle || e.target.closest('button, a, input, select')) return;
      const win = handle.closest('.sketch-box');
      if (!win) return;
      win.style.position = '';
      win.style.left = '';
      win.style.top = '';
      win.style.right = '';
      win.style.bottom = '';
      win.style.width = '';
      win.style.transform = '';
      win.style.margin = '';
      win.classList.remove('is-window-dragging');
    });
  }

  // --- Horizontal Drag-to-Scroll for Boards & Pill Strips (.drag-scroll-x) ---
  function setupHorizontalDragScroll() {
    let panState = null;

    document.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      if (e.button !== 0) return;
      const container = e.target.closest('.drag-scroll-x');
      if (!container) return;
      if (container.scrollWidth <= container.clientWidth + 2) return;
      if (e.target.closest('input, textarea, select, [draggable="true"], .drag-window-handle')) return;

      panState = {
        container,
        startX: e.clientX,
        startScrollLeft: container.scrollLeft,
        isPanning: false
      };
    });

    document.addEventListener('pointermove', (e) => {
      if (!panState) return;
      const dx = e.clientX - panState.startX;
      if (!panState.isPanning && Math.abs(dx) < 6) return;

      if (!panState.isPanning) {
        panState.isPanning = true;
        panState.container.classList.add('dragging-scroll');
      }
      panState.container.scrollLeft = panState.startScrollLeft - dx;
    });

    const endPan = () => {
      if (!panState) return;
      const wasPanning = panState.isPanning;
      panState.container.classList.remove('dragging-scroll');
      panState = null;

      if (wasPanning) {
        const blockClick = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        document.addEventListener('click', blockClick, { capture: true, once: true });
        setTimeout(() => document.removeEventListener('click', blockClick, { capture: true }), 80);
      }
    };
    document.addEventListener('pointerup', endPan);
    document.addEventListener('pointercancel', endPan);
  }

  // Expose public studio hooks
  window.StudioModules = {
    playYouTubeUrl,
    startAmbientPreset,
    stopAmbientAudio,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    playGentleChime,
    getPreferences,
    applyPreferences
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudio);
  } else {
    initStudio();
  }
})();
