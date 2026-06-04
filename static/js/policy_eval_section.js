// policy_eval_section.js — Policy Evaluation: WM-as-evaluator quant chart + cherry-picked cases.
import { mountTabs } from "./_tabs.js";

const DATA_URL = "static/data/policy_eval_data.json";

function badge(ok, label) {
  const span = document.createElement("span");
  span.className = "pe-badge " + (ok ? "pe-pass" : "pe-fail");
  span.textContent = `${label} ${ok ? "✓" : "✗"}`;
  return span;
}

function videoEl(src, label) {
  const fig = document.createElement("figure");
  fig.className = "pe-vid";
  const v = document.createElement("video");
  v.src = src;
  v.muted = true; v.loop = true; v.autoplay = true;
  v.playsInline = true; v.setAttribute("playsinline", "");
  v.preload = "metadata";
  const cap = document.createElement("figcaption");
  cap.textContent = label;
  fig.append(v, cap);
  return fig;
}

export async function mountPolicyEval(root) {
  let data;
  try {
    data = await (await fetch(DATA_URL)).json();
  } catch (e) {
    root.innerHTML = "<p class='pe-error'>Policy-eval data unavailable.</p>";
    return;
  }

  const intro = document.createElement("p");
  intro.className = "pe-intro";
  intro.textContent =
    "We deploy OSCAR as a policy evaluator on RoboArena. For each of seven open-source " +
    "DROID generalist policies, we autoregressively roll out OSCAR from the recorded first " +
    "frame and the policy's action trace, then prompt GPT-5 to judge task success. The " +
    "predicted success rates track real-robot deployment, showing OSCAR can score policies " +
    "without hardware.";
  root.appendChild(intro);

  if (data.quant?.chart) {
    const q = document.createElement("figure");
    q.className = "pe-quant";
    const img = document.createElement("img");
    img.src = data.quant.chart;
    img.alt = "Real-world vs world-model success rate per policy";
    img.loading = "lazy";
    const cap = document.createElement("figcaption");
    cap.textContent = data.quant.caption || "";
    q.append(img, cap);
    root.appendChild(q);
  }

  const note = document.createElement("p");
  note.className = "pe-gridnote";
  note.innerHTML =
    "Each case compares the real-robot rollout (<strong>Real</strong>) with OSCAR rollouts " +
    "judged by GPT-5 (<strong>WM</strong>). Skeleton conditioning (ours) tracks the real " +
    "outcome most closely; EE- and mesh-conditioned rollouts drift further from it.";
  root.appendChild(note);

  const cases = data.cases || [];
  const tabsRoot = document.createElement("div");
  tabsRoot.className = "pe-tabs";
  root.appendChild(tabsRoot);

  // Disambiguate repeated policy labels (e.g. two π₀-FAST cases).
  const seen = {};
  const tabLabel = (c) => {
    const base = c.policy_label || "Case";
    const total = cases.filter(x => x.policy_label === c.policy_label).length;
    if (total <= 1) return base;
    seen[base] = (seen[base] || 0) + 1;
    return `${base}<span class="tab-sub">${seen[base]}</span>`;
  };

  mountTabs(tabsRoot, cases.map(c => ({
    label: tabLabel(c),
    render: (panel) => panel.appendChild(buildCaseCard(c)),
  })));
}

function buildCaseCard(c) {
  const card = document.createElement("article");
  card.className = "policy-eval-case";

  const head = document.createElement("header");
  head.className = "pe-head";
  const title = document.createElement("div");
  title.className = "pe-title";
  title.innerHTML = `<span class="pe-policy">${c.policy_label}</span>` +
                    `<span class="pe-instr">${c.instruction}</span>`;
  const badges = document.createElement("div");
  badges.className = "pe-badges";
  badges.append(badge(c.real_binary === 1, "Real"),
                badge(c.wm_binary === 1, "WM"));
  head.append(title, badges);

  const vids = document.createElement("div");
  vids.className = "pe-vids";
  vids.append(
    videoEl(c.videos.skel_gt, "Skeleton (ours)  |  Ground truth"),
    videoEl(c.videos.ee, "EE-cond"),
    videoEl(c.videos.mesh, "Mesh-cond"),
  );

  card.append(head, vids);
  return card;
}
