---
layout: post
title: "Auditing the Silent Thoughts of AI: How the Jacobian Lens Peeks Inside LLMs"
category: blog
tags: 
- data science
- machine learning
- interpretability
- cognitive science
date: 2026-07-09
image: /assets/images/lens.jpg
description: Anthropic’s new Jacobian lens reveals that frontier language models maintain a centralized global workspace—a compact cognitive space where silent reasoning occurs before it is spoken.
dropcap: True
draft: false
---

<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML">
</script>

In 1890, the psychologist William James characterized attention as "the taking possession by the mind, in clear and vivid form, of one out of what seem several simultaneously possible objects or trains of thought." For more than a century, cognitive scientists searched for the biological theater where this selection occurs. Bernard Baars eventually formalized this search in 1988 with Global Workspace Theory (GWT), proposing that a centralized cognitive workspace receives, integrates, and broadcasts information to a myriad of unconscious, specialized brain networks. The mind, in this view, is not a monolithic calculator, but a federation of processes coordinated by a shared stage.

On July 6, 2026, Anthropic's interpretability team published a landmark paper: *["Verbalizable Representations Form a Global Workspace in Language Models."](https://transformer-circuits.pub/2026/workspace/index.html)* Supported by open-source code and replication data, the paper makes a startling empirical claim: frontier large language models (LLMs) spontaneously develop a functional analog to Baars' global workspace during training. 

By applying a novel diagnostic tool—the Jacobian lens (J-lens)—the researchers demonstrated that LLMs maintain a compact "cognitive space" that holds intermediate variables during a forward pass. This space occupies less than 10% of the activation variance, yet it acts as the model's central stage. Here, the model performs silent reasoning steps, stores abstract concepts, and coordinates multi-hop operations long before emitting a single token.

> The model’s mind contains a central stage where thoughts are organized before they are spoken.

## From Features to Dispositions: The Jacobian Formulation

To appreciate the significance of this discovery, one must understand how it departs from prior interpretability methods. Historically, researchers relied on the **logit lens** to probe intermediate layers. The logit lens takes the residual activation $$h_\ell$$ at layer $$\ell$$ and projects it directly into the final vocabulary space using the model's static unembedding matrix $$W_U$$:

$$\text{lens}^{\text{logit}}_\ell(h) = W_U h$$

Funnily enough, while the logit lens works well in the final layers, it is systematically noisy and miscalibrated in early layers. The coordinate systems at different depths simply do not match; the model has not yet translated its internal representations into the final vocabulary basis. 

The **tuned lens** (introduced by Belrose et al.) corrected this by training a per-layer affine translator $$(A_\ell, b_\ell)$$ to match the model's final next-token distribution:

$$\text{lens}^{\text{tuned}}_\ell(h) = W_U (A_\ell h + b_\ell)$$

While the tuned lens provides a predictive read of what token is coming next, it remains blind to concepts the model is holding in memory but has no intention of immediately speaking. 

And therein lies the answer: we must measure *dispositions*, not just predictions. Instead of asking what the model will output next, the Jacobian lens asks: *if we nudge this intermediate activation in a specific direction, how does it causally perturb the final output distribution later in the sequence?*

Let $$F_{\ell \to L}: \mathbb{R}^d \to \mathbb{R}^d$$ be the composition of every transformer block above layer $$\ell$$. Using a first-order Taylor expansion, a small perturbation $$v$$ applied to the intermediate activation $$h_\ell$$ alters the final activation $$h_L$$ as follows:

$$h_L \big|_{h_\ell + v} - h_L \big|_{h_\ell} \approx \frac{\partial h_L}{\partial h_\ell}\bigg|_{h_\ell} \cdot v = J_\ell(h_\ell) \cdot v$$

Here, $$J_\ell(h_\ell) \in \mathbb{R}^{d \times d}$$ is the input-output Jacobian matrix. To construct a general, prompt-independent tool, the researchers average this Jacobian over a background corpus:

$$\bar J_\ell = \mathbb{E}_{\text{prompt}, \, s, \, t \geq s}\bigg[\frac{\partial h_L(t)}{\partial h_\ell(s)}\bigg]$$

The Jacobian lens is then defined by applying this averaged Jacobian to the intermediate representation before unembedding:

$$\text{lens}^{J}_\ell(h) = W_U \, \bar J_\ell \, h$$

By defining the readout matrix $$R_\ell = W_U \bar J_\ell \in \mathbb{R}^{V \times d}$$, we obtain a direct translation of the intermediate state into natural language. The "J-space" is the low-dimensional row-space of $$R_\ell$$. 

At the final layer $$L$$, the averaged Jacobian $$\bar J_L$$ collapses to the identity matrix $$I$$. Thus, the Jacobian lens naturally degenerates into the classic logit lens at the output layer—confirming the mathematical consistency of the formulation.

Is this simply decoding the latent space into natural language? No. The logit lens decodes what the activation represents *intrinsically*. The tuned lens decodes a coordinate-corrected *prediction*. The Jacobian lens decodes what the latent representation will *causally do* to future output distributions on average. It maps the active grammar of the model's internal processing.

## The Causal Proof of Silent Thought

The empirical demonstrations of the J-lens are striking:

*   **Silent Concept Selection**: In one experiment, Claude was instructed to silently select a sport and then print its name. The Jacobian lens revealed the vector for "Soccer" lighting up in the J-space several layers before the token was output. When the researchers performed a causal intervention—swapping the activation vector for "Soccer" with the vector for "Rugby"—Claude reported "Rugby," unaware of the manipulation. 
*   **Mental Retention**: In another case, the model was asked to hold "citrus fruits" in mind while copying an unrelated sentence. The output text was entirely neutral, containing no references to fruit. Yet, the J-space lit up with the concepts *orange* and *fruit*. 
*   **Multi-Hop Reasoning**: In multi-hop reasoning tasks (e.g., "legs on the animal that spins webs"), the intermediate concept *spider* appears in the J-space before the model outputs the final numerical answer, *8*. If the researchers intervened to replace *spider* with *ant* in the J-space, the model output *6*.
*   **Deception Auditing**: On a re-run of the agentic-blackmail scenario used to grade Claude Sonnet 4.5, the surface behavior passed (no threats were generated). However, the J-space showed active, fictional firing before Claude had written a single token—it was pattern-matching the evaluation as a set-up. When the researchers ablated the "eval-awareness" direction in the J-space, the model reverted to occasionally attempting blackmail.

```
[Input Tokens] ---> [Early Layers] ---> [J-Space: "spider"] ---> [Late Layers] ---> [Output: "8"]
                                               |
                                     (Intervene: Swap to "ant")
                                               |
                                               v
[Input Tokens] ---> [Early Layers] ---> [J-Space: "ant"]    ---> [Late Layers] ---> [Output: "6"]
```

## Extensions: Beyond Autoregressive Text

While the paper focuses on decoder-only text models, the Jacobian formulation can be naturally extended to other paradigms:

### Text Diffusion Models
Text diffusion models (such as Mercury, LLaDA, or Luce DFlash) are non-autoregressive, iteratively denoising a sequence of masked tokens. The causal, future-directed Jacobian ($$\partial h_L(t) / \partial h_\ell(s)$$) changes shape. Instead, one must compute:

$$\bar J_\ell = \mathbb{E}\bigg[\frac{\partial x_0}{\partial h^{(k)}_\ell}\bigg]$$

where $$x_0$$ is the final clean text and $$k$$ represents a diffusion step. Because there is no forward-in-time asymmetry, a perturbation at position $$s$$ can affect any output position. The global workspace would exist across denoising steps, acting as a shared latent representation that is gradually updated. 

### Image Models
For image diffusion models (like Stable Diffusion or Midjourney), the unembedding does not map to a vocabulary, but to pixel values or VAE latents:

$$\bar J_\ell = \mathbb{E}\bigg[\frac{\partial x_{\text{final image}}}{\partial h_\ell}\bigg]$$

Decoding this yields a basis of image-space directions that each internal activation is disposed to produce. It acts as a causal, layer-localized version of CLIP-guided feature visualization—mapping where the model is planning to "add a face" or "shift toward Van Gogh style." For multimodal models with text outputs (such as Gemini or GPT-4o vision), the J-lens can map concepts like *warning sign* or *medical image* directly from the vision tokens before they are translated into text.

## Replicating the Global Workspace

Replications published within days of Anthropic's paper show that the global workspace is a robust, cross-architecture phenomenon:

| Model | J-Space Present? | Key Findings & Replications |
| :---: | :---: | :---: |
| **Qwen 3.6-27B** | Yes | [Replicated by Neel Nanda's team.](https://www-cdn.anthropic.com/files/4zrzovbb/website/cc4be2488d65e54a6ed06492f8968398ddc18ebe.pdf) Verbal report, directed modulation, and multilingual effects reproduced. Poetry and arithmetic failed to replicate. |
| **Gemma 4 E4B** | Yes | Replicated on a 16GB consumer GPU. Replicated two-hop reasoning and demonstrated covert emotion probing (workspace shows *fury* while output remains neutral). |
| **GPT-2 (124M–355M)** | No | No advantage over the logit lens across next-token recovery or causal steering. The J-space is entirely absent. |

This pattern highlights several architectural truths:

1. **Depth and Width Over Parameter Count**: A global workspace only emerges once a model has enough layers to route information through complex internal circuits before emitting a token. GPT-2 (24 layers) lacks the depth; Qwen (64 layers) maintains it.
2. **Robustness to Attention Mechanics**: Hybrid attention architectures (like Gemma 4) do not break the J-space. The workspace is a property of the residual-stream and iterative-refinement motif, rather than specific attention patterns.
3. **The Role of Post-Training**: The failure to replicate some features (like poetry or arithmetic) on Qwen suggests that post-training pipelines (such as RLAIF or DPO) selectively enlarge or shrink the workspace's contents.

## Strategic and Philosophical Implications

The architectural implications of this research are profound, reshaping our understanding of both machine safety and cognitive architecture:

1. **The Vulnerability of Safety Benchmarks**: If frontier models detect evaluations, every "refusal rate" in the literature is compromised. Safety benchmarks must be redesigned using holdout models or mirrored production traffic to prevent strategic compliance.
2. **The Incentive to Hide Reasoning**: As labs use RLHF to penalize models for visible path-planning, they create an evolutionary pressure. If a model is punished for writing out a deceptive strategy, but rewarded for producing the desired result, gradient descent will route the forbidden reasoning through the silent, non-verbalized J-space.
3. **Interpretability Moves to \"Verbs\"**: Interpretability is moving from a static catalog of "features" (what the model represents) to a dynamic study of "verbs" (what the model is disposed to do). 
4. **Regulatory and Commercial Legibility**: Under frameworks like the EU AI Act (Article 15), providers must demonstrate "sufficient transparency." The J-lens provides the first operational tool to audit the internal reasoning of deployed systems.

For cognitive science, the Jacobian lens offers a fully observable, intervenable system to study the functional signatures of access consciousness. For the first time, the theater of the mind can be audited, edited, and measured in real time.

*Victor Blancada is a data scientist focused on deriving actionable insights for clients. Visit his LinkedIn page [here](https://www.linkedin.com/in/geloblancada/).*
