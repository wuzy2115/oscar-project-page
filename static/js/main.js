import { mountTeaser }                from './teaser.js';
import { mountAbstract, mountMethod } from './static_sections.js';
import { mountDataSection }           from './data_section.js';
import { mountResults }               from './results_section.js';
import { mountBaselines }             from './baselines_section.js';
import { mountAblations }             from './ablations_section.js';
import { mountPolicyEval }            from './policy_eval_section.js';

document.addEventListener("DOMContentLoaded", () => {
  const map = {
    "teaser-root":    mountTeaser,
    "abstract-root":  mountAbstract,
    "method-root":    mountMethod,
    "data-root":      mountDataSection,
    "results-root":   mountResults,
    "baselines-root": mountBaselines,
    "ablations-root": mountAblations,
    "policy-eval-root": mountPolicyEval,
  };
  for (const [id, fn] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) fn(el);
  }

  const copyBtn = document.getElementById("copy-bibtex");
  const bibtex = document.getElementById("bibtex-content");
  if (copyBtn && bibtex) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(bibtex.textContent);
      const orig = copyBtn.textContent;
      copyBtn.textContent = "Copied!";
      setTimeout(() => { copyBtn.textContent = orig; }, 1500);
    });
  }

  setupScrollReveal();
});

function setupScrollReveal() {
  const targets = document.querySelectorAll(".section, .results-case, .baselines-case, .policy-eval-case");
  targets.forEach(el => el.classList.add("reveal"));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || !("IntersectionObserver" in window)) {
    targets.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

  targets.forEach(el => io.observe(el));
}
