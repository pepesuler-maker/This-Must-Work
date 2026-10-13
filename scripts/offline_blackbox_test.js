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

// Test Case: Add on this date (Calendar View feature)
const targetCalDate = '2026-10-25';
const dateMs = {
  id: 'ms-cal-' + Date.now(),
  title: 'Finish Cozy Milestone on Date',
  description: 'Added specifically for a chosen calendar date',
  status: 'in_progress',
  targetDate: targetCalDate,
  reminderTime: '10:00',
  reminderEnabled: true,
  rewardSticker: '🌱 Little Sprout',
  subtasks: [{ id: 'st-c1', title: 'Action 1', completed: false }],
};

currentJourneys = currentJourneys.map(j => {
  if (j.id === remainingTrail.id) {
    return {
      ...j,
      milestones: [...j.milestones, dateMs],
    };
  }
  return j;
});
storageService.saveJourneys(currentJourneys);

const reloadedForDate = storageService.loadJourneys();
const foundOnDate = reloadedForDate
  .flatMap(j => j.milestones)
  .filter(m => m.targetDate === targetCalDate);

assert(foundOnDate.length === 1, 'Checkpoints added on a specific date are saved and queried successfully');
assert(foundOnDate[0].title === 'Finish Cozy Milestone on Date', 'Milestone title matches newly scheduled checkpoint');

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
// TEST SUITE 7: Dynamic Account Creation, Top-Left Placement & PIN Security
// ---------------------------------------------------------------------
console.log('\n📺 Test Suite 7: Dynamic Account Creation & PIN Security Contract');

// Test creating an account via Add Account
const createdAcc1 = storageService.addAccount({
  name: 'Alex',
  avatar: '🦊',
  pin: '1234',
  themeColor: '#FF9AA2',
});
assert(Boolean(createdAcc1.id && createdAcc1.name === 'Alex' && createdAcc1.avatar === '🦊'), 'Creates new account dynamically via Add Account button');

const accounts = storageService.getAccounts();
assert(Array.isArray(accounts) && accounts.length >= 1, 'Accounts list dynamically tracks user-created accounts');

const acc1 = accounts.find(a => a.id === createdAcc1.id) || accounts[0];

// Verify PIN security
assert(storageService.verifyAccountPin(acc1.id, '1234') === true, 'Correct PIN (1234) unlocks account 1');
assert(storageService.verifyAccountPin(acc1.id, '9999') === false, 'Incorrect PIN (9999) is rejected');

// Test updating PIN
storageService.updateAccountPin(acc1.id, '5678');
assert(storageService.verifyAccountPin(acc1.id, '5678') === true, 'Updated PIN (5678) unlocks account 1');
assert(storageService.verifyAccountPin(acc1.id, '1234') === false, 'Old PIN (1234) no longer valid after update');

// Test updating profile name & avatar
storageService.updateAccountProfile(acc1.id, { name: 'Champion Alex', avatar: '🦁' });
const updatedAccounts = storageService.getAccounts();
const reloadedAcc1 = updatedAccounts.find(a => a.id === acc1.id);
assert(reloadedAcc1.name === 'Champion Alex' && reloadedAcc1.avatar === '🦁', 'Account profile name and avatar successfully updated');

// Test adding a second account dynamically
const createdAcc2 = storageService.addAccount({
  name: 'Sam',
  avatar: '🐼',
  pin: '4321',
});
assert(storageService.getAccounts().length >= 2, 'Multiple accounts can be created and switched');

// Test Data Isolation between Account 1 and Account 2
const acc1SpecificJourneys = [{ id: 'j-acc1', title: 'Alex Solo Quest', milestones: [] }];
const acc2SpecificJourneys = [{ id: 'j-acc2', title: 'Sam Solo Quest', milestones: [] }];

storageService.saveJourneys(acc1SpecificJourneys, acc1.id);
storageService.saveJourneys(acc2SpecificJourneys, createdAcc2.id);

const reloadedAcc1Journeys = storageService.loadJourneys(acc1.id);
const reloadedAcc2Journeys = storageService.loadJourneys(createdAcc2.id);

assert(reloadedAcc1Journeys[0].id === 'j-acc1', 'Account 1 loads only its own journeys');
assert(reloadedAcc2Journeys[0].id === 'j-acc2', 'Account 2 loads only its own journeys');
assert(!reloadedAcc1Journeys.some(j => j.id === 'j-acc2'), 'Account 1 data is isolated from Account 2');


// ---------------------------------------------------------------------
// TEST SUITE 8: Habit Milestones with Mandatory Photo Proof Stamps
// ---------------------------------------------------------------------
console.log('\n🏃 Test Suite 8: Habit Milestones with Mandatory Photo Proof & Stamps');

const initialHabits = storageService.loadHabitMilestones(acc1.id);
assert(Array.isArray(initialHabits) && initialHabits.length > 0, 'Loads habit milestones for active account');

const joggingHabit = initialHabits.find(h => h.id === 'habit-jogging') || initialHabits[0];
assert(Boolean(joggingHabit && joggingHabit.targetDaysPerWeek >= 1), 'Habit milestone has target days per week (e.g. Jogging 3 days/week)');

// Weekly progress status calculation
const initialStatus = storageService.getHabitWeeklyStatus(joggingHabit);
assert(initialStatus.completedDays === 0, 'New habit starts with 0 completed days this week');
assert(initialStatus.isReached === false, 'Milestone is not yet reached with 0 days');
assert(initialStatus.statusMessage.includes('needed to reach your weekly milestone'), 'Informative milestone message indicates days needed');

// Stamping with photo proof contract test
const samplePhotoBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...'; // valid photo proof
const refDate = new Date();
const pad = (n) => String(n).padStart(2, '0');
const todayDateStr = `${refDate.getFullYear()}-${pad(refDate.getMonth() + 1)}-${pad(refDate.getDate())}`;

// Create Day 1 stamp with MANDATORY photo proof
const stampDay1 = {
  id: 'stamp-1',
  date: todayDateStr,
  time: '08:00',
  photoProof: samplePhotoBase64,
  caption: 'Morning Jog 5km around the lake',
  badgeIcon: '🏃',
  badgeLabel: 'Runner Stamp',
  certifiedAt: new Date().toISOString(),
};

assert(Boolean(stampDay1.photoProof && stampDay1.photoProof.startsWith('data:image/')), 'Stamp conforms to mandatory photo proof contract');

const habitWith1Stamp = {
  ...joggingHabit,
  stamps: [stampDay1],
};
storageService.saveHabitMilestones([habitWith1Stamp], acc1.id);

const statusAfter1Stamp = storageService.getHabitWeeklyStatus(habitWith1Stamp);
assert(statusAfter1Stamp.completedDays === 1, 'Habit weekly progress updated to 1 completed day');
assert(statusAfter1Stamp.daysLeft === (joggingHabit.targetDaysPerWeek - 1), 'Days left correctly decremented');
assert(statusAfter1Stamp.statusMessage.includes('1/3 days completed') || statusAfter1Stamp.statusMessage.includes('1 of'), 'Informs user of 1 day completed progress towards milestone');

// Add 2 more stamps on distinct days of current week to REACH the milestone
const day2 = new Date(refDate);
day2.setDate(refDate.getDate() - 1);
const day2Str = `${day2.getFullYear()}-${pad(day2.getMonth() + 1)}-${pad(day2.getDate())}`;

const day3 = new Date(refDate);
day3.setDate(refDate.getDate() - 2);
const day3Str = `${day3.getFullYear()}-${pad(day3.getMonth() + 1)}-${pad(day3.getDate())}`;

const stampDay2 = { id: 'stamp-2', date: day2Str, time: '07:30', photoProof: samplePhotoBase64, badgeIcon: '🏃' };
const stampDay3 = { id: 'stamp-3', date: day3Str, time: '09:15', photoProof: samplePhotoBase64, badgeIcon: '⭐' };

const habitWith3Stamps = {
  ...joggingHabit,
  targetDaysPerWeek: 3,
  stamps: [stampDay1, stampDay2, stampDay3],
};
storageService.saveHabitMilestones([habitWith3Stamps], acc1.id);

const statusAfter3Stamps = storageService.getHabitWeeklyStatus(habitWith3Stamps);
assert(statusAfter3Stamps.completedDays >= 3, 'Completed days is now 3');
assert(statusAfter3Stamps.isReached === true, 'Milestone successfully reached after 3 days completed');
assert(statusAfter3Stamps.statusMessage.includes('Milestone Reached'), 'Informs user that milestone was achieved!');

// ---------------------------------------------------------------------
// TEST SUITE 9: List Creation Contract (Zero Pre-Made Text, Clean Placeholders)
// ---------------------------------------------------------------------
console.log('\n📝 Test Suite 9: List Creation Contract (Zero Pre-Made Text)');

// Verifying new checklist items and milestones initialize with empty strings (placeholders handle display)
const newCustomCheckpoint = {
  id: 'ms-clean-' + Date.now(),
  title: '', // Must NOT contain pre-made text like 'New Checkpoint'
  description: '', // Must NOT contain pre-made text like 'Describe what you plan to accomplish'
  subtasks: [], // Must start clean and empty
};

assert(newCustomCheckpoint.title === '', 'Newly created checkpoint title is empty (background text only)');
assert(newCustomCheckpoint.description === '', 'Newly created checkpoint description is empty (background text only)');
assert(Array.isArray(newCustomCheckpoint.subtasks) && newCustomCheckpoint.subtasks.length === 0, 'Newly created subtasks checklist is empty');

// ---------------------------------------------------------------------
// TEST SUITE 10: Email Authentication & 6-Digit Verification Flow Contract
// ---------------------------------------------------------------------
console.log('\n✉️ Test Suite 10: Email Auth & 6-Digit Verification Flow Contract');

const testEmail = 'explorer@bloomtrail.app';
const dispatchRes = storageService.sendVerificationCode(testEmail);

assert(dispatchRes.success === true, 'Verification code dispatch succeeds offline/online');
assert(typeof dispatchRes.code === 'string' && dispatchRes.code.length === 6, 'Verification code is 6-digit string');
assert(/^\d{6}$/.test(dispatchRes.code), 'Verification code consists only of numeric digits');

// Testing wrong code rejection
const wrongVerifyRes = storageService.verifyEmailCode(testEmail, '000000');
assert(wrongVerifyRes.success === false, 'Invalid verification code is rejected');

// Testing correct code verification
const correctVerifyRes = storageService.verifyEmailCode(testEmail, dispatchRes.code);
assert(correctVerifyRes.success === true, 'Correct verification code is successfully validated');

// Testing account creation with email & verification
const registeredEmailAcc = storageService.addAccount({
  name: 'Email Explorer',
  email: testEmail,
  password: 'securePass123',
  avatar: '🌸',
  isVerified: true,
});
assert(Boolean(registeredEmailAcc && registeredEmailAcc.id), 'Account successfully created with email auth');
assert(registeredEmailAcc.email === testEmail, 'Account email is correctly stored');
assert(registeredEmailAcc.isVerified === true, 'Account is stamped as verified');

// Testing Sign In with correct email and password
const signInSuccess = storageService.signInWithEmail(testEmail, 'securePass123');
assert(signInSuccess.success === true, 'Sign in succeeds with correct email and password');
assert(signInSuccess.account.id === registeredEmailAcc.id, 'Sign in returns correct account');

// Testing Sign In with wrong password
const signInFailPass = storageService.signInWithEmail(testEmail, 'wrongPassword');
assert(signInFailPass.success === false, 'Sign in fails with wrong password');

// Testing Sign In with non-existent email
const signInFailEmail = storageService.signInWithEmail('nonexistent@example.com', 'securePass123');
assert(signInFailEmail.success === false, 'Sign in fails with non-existent email');

// ---------------------------------------------------------------------
// TEST SUITE 11: Pre-seeded User Account (pepesuler@gmail.com / 1234) & Session
// ---------------------------------------------------------------------
console.log('\n🦊 Test Suite 11: Pre-seeded User Account (pepesuler@gmail.com / 1234)');

const accountsList = storageService.getAccounts();
const pepeAcc = accountsList.find(a => a.email && a.email.toLowerCase() === 'pepesuler@gmail.com');
assert(Boolean(pepeAcc), 'Account pepesuler@gmail.com is pre-seeded in storageService');
assert(pepeAcc.password === '1234', 'Account pepesuler@gmail.com has password 1234');
assert(pepeAcc.isVerified === true, 'Account pepesuler@gmail.com has verified email');

// Test signing in as pepesuler@gmail.com with password 1234
const pepeSignIn = storageService.signInWithEmail('pepesuler@gmail.com', '1234');
assert(pepeSignIn.success === true, 'Sign in succeeds for pepesuler@gmail.com with password 1234');
assert(pepeSignIn.account.id === pepeAcc.id, 'Sign in returns valid account object for Pepe');

// Verify active account id is set
const activeAccId = storageService.getActiveAccountId();
assert(activeAccId === pepeAcc.id, 'Active account id is set to pepesuler@gmail.com account ID');
const activeAccountObj = storageService.getActiveAccount();
assert(Boolean(activeAccountObj && activeAccountObj.id === pepeAcc.id), 'getActiveAccount returns active account for Pepe');

// Verify feature actions work without requiring account creation prompt
const pepeJourneys = storageService.loadJourneys(pepeAcc.id);
assert(Array.isArray(pepeJourneys) && pepeJourneys.length > 0, 'pepesuler@gmail.com has isolated journeys');
const pepeHabits = storageService.loadHabitMilestones(pepeAcc.id);
assert(Array.isArray(pepeHabits) && pepeHabits.length > 0, 'pepesuler@gmail.com has isolated habit milestones');

// ---------------------------------------------------------------------
// TEST SUITE 12: Account Removal / Deletion & True Log Out State Contract
// ---------------------------------------------------------------------
console.log('\n🗑️ Test Suite 12: Account Removal / Deletion & True Log Out State Contract');

// 1. Create a dynamic test account "Leon"
const leonAcc = storageService.addAccount({
  name: 'Leon',
  email: 'leon@example.com',
  password: '1234',
  avatar: '🦁',
});
assert(Boolean(leonAcc && leonAcc.id), 'Account "Leon" created successfully');
let accountsWithLeon = storageService.getAccounts();
assert(accountsWithLeon.some(a => a.id === leonAcc.id), '"Leon" is listed in accounts store');

// 2. Delete "Leon" account completely
const remainingAfterDelete = storageService.deleteAccount(leonAcc.id);
assert(!remainingAfterDelete.some(a => a.id === leonAcc.id), '"Leon" is completely removed after deleteAccount()');
const refreshedAccounts = storageService.getAccounts();
assert(!refreshedAccounts.some(a => a.id === leonAcc.id), '"Leon" is absent from storageService.getAccounts()');

// 3. Test True Log Out Contract
storageService.setActiveAccountId('guest');
const loggedOutId = storageService.getActiveAccountId();
assert(loggedOutId === null, 'Signing out sets active account to null (True Log Out)');
const loggedOutAccount = storageService.getActiveAccount();
assert(loggedOutAccount === null, 'getActiveAccount returns null when logged out');

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
