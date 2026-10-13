// Local-First Storage & Offline State Management with Top-Left Account Pop-up & Habit Milestone Photo Stamps

const STORAGE_KEY_LEGACY_JOURNEYS = 'bloomtrail_journeys_v1';
const STORAGE_KEY_LEGACY_SETTINGS = 'bloomtrail_settings_v1';

const STORAGE_KEY_ACCOUNTS = 'bloomtrail_accounts_v2';
const STORAGE_KEY_ACTIVE_ACCOUNT_ID = 'bloomtrail_active_account_id_v2';

// Default cozy starter roadmaps (used for account initial seed or fallback)
const DEFAULT_JOURNEYS = [
  {
    id: 'journey-webdev',
    title: '🌱 Cozy Coder Expedition',
    description: 'From tiny sprout to confident creator building dreamy applications.',
    icon: '🌱',
    themeColor: '#7BDCB5',
    createdAt: new Date().toISOString(),
    milestones: [
      {
        id: 'ms-1',
        title: 'Master HTML & CSS Magic',
        description: 'Learn layout foundations, flexbox, grid, and pastel animations.',
        status: 'completed',
        targetDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
        reminderTime: '10:00',
        reminderEnabled: false,
        rewardSticker: '🌱 Little Sprout',
        reflection: 'Built my very first cozy button with a gentle bounce!',
        completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        subtasks: [
          { id: 'st-1', title: 'Learn semantic elements & meta tags', completed: true },
          { id: 'st-2', title: 'Build a cute flexbox card gallery', completed: true },
          { id: 'st-3', title: 'Experiment with bubbly CSS animations', completed: true },
        ],
      },
      {
        id: 'ms-2',
        title: 'JavaScript & Interactive Sparks',
        description: 'Understand functions, state logic, audio synth, and localStorage.',
        status: 'completed',
        targetDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
        reminderTime: '14:30',
        reminderEnabled: false,
        rewardSticker: '☕ Warm Mug',
        reflection: 'Connected Web Audio API and heard my first synthesized chime!',
        completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        subtasks: [
          { id: 'st-4', title: 'Array operations and map/filter patterns', completed: true },
          { id: 'st-5', title: 'Service Worker and offline cache events', completed: true },
          { id: 'st-6', title: 'Local-first data persistence', completed: true },
        ],
      },
      {
        id: 'ms-3',
        title: 'Build My First Offline PWA',
        description: 'Craft a responsive, installable web application with notifications.',
        status: 'in_progress',
        targetDate: new Date().toISOString().split('T')[0],
        reminderTime: '18:00',
        reminderEnabled: true,
        rewardSticker: '🎒 Wanderer Backpack',
        reflection: '',
        completedAt: null,
        subtasks: [
          { id: 'st-7', title: 'Register Service Worker for offline use', completed: true },
          { id: 'st-8', title: 'Add Web Notifications and ringtones', completed: false },
          { id: 'st-9', title: 'Connect cozy calendar schedule view', completed: false },
        ],
      },
      {
        id: 'ms-4',
        title: 'Deploy Live to Vercel',
        description: 'Publish project with custom domain and automatic HTTPS security.',
        status: 'locked',
        targetDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        reminderTime: '12:00',
        reminderEnabled: true,
        rewardSticker: '⭐ Golden Star',
        reflection: '',
        completedAt: null,
        subtasks: [
          { id: 'st-10', title: 'Test production build locally with Vite', completed: false },
          { id: 'st-11', title: 'Push git repository & link Vercel project', completed: false },
          { id: 'st-12', title: 'Install PWA onto phone home screen', completed: false },
        ],
      },
      {
        id: 'ms-5',
        title: 'Create Dream Portfolio App',
        description: 'Showcase personal progression and inspiring future milestones!',
        status: 'locked',
        targetDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        reminderTime: '09:00',
        reminderEnabled: false,
        rewardSticker: '👑 Cozy Crown',
        reflection: '',
        completedAt: null,
        subtasks: [
          { id: 'st-13', title: 'Design sticker album achievements page', completed: false },
          { id: 'st-14', title: 'Gather friendly feedback and polish UX', completed: false },
        ],
      },
    ],
  },
  {
    id: 'journey-mindfulness',
    title: '🌸 Mind & Body Wellness',
    description: 'Nurture habits that bring peace, joy, and gentle daily energy.',
    icon: '🌸',
    themeColor: '#FFB3BA',
    createdAt: new Date().toISOString(),
    milestones: [
      {
        id: 'ms-w1',
        title: 'Morning Sun & Hydration Habit',
        description: 'Drink warm lemon water and take 10 deep breaths by the window.',
        status: 'completed',
        targetDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        reminderTime: '07:30',
        reminderEnabled: false,
        rewardSticker: '🍵 Warm Matcha',
        reflection: 'Felt so refreshed starting the morning without screen glare.',
        completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        subtasks: [
          { id: 'stw-1', title: 'Keep water bottle next to bed', completed: true },
          { id: 'stw-2', title: '5 minutes morning stretch', completed: true },
        ],
      },
      {
        id: 'ms-w2',
        title: 'Evening 20-Min Cozy Reading',
        description: 'Replace bedtime doomscrolling with inspiring books.',
        status: 'in_progress',
        targetDate: new Date().toISOString().split('T')[0],
        reminderTime: '21:00',
        reminderEnabled: true,
        rewardSticker: '🌙 Cozy Moon',
        reflection: '',
        completedAt: null,
        subtasks: [
          { id: 'stw-3', title: 'Put phone on charge outside bedroom', completed: false },
          { id: 'stw-4', title: 'Read one chapter before sleep', completed: false },
        ],
      },
    ],
  },
];

// Default Habit Milestones (e.g. Jogging 3 days minimum a week with mandatory picture proof)
const DEFAULT_HABIT_MILESTONES = [
  {
    id: 'habit-jogging',
    title: 'Jogging',
    targetDaysPerWeek: 3,
    icon: '🏃',
    themeColor: '#FF9AA2',
    description: 'Jog 3 days minimum a week. Mandatory picture proof required for every stamp!',
    category: 'Fitness',
    createdAt: new Date().toISOString(),
    stamps: [],
  },
  {
    id: 'habit-reading',
    title: 'Mindful Reading',
    targetDaysPerWeek: 4,
    icon: '📖',
    themeColor: '#B5EAEA',
    description: 'Read 20+ minutes of a book. Mandatory photo proof of your page!',
    category: 'Focus',
    createdAt: new Date().toISOString(),
    stamps: [],
  },
];

const DEFAULT_SETTINGS = {
  ringtone: 'morning_bell',
  volume: 0.8,
  soundEffects: true,
  syncCode: 'BLOOM-' + Math.floor(1000 + Math.random() * 9000),
  lastSyncTime: null,
  streakCount: 3,
  lastStreakDate: new Date().toISOString().split('T')[0],
};

export const storageService = {
  // ---------------------------------------------------------------------
  // Dynamic User Accounts (Top-Left Pop-Up & PIN Protection)
  // ---------------------------------------------------------------------

  getAccounts() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out extra mock Netflix accounts (acc-2, acc-3, acc-4) if they were auto-seeded
          // but preserve acc-1 (Alex) and any custom accounts created by the user
          const cleaned = parsed.filter(a => a.id === 'acc-1' || (!['acc-2', 'acc-3', 'acc-4'].includes(a.id)));
          return cleaned.length > 0 ? cleaned : parsed;
        }
      }

      // Check if user already had legacy data or active account (preserve Alex and user's quests)
      const legacyJourneys = localStorage.getItem(STORAGE_KEY_LEGACY_JOURNEYS);
      const acc1Journeys = localStorage.getItem('bloomtrail_acc_acc-1_journeys_v2');
      if (legacyJourneys || acc1Journeys) {
        const initialAcc = [{
          id: 'acc-1',
          name: 'Alex',
          avatar: '🦊',
          pin: '1234',
          themeColor: '#FF9AA2',
          bio: 'Cozy Explorer',
          createdAt: new Date().toISOString(),
        }];
        this.saveAccounts(initialAcc);
        return initialAcc;
      }
    } catch (e) {
      console.error('Failed to load accounts', e);
    }
    return [];
  },

  saveAccounts(accounts) {
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts', e);
    }
  },

  addAccount({ name, avatar = '🦊', pin = '1234', themeColor = '#FF9AA2', bio = '' }) {
    const accounts = this.getAccounts();
    const newAcc = {
      id: 'acc-' + Date.now(),
      name: name.trim() || 'New Explorer',
      avatar: avatar || '🦊',
      pin: String(pin || '1234').trim(),
      themeColor: themeColor || '#FF9AA2',
      bio: bio.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...accounts, newAcc];
    this.saveAccounts(updated);
    this.setActiveAccountId(newAcc.id);
    return newAcc;
  },

  deleteAccount(accId) {
    const accounts = this.getAccounts();
    const updated = accounts.filter((a) => a.id !== accId);
    this.saveAccounts(updated);
    if (this.getActiveAccountId() === accId) {
      this.setActiveAccountId(updated[0]?.id || null);
    }
    return updated;
  },

  getActiveAccountId() {
    try {
      const id = localStorage.getItem(STORAGE_KEY_ACTIVE_ACCOUNT_ID);
      const accounts = this.getAccounts();
      if (id && accounts.some((a) => a.id === id)) {
        return id;
      }
      if (accounts.length > 0) {
        return accounts[0].id;
      }
    } catch (e) {
      console.error('Failed to get active account id', e);
    }
    return null;
  },

  setActiveAccountId(accId) {
    try {
      if (accId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_ACCOUNT_ID, accId);
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_ACCOUNT_ID);
      }
    } catch (e) {
      console.error('Failed to set active account id', e);
    }
  },

  getActiveAccount() {
    const accId = this.getActiveAccountId();
    if (!accId) return null;
    const accounts = this.getAccounts();
    return accounts.find((a) => a.id === accId) || null;
  },

  verifyAccountPin(accId, inputPin) {
    const accounts = this.getAccounts();
    const account = accounts.find((a) => a.id === accId);
    if (!account) return false;
    return String(account.pin || '1234') === String(inputPin).trim();
  },

  updateAccountPin(accId, newPin) {
    const accounts = this.getAccounts();
    const updated = accounts.map((a) => (a.id === accId ? { ...a, pin: String(newPin).trim() } : a));
    this.saveAccounts(updated);
    return true;
  },

  updateAccountProfile(accId, profileUpdates) {
    const accounts = this.getAccounts();
    const updated = accounts.map((a) => (a.id === accId ? { ...a, ...profileUpdates } : a));
    this.saveAccounts(updated);
    return updated.find((a) => a.id === accId);
  },

  // ---------------------------------------------------------------------
  // Journeys & Milestones (Per Account & Legacy Fallback)
  // ---------------------------------------------------------------------

  _getJourneysKey(accId = this.getActiveAccountId()) {
    const effectiveId = accId || 'default';
    return `bloomtrail_acc_${effectiveId}_journeys_v2`;
  },

  loadJourneys(accId = this.getActiveAccountId()) {
    const effectiveId = accId || 'acc-1';
    try {
      const key = this._getJourneysKey(effectiveId);
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }

      // Check legacy key for Account 1 migration
      if (effectiveId === 'acc-1') {
        const legacyData = localStorage.getItem(STORAGE_KEY_LEGACY_JOURNEYS);
        if (legacyData) {
          const parsedLegacy = JSON.parse(legacyData);
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            this.saveJourneys(parsedLegacy, 'acc-1');
            return parsedLegacy;
          }
        }
      }
    } catch (e) {
      console.error('Failed to load journeys from localStorage', e);
    }

    // Default seed for this account
    this.saveJourneys(DEFAULT_JOURNEYS, effectiveId);
    return DEFAULT_JOURNEYS;
  },

  saveJourneys(journeys, accId = this.getActiveAccountId()) {
    const effectiveId = accId || 'acc-1';
    try {
      const key = this._getJourneysKey(effectiveId);
      localStorage.setItem(key, JSON.stringify(journeys));
      if (effectiveId === 'acc-1') {
        localStorage.setItem(STORAGE_KEY_LEGACY_JOURNEYS, JSON.stringify(journeys));
      }
    } catch (e) {
      console.error('Failed to save journeys', e);
    }
  },

  // ---------------------------------------------------------------------
  // Habit Milestones & Mandatory Picture Proof Stamps (Per Account)
  // ---------------------------------------------------------------------

  _getHabitsKey(accId = this.getActiveAccountId()) {
    const effectiveId = accId || 'default';
    return `bloomtrail_acc_${effectiveId}_habits_v2`;
  },

  loadHabitMilestones(accId = this.getActiveAccountId()) {
    const effectiveId = accId || 'acc-1';
    try {
      const key = this._getHabitsKey(effectiveId);
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load habit milestones', e);
    }
    this.saveHabitMilestones(DEFAULT_HABIT_MILESTONES, effectiveId);
    return DEFAULT_HABIT_MILESTONES;
  },

  saveHabitMilestones(habits, accId = this.getActiveAccountId()) {
    const effectiveId = accId || 'acc-1';
    try {
      const key = this._getHabitsKey(effectiveId);
      localStorage.setItem(key, JSON.stringify(habits));
    } catch (e) {
      console.error('Failed to save habit milestones', e);
    }
  },

  getHabitWeeklyStatus(habit, referenceDate = new Date()) {
    const target = habit.targetDaysPerWeek || 3;
    const stamps = habit.stamps || [];

    const ref = new Date(referenceDate);
    const dayOfWeek = ref.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const mondayStr = monday.toISOString().split('T')[0];
    const sundayStr = sunday.toISOString().split('T')[0];

    const thisWeekStamps = stamps.filter((s) => s.date >= mondayStr && s.date <= sundayStr);
    const uniqueDays = new Set(thisWeekStamps.map((s) => s.date));
    const completedDays = uniqueDays.size;

    const isReached = completedDays >= target;
    const daysLeft = Math.max(0, target - completedDays);
    const progressPercent = Math.min(100, Math.round((completedDays / target) * 100));

    let statusMessage = '';
    if (isReached) {
      statusMessage = `🎉 Milestone Reached! ${completedDays}/${target} days completed this week with photo proof! ⭐`;
    } else if (completedDays === 0) {
      statusMessage = `🌱 Not started this week. ${daysLeft} more day${daysLeft > 1 ? 's' : ''} needed to reach your weekly milestone!`;
    } else {
      statusMessage = `🏃 ${completedDays}/${target} days completed this week. Only ${daysLeft} more day${daysLeft > 1 ? 's' : ''} to reach your milestone!`;
    }

    const weekDays = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      const stampForDay = thisWeekStamps.find((s) => s.date === dStr) || null;
      weekDays.push({
        dayName: dayNames[i],
        date: dStr,
        isStamped: Boolean(stampForDay),
        stamp: stampForDay,
        isToday: dStr === new Date().toISOString().split('T')[0],
      });
    }

    return {
      completedDays,
      target,
      daysLeft,
      isReached,
      progressPercent,
      statusMessage,
      thisWeekStamps,
      weekDays,
      mondayStr,
      sundayStr,
    };
  },

  // ---------------------------------------------------------------------
  // Settings (Per Account & Legacy Fallback)
  // ---------------------------------------------------------------------

  _getSettingsKey(accId = this.getActiveAccountId()) {
    const effectiveId = accId || 'default';
    return `bloomtrail_acc_${effectiveId}_settings_v2`;
  },

  loadSettings(accId = this.getActiveAccountId()) {
    const effectiveId = accId || 'acc-1';
    try {
      const key = this._getSettingsKey(effectiveId);
      const data = localStorage.getItem(key);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }

      if (effectiveId === 'acc-1') {
        const legacyData = localStorage.getItem(STORAGE_KEY_LEGACY_SETTINGS);
        if (legacyData) {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(legacyData) };
        }
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings, accId = this.getActiveAccountId()) {
    const effectiveId = accId || 'acc-1';
    try {
      const key = this._getSettingsKey(effectiveId);
      localStorage.setItem(key, JSON.stringify(settings));
      if (effectiveId === 'acc-1') {
        localStorage.setItem(STORAGE_KEY_LEGACY_SETTINGS, JSON.stringify(settings));
      }
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  // ---------------------------------------------------------------------
  // JSON Backup / Restore
  // ---------------------------------------------------------------------

  exportJSONBackup() {
    const currentAcc = this.getActiveAccount();
    const currentAccId = currentAcc?.id || 'acc-1';
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      account: currentAcc,
      accounts: this.getAccounts(),
      journeys: this.loadJourneys(currentAccId),
      habitMilestones: this.loadHabitMilestones(currentAccId),
      settings: this.loadSettings(currentAccId),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BloomTrail_${currentAcc?.name || 'Backup'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importJSONBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      const activeId = this.getActiveAccountId() || 'acc-1';
      if (data && Array.isArray(data.journeys)) {
        this.saveJourneys(data.journeys, activeId);
        if (Array.isArray(data.habitMilestones)) {
          this.saveHabitMilestones(data.habitMilestones, activeId);
        }
        if (data.settings) {
          this.saveSettings(data.settings, activeId);
        }
        if (Array.isArray(data.accounts)) {
          this.saveAccounts(data.accounts);
        }
        return true;
      }
    } catch (e) {
      console.error('Import error', e);
    }
    return false;
  },

  getStats(journeys) {
    let totalMilestones = 0;
    let completedMilestones = 0;
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    const earnedStickers = [];

    (journeys || []).forEach((j) => {
      (j.milestones || []).forEach((m) => {
        totalMilestones++;
        if (m.status === 'completed') {
          completedMilestones++;
          if (m.rewardSticker) {
            earnedStickers.push({
              sticker: m.rewardSticker,
              milestoneTitle: m.title,
              journeyTitle: j.title,
              date: m.completedAt || m.targetDate,
            });
          }
        }
        if (m.subtasks) {
          m.subtasks.forEach((st) => {
            totalSubtasks++;
            if (st.completed) completedSubtasks++;
          });
        }
      });
    });

    const completionRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    return {
      totalJourneys: (journeys || []).length,
      totalMilestones,
      completedMilestones,
      totalSubtasks,
      completedSubtasks,
      completionRate,
      earnedStickers,
    };
  },
};
