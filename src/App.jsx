import React, { useState, useEffect } from 'react';
import { 
  Compass, Calendar as CalendarIcon, Award, Plus, 
  Settings as SettingsIcon, Sparkles, Check 
} from 'lucide-react';
import { Header } from './components/Header';
import { RoadmapView } from './components/RoadmapView';
import { CalendarView } from './components/CalendarView';
import { StickerAlbum } from './components/StickerAlbum';
import { MilestoneModal } from './components/MilestoneModal';
import { SettingsModal } from './components/SettingsModal';
import { NewJourneyModal } from './components/NewJourneyModal';
import { AlarmAlertModal } from './components/AlarmAlertModal';
import { storageService } from './services/storageService';
import { soundEngine } from './services/soundEngine';
import { notificationService } from './services/notificationService';

export default function App() {
  const [journeys, setJourneys] = useState(() => storageService.loadJourneys());
  const [settings, setSettings] = useState(() => storageService.loadSettings());
  const [activeJourneyId, setActiveJourneyId] = useState(() => journeys[0]?.id || '');
  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'calendar' | 'scrapbook'
  
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewJourneyOpen, setIsNewJourneyOpen] = useState(false);
  const [activeAlarmData, setActiveAlarmData] = useState(null);

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

  // Sync journeys to local storage whenever changed
  useEffect(() => {
    storageService.saveJourneys(journeys);
  }, [journeys]);

  // Active Journey Object
  const currentJourney = journeys.find((j) => j.id === activeJourneyId) || journeys[0] || {
    id: 'default',
    title: 'My Journey',
    milestones: [],
  };

  // Add a new milestone to the active journey
  const handleAddMilestone = (prefillDate = '') => {
    soundEngine.playPop();
    const newMs = {
      id: 'ms-' + Date.now(),
      title: 'New Checkpoint',
      description: 'Describe what you plan to accomplish here.',
      status: 'in_progress',
      targetDate: prefillDate || new Date().toISOString().split('T')[0],
      reminderTime: '10:00',
      reminderEnabled: true,
      rewardSticker: '🌱 Little Sprout',
      reflection: '',
      completedAt: null,
      subtasks: [
        { id: 'st-' + Date.now(), title: 'First action step', completed: false },
      ],
    };

    const updatedJourneys = journeys.map((j) => {
      if (j.id === currentJourney.id) {
        return {
          ...j,
          milestones: [...j.milestones, newMs],
        };
      }
      return j;
    });

    setJourneys(updatedJourneys);
    setSelectedMilestone(newMs);
  };

  // Update a milestone
  const handleUpdateMilestone = (updatedMs) => {
    const updatedJourneys = journeys.map((j) => {
      if (j.id === currentJourney.id || j.milestones.some((m) => m.id === updatedMs.id)) {
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
      {/* App Header */}
      <Header
        isOnline={isOnline}
        streakCount={settings.streakCount || 1}
        soundEnabled={settings.soundEffects}
        onToggleSound={(enabled) => {
          const updated = { ...settings, soundEffects: enabled };
          setSettings(updated);
          storageService.saveSettings(updated);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
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
        <div className="journey-selector-bar">
          <div className="journey-chips-list">
            {journeys.map((j) => (
              <button
                key={j.id}
                className={`journey-chip ${j.id === currentJourney.id ? 'active' : ''}`}
                onClick={() => {
                  soundEngine.playPop();
                  setActiveJourneyId(j.id);
                }}
              >
                <span>{j.icon || '🌱'}</span>
                <span>{j.title}</span>
              </button>
            ))}
          </div>

          <button
            className="btn-bubble btn-cream"
            style={{ padding: '8px 14px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            onClick={() => {
              soundEngine.playPop();
              setIsNewJourneyOpen(true);
            }}
          >
            <Plus size={16} />
            <span>New Journey</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main>
        {activeTab === 'roadmap' && (
          <RoadmapView
            journey={currentJourney}
            onSelectMilestone={(ms) => setSelectedMilestone(ms)}
            onAddMilestone={() => handleAddMilestone()}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            journeys={journeys}
            onSelectMilestone={(ms) => setSelectedMilestone(ms)}
            onAddMilestoneWithDate={(dateStr) => handleAddMilestone(dateStr)}
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
          milestone={selectedMilestone}
          journeyTitle={currentJourney.title}
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
            storageService.saveSettings(updated);
          }}
          onDataImported={() => {
            setJourneys(storageService.loadJourneys());
            setSettings(storageService.loadSettings());
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

      {/* Active Alarm / Reminder Ringtone Pop-up */}
      {activeAlarmData && (
        <AlarmAlertModal
          alertData={activeAlarmData}
          onDismiss={() => setActiveAlarmData(null)}
          onOpenMilestone={(ms) => setSelectedMilestone(ms)}
        />
      )}
    </div>
  );
}
