/**
 * Thời Gian Biểu Tanas - Mobile & Desktop App
 * Fully responsive, local & backend synced, hand-drawn sketch UI
 */

// --- Default Data with Hand-drawn Crayon Themes ---
const DEFAULT_BOARDS = [
  { id: 'b_t2', title: 'Thứ Hai', color: '#f472b6', tape: 'pink' },
  { id: 'b_t3', title: 'Thứ Ba', color: '#38bdf8', tape: 'blue' },
  { id: 'b_t4', title: 'Thứ Tư', color: '#4ade80', tape: 'mint' },
  { id: 'b_t5', title: 'Thứ Năm', color: '#fb923c', tape: 'yellow' },
  { id: 'b_t6', title: 'Thứ Sáu', color: '#c084fc', tape: 'purple' },
  { id: 'b_t7', title: 'Thứ Bảy', color: '#facc15', tape: 'yellow' },
  { id: 'b_cn', title: 'Chủ Nhật', color: '#fb7185', tape: 'pink' }
];

const DEFAULT_TASKS = [
  {
    id: 't_1',
    boardId: 'b_t2',
    title: 'Chạy bộ hít thở & Ăn sáng',
    startTime: '06:30',
    endTime: '07:30',
    category: 'Thể thao',
    priority: 'medium',
    notes: 'Uống 1 ly nước ấm và chạy bộ 20 phút',
    iconUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg_PL8lWSThinrawZuWcdV2ilNosCpbdNIzLGRHBzoE3ZXjTgy0fZp7FdhmXbA-2LIodXekar4d_qiwEJC88eXMy9FO5peZZwDuorLCXdBkMqIjI0kFjzej2uXMhDmDe2YPzjdjMbKM6Rk/s400/taiiku_white_girl.png',
    completed: true,
    createdAt: Date.now() - 100000
  },
  {
    id: 't_2',
    boardId: 'b_t2',
    title: 'Học Lập trình Web & Thiết kế giao diện',
    startTime: '08:00',
    endTime: '11:30',
    category: 'Học bài',
    priority: 'high',
    notes: 'Làm bài tập thiết kế tỷ lệ màn hình điện thoại & máy tính',
    iconUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgWDyVXzkfaHdxf6NeqW9JslA_vAcV0Gbj8HHlyZHfE2ivuA-Avf53lJMOiCzi6f8ieBrthqBIluXZTHg7yKOLgn7Op_GmHaZSCh8sLDiTdrfQeLO1adBz304VZT8JZP7qRos9Y_2E-MeeO/s400/computer_sagyouin_man.png',
    completed: false,
    createdAt: Date.now() - 80000
  },
  {
    id: 't_3',
    boardId: 'b_t2',
    title: 'Họp nhóm triển khai ý tưởng mới',
    startTime: '14:00',
    endTime: '15:30',
    category: 'Công việc',
    priority: 'high',
    notes: 'Thảo luận cùng đồng đội qua Google Meet',
    iconUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEicH8KK_hg1llbPHwlkZx9RzBvnAUiPoF7D7rfa8-tX3Z40vhNWpOs2vdbDSuIx7PHB7OCgXbBbfUN_8fqb5-nU34SXi7JD77ehPn-CHXx6WEsg7f6wz91TlXFfse9Slk4DjZJWKFsOzjF5/s400/computer01_smile.png',
    completed: false,
    createdAt: Date.now() - 60000
  },
  {
    id: 't_4',
    boardId: 'b_t3',
    title: 'Học Tiếng Anh - Luyện nghe Podcast',
    startTime: '08:30',
    endTime: '10:00',
    category: 'Học bài',
    priority: 'medium',
    notes: 'Ghi chép 10 từ vựng mới vào sổ tay nhỏ',
    iconUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj9pKYM8bAN7s9UwKcoy25wh-Meq6dmvRHRXwrc9F_pKZbyV-qUS6lGrcBkEx1MGfI8fjZte6O0mN2SCNajBWty2NeGdm1KF41ncXDkZjGsNJ5-5OUahQwwjr0Cj1W0oP0ElhbnY-hzSMg/s400/animal_study_usagi.png',
    completed: false,
    createdAt: Date.now() - 50000
  },
  {
    id: 't_5',
    boardId: 'b_t3',
    title: 'Vẽ sketch & Thiết kế icon',
    startTime: '14:30',
    endTime: '16:30',
    category: 'Sáng tạo & Chill',
    priority: 'high',
    notes: 'Tô màu pastel bằng bút chì sáp',
    iconUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhtmqRuPPIyDuSB-omEwUO9H_Gq30rlnPFGjYjKbmvkKlOURLIXYUn983MdXhBDLi9O1_4bK6HrFmRt0XCjhnbddVtBIcnAfv-AxuobSfmIj2TEfYeyZWJk88DNSXEPaleHIVtt8cJIpxH_k3h9GVSfRt54crTnwFj63R2j5YS2ESbQHTUPGL39y8IXVw/s400/eto_usagi_daruma.png',
    completed: false,
    createdAt: Date.now() - 40000
  },
  {
    id: 't_6',
    boardId: 'b_t4',
    title: 'Đọc truyện & Nghe nhạc Lofi thư giãn',
    startTime: '20:30',
    endTime: '21:30',
    category: 'Ăn uống & Nghỉ ngơi',
    priority: 'low',
    notes: 'Pha một tách trà hoa cúc ấm áp',
    iconUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfjPQm_tclIdceOn0RImVyQTOH9i4HdNNH5zrzwlCiNakrzCCczse7klkAbTl4zuZ12GhUL3ERtxNLLK9e8SUqTVmMkaUL9f2EP1mRGT6QNAV3ueUtrgsPZ276_2Jgl6kUaOQtgqn8et6g/s400/dokusyo_aki_man.png',
    completed: false,
    createdAt: Date.now() - 30000
  }
];

// --- Templates ---
const TEMPLATES = {
  weekly: {
    boards: [
      { id: 'b_t2', title: 'Thứ Hai', color: '#f472b6', tape: 'pink' },
      { id: 'b_t3', title: 'Thứ Ba', color: '#38bdf8', tape: 'blue' },
      { id: 'b_t4', title: 'Thứ Tư', color: '#4ade80', tape: 'mint' },
      { id: 'b_t5', title: 'Thứ Năm', color: '#fb923c', tape: 'yellow' },
      { id: 'b_t6', title: 'Thứ Sáu', color: '#c084fc', tape: 'purple' },
      { id: 'b_t7', title: 'Thứ Bảy', color: '#facc15', tape: 'yellow' },
      { id: 'b_cn', title: 'Chủ Nhật', color: '#fb7185', tape: 'pink' }
    ],
    tasks: DEFAULT_TASKS
  },
  dayparts: {
    boards: [
      { id: 'b_sang', title: 'Buổi Sáng', color: '#f59e0b', tape: 'yellow' },
      { id: 'b_trua', title: 'Buổi Trưa', color: '#10b981', tape: 'mint' },
      { id: 'b_chieu', title: 'Buổi Chiều', color: '#0284c7', tape: 'blue' },
      { id: 'b_toi', title: 'Buổi Tối', color: '#a855f7', tape: 'purple' }
    ],
    tasks: [
      {
        id: 'dp_1',
        boardId: 'b_sang',
        title: 'Chạy bộ 25 phút & Tắm rửa',
        startTime: '06:30',
        endTime: '07:30',
        category: 'Thể thao',
        priority: 'medium',
        notes: '',
        iconUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg_PL8lWSThinrawZuWcdV2ilNosCpbdNIzLGRHBzoE3ZXjTgy0fZp7FdhmXbA-2LIodXekar4d_qiwEJC88eXMy9FO5peZZwDuorLCXdBkMqIjI0kFjzej2uXMhDmDe2YPzjdjMbKM6Rk/s400/taiiku_white_girl.png',
        completed: false,
        createdAt: Date.now()
      },
      {
        id: 'dp_2',
        boardId: 'b_sang',
        title: 'Học tập sâu & Xử lý bài vở khó nhất',
        startTime: '08:30',
        endTime: '11:30',
        category: 'Học bài',
        priority: 'high',
        notes: '',
        iconUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj9pKYM8bAN7s9UwKcoy25wh-Meq6dmvRHRXwrc9F_pKZbyV-qUS6lGrcBkEx1MGfI8fjZte6O0mN2SCNajBWty2NeGdm1KF41ncXDkZjGsNJ5-5OUahQwwjr0Cj1W0oP0ElhbnY-hzSMg/s400/animal_study_usagi.png',
        completed: false,
        createdAt: Date.now()
      },
      {
        id: 'dp_3',
        boardId: 'b_trua',
        title: 'Ăn trưa & Chợp mắt 20 phút',
        startTime: '12:00',
        endTime: '13:00',
        category: 'Ăn uống & Nghỉ ngơi',
        priority: 'low',
        notes: '',
        iconUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgNYb8_90UwsnC-IkWACgv4Er302m9Fp9_1iKEyXMTEmq5fpftwJTg4gmCwFO4ASkj4LoEAor7vwnD-kJzmkq8dHaI3ktvWrU9d59Blf_F37ehxPvFKddW6cKG257ClpwhAhWC0fvR2rTIa/s400/food_obentou.png',
        completed: false,
        createdAt: Date.now()
      },
      {
        id: 'dp_4',
        boardId: 'b_chieu',
        title: 'Xử lý công việc & Hoàn thiện bài tập',
        startTime: '14:00',
        endTime: '17:00',
        category: 'Công việc',
        priority: 'medium',
        notes: '',
        iconUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgWDyVXzkfaHdxf6NeqW9JslA_vAcV0Gbj8HHlyZHfE2ivuA-Avf53lJMOiCzi6f8ieBrthqBIluXZTHg7yKOLgn7Op_GmHaZSCh8sLDiTdrfQeLO1adBz304VZT8JZP7qRos9Y_2E-MeeO/s400/computer_sagyouin_man.png',
        completed: false,
        createdAt: Date.now()
      },
      {
        id: 'dp_5',
        boardId: 'b_toi',
        title: 'Ăn tối cùng gia đình & Đọc sách',
        startTime: '19:00',
        endTime: '21:30',
        category: 'Mục tiêu quan trọng',
        priority: 'low',
        notes: 'Đọc 15 trang sách trước khi ngủ',
        iconUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfjPQm_tclIdceOn0RImVyQTOH9i4HdNNH5zrzwlCiNakrzCCczse7klkAbTl4zuZ12GhUL3ERtxNLLK9e8SUqTVmMkaUL9f2EP1mRGT6QNAV3ueUtrgsPZ276_2Jgl6kUaOQtgqn8et6g/s400/dokusyo_aki_man.png',
        completed: false,
        createdAt: Date.now()
      }
    ]
  },
  categories: {
    boards: [
      { id: 'c_hoc', title: 'Học Bài', color: '#f472b6', tape: 'pink' },
      { id: 'c_work', title: 'Công Việc', color: '#38bdf8', tape: 'blue' },
      { id: 'c_life', title: 'Thể Thao & Sức Khỏe', color: '#4ade80', tape: 'mint' },
      { id: 'c_chill', title: 'Sở Thích & Nghỉ Ngơi', color: '#fb923c', tape: 'yellow' }
    ],
    tasks: [
      {
        id: 'cg_1',
        boardId: 'c_hoc',
        title: 'Ôn bài thi & Làm đề cương',
        startTime: '08:00',
        endTime: '10:30',
        category: 'Học bài',
        priority: 'high',
        notes: 'Ghi chú các ý quan trọng',
        iconUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj9pKYM8bAN7s9UwKcoy25wh-Meq6dmvRHRXwrc9F_pKZbyV-qUS6lGrcBkEx1MGfI8fjZte6O0mN2SCNajBWty2NeGdm1KF41ncXDkZjGsNJ5-5OUahQwwjr0Cj1W0oP0ElhbnY-hzSMg/s400/animal_study_usagi.png',
        completed: false,
        createdAt: Date.now()
      },
      {
        id: 'cg_2',
        boardId: 'c_chill',
        title: 'Tập đàn hoặc vẽ tranh',
        startTime: '16:00',
        endTime: '17:30',
        category: 'Sáng tạo & Chill',
        priority: 'low',
        notes: '',
        iconUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhtmqRuPPIyDuSB-omEwUO9H_Gq30rlnPFGjYjKbmvkKlOURLIXYUn983MdXhBDLi9O1_4bK6HrFmRt0XCjhnbddVtBIcnAfv-AxuobSfmIj2TEfYeyZWJk88DNSXEPaleHIVtt8cJIpxH_k3h9GVSfRt54crTnwFj63R2j5YS2ESbQHTUPGL39y8IXVw/s400/eto_usagi_daruma.png',
        completed: true,
        createdAt: Date.now()
      }
    ]
  }
};

// --- Application State ---
let state = {
  boards: [],
  tasks: [],
  deviceMode: 'desktop', // 'auto', 'desktop', 'tablet', 'mobile'
  layout: 'columns',     // 'columns', 'grid'
  filterStatus: 'all',   // 'all', 'pending', 'completed'
  searchQuery: '',
  activeMobileBoardId: null,
  draggedTaskId: null
};

let modalSubtasks = [];

// --- Poster 1-Image Export Configuration ---
let posterConfig = {
  format: 'mobile', // 'mobile', 'desktop', 'poster'
  bg: '#fffdf7',
  border: '#f472b6',
  theme: 'light'
};

// --- LocalStorage Keys ---
const LS_KEYS = {
  BOARDS: 'schedule_app_boards_cute_v2',
  TASKS: 'schedule_app_tasks_cute_v2',
  THEME: 'schedule_app_theme_cute_v2',
  MODE: 'schedule_app_mode_cute_v2',
  LAYOUT: 'schedule_app_layout_v1',
  STREAK: 'schedule_app_streak_v1',
  NOTIF: 'schedule_app_notif_v1',
  DATA_OWNER: 'tanas_data_owner_id'
};

const TAPE_CLASSES = ['pink', 'mint', 'blue', 'purple', 'yellow'];

const DAY_ALIASES = [
  ['chủ nhật', 'cn'],
  ['thứ hai', 'thứ 2', 't2'],
  ['thứ ba', 'thứ 3', 't3'],
  ['thứ tư', 'thứ 4', 't4'],
  ['thứ năm', 'thứ 5', 't5'],
  ['thứ sáu', 'thứ 6', 't6'],
  ['thứ bảy', 'thứ 7', 't7']
];

function getTodayAliases(dayIdx = new Date().getDay()) {
  return DAY_ALIASES[dayIdx] || [];
}

function isBoardMatchingDay(boardTitle, dayIdx = new Date().getDay()) {
  if (!boardTitle) return false;
  const lower = boardTitle.toLowerCase();
  return getTodayAliases(dayIdx).some(alias => lower.includes(alias));
}

function hasAnyDayNamedBoard() {
  return state.boards.some(b => {
    const lower = (b.title || '').toLowerCase();
    return DAY_ALIASES.some(group => group.some(alias => lower.includes(alias)));
  });
}

function getCurrentHHMM() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function isTaskLiveNow(task, board) {
  if (!task || task.completed || !task.startTime || !task.endTime) return false;
  if (hasAnyDayNamedBoard() && board && !isBoardMatchingDay(board.title)) return false;
  const nowStr = getCurrentHHMM();
  return nowStr >= task.startTime && nowStr <= task.endTime;
}

// --- Cute Irasutoya Stickers Collection (https://www.irasutoya.com/) ---
const IRASUTOYA_ICONS = [
  {
    id: 'ira_study_usagi',
    name: 'Thỏ Học Bài Chăm Chỉ',
    cat: 'study',
    emoji: '🐰',
    desc: 'Học bài, làm bài tập',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj9pKYM8bAN7s9UwKcoy25wh-Meq6dmvRHRXwrc9F_pKZbyV-qUS6lGrcBkEx1MGfI8fjZte6O0mN2SCNajBWty2NeGdm1KF41ncXDkZjGsNJ5-5OUahQwwjr0Cj1W0oP0ElhbnY-hzSMg/s400/animal_study_usagi.png'
  },
  {
    id: 'ira_cat_study',
    name: 'Mèo Ôn Thi Đeo Kính',
    cat: 'study',
    emoji: '🐱',
    desc: 'Tập trung ôn luyện',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj72XC7BDxBcvN8ukOQFdnubPQxgEdxg7BYJAcHpIIXKQJahBhuJFzY3-gWOEWr7RLJsqHifHNKKyDMT6tFw1Jw1TLcJ8a4ZGXCwbAqHBHQq_91QLGT-DAgZtabix0cztyJGJngTSQiLlJD/s400/cat_study.png'
  },
  {
    id: 'ira_study_girl',
    name: 'Nữ Sinh Học Bài',
    cat: 'study',
    emoji: '👧',
    desc: 'Giờ học trên lớp / Tự học',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh5_OXuUbfE-xfQW7u6vWx2DMnjQmBJsqegM2CCNrIwA7WJcsIhBFbNy5fGrG391NNyt48cnNLixnbYmMq-GV2FTEmZ7F5nmXMXtDNw_fPUHHNiOyq30vkgu_gU8n6p5vkCFrz8xa2dhSDa/s400/study_school_jugyou_woman.png'
  },
  {
    id: 'ira_study_boy',
    name: 'Nam Sinh Học Bài',
    cat: 'study',
    emoji: '👦',
    desc: 'Giờ học chăm chú',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjPNTcbjtbSny8wwKPkdap6-W1zbnThxWfTKvO3SVswsh_3B-4-HDO4UzxXjgmaqD8cEwkPscG9M5kgmTLV53dcLA4pPWO7MmM4asf57vu5JRrcxMwm1-MeBC8C5ux0hQF-B34Q0jnFzFE8/s400/study_school_jugyou_man.png'
  },
  {
    id: 'ira_reading_autumn',
    name: 'Đọc Sách Thư Thái',
    cat: 'study',
    emoji: '📖',
    desc: 'Đọc sách, nghiên cứu',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfjPQm_tclIdceOn0RImVyQTOH9i4HdNNH5zrzwlCiNakrzCCczse7klkAbTl4zuZ12GhUL3ERtxNLLK9e8SUqTVmMkaUL9f2EP1mRGT6QNAV3ueUtrgsPZ276_2Jgl6kUaOQtgqn8et6g/s400/dokusyo_aki_man.png'
  },
  {
    id: 'ira_exam_pass',
    name: 'Đỗ Kỳ Thi Xuất Sắc',
    cat: 'study',
    emoji: '💮',
    desc: 'Giấy chứng nhận đậu kỳ thi',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgZ9gnQkQJo1KPLwbUah_O-bwka6O75RDJoARGSSmG7x3f3E3CK1ZTWEK_bMtX80vKmNd0df6ooxoeSUH4rmLGsCHYPTkhxeIxFBVFut1VvIBxlpRmKqT-dSz4xNmIpCp8xtxpK88Ky1Spl/s400/document_shinsa_goukaku.png'
  },
  {
    id: 'ira_laptop_smile',
    name: 'Laptop Cười',
    cat: 'work',
    emoji: '💻',
    desc: 'Làm việc trên máy tính',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEicH8KK_hg1llbPHwlkZx9RzBvnAUiPoF7D7rfa8-tX3Z40vhNWpOs2vdbDSuIx7PHB7OCgXbBbfUN_8fqb5-nU34SXi7JD77ehPn-CHXx6WEsg7f6wz91TlXFfse9Slk4DjZJWKFsOzjF5/s400/computer01_smile.png'
  },
  {
    id: 'ira_computer_worker',
    name: 'Lập Trình & Đồ Họa',
    cat: 'work',
    emoji: '👨‍💻',
    desc: 'Thiết kế, code dự án',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgWDyVXzkfaHdxf6NeqW9JslA_vAcV0Gbj8HHlyZHfE2ivuA-Avf53lJMOiCzi6f8ieBrthqBIluXZTHg7yKOLgn7Op_GmHaZSCh8sLDiTdrfQeLO1adBz304VZT8JZP7qRos9Y_2E-MeeO/s400/computer_sagyouin_man.png'
  },
  {
    id: 'ira_alarm_clock',
    name: 'Đồng Hồ Báo Thức Reo',
    cat: 'work',
    emoji: '⏰',
    desc: 'Dậy đúng giờ, hẹn giờ',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg7n3eo5afHIEY5lJBrgrG2KShtlYRLu0oJRs4v9QAvm5-h_lXAOFrlf1_hhQXC0C1i190rjqE0cRhp_FE9EszZwxg8DFQR5znd8Xw44G09z1w6P8_CD05IiP3odR5nixYgeBnMa3vrMRw/s400/character_mezamashidokei.png'
  },
  {
    id: 'ira_usagi_banzai',
    name: 'Thỏ Banzai Ăn Mừng',
    cat: 'animal',
    emoji: '🎉',
    desc: 'Hoàn thành việc, chúc mừng',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEil4F0c37zeO32I97NAb9K97bmwY0JzXpv2R2kgcbyrWDHKpV07LE1NFuRaQ_e0wRdUIZzG3kdVubrlWeCh4R8J_DwhtgTr_ulwsdyT2-0lmqyXR8sPx4G5uYrndslL_Hxmr0RX96mlgkqDVV4Y_8miWzXaz5gd2ePAwwgP7uKzcggdAw0I64lVQ6oOXQ/s400/eto_usagi_banzai.png'
  },
  {
    id: 'ira_usagi_daruma',
    name: 'Thỏ Daruma May Mắn',
    cat: 'animal',
    emoji: '🍀',
    desc: 'May mắn, quyết tâm',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhtmqRuPPIyDuSB-omEwUO9H_Gq30rlnPFGjYjKbmvkKlOURLIXYUn983MdXhBDLi9O1_4bK6HrFmRt0XCjhnbddVtBIcnAfv-AxuobSfmIj2TEfYeyZWJk88DNSXEPaleHIVtt8cJIpxH_k3h9GVSfRt54crTnwFj63R2j5YS2ESbQHTUPGL39y8IXVw/s400/eto_usagi_daruma.png'
  },
  {
    id: 'ira_shirokuma_ice',
    name: 'Gấu Kem Tuyết Shirokuma',
    cat: 'animal',
    emoji: '🍧',
    desc: 'Mát lạnh, thư thái',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEggQai94vm15S7EJWZ-uPGh0QIryDGjrYOzD_GDSHD-PUbQOgY3jx3wcxghFb38Rx2JbQ8HXMmlY1a494AHr5ybYaZBb-2Lzx9wU862HU_J2GdhLcw9BbK6TFhIzzofh2QMug60svOH0TUN/s800/kakigoori_shirokuma.png'
  },
  {
    id: 'ira_exercise_girl',
    name: 'Tập Thể Dục Năng Động',
    cat: 'fitness',
    emoji: '🏃',
    desc: 'Chạy bộ, giữ dáng',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg_PL8lWSThinrawZuWcdV2ilNosCpbdNIzLGRHBzoE3ZXjTgy0fZp7FdhmXbA-2LIodXekar4d_qiwEJC88eXMy9FO5peZZwDuorLCXdBkMqIjI0kFjzej2uXMhDmDe2YPzjdjMbKM6Rk/s400/taiiku_white_girl.png'
  },
  {
    id: 'ira_bento_box',
    name: 'Hộp Cơm Bento Nhật Bản',
    cat: 'chill',
    emoji: '🍱',
    desc: 'Ăn trưa, nạp năng lượng',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgNYb8_90UwsnC-IkWACgv4Er302m9Fp9_1iKEyXMTEmq5fpftwJTg4gmCwFO4ASkj4LoEAor7vwnD-kJzmkq8dHaI3ktvWrU9d59Blf_F37ehxPvFKddW6cKG257ClpwhAhWC0fvR2rTIa/s400/food_obentou.png'
  },
  {
    id: 'ira_coffee_relax',
    name: 'Thưởng Thức Cà Phê Chill',
    cat: 'chill',
    emoji: '☕',
    desc: 'Nghỉ ngơi, giải lao',
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg7VbK6ANRPdqvJ9p61g92fVTzuhKQ8kMRpAvPBI-TdwT9FLClDyA5b_8vhnlNXeCdUo_MJwob3MZp8lPXzA3vPS3Rl7CiIy2RMOhmGx-Urk64dmLqsn9ZnU5zcghvOz-iZPHQe_NxfWgyr/s400/figure_cafe.png'
  }
];

// --- Dashboard Icons & Cute Emojis Collection (Connected with MCP) ---
const DASHBOARD_ICONS = [
  { id: 'notion', name: 'Notion', cat: 'study', emoji: '📝', desc: 'Ghi chú & học tập', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/notion.svg' },
  { id: 'obsidian', name: 'Obsidian', cat: 'study', emoji: '💎', desc: 'Sổ tay tri thức', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/obsidian.svg' },
  { id: 'duolingo', name: 'Duolingo', cat: 'study', emoji: '🦉', desc: 'Học ngoại ngữ', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/duolingo.svg' },
  { id: 'booko', name: 'Đọc Sách (Book)', cat: 'study', emoji: '📚', desc: 'Đọc & tra cứu', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/booko.svg' },
  { id: 'todoist', name: 'Todoist', cat: 'work', emoji: '✅', desc: 'Quản lý việc cần làm', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/todoist.svg' },
  { id: 'figma', name: 'Figma', cat: 'work', emoji: '🎨', desc: 'Thiết kế giao diện', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/figma.svg' },
  { id: 'canva', name: 'Canva', cat: 'work', emoji: '🖌️', desc: 'Thiết kế poster/ảnh', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/canva.png' },
  { id: 'github', name: 'GitHub Code', cat: 'work', emoji: '💻', desc: 'Lập trình dự án', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/github.svg' },
  { id: 'calendar', name: 'Lịch Biểu', cat: 'work', emoji: '📅', desc: 'Thời khóa biểu', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/p-cal.svg' },
  { id: 'spotify', name: 'Spotify Music', cat: 'chill', emoji: '🎧', desc: 'Nghe nhạc chill', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/spotify.svg' },
  { id: 'music', name: 'Âm Nhạc', cat: 'chill', emoji: '🎵', desc: 'Nhạc thư giãn', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/music.svg' },
  { id: 'youtube', name: 'YouTube Video', cat: 'chill', emoji: '▶️', desc: 'Xem video giải trí', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/youtube.svg' },
  { id: 'discord', name: 'Discord', cat: 'work', emoji: '💬', desc: 'Tán gẫu bạn bè', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/discord.svg' },
  { id: 'gameyfin', name: 'Chơi Game', cat: 'chill', emoji: '🎮', desc: 'Giải tỏa căng thẳng', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/gameyfin.png' },
  { id: 'sparkyfitness', name: 'Tập Gym / Thể Thao', cat: 'fitness', emoji: '🏋️', desc: 'Rèn luyện sức khỏe', url: 'https://cdn.jsdelivr.net/gh/selfhst/icons/png/sparkyfitness.png' },
  { id: 'health', name: 'Chạy Bộ & Yoga', cat: 'fitness', emoji: '🏃', desc: 'Vận động giữ dáng', url: 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/wger.svg' },
  { id: 'coffee', name: 'Cà Phê Sáng', cat: 'chill', emoji: '☕', desc: 'Tỉnh táo ngày mới', url: 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/buy-me-a-coffee.svg' },
  { id: 'tea', name: 'Trà Chiều & Bánh', cat: 'chill', emoji: '🍵', desc: 'Thưởng trà thư giãn', url: 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/mealie.svg' },
  { id: 'artix', name: 'Vẽ Vời & Tranh', cat: 'work', emoji: '🎨', desc: 'Hội họa sáng tạo', url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/artix.png' },
  { id: 'weather', name: 'Thời Tiết Nắng Đẹp', cat: 'chill', emoji: '☀️', desc: 'Hít thở khí trời', url: 'https://cdn.jsdelivr.net/gh/selfhst/icons/png/weatherstar-4000-plus.png' }
];

let activeIconSource = 'irasutoya';
let activeIconCategory = 'all';
let iconSearchQuery = '';

function sketchyHtml(name, opts = {}) {
  if (window.Sketchy && typeof window.Sketchy.icon === 'function') {
    return window.Sketchy.icon(name, opts);
  }
  return '';
}

function hydrateSketchy(root = document) {
  if (window.Sketchy && typeof window.Sketchy.hydrate === 'function') {
    window.Sketchy.hydrate(root);
  }
}

function resetModalDragPositions(modalEl) {
  const box = modalEl ? modalEl.querySelector('.sketch-box') : null;
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

let diskSyncReady = false;
let diskSaveTimer = null;

function encodeSyncPayload(obj) {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeSyncPayload(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}

function isLocalHttpOrigin() {
  return window.location.protocol === 'http:' &&
    (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');
}

function isUsingDefaultSampleOnly() {
  if (!Array.isArray(state.tasks) || state.tasks.length !== DEFAULT_TASKS.length) return false;
  if (!Array.isArray(state.boards) || state.boards.length !== DEFAULT_BOARDS.length) return false;
  return state.tasks.every((t, i) => t.id === DEFAULT_TASKS[i].id && t.title === DEFAULT_TASKS[i].title);
}

function handleIncomingUrlSync() {
  const hash = window.location.hash || '';
  if (!hash.startsWith('#sync=')) return false;
  try {
    const payload = decodeSyncPayload(hash.slice(6));
    if (payload && Array.isArray(payload.boards) && Array.isArray(payload.tasks)) {
      localStorage.setItem(LS_KEYS.BOARDS, JSON.stringify(payload.boards));
      localStorage.setItem(LS_KEYS.TASKS, JSON.stringify(payload.tasks));
      if (payload.mode) localStorage.setItem(LS_KEYS.MODE, payload.mode);
      if (payload.theme) localStorage.setItem(LS_KEYS.THEME, payload.theme);
      if (payload.streak) localStorage.setItem(LS_KEYS.STREAK, JSON.stringify(payload.streak));
      if (payload.aiConfig) localStorage.setItem('schedule_ai_config_v1', JSON.stringify(payload.aiConfig));
      localStorage.setItem('schedule_last_saved_at', String(Date.now()));
      localStorage.setItem('schedule_sync_banner_dismissed', '1');
      history.replaceState(null, '', window.location.pathname + window.location.search);
      return true;
    }
  } catch (err) {
    console.warn('Sync payload decode failed:', err);
  }
  return false;
}

function persistToLocalDiskImmediate() {
  if (!isLocalHttpOrigin()) return;
  const payload = {
    boards: state.boards,
    tasks: state.tasks,
    deviceMode: state.deviceMode,
    theme: localStorage.getItem(LS_KEYS.THEME) || 'light',
    streak: (() => {
      try { return JSON.parse(localStorage.getItem(LS_KEYS.STREAK) || 'null'); } catch (_) { return null; }
    })(),
    updatedAt: Number(localStorage.getItem('schedule_last_saved_at') || Date.now())
  };
  fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

function scheduleDiskSave() {
  if (!diskSyncReady || !isLocalHttpOrigin()) return;
  clearTimeout(diskSaveTimer);
  diskSaveTimer = setTimeout(persistToLocalDiskImmediate, 180);
}

async function syncWithLocalDisk() {
  if (!isLocalHttpOrigin()) {
    diskSyncReady = true;
    return;
  }
  if (window.TanasAuth && typeof window.TanasAuth.isLoggedIn === 'function' && window.TanasAuth.isLoggedIn()) {
    diskSyncReady = true;
    return;
  }
  try {
    const res = await fetch('/api/data', { cache: 'no-store' });
    if (!res.ok) {
      diskSyncReady = true;
      return;
    }
    const body = await res.json();
    const localTs = Number(localStorage.getItem('schedule_last_saved_at') || 0);
    if (body && body.exists && body.data && Array.isArray(body.data.boards) && Array.isArray(body.data.tasks)) {
      const diskTs = Number(body.data.updatedAt || 0);
      if (isUsingDefaultSampleOnly() || diskTs > localTs) {
        window.ScheduleAPI?.applyRemoteSchedule(body.data, 'guest');
      }
    } else if (!isUsingDefaultSampleOnly()) {
      persistToLocalDiskImmediate();
    }
  } catch (_) {
    // Ignore when static server is readonly or offline
  } finally {
    diskSyncReady = true;
  }
}

function setupMigrationBanner() {
  const banner = document.getElementById('data-migration-banner');
  const textEl = document.getElementById('migration-banner-text');
  const btnPrimary = document.getElementById('btn-migration-primary');
  const btnSecondary = document.getElementById('btn-migration-secondary');
  const btnDismiss = document.getElementById('btn-migration-dismiss');
  if (!banner || !textEl || !btnPrimary || !btnSecondary || !btnDismiss) return;

  const isFileProtocol = window.location.protocol === 'file:';
  const dismissed = localStorage.getItem('schedule_sync_banner_dismissed') === '1';

  if (isFileProtocol && !dismissed && state.tasks.length > 0) {
    textEl.textContent = `Đang mở bằng tệp (file://) với ${state.tasks.length} công việc. Chuyển toàn bộ lịch sang bản .bat (127.0.0.1:58123) để đồng bộ & phát YouTube:`;
    btnPrimary.textContent = 'Chuyển lịch sang bản .bat ↗';
    btnSecondary.textContent = 'Tải file sao lưu JSON';
    btnSecondary.classList.remove('hidden');

    btnPrimary.onclick = () => {
      const payload = {
        boards: state.boards,
        tasks: state.tasks,
        mode: state.deviceMode,
        theme: localStorage.getItem(LS_KEYS.THEME) || 'light',
        streak: (() => { try { return JSON.parse(localStorage.getItem(LS_KEYS.STREAK) || 'null'); } catch (_) { return null; } })(),
        aiConfig: (() => { try { return JSON.parse(localStorage.getItem('schedule_ai_config_v1') || 'null'); } catch (_) { return null; } })()
      };
      const targetUrl = `http://127.0.0.1:58123/index.html#sync=${encodeSyncPayload(payload)}`;
      const win = window.open(targetUrl, '_blank');
      if (!win) {
        window.location.href = targetUrl;
      } else {
        showToast('Đang mở bản .bat với toàn bộ dữ liệu của bạn!');
      }
    };
    btnSecondary.onclick = exportDataJSON;
    btnDismiss.onclick = () => {
      localStorage.setItem('schedule_sync_banner_dismissed', '1');
      banner.classList.add('hidden');
    };

    banner.classList.remove('hidden');
    hydrateSketchy(banner);
    return;
  }

  if (!isFileProtocol && isUsingDefaultSampleOnly() && !dismissed) {
    textEl.textContent = 'Lịch cũ nằm ở tab tệp (file://)? Ở tab file:// đó hãy bấm F5 rồi nhấn "Chuyển lịch sang bản .bat ↗", hoặc nhập từ file JSON:';
    btnPrimary.textContent = 'Nhập file JSON';
    btnSecondary.textContent = 'Mở Sao lưu / Khôi phục';
    btnSecondary.classList.remove('hidden');

    btnPrimary.onclick = () => {
      document.getElementById('input-import-file')?.click();
    };
    btnSecondary.onclick = () => {
      const modal = document.getElementById('modal-backup');
      if (modal) {
        resetModalDragPositions(modal);
        modal.classList.remove('hidden');
        hydrateSketchy(modal);
      }
    };
    btnDismiss.onclick = () => {
      localStorage.setItem('schedule_sync_banner_dismissed', '1');
      banner.classList.add('hidden');
    };

    banner.classList.remove('hidden');
    hydrateSketchy(banner);
    return;
  }

  banner.classList.add('hidden');
}

// --- Init Application ---
document.addEventListener('DOMContentLoaded', () => {
  const syncedFromUrl = handleIncomingUrlSync();
  loadData();
  setupEventListeners();
  applySavedTheme();
  applyLayoutUI();
  renderAll();
  hydrateSketchy(document);
  setupMigrationBanner();

  if (syncedFromUrl) {
    diskSyncReady = true;
    persistToLocalDiskImmediate();
    showToast('Đã đồng bộ toàn bộ lịch cũ sang bản .bat thành công!', 4500);
  } else {
    syncWithLocalDisk();
  }
});

// --- Data Management Functions ---
function sanitizeCategoryLabel(cat) {
  if (!cat) return '';
  return String(cat)
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu, '')
    .replace(/\b(?:dễ thương|cute)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanLegacyLabels() {
  let dirty = false;

  // Clean any legacy emoji suffixes or "cute" labels in saved boards/tasks
  state.boards.forEach(board => {
    if (board.title) {
      const cleanedTitle = board.title.replace(/\s*[🌸☀️🍀🍊🍇🍉🥞🧸✨🎨💖🐰🐱⭐]\s*/g, '').trim();
      if (cleanedTitle !== board.title) {
        board.title = cleanedTitle;
        dirty = true;
      }
    }
  });

  state.tasks.forEach(task => {
    if (task.category) {
      const cleanedCat = sanitizeCategoryLabel(task.category) || 'Việc cá nhân';
      if (cleanedCat !== task.category) {
        task.category = cleanedCat;
        dirty = true;
      }
    }
    if (!task.iconUrl && !task.sketchyKey) {
      const def = DEFAULT_TASKS.find(d => d.id === task.id);
      if (def && def.iconUrl) {
        task.iconUrl = def.iconUrl;
        dirty = true;
      }
    }
  });

  return dirty;
}

function loadData() {
  const savedBoards = localStorage.getItem(LS_KEYS.BOARDS);
  const savedTasks = localStorage.getItem(LS_KEYS.TASKS);
  const savedMode = localStorage.getItem(LS_KEYS.MODE);
  const savedLayout = localStorage.getItem(LS_KEYS.LAYOUT);

  state.boards = savedBoards ? JSON.parse(savedBoards) : JSON.parse(JSON.stringify(DEFAULT_BOARDS));
  state.tasks = savedTasks ? JSON.parse(savedTasks) : JSON.parse(JSON.stringify(DEFAULT_TASKS));

  if (cleanLegacyLabels()) {
    localStorage.setItem(LS_KEYS.BOARDS, JSON.stringify(state.boards));
    localStorage.setItem(LS_KEYS.TASKS, JSON.stringify(state.tasks));
  }

  if (savedMode) state.deviceMode = savedMode;
  if (savedLayout === 'grid' || savedLayout === 'columns') state.layout = savedLayout;
  if (state.boards.length > 0) {
    state.activeMobileBoardId = state.boards[0].id;
  }
}

function saveData() {
  localStorage.setItem(LS_KEYS.BOARDS, JSON.stringify(state.boards));
  localStorage.setItem(LS_KEYS.TASKS, JSON.stringify(state.tasks));
  localStorage.setItem(LS_KEYS.MODE, state.deviceMode);
  localStorage.setItem(LS_KEYS.LAYOUT, state.layout);
  localStorage.setItem('schedule_last_saved_at', String(Date.now()));
  if (window.TanasAuth && typeof window.TanasAuth.isLoggedIn === 'function' && window.TanasAuth.isLoggedIn()) {
    const uid = window.TanasAuth.getUser?.()?.id;
    if (uid) localStorage.setItem(LS_KEYS.DATA_OWNER, String(uid));
    window.TanasAuth.queueRemoteSave();
  } else {
    if (!localStorage.getItem(LS_KEYS.DATA_OWNER)) {
      localStorage.setItem(LS_KEYS.DATA_OWNER, 'guest');
    }
    scheduleDiskSave();
  }
}

function applyLayoutUI(layout = state.layout) {
  state.layout = layout === 'grid' ? 'grid' : 'columns';
  localStorage.setItem(LS_KEYS.LAYOUT, state.layout);
  const btnCol = document.getElementById('btn-layout-columns');
  const btnGrid = document.getElementById('btn-layout-grid');
  const setBtn = (btn, active) => {
    if (!btn) return;
    btn.classList.toggle('bg-pink-200', active);
    btn.classList.toggle('text-stone-900', active);
    btn.classList.toggle('border', active);
    btn.classList.toggle('border-stone-800', active);
    btn.classList.toggle('text-stone-500', !active);
  };
  setBtn(btnCol, state.layout === 'columns');
  setBtn(btnGrid, state.layout === 'grid');
}

// --- DOM Rendering ---
function renderAll() {
  renderDeviceMode();
  renderMobileTabs();
  renderBoards();
  renderStats();
  populateBoardSelectOptions();
  hydrateSketchy(document);
}

function renderDeviceMode() {
  const wrapper = document.getElementById('device-wrapper');
  const simInfo = document.getElementById('simulator-info');
  const label = document.getElementById('current-mode-label');
  const mobileTabs = document.getElementById('mobile-tabs-container');

  wrapper.classList.remove('mode-auto', 'mode-desktop', 'mode-tablet', 'mode-mobile');
  wrapper.classList.add(`mode-${state.deviceMode}`);

  // Button states
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('bg-amber-200', 'dark:bg-amber-900', 'text-stone-900', 'dark:text-white');
    btn.classList.add('bg-white', 'dark:bg-stone-700', 'text-stone-700', 'dark:text-stone-200');
  });

  const activeBtn = document.getElementById(`btn-mode-${state.deviceMode}`);
  if (activeBtn) {
    activeBtn.classList.add('bg-amber-200', 'dark:bg-amber-900', 'text-stone-900', 'dark:text-white');
    activeBtn.classList.remove('bg-white', 'dark:bg-stone-700');
  }

  if (state.deviceMode === 'mobile') {
    simInfo.classList.remove('hidden');
    label.textContent = 'Điện Thoại (9:16 ~ 390x844px)';
    mobileTabs.classList.remove('hidden');
  } else if (state.deviceMode === 'tablet') {
    simInfo.classList.remove('hidden');
    label.textContent = 'Tablet (3:4 ~ 780px)';
    mobileTabs.classList.add('hidden');
  } else {
    simInfo.classList.add('hidden');
    mobileTabs.classList.add('hidden');
  }
}

function renderMobileTabs() {
  const container = document.getElementById('mobile-tabs-container');
  if (state.deviceMode !== 'mobile') return;

  container.innerHTML = state.boards.map(board => {
    const isActive = board.id === state.activeMobileBoardId;
    const taskCount = state.tasks.filter(t => t.boardId === board.id).length;
    return `
      <button 
        onclick="setActiveMobileBoard('${board.id}')"
        class="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition btn-cute ${
          isActive 
            ? 'bg-pink-400 text-stone-900 shadow-[2px_2px_0px_#292524]' 
            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
        }"
      >
        <span class="w-2.5 h-2.5 rounded-full border border-stone-800" style="background-color: ${board.color}"></span>
        <span>${escapeHtml(board.title)}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full border border-stone-800 ${isActive ? 'bg-white' : 'bg-stone-200 dark:bg-stone-700'}">${taskCount}</span>
      </button>
    `;
  }).join('');
}

function setActiveMobileBoard(boardId) {
  state.activeMobileBoardId = boardId;
  renderMobileTabs();
  renderBoards();
}

function renderBoards() {
  const container = document.getElementById('boards-container');
  
  if (state.layout === 'grid') {
    container.classList.add('layout-grid');
  } else {
    container.classList.remove('layout-grid');
  }

  let boardsToRender = state.boards;
  if (state.deviceMode === 'mobile' && state.activeMobileBoardId) {
    boardsToRender = state.boards.filter(b => b.id === state.activeMobileBoardId);
  }

  if (state.boards.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-stone-500 dark:text-stone-400">
        <div class="mb-2 flex justify-center">${window.Sketchy ? window.Sketchy.emptyState('no-boards') : ''}</div>
        <p class="font-bold text-base text-stone-700 dark:text-stone-200">Chưa có bảng thời gian biểu nào</p>
        <p class="text-xs mt-1">Bấm nút "Thêm Bảng" hoặc "Chọn Mẫu" ở thanh công cụ để tạo bảng mới</p>
      </div>
    `;
    hydrateSketchy(container);
    return;
  }

  container.innerHTML = boardsToRender.map((board, index) => {
    let boardTasks = state.tasks.filter(t => t.boardId === board.id);

    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      boardTasks = boardTasks.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q))
      );
    }

    if (state.filterStatus === 'completed') {
      boardTasks = boardTasks.filter(t => t.completed);
    } else if (state.filterStatus === 'pending') {
      boardTasks = boardTasks.filter(t => !t.completed);
    }

    boardTasks.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    const completedCount = boardTasks.filter(t => t.completed).length;

    // Determine tape color & Today indicator
    const tapeColor = board.tape || TAPE_CLASSES[index % TAPE_CLASSES.length];
    const isToday = isBoardMatchingDay(board.title);

    return `
      <div class="board-column sketch-box ${isToday ? 'is-today-board' : ''}" data-board-id="${board.id}" ondragover="handleBoardDragOver(event)" ondragenter="handleBoardDragEnter(event, '${board.id}')" ondragleave="handleBoardDragLeave(event)" ondrop="handleBoardDrop(event, '${board.id}')">
        
        <!-- Washi Tape on top of board -->
        <div class="washi-tape ${tapeColor}"></div>

        <!-- Board Header -->
        <div class="px-4 pt-4 pb-2.5 border-b-2 border-stone-800 dark:border-stone-200">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5 overflow-hidden">
              <h3 class="font-black text-sm tracking-tight truncate text-stone-800 dark:text-stone-100" title="${escapeHtml(board.title)}">
                ${escapeHtml(board.title)}
              </h3>
              ${isToday ? `
                <span class="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-900 border border-rose-500 flex-shrink-0">Hôm nay</span>
              ` : ''}
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-800 dark:border-stone-400 text-stone-700 dark:text-stone-300 flex-shrink-0">
                ${completedCount}/${boardTasks.length}
              </span>
            </div>

            <!-- Board Actions Menu -->
            <div class="flex items-center gap-1">
              <button onclick="openTaskModalForBoard('${board.id}')" class="p-1 rounded-lg hover:bg-pink-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition inline-flex items-center justify-center" title="Thêm việc vào bảng này">
                ${sketchyHtml('plus', { size: 15 })}
              </button>
              <button onclick="editBoard('${board.id}')" class="p-1 rounded-lg hover:bg-yellow-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition inline-flex items-center justify-center" title="Chỉnh sửa bảng">
                ${sketchyHtml('edit', { size: 14 })}
              </button>
              <button onclick="deleteBoard('${board.id}')" class="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 transition inline-flex items-center justify-center" title="Xóa bảng này">
                ${sketchyHtml('trash', { size: 14 })}
              </button>
            </div>
          </div>

          <!-- Organic Hand-drawn Crayon Underline -->
          <div class="board-crayon-bar" style="background-color: ${board.color};"></div>
        </div>

        <!-- Task List Area -->
        <div class="task-drop-zone p-3 space-y-3 flex-1 overflow-y-auto max-h-[580px]">
          ${boardTasks.length === 0 ? `
            <div class="py-7 text-center text-stone-400">
              <div class="mx-auto mb-1 flex items-center justify-center text-stone-700 dark:text-stone-300">
                ${window.Sketchy ? window.Sketchy.emptyState('no-tasks') : ''}
              </div>
              <p class="text-xs font-bold text-stone-600 dark:text-stone-300">Chưa có công việc</p>
              <button onclick="openTaskModalForBoard('${board.id}')" class="text-xs text-pink-600 dark:text-pink-400 hover:underline mt-1 font-bold">
                + Thêm công việc
              </button>
            </div>
          ` : boardTasks.map(task => renderTaskCard(task, board)).join('')}
        </div>

        <!-- Quick Add Footer -->
        <div class="p-2 border-t-2 border-stone-800 dark:border-stone-200 bg-stone-50/60 dark:bg-stone-900/60">
          <button onclick="openTaskModalForBoard('${board.id}')" class="w-full py-1.5 px-3 rounded-xl border-2 border-dashed border-stone-400 dark:border-stone-600 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold flex items-center justify-center gap-1.5 transition">
            ${sketchyHtml('pencil', { size: 13, accent: '#fef08a' })}
            <span>Thêm việc cần làm</span>
          </button>
        </div>

      </div>
    `;
  }).join('');
}

function renderTaskCard(task, board = null) {
  const isCompleted = task.completed;
  const priorityClass = `priority-${task.priority || 'medium'}`;
  const isLive = isTaskLiveNow(task, board);
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  const doneSubs = subtasks.filter(s => s.done).length;

  return `
    <div 
      class="task-item p-3 ${priorityClass} ${isCompleted ? 'completed' : ''} ${isLive ? 'is-live-now' : ''}" 
      draggable="true" 
      data-task-id="${task.id}"
      ondragstart="handleTaskDragStart(event, '${task.id}')"
      ondragend="handleTaskDragEnd(event)"
    >
      
      <!-- Stamp when completed -->
      <div class="stamp-completed">ĐÃ XONG! ${sketchyHtml('star', { size: 12, accent: '#fef08a', animate: false })}</div>

      <!-- Top: Crayon Marker Time, Live Badge & Category -->
      <div class="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
        <div class="flex items-center gap-1.5">
          <div class="crayon-highlight text-xs text-stone-900 inline-flex items-center gap-1">
            ${sketchyHtml('clock', { size: 13, accent: '#fef08a' })}
            <span>${task.startTime || '00:00'} - ${task.endTime || '00:00'}</span>
          </div>
          ${isLive ? `
            <span class="live-now-badge">● Đang diễn ra</span>
          ` : ''}
        </div>
        
        <div class="flex items-center gap-1">
          ${task.isHabit || task.habitGroupId ? `
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-400 inline-flex items-center justify-center" title="Thói quen lặp lại">${sketchyHtml('repeat', { size: 11 })}</span>
          ` : ''}
          ${task.remindMinutes > 0 ? `
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800 border border-sky-400 inline-flex items-center justify-center" title="Nhắc trước ${task.remindMinutes} phút">${sketchyHtml('bell', { size: 11, accent: '#bae6fd' })}</span>
          ` : ''}
          ${sanitizeCategoryLabel(task.category) ? `
            <span class="badge-tag-cute bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200">
              ${escapeHtml(sanitizeCategoryLabel(task.category))}
            </span>
          ` : ''}
        </div>
      </div>

      <!-- Main: Checkbox, Sticker or Sketchy Icon and Title -->
      <div class="flex items-start gap-2.5">
        <input 
          type="checkbox" 
          ${isCompleted ? 'checked' : ''} 
          onchange="toggleTaskComplete('${task.id}')"
          class="mt-1 w-4 h-4 rounded-md border-2 border-stone-800 text-pink-500 focus:ring-pink-400 cursor-pointer"
        >
        ${task.sketchyKey ? `
          <div class="w-9 h-9 rounded-xl bg-pink-50 dark:bg-stone-800 border-2 border-stone-800 dark:border-stone-500 flex items-center justify-center flex-shrink-0 text-stone-800 dark:text-stone-100 shadow-sm">
            ${sketchyHtml(task.sketchyKey, { size: 22, accent: '#fef08a' })}
          </div>
        ` : (task.iconUrl ? `
          <img src="${task.iconUrl}" alt="sticker" class="task-sticker-img flex-shrink-0 animate-cute-bounce">
        ` : '')}
        <div class="flex-1 min-w-0">
          <h4 class="task-title font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-100 leading-snug">
            ${escapeHtml(task.title)}
          </h4>
          
          ${task.notes ? `
            <p class="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 font-medium">
              ${escapeHtml(task.notes)}
            </p>
          ` : ''}
        </div>
      </div>

      ${subtasks.length > 0 ? `
        <div class="mt-2 pt-1.5 border-t border-dashed border-stone-200 dark:border-stone-700 space-y-1">
          <div class="flex items-center justify-between text-[10px] font-bold text-stone-500 dark:text-stone-400">
            <span class="inline-flex items-center gap-1">${sketchyHtml('checklist', { size: 12, accent: '#a7f3d0' })}<span>Checklist (${doneSubs}/${subtasks.length})</span></span>
            <div class="w-16 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-400 transition-all" style="width: ${Math.round((doneSubs / subtasks.length) * 100)}%"></div>
            </div>
          </div>
          ${subtasks.map(st => `
            <label class="flex items-center gap-1.5 text-[11px] cursor-pointer text-stone-700 dark:text-stone-300 hover:text-pink-600 dark:hover:text-pink-400">
              <input type="checkbox" ${st.done ? 'checked' : ''} onchange="toggleSubtask('${task.id}', '${st.id}')" class="w-3.5 h-3.5 rounded border-stone-600 text-emerald-500 cursor-pointer">
              <span class="${st.done ? 'line-through opacity-55' : ''} truncate">${escapeHtml(st.title)}</span>
            </label>
          `).join('')}
        </div>
      ` : ''}

      <!-- Bottom Card Actions -->
      <div class="flex flex-wrap items-center justify-between gap-1.5 mt-2 pt-1.5 border-t border-dashed border-stone-300 dark:border-stone-700">
        <div class="flex items-center gap-1">
          ${task.youtubeUrl ? `
            <button onclick="openTaskYouTube('${task.id}')" class="px-2 py-0.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/70 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 text-[10px] font-black flex items-center gap-1 transition" title="Phát video / nhạc YouTube đính kèm">
              ${sketchyHtml('play', { size: 11, accent: '#fecdd3' })}<span>YouTube</span>
            </button>
          ` : ''}
          <button onclick="startPomodoroForTask('${task.id}')" class="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[10px] font-bold flex items-center gap-1 transition" title="Bắt đầu đồng hồ tập trung cho việc này">
            ${sketchyHtml('timer', { size: 12, accent: '#fde68a' })}<span>Tập trung</span>
          </button>
        </div>

        <div class="flex items-center gap-2 ml-auto">
          <button onclick="editTask('${task.id}')" class="text-[11px] font-bold text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition">
            ${sketchyHtml('edit', { size: 12 })} Sửa
          </button>
          <button onclick="deleteTask('${task.id}')" class="text-[11px] font-bold text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition">
            ${sketchyHtml('trash', { size: 12 })} Xóa
          </button>
        </div>
      </div>

    </div>
  `;
}

// --- Drag & Drop Handlers for Tasks between Boards ---
function handleTaskDragStart(event, taskId) {
  state.draggedTaskId = taskId;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', taskId);
  if (event.currentTarget) {
    setTimeout(() => event.currentTarget.classList.add('is-dragging'), 0);
  }
}

function handleTaskDragEnd(event) {
  state.draggedTaskId = null;
  document.querySelectorAll('.task-item.is-dragging').forEach(el => el.classList.remove('is-dragging'));
  document.querySelectorAll('.board-column.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function handleBoardDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

function handleBoardDragEnter(event, boardId) {
  event.preventDefault();
  const col = event.currentTarget;
  if (col && col.classList.contains('board-column')) {
    col.classList.add('drag-over');
  }
}

function handleBoardDragLeave(event) {
  const col = event.currentTarget;
  if (col && !col.contains(event.relatedTarget)) {
    col.classList.remove('drag-over');
  }
}

function handleBoardDrop(event, targetBoardId) {
  event.preventDefault();
  document.querySelectorAll('.board-column.drag-over').forEach(el => el.classList.remove('drag-over'));
  const taskId = state.draggedTaskId || event.dataTransfer.getData('text/plain');
  if (!taskId || !targetBoardId) return;

  const task = state.tasks.find(t => t.id === taskId);
  const targetBoard = state.boards.find(b => b.id === targetBoardId);
  if (!task || !targetBoard) return;

  if (task.boardId !== targetBoardId) {
    task.boardId = targetBoardId;
    saveData();
    renderAll();
    showToast(`Đã chuyển "${task.title}" sang ${targetBoard.title}!`);
  }
}

function toggleSubtask(taskId, subtaskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task || !Array.isArray(task.subtasks)) return;
  const sub = task.subtasks.find(s => s.id === subtaskId);
  if (sub) {
    sub.done = !sub.done;
    saveData();
    renderBoards();
    hydrateSketchy(document.getElementById('boards-container'));
  }
}

function getLocalDateStr(dateObj = new Date()) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function recordStreakCompletion() {
  try {
    const raw = localStorage.getItem(LS_KEYS.STREAK);
    const data = raw ? JSON.parse(raw) : { dates: [] };
    const today = getLocalDateStr();
    if (!data.dates.includes(today)) {
      data.dates.push(today);
      data.dates = data.dates.slice(-90);
      localStorage.setItem(LS_KEYS.STREAK, JSON.stringify(data));
    }
  } catch (_) {}
}

function computeCurrentStreak() {
  try {
    const raw = localStorage.getItem(LS_KEYS.STREAK);
    const data = raw ? JSON.parse(raw) : { dates: [] };
    const dateSet = new Set(data.dates || []);
    if (dateSet.size === 0) return 0;

    let streak = 0;
    const cursor = new Date();
    const todayStr = getLocalDateStr(cursor);
    if (!dateSet.has(todayStr)) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (dateSet.has(getLocalDateStr(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  } catch (_) {
    return 0;
  }
}

function renderStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const ring = document.getElementById('stat-progress-ring');
  if (ring) {
    ring.setAttribute('stroke-dasharray', `${percent}, 100`);
  }

  const percentText = document.getElementById('stat-percent-text');
  if (percentText) {
    percentText.textContent = `${percent}%`;
  }

  const badge = document.getElementById('stat-summary-badge');
  if (badge) {
    badge.textContent = `${completed}/${total} việc`;
  }

  const streakText = document.getElementById('stat-streak-text');
  if (streakText) {
    const streak = computeCurrentStreak();
    streakText.textContent = `${streak} ngày`;
  } else {
    const streakBadge = document.getElementById('stat-streak-badge');
    if (streakBadge) {
      const streak = computeCurrentStreak();
      streakBadge.innerHTML = `${sketchyHtml('flame', { size: 13, accent: '#fb923c' })} <span>${streak} ngày</span>`;
    }
  }

  const msg = document.getElementById('stat-status-message');
  if (msg) {
    if (total === 0) {
      msg.textContent = 'Chưa có công việc nào trong kế hoạch.';
    } else if (percent === 100) {
      msg.textContent = 'Tuyệt vời! Đã hoàn thành 100% mục tiêu.';
    } else if (percent >= 50) {
      msg.textContent = 'Đã hoàn thành hơn một nửa kế hoạch.';
    } else {
      msg.textContent = 'Tiếp tục theo dõi và hoàn thành các mục tiêu.';
    }
  }
}

function populateBoardSelectOptions() {
  const select = document.getElementById('task-board-id');
  if (!select) return;

  select.innerHTML = state.boards.map(b => `
    <option value="${b.id}">${escapeHtml(b.title)}</option>
  `).join('');
}

function renderModalSubtasks() {
  const container = document.getElementById('task-subtasks-list');
  if (!container) return;
  if (modalSubtasks.length === 0) {
    container.innerHTML = '<p class="text-[11px] text-stone-400 italic">Chưa có mục con nào</p>';
    return;
  }
  container.innerHTML = modalSubtasks.map((st, idx) => `
    <div class="flex items-center justify-between gap-2 px-2.5 py-1 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs">
      <label class="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
        <input type="checkbox" ${st.done ? 'checked' : ''} onchange="toggleModalSubtaskDone(${idx})" class="w-3.5 h-3.5 rounded text-emerald-500">
        <span class="${st.done ? 'line-through opacity-55' : ''} truncate font-semibold">${escapeHtml(st.title)}</span>
      </label>
      <button type="button" onclick="removeModalSubtask(${idx})" class="text-stone-400 hover:text-rose-500 font-bold text-xs">✕</button>
    </div>
  `).join('');
}

function toggleModalSubtaskDone(idx) {
  if (modalSubtasks[idx]) {
    modalSubtasks[idx].done = !modalSubtasks[idx].done;
    renderModalSubtasks();
  }
}

function removeModalSubtask(idx) {
  modalSubtasks.splice(idx, 1);
  renderModalSubtasks();
}

function renderRepeatBoardChips(primaryBoardId) {
  const container = document.getElementById('task-repeat-boards');
  if (!container) return;
  container.innerHTML = state.boards.map(b => {
    const isPrimary = b.id === primaryBoardId;
    return `
      <label class="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-bold cursor-pointer transition ${
        isPrimary
          ? 'bg-stone-200 dark:bg-stone-700 border-stone-400 opacity-50 cursor-not-allowed'
          : 'bg-white dark:bg-stone-900 border-stone-800 dark:border-stone-400 hover:bg-amber-100 dark:hover:bg-amber-950/60'
      }">
        <input type="checkbox" class="chk-repeat-board w-3 h-3 rounded text-amber-500" value="${b.id}" ${isPrimary ? 'disabled' : ''}>
        <span>${escapeHtml(b.title)}</span>
      </label>
    `;
  }).join('');
}

// --- Task CRUD Operations ---
function openTaskModal(taskId = null, presetBoardId = null) {
  const modal = document.getElementById('modal-task');
  const titleElem = document.getElementById('modal-task-title');
  const form = document.getElementById('form-task');

  resetModalDragPositions(modal);
  form.reset();
  populateBoardSelectOptions();

  const iconUrlInput = document.getElementById('task-icon-url');
  const sketchyKeyInput = document.getElementById('task-sketchy-key');
  const badge = document.getElementById('task-selected-icon-badge');
  const badgeImg = document.getElementById('task-selected-icon-img');
  const badgeSketchy = document.getElementById('task-selected-sketchy-preview');
  const badgeName = document.getElementById('task-selected-icon-name');
  const ytInput = document.getElementById('task-youtube-url');
  const remindSelect = document.getElementById('task-remind-minutes');
  const habitCheck = document.getElementById('task-is-habit');

  if (taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    titleElem.textContent = 'Chỉnh Sửa Việc Cần Làm';
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-board-id').value = task.boardId;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-start-time').value = task.startTime || '';
    document.getElementById('task-end-time').value = task.endTime || '';
    document.getElementById('task-category').value = task.category || 'Học bài';
    document.getElementById('task-priority').value = task.priority || 'medium';
    document.getElementById('task-notes').value = task.notes || '';
    if (ytInput) ytInput.value = task.youtubeUrl || '';
    if (remindSelect) remindSelect.value = String(task.remindMinutes || 0);
    if (habitCheck) habitCheck.checked = Boolean(task.isHabit || task.habitGroupId);

    modalSubtasks = Array.isArray(task.subtasks) ? task.subtasks.map(s => ({ ...s })) : [];
    renderRepeatBoardChips(task.boardId);

    if (iconUrlInput) iconUrlInput.value = task.iconUrl || '';
    if (sketchyKeyInput) sketchyKeyInput.value = task.sketchyKey || '';

    if (task.sketchyKey && badge) {
      if (badgeImg) badgeImg.classList.add('hidden');
      if (badgeSketchy) {
        badgeSketchy.innerHTML = sketchyHtml(task.sketchyKey, { size: 18, accent: '#fef08a', animate: false });
        badgeSketchy.classList.remove('hidden');
        badgeSketchy.classList.add('inline-flex');
      }
      if (badgeName) badgeName.textContent = `Sketchy (${task.sketchyKey})`;
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    } else if (task.iconUrl && badge) {
      if (badgeSketchy) {
        badgeSketchy.innerHTML = '';
        badgeSketchy.classList.add('hidden');
        badgeSketchy.classList.remove('inline-flex');
      }
      if (badgeImg) {
        badgeImg.src = task.iconUrl;
        badgeImg.classList.remove('hidden');
      }
      if (badgeName) badgeName.textContent = 'Sticker いらすとや';
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    } else if (badge) {
      badge.classList.add('hidden');
      badge.classList.remove('flex');
    }
  } else {
    titleElem.textContent = 'Viết Việc Cần Làm Mới';
    document.getElementById('task-id').value = '';
    if (ytInput) ytInput.value = '';
    if (remindSelect) remindSelect.value = '0';
    if (habitCheck) habitCheck.checked = false;
    modalSubtasks = [];

    if (iconUrlInput) iconUrlInput.value = '';
    if (sketchyKeyInput) sketchyKeyInput.value = '';
    if (badgeSketchy) {
      badgeSketchy.innerHTML = '';
      badgeSketchy.classList.add('hidden');
      badgeSketchy.classList.remove('inline-flex');
    }
    if (badgeImg) badgeImg.classList.remove('hidden');
    if (badge) {
      badge.classList.add('hidden');
      badge.classList.remove('flex');
    }
    const targetBoard = presetBoardId || state.activeMobileBoardId || (state.boards[0]?.id || '');
    if (targetBoard) {
      document.getElementById('task-board-id').value = targetBoard;
    }
    renderRepeatBoardChips(document.getElementById('task-board-id').value);

    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    document.getElementById('task-start-time').value = `${h}:00`;
    document.getElementById('task-end-time').value = `${String((now.getHours() + 1) % 24).padStart(2, '0')}:00`;
  }

  renderModalSubtasks();
  modal.classList.remove('hidden');
  hydrateSketchy(modal);
}

function openTaskModalForBoard(boardId) {
  openTaskModal(null, boardId);
}

function editTask(taskId) {
  openTaskModal(taskId);
}

function toggleTaskComplete(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    if (task.completed) recordStreakCompletion();
    saveData();
    renderAll();
    showToast(task.completed ? 'Tuyệt vời! Đã hoàn thành 1 việc ⭐' : 'Đã đổi trạng thái sang chưa xong.');
  }
}

function deleteTask(taskId) {
  if (confirm('Bạn có chắc muốn xóa việc cần làm này không?')) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveData();
    renderAll();
    showToast('Đã xóa việc cần làm khỏi sổ.');
  }
}

// --- Board CRUD Operations ---
function openBoardModal(boardId = null) {
  const modal = document.getElementById('modal-board');
  const titleElem = document.getElementById('modal-board-title');
  const form = document.getElementById('form-board');

  resetModalDragPositions(modal);
  form.reset();

  if (boardId) {
    const board = state.boards.find(b => b.id === boardId);
    if (!board) return;
    titleElem.textContent = 'Chỉnh Sửa Bảng Sổ Tay';
    document.getElementById('board-id').value = board.id;
    document.getElementById('board-name').value = board.title;
    document.getElementById('board-color').value = board.color || '#f472b6';
  } else {
    titleElem.textContent = 'Thêm Bảng Sổ Tay Mới';
    document.getElementById('board-id').value = '';
    document.getElementById('board-color').value = '#f472b6';
  }

  modal.classList.remove('hidden');
  hydrateSketchy(modal);
}

function editBoard(boardId) {
  openBoardModal(boardId);
}

function deleteBoard(boardId) {
  const board = state.boards.find(b => b.id === boardId);
  if (!board) return;

  const count = state.tasks.filter(t => t.boardId === boardId).length;
  const msg = count > 0 
    ? `Bảng "${board.title}" đang có ${count} việc cần làm. Bạn có chắc muốn xóa cả bảng này không?`
    : `Bạn có muốn xóa bảng "${board.title}" không?`;

  if (confirm(msg)) {
    state.boards = state.boards.filter(b => b.id !== boardId);
    state.tasks = state.tasks.filter(t => t.boardId !== boardId);
    if (state.activeMobileBoardId === boardId) {
      state.activeMobileBoardId = state.boards[0]?.id || null;
    }
    saveData();
    renderAll();
    showToast('Đã xóa bảng thành công!');
  }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  ['auto', 'desktop', 'tablet', 'mobile'].forEach(mode => {
    const btn = document.getElementById(`btn-mode-${mode}`);
    if (btn) {
      btn.addEventListener('click', () => {
        state.deviceMode = mode;
        saveData();
        renderAll();
      });
    }
  });

  const btnResetZoom = document.getElementById('btn-reset-zoom');
  if (btnResetZoom) {
    btnResetZoom.addEventListener('click', () => {
      state.deviceMode = 'desktop';
      saveData();
      renderAll();
    });
  }

  document.getElementById('btn-open-task-modal').addEventListener('click', () => openTaskModal());
  document.getElementById('btn-open-board-modal').addEventListener('click', () => openBoardModal());
  
  // Open 1-Image Poster Export Modal
  const btnOpenImageModal = document.getElementById('btn-open-image-modal');
  if (btnOpenImageModal) {
    btnOpenImageModal.addEventListener('click', openImageExportModal);
  }

  // Open Cute Icons Library Modal (Dashboard-Icons MCP)
  const btnOpenIcons = document.getElementById('btn-open-icons-modal');
  if (btnOpenIcons) {
    btnOpenIcons.addEventListener('click', openIconsModal);
  }

  const btnQuickIcons = document.getElementById('btn-quick-open-icons');
  if (btnQuickIcons) {
    btnQuickIcons.addEventListener('click', openIconsModal);
  }

  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#modal-task, #modal-board, #modal-templates, #modal-backup, #modal-export-image, #modal-icons').forEach(m => {
        m.classList.add('hidden');
        resetModalDragPositions(m);
      });
    });
  });

  ['modal-task', 'modal-board', 'modal-templates', 'modal-backup', 'modal-export-image', 'modal-icons'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          el.classList.add('hidden');
          resetModalDragPositions(el);
        }
      });
    }
  });

  // Pick sticker button inside task modal
  const btnPickTaskSticker = document.getElementById('btn-pick-task-sticker');
  if (btnPickTaskSticker) {
    btnPickTaskSticker.addEventListener('click', () => {
      openIconsModal();
    });
  }

  // Remove sticker/sketchy icon button inside task modal
  const btnRemoveTaskIcon = document.getElementById('btn-remove-task-icon');
  if (btnRemoveTaskIcon) {
    btnRemoveTaskIcon.addEventListener('click', () => {
      const input = document.getElementById('task-icon-url');
      if (input) input.value = '';
      const sketchyInput = document.getElementById('task-sketchy-key');
      if (sketchyInput) sketchyInput.value = '';
      const badgeImg = document.getElementById('task-selected-icon-img');
      if (badgeImg) badgeImg.classList.remove('hidden');
      const badgeSketchy = document.getElementById('task-selected-sketchy-preview');
      if (badgeSketchy) {
        badgeSketchy.innerHTML = '';
        badgeSketchy.classList.add('hidden');
        badgeSketchy.classList.remove('inline-flex');
      }
      const badge = document.getElementById('task-selected-icon-badge');
      if (badge) {
        badge.classList.add('hidden');
        badge.classList.remove('flex');
      }
    });
  }

  // Quick Irasutoya Sticker Palette Buttons in Task Modal
  document.querySelectorAll('.btn-quick-sticker').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = e.currentTarget.getAttribute('data-sticker');
      const name = e.currentTarget.getAttribute('data-name');
      const input = document.getElementById('task-icon-url');
      const sketchyInput = document.getElementById('task-sketchy-key');
      const badge = document.getElementById('task-selected-icon-badge');
      const badgeImg = document.getElementById('task-selected-icon-img');
      const badgeSketchy = document.getElementById('task-selected-sketchy-preview');
      const badgeName = document.getElementById('task-selected-icon-name');
      if (input) input.value = url;
      if (sketchyInput) sketchyInput.value = '';
      if (badgeSketchy) {
        badgeSketchy.innerHTML = '';
        badgeSketchy.classList.add('hidden');
        badgeSketchy.classList.remove('inline-flex');
      }
      if (badgeImg) {
        badgeImg.src = url;
        badgeImg.classList.remove('hidden');
      }
      if (badgeName) badgeName.textContent = name;
      if (badge) {
        badge.classList.remove('hidden');
        badge.classList.add('flex');
      }
      showToast(`Đã chọn sticker: ${name}`);
    });
  });

  // Source Switcher Tabs (Irasutoya Stickers vs Sketchy Hand-Drawn vs Dashboard Icons)
  document.querySelectorAll('.btn-source-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const source = e.currentTarget.getAttribute('data-source');
      activeIconSource = source;
      activeIconCategory = 'all';
      iconSearchQuery = '';
      const input = document.getElementById('input-search-icons');
      if (input) input.value = '';

      document.querySelectorAll('.btn-source-tab').forEach(b => {
        b.classList.remove('bg-pink-300', 'bg-amber-300', 'bg-teal-300', 'text-stone-900', 'shadow-[2px_2px_0px_#292524]', 'active-source');
        b.classList.add('bg-stone-100', 'dark:bg-stone-800', 'text-stone-600', 'dark:text-stone-300');
      });
      e.currentTarget.classList.remove('bg-stone-100', 'dark:bg-stone-800', 'text-stone-600', 'dark:text-stone-300');
      const activeBg = source === 'irasutoya' ? 'bg-pink-300' : (source === 'sketchy' ? 'bg-amber-300' : 'bg-teal-300');
      e.currentTarget.classList.add(activeBg, 'text-stone-900', 'shadow-[2px_2px_0px_#292524]', 'active-source');

      // Reset category chips
      document.querySelectorAll('.btn-icon-cat').forEach(b => {
        if (b.getAttribute('data-cat') === 'all') {
          b.classList.add('bg-teal-200', 'text-stone-900', 'border-stone-800');
          b.classList.remove('bg-stone-100', 'dark:bg-stone-800', 'text-stone-600');
        } else {
          b.classList.remove('bg-teal-200', 'text-stone-900', 'border-stone-800');
          b.classList.add('bg-stone-100', 'dark:bg-stone-800', 'text-stone-600', 'dark:text-stone-300');
        }
      });

      renderIconsGrid('all', '');
    });
  });

  // Quick Emoji Insert Buttons in Task Form
  document.querySelectorAll('.btn-insert-emoji').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const emoji = e.currentTarget.textContent.trim();
      const input = document.getElementById('task-title');
      if (input) {
        input.value = `${emoji} ${input.value.trim()}`.trim();
        input.focus();
      }
    });
  });

  // Icon Category Chips
  document.querySelectorAll('.btn-icon-cat').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeIconCategory = e.currentTarget.getAttribute('data-cat');
      document.querySelectorAll('.btn-icon-cat').forEach(b => {
        b.classList.remove('bg-teal-200', 'text-stone-900', 'border-stone-800');
        b.classList.add('bg-stone-100', 'dark:bg-stone-800', 'text-stone-600', 'dark:text-stone-300');
      });
      e.currentTarget.classList.add('bg-teal-200', 'text-stone-900', 'border-stone-800');
      e.currentTarget.classList.remove('bg-stone-100', 'dark:bg-stone-800', 'text-stone-600');
      renderIconsGrid(activeIconCategory, iconSearchQuery);
    });
  });

  // Icon Search Input
  const inputSearchIcons = document.getElementById('input-search-icons');
  if (inputSearchIcons) {
    inputSearchIcons.addEventListener('input', (e) => {
      iconSearchQuery = e.target.value.toLowerCase().trim();
      renderIconsGrid(activeIconCategory, iconSearchQuery);
    });
  }

  // Poster Ratio Buttons
  document.querySelectorAll('.btn-poster-ratio').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ratio = e.currentTarget.getAttribute('data-ratio');
      setPosterRatio(ratio);
    });
  });

  // Poster Theme Buttons
  document.querySelectorAll('.btn-poster-theme').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const bg = e.currentTarget.getAttribute('data-bg');
      const border = e.currentTarget.getAttribute('data-border');
      setPosterTheme(bg, border, e.currentTarget);
    });
  });

  // Download Poster Button
  const btnDownloadPoster = document.getElementById('btn-download-poster');
  if (btnDownloadPoster) {
    btnDownloadPoster.addEventListener('click', downloadPosterImage);
  }

  // Task Modal Subtask Adder
  const btnAddSubtask = document.getElementById('btn-add-subtask');
  const inputNewSubtask = document.getElementById('input-new-subtask');
  const addSubtaskFromInput = () => {
    if (!inputNewSubtask) return;
    const text = inputNewSubtask.value.trim();
    if (!text) return;
    modalSubtasks.push({
      id: 'st_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      title: text,
      done: false
    });
    inputNewSubtask.value = '';
    renderModalSubtasks();
    inputNewSubtask.focus();
  };
  if (btnAddSubtask) btnAddSubtask.addEventListener('click', addSubtaskFromInput);
  if (inputNewSubtask) {
    inputNewSubtask.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addSubtaskFromInput();
      }
    });
  }

  // Task Modal Primary Board Change -> update repeat chips
  const taskBoardSelect = document.getElementById('task-board-id');
  if (taskBoardSelect) {
    taskBoardSelect.addEventListener('change', (e) => {
      renderRepeatBoardChips(e.target.value);
    });
  }

  // Select All Repeat Boards
  const btnSelectAllRepeat = document.getElementById('btn-select-all-repeat');
  if (btnSelectAllRepeat) {
    btnSelectAllRepeat.addEventListener('click', () => {
      const checks = Array.from(document.querySelectorAll('.chk-repeat-board:not(:disabled)'));
      const allChecked = checks.every(c => c.checked);
      checks.forEach(c => { c.checked = !allChecked; });
    });
  }

  // Task Form Submit
  document.getElementById('form-task').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('task-id').value;
    const boardId = document.getElementById('task-board-id').value;
    const title = document.getElementById('task-title').value.trim();
    const startTime = document.getElementById('task-start-time').value;
    const endTime = document.getElementById('task-end-time').value;
    const category = document.getElementById('task-category').value;
    const priority = document.getElementById('task-priority').value;
    const notes = document.getElementById('task-notes').value.trim();
    const iconUrl = document.getElementById('task-icon-url') ? document.getElementById('task-icon-url').value.trim() : '';
    const sketchyKey = document.getElementById('task-sketchy-key') ? document.getElementById('task-sketchy-key').value.trim() : '';
    const youtubeUrl = document.getElementById('task-youtube-url') ? document.getElementById('task-youtube-url').value.trim() : '';
    const remindMinutes = parseInt(document.getElementById('task-remind-minutes')?.value || '0', 10) || 0;
    const isHabit = Boolean(document.getElementById('task-is-habit')?.checked);
    const repeatTargets = Array.from(document.querySelectorAll('.chk-repeat-board:checked:not(:disabled)')).map(el => el.value);

    if (!title || !boardId) return;

    const cleanSubtasks = modalSubtasks.map(s => ({ ...s }));
    const habitGroupId = (repeatTargets.length > 0 || isHabit) ? ('hb_' + Date.now()) : null;

    if (id) {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        Object.assign(task, {
          boardId,
          title,
          startTime,
          endTime,
          category,
          priority,
          notes,
          iconUrl: iconUrl || null,
          sketchyKey: sketchyKey || null,
          youtubeUrl: youtubeUrl || '',
          remindMinutes,
          subtasks: cleanSubtasks,
          isHabit,
          habitGroupId: task.habitGroupId || habitGroupId
        });
        showToast('Đã cập nhật việc cần làm!');
      }
    } else {
      const baseNow = Date.now();
      const newTask = {
        id: 't_' + baseNow,
        boardId,
        title,
        startTime,
        endTime,
        category,
        priority,
        notes,
        iconUrl: iconUrl || null,
        sketchyKey: sketchyKey || null,
        youtubeUrl: youtubeUrl || '',
        remindMinutes,
        subtasks: cleanSubtasks,
        isHabit,
        habitGroupId,
        completed: false,
        createdAt: baseNow
      };
      state.tasks.push(newTask);
      showToast(repeatTargets.length > 0 ? `Đã thêm vào ${1 + repeatTargets.length} bảng!` : 'Đã thêm công việc mới!');
    }

    // Clone to additional selected repeat boards
    if (repeatTargets.length > 0) {
      repeatTargets.forEach((targetBId, idx) => {
        const clonedSubs = cleanSubtasks.map((s, sIdx) => ({
          id: `st_${Date.now()}_${idx}_${sIdx}`,
          title: s.title,
          done: false
        }));
        state.tasks.push({
          id: `t_${Date.now()}_rep_${idx}_${Math.random().toString(36).slice(2, 5)}`,
          boardId: targetBId,
          title,
          startTime,
          endTime,
          category,
          priority,
          notes,
          iconUrl: iconUrl || null,
          sketchyKey: sketchyKey || null,
          youtubeUrl: youtubeUrl || '',
          remindMinutes,
          subtasks: clonedSubs,
          isHabit: true,
          habitGroupId,
          completed: false,
          createdAt: Date.now() + idx + 1
        });
      });
    }

    saveData();
    const taskModalEl = document.getElementById('modal-task');
    taskModalEl.classList.add('hidden');
    resetModalDragPositions(taskModalEl);
    renderAll();
  });

  // Board Form Submit
  document.getElementById('form-board').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('board-id').value;
    const title = document.getElementById('board-name').value.trim();
    const color = document.getElementById('board-color').value;

    if (!title) return;

    if (id) {
      const board = state.boards.find(b => b.id === id);
      if (board) {
        board.title = title;
        board.color = color;
        showToast('Đã cập nhật bảng!');
      }
    } else {
      const newBoard = {
        id: 'b_' + Date.now(),
        title,
        color,
        tape: TAPE_CLASSES[state.boards.length % TAPE_CLASSES.length]
      };
      state.boards.push(newBoard);
      if (!state.activeMobileBoardId) state.activeMobileBoardId = newBoard.id;
      showToast('Đã thêm bảng mới thành công!');
    }

    saveData();
    const boardModalEl = document.getElementById('modal-board');
    boardModalEl.classList.add('hidden');
    resetModalDragPositions(boardModalEl);
    renderAll();
  });

  // Preset color buttons for Board
  document.querySelectorAll('#preset-colors button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const color = e.currentTarget.getAttribute('data-color');
      document.getElementById('board-color').value = color;
    });
  });

  // Templates Modal
  document.getElementById('btn-open-templates-modal').addEventListener('click', () => {
    const modal = document.getElementById('modal-templates');
    resetModalDragPositions(modal);
    modal.classList.remove('hidden');
    hydrateSketchy(modal);
  });

  document.querySelectorAll('.btn-apply-template').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const templateKey = e.currentTarget.getAttribute('data-template');
      const tpl = TEMPLATES[templateKey];
      if (tpl && confirm('Áp dụng mẫu này sẽ thay đổi các bảng hiện tại. Bạn có muốn đổi không?')) {
        state.boards = JSON.parse(JSON.stringify(tpl.boards));
        state.tasks = JSON.parse(JSON.stringify(tpl.tasks));
        state.activeMobileBoardId = state.boards[0]?.id || null;
        saveData();
        const tplModal = document.getElementById('modal-templates');
        tplModal.classList.add('hidden');
        resetModalDragPositions(tplModal);
        renderAll();
        showToast('Đã áp dụng mẫu thời gian biểu mới!');
      }
    });
  });

  // Search Input
  const inputSearch = document.getElementById('input-search');
  inputSearch.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderBoards();
    hydrateSketchy(document.getElementById('boards-container'));
  });

  // Status Filter Select
  document.getElementById('select-filter-status').addEventListener('change', (e) => {
    state.filterStatus = e.target.value;
    renderBoards();
    hydrateSketchy(document.getElementById('boards-container'));
  });

  // Layout View Toggles
  const btnCol = document.getElementById('btn-layout-columns');
  const btnGrid = document.getElementById('btn-layout-grid');

  btnCol?.addEventListener('click', () => {
    applyLayoutUI('columns');
    saveData();
    renderBoards();
  });

  btnGrid?.addEventListener('click', () => {
    applyLayoutUI('grid');
    saveData();
    renderBoards();
  });

  // Theme Toggle
  document.getElementById('btn-toggle-theme').addEventListener('click', toggleTheme);

  // Print button
  document.getElementById('btn-print').addEventListener('click', () => {
    window.print();
  });

  // Backup & Restore
  document.getElementById('btn-backup').addEventListener('click', () => {
    const modal = document.getElementById('modal-backup');
    resetModalDragPositions(modal);
    modal.classList.remove('hidden');
    hydrateSketchy(modal);
  });

  document.getElementById('btn-export-json').addEventListener('click', exportDataJSON);
  
  const fileInput = document.getElementById('input-import-file');
  document.getElementById('btn-trigger-import').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', importDataJSON);

  document.getElementById('btn-reset-default').addEventListener('click', () => {
    if (confirm('Khôi phục lại dữ liệu mẫu gốc ban đầu?')) {
      state.boards = [...DEFAULT_BOARDS];
      state.tasks = [...DEFAULT_TASKS];
      state.activeMobileBoardId = state.boards[0].id;
      saveData();
      const backupModal = document.getElementById('modal-backup');
      backupModal.classList.add('hidden');
      resetModalDragPositions(backupModal);
      renderAll();
      showToast('Đã khôi phục sổ tay gốc!');
    }
  });
}

// --- Theme Management ---
function updateThemeToggleIcon(isDark) {
  const iconEl = document.getElementById('icon-theme-emoji');
  if (!iconEl) return;
  const iconName = isDark ? 'sun' : 'moon';
  iconEl.setAttribute('data-sketchy', iconName);
  iconEl.setAttribute('data-accent', isDark ? '#fde047' : '#fef08a');
  if (window.Sketchy) {
    iconEl.innerHTML = window.Sketchy.icon(iconName, {
      size: 16,
      accent: isDark ? '#fde047' : '#fef08a'
    });
  }
}

function applySavedTheme() {
  const saved = localStorage.getItem(LS_KEYS.THEME);
  const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateThemeToggleIcon(isDark);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem(LS_KEYS.THEME, isDark ? 'dark' : 'light');
  updateThemeToggleIcon(isDark);
  if (window.TanasAuth && typeof window.TanasAuth.isLoggedIn === 'function' && window.TanasAuth.isLoggedIn()) {
    window.TanasAuth.queueRemoteSave();
  } else {
    scheduleDiskSave();
  }
}

// --- Backup & Export ---
function exportDataJSON() {
  const exportPayload = {
    appName: 'ThoiGianBieuTanas',
    version: '3.0',
    exportDate: new Date().toISOString(),
    boards: state.boards,
    tasks: state.tasks
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `thoi-gian-bieu-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast('Đã xuất file sao lưu thành công!');
}

function importDataJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && Array.isArray(data.boards) && Array.isArray(data.tasks)) {
        state.boards = data.boards;
        state.tasks = data.tasks;
        cleanLegacyLabels();
        state.activeMobileBoardId = state.boards[0]?.id || null;
        localStorage.setItem('schedule_sync_banner_dismissed', '1');
        saveData();
        renderAll();
        setupMigrationBanner();
        const backupModal = document.getElementById('modal-backup');
        backupModal.classList.add('hidden');
        resetModalDragPositions(backupModal);
        showToast('Nhập dữ liệu thành công!');
      } else {
        alert('File không hợp lệ hoặc thiếu dữ liệu bảng biểu.');
      }
    } catch (err) {
      alert('Không thể đọc file JSON. Vui lòng kiểm tra lại!');
    }
  };
  reader.readAsText(file);
}

// --- Toast System Cute ---
function showToast(message, duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 px-4 py-2.5 rounded-2xl border-2 border-pink-400 shadow-[3px_3px_0px_#db2777] text-xs font-bold flex items-center gap-2 transform transition-all duration-300 translate-y-4 opacity-0';
  toast.innerHTML = `
    <span class="inline-flex items-center text-pink-300 dark:text-pink-600">${sketchyHtml('sparkles', { size: 15, accent: '#fef08a', animate: false })}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// --- 1-Image All Days Poster Export System ---
function openImageExportModal() {
  const modal = document.getElementById('modal-export-image');
  if (!modal) return;

  resetModalDragPositions(modal);

  // Set default ratio active
  setPosterRatio(posterConfig.format || 'mobile');

  // Open modal
  modal.classList.remove('hidden');
  hydrateSketchy(modal);
  updatePosterPreview();
}

function setPosterRatio(ratio) {
  posterConfig.format = ratio;

  // Update ratio buttons active state
  document.querySelectorAll('.btn-poster-ratio').forEach(btn => {
    if (btn.getAttribute('data-ratio') === ratio) {
      btn.classList.add('active-ratio');
    } else {
      btn.classList.remove('active-ratio');
    }
  });

  // Update ratio label badge
  const labelBadge = document.getElementById('poster-ratio-badge');
  if (labelBadge) {
    if (ratio === 'mobile') labelBadge.textContent = 'Tỷ lệ: 9:16 (Hình nền Điện thoại)';
    else if (ratio === 'desktop') labelBadge.textContent = 'Tỷ lệ: 16:9 (Hình nền Máy tính)';
    else labelBadge.textContent = 'Tỷ lệ: Lưới Sổ Tay Poster';
  }

  updatePosterPreview();
}

function setPosterTheme(bg, border, btnElem) {
  posterConfig.bg = bg;
  posterConfig.border = border;
  posterConfig.theme = btnElem ? (btnElem.getAttribute('data-theme') || (bg === '#18181b' ? 'dark' : 'light')) : (bg === '#18181b' ? 'dark' : 'light');

  // Update ring indicator on theme buttons
  document.querySelectorAll('.btn-poster-theme').forEach(b => {
    b.classList.remove('ring-2', 'ring-pink-500', 'ring-amber-400', 'border-pink-500', 'border-amber-400');
    b.classList.add('border-stone-700');
  });

  if (btnElem) {
    const ringClass = posterConfig.theme === 'dark' ? 'ring-amber-400' : 'ring-pink-500';
    btnElem.classList.add('ring-2', ringClass);
    btnElem.classList.remove('border-stone-700');
  }

  updatePosterPreview();
}

function renderPosterBoards(isDark) {
  const emptyIcons = ['sun', 'coffee', 'sparkles', 'heart', 'star', 'music', 'moon'];
  const emptyLabels = [
    'Ngày thảnh thơi',
    'Thư giãn nghỉ ngơi',
    'Tự do chill chill',
    'Nạp năng lượng',
    'Ngày tự do',
    'Thong thả chill',
    'Thư thái cuối tuần'
  ];

  return state.boards.map((board, index) => {
    let tasks = state.tasks.filter(t => t.boardId === board.id);
    tasks.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    const emptyIcon = sketchyHtml(emptyIcons[index % emptyIcons.length], {
      size: 12,
      accent: isDark ? '#52525b' : '#fef08a',
      animate: false
    });
    const emptyMsg = emptyLabels[index % emptyLabels.length];

    return `
      <div class="poster-day-card" style="border-top: 3px solid ${board.color};">
        <!-- Mini Washi Tape accent pinning the card -->
        <div class="poster-mini-tape" style="background-color: ${board.color};"></div>

        <div class="poster-day-header">
          <span class="flex items-center gap-1.5 poster-day-title" style="color: ${isDark ? '#f5f5f4' : '#1c1917'}; font-size: 0.78rem; font-weight: 800;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background-color: ${board.color}; display: inline-block;"></span>
            <span>${escapeHtml(board.title)}</span>
          </span>
          <span class="poster-day-count" style="font-size: 0.65rem; font-weight: 800; background: ${isDark ? '#27272a' : '#f5f5f4'}; border: 1px solid ${isDark ? '#52525b' : '#d6d3d1'}; color: ${isDark ? '#e4e4e7' : '#292524'}; padding: 1px 6px; border-radius: 9999px;">
            ${tasks.length} việc
          </span>
        </div>

        <div class="poster-task-list">
          ${tasks.length === 0 ? `
            <div class="poster-empty-text" style="display: flex; align-items: center; justify-content: center; gap: 4px; text-align: center; font-size: 0.68rem; color: ${isDark ? '#71717a' : '#a8a29e'}; padding: 0.3rem 0; font-weight: 600;">
              ${emptyIcon}
              <span>${emptyMsg}</span>
            </div>
          ` : tasks.map(task => `
            <div class="poster-task-item" style="border-left: 3px solid ${task.priority === 'high' ? '#f43f5e' : (task.priority === 'low' ? '#34d399' : '#fbbf24')};">
              ${task.sketchyKey ? `
                <span style="width: 17px; height: 17px; display: inline-flex; align-items: center; justify-content: center; margin-right: 4px; flex-shrink: 0; color: ${isDark ? '#f5f5f4' : '#1c1917'};">
                  ${sketchyHtml(task.sketchyKey, { size: 15, accent: isDark ? '#52525b' : '#fef08a', animate: false })}
                </span>
              ` : (task.iconUrl ? `
                <img src="${task.iconUrl}" crossOrigin="anonymous" class="poster-task-sticker" style="width: 17px; height: 17px; object-fit: contain; margin-right: 4px; flex-shrink: 0;">
              ` : '')}
              <span class="poster-task-time">
                ${task.startTime || '00:00'}-${task.endTime || '00:00'}
              </span>
              <div style="flex: 1; min-width: 0;">
                <div class="poster-task-title" style="font-weight: 800; color: ${isDark ? '#f5f5f4' : '#1c1917'}; line-height: 1.2; ${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                  ${escapeHtml(task.title)}
                </div>
                ${sanitizeCategoryLabel(task.category) ? `
                  <div class="poster-task-category" style="font-size: 0.62rem; color: ${isDark ? '#a1a1aa' : '#57534e'};">
                    ${escapeHtml(sanitizeCategoryLabel(task.category))}
                  </div>
                ` : ''}
              </div>
              ${task.completed ? `
                <span style="font-size: 0.68rem; flex-shrink: 0; color: #16a34a; font-weight: bold;">✓</span>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function generatePosterHTML(forCapture = false) {
  const format = posterConfig.format || 'mobile';
  const bg = posterConfig.bg || '#fffdf7';
  const isDark = posterConfig.theme === 'dark' || bg === '#18181b';

  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.completed).length;

  if (format === 'mobile') {
    return `
      <div class="poster-canvas format-mobile ${isDark ? 'dark-theme' : ''}" style="${isDark ? 'background-color: #121214; border-color: #f5f5f4;' : `background-color: ${bg}; border-color: #292524;`}">
        
        <!-- Top Decorative Washi Tape -->
        <div class="washi-tape coral" style="top: -10px;"></div>

        <!-- Top 1/3: Reserved Clock & Notification Area for Lock Screen Wallpaper -->
        <div class="poster-clock-area">
          ${!forCapture ? `
            <div class="lockscreen-clock-mockup">
              <div class="mockup-time">09:41</div>
              <div class="mockup-date">Thứ Hai, 24 tháng 11</div>
              <div class="mockup-hint" style="display:inline-flex;align-items:center;gap:4px;">${sketchyHtml('clock', { size: 12, accent: isDark ? '#52525b' : '#fef08a', animate: false })} Vị trí đồng hồ màn hình khóa (sẽ để trống khi tải ảnh)</div>
            </div>
          ` : `
            <!-- Empty space reserved for phone lock screen clock -->
          `}
        </div>

        <!-- Bottom 2/3: Full Schedule Area containing all boards -->
        <div class="poster-schedule-area">
          <div class="text-center pb-2 mb-2 border-b-2 border-dashed ${isDark ? 'border-zinc-700' : 'border-stone-800'}">
            <h2 class="poster-title" style="font-size: 1.1rem; font-weight: 900; margin: 0; color: ${isDark ? '#f5f5f4' : '#1c1917'}; text-transform: uppercase; letter-spacing: -0.5px;">
              Lịch Tuần Của Tôi
            </h2>
            <div class="flex items-center justify-center gap-2 mt-1">
              <span style="font-size: 0.68rem; font-weight: 800; ${isDark ? 'background: #27272a; color: #facc15; border: 1.5px solid #ca8a04;' : 'background: #fef08a; color: #1c1917; border: 1.5px solid #292524;'} padding: 1.5px 8px; border-radius: 9999px;">
                Đã hoàn thành ${completedTasks}/${totalTasks} việc
              </span>
            </div>
          </div>

          <!-- Boards Container (2 columns grid for Mon-Sun) -->
          <div class="poster-boards-wrap">
            ${renderPosterBoards(isDark)}
          </div>
        </div>

      </div>
    `;
  }

  // Desktop or Poster format
  return `
    <div class="poster-canvas format-${format} ${isDark ? 'dark-theme' : ''}" style="${isDark ? 'background-color: #121214; border-color: #f5f5f4;' : `background-color: ${bg}; border-color: #292524;`}">
      
      <!-- Top Decorative Washi Tape -->
      <div class="washi-tape coral" style="top: -10px;"></div>

      <!-- Poster Header -->
      <div class="text-center pb-2.5 mb-2.5 border-b-2 border-dashed ${isDark ? 'border-zinc-700' : 'border-stone-800'}">
        <h2 class="poster-title" style="font-size: 1.25rem; font-weight: 900; margin: 0; color: ${isDark ? '#f5f5f4' : '#1c1917'}; text-transform: uppercase; letter-spacing: -0.5px;">
          Lịch Tuần Của Tôi
        </h2>
        <div class="flex items-center justify-center gap-2 mt-1">
          <span style="font-size: 0.72rem; font-weight: 800; ${isDark ? 'background: #27272a; color: #facc15; border: 1.5px solid #ca8a04;' : 'background: #fef08a; color: #1c1917; border: 1.5px solid #292524;'} padding: 1.5px 8px; border-radius: 9999px;">
            Đã hoàn thành ${completedTasks}/${totalTasks} việc
          </span>
        </div>
      </div>

      <!-- Boards Container -->
      <div class="poster-boards-wrap">
        ${renderPosterBoards(isDark)}
      </div>

    </div>
  `;
}

function updatePosterPreview() {
  const previewContainer = document.getElementById('poster-preview-container');
  if (!previewContainer) return;

  // Insert poster HTML
  previewContainer.innerHTML = generatePosterHTML(false);

  // Apply preview scale so it fits nicely inside the modal preview container
  const format = posterConfig.format || 'mobile';
  let scale = 0.26;
  let targetWidth = 720;
  if (format === 'desktop') {
    scale = 0.38;
    targetWidth = 1280;
  } else if (format === 'poster') {
    scale = 0.30;
    targetWidth = 900;
  }

  previewContainer.style.width = `${targetWidth}px`;
  previewContainer.style.transform = `scale(${scale})`;
  previewContainer.style.transformOrigin = 'top center';

  // Prevent excess scroll space caused by unscaled bounding box
  requestAnimationFrame(() => {
    const canvas = previewContainer.querySelector('.poster-canvas');
    if (canvas) {
      const actualHeight = canvas.offsetHeight;
      previewContainer.style.height = `${actualHeight}px`;
      previewContainer.style.marginBottom = `-${(1 - scale) * actualHeight}px`;
      previewContainer.style.marginRight = `-${(1 - scale) * (targetWidth / 2)}px`;
      previewContainer.style.marginLeft = `-${(1 - scale) * (targetWidth / 2)}px`;
    }
  });
}

async function downloadPosterImage() {
  const btn = document.getElementById('btn-download-poster');
  const btnText = document.getElementById('btn-download-poster-text');
  const captureWrapper = document.getElementById('poster-capture-wrapper');

  if (typeof html2canvas === 'undefined') {
    alert('Thư viện vẽ ảnh đang được tải, vui lòng thử lại sau vài giây!');
    return;
  }

  // Update button state to loading
  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = 'Đang xử lý ảnh chất lượng cao...';

  try {
    // Render full unscaled poster in capture wrapper
    captureWrapper.innerHTML = generatePosterHTML(true);
    const targetElem = captureWrapper.firstElementChild;

    // Small delay to allow fonts and layout to settle
    await new Promise(r => setTimeout(r, 200));

    const isDark = posterConfig.theme === 'dark' || posterConfig.bg === '#18181b';
    const canvasBg = isDark ? '#121214' : (posterConfig.bg || '#fffdf7');

    // Run html2canvas with retina 2x scale
    const canvas = await html2canvas(targetElem, {
      scale: 2,
      useCORS: true,
      backgroundColor: canvasBg,
      width: targetElem.offsetWidth,
      height: targetElem.offsetHeight,
      logging: false
    });

    // Generate download link
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    const formatName = posterConfig.format === 'mobile' ? 'dien-thoai-9-16' : (posterConfig.format === 'desktop' ? 'may-tinh-16-9' : 'so-tay-tuan');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = dataURL;
    a.download = `thoi-gian-bieu-${formatName}-${dateStr}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Clean up wrapper
    captureWrapper.innerHTML = '';

    showToast('Đã tải ảnh thành công!');
  } catch (error) {
    console.error('Lỗi khi xuất ảnh:', error);
    alert('Không thể tạo ảnh. Vui lòng thử lại!');
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = 'Tải Ảnh PNG Về Máy (Nét Cao)';
  }
}

// --- Cute Stickers, Sketchy Vectors & Dashboard Icons System ---
function openIconsModal() {
  const modal = document.getElementById('modal-icons');
  if (!modal) return;
  resetModalDragPositions(modal);
  activeIconCategory = 'all';
  iconSearchQuery = '';
  const searchInput = document.getElementById('input-search-icons');
  if (searchInput) searchInput.value = '';

  // Update 3 source tabs state
  const tabConfigs = [
    { id: 'tab-source-irasutoya', source: 'irasutoya', activeClass: 'bg-pink-300' },
    { id: 'tab-source-sketchy', source: 'sketchy', activeClass: 'bg-amber-300' },
    { id: 'tab-source-dashboard', source: 'dashboard', activeClass: 'bg-teal-300' }
  ];
  tabConfigs.forEach(({ id, source, activeClass }) => {
    const tab = document.getElementById(id);
    if (!tab) return;
    tab.classList.remove('bg-pink-300', 'bg-amber-300', 'bg-teal-300', 'text-stone-900', 'shadow-[2px_2px_0px_#292524]', 'active-source');
    tab.classList.remove('bg-stone-100', 'dark:bg-stone-800', 'text-stone-600', 'dark:text-stone-300');
    if (activeIconSource === source) {
      tab.classList.add(activeClass, 'text-stone-900', 'shadow-[2px_2px_0px_#292524]', 'active-source');
    } else {
      tab.classList.add('bg-stone-100', 'dark:bg-stone-800', 'text-stone-600', 'dark:text-stone-300');
    }
  });

  // Reset category chips
  document.querySelectorAll('.btn-icon-cat').forEach(b => {
    if (b.getAttribute('data-cat') === 'all') {
      b.classList.add('bg-teal-200', 'text-stone-900', 'border-stone-800');
      b.classList.remove('bg-stone-100', 'dark:bg-stone-800', 'text-stone-600');
    } else {
      b.classList.remove('bg-teal-200', 'text-stone-900', 'border-stone-800');
      b.classList.add('bg-stone-100', 'dark:bg-stone-800', 'text-stone-600', 'dark:text-stone-300');
    }
  });

  renderIconsGrid('all', '');
  modal.classList.remove('hidden');
  hydrateSketchy(modal);
}

function renderIconsGrid(cat = 'all', query = '') {
  const container = document.getElementById('icons-grid-display');
  if (!container) return;

  const isSketchy = activeIconSource === 'sketchy';
  const isIrasutoya = activeIconSource === 'irasutoya';
  let icons = isSketchy
    ? (window.Sketchy ? window.Sketchy.CATALOG : [])
    : (isIrasutoya ? IRASUTOYA_ICONS : DASHBOARD_ICONS);

  if (cat !== 'all') {
    icons = icons.filter(i => i.cat === cat);
  }
  if (query) {
    icons = icons.filter(i => 
      i.name.toLowerCase().includes(query) || 
      i.desc.toLowerCase().includes(query) ||
      i.id.toLowerCase().includes(query) ||
      (i.key && i.key.toLowerCase().includes(query))
    );
  }

  if (icons.length === 0) {
    const emptyLabel = isSketchy ? 'icon Sketchy' : (isIrasutoya ? 'sticker いらすとや' : 'icon');
    container.innerHTML = `
      <div class="col-span-full py-8 text-center text-stone-400">
        <div class="flex justify-center mb-1">${sketchyHtml('search', { size: 26, accent: '#bae6fd' })}</div>
        <p class="text-xs font-bold mt-1">Không tìm thấy ${emptyLabel} nào phù hợp</p>
      </div>
    `;
    return;
  }

  container.innerHTML = icons.map(icon => {
    if (isSketchy) {
      return `
        <div 
          onclick="selectIcon('${icon.id}')"
          class="p-2.5 rounded-xl border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-500 cursor-pointer shadow-sm hover:shadow transition flex items-center gap-2.5 group"
          title="Bấm để chọn icon Sketchy ${escapeHtml(icon.name)}"
        >
          <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 flex items-center justify-center p-1 flex-shrink-0 text-stone-800 dark:text-stone-100 group-hover:scale-110 transition">
            ${sketchyHtml(icon.key, { size: 26, accent: '#fef08a' })}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-black text-xs text-stone-800 dark:text-stone-100 truncate">${escapeHtml(icon.name)}</div>
            <div class="text-[10px] text-stone-400 truncate">${escapeHtml(icon.desc)}</div>
          </div>
        </div>
      `;
    } else if (isIrasutoya) {
      return `
        <div 
          onclick="selectIcon('${icon.id}')"
          class="p-2.5 rounded-xl border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:border-pink-500 cursor-pointer shadow-sm hover:shadow transition flex items-center gap-2.5 group"
          title="Bấm để dán sticker ${escapeHtml(icon.name)}"
        >
          <div class="w-10 h-10 rounded-xl bg-pink-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 flex items-center justify-center p-1 flex-shrink-0 group-hover:scale-115 transition">
            <img src="${icon.url}" alt="${icon.name}" class="w-8 h-8 object-contain">
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-black text-xs text-stone-800 dark:text-stone-100 truncate">${escapeHtml(icon.name)}</div>
            <div class="text-[10px] text-stone-400 truncate">${escapeHtml(icon.desc)}</div>
          </div>
          <span class="opacity-70">${sketchyHtml('sparkles', { size: 13, accent: '#fef08a' })}</span>
        </div>
      `;
    } else {
      return `
        <div 
          onclick="selectIcon('${icon.id}')"
          class="p-2.5 rounded-xl border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:border-teal-500 cursor-pointer shadow-sm hover:shadow transition flex items-center gap-2.5 group"
          title="Bấm để chèn icon ${escapeHtml(icon.name)}"
        >
          <div class="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-700 flex items-center justify-center p-1 flex-shrink-0 group-hover:scale-110 transition text-stone-700 dark:text-stone-200">
            <img src="${icon.url}" alt="${icon.name}" class="w-6 h-6 object-contain" onerror="this.outerHTML='<span class=\'inline-flex\'>★</span>'">
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-xs text-stone-800 dark:text-stone-100 truncate">${escapeHtml(icon.name)}</div>
            <div class="text-[10px] text-stone-400 truncate">${escapeHtml(icon.desc)}</div>
          </div>
        </div>
      `;
    }
  }).join('');
}

function selectIcon(iconId) {
  const sketchyCatalog = window.Sketchy ? window.Sketchy.CATALOG : [];
  const skIcon = sketchyCatalog.find(i => i.id === iconId);
  const icon = skIcon || IRASUTOYA_ICONS.find(i => i.id === iconId) || DASHBOARD_ICONS.find(i => i.id === iconId);
  if (!icon) return;

  const taskTitleInput = document.getElementById('task-title');
  const taskModal = document.getElementById('modal-task');

  // If task modal is open, set sticker or Sketchy icon on the task
  if (taskModal && !taskModal.classList.contains('hidden')) {
    const iconUrlInput = document.getElementById('task-icon-url');
    const sketchyInput = document.getElementById('task-sketchy-key');
    const badge = document.getElementById('task-selected-icon-badge');
    const badgeImg = document.getElementById('task-selected-icon-img');
    const badgeSketchy = document.getElementById('task-selected-sketchy-preview');
    const badgeName = document.getElementById('task-selected-icon-name');

    if (skIcon) {
      if (sketchyInput) sketchyInput.value = skIcon.key;
      if (iconUrlInput) iconUrlInput.value = '';
      if (badgeImg) badgeImg.classList.add('hidden');
      if (badgeSketchy) {
        badgeSketchy.innerHTML = sketchyHtml(skIcon.key, { size: 18, accent: '#fef08a', animate: false });
        badgeSketchy.classList.remove('hidden');
        badgeSketchy.classList.add('inline-flex');
      }
    } else {
      if (sketchyInput) sketchyInput.value = '';
      if (iconUrlInput) iconUrlInput.value = icon.url;
      if (badgeSketchy) {
        badgeSketchy.innerHTML = '';
        badgeSketchy.classList.add('hidden');
        badgeSketchy.classList.remove('inline-flex');
      }
      if (badgeImg) {
        badgeImg.src = icon.url;
        badgeImg.classList.remove('hidden');
      }
    }

    if (badgeName) badgeName.textContent = icon.name;
    if (badge) {
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    }

    if (taskTitleInput && !taskTitleInput.value.trim()) {
      taskTitleInput.value = icon.name;
    }
    showToast(`Đã chọn icon "${icon.name}"`);
  } else {
    navigator.clipboard?.writeText(icon.name);
    showToast(`Đã sao chép tên "${icon.name}"`);
  }

  // Close icons modal
  const iconsModal = document.getElementById('modal-icons');
  if (iconsModal) {
    iconsModal.classList.add('hidden');
    resetModalDragPositions(iconsModal);
  }
}

// --- Studio Bridge Functions (YouTube, Pomodoro, AI Assistant API) ---
function openTaskYouTube(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task || !task.youtubeUrl) return;
  if (window.StudioModules && typeof window.StudioModules.playYouTubeUrl === 'function') {
    window.StudioModules.playYouTubeUrl(task.youtubeUrl, task.title);
  } else {
    window.open(task.youtubeUrl, '_blank', 'noopener,noreferrer');
  }
}

function startPomodoroForTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  if (window.StudioModules && typeof window.StudioModules.startPomodoro === 'function') {
    window.StudioModules.startPomodoro(25, task.title);
  }
}

function resolveBoardIdForQuery(boardQuery) {
  if (!state.boards || state.boards.length === 0) return null;
  if (!boardQuery) {
    const todayBoard = state.boards.find(b => isBoardMatchingDay(b.title));
    return (todayBoard || state.boards[0]).id;
  }
  const q = String(boardQuery).toLowerCase().trim();
  if (q.includes('hôm nay') || q === 'today') {
    const todayBoard = state.boards.find(b => isBoardMatchingDay(b.title));
    if (todayBoard) return todayBoard.id;
  }
  if (q.includes('ngày mai') || q.includes('mai') || q === 'tomorrow') {
    const tomorrowIdx = (new Date().getDay() + 1) % 7;
    const tmrBoard = state.boards.find(b => isBoardMatchingDay(b.title, tomorrowIdx));
    if (tmrBoard) return tmrBoard.id;
  }
  const exact = state.boards.find(b => b.id === boardQuery || b.title.toLowerCase() === q);
  if (exact) return exact.id;

  const partial = state.boards.find(b => b.title.toLowerCase().includes(q));
  if (partial) return partial.id;

  // Match day abbreviations (t2..t7, cn)
  for (let d = 0; d < DAY_ALIASES.length; d++) {
    if (DAY_ALIASES[d].some(a => q.includes(a))) {
      const matched = state.boards.find(b => isBoardMatchingDay(b.title, d));
      if (matched) return matched.id;
    }
  }
  return state.boards[0].id;
}

function suggestStickerForText(text = '', category = '') {
  const s = `${text} ${category}`.toLowerCase();
  const findUrl = (id) => (IRASUTOYA_ICONS.find(i => i.id === id) || {}).url || IRASUTOYA_ICONS[0].url;
  if (s.includes('mèo') || s.includes('thi')) return findUrl('ira_cat_study');
  if (s.includes('code') || s.includes('lập trình') || s.includes('thiết kế') || s.includes('đồ họa')) return findUrl('ira_computer_worker');
  if (s.includes('họp') || s.includes('máy tính') || s.includes('công việc')) return findUrl('ira_laptop_smile');
  if (s.includes('chạy') || s.includes('thể dục') || s.includes('gym') || s.includes('thể thao')) return findUrl('ira_sport_girl');
  if (s.includes('cơm') || s.includes('ăn') || s.includes('trưa') || s.includes('tối')) return findUrl('ira_bento');
  if (s.includes('cà phê') || s.includes('cafe') || s.includes('trà') || s.includes('chill')) return findUrl('ira_coffee');
  if (s.includes('sách') || s.includes('truyện') || s.includes('đọc')) return findUrl('ira_reading_book');
  if (s.includes('báo thức') || s.includes('dậy') || s.includes('sáng')) return findUrl('ira_alarm_clock');
  return findUrl('ira_study_usagi');
}

window.ScheduleAPI = {
  getState: () => ({ boards: state.boards, tasks: state.tasks }),
  getExportPayload: () => ({
    boards: state.boards,
    tasks: state.tasks,
    deviceMode: state.deviceMode,
    layout: state.layout,
    theme: localStorage.getItem(LS_KEYS.THEME) || 'light',
    streak: (() => {
      try { return JSON.parse(localStorage.getItem(LS_KEYS.STREAK) || 'null'); } catch (_) { return null; }
    })(),
    preferences: window.StudioModules?.getPreferences
      ? window.StudioModules.getPreferences(Boolean(window.TanasAuth?.isLoggedIn?.()))
      : {},
    updatedAt: Number(localStorage.getItem('schedule_last_saved_at') || Date.now())
  }),
  applyRemoteSchedule: (data, ownerId = null) => {
    if (!data || !Array.isArray(data.boards) || !Array.isArray(data.tasks)) return false;
    state.boards = data.boards;
    state.tasks = data.tasks;
    if (data.deviceMode) state.deviceMode = data.deviceMode;
    applyLayoutUI(data.layout || 'columns');
    if (data.theme) {
      localStorage.setItem(LS_KEYS.THEME, data.theme);
      applySavedTheme();
    }
    if (data.streak) {
      localStorage.setItem(LS_KEYS.STREAK, JSON.stringify(data.streak));
    } else {
      localStorage.removeItem(LS_KEYS.STREAK);
    }
    if (data.preferences && window.StudioModules?.applyPreferences) {
      window.StudioModules.applyPreferences(data.preferences);
    }
    cleanLegacyLabels();
    localStorage.setItem(LS_KEYS.BOARDS, JSON.stringify(state.boards));
    localStorage.setItem(LS_KEYS.TASKS, JSON.stringify(state.tasks));
    localStorage.setItem(LS_KEYS.MODE, state.deviceMode);
    if (ownerId) {
      localStorage.setItem(LS_KEYS.DATA_OWNER, String(ownerId));
    }
    localStorage.setItem('schedule_last_saved_at', String(data.updatedAt || Date.now()));
    localStorage.setItem('schedule_sync_banner_dismissed', '1');
    if (state.boards.length > 0 && !state.boards.some(b => b.id === state.activeMobileBoardId)) {
      state.activeMobileBoardId = state.boards[0].id;
    }
    renderAll();
    setupMigrationBanner();
    return true;
  },
  isGuestDataEligibleForUpload: (targetUserId) => {
    const owner = localStorage.getItem(LS_KEYS.DATA_OWNER);
    return !owner || owner === 'guest' || (targetUserId && owner === String(targetUserId));
  },
  setDataOwner: (ownerId) => {
    if (ownerId) localStorage.setItem(LS_KEYS.DATA_OWNER, String(ownerId));
    else localStorage.removeItem(LS_KEYS.DATA_OWNER);
  },
  resetToDefaultView: (ownerId = 'guest') => {
    state.boards = JSON.parse(JSON.stringify(DEFAULT_BOARDS));
    state.tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    state.deviceMode = 'desktop';
    state.filterStatus = 'all';
    state.searchQuery = '';
    state.activeMobileBoardId = state.boards[0]?.id || null;
    localStorage.removeItem(LS_KEYS.BOARDS);
    localStorage.removeItem(LS_KEYS.TASKS);
    localStorage.removeItem(LS_KEYS.MODE);
    localStorage.removeItem(LS_KEYS.STREAK);
    localStorage.removeItem(LS_KEYS.LAYOUT);
    localStorage.removeItem('schedule_last_saved_at');
    if (ownerId) localStorage.setItem(LS_KEYS.DATA_OWNER, String(ownerId));
    else localStorage.removeItem(LS_KEYS.DATA_OWNER);
    applyLayoutUI('columns');
    if (window.StudioModules?.applyPreferences) {
      window.StudioModules.applyPreferences({
        notificationsEnabled: false,
        ambientPreset: 'lofi',
        musicVolume: 45,
        pomoMinutes: 25,
        aiProvider: 'gemini',
        aiEndpoint: 'https://api.openai.com/v1/chat/completions',
        aiModel: 'gemini-3.8-flash',
        aiApiKey: '',
        resetAiKey: true
      });
    }
    renderAll();
    setupMigrationBanner();
  },
  getCurrentTimeInfo: () => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const now = new Date();
    return {
      date: getLocalDateStr(now),
      weekday: days[now.getDay()],
      time: getCurrentHHMM()
    };
  },
  isBoardMatchingDay,
  isTaskLiveNow,
  showToast,
  refreshUI: () => {
    renderBoards();
    renderStats();
    hydrateSketchy(document);
  },
  createTask: (params = {}) => {
    const boardId = resolveBoardIdForQuery(params.board || params.boardId || 'hôm nay');
    const board = state.boards.find(b => b.id === boardId);
    const title = (params.title || 'Ghi chú mới').trim();
    const startTime = params.startTime || getCurrentHHMM();
    let endTime = params.endTime || '';
    if (!endTime) {
      const [hh, mm] = startTime.split(':').map(Number);
      const nextH = ((isNaN(hh) ? 9 : hh) + 1) % 24;
      endTime = `${String(nextH).padStart(2, '0')}:${String(isNaN(mm) ? 0 : mm).padStart(2, '0')}`;
    }
    const subtasks = Array.isArray(params.subtasks)
      ? params.subtasks.filter(Boolean).map((st, idx) => ({
          id: `st_${Date.now()}_${idx}`,
          title: typeof st === 'string' ? st : (st.title || ''),
          done: false
        }))
      : [];

    const newTask = {
      id: 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      boardId,
      title,
      startTime,
      endTime,
      category: params.category || 'Việc cá nhân',
      priority: ['high', 'medium', 'low'].includes(params.priority) ? params.priority : 'medium',
      notes: params.notes || '',
      iconUrl: params.sketchyKey ? null : suggestStickerForText(title, params.category || ''),
      sketchyKey: params.sketchyKey || null,
      youtubeUrl: params.youtubeUrl || '',
      remindMinutes: Number(params.remindMinutes) || 0,
      subtasks,
      isHabit: Boolean(params.isHabit),
      completed: false,
      createdAt: Date.now()
    };

    state.tasks.push(newTask);
    saveData();
    renderAll();
    return { task: newTask, boardTitle: board ? board.title : '' };
  },
  completeTask: (query) => {
    if (!query) return null;
    const q = String(query).toLowerCase().trim();
    const match = state.tasks.find(t => !t.completed && t.title.toLowerCase().includes(q));
    if (!match) return null;
    match.completed = true;
    recordStreakCompletion();
    saveData();
    renderAll();
    return match;
  },
  createBoard: (title, color = '#c084fc') => {
    if (!title) return null;
    const b = {
      id: 'b_' + Date.now(),
      title: String(title).trim(),
      color,
      tape: TAPE_CLASSES[state.boards.length % TAPE_CLASSES.length]
    };
    state.boards.push(b);
    saveData();
    renderAll();
    return b;
  }
};

// --- Utilities ---
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
