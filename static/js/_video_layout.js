// Per-dataset panel widths inside the comparison.mp4 strip.
// Widths used as `fr` units in a 3-column grid overlay so labels stay
// centered on each panel at any viewport width.
export const PANEL_WIDTHS = {
  agibot:     [480, 960, 480],
  airoa_moma: [640, 640, 640],
  droid:      [640, 640, 640],
  interndata: [640, 640, 640],
  rh20t_cfg5: [640, 640, 640],
  rh20t_cfg7: [640, 640, 640],
  egodex:     [640, 640, 640],
  vitra_epic: [640, 640, 640],
};
export const DEFAULT_WIDTHS = [640, 640, 640];

export const LABELS = ["OSCAR (Ours)", "Skeleton", "GT"];
export const LABEL_CLASS = ["is-ours", "", ""];

export function renderLabels(dataset) {
  const widths = PANEL_WIDTHS[dataset] || DEFAULT_WIDTHS;
  const cols = widths.map(w => `${w}fr`).join(" ");
  const items = LABELS.map((txt, i) =>
    `<span class="video-label ${LABEL_CLASS[i]}">${txt}</span>`
  ).join("");
  return `<div class="video-label-row" style="grid-template-columns: ${cols};">${items}</div>`;
}
