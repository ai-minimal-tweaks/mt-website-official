export type Pt = { x: number; y: number };

/** Ramer–Douglas–Peucker: keeps the corners of a hand-drawn line and drops the wobble between them. */
function simplify(pts: Pt[], eps: number): Pt[] {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  let max = 0;
  let idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const d = Math.abs((b.y - a.y) * p.x - (b.x - a.x) * p.y + b.x * a.y - b.y * a.x) / len;
    if (d > max) [max, idx] = [d, i];
  }
  if (max <= eps) return [a, b];
  return [...simplify(pts.slice(0, idx + 1), eps).slice(0, -1), ...simplify(pts.slice(idx), eps)];
}

type Run = { dir: -1 | 1; amp: number; x0: number; x1: number };

/**
 * Does this drawing read as a capital M? Deliberately forgiving: one stroke or several (pen lifts are joined),
 * straight or slanted legs, a deep or shallow middle V, drawn left→right or right→left.
 * The test: somewhere in the line there are four vertical moves in a row — up, down, up, down — with tall
 * outer legs, and they travel steadily sideways.
 */
export function looksLikeM(strokes: Pt[][]): boolean {
  const pts = strokes.flat();
  if (pts.length < 6) return false;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  if (Math.max(w, h) < 48 || h < 30) return false;
  if (w < h * 0.3 || w > h * 5) return false;

  const simp = simplify(pts, Math.max(w, h) * 0.07);
  const runs: Run[] = [];
  for (let i = 1; i < simp.length; i++) {
    const dy = simp[i].y - simp[i - 1].y;
    if (Math.abs(dy) < h * 0.08) continue;
    const dir = dy < 0 ? -1 : 1; // -1 = up the screen
    const last = runs[runs.length - 1];
    if (last && last.dir === dir) {
      last.amp += Math.abs(dy);
      last.x1 = simp[i].x;
    } else runs.push({ dir, amp: Math.abs(dy), x0: simp[i - 1].x, x1: simp[i].x });
  }

  for (let i = 0; i + 3 < runs.length; i++) {
    const [a, b, c, d] = runs.slice(i, i + 4);
    if (a.dir !== -1 || b.dir !== 1 || c.dir !== -1 || d.dir !== 1) continue;
    if (a.amp < h * 0.45 || d.amp < h * 0.45 || b.amp < h * 0.18 || c.amp < h * 0.18) continue;
    const marks = [a.x0, a.x1, b.x1, c.x1, d.x1];
    const tol = w * 0.12;
    const rising = marks.every((x, k) => k === 0 || x >= marks[k - 1] - tol);
    const falling = marks.every((x, k) => k === 0 || x <= marks[k - 1] + tol);
    if ((rising || falling) && Math.abs(marks[4] - marks[0]) >= w * 0.45) return true;
  }
  return false;
}
