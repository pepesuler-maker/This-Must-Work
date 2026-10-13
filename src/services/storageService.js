// Local-First Storage & Offline State Management

const STORAGE_KEY_JOURNEYS = 'bloomtrail_journeys_v1';
const STORAGE_KEY_SETTINGS = 'bloomtrail_settings_v1';

// Default cozy starter roadmaps
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

const DEFAULT_SETTINGS = {
  ringtone: 'morning_bell', // morning_bell, cozy_marimba, bubble_harp, stardust_fanfare
  volume: 0.8,
  soundEffects: true,
  syncCode: 'BLOOM-' + Math.floor(1000 + Math.random() * 9000),
  lastSyncTime: null,
  streakCount: 3,
  lastStreakDate: new Date().toISOString().split('T')[0],
};

export const storageService = {
  loadJourneys() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_JOURNEYS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load journeys from localStorage', e);
    }
    // Save defaults
    this.saveJourneys(DEFAULT_JOURNEYS);
    return DEFAULT_JOURNEYS;
  },

  saveJourneys(journeys) {
    try {
      localStorage.setItem(STORAGE_KEY_JOURNEYS, JSON.stringify(journeys));
    } catch (e) {
      console.error('Failed to save journeys', e);
    }
  },

  loadSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  // Export entire app data as a JSON file backup
  exportJSONBackup() {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      journeys: this.loadJourneys(),
      settings: this.loadSettings(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BloomTrail_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Import JSON file backup
  importJSONBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.journeys)) {
        this.saveJourneys(data.journeys);
        if (data.settings) {
          this.saveSettings(data.settings);
        }
        return true;
      }
    } catch (e) {
      console.error('Import error', e);
    }
    return false;
  },

  // Calculate high-level stats
  getStats(journeys) {
    let totalMilestones = 0;
    let completedMilestones = 0;
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    const earnedStickers = [];

    journeys.forEach((j) => {
      j.milestones.forEach((m) => {
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
      totalJourneys: journeys.length,
      totalMilestones,
      completedMilestones,
      totalSubtasks,
      completedSubtasks,
      completionRate,
      earnedStickers,
    };
  },
};
