# Ebicos Automater Workbench — Deep Product Design Workflow

## Step 1 — User Intent Analysis
- User in this moment: A train traffic controller under live operational accountability, trying to write, correct, and validate EBICOS automations without losing control of railway safety-critical flow.
- Problem to solve: Convert intent into valid EBICOS automation code quickly, then pressure-test it for syntax, logic, and execution edge cases before operational use.
- Pressure profile:
  - Time pressure: Short windows between operational interventions.
  - Social pressure: Peer/shift handover scrutiny and expectation of technical correctness.
  - Personal pressure: Avoiding mistakes that can cascade into service disruption.
- Failure definition from user perspective:
  - Invalid command/state sequence in automation.
  - Ambiguous behavior under conditional branches.
  - Inability to confidently restart work after interruption.
  - Loss of trust in the tool because output feels generic or invented.

## Step 2 — Emotional Goal Definition
- After 5 seconds: User should feel orientation and control.
- After 30 seconds: User should feel momentum with guarded confidence.
- Emotion that should increase retention: Commanding focus ("I can finish this right now").
- Emotion that should discourage abandonment: Productive tension ("If I skip checks, I am exposed").

## Step 3 — Behavioral Flow Mapping
- Entry point: User opens the page with a concrete automation task (create/edit/debug).
- Primary action: Submit code or intent for EBICOS-grounded generation/review/fix.
- Secondary actions:
  - Switch mode (create/edit/debug).
  - Inject operator notes/context.
  - Run local pre-check before AI call.
  - Copy result.
- Exit paths:
  - Copy finalized automation to OPStation workflow.
  - Export revised version for shift handover.
- Passive path (doing nothing): Existing draft remains visible; no hidden resets.
- Failure path:
  - Local validator flags structural errors.
  - AI response includes "uncertain" markers when manual evidence is weak.
- Return-after-absence (3 days later): Last work state is restored from local persistence with timestamp and mode.

## Step 4 — Risk & Friction Analysis
- Hesitation risk: "Will this hallucinate commands?"
  - Design response: EBICOS manual is loaded as primary context, and output requires evidence-backed reasoning.
- Confusion risk: Create vs edit vs debug intent overlap.
  - Design response: Mode rail with explicit mode labels and mode-specific prompts.
- Overwhelm risk: Long automation code and dense output.
  - Design response: Single-column editing field + sharply segmented result blocks.
- Disengagement risk: Blank-screen feel or toy-like visuals.
  - Design response: Harsh black/white hierarchy, dense rhythm lines, low copy, no decorative filler.

## Step 5 — Conceptual Design (No UI Yet)
- Conceptual layout:
  - Mode control zone.
  - Code/problem input zone.
  - Evidence/output zone.
- Information hierarchy:
  - 1) What mode is active.
  - 2) What text/code is being processed.
  - 3) What is safe to run / what must be fixed.
- Tension points:
  - Validation findings shown before final answer.
  - Missing mandatory structure shown as hard blockers.
- Reward points:
  - "Ready" result section with clean copy target.
  - Saved draft indicator.

## Step 6 — Icon & Visual Concept Design
- `Rift Marker`
  - Meaning: Mode boundary / deliberate choice.
  - Non-mainstream reason: Uses split vertical cuts instead of tab icon metaphors.
  - Non-decorative meaning: Reads as "commit to one branch".
- `Pulse Grid`
  - Meaning: Validation pressure / system check cadence.
  - Non-mainstream reason: Repeated offset line cells, no checkmarks or shields.
  - Non-decorative meaning: Subconsciously suggests repeated verification.
- `Carry Trace`
  - Meaning: Resume-from-last-session continuity.
  - Non-mainstream reason: Broken horizontal track with reconnect notch.
  - Non-decorative meaning: Signals interrupted but recoverable workflow.

## Step 7 — UI & Interaction Design
- UI structure:
  - Fixed top band with product identity and state indicator.
  - Left mode rail (Create, Edit, Debug).
  - Main workspace with three blocks: Input, Operator intent, Output.
- Interactions:
  - Mode switches rewrite placeholder and action verb.
  - `Run` triggers local checks first, then AI call.
  - Output contains strict sections: proposed code, found risks, rationale.
  - `Copy` action for direct handoff.
- Animation:
  - Minimal: 120ms line-sweep on section activation; no playful motion.
- Visible element justification:
  - Every divider line exists to separate operational intent from generated content.
  - White background + black ink maximizes clarity under long use.
  - Monospace + condensed sans pairing supports quick code scanning.

## Step 8 — Self-Critique & De-Generic Pass
- Generic risk found: Conventional pill buttons for mode switching.
  - Redesign: Vertical rail with cut-line indicators and asymmetrical active notch.
- Generic risk found: Typical chat-like transcript output.
  - Redesign: Deterministic output slabs (Code / Risks / Notes) with no bubble metaphors.
- Obvious assumption found: Users always begin from empty editor.
  - Redesign: Draft auto-restore + last-updated stamp prioritized.

## Step 9 — Engineering Plan
- Components:
  - `ModeRail` (mode selection only)
  - `WorkbenchHeader` (title/state only)
  - `InputPanel` (code + intent form only)
  - `ResultPanel` (result rendering + copy only)
  - `StatusStrip` (validation + source status only)
  - `ConceptIcon*` components (custom SVG only)
- Files:
  - `src/screens/AutomationWorkbenchScreen.tsx`
  - `src/components/ModeRail.tsx`
  - `src/components/WorkbenchHeader.tsx`
  - `src/components/InputPanel.tsx`
  - `src/components/ResultPanel.tsx`
  - `src/components/StatusStrip.tsx`
  - `src/components/icons/*.tsx`
  - `src/services/ebicosKnowledge.ts`
  - `src/services/automationValidator.ts`
  - `src/services/openaiClient.ts`
  - `src/services/draftStore.ts`
  - `src/flows/useAutomationWorkbench.ts`
  - `src/theme/tokens.css`
  - `src/styles/*.css`
- Responsibilities:
  - UI components remain stateless where possible.
  - Flow hook owns state transitions and async calls.
  - Services own domain logic, persistence, and API orchestration.
- State ownership:
  - Flow hook owns mode, draft, loading, result, and errors.
- Persistence strategy:
  - Local-first with `localStorage` draft snapshots and timestamps.
  - Network failure does not discard draft.
- Global Rules compliance:
  - Mobile-first layout.
  - No icon libraries.
  - Custom SVG icons with documented concept.
  - No gradients.
  - Structured folders, one responsibility per file.

## Step 10 — Final Validation
- Does this increase retention? Yes, by combining speed with explicit safety checks and draft continuity.
- Does this feel handcrafted? Yes, through asymmetrical rail, custom icon system, and non-template block rhythm.
- Would a serious user trust this? Yes, because EBICOS source grounding and risk-first output are explicit.
- Would this survive long-term use? Yes, due to low visual noise, stable interaction model, and local persistence.
