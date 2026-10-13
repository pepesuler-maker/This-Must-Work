// Notification & Alarm Ringtone Service
import { soundEngine } from './soundEngine.js';

class NotificationService {
  constructor() {
    this.permission = (typeof window !== 'undefined' && 'Notification' in window) 
      ? Notification.permission 
      : 'denied';
    this.activeAlarmModalCallback = null;
    this.alertHistory = new Set();
  }

  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermissionStatus() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  async requestPermission() {
    if (!this.isSupported()) return 'unsupported';
    try {
      const res = await Notification.requestPermission();
      this.permission = res;
      return res;
    } catch (e) {
      console.warn('Failed to request notification permission', e);
      return 'denied';
    }
  }

  registerAlarmListener(callback) {
    this.activeAlarmModalCallback = callback;
  }

  // Trigger notification + ringtone + vibration
  triggerReminder({ milestone, journeyTitle, ringtoneConfig }) {
    const title = `🌸 Reminder: ${milestone.title}`;
    const body = `From roadmap "${journeyTitle}". Time to check in on this milestone!`;
    const tag = `milestone-${milestone.id}`;

    const config = ringtoneConfig || { type: 'synth', key: 'morning_bell' };

    // 1. Play Audio Alarm (if synth or custom file)
    if (config.type === 'synth') {
      soundEngine.startAlarmLoop(config.key || 'morning_bell', 3);
    } else if (config.type === 'custom_file') {
      soundEngine.playCustomAudioFile();
    } else if (config.type === 'audio_url' && config.url) {
      soundEngine.playAudioUrl(config.url);
    }
    // Note: If config.type === 'youtube', the AlarmAlertModal will automatically render and autoplay the YouTube player!

    // 2. Mobile Vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([250, 100, 250, 100, 400]);
      } catch (err) {
        console.log('Vibration error', err);
      }
    }

    // 3. System Push / Desktop Notification
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag,
          requireInteraction: true,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (e) {
        console.warn('Desktop notification spawn error', e);
      }
    }

    // 4. In-App Pop-up notification modal trigger
    if (this.activeAlarmModalCallback) {
      this.activeAlarmModalCallback({
        milestone,
        journeyTitle,
        ringtoneConfig: config,
      });
    }
  }

  // Check upcoming reminders for today
  checkReminders(journeys, userRingtoneConfig) {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    journeys.forEach((journey) => {
      journey.milestones.forEach((ms) => {
        if (
          ms.status !== 'completed' &&
          ms.reminderEnabled &&
          ms.targetDate === todayStr &&
          ms.reminderTime === currentTimeStr
        ) {
          const alarmKey = `${ms.id}_${todayStr}_${currentTimeStr}`;
          if (!this.alertHistory.has(alarmKey)) {
            this.alertHistory.add(alarmKey);
            this.triggerReminder({
              milestone: ms,
              journeyTitle: journey.title,
              ringtoneConfig: ms.customRingtone || userRingtoneConfig,
            });
          }
        }
      });
    });
  }
}

export const notificationService = new NotificationService();
