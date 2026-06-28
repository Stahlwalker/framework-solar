# AI-First UI Framework Landscape

Research into who else is building UI frameworks and component systems designed for LLM-generated code. Covers commercial products, open source projects, and academic work from 2024–2026.

---

## The pattern

Every system in this space converges on the same architectural decision:

> Replace free-form LLM output with a typed, validated intermediate format that constrains what the model can produce and what the renderer will accept.

That's the same thesis as Solar. The differences are scope, approach, and how strictly the contract is enforced.

---

## Commercial / open source

### Google A2UI
**Released:** December 2025 | **Status:** Open source, v0.9 by mid-2026

The most complete commercial framework explicitly designed for LLM-generated UI. Represents UI as a flat adjacency list of components using ID references (a declarative data format, not executable code) so LLMs can generate UI incrementally as structured output.

Key mechanic: the client application maintains a catalog of pre-approved UI components, and agents can only request components from that catalog. This prevents arbitrary LLM code execution at the architecture level.

Already adopted by CopilotKit, Flutter GenUI SDK, and AG-UI.

- https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/
- https://github.com/google/A2UI

---

### OpenUI (thesysdev)
**Status:** Active 2026 (open source)

Full-stack generative UI framework built around three machine-readability primitives:

1. A compact streaming-first language ~52% more token-efficient than equivalent JSON
2. Zod schema enforcement on component props at definition time: typed contracts baked into `defineComponent()`
3. Hard restriction of LLM output to a pre-registered component library. The model cannot generate arbitrary UI.

Very close in architecture to Solar. The Zod schema approach is the equivalent of Solar's `props` schema object.

- https://github.com/thesysdev/openui

---

### Storybook MCP Server
**Status:** Active 2026

Takes a different approach: it layers contract enforcement on top of an existing component system rather than baking it into the framework.

Self-healing agentic loop: AI agent generates UI using documented components → writes Storybook stories with interaction tests → runs tests including accessibility checks → fixes issues → re-validates. No human in the loop. Known stability issues with the MCP proxy layer.

- https://storybook.js.org/docs/ai/mcp/overview

---

## Academic work

### SpecifyUI
**Paper:** arXiv:2509.07334, September 2025

Introduces SPEC, a formal intermediate representation encoded as lightweight JSON with parameterized (numerical/enumerated) and semantic (short phrases/tags) fields. LLMs both extract and generate SPEC.

Contract enforcement mechanism: invalid LLM-generated edits trigger an exception-handling loop that returns the error context to the model for correction, capped at 3 retries. Essentially a self-healing contract at generation time.

- https://arxiv.org/abs/2509.07334

---

### GenUI / BISCUIT (Stanford SALT Lab)
**Paper:** arXiv:2508.19227, accepted ACL 2026

Three-stage sequential LLM pipeline:
1. Requirements spec
2. Structured interface representation (directed graphs for interaction flows + finite state machines for component behaviors)
3. Executable HTML/CSS/JS synthesis

**Results:** 84% win rate over conversational Claude 3.7, up to 72% improvement in human preference. Peer-reviewed (ACL 2026 Findings). Strongest empirical evidence that structured intermediate representations outperform free-form LLM generation.

Limitation: restricted to HTML/JS frontends, no backend logic.

- https://arxiv.org/abs/2508.19227

---

### BISCUIT (Apple ML Research)
**Paper:** arXiv:2404.07387, IEEE VL/HCC 2024

Earlier multi-agent pipeline. A UI Planner agent outputs JSON specs before any code is generated, separating intent representation from implementation. One of the first papers to make this separation explicit as an architectural principle.

- https://arxiv.org/abs/2404.07387

---

### Compile-time validation pipeline
**Paper:** arXiv:2604.05150

Mandatory blocking gates for LLM-generated artifacts: Bandit + Semgrep for static security analysis, mypy for type checking, AST parsing. All checks must pass before deployment. Failures trigger regeneration with error context rather than deployment of broken code.

Not a UI framework specifically, but directly relevant to the contract enforcement model.

- https://arxiv.org/abs/2604.05150

---

## Human preference benchmark context

Studies measuring LLM-generated UI quality put current models at ELO ~1736 vs ~1800 for human-designed interfaces, close but not at parity. Structured-representation approaches (GenUI, SpecifyUI) dramatically outperform plain conversational generation on the same tasks.

---

## Where Solar fits

Most of these are either commercial products with broader scope (A2UI, OpenUI) or academic pipelines restricted to specific output formats (GenUI → HTML only). Solar is a clean, from-scratch runtime implementation of the core idea: no dependencies, no build step, no compiler, just the primitives. That makes it a useful base for experimenting with the architecture without the constraints of a production system.

The open questions from the FRAMEWORK.md spec (TypeScript interfaces vs. plain objects, component composition across schema boundaries, a lightweight dev server that surfaces validation errors) are not answered by any of these systems. That's the gap.
