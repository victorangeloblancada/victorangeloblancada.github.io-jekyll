---
layout: post
title: "The Self-Improving Model: Learning at Test Time"
category: blog
tags: 
- data science
- machine learning
- engineering
- artificial intelligence
- ai
- ml
date: 2026-07-21
image: /assets/images/learning.jpg
description: Stakeholders demand models that learn from user interactions. Test-time training offers an elegant theoretical solution, but computational and corporate constraints force us to look elsewhere.
dropcap: True
draft: false
---

<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML">
</script>

The philosopher William James once observed that "habit is the enormous fly-wheel of society, its most precious conservative agent." In computer science, we have historically relied on a similar conservatism: code is compiled, static, and predictable. However, in the era of artificial intelligence, stakeholders have grown tired of static habits. 

Recently, our business leaders came to us with a request: they wanted our customer-facing agents to have the same "self-improving AI" capabilities they had read about in mainstream tech news or experienced in consumer products like ChatGPT's Memories or Gemini's Personal Intelligence. They believed that when these consumer services remember a user preference, the model itself is dynamically training and adapting its neural network in real time. 

To align expectations, our engineering team had to clarify a fundamental distinction. We explained that consumer-facing "memories" are not actual self-improving weight updates, but rather in-context prompts stored in a temporary database. We contrasted this simulated memory with actual continuous learning—what researchers call Test-Time Training (TTT)—where the model's hidden state is transformed into an active, self-improving parameter matrix.

To explain why this distinction matters, let us look at the mathematics behind true TTT.

In a standard sequence model, the hidden state is a static vector. TTT replaces this static vector with an active machine learning model—represented by a parameter matrix $W_t$. As the model processes each token $x_t$ in a sequence, it performs a self-supervised gradient update on this hidden state:

$$W_t = W_{t-1} - \eta \nabla \mathcal{L}(W_{t-1}; x_t)$$

Here, $\mathcal{L}$ represents a self-supervised objective, such as reconstructing the input or predicting the next token, and $\eta$ is the learning rate. Rather than holding a static representation in memory, the model's hidden state trains itself in real time. 

We can simulate this dynamic hidden state update with a simple Python function:

```python
import numpy as np

def test_time_training_step(weights, x_t, learning_rate=0.01):
    """Perform a single self-supervised gradient step at test time.
    weights: Current model weights (the hidden state matrix)
    x_t: Unlabeled test token vector
    """
    # Project the input to generate a reconstruction target
    prediction = np.dot(weights, x_t)
    
    # Calculate reconstruction loss (L2 distance)
    loss = 0.5 * np.sum((prediction - x_t) ** 2)
    
    # Compute the gradient of the loss with respect to the weights
    gradient = np.outer(prediction - x_t, x_t)
    
    # Update the fast weights (dynamic hidden state update)
    new_weights = weights - learning_rate * gradient
    
    return new_weights, loss

# Initialize dummy weights and input
np.random.seed(42)
weights = np.random.randn(8, 8)
input_vector = np.random.randn(8)

# Execute one TTT step
new_weights, loss = test_time_training_step(weights, input_vector)
print(f"Initial loss: {loss:.4f}")
```

All good? The code demonstrates how the model's parameters adapt to the input vector without relying on historical sequence buffers. 

## The Compute and Memory Toll

Funnily enough, while this algorithm is theoretically elegant, implementing it at scale is computationally prohibitive. 

In our [previous analysis on the Roofline Model](roofline-analysis-communication-bottleneck.html), we established that AI performance is constrained by communication (memory bandwidth), not computation:

$$\text{Time} = \max(\text{Compute Time}, \text{Communication Time})$$

During standard inference, a model only needs to read its weights from High Bandwidth Memory (HBM) once to perform a forward pass. However, performing a gradient update at test time requires:
1. A forward pass to generate predictions.
2. A backward pass to compute gradients ($\nabla W_t$), which requires storing activations in RAM and increases the compute cost by roughly $2\times$ FLOPs per token.
3. A write operation to update the weight matrix $W_t$ in memory.

Let us do some back-of-the-envelope math. Consider a moderately sized 70-billion parameter model using 16-bit precision (2 bytes per parameter). Reading and writing the weights at each token step requires:

$$\text{Memory Transfer} = 70 \times 10^9 \text{ params} \times 2 \text{ bytes/param} \times 2 \ (\text{read/write}) = 280\text{ GB per step}$$

If we target a standard generation speed of 20 tokens per second, the hardware must sustain:

$$\text{Required Bandwidth} = 280\text{ GB} \times 20\text{ Hz} = 5.6\text{ TB/s}$$

This bandwidth requirement exceeds the limits of almost all modern accelerators. Implementing TTT at scale would push our systems deep into the memory-bandwidth bottleneck, causing generation speeds to drop to a crawl.

## The Corporate Reality: API Constraints

Architectural minutiae aside, there is a more immediate barrier to implementing TTT in the enterprise: corporate compliance. 

Too often, cybersecurity policies restrict local hosting of large models to prevent intellectual property leaks and infrastructure vulnerability. Our security team mandates the use of managed, third-party APIs (such as OpenAI or Google Gemini). 

Since these APIs are completely black-boxed, we do not have access to the model's weights, gradients, or backward-pass mechanics. The hosted infrastructure does not allow us to call a custom backward gradient step on their weights. Policy prevents us from implementing actual Test-Time Training.

## The Workaround: Dynamic Context & System Prompts

Faced with these technical and corporate limits, how do we deliver the self-improving behavior our stakeholders demand? 

Instead of actual TTT, we must use in-context workarounds. We modify the model's behavior at runtime by programmatically updating system prompts and introducing retrieval-augmented contexts.

When a user corrects a mistake or shares a preference, a local supervisor agent intercepts the input and writes a rule to a vector database. During the next turn, the system retrieves this rule and inserts it into the model's system prompt (e.g., *"System Instruction: The user prefers metric tons over short tons"*). 

To the user, this looks exactly like the "Memories" feature in ChatGPT or Gemini's personal intelligence. However, we must compare the computational costs: the difference is massive.

Consider a Llama-3 70B model with $N=80$ layers, $H_{KV}=8$ key-value heads, and a head dimension of $D=128$. For a context length of $L=2,000$ tokens containing system instructions and user history, the memory footprint of the Key-Value (KV) cache is:

$$\text{KV Cache Size} = 4 \times N \times H_{KV} \times D \times L \text{ bytes}$$

$$\text{KV Cache Size} = 4 \times 80 \times 8 \times 128 \times 2,000 \approx 655\text{ MB}$$

Storing 655 MB of cache in GPU memory is negligible. Attending to this context only requires reading the cache once during generation. The weights of the model remain completely static, meaning we write zero bytes back to HBM.

Contrast this with true TTT. Even if we restrict training to a lightweight parameter adapter (like LoRA with a rank $r=64$ and dimension $d=8,192$), adapting the projection matrices still requires storing activation tensors for every layer during the forward pass to compute gradients:

$$\text{Activation Memory} \approx N \times L \times d \times \text{overhead} \approx 80 \times 2,000 \times 8,192 \times \text{overhead} \approx 13\text{ GB}$$

Writing these weight updates back to memory during the backward pass requires massive memory bandwidth and introduces sequential dependencies that ruin parallelization.

| Metric | Dynamic System Prompts (Fake TTT) | True Test-Time Training (TTT) |
| :---: | :---: | :---: |
| **State Location** | Context Window (KV Cache) | Model Weights ($W_t$) |
| **Parameter Updates** | None (Weights remain static) | Active Gradient Descent ($\nabla W_t$) |
| **Memory Footprint** | ~655 MB (KV Cache) | ~13 GB (Activations + Adapters) |
| **API Compatibility** | Fully Compatible | Incompatible (Requires Weight Access) |
| **Hardware Bottleneck** | Attention Memory Bandwidth | Weight Read/Write Bandwidth |

This workaround is a double-edged sword. While it works within API constraints and is highly efficient in compute, it consumes valuable tokens in the context window. As the conversation grows, the key-value cache balloons, which increases memory latency and brings us right back to the communication bottlenecks of our roofline model.

## Summary

Our stakeholders want self-improving AI, but physics and compliance stand in the way. True Test-Time Training remains too computationally expensive for production workloads, and corporate security policies limit us to closed APIs. 

For now, dynamic system prompts and retrieval-augmented context serve as our best stopgaps. They allow us to simulate runtime adaptation, even if we must pay for it in memory bandwidth and latency.

*Victor Blancada is a data scientist focused on deriving actionable insights for clients. Visit his LinkedIn page [here](https://www.linkedin.com/in/geloblancada/).*
