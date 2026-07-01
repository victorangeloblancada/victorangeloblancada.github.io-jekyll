---
layout: post
title: "What Even is an Agent?"
category: blog
tags: 
- ai
- agent
- agentic ai
- claude
- copilot
date: 2026-06-30
image: /assets/images/robot-piano.webp
description: Everyone talks about AI agents, but very few people mean the same thing when they do.
dropcap: True
draft: false
---

Microsoft Copilot uses the word “agent” to name assistants inside Microsoft 365: Researcher, Word Agent, Excel Agent, PowerPoint Agent, and others. The usage is reasonable. A user deciding how to draft a document, analyze a workbook, build a deck, or produce a research brief needs a clear product label, not an architecture diagram. Microsoft’s term works well at that layer: it tells the user which kind of help to invoke.

Engineers, however, need a stricter definition. In current frontier practice, an agent is not merely a named assistant. An agent is an language model-driven execution loop: a system that can reason about a goal, choose tools, act on an environment, observe the result, update state, and continue until the work is done or stopped. OpenAI’s agent documentation describes agents around models, instructions, tools, guardrails, handoffs, MCP servers, and structured outputs; its broader framing treats agents as applications that plan, call tools, collaborate, and maintain state for multi-step work.

The difference is not a quarrel over words. It changes what engineers can build, evaluate, govern, and trust. A Copilot agent is usually a packaged productivity capability. An agentic workflow is an architecture for delegated work.

## The Original Definition of an Agent was Useful but Incomplete

The original LLM-era definition of an agent was simple: an agent is a language model prompted with a persona that modifies its behavior.

Under that definition, an agent was a model prompted to behave as something: a researcher, analyst, planner, tutor, engineer, or critic. The system prompt gave the model its role, tone, goals, and boundaries. A “data engineering agent” would respond like a data engineer. A “research agent” would reply like a researcher.

In hindsight, that definition was useful but would turn out to be incomplete.

A persona changes the model’s stance. It does not give the system hands. A model with a researcher persona can write in the style of a researcher. 

A true agentic workflow, however, can search, retrieve, compare, cite, draft, revise, call tools, inspect files, execute code, and decide whether another step is needed.

The old definition described behavior at the language layer, but the modern definition describes behavior at the system layer.

## A Modern Agent is a Loop

A more precise working definition for an agent would be:

> An agent is an LLM-centered control system that uses instructions, tools, state, and an execution loop to make progress toward a goal under constraints.

The decisive word here in this definition of an agent is **loop**.

Modern agentic workflows follow the following rhythm:

1. The user supplies a goal
2. The model interprets the goal
3. The system exposes tools and context
4. The model chooses an action
5. The environment feedbacks an observation
6. The model updates its plan
7. The loop continues until the system reaches a stopping condition such as meeting the goal

The illustrious Claude Code is a useful, well-known, concrete example. Anthropic describes Claude Code as an agent that reads a codebase, edits files, and runs commands across a terminal, IDE, desktop app, and browser.  Anthropic also describes it as an agentic coding system that searches codebases, edits across files, executes through the toolchain, runs tests, and handles CI failures.

Claude Code as an example marks a useful boundary: a chatbot can discuss a repository, but an agentic coding system can work inside one.

The model supplies judgment, but the harness supplies agency.

## Microsoft’s Usage is Not Wrong, but it is Product-Oriented

Microsoft’s use of “agent” is best viewed as a product abstraction for marketing purposes.

Researcher in Microsoft 365 Copilot is described as an intelligent assistant for complex, multi-step research that can draw from work content and the web and produce source-cited reports.  Microsoft also describes Word, Excel, and PowerPoint Agents as chat-first co-creators that help create documents, spreadsheets, and presentations inside Microsoft 365 Copilot. 

This naming convention makes sense for non-technical users. Someone choosing between standard Copilot chat and Researcher does not need a lecture on orchestration. The product label instead says, in effect, “Use this assistant for this kind of work.”

A problem, however, appears when engineers carry that product meaning into architecture discussions.

A Copilot agent may potentially contain agentic techniques internally. It may possibly retrieve context, reason over sources, use internal tools, ask clarifying questions, generate artifacts, and operate within Microsoft 365’s security and compliance boundaries. Researcher, for example, is positioned as deeper and more multi-step than standard Copilot chat. 

The user-facing name, however, does not specify the machinery: it does not tell the engineer what tools are exposed, which actions are possible, how state is represented, whether the loop is inspectable, what approvals are enforced, how failures are retried, or whether the workflow can be extended with custom skills, MCP servers, sub-agents, or sandboxes.

Microsoft’s term is useful. It is also not exactly wrong, but it is simply broader and looser than the technical term.

## A Better Metaphor for Agents are Workcells

If a persona is a costume and a Copilot agent is a specialist desk, then an agentic workflow is a workcell.

In lean manufacturing, a workcell has tools, inputs, procedures, safety rules, inspection points, escalation paths, and output criteria. Its behavior comes not from the name on the station but from the system built around it.

The same logic from lean manufacturing also applies to agents. A serious agentic workflow needs:

* a model selected for the task
* instructions that define role, constraints, and output contract
* tools that let the system read, write, compute, search, execute, or delegate
* state that records progress, intermediate artifacts, and prior observations
* permissions that decide what the model may do
* guardrails that block unsafe or low-confidence actions
* checkpoints and rollback for recoverability
* traces and logs for inspection
* evaluations that judge completed work, not fluent prose

OpenAI’s tooling makes these concerns explicit through tools, guardrails, handoffs, sessions, tracing, sandbox agents, and human-in-the-loop mechanisms.  Anthropic’s Claude Code work similarly emphasizes IDE integration, checkpointing, subagents, hooks, and SDK-level customization for more autonomous operation. 

An agent is therefore less like a clever yet isolated employee and more like a governed machine with a model in the control center.

## MCP Makes the Boundary Visible

The Model Context Protocol helps explain why modern agentic systems feel different from application assistants.

Anthropic introduced MCP as an open standard for connecting AI assistants to systems where data lives, including repositories, business tools, and development environments.  The MCP specification describes a standard way for LLM applications to integrate with external data sources and tools, with servers exposing resources, prompts, and tools to clients.

MCP turns an agent from a prompt into a participant in an ecosystem.

Before MCP and MCP-like patterns, each tool connection tended to be bespoke. After MCP, an agentic system can attach to standardized capabilities: repositories, databases, ticketing systems, filesystems, browsers, internal APIs, business tools, etc.

MCP is not the agent, but MCP is its plumbing. The agent is the controller that decides which pipe to use, when to use it, and what to do with the result.

The shift to MCP changes the engineering questions. The interesting questions are no longer limited to what the assistant should say, what tone it should use, or what content it should generate. The more important questions are now:

* What can the system read?
* What can the system change?
* Which tools are available at each step?
* What state persists across steps?
* What actions require approval?
* How are tool calls logged?
* How does the loop recover from error?
* What proves that the task is complete?

Those are questions that define agentic work.

## Why Does This Distinction Even Matter?

Teams that live in enterprise platforms such as Microsoft 365, Teams, SharePoint, Power Platform, Fabric, Azure, Purview, and Graph can easily conclude that they already understand agents because Copilot exposes an Agents menu. That conclusion is partly true but also partly limiting.

Copilot agents are useful for work that naturally ends in a Microsoft 365 artifact: a report, deck, spreadsheet, meeting summary, email, or structured answer. They are purpose-built for the productivity surface.

Agents, in the context of agentic workflows, address a different class of problem: tasks where the system must operate across tools, inspect intermediate results, repair mistakes, and continue. Examples include:

* refactoring a codebase
* migrating a data pipeline
* debugging CI failures
* reconciling semantic model changes
* generating and testing SQL transformations
* validating data quality rules
* repairing orchestration jobs
* creating pull requests
* querying multiple operational systems
* coordinating several specialized workers

A Copilot agent may help with pieces of these tasks, but an actual agentic workflow is designed to own the loop.

For engineers, the risk is not that the terminology is wrong. The risk is category error: agents as a product label and a runtime architecture answer different questions.

The product question is: **Which assistant should the user invoke?**  
The engineering question is: **What system can safely perform this work?**

## A Practical Test

A simple test separates the two meanings:

> If the system mainly gives a named assistant for a bounded user task, “agent” is being used in the product sense.  
> If the system can choose tools, act on an environment, observe results, update state, and iterate toward a goal, “agent” is being used in the technical sense.

This test is mechanical by design: it avoids arguments about branding and focuses on capability.

A model with a persona is not enough, a chat interface is not enough, a menu item called “Agent” is not enough - a truly agentic workflow only exists when the model participates in a governed action loop.

## A Glossary of Cleaner Vocabulary

The precise vocabulary below prevents confusion without forcing anyone to abandon useful product terms.

| Term             | Meaning                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Persona          | The role, tone, and behavioral frame given to a model through instructions.                      |
| Assistant        | A conversational system that helps a user produce an answer or artifact.                         |
| Copilot agent    | A Microsoft-branded, task-oriented Copilot capability inside a product surface.                  |
| Tool             | A callable capability that lets the system read, write, compute, retrieve, execute, or delegate. |
| MCP server       | A standardized provider of context, prompts, or tools to an AI application.                      |
| Harness          | The runtime code that manages tools, state, permissions, retries, approvals, and stopping rules. |
| Sub-agent        | A specialized agent or worker invoked by another agent or orchestrator.                          |
| Agentic workflow | The full loop in which an LLM uses tools and state to act iteratively toward a goal.             |

This glossary keeps both meanings intact.

Copilot agents are agents in the Microsoft product sense. Agents in agentic workflows are agents in the engineering-system sense. The second meaning is the one engineers should use when designing systems.

## Conclusion

The word “agent” began as a light abstraction: a language model with a persona. Enterprise software such as Microsoft then made the word accessible by applying it to named Copilot experiences that help users perform specific kinds of work inside Microsoft 365. That product usage is understandable and often helpful.

The technical frontier has made the word stricter.

A modern agent is not defined by its name, persona, or chat surface. A modern agent is defined by a loop: model, tools, state, action, observation, control, and termination.

Copilot agents package assistance, while agentic workflows execute governed work.

Both these definitions matter and they should not be conflated.

The cleanest formulation today is:

> A persona tells a model how to behave.  
> A Copilot agent tells a user which assistant to use.  
> An agentic workflow gives a model the machinery to act.

This is the bridge between the two worlds of product and engineering.

## Summary Comparison Table

| Dimension                          | Microsoft Copilot “Agent”                                                            | Agentic Workflow                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Primary meaning                    | A named Microsoft 365 Copilot experience for a bounded class of work.                | A system in which a model acts through an iterative loop.                                                                    |
| Best mental model                  | A specialist inside a productivity suite.                                            | A controlled execution loop.                                                                                                 |
| User experience                    | Copilot Chat, Word, Excel, PowerPoint, Researcher, or another Microsoft 365 surface. | Terminal, IDE, sandbox, MCP client, workflow engine, browser, CI system, or custom application.                              |
| Core abstraction                   | Product capability.                                                                  | Runtime architecture.                                                                                                        |
| Tool use                           | Often present but hidden behind the product boundary.                                | Explicit, inspectable, extensible, and governed.                                                                             |
| Autonomy                           | Scoped to the Microsoft 365 task and application model.                              | Scoped by tools, permissions, state, approvals, sandboxing, and stopping rules.                                              |
| Extensibility                      | Mostly through Microsoft-provided surfaces and enterprise integrations.              | Through harnesses, MCP servers, skills, sub-agents, code sandboxes, structured outputs, guardrails, and orchestration logic. |
| Correct technical sense of “agent” | A useful product term, but not the strict engineering definition.                    | The strict engineering definition: an LLM-driven system that can act, observe, and iterate toward a goal.                    |
| Practical test                     | “Which Copilot capability should I use?”                                             | “What loop, tools, state, and controls let the model complete the task?”                                                     |