---
description: Match a resume (PDF) against a position description (Markdown) and draft a tailored cover letter.
argument-hint: <resume.pdf> <position-description.md> [output-path.md]
---

# Cover letter

Arguments:
- `$1` — path to the candidate's resume, as a PDF.
- `$2` — path to the position/job description, as a Markdown file.
- `$3` (optional) — where to write the finished letter. Default: `cover-letter.md` next to the position description file.

If `$1` or `$2` is missing, ask for it rather than guessing a path.

## 1. Read both inputs

Read the resume PDF directly (the Read tool handles PDFs natively — extract text, don't try to convert it first). Read the position description Markdown file in full.

## 2. Extract before matching

From the **resume**: candidate name and contact info, work history with concrete achievements (prefer anything quantified), skills/tools, education, anything unusual that's worth foregrounding (a niche domain match, an open-source project, a publication).

From the **position description**: the role title, the company/team name, the must-have requirements vs. nice-to-haves, and the tone of the posting itself (formal corporate, scrappy startup, technical/academic) — the letter should roughly mirror that register, not default to generic corporate phrasing when the posting doesn't sound that way.

## 3. Match honestly

Identify the 3-5 strongest, most specific overlaps between the resume and the posting's requirements — specific enough that they couldn't be copy-pasted into a cover letter for a different job. Prefer one concrete accomplishment tied to a real requirement over a list of adjectives.

Where the resume doesn't cover a stated requirement, don't fabricate experience or silently ignore it if it's a core requirement — either find a genuine transferable angle (from adjacent experience) or leave it out rather than stretch a claim past what the resume supports.

## 4. Draft the letter

- 3-4 paragraphs, roughly 300-400 words total — long enough to be specific, short enough to actually get read.
- Open by naming the role and, if it's discoverable from the posting, the hiring manager or team by name — never "To Whom It May Concern" if a name is available. If no name is available, address the hiring team plainly rather than inventing one.
- No stock opening lines ("I am writing to express my interest in..."). Start with the strongest, most specific point of overlap instead.
- Middle paragraph(s): the 3-5 matches from step 3, woven into prose, not a bullet list.
- Close with genuine interest in the specific team/mission as described in the posting (not generic "great company culture" language) and a plain call to action.
- Sign off with the candidate's name as it appears on the resume.

## 5. Save and report

Write the letter as plain Markdown to `$3` (or the default path from above). Tell the user where it was saved, and flag anything you deliberately left out of the letter because the resume didn't support it — so they can decide whether to address that gap themselves.
