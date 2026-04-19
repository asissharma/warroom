export interface SM2Fields {
  easeFactor: number;
  interval: number;
  repetition: number;
  nextReviewDate: Date;
  timesStruggled: number;
}

export function updateSM2(current: SM2Fields, result: 'done' | 'struggled' | 'skipped'): SM2Fields {
  if (result === 'skipped') return current;

  let { easeFactor, interval, repetition, timesStruggled } = current;

  if (result === 'done') {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
    easeFactor += 0.1;
  } else if (result === 'struggled') {
    repetition = 0;
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    timesStruggled += 1;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return { easeFactor, interval, repetition, nextReviewDate, timesStruggled };
}
