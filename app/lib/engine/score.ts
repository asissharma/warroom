import { ISessionResult } from '../models/Session';

export function calcScore(results: ISessionResult[]): number {
  if (results.length === 0) return 0;

  const total = results.length;
  const done = results.filter(r => r.result === 'done').length;
  const struggled = results.filter(r => r.result === 'struggled').length;
  const skipped = results.filter(r => r.result === 'skipped').length;

  return Math.floor(
    Math.min(100, Math.max(0, ((done * 10 + struggled * 5 - skipped * 3) / total) * 10))
  );
}
