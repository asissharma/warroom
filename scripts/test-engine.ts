import { updateSM2, SM2Fields } from '../app/lib/engine/sm2';
import { calcScore } from '../app/lib/engine/score';
import { buildQueue, PriorityBuckets } from '../app/lib/engine/priority';
import { calcTomorrowFocus } from '../app/lib/engine/tomorrowFocus';
import { escalateGap } from '../app/lib/engine/gapEngine';
import mongoose from 'mongoose';

const mockSettings: any = {
  defaultSessionMinutes: 30,
  syllabusConfig: [
    { slug: 'sys-design', maxPerSession: 5 },
    { slug: 'react', maxPerSession: 5 }
  ],
  sm2: { criticalThreshold: 5, mediumThreshold: 3 }
};

// 1. Test SM2
console.log('--- Testing SM2 ---');
const sm2Initial: SM2Fields = { easeFactor: 2.5, interval: 1, repetition: 0, nextReviewDate: new Date(), timesStruggled: 0 };
const sm2Done = updateSM2(sm2Initial, 'done');
console.log('Done:', sm2Done.interval === 3 ? 'PASS' : 'FAIL', '(Expected interval 3)');

const sm2Struggled = updateSM2(sm2Initial, 'struggled');
console.log('Struggled:', sm2Struggled.interval === 1 && sm2Struggled.easeFactor === 2.3 ? 'PASS' : 'FAIL', '(Expected interval 1, ease 2.3)');

// 2. Test Score
console.log('\n--- Testing Score ---');
const scoreEmpty = calcScore([]);
console.log('Empty:', scoreEmpty === 0 ? 'PASS' : 'FAIL', '(Expected 0)');

const scorePerfect = calcScore([
  { result: 'done' } as any, { result: 'done' } as any
]);
console.log('Perfect:', scorePerfect === 100 ? 'PASS' : 'FAIL', '(Expected 100)');

const scoreMixed = calcScore([
  { result: 'done' } as any,      // 10
  { result: 'struggled' } as any, // 5
  { result: 'skipped' } as any,   // -3
  { result: 'skipped' } as any    // -3
]);
// Total: 4, Score = (10 + 5 - 6)/4 * 10 = 9/4 * 10 = 22.5 -> floor -> 22
console.log('Mixed:', scoreMixed === 22 ? 'PASS' : `FAIL (${scoreMixed})`, '(Expected 22)');

// 3. Test Priority Queue
console.log('\n--- Testing priority ---');
const mockBucket: PriorityBuckets = {
  carryForward: [
    { _id: new mongoose.Types.ObjectId(), syllabusSlug: 'sys-design' } as any
  ],
  overdueItems: [],
  criticalGaps: [],
  mediumGaps: [],
  inProgress: [],
  newItems: []
};

const queue = buildQueue(mockBucket, mockSettings, 15);
console.log('Queue Length:', queue.length === 1 ? 'PASS' : 'FAIL', '(Expected 1)');

// 4. Test Gap Escalation
console.log('\n--- Testing Gap Escalation ---');
const gapUpdate = escalateGap({ gap: null } as any, 'struggled', mockSettings);
console.log('Struggle Gap:', gapUpdate.gap?.flagCount === 1 ? 'PASS' : 'FAIL', '(Expected flagCount=1)');

// 5. Test Tomorrow Focus
console.log('\n--- Testing Tomorrow Focus ---');
const tfocus = calcTomorrowFocus([], []);
console.log('Tomorrow Focus Empty:', tfocus.overdueCount === 0 && tfocus.topGap === null ? 'PASS' : 'FAIL');

console.log('\nALL TESTS EXECUTED.');
