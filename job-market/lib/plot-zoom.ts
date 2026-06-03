/** Pinch (ctrl+wheel) zoom only — regular scroll passes through to the page. */
export function attachPlotZoomGestures(graphDiv: HTMLElement) {
  graphDiv.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        return;
      }
      e.stopImmediatePropagation();
    },
    { passive: false, capture: true }
  );
}

export const ZOOM_HINT = "Pinch to zoom · double-click or Reset to restore";
