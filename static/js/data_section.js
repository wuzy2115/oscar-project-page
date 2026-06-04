// Data Processing Pipeline section:
//   motivation paragraph + data-statistics table + tabbed per-dataset sample
//   grids (2x2 video tiles) + HF release cards.
// Sample clips are built offline by static/videos/data/build_data_clips.sh
// (4 trimmed/looped rgb.mp4 per dataset, exactly 5 s each, native fps + res).
import { mountTabs } from "./_tabs.js";

const DATASETS = [
  { id: "agibot",     label: "AgiBot",        embodiment: "AgiBot G1 humanoid", hours: "181 h" },
  { id: "airoa_moma", label: "AIROA-MoMa",    embodiment: "Toyota HSR",         hours: "16 h"  },
  { id: "droid",      label: "DROID",         embodiment: "Franka + Robotiq",   hours: "157 h" },
  { id: "interndata", label: "InternData-A1", embodiment: "Franka (synthetic)", hours: "12 h"  },
  { id: "rh20t_cfg5", label: "RH20T (cfg5)",  embodiment: "Franka Panda",       hours: "15 h"  },
  { id: "rh20t_cfg7", label: "RH20T (cfg7)",  embodiment: "KUKA iiwa",          hours: "merged with cfg5" },
  { id: "egodex",     label: "EgoDex",        embodiment: "MANO hand",          hours: "256 h" },
  { id: "vitra_epic", label: "EPIC-Kitchens", embodiment: "MANO hand",          hours: "6 h"   },
];

// Per-source episode counts (Public = official scale, Filtered = after our pipeline).
const STATS_ROBOT = [
  { src: "RH20T (cfg5)",  emb: "Franka Panda", pub: "2,241",     filt: "1,261"  },
  { src: "RH20T (cfg7)",  emb: "KUKA iiwa",    pub: "—",         filt: "—"      },
  { src: "InternData-A1", emb: "Franka Panda", pub: "630,000",   filt: "2,233"  },
  { src: "DROID",         emb: "Franka Panda", pub: "76,000",    filt: "21,904" },
  { src: "AgiBot-Beta",   emb: "AgiBot G1",    pub: "1,003,672", filt: "65,720" },
  { src: "AIROA-MoMa",    emb: "Toyota HSR",   pub: "25,469",    filt: "3,712"  },
];
const STATS_HUMAN = [
  { src: "EgoDex",        emb: "Human hand",   pub: "338,000",   filt: "78,273" },
  { src: "EPIC-Kitchens", emb: "Human hand",   pub: "89,977",    filt: "7,554"  },
];

function statsTableHtml() {
  const row = (r) =>
    `<tr><td>${r.src}</td><td>${r.emb}</td><td class="num">${r.pub}</td><td class="num">${r.filt}</td></tr>`;
  return `
    <div class="data-stats">
      <table>
        <caption>Data statistics (episodes). <strong>Public</strong>: official dataset scale;
          <strong>Filtered</strong>: after our pipeline.</caption>
        <thead>
          <tr><th>Source</th><th>Embodiment</th><th class="num">Public</th><th class="num">Filtered</th></tr>
        </thead>
        <tbody>
          ${STATS_ROBOT.map(row).join("")}
          <tr class="subtotal"><td colspan="2">Robot subtotal</td><td class="num">1,737,382</td><td class="num">94,830</td></tr>
          ${STATS_HUMAN.map(row).join("")}
          <tr class="subtotal"><td colspan="2">Human subtotal</td><td class="num">427,977</td><td class="num">85,827</td></tr>
          <tr class="total"><td colspan="2">Total</td><td class="num">2,165,359</td><td class="num">180,657</td></tr>
        </tbody>
      </table>
      <p class="note">RH20T cfg5 (Franka) and cfg7 (KUKA) are merged into one count. InternData-A1 is synthetic.</p>
    </div>
  `;
}

function gridCardHtml(ds) {
  const cells = [1, 2, 3, 4].map(
    (n) => `<video src="static/videos/data/${ds.id}/${n}.mp4"
                   autoplay muted loop playsinline preload="metadata"></video>`
  ).join("");
  return `
    <div class="dataset-grid-card">
      <header class="dataset-grid-header">
        <span class="dataset-grid-label">${ds.label}</span>
        <span class="dataset-grid-meta">${ds.embodiment} &middot; ${ds.hours}</span>
      </header>
      <div class="dataset-grid-2x2">${cells}</div>
    </div>
  `;
}

export function mountDataSection(root) {
  root.innerHTML = `
    <p>
      Robotics and egocentric-human video collected at scale is heterogeneous and noisy:
      clips run too short, drift under moving cameras, freeze near-static, leave the
      manipulator out-of-frame, or carry sensor spikes. The raw corpus is also redundant
      &mdash; the same task repeats in the same scene across thousands of episodes, inflating
      count without adding scene diversity. To expose the model to genuinely diverse
      environments and recoverable conditioning, our pipeline applies a five-stage
      <strong>quality filter</strong> (length, static camera, motion amplitude,
      skeleton-in-FOV, joint-spike sweep) followed by a SigLIP + trajectory
      <strong>semantic deduplication</strong> pass on every retained clip.
    </p>

    ${statsTableHtml()}

    <div class="data-viz"></div>

    <div class="data-release">
      <a class="dataset-card" href="https://huggingface.co/datasets/zywu2115/OSCAR_robot" target="_blank" rel="noopener">
        <img class="hf-logo" src="static/images/icons/huggingface.svg" alt="">
        <div class="dataset-meta">
          <div class="dataset-name">zywu2115/OSCAR_robot</div>
          <div class="dataset-kind">Robot teleoperation &middot; multi-embodiment &middot; skeleton + RGB &middot; 70-frame clips</div>
        </div>
        <div class="dataset-cta">Download &rarr;</div>
      </a>
      <a class="dataset-card" href="https://huggingface.co/datasets/zywu2115/OSCAR_human" target="_blank" rel="noopener">
        <img class="hf-logo" src="static/images/icons/huggingface.svg" alt="">
        <div class="dataset-meta">
          <div class="dataset-name">zywu2115/OSCAR_human</div>
          <div class="dataset-kind">Egocentric human &middot; MANO hand &middot; skeleton + RGB &middot; 70-frame clips</div>
        </div>
        <div class="dataset-cta">Download &rarr;</div>
      </a>
    </div>
  `;

  const vizRoot = root.querySelector(".data-viz");
  mountTabs(vizRoot, DATASETS.map(ds => ({
    label: ds.label,
    render: (panel) => { panel.innerHTML = gridCardHtml(ds); },
  })));
}
