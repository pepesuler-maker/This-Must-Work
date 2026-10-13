# 🌸 BloomTrail — Cozy Progression & Milestone Roadmap

> A cozy, cartoony, and offline-first personal progression tracker built as a Progressive Web App (PWA). Works seamlessly on desktop and mobile, online and offline, and is ready for Vercel deployment.

![BloomTrail Preview](/public/favicon.svg)

---

## ✨ Features

- 🗺️ **Visual Adventure Roadmaps**: Interactive winding trails connecting milestone checkpoints with dynamic curves.
- 🎯 **Milestone Checkpoints**: Set target dates, reminder times, checklist subtasks, and personal reflection notes.
- 🎊 **Celebration & Confetti**: Complete milestones to launch confetti and hear triumphant celebration fanfare.
- 📅 **Calendar Sync**:
  - In-app monthly calendar view plotting scheduled milestones.
  - 1-click **Add to Google Calendar** link.
  - Standard **iCalendar (.ics)** download to sync with Apple Calendar, Outlook, and Google Calendar.
- 🔔 **Offline Web Audio Ringtones & Notifications**:
  - 4 cozy synthesized ringtones (Morning Bell, Cozy Marimba, Bubble Harp, Stardust Fanfare) generated live with Web Audio API.
  - Native Web Notifications and device vibration alarms.
- 🏆 **Sticker Album Scrapbook**: Collect cute achievement stickers as you conquer milestones and build daily streaks.
- 📱 **100% Offline & Online PWA**:
  - Local-first storage (`localStorage` & IndexedDB) ensures 0ms latency and full functionality without Wi-Fi.
  - Service Worker (`sw.js`) caches all assets for instant offline booting.
  - Installable directly to your home screen or desktop.
- ☁️ **Vercel Deployment**: Preconfigured with `vercel.json` for seamless SPA routing and HTTPS PWA compatibility.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/pepesuler-maker/This-Must-Work.git

# Navigate to the project directory
cd This-Must-Work

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deploy to Vercel

1. Push your changes to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import this repository (`This-Must-Work`).
4. Click **Deploy**! Vercel will build and provide a live HTTPS URL.
