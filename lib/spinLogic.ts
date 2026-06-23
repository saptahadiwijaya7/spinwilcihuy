export type AccurateSpinResult = {
  winners: string[];
  remaining: string[];
  winnerIndexes: number[];
  finalRotation: number;
  arrowAngles: number[];
};

export function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

export function getArrowAngles(count: number) {
  const safeCount = Math.max(1, Math.min(10, count));
  return Array.from({ length: safeCount }, (_, index) => (index * 360) / safeCount);
}

export function getIndexesAtArrows(namesLength: number, finalRotation: number, arrowAngles: number[]) {
  if (namesLength <= 0) return [];
  const segment = 360 / namesLength;
  return arrowAngles.map((arrowAngle) => {
    const wheelAngleUnderArrow = normalizeDegrees(arrowAngle - finalRotation);
    return Math.min(namesLength - 1, Math.floor(wheelAngleUnderArrow / segment));
  });
}

function isAwayFromSegmentBoundary(namesLength: number, finalRotation: number, arrowAngles: number[], marginRatio: number) {
  if (namesLength <= 0) return false;
  const segment = 360 / namesLength;
  const margin = segment * marginRatio;

  return arrowAngles.every((arrowAngle) => {
    const wheelAngleUnderArrow = normalizeDegrees(arrowAngle - finalRotation);
    const positionInSegment = wheelAngleUnderArrow % segment;
    return positionInSegment > margin && positionInSegment < segment - margin;
  });
}

function buildFinalRotation(currentRotation: number, baseTurns: number, desiredModulo: number) {
  const base = currentRotation + baseTurns;
  return base + normalizeDegrees(desiredModulo - normalizeDegrees(base));
}

export function calculateAccurateSpin(names: string[], winnerCount: number, currentRotation: number, spinDuration: number): AccurateSpinResult {
  const safeCount = Math.max(1, Math.min(10, winnerCount, names.length));
  const arrowAngles = getArrowAngles(safeCount);
  const segment = 360 / names.length;
  const baseTurns = Math.max(4, spinDuration) * 360;

  let finalRotation = currentRotation + baseTurns + Math.random() * 360;
  let winnerIndexes = getIndexesAtArrows(names.length, finalRotation, arrowAngles);

  // Kandidat utama: arahkan panah pertama ke tengah salah satu segment.
  // Ini mencegah panah berhenti tepat di garis batas antar nama.
  const shuffledTargetIndexes = Array.from({ length: names.length }, (_, index) => index).sort(() => Math.random() - 0.5);
  const marginRatios = [0.22, 0.18, 0.14, 0.10, 0.06, 0.03];

  for (const marginRatio of marginRatios) {
    for (const targetIndex of shuffledTargetIndexes) {
      const desiredWheelAngleUnderFirstArrow = targetIndex * segment + segment / 2;
      const desiredModulo = normalizeDegrees(arrowAngles[0] - desiredWheelAngleUnderFirstArrow);
      const candidate = buildFinalRotation(currentRotation, baseTurns, desiredModulo);
      const indexes = getIndexesAtArrows(names.length, candidate, arrowAngles);

      if (new Set(indexes).size === safeCount && isAwayFromSegmentBoundary(names.length, candidate, arrowAngles, marginRatio)) {
        finalRotation = candidate;
        winnerIndexes = indexes;
        const winners = winnerIndexes.map((index) => names[index]);
        const winnerIndexSet = new Set(winnerIndexes);
        const remaining = names.filter((_, index) => !winnerIndexSet.has(index));
        return { winners, remaining, winnerIndexes, finalRotation, arrowAngles };
      }
    }
  }

  // Fallback: scan sudut dengan offset setengah segment, tetap prioritaskan tidak dekat batas.
  for (const marginRatio of marginRatios) {
    for (let attempt = 0; attempt < 1440; attempt += 1) {
      const desiredModulo = normalizeDegrees(segment / 2 + attempt * 0.25);
      const candidate = buildFinalRotation(currentRotation, baseTurns, desiredModulo);
      const indexes = getIndexesAtArrows(names.length, candidate, arrowAngles);
      if (new Set(indexes).size === safeCount && isAwayFromSegmentBoundary(names.length, candidate, arrowAngles, marginRatio)) {
        finalRotation = candidate;
        winnerIndexes = indexes;
        const winners = winnerIndexes.map((index) => names[index]);
        const winnerIndexSet = new Set(winnerIndexes);
        const remaining = names.filter((_, index) => !winnerIndexSet.has(index));
        return { winners, remaining, winnerIndexes, finalRotation, arrowAngles };
      }
    }
  }

  // Fallback terakhir tetap memakai hasil indeks panah, tetapi tidak memilih dari garis batas awal.
  const fallbackModulo = normalizeDegrees(segment / 2 + Math.random() * Math.max(segment * 0.5, 0.1));
  finalRotation = buildFinalRotation(currentRotation, baseTurns, fallbackModulo);
  winnerIndexes = getIndexesAtArrows(names.length, finalRotation, arrowAngles);

  const winners = winnerIndexes.map((index) => names[index]);
  const winnerIndexSet = new Set(winnerIndexes);
  const remaining = names.filter((_, index) => !winnerIndexSet.has(index));

  return { winners, remaining, winnerIndexes, finalRotation, arrowAngles };
}
