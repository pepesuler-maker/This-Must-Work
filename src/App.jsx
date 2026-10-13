import React, { useState, useEffect } from 'react';
import { 
  Compass, Calendar as CalendarIcon, Award, Plus, 
  Settings as SettingsIcon, Activity 
} from 'lucide-react';
import { Header } from './components/Header';
import { RoadmapView } from './components/RoadmapView';
import { CalendarView } from './components/CalendarView';
import { StickerAlbum } from './components/StickerAlbum';
import { HabitMilestonesView } from './components/HabitMilestonesView';
import { AccountProfileModal } from './components/AccountProfileModal';
import { MilestoneModal } from './components/MilestoneModal';
import { SettingsModal } from './components/SettingsModal';
import { NewJourneyModal } from './components/NewJourneyModal';
import { AlarmAlertModal } from './components/AlarmAlertModal';
import { ArchivedJourneysModal } from './components/ArchivedJourneysModal';
import { storageService } from './services/storageService';
import { soundEngine } from './services/soundEngine';
import { notificationService } from './services/notificationService';

export default function App() {
  // Accounts (Netflix-style 4 Accounts with PIN Password)
  const [accounts, setAccounts] = useState(() => storageService.getAccounts());
  const [activeAccountId, setActiveAccountId] = useState(() => storageService.getActiveAccountId());
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Per-account data
  const [journeys, setJourneys] = useState(() => storageService.loadJourneys(activeAccountId));
  const [habits, setHabits] = useState(() => storageService.loadHabitMilestones(activeAccountId));
  const [settings, setSettings] = useState(() => storageService.loadSettings(activeAccountId));

  const [activeJourneyId, setActiveJourneyId] = useState(() => journeys[0]?.id || '');
  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'habits' | 'calendar' | 'scrapbook'
  
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewJourneyOpen, setIsNewJourneyOpen] = useState(false);
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);
  const [activeAlarmData, setActiveAlarmData] = useState(null);

  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  // Set sound engine parameters
  useEffect(() => {
    soundEngine.setVolume(settings.volume ?? 0.8);
    soundEngine.toggleSound(settings.soundEffects ?? true);
  }, [settings]);

  // Network online/offline status listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register in-app reminder alarm listener & periodic checker
  useEffect(() => {
    notificationService.registerAlarmListener((data) => {
      setActiveAlarmData(data);
    });

    // Check reminders every 12 seconds
    const interval = setInterval(() => {
      notificationService.checkReminders(
        journeys,
        settings.ringtoneConfig || { type: 'synth', key: settings.ringtone || 'morning_bell' }
      );
    }, 12000);

    return () => clearInterval(interval);
  }, [journeys, settings.ringtoneConfig, settings.ringtone]);

  // Sync journeys & habits to local storage whenever changed
  useEffect(() => {
    storageService.saveJourneys(journeys, activeAccountId);
  }, [journeys, activeAccountId]);

  useEffect(() => {
    storageService.saveHabitMilestones(habits, activeAccountId);
  }, [habits, activeAccountId]);

  // Handle switching active account (Netflix style)
  const handleSelectAccount = (newAccId) => {
    storageService.setActiveAccountId(newAccId);
    setActiveAccountId(newAccId);

    // Refresh accounts list in case name/avatar was updated
    setAccounts(storageService.getAccounts());

    // Load newly selected account's isolated data
    const loadedJourneys = storageService.loadJourneys(newAccId);
    const loadedHabits = storageService.loadHabitMilestones(newAccId);
    const loadedSettings = storageService.loadSettings(newAccId);

    setJourneys(loadedJourneys);
    setHabits(loadedHabits);
    setSettings(loadedSettings);
    setActiveJourneyId(loadedJourneys[0]?.id || '');
  };

  // Separate active and archived journeys
  const activeJourneys = journeys.filter((j) => !j.isArchived);
  const archivedJourneys = journeys.filter((j) => j.isArchived);

  // Active Journey Object (defaults to first active journey)
  const currentJourney = activeJourneys.find((j) => j.id === activeJourneyId) 
    || activeJourneys[0] 
    || journeys[0] 
    || {
      id: 'default',
      title: 'My Journey',
      milestones: [],
    };

  // Archive a trail/journey
  const handleArchiveJourney = (jId) => {
    soundEngine.playPop();
    const updated = journeys.map((j) =>
      j.id === jId ? { ...j, isArchived: true, archivedAt: new Date().toISOString() } : j
    );
    setJourneys(updated);
    const remainingActive = updated.filter((j) => !j.isArchived);
    if (remainingActive.length > 0) {
      setActiveJourneyId(remainingActive[0].id);
    }
  };

  // Restore an archived trail
  const handleRestoreJourney = (jId) => {
    soundEngine.playSuccess();
    const updated = journeys.map((j) =>
      j.id === jId ? { ...j, isArchived: false, archivedAt: null } : j
    );
    setJourneys(updated);
    setActiveJourneyId(jId);
  };

  // Delete a trail completely
  const handleDeleteJourney = (jId) => {
    soundEngine.playPop();
    const updated = journeys.filter((j) => j.id !== jId);
    setJourneys(updated);
    const remainingActive = updated.filter((j) => !j.isArchived);
    if (remainingActive.length > 0) {
      setActiveJourneyId(remainingActive[0].id);
    }
  };

  // Helper for reliable local date string (YYYY-MM-DD)
  const getLocalDateString = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Add a new milestone to a journey and open modal (ZERO pre-made text, placeholder background text only)
  const handleAddMilestone = (prefillDate = '', targetJourneyId = null) => {
    soundEngine.playPop();
    const newMs = {
      id: 'ms-' + Date.now(),
      title: '', // Empty background placeholder
      description: '', // Empty background placeholder
      status: 'in_progress',
      targetDate: prefillDate || getLocalDateString(),
      reminderTime: '10:00',
      reminderEnabled: true,
      rewardSticker: '🌱 Little Sprout',
      reflection: '',
      completedAt: null,
      subtasks: [], // Starts clean and empty
    };

    const effectiveJourneyId = targetJourneyId 
      || currentJourney?.id 
      || activeJourneys[0]?.id 
      || journeys[0]?.id;

    if (journeys.length === 0 || !journeys.some((j) => j.id === effectiveJourneyId)) {
      const defaultJ = {
        id: 'journey-' + Date.now(),
        title: '🌱 Cozy Adventure',
        description: 'My adventure trail',
        icon: '🌱',
        themeColor: '#7BDCB5',
        createdAt: new Date().toISOString(),
        milestones: [newMs],
      };
      setJourneys([...journeys, defaultJ]);
      setActiveJourneyId(defaultJ.id);
    } else {
      const updatedJourneys = journeys.map((j) => {
        if (j.id === effectiveJourneyId) {
          return {
            ...j,
            milestones: [...j.milestones, newMs],
          };
        }
        return j;
      });
      setJourneys(updatedJourneys);
    }

    setSelectedMilestone(newMs);
  };

  // Directly create a checkpoint on a date without popup delay (ZERO pre-made text)
  const handleAddMilestoneDirect = ({
    title = '',
    journeyId = null,
    targetDate = '',
    reminderTime = '10:00',
  }) => {
    soundEngine.playSuccess();
    const newMs = {
      id: 'ms-' + Date.now(),
      title: title.trim(),
      description: '',
      status: 'in_progress',
      targetDate: targetDate || getLocalDateString(),
      reminderTime: reminderTime || '10:00',
      reminderEnabled: true,
      rewardSticker: '🌱 Little Sprout',
      reflection: '',
      completedAt: null,
      subtasks: [],
    };

    const effectiveJourneyId = journeyId 
      || currentJourney?.id 
      || activeJourneys[0]?.id 
      || journeys[0]?.id;

    if (journeys.length === 0 || !journeys.some((j) => j.id === effectiveJourneyId)) {
      const defaultJ = {
        id: 'journey-' + Date.now(),
        title: '🌱 Cozy Adventure',
        description: 'My adventure trail',
        icon: '🌱',
        themeColor: '#7BDCB5',
        createdAt: new Date().toISOString(),
        milestones: [newMs],
      };
      setJourneys([...journeys, defaultJ]);
      setActiveJourneyId(defaultJ.id);
    } else {
      const updatedJourneys = journeys.map((j) => {
        if (j.id === effectiveJourneyId) {
          return {
            ...j,
            milestones: [...j.milestones, newMs],
          };
        }
        return j;
      });
      setJourneys(updatedJourneys);
    }
  };

  // Update a milestone
  const handleUpdateMilestone = (updatedMs) => {
    const updatedJourneys = journeys.map((j) => {
      if (j.milestones.some((m) => m.id === updatedMs.id)) {
        return {
          ...j,
          milestones: j.milestones.map((m) => (m.id === updatedMs.id ? updatedMs : m)),
        };
      }
      return j;
    });
    setJourneys(updatedJourneys);
  };

  // Delete a milestone
  const handleDeleteMilestone = (msId) => {
    const updatedJourneys = journeys.map((j) => {
      return {
        ...j,
        milestones: j.milestones.filter((m) => m.id !== msId),
      };
    });
    setJourneys(updatedJourneys);
  };

  // Create a new journey roadmap
  const handleCreateJourney = (newJourney) => {
    const updated = [...journeys, newJourney];
    setJourneys(updated);
    setActiveJourneyId(newJourney.id);
  };

  return (
    <div className="app-wrapper">
      {/* App Header with Netflix Account Switcher */}
      <Header
        isOnline={isOnline}
        streakCount={settings.streakCount || 1}
        soundEnabled={settings.soundEffects}
        onToggleSound={(enabled) => {
          const updated = { ...settings, soundEffects: enabled };
          setSettings(updated);
          storageService.saveSettings(updated, activeAccountId);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeAccount={activeAccount}
        onOpenAccounts={() => setIsAccountModalOpen(true)}
      />

      {/* Main View Tabs (Desktop & Tablet) */}
      <div className="nav-pill-tabs">
        <button
          className={`nav-tab-item ${activeTab === 'roadmap' ? 'active' : ''}`}
          onClick={() => {
            soundEngine.playPop();
            setActiveTab('roadmap');
          }}
        >
          <Compass size={18} />
          <span>Adventure Trail</span>
        </button>

        <button
          className={`nav-tab-item ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => {
            soundEngine.playPop();
            setActiveTab('habits');
          }}
        >
          <Activity size={18} />
          <span>Habit Stamps</span>
        </button>

        <button
          className={`nav-tab-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => {
            soundEngine.playPop();
            setActiveTab('calendar');
          }}
        >
          <CalendarIcon size={18} />
          <span>Cozy Calendar</span>
        </button>

        <button
          className={`nav-tab-item ${activeTab === 'scrapbook' ? 'active' : ''}`}
          onClick={() => {
            soundEngine.playPop();
            setActiveTab('scrapbook');
          }}
        >
          <Award size={18} />
          <span>Sticker Album</span>
        </button>
      </div>

      {/* Roadmaps Switcher Chips (visible when on roadmap view) */}
      {activeTab === 'roadmap' && (
        <div className="journey-chips-bar">
          <div className="journey-chips-scroller">
            {activeJourneys.map((j) => {
              const displayTitle = j.title && j.icon && j.title.startsWith(j.icon)
                ? j.title.slice(j.icon.length).trim()
                : j.title;

              return (
                <button
                  key={j.id}
                  className={`journey-chip ${j.id === currentJourney.id ? 'active' : ''}`}
                  onClick={() => {
                    soundEngine.playPop();
                    setActiveJourneyId(j.id);
                  }}
                >
                  <span className="chip-icon">{j.icon || '🌱'}</span>
                  <span className="chip-title">{displayTitle || 'Quest'}</span>
                </button>
              );
            })}

            <button
              className="journey-chip chip-add-new"
              onClick={() => {
                soundEngine.playPop();
                setIsNewJourneyOpen(true);
              }}
            >
              <Plus size={15} />
              <span>New Quest</span>
            </button>

            {/* Archived Trails Chip */}
            {archivedJourneys.length > 0 && (
              <button
                className="journey-chip chip-archived"
                onClick={() => {
                  soundEngine.playPop();
                  setIsArchivedModalOpen(true);
                }}
                title="View and restore archived trails"
              >
                <span>📦 Archived ({archivedJourneys.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main>
        {activeTab === 'roadmap' && (
          <RoadmapView
            journey={currentJourney}
            onSelectMilestone={(ms) => setSelectedMilestone(ms)}
            onAddMilestone={() => handleAddMilestone()}
            onArchiveJourney={handleArchiveJourney}
            onDeleteJourney={handleDeleteJourney}
          />
        )}

        {activeTab === 'habits' && (
          <HabitMilestonesView
            habits={habits}
            onUpdateHabits={(updated) => setHabits(updated)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            journeys={journeys}
            activeJourneyId={activeJourneyId}
            onSelectMilestone={(ms) => setSelectedMilestone(ms)}
            onAddMilestoneWithDate={(dateStr, jId) => handleAddMilestone(dateStr, jId)}
            onAddMilestoneDirect={handleAddMilestoneDirect}
          />
        )}

        {activeTab === 'scrapbook' && (
          <StickerAlbum
            journeys={journeys}
            streakCount={settings.streakCount || 1}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
          onClick={() => {
            soundEngine.playPop();
            setActiveTab('roadmap');
          }}
        >
          <Compass size={20} />
          <span>Trail</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => {
            soundEngine.playPop();
            setActiveTab('habits');
          }}
        >
          <Activity size={20} />
          <span>Habits</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => {
            soundEngine.playPop();
            setActiveTab('calendar');
          }}
        >
          <CalendarIcon size={20} />
          <span>Calendar</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeTab === 'scrapbook' ? 'active' : ''}`}
          onClick={() => {
            soundEngine.playPop();
            setActiveTab('scrapbook');
          }}
        >
          <Award size={20} />
          <span>Stickers</span>
        </button>

        <button
          className="mobile-nav-btn"
          onClick={() => {
            soundEngine.playPop();
            setIsSettingsOpen(true);
          }}
        >
          <SettingsIcon size={20} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Milestone Details Drawer Modal */}
      {selectedMilestone && (
        <MilestoneModal
          key={selectedMilestone.id}
          milestone={selectedMilestone}
          journeyTitle={
            journeys.find((j) => j.milestones.some((m) => m.id === selectedMilestone.id))?.title ||
            currentJourney.title
          }
          onClose={() => setSelectedMilestone(null)}
          onUpdateMilestone={handleUpdateMilestone}
          onDeleteMilestone={handleDeleteMilestone}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateSettings={(updated) => {
            setSettings(updated);
            storageService.saveSettings(updated, activeAccountId);
          }}
          onDataImported={() => {
            setJourneys(storageService.loadJourneys(activeAccountId));
            setHabits(storageService.loadHabitMilestones(activeAccountId));
            setSettings(storageService.loadSettings(activeAccountId));
          }}
        />
      )}

      {/* New Journey Modal */}
      {isNewJourneyOpen && (
        <NewJourneyModal
          onClose={() => setIsNewJourneyOpen(false)}
          onCreateJourney={handleCreateJourney}
        />
      )}

      {/* Netflix Profile Modal (4 Accounts with PIN Password) */}
      {isAccountModalOpen && (
        <AccountProfileModal
          accounts={accounts}
          activeAccountId={activeAccountId}
          onSelectAccount={handleSelectAccount}
          onClose={() => setIsAccountModalOpen(false)}
        />
      )}

      {/* Active Alarm / Reminder Ringtone Pop-up */}
      {activeAlarmData && (
        <AlarmAlertModal
          alertData={activeAlarmData}
          onDismiss={() => setActiveAlarmData(null)}
          onOpenMilestone={(ms) => setSelectedMilestone(ms)}
        />
      )}

      {/* Archived Journeys Modal */}
      {isArchivedModalOpen && (
        <ArchivedJourneysModal
          archivedJourneys={archivedJourneys}
          onClose={() => setIsArchivedModalOpen(false)}
          onRestoreJourney={handleRestoreJourney}
          onDeleteJourney={handleDeleteJourney}
        />
      )}
    </div>
  );
}
