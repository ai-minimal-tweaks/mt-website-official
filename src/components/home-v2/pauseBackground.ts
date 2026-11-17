let holders = 0;

/**
 * Tells the WebGL hero light (GradientField) to stop drawing while something covers it: the intro gate, a form
 * pop-up. Returns the release function. Counted, so overlapping overlays don't un-pause each other.
 */
export function pauseBackground() {
  holders++;
  document.documentElement.setAttribute("data-bg-pause", "");
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--holders <= 0) {
      holders = 0;
      document.documentElement.removeAttribute("data-bg-pause");
    }
  };
}
