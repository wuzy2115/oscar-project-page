import { mountTabs } from "./_tabs.js";

async function loadManifest() {
  const r = await fetch("static/web_case_manifest.json");
  return r.json();
}

function vCond(case_id, method) {
  return `static/videos/section_7_1_cond/${encodeURIComponent(case_id)}/${method}.mp4`;
}
function vHuman(case_id, method) {
  return `static/videos/section_7_2_human/${encodeURIComponent(case_id)}/${method}.mp4`;
}

const TIP_COND = {
  gt:       "Ground-truth video",
  skeleton: "2D kinematic skeleton — the OSCAR condition",
  ee:       "Cosmos-style latent action token from end-effector pose chunks; no spatial alignment to the image plane",
  mesh:     "Per-pixel textured URDF mesh render replacing the 2D skeleton",
};
const TIP_HUMAN = {
  gt:         "Ground-truth video",
  no_human:   "Trained on robot data only — no egocentric human pretraining",
  with_human: "Jointly trained with egocentric human hand video (MANO-conditioned)",
};

function condCaseHtml(c) {
  return `
    <figure style="margin: 0;">
      <div class="grid" style="grid-template-columns: repeat(4, 1fr);">
        <div><video src="${vCond(c.case_id, 'gt')}"       autoplay muted loop playsinline></video><div class="caption" data-tooltip="${TIP_COND.gt}">GT</div></div>
        <div><video src="${vCond(c.case_id, 'skeleton')}" autoplay muted loop playsinline></video><div class="caption is-ours" data-tooltip="${TIP_COND.skeleton}">Skeleton (Ours)</div></div>
        <div><video src="${vCond(c.case_id, 'ee')}"       autoplay muted loop playsinline></video><div class="caption" data-tooltip="${TIP_COND.ee}">EE-only</div></div>
        <div><video src="${vCond(c.case_id, 'mesh')}"     autoplay muted loop playsinline></video><div class="caption" data-tooltip="${TIP_COND.mesh}">Mesh</div></div>
      </div>
    </figure>
  `;
}

function humanCaseHtml(c) {
  return `
    <figure style="margin: 0;">
      <div class="grid" style="grid-template-columns: repeat(3, 1fr);">
        <div><video src="${vHuman(c.case_id, 'gt')}"         autoplay muted loop playsinline></video><div class="caption" data-tooltip="${TIP_HUMAN.gt}">GT</div></div>
        <div><video src="${vHuman(c.case_id, 'no_human')}"   autoplay muted loop playsinline></video><div class="caption" data-tooltip="${TIP_HUMAN.no_human}">Robot-only</div></div>
        <div><video src="${vHuman(c.case_id, 'with_human')}" autoplay muted loop playsinline></video><div class="caption is-ours" data-tooltip="${TIP_HUMAN.with_human}">OSCAR (w/ human)</div></div>
      </div>
    </figure>
  `;
}

function ablationBlock(root, { question, answer, cases, caseHtml }) {
  const block = document.createElement("div");
  block.className = "ablation-block";
  block.innerHTML = `<h3 class="ablation-q">${question}</h3><p class="ablation-a">${answer}</p>`;
  const tabsRoot = document.createElement("div");
  block.appendChild(tabsRoot);
  root.appendChild(block);
  mountTabs(tabsRoot, cases.map((c, i) => ({
    label: `Case ${i + 1}`,
    render: (panel) => { panel.innerHTML = caseHtml(c); },
  })));
}

export async function mountAblations(root) {
  let m;
  try { m = await loadManifest(); }
  catch (e) { root.innerHTML = `<p>Manifest unavailable: ${e}</p>`; return; }

  const condCases  = m.section_7_1_cond  || [];
  const humanCases = m.section_7_2_human || [];

  if (condCases.length) {
    ablationBlock(root, {
      question: "Which is the better conditioning signal?",
      answer: `<strong>The 2D kinematic skeleton wins.</strong>
        End-effector pose tokens discard joint geometry, and per-pixel meshes
        overfit to a single robot's appearance. The 2D skeleton keeps full joint
        kinematics while staying embodiment-agnostic — giving the most precise,
        transferable control.`,
      cases: condCases,
      caseHtml: condCaseHtml,
    });
  }

  if (humanCases.length) {
    ablationBlock(root, {
      question: "Does watching humans teach robots?",
      answer: `Yes — <strong>egocentric hand video transfers.</strong>
        Adding MANO-conditioned human pretraining lifts robot motion fidelity on contact-rich tasks —
        for the price of internet-scale data we already had.`,
      cases: humanCases,
      caseHtml: humanCaseHtml,
    });
  }

  if (!root.children.length) root.innerHTML = `<p>Ablations coming soon.</p>`;
}
