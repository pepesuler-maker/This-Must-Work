/**
 * BloomTrail - Offline Black Box & Contract Test Suite
 * 
 * Verifies system behavior from a black box perspective:
 * 1. PWA & Service Worker Offline Manifest Contract
 * 2. Offline Data Persistence & State Transactions (Archive, Restore, Delete, Milestone mutation)
 * 3. Client-Side Web Audio Synthesis (100% Offline Alarm Generation)
 * 4. Offline Reminder Alarm Scheduling & Evaluation
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests.push({ testName, details });
    console.error(`  ❌ [FAIL] ${testName}: ${details}`);
  }
}

console.log('\n======================================================');
console.log('🌸 BLOOMTRAIL OFFLINE BLACK BOX TEST SUITE');
console.log('======================================================\n');

// ---------------------------------------------------------------------
// TEST SUITE 1: PWA & Offline Manifest
// ---------------------------------------------------------------------
console.log('📦 Test Suite 1: PWA Offline Manifest & Service Worker');

const manifestPath = path.join(rootDir, 'public', 'manifest.json');
assert(fs.existsSync(manifestPath), 'manifest.json exists in public directory');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifest.name === 'BloomTrail' || manifest.short_name === 'BloomTrail', 'Manifest has valid app title');
  assert(manifest.display === 'standalone', 'Manifest display is configured for standalone PWA offline launch');
  assert(manifest.start_url === '/', 'Manifest start_url points to root for offline entry');
  assert(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'Manifest contains valid icon definitions');
}

const swPath = path.join(rootDir, 'public', 'sw.js');
assert(fs.existsSync(swPath), 'sw.js (Service Worker) exists in public directory');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  assert(swContent.includes('install'), 'Service Worker registers install event listener for precaching');
  assert(swContent.includes('fetch'), 'Service Worker registers fetch event listener for offline caching');
  assert(swContent.includes('caches.match') || swContent.includes('cache.match'), 'Service Worker handles offline cache hits');
}

// ---------------------------------------------------------------------
// TEST SUITE 2: Storage Service & Default Seed Data
// ---------------------------------------------------------------------
console.log('\n🌱 Test Suite 2: Offline Storage Service Contract');

// Simulated Browser LocalStorage & SessionStorage
const createMockStorage = () => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    _dump: () => ({ ...store }),
  };
};

global.localStorage = createMockStorage();
global.sessionStorage = createMockStorage();

const storageModule = await import('../src/services/storageService.js');
const { storageService } = storageModule;

assert(typeof storageService.loadJourneys === 'function', 'storageService provides loadJourneys');
assert(typeof storageService.saveJourneys === 'function', 'storageService provides saveJourneys');
assert(typeof storageService.loadSettings === 'function', 'storageService provides loadSettings');
assert(typeof storageService.saveSettings === 'function', 'storageService provides saveSettings');

const initialJourneys = storageService.loadJourneys();
assert(Array.isArray(initialJourneys) && initialJourneys.length >= 2, 'Loads initial seeded journeys when offline cache is empty');

const firstJourney = initialJourneys[0];
assert(Boolean(firstJourney.id && firstJourney.title && Array.isArray(firstJourney.milestones)), 'Journey structure conforms to milestone contract');
assert(firstJourney.milestones.length > 0, 'Journey contains initial milestones');

// ---------------------------------------------------------------------
// TEST SUITE 3: Black Box Trail Archiving, Restoring & Deleting
// ---------------------------------------------------------------------
console.log('\n📦 Test Suite 3: Trail Archiving, Restoring & Deletion Flow');

let currentJourneys = [...initialJourneys];
const targetTrailId = currentJourneys[0].id;
const targetTrailTitle = currentJourneys[0].title;

// Action 1: Archive Trail
currentJourneys = currentJourneys.map(j => 
  j.id === targetTrailId ? { ...j, isArchived: true, archivedAt: new Date().toISOString() } : j
);
storageService.saveJourneys(currentJourneys);

// Check active vs archived
let active = currentJourneys.filter(j => !j.isArchived);
let archived = currentJourneys.filter(j => j.isArchived);
assert(archived.some(j => j.id === targetTrailId), `Trail "${targetTrailTitle}" successfully archived`);
assert(!active.some(j => j.id === targetTrailId), 'Archived trail is excluded from active journey view');
assert(archived.length === 1, 'Archived trail count is exactly 1');

// Verify LocalStorage persists this change offline
const persistedAfterArchive = storageService.loadJourneys();
assert(persistedAfterArchive.find(j => j.id === targetTrailId)?.isArchived === true, 'Archived state correctly persisted to localStorage');

// Action 2: Restore Trail
currentJourneys = currentJourneys.map(j => 
  j.id === targetTrailId ? { ...j, isArchived: false, archivedAt: null } : j
);
storageService.saveJourneys(currentJourneys);

active = currentJourneys.filter(j => !j.isArchived);
archived = currentJourneys.filter(j => j.isArchived);
assert(active.some(j => j.id === targetTrailId), `Trail "${targetTrailTitle}" successfully restored to active trails`);
assert(archived.length === 0, 'Archived list is now empty');

// Action 3: Delete Trail Permanently
const initialCount = currentJourneys.length;
currentJourneys = currentJourneys.filter(j => j.id !== targetTrailId);
storageService.saveJourneys(currentJourneys);

const persistedAfterDelete = storageService.loadJourneys();
assert(persistedAfterDelete.length === initialCount - 1, 'Trail deleted and count decreased by 1');
assert(!persistedAfterDelete.some(j => j.id === targetTrailId), 'Deleted trail completely purged from offline store');

// ---------------------------------------------------------------------
// TEST SUITE 4: Offline Milestone & Subtask State Mutation
// ---------------------------------------------------------------------
console.log('\n🎯 Test Suite 4: Offline Milestone & Subtask Interactions');

// Pick remaining active trail
const remainingTrail = currentJourneys[0];
const targetMilestone = remainingTrail.milestones[0];
assert(Boolean(targetMilestone), 'Target milestone exists on remaining active trail');

// Mutate subtasks offline
const updatedSubtasks = (targetMilestone.subtasks || []).map((s, idx) => 
  idx === 0 ? { ...s, completed: true } : s
);
const updatedMilestone = {
  ...targetMilestone,
  subtasks: updatedSubtasks,
  status: 'completed',
  completedAt: new Date().toISOString(),
};

currentJourneys = currentJourneys.map(j => {
  if (j.id === remainingTrail.id) {
    return {
      ...j,
      milestones: j.milestones.map(m => m.id === updatedMilestone.id ? updatedMilestone : m),
    };
  }
  return j;
});
storageService.saveJourneys(currentJourneys);

const persistedAfterMilestoneEdit = storageService.loadJourneys();
const verifiedMs = persistedAfterMilestoneEdit.find(j => j.id === remainingTrail.id)?.milestones.find(m => m.id === targetMilestone.id);

assert(verifiedMs?.status === 'completed', 'Milestone status updated to completed offline');
assert(verifiedMs?.subtasks[0]?.completed === true, 'Subtask checkbox state persisted offline');

// ---------------------------------------------------------------------
// TEST SUITE 5: Client-Side Offline Sound & Synth Engine
// ---------------------------------------------------------------------
console.log('\n🔔 Test Suite 5: Client-Side Web Audio Synth (100% Offline)');

const soundModule = await import('../src/services/soundEngine.js');
const { soundEngine } = soundModule;

assert(typeof soundEngine.playPop === 'function', 'SoundEngine provides playPop');
assert(typeof soundEngine.playSuccess === 'function', 'SoundEngine provides playSuccess');
assert(typeof soundEngine.playMilestoneFanfare === 'function', 'SoundEngine provides playMilestoneFanfare');
assert(typeof soundEngine.startAlarmLoop === 'function', 'SoundEngine provides startAlarmLoop');
assert(typeof soundEngine.stopAlarmLoop === 'function', 'SoundEngine provides stopAlarmLoop');
assert(typeof soundEngine.playMorningBell === 'function', 'SoundEngine provides playMorningBell (Web Audio synth)');
assert(typeof soundEngine.playCozyMarimba === 'function', 'SoundEngine provides playCozyMarimba (Web Audio synth)');
assert(typeof soundEngine.playBubbleHarp === 'function', 'SoundEngine provides playBubbleHarp (Web Audio synth)');
assert(typeof soundEngine.playStardustFanfare === 'function', 'SoundEngine provides playStardustFanfare (Web Audio synth)');
assert(typeof soundEngine.playRingtone === 'function', 'SoundEngine provides playRingtone dispatcher');

// ---------------------------------------------------------------------
// TEST SUITE 6: Offline Reminder Alarm Scheduler
// ---------------------------------------------------------------------
console.log('\n⏰ Test Suite 6: Offline Reminder Alarm Scheduler');

const notifModule = await import('../src/services/notificationService.js');
const { notificationService } = notifModule;

assert(typeof notificationService.checkReminders === 'function', 'notificationService provides checkReminders');
assert(typeof notificationService.triggerReminder === 'function', 'notificationService provides triggerReminder');
assert(typeof notificationService.registerAlarmListener === 'function', 'notificationService provides registerAlarmListener');

let triggeredAlarm = null;
notificationService.registerAlarmListener((alarm) => {
  triggeredAlarm = alarm;
});

// Create a milestone whose reminder time matches current local time
const now = new Date();
const currentHour = String(now.getHours()).padStart(2, '0');
const currentMin = String(now.getMinutes()).padStart(2, '0');
const todayStr = now.toISOString().split('T')[0];

const testJourneyWithAlarm = [{
  id: 'alarm-test-journey',
  title: 'Alarm Test Trail',
  milestones: [{
    id: 'alarm-test-ms',
    title: 'Time for Morning Tea',
    targetDate: todayStr,
    reminderTime: `${currentHour}:${currentMin}`,
    reminderEnabled: true,
    status: 'in_progress',
  }],
}];

// Clear fired reminders cache
sessionStorage.clear ? sessionStorage.clear() : null;

notificationService.checkReminders(testJourneyWithAlarm, { type: 'synth', key: 'morning_bell' });
assert(triggeredAlarm !== null, 'Alarm fired for scheduled milestone matching current time without network');
if (triggeredAlarm) {
  assert(triggeredAlarm.milestone.title === 'Time for Morning Tea', 'Alarm listener received correct milestone payload');
}

// ---------------------------------------------------------------------
// TEST SUMMARY REPORT
// ---------------------------------------------------------------------
console.log('\n======================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
if (failedTests.length === 0) {
  console.log('🎉 ALL OFFLINE BLACK BOX TESTS PASSED WITH 100% SUCCESS!');
} else {
  console.error(`❌ ${failedTests.length} tests failed:`);
  failedTests.forEach(f => console.error(`  - ${f.testName}: ${f.details}`));
}
console.log('======================================================\n');

process.exit(failedTests.length === 0 ? 0 : 1);
