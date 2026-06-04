import { mountTabs } from "./_tabs.js";

const BASELINE_CASES = [
  { case_id: "robot__agibot__787_924471_a11_1290_1561__head",      tab: "AgiBot G1",    title: "AgiBot G1 — Bimanual manipulation" },
  { case_id: "robot__airoa_moma__ep_004153__head",                 tab: "AIROA HSR",    title: "AIROA HSR — Mobile manipulation" },
  { case_id: "robot__droid__REAL__success__2023-06-23__Fri_Jun_23_16:44:47_2023__20540549",
                                                  tab: "DROID Franka", title: "DROID Franka — Tabletop pick" },
  { case_id: "robot__rh20t_cfg5__task_0123_user_0010_scene_0009_cfg_0005__036422060215",
                                                  tab: "RH20T Franka", title: "RH20T Franka — Contact-rich" },
  { case_id: "robot__rh20t_cfg7__task_0002_user_0014_scene_0002_cfg_0007__104122060811",
                                                  tab: "RH20T KUKA",   title: "RH20T KUKA — Contact-rich" },
];

const METHODS_TOP = [
  { key: "skeleton",  label: "Skeleton (Input)",   tip: "2D kinematic skeleton — the OSCAR condition" },
  { key: "gt",        label: "GT",                 tip: "Ground-truth video" },
  { key: "ours",      label: "OSCAR (Ours)",       tip: "Skeleton-conditioned, jointly trained on robot teleop + egocentric human video" },
  { key: "tesseract", label: "TesserAct",          tip: "Text + first-frame video baseline (Zhen et al., ICCV 2025)" },
];
const METHODS_BOTTOM = [
  { key: "kinema4d",         label: "Kinema4D",          tip: "Geometry-conditioned baseline using textured-mesh pointmaps; 14B params (Xu et al., 2026)" },
  { key: "cosmos_i2w_base",  label: "Cosmos-Predict2.5", tip: "Text + first-frame base model before our finetune (NVIDIA, 2025)" },
  { key: "genie_envisioner", label: "Genie-Envisioner",  tip: "Geometry-conditioned baseline with gripper-only renders (Liao et al., 2025)" },
  { key: "enerverse_ac",     label: "EnerVerse-AC",      tip: "Action-conditioned baseline with gripper-only renders (Jiang et al., NeurIPS'25 Workshop)" },
];

function v(case_id, method) {
  return `static/videos/section_6_baselines/${encodeURIComponent(case_id)}/${method}.mp4`;
}

function cell(case_id, m) {
  return `
    <div class="baseline-cell${m.key === "ours" ? " is-ours" : ""}">
      <video src="${v(case_id, m.key)}" autoplay muted loop playsinline></video>
      <div class="caption" data-tooltip="${m.tip}">${m.label}</div>
    </div>
  `;
}

function caseHtml(c) {
  return `
    <figure class="baselines-case">
      <figcaption class="caption baselines-title">${c.title}</figcaption>
      <div class="baselines-grid">
        ${METHODS_TOP.map(m => cell(c.case_id, m)).join("")}
        ${METHODS_BOTTOM.map(m => cell(c.case_id, m)).join("")}
      </div>
    </figure>
  `;
}

export function mountBaselines(root) {
  mountTabs(root, BASELINE_CASES.map(c => ({
    label: c.tab,
    render: (panel) => { panel.innerHTML = caseHtml(c); },
  })));
}
