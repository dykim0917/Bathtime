---
name: bathtime-item-note-skills
description: Entry point for Bathtime Item Note skills. Use when the user references the bathtime-item-note-skills folder or asks which Item Note skill to use. Route work to the appropriate dedicated skill: ideator, researcher, seed-builder, web-content-producer, archive-content-implementer, or publishing-pipeline.
metadata:
  short-description: 배스타임 아이템 노트 스킬 묶음 진입점
---

# Bathtime Item Note Skills

This is an index skill for the Bathtime Item Note workflow.

Prefer the dedicated skills:

- `bathtime-item-note-ideator`: define the editorial angle before research.
- `bathtime-item-note-researcher`: research item/category facts and practical friction.
- `bathtime-item-note-seed-builder`: create canonical item seed artifacts.
- `bathtime-item-note-web-content-producer`: create the web content package.
- `bathtime-item-note-archive-content-implementer`: implement `ArchiveContent`, DB artifacts, and preview verification.
- `bathtime-item-note-publishing-pipeline`: run the full flow through private draft apply.

Default to `bathtime-item-note-publishing-pipeline` when the user asks to take an item idea all the way to a private draft preview.

Never publish publicly by default.
