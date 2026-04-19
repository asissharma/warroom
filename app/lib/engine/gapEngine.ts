import { ISyllabusItem } from '../models/SyllabusItem';
import { ISettings } from '../models/Settings';

export function escalateGap(
  item: ISyllabusItem,
  result: 'done' | 'struggled' | 'skipped',
  settings: ISettings
): Partial<ISyllabusItem> {
  const updates: Partial<ISyllabusItem> = {};

  if (result === 'struggled') {
    const currentGap = item.gap || {
      isFlagged: true,
      flagCount: 0,
      severity: 'low',
      lastAddressedAt: null
    };

    currentGap.flagCount += 1;
    currentGap.isFlagged = true;

    if (currentGap.flagCount >= settings.sm2.criticalThreshold) {
      currentGap.severity = 'critical';
    } else if (currentGap.flagCount >= settings.sm2.mediumThreshold) {
      currentGap.severity = 'medium';
    } else {
      currentGap.severity = 'low';
    }

    updates.gap = currentGap;
  }

  if (result === 'done' && item.gap) {
    updates.gap = { ...item.gap };
    updates.gap.lastAddressedAt = new Date();
  }

  return updates;
}
