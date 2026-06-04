const ABSTRACT = `We present <strong>OSCAR</strong>, a precise action-conditioned video world model that generalizes across different robot embodiments and enables robot policy evaluation. Existing video world models face three main challenges for real-world robot evaluation: limited scenario diversity in current robot training datasets, imprecise action following, and poor generalization across embodiments for broad adoption. We tackle these challenges from two perspectives. At its core is a large-scale standardized data pipeline that curates, filters, and deduplicates broad robotics and egocentric human datasets, yielding a clean joint-training dataset that spans diverse tasks, scenarios, actions, and robot embodiments. To condition the video model, we adopt 2D kinematic skeleton rendering as a unified conditioning representation that generalizes across different robot arms or even human hands. We finetune the Cosmos-Predict2.5-2B model on a single GH200 GPU. Our model achieves significant improvement on action following, appearance quality, and motion consistency, compared to existing baselines, which either have a much larger model size or require more GPUs. We further deploy <strong>OSCAR</strong> to evaluate robot policies from RoboArena. Extensive experiments demonstrate the significant correlation between our virtual policy evaluation in <strong>OSCAR</strong> and real-world evaluation, paving the way for the future where robot policies can be purely evaluated in virtual generated worlds.`;

const METHOD_CAPTION = `<strong>Method overview.</strong> <strong>OSCAR</strong> consists of three components: <strong>(1) Condition encoding</strong> encodes the first frame <span class="math">I<sub>0</sub></span> and rendered skeleton <span class="math">S<sub>1:T</sub></span> into latents using VAE; <strong>(2) Conditioning injection</strong> combines the skeleton latent with the noisy video latent; and <strong>(3) Video generation</strong>, where a DiT denoises the tokens and a VAE decoder decodes the final video.`;

export function mountAbstract(root) {
  root.innerHTML = `
    <p>${ABSTRACT}</p>
    <figure class="overview-video">
      <video controls preload="none" playsinline
             poster="static/videos/overview/poster.jpg"
             aria-label="OSCAR overview video, two minutes">
        <source src="static/videos/overview/oscar_overview.mp4" type="video/mp4">
      </video>
      <figcaption class="caption">Overview video &middot; 2&nbsp;min</figcaption>
    </figure>
  `;
}

export function mountMethod(root) {
  root.innerHTML = `
    <figure>
      <img src="static/images/worldsim_method_v2.png" alt="OSCAR architecture"
           style="width: 100%; max-width: 1100px; display: block; margin: 0 auto;">
      <figcaption class="caption">${METHOD_CAPTION}</figcaption>
    </figure>
  `;
}
