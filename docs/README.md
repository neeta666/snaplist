# SnapList — Documentation Index

This folder is the home for SnapList's planning and reference documents.
`04`–`06` are exact copies of already-approved, frozen files and govern all
implementation work as-is. `01`–`03` are reconstructions standing in for
frozen originals that have not yet been placed here — see the provenance
column and the "Important" note below before treating them as authoritative.

| Document | Purpose | Provenance |
|---|---|---|
| `01-project-plan.md` | Product goal, target users, core user flow, MVP feature list, what SnapList explicitly is *not* | ⚠️ Reconstructed — see warning banner in the file |
| `02-architecture-review.md` | Pre-implementation architecture and engineering review: risks, patterns, infrastructure choices | ⚠️ Reconstructed — see warning banner in the file |
| `03-technical-design-document.md` | System architecture, module responsibilities, database design, folder structure, development order | ⚠️ Reconstructed — see warning banner in the file |
| `04-api-contract.md` | The authoritative REST API contract (endpoints, request/response shapes, validation rules, status codes) — frontend and backend must both conform to this exactly | ✅ Exact copy of the approved file |
| `05-architecture-decision-records.md` | Compact ADRs recording the *why* behind each major technical decision | ✅ Exact copy of the approved file |
| `06-development-checklist.md` | The vertical-slice implementation plan (Slice 0–10) and the Version 1 release checklist | ✅ Exact copy of the approved file |

**Important — read before treating any document here as authoritative:**
Documents `01`–`03` were reconstructed from conversation history while
populating this folder during Slice 0, and were not diffed against or
re-derived from the original approved files. They are placeholders, not
verified copies, and each carries an explicit warning banner at the top.
**They must be replaced with the exact original approved files** before
being relied on as frozen source-of-truth documents. Documents `04`–`06`
were copied exactly from previously-produced, already-approved files and do
not carry this caveat.

## How to use these documents

- **Before writing any backend code:** check the API Contract (04) for the exact endpoint shape, and the Technical Design Document (03) for which module/layer the code belongs in.
- **Before changing scope:** check the Project Plan (01) for what's explicitly in or out of Version 1.
- **Before questioning "why is it built this way":** check the ADRs (05) first — the reasoning is likely already recorded there.
- **To see what's next:** check the Development Checklist (06) for the current slice's goal, tasks, and acceptance criteria.

## Amendment policy

These documents are frozen for the duration of Version 1 development. If a
genuine change is needed, it should be proposed and approved explicitly
(as happened with the API Contract's revisions) rather than changed silently
alongside unrelated implementation work.
