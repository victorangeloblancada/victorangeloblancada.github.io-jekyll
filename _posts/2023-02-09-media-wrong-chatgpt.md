---
layout: post
title: "What The Media Gets Wrong About ChatGPT"
category: blog
tags: 
- nlp
- llm
- openai
- chatgpt
- google
- microsoft
- python
date: 2023-02-09
image: /assets/images/newspaper.jpg
description: OpenAI's ChatGPT is a large language model designed to provide conversational AI services, but it is not yet a replacement for search engines.
dropcap: true
draft: false
---

Like most people, I enjoyed testing OpenAI’s ChatGPT and I was also excited to see what Google’s Bard was capable of. Unlike most people though, I have been following the development of text generation from Markov chains to Andrej Karpathy’s blog post on [The Unreasonable Effectiveness of Recurrent Neural Networks](http://karpathy.github.io/2015/05/21/rnn-effectiveness/). This has allowed me to see past certain misconceptions in the media about both ChatGPT and Bard.

## ChatGPT Is Not a Search Engine Replacement (Yet)

ChatGPT is a large language model (LLM) created by OpenAI to provide conversational AI services. It was specifically developed to push the envelope of what is possible with generative natural language processing (NLP) through methods such as generative pre-trained transformers (GPT) and reinforcement learning with human feedback (RLHF). Its positioning as a demonstration of cutting-edge NLP capabilities is apparent in OpenAI’s decision to restrict the model’s access to the Internet. ChatGPT instead extrapolates from its finite but admitted very large training data which was limited to only 2021; so if you ask it about events in 2023, it simply extrapolates believable responses based on its 2021 data. This is something ChatGPT does incredibly well: when asked about the version of PyTorch (a widely-used machine learning framework), it gives a response that is reasonably (and believably) close.

Therein lies the rub. The reason ChatGPT’s responses read as very believable because it was designed to maximize its chances of passing the Turing test, i.e. roleplay as a believable human, rather than be correct all the time. Users without an understanding of what ChatGPT was designed for and how it was trained have arrived at the incorrect impression that it can serve as a replacement for search engines. ChatGPT was never designed for that use case and it is, at the very least, unfair to its developers to measure its capabilities as a search engine and, at the very worst, irresponsible and dangerous to use its outputs without first doing some fact-checking.

Why then is Microsoft touting ChatGPT-powered capabilities in Bing? The short answer (believable but not 100% accurate) is that search engines represent an established business model where advertisers would happily pay top dollar to improve brands’ positioning on search results. The longer and more accurate answer is that Microsoft is in fact incorporating ChatGPT into most of its products, including Microsoft Word and Microsoft Teams. The media has simply latched onto the story of ChatGPT-powered Bing because:

1. it represents a bold encroachment by Microsoft upon the search engine space which for decades has been Google’s turf; and
2. Bing is a free service unlike licensed software such as Microsoft Office, making it very easy for users to test it.

On a side note, OpenAI is reportedly working on a the next version of its GPT-powered LLM. With Microsoft’s significant investment in the company, it is not unlikely that this new version will be designed specifically for use as part of the Bing search engine.

That said, Google’s release of Bard in reaction to ChatGPT has (perhaps unfairly) been labeled by the press as underwhelming. Any product that is shoehorned into a use case it wasn’t initially designed for (e.g., an LLM being used as a search engine) in reaction to another existing product is unlikely to succeed. The media’s complaints about bard revolve around two main things:

1. Bard allegedly provides false information; and
2. Bard’s user experience is supposedly boring

The counter-argument to the first point is the same one against the use of ChatGPT as a search engine. At best these LLMs need to balance maximizing accuracy and believability and, at worst, may not emphasize accuracy at all. ChatGPT is supposedly version 3.5 of OpenAI’s GPT-powered LLMs (after GPT, GPT-2, and GPT-3) and has been fine-tuned based on years of human feedback. It is understandable that Bard will need time to reach that level of refinement.

As for the second point, user experience is another thing that improves over time as companies get more feedback from users. It can be argued that among the many breakthroughs of ChatGPT was finding a user-friendly interface for testers and eventual users to enjoy using it. Previous versions of OpenAI’s GPT-powered LLMs (several of which I also tested and even deployed on my own machine) were designed to complete user provided prompts instead of replying as a chatbot. By framing the ChatGPT as a chatbot instead of a text-generation model, OpenAI succeeded in finding a user experience that delighted users instead.

------

## P.S.: OpenAI Is Not a “Small Startup”

There have also been numerous stories circulating presenting OpenAI as a tiny startup that beat the behemoth that is Google in some sort of David versus Goliath tale. While this certainly makes a clickbaity (and believable) headline, this isn’t 100% true either.

While OpenAI was originally a non-profit with a small team, it boasts both:

1. financial backing (at various times) from giants such as Microsoft, Amazon Web Services, Peter Thiel, and Elon Musk; and
2. a highly-regarded and well-compensated research team including OpenAI co-founder and former Google machine learning expert Ilya Sutskever.

In an extremely technical field such as machine learning, team size doesn’t affect results as much as individuals’ expertise. It is therefore come as no surprise that the OpenAI team can produce such impressive models despite being depicted by the media as a minnow compared to Google.

