import { renderLabels } from "./_video_layout.js";
import { mountTabs } from "./_tabs.js";

// One representative case per embodiment configuration. Tabs are labelled by
// the robot arm configuration. The Franka Panda configuration (DROID,
// InternData, RH20T-Franka all share it) is shown via a single DROID case.
const RESULTS = [
  { dataset: "agibot", tab: "AgiBot G1", label: "AgiBot G1", cases: [
    { case_id: "robot__agibot__510_742694_a3_1262_1372__head",   title: "Pick & place — high shelf" },
  ]},
  { dataset: "airoa_moma", tab: "Toyota HSR", label: "Toyota HSR", cases: [
    { case_id: "robot__airoa_moma__ep_008274__head", title: "Mobile-base reach" },
  ]},
  { dataset: "droid", tab: "Franka Panda", label: "Franka Panda", cases: [
    { case_id: "robot__droid__REAL__success__2023-06-23__Fri_Jun_23_16:44:47_2023__20540549", title: "Tabletop pick" },
  ]},
  { dataset: "rh20t_cfg7", tab: "KUKA iiwa", label: "KUKA iiwa", cases: [
    { case_id: "robot__rh20t_cfg7__task_0002_user_0014_scene_0002_cfg_0007__104122060811", title: "Contact-rich manipulation" },
  ]},
];

function vUrl(case_id) {
  return `static/videos/section_4_our_results/${encodeURIComponent(case_id)}/comparison.mp4`;
}

function groupHtml(group) {
  return `
    <section class="results-group">
      <header class="group-header">
        <h3>${group.label}</h3>
      </header>
      <div class="results-cases">
        ${group.cases.map(c => `
          <figure class="results-case">
            <figcaption class="caption">${c.title}</figcaption>
            <div class="video-container">
              <video src="${vUrl(c.case_id)}" autoplay muted loop playsinline></video>
              ${renderLabels(group.dataset)}
            </div>
          </figure>
        `).join("")}
      </div>
    </section>
  `;
}

export function mountResults(root) {
  mountTabs(root, RESULTS.map(group => ({
    label: group.tab,
    render: (panel) => { panel.innerHTML = groupHtml(group); },
  })));
}
