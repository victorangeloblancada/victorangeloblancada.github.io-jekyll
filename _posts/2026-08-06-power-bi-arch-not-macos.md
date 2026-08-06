---
layout: post
title: "The Seams Are the Strategy"
category: blog
tags: 
- data science
- power bi
- software development
date: 2026-08-06
image: /assets/images/pbi-window.jpg
description: What Power BI's weirdest bugs reveal about how Microsoft actually builds things — and why the fix isn't a better product, it's a better posture.
dropcap: True
draft: false
---

<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML">
</script>

There is a small, stupid, perfect bug in Power BI Desktop that explains almost everything about Microsoft.

Put two fingers on a trackpad and pinch. The interface obligingly zooms — not the report canvas, which would be sensible, but the *chrome*: the ribbon, the panes, the furniture of the application itself. Keep going and the window's own close button drifts serenely past the edge of the window and vanishes. You have zoomed the application out of its own frame. The escape hatch has escaped.

This is not a defect in the ordinary sense. Nobody specified it. Nobody chose it. It is an *emergent property* — the observable consequence of two layout systems occupying one window with no treaty governing which of them is in charge. The native Windows shell measures in device-independent units and negotiates DPI with the operating system. The embedded Chromium runtime measures in CSS pixels and regards a pinch gesture as a page zoom it is fully entitled to apply. When you pinch, Chromium scales its content, the host window does not resize, and the surplus is simply clipped at a boundary neither party knew was contested.

Microsoft did not build a seamless application with an unfortunate crack in it. Microsoft built a federation and shipped the treaty negotiations to production.

Once you see this, you cannot unsee it, and the entire product reorganizes itself in your mind. Every idiosyncrasy that felt like neglect turns out to be a load-bearing wall.

---

## I. An archaeology of the .exe

Power BI Desktop is commonly described as an application. It is more accurate to describe it as a *building* — one erected over fifteen years by four contractors who never met, on foundations poured for an entirely different structure.

The oldest stratum is the engine. Around 2006, a project codenamed **Gemini** under Amir Netz set out to take SQL Server Analysis Services and make it run in memory. It surfaced publicly in 2010 as Power Pivot, a free Excel add-in, and it brought two things with it that remain the load-bearing pillars of the entire Microsoft analytics business: **VertiPaq**, a columnar compression engine of genuinely remarkable efficiency, and **DAX**, a formula language that resembles Excel's the way a submarine resembles a bathtub.

The second stratum is the canvas. **Project Crescent**, previewed at PASS Summit in 2010 and shipped as Power View inside SQL Server 2012, was Microsoft's answer to Tableau: interactive filtering, cross-highlighting, animated scatter plots. Its DNA is still visible every time a visual cross-filters its neighbours.

The third is the plumbing. **Data Explorer**, another Excel add-in, arrived in 2013 and was renamed Power Query. It brought M, a functional language for data preparation, and the Mashup engine that executes it.

Three separate add-ins, three separate teams, three separate release cadences. In 2014 Microsoft put them in a single window, called it Power BI Designer Preview, renamed it Power BI Desktop, and shipped GA on 24 July 2015.

Here is the crucial detail, and it is the one that explains the next decade: **they were never merged. They were co-located.** Power BI Desktop is a shared window with a shared ribbon over three engines that remain, to this day, architecturally distinct processes and codebases with distinct protocols. Launch Desktop and it silently spins up a local instance of `msmdsrv.exe` — an actual Analysis Services server, listening on a random port, hosting your model under a random GUID. Every visual you render fires a DAX query at it. Your laptop is running a database server and neither of you talks about it.

The report canvas, meanwhile, is Chromium. Microsoft migrated it from CefSharp to WebView2 across 2021–22, for reasons that were entirely defensible: inherit the Edge team's security patches automatically, stop hand-carrying browser updates, redirect the saved engineering hours into features.

The bill for that decision came due in January 2026, when an external WebView2 update — shipped by a different team, on a different schedule, to machines that had not updated Power BI at all — rendered a swathe of Desktop's icons as solid black blobs. Marco Russo's published workaround was to pin an older WebView2 build via an environment variable, with a note reminding readers to check weekly whether they could stop. Part of your business intelligence tool is versioned by the browser team, and you find out on a Tuesday.

---

## II. The map menu is an org chart

Conway's Law — organizations ship their communication structure — is usually invoked as gentle sociological color. In Power BI it is closer to a forensic tool. You can read the org chart directly off the visualization pane.

Open the map options and count. There is **Map** and **Filled Map**, descendants of Power View, geocoded by Bing. There is **Azure Maps**, built by the Azure Maps team, which requires a tenant administrator to enable it under Integration settings, because of course it does. There is **ArcGIS for Power BI**, built by Esri, governed by Esri's terms and privacy policy, with its own consent dialog and its own release changelog on Esri's community forum. And there is **Shape Map**, which renders TopoJSON without touching a service at all and which reached general availability in June 2026, roughly a decade after it entered preview.

Four ways to put a dot on a map. They differ almost entirely in *who wrote them*.

The obvious question is why not simply consolidate? The answer is instructive, and it is not laziness. Bing Maps is officially scheduled for deprecation — with, in Microsoft's own careful phrasing, a timeline that has not yet been determined. It cannot be switched off, because Azure Maps does not yet serve China, Korea, or government clouds, and Microsoft's documentation explicitly instructs users in those regions to *stay on the deprecated visual*. A visual can be simultaneously dead and mandatory. It can be sunset and load-bearing.

So the four maps persist, and Microsoft does what a large organization with a backward-compatibility covenant does instead of deleting things: it ships a migration dialog. Open a report with legacy maps and Desktop offers to upgrade them all at once, carrying settings across, with a gentle note that some circles may come out smaller because Azure Maps caps marker size lower than Bing capped bubble size. This is the physical sensation of technical debt being serviced rather than repaid.

---

## III. Redundancy that isn't

The complaint that Power BI offers too many ways to do the same thing is nearly universal and almost entirely wrong. It is a category error, and the category is *time*.

You can build a table in Power Query, or you can build one in DAX. These look interchangeable and are not, because they execute at different moments in a pipeline and therefore see different worlds. Power Query runs at refresh, before the data lands, speaking to the source — which means it can push work back into your SQL server, and which means it cannot see a relationship that does not exist yet. DAX runs at query time, inside the model, with full visibility of relationships and filter context — which means it can do time intelligence and context transition, and which means it cannot fold a predicate into your source.

The rule that falls out of this is elegant, and SQLBI has been repeating it for years: use a DAX calculated column only when the answer depends on *other rows or other tables*; otherwise use Power Query and pay the cost once. Everything else — dataflows, lakehouse SQL, visual calculations, and the DAX user-defined functions that reached GA in June 2026 — is the same principle at additional altitudes.

The redundancy is not in the engine. It is in the *pedagogy*. Microsoft has never told anyone this clearly, because telling people clearly would require admitting that the seamless application is actually a pipeline with stages, and the stages have rules, and knowing the rules is now your job.

---

## IV. The annexed province

Paginated reports feel bolted on because they are, in the most literal available sense, a different product wearing the same lanyard.

RDL — Report Definition Language — has been part of the Microsoft stack since SQL Server 2000 Reporting Services. When Microsoft says "paginated reports in Power BI," it means .rdl files executing inside a cloud workspace instead of an on-premises SSRS server. **The infrastructure changed. The rendering engine did not.** Different file format, different authoring tool, different expression language, different data model, different licensing gate.

And it exists for an entirely respectable reason. The interactive canvas is a fixed-size, screen-first surface that fundamentally cannot paginate, and some reporting genuinely is not a dashboard: the forty-page invoice, the financial statement where every decimal lands in a fixed column, the regulatory filing where the auditor needs identical pagination across quarters. Microsoft needed that capability, already owned a mature engine for it, and had decided that SQL Server 2022 would be SSRS's last release. Annexation was the rational move.

But annexation leaves borders, and the borders are where migration teams bleed. Document Map does not render in the service. SSRS subscriptions do not transfer and must be rebuilt. Linked reports must live in the same workspace. Convergence is real but incremental — Power Query Online reached GA in Report Builder in 2024, browser-based paginated authoring has landed, a Power Query discovery UI arrived in June 2026, CRUD REST APIs in July. This is not neglect. It is a border being slowly dissolved by a team that must not break a single one of the ten thousand invoices already running across it.

---

## V. I use ~~Arch~~ Power BI, BTW

Here is where the story turns, because the obvious prescription — *Microsoft should expose the modularity instead of pretending it's one seamless app* — turns out to have already happened. Almost nobody noticed.

The model layer is not merely open; it has been open for a quarter century. Semantic models speak **XMLA**, a specification Microsoft published jointly with Hyperion in 2001. That is why a third-party ecosystem worked on day one without anyone's permission. The External Tools ribbon exists for the sole purpose of handing a registered tool the port number and model name of that local Analysis Services instance — registration being a JSON file dropped in a folder. In the cloud, the XMLA endpoint does the same for published models, and since 9 June 2025 all Fabric capacities default to read/write.

Tabular Editor, connected through this door, can configure object-level security, calculation groups, and partition strategies that **Power BI Desktop's own interface cannot**. The community tool is more capable than the first-party one, at the layer where capability matters most.

The report layer got the same treatment, belatedly and deliberately: TMDL for the model as plain text, PBIR storing every visual and page and bookmark as an individually schema'd JSON file — *publicly documented, explicitly designed to be modified by non-Power BI applications* — and PBIP as the project container. The Fabric CLI was open-sourced under MIT in October 2025 with a filesystem metaphor. `semantic-link-labs` lives under the `microsoft/` GitHub organization. In June 2026 Microsoft shipped a **Desktop Bridge**: a JSON-RPC server running inside the Desktop process, over a named pipe, so agents can read report state, reload from disk, and screenshot themselves for verification.

So the modularity is real, documented, and in several places open source. Which raises the actual question: why does nobody know?

Consider a scene reported by a consultant in Australia: a senior analyst at a bank, hand-authoring eighty measures one at a time through the Desktop properties pane — roughly an hour's work in Tabular Editor's scripting console — because she had never heard of Tabular Editor. Neither had anyone on her team. They had all completed a five-day official Power BI course in which external tools were not mentioned.

That is not an accident of curriculum. It is the strategy, expressed as an omission.

Microsoft's own documentation states plainly that it does not provide support or documentation for external tools except where an issue reproduces in Microsoft's own. The ecosystem is *permitted*, not *warranted*. And the sharpest tell of all: a model modified through the XMLA endpoint **can no longer be downloaded to Power BI Desktop**. Walk through the open door and it locks behind you. There is no clearer statement of institutional ambivalence than an interface you are welcome to use exactly once.

The pattern, once stated, is almost embarrassingly legible. **Microsoft opens what drives consumption and closes what drives acquisition.** The model engine, the CLIs, the REST APIs — all of these increase capacity utilization, which is metered, which is revenue. The Windows-only Desktop, the visual gallery, the drag-and-drop onboarding — these are the funnel, and funnels are not for opening.

It is not that Power BI is a monolith masquerading as modular. It is closer to a Linux distribution that ships a locked-down desktop environment while the package manager sits fully functional, fully documented, and entirely unmentioned in the getting-started guide. The remedy was never re-architecture. It was a sentence in the docs.

---

## VI. We have Power BI at home

Which invites the natural experiment: if the components are separable, can you separate them entirely? Assemble a stack from open-source parts and see how much of Power BI reappears?

The answer is roughly eighty-five to ninety percent, and the shape of the residual is the interesting part.

Ingestion falls immediately — dlt, Meltano, Airbyte, hundreds of connectors. Transformation doesn't just fall, it *improves*: dbt and SQLMesh give you tested, version-controlled, lineage-aware logic, which is more than M has ever offered. Compute is DuckDB, MIT-licensed, columnar-vectorized, embedded, no server, reads Parquet directly, and — the detail that quietly matters most — compiles to WebAssembly and runs in a browser tab. Orchestration is Dagster, which makes Power BI's refresh scheduler look like a kitchen timer. Paginated output is WeasyPrint or Typst driving CSS Paged Media, a layout system both better documented and more expressive than RDL. Interactive reporting is Superset or Metabase or Lightdash; narrative reporting is Evidence.dev, which is frankly what Power BI should have shipped for anything requiring a paragraph.

The semantic layer is Cube, and Cube is the load-bearing choice, because it is the only open-source option that both *defines and serves* metrics: standalone server, its own pre-aggregation store, native row-level security and multi-tenancy, and endpoints for REST, GraphQL, SQL, MDX — and DAX.

Hold that last one. It matters in a moment.

Because there is exactly one thing in this stack that cannot be reconstructed, and it is not the file format. Reverse engineering has, remarkably, gotten *inside* VertiPaq: `pbixray` decodes the full chain — XPRESS9 into an Analysis Services backup file, then Huffman dictionaries, then run-length encoding, then bit-packing — and reads .pbix, PowerPivot .xlsx, and .abf files under an MIT license with no Microsoft software installed. The vault is open.

What nobody has built is an engine that *evaluates DAX*. The best available parser announces in its own documentation that it is designed for introspection and analysis, **not execution**. A DAX-to-SQL translator handles `FILTER` and `SUMMARIZE` and `CALCULATETABLE` and then stops, because the thing it would need to cross is not a function.

`CALCULATE` is not a function. It is a context-manipulation primitive, and filter context, row context, and context transition have no SQL analogue. Twenty years of Microsoft's compounding investment sits in that one keyword, and it is the reason a company can open its file format, its wire protocol, its CLI, its report schema, and its process boundary without losing anything that matters.

**The moat was never the software. It was the semantics.**

The other irreducible gap is less technical and more humbling: self-service authoring. Power BI's genuine achievement — the one no FOSS stack replicates — is that a supply chain planner with no engineering background can build a working report between lunch and the four o'clock. Metabase's question builder is the closest analogue and it is not as good. Power BI's real product is not capability. It is *accessibility*, and accessibility is extraordinarily expensive to manufacture.

---

## VII. Portability is not a separate project

Ask whether Power BI can be ported to Linux or macOS and you receive an unusually unambiguous no. Desktop is WPF plus WebView2 plus a local Analysis Services instance, and Analysis Services has never shipped for Linux at all. Wine and CrossOver do not carry it. A Mac feature request accumulated something on the order of four thousand votes and was formally declined. Parallels, VMware, or a cloud Windows desktop are the entire menu. The mobile apps are consumption-only. The Windows UWP app was retired at the end of 2023, which means the most Microsoft-native client of all is the one that died first.

Now note what happened to that question when the stack was decomposed. DuckDB, dbt, dlt, Cube, Superset, Metabase, Evidence, WeasyPrint, Dagster — every one of them runs natively on Linux, macOS, and Windows. Most are containerized. Several run in a browser.

The portability problem and the emulation problem are not two problems. **They are one problem, and it is solved by the same act.** Nobody needs to port Power BI. They need to replace the single layer that refuses to be portable, and that layer is the Windows shell — which is to say, the funnel.

---

## VIII.

Everything above converges on a single strategic observation, and it inverts the usual framing.

The instinctive response to a platform whose seams show is to demand that the vendor fix the seams. That demand will not be met, and it should not be. Microsoft's incentives are legible and stable: open what is metered, close what acquires, freeze what is published, and never, under any circumstance, break the invoice that has been running since 2016. A firm optimizing for those constraints produces exactly the artifact we have — a federation with excellent bones, honest protocols, and no narrative.

The better response is to stop treating Power BI as a platform and start treating it as **a client**.

This is what the Cube DAX endpoint is quietly for. Stand up a semantic layer you control, define your metrics there in text under version control, and then point Power BI *at it*. Your analysts keep the authoring experience that took them four years to learn. Your metric definitions leave the binary and enter Git, where they can be reviewed, tested, diffed, and argued about in a pull request like every other consequential piece of business logic. And the front end becomes what it should always have been: a rendering choice, revisable next quarter, rather than an architecture decision you made in 2017 and have been living inside ever since.

Notice what this does to the DAX moat. You cannot cross it — nobody can — but you can *decline to build your city on the far bank*. The irreplaceable thing about DAX is its evaluation semantics, not the business logic those semantics happen to encode. Move the logic; leave the language.

The five idiosyncrasies we started with are therefore not a list of defects. They are a map of where a very large organization has drawn its boundaries, and boundaries drawn by someone else's incentives are precisely the boundaries you should not organize your own work around. The pinch-to-zoom bug is not a metaphor for anything. It is simply what happens when two systems share a window and neither one owns the frame.

---

It remains the case that the close button is still, technically, out there somewhere. Alt+F4 works. It always has. That is arguably the most Microsoft sentence in this entire piece: the escape hatch exists, it is fully documented, it has worked identically since 1985, and nobody thought to mention it.

*Victor Blancada is a data scientist focused on deriving actionable insights for clients. Visit his LinkedIn page [here](https://www.linkedin.com/in/geloblancada/).*
