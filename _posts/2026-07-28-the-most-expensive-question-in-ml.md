---
layout: post
title: "The Most Expensive Question in Machine Learning: Scaling Laws and the Economics of Scale"
category: blog
tags: 
- data science
- machine learning
- business strategy
- economics
date: 2026-07-28
image: /assets/images/spiral.jpg
description: The optimal allocation of compute between model parameters and dataset size has changed twice in six years. Modern inference economics and the Densing Law are redrawing the map of AI competitiveness.
dropcap: True
draft: false
---

<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML">
</script>

The economist Thomas Sowell famously remarked that \"there are no solutions, only trade-offs.\" In no field is this axiom more painfully (and expensively) visible today than in the engineering of frontier artificial intelligence. Before a laboratory turns on its GPU clusters for a multi-million-dollar training run, it must answer what is arguably the most expensive question in computer science: given a fixed budget of compute, should the capital buy a larger model, or should it buy more data to train a smaller one? 

An incorrect answer costs tens of millions of dollars and consigns a model to irrelevance. The correct answer has changed twice in the last six years, and understanding why is the closest thing the field has to a general theory of its own economics.

---

## The Kaplan Recipe: Parameters Over Data

The first attempt at a general theory of scaling came in January 2020, when Jared Kaplan and his colleagues at OpenAI published *"Scaling Laws for Neural Language Models."* Sweeping across seven orders of magnitude of compute, they found that a model's cross-entropy loss followed clean power laws. The architectural details (width, depth, number of heads) were largely irrelevant within a broad range. The critical factors were parameters $$N$$, dataset size $$D$$, and total compute $$C$$. 

Kaplan’s most consequential conclusion was operational. For a given compute budget, the optimal allocation of resources favored model size over data volume:

$$N_{\text{optimal}} \propto C^{0.73}, \qquad D_{\text{optimal}} \propto C^{0.27}$$

This relationship translated into a simple industry slogan: larger models are radically more sample-efficient. The operational advice was to buy parameters and stop training well short of convergence. The industry followed this advice. GPT-3 (175B parameters) was trained on roughly 300 billion tokens—a ratio of only 1.7 tokens per parameter. Gopher (280B) and Megatron-Turing NLG (530B) followed the same recipe.

---

## The Chinchilla Correction: Data Was Under-Ordered

In March 2022, Jordan Hoffmann and the DeepMind team challenged this orthodoxy. In their paper, *"Training Compute-Optimal Large Language Models,"* they held compute budgets constant and swept the ratio of $$N$$ to $$D$$ using the \"IsoFLOP\" methodology. Their U-shaped performance curves showed that model size and dataset size should scale in equal proportion:

$$N_{\text{optimal}} \propto C^{0.50}, \qquad D_{\text{optimal}} \propto C^{0.50}$$

This yielded the now-canonical rule of thumb: a compute-optimal model requires roughly 20 tokens per parameter. To prove their thesis, DeepMind trained Chinchilla, a 70B parameter model, on 1.4 trillion tokens using the same compute budget as the 280B Gopher. Chinchilla outperformed Gopher, GPT-3, and other larger models across the board. The implication was clear: the industry had spent billions of dollars training models that were, in Hoffmann's polite formulation, \"significantly undertrained.\"

Funnily enough, the technical discrepancy between Kaplan and Chinchilla was not resolved by algorithmic breakthroughs, but by a simple correction in counting. In June 2024, Tim Pearce and Jinyeop Song demonstrated that Kaplan’s steeper scaling exponent was a counting artifact. Kaplan had measured $N$ using only non-embedding parameters. At small training runs, embedding tables consume a large fraction of the total parameter count, distorting the slope. Once the embedding parameters are accounted for, both approaches converge on the Chinchilla optimal ratio.

---

## Interactive Scaling Law Calculator

To visualize how these scaling regimes allocate compute, and how inference volume shifts the optimal trade-off, use the interactive calculator below. Adjust the training compute budget and the expected query volume to see how the optimal model size and token count adapt.

<div style="background: rgba(30, 41, 59, 0.75); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 24px; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 24px 0; backdrop-filter: blur(8px);">
  <h3 style="margin-top: 0; color: #38bdf8; font-size: 1.25rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">Lifecycle Compute Optimizer</h3>
  
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
    <div>
      <label style="display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 6px;">Training Compute Budget (log FLOPs)</label>
      <input type="range" id="computeSlider" min="21" max="26" step="0.1" value="23.8" style="width: 100%; accent-color: #38bdf8;">
      <div id="computeVal" style="font-size: 0.9rem; font-weight: bold; margin-top: 4px; color: #e2e8f0;">10^23.8 FLOPs (Llama 3 8B class)</div>
    </div>
    
    <div>
      <label style="display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 6px;">Lifetime Inference Queries (Billions)</label>
      <input type="range" id="querySlider" min="0" max="1000" step="10" value="100" style="width: 100%; accent-color: #38bdf8;">
      <div id="queryVal" style="font-size: 0.9rem; font-weight: bold; margin-top: 4px; color: #e2e8f0;">100 Billion queries</div>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
    <thead>
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.2); color: #38bdf8;">
        <th style="padding: 8px;">Scaling Regime</th>
        <th style="padding: 8px;">Model Size (N)</th>
        <th style="padding: 8px;">Dataset Size (D)</th>
        <th style="padding: 8px;">Tokens/Param Ratio</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <td style="padding: 8px; font-weight: bold; color: #f43f5e;">Kaplan (2020)</td>
        <td style="padding: 8px;" id="kaplanN">--</td>
        <td style="padding: 8px;" id="kaplanD">--</td>
        <td style="padding: 8px;" id="kaplanRatio">--</td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <td style="padding: 8px; font-weight: bold; color: #10b981;">Chinchilla (2022)</td>
        <td style="padding: 8px;" id="chinchillaN">--</td>
        <td style="padding: 8px;" id="chinchillaD">--</td>
        <td style="padding: 8px;" id="chinchillaRatio">--</td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); background: rgba(56, 189, 248, 0.05);">
        <td style="padding: 8px; font-weight: bold; color: #38bdf8;">Amortized Inference</td>
        <td style="padding: 8px;" id="amortizedN">--</td>
        <td style="padding: 8px;" id="amortizedD">--</td>
        <td style="padding: 8px;" id="amortizedRatio">--</td>
      </tr>
    </tbody>
  </table>
  <div style="font-size: 0.75rem; color: #64748b; margin-top: 12px; line-height: 1.3;">
    *Calculations assume 6 FLOPs/parameter per token during training and 2 FLOPs/parameter per token (500 tokens/query) during inference.
  </div>
</div>

<script>
(function() {
  const computeSlider = document.getElementById('computeSlider');
  const querySlider = document.getElementById('querySlider');
  const computeVal = document.getElementById('computeVal');
  const queryVal = document.getElementById('queryVal');

  const k_capN = document.getElementById('kaplanN');
  const k_capD = document.getElementById('kaplanD');
  const k_capR = document.getElementById('kaplanRatio');

  const c_chinN = document.getElementById('chinchillaN');
  const c_chinD = document.getElementById('chinchillaD');
  const c_chinR = document.getElementById('chinchillaRatio');

  const a_amortN = document.getElementById('amortizedN');
  const a_amortD = document.getElementById('amortizedD');
  const a_amortR = document.getElementById('amortizedRatio');

  function update() {
    const logC = parseFloat(computeSlider.value);
    const C = Math.pow(10, logC);
    const Q_queries = parseFloat(querySlider.value) * 1e9;
    const Q_tokens = Q_queries * 500; // 500 tokens generated per query

    // Label mapping for visual clarity
    let classLabel = "Custom";
    if (logC >= 25.5) classLabel = "GPT-4 class";
    else if (logC >= 24.8) classLabel = "Llama 3 70B class";
    else if (logC >= 23.5) classLabel = "Llama 3 8B class";
    else if (logC >= 22.8) classLabel = "GPT-3 class";
    else classLabel = "Small Prototype";

    computeVal.innerText = `10^${logC.toFixed(1)} FLOPs (${classLabel})`;
    queryVal.innerText = `${querySlider.value} Billion queries`;

    // 1. Kaplan Allocation
    // Calibrated so that C = 5.04e23 FLOPs gives N = 280B, D = 300B
    const kaplanRefC = 5.04e23;
    const N_kaplan = 280e9 * Math.pow(C / kaplanRefC, 0.73);
    const D_kaplan = 300e9 * Math.pow(C / kaplanRefC, 0.27);

    // 2. Chinchilla Allocation
    // Calibrated so that C = 5.88e23 FLOPs gives N = 70B, D = 1400B
    const chinchillaRefC = 5.88e23;
    const N_chinchilla = 70e9 * Math.sqrt(C / chinchillaRefC);
    const D_chinchilla = 1400e9 * Math.sqrt(C / chinchillaRefC);

    // 3. Amortized Inference Allocation
    // Solves the resource allocation shifting under inference cost.
    // Total lifecycle budget C_total = C_train + C_infer.
    // We hold Training Compute fixed at C = 6ND.
    // We find N that minimizes total loss including inference burden.
    // Fixed point solver: N_new = N_chinchilla * (1 + Q / 3D)^(-0.28)
    let N_amort = N_chinchilla;
    let D_amort = D_chinchilla;
    if (Q_tokens > 0) {
      let low_N = 1e6;
      let high_N = C / 6;
      for (let iter = 0; iter < 40; iter++) {
        N_amort = (low_N + high_N) / 2;
        D_amort = C / (6 * N_amort);
        let lhs = 138.176 * Math.pow(N_amort, -0.34);
        let rhs = 114.996 * Math.pow(D_amort, -0.28) * (1 + Q_tokens / (3 * D_amort));
        if (lhs > rhs) {
          low_N = N_amort;
        } else {
          high_N = N_amort;
        }
      }
    }

    // Formatting helper
    function formatParams(num) {
      if (num >= 1e12) return (num / 1e12).toFixed(2) + ' T';
      if (num >= 1e9) return (num / 1e9).toFixed(1) + ' B';
      return (num / 1e6).toFixed(1) + ' M';
    }

    function formatTokens(num) {
      if (num >= 1e12) return (num / 1e12).toFixed(2) + ' T';
      if (num >= 1e9) return (num / 1e9).toFixed(1) + ' B';
      return (num / 1e6).toFixed(1) + ' M';
    }

    k_capN.innerText = formatParams(N_kaplan);
    k_capD.innerText = formatTokens(D_kaplan);
    k_capR.innerText = (D_kaplan / N_kaplan).toFixed(1) + ' : 1';

    c_chinN.innerText = formatParams(N_chinchilla);
    c_chinD.innerText = formatTokens(D_chinchilla);
    c_chinR.innerText = (D_chinchilla / N_chinchilla).toFixed(1) + ' : 1';

    a_amortN.innerText = formatParams(N_amort);
    a_amortD.innerText = formatTokens(D_amort);
    a_amortR.innerText = (D_amort / N_amort).toFixed(1) + ' : 1';
  }

  computeSlider.addEventListener('input', update);
  querySlider.addEventListener('input', update);
  update();
})();
</script>

---

## The Amortized Inference Shift

Yet, if you look at the open-weights landscape today, almost nobody obeys the Chinchilla-optimal 20:1 ratio. 

*   **Meta's Llama 3 8B** was trained on over 15 trillion tokens—a ratio of 1,875 tokens per parameter.
*   **Alibaba's Qwen 2.5 7B** saw 18 trillion tokens—a ratio of over 2,570 tokens per parameter.
*   **DeepSeek V3** pretrained on 14.8 trillion tokens, representing roughly 400 tokens per active parameter.

This deliberate \"overtraining\" does not contradict Chinchilla. Rather, it optimizes for a different objective function. Hoffmann’s equations minimized the compute required to *train* a model. They ignored the cost of running that model in production after training ends. 

Once a model is deployed to millions of users, the lifetime cost of serving inference dwarfs the upfront cost of training. A smaller, overtrained model requires fewer GPUs to run, saving millions in serving infrastructure (which is why our own supply chain algorithms are constantly being pruned for execution speed). Overtraining is training-compute suboptimal, but it is highly compute-rational over the model’s operational lifespan.

A recent Wisconsin–Stanford paper, *Test-Time Scaling Makes Overtraining Compute-Optimal*, has formalized this by adding a third axis—inference-time samples—and finds that when reasoning models like o1 or DeepSeek-R1 will be sampled hundreds of times per query, the optimum shifts radically into the overtrained regime, beyond the range most pretraining studies even measure. In our [analysis of recursive AutoResearch loops](file:///c:/Users/natur/Downloads/projects/victorangeloblancada.github.io-jekyll/_posts/2026-07-23-the-recursion-turns-on-itself-autoresearch.md), we saw how stacking reasoning loops at inference time routes around model constraints, reinforcing the value of highly optimized base models.

---

## The Densing Law and Capability Density

This structural efficiency is validated by what researchers call **capability density**—the ratio of the \"effective parameter size\" (how large an older model would need to be to match a modern model's benchmarks) to the actual parameter size. 

In late 2024, a team from Tsinghua and OpenBMB introduced the **Densing Law**, documenting that the capability density of open-weights models has doubled roughly every 3.5 months. 

| Model | Release Date | Parameter Count | MMLU Score | Relative Capability Density |
| :---: | :---: | :---: | :---: | :---: |
| **LLaMA 1** | Feb 2023 | 65B | 68.9% | 1.0x (Baseline) |
| **Qwen 2.5** | Sep 2024 | 72B | 85.3% | 4.8x |
| **Llama 3.1** | Jul 2024 | 70B | 86.0% | 5.1x |

This exponential increase explains why a modern 72B model can match or exceed a 405B model trained just a year prior. It is not luck; it is the compounding impact of superior data curation, better tokenizers, and structural architectural refinements like Grouped-Query Attention (GQA) and SwiGLU activations.

---

## The Shrinking Fine-Tuning Headroom

This density shift has practical implications for enterprise adaptation. Base models today arrive already saturated with post-training. Qwen 2.5 underwent supervised fine-tuning on over a million instruction samples, followed by multi-stage reinforcement learning with both offline DPO and online GRPO.

Because the base model has already had its low-hanging fruit harvested, generic instruction fine-tuning now yields diminishing marginal returns. Downstream teams should focus their efforts away from general fluency and toward domain-specific adaptation (e.g., specialized legal reasoning, medical coding, or unique brand voices) where the general-purpose pretraining distribution remains sparse. Fortunately, parameter-efficient fine-tuning (PEFT) methods like LoRA have reduced these costs to the point where the business question is no longer whether to fine-tune, but what domain data to prioritize.

In our [upcoming analysis of Lean Six Sigma in AI](file:///c:/Users/natur/Downloads/projects/victorangeloblancada.github.io-jekyll/_posts/2026-07-31-lean-six-sigma-ai.md), we will explore how these overtrained models redefine the cost of quality in the corporate value stream.

Ultimately, scaling laws are not immutable laws of physics. They are contingent, empirical, and sensitive to what we count, how we measure it, and how we plan to deploy the system. The labs winning the market today are not those with the largest compute clusters, but those who read the trajectory of these trade-offs the fastest.

*Victor Blancada is a data scientist focused on deriving actionable insights for clients. Visit his LinkedIn page [here](https://www.linkedin.com/in/geloblancada/).*
