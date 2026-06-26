# sharlenaluyen.com

Source code for my personal website — [sharlenaluyen.com](https://sharlenaluyen.com/)

## What this site is

A personal brand & experience hub. The goal isn't a resume — it's a place that shows
who I am: a creator, traveler, and storyteller who also happens to build backend
systems for a living. It's the homepage for anything that isn't a 1:1 work inquiry —
brand partnerships, media requests, collaborations, and the general "who is this
person" question.

**Tone:** warm, personable, fun, approachable. Not corporate, not a pitch deck.

**Audience:** general visitors, potential collaborators, brand partners, media.

**Content pillars:**
- Personal brand story & portfolio
- Behind-the-scenes content & lifestyle blog
- Photography, travel, and experiences
- Games / interactive experiences (terminal easter egg, trivia)
- Philanthropy & community work
- Personality-driven projects

**Monetization paths surfaced on the site:** brand partnerships, hotel/experience
collaborations, sponsorships, affiliate links, merchandise.

## Structure

- `index.html` — the main hub: landing, about, brand pillars, philanthropy,
  photography, events, travel, trivia, an interactive terminal, and contact.
- `hotel.html` — standalone page for hotel & experience collaboration pitches.
- `wwe.html` — standalone partnership proposal (e.g. SummerSlam content pitch).
- `1password.html`, `actblue.html`, `eragymnastics.html`, `launchdarkly.html`,
  `posthog.html`, `zapier.html` — standalone pages for specific
  partners/employers/collaborations.
- `dating/index.html` — project in progress, separate from the main hub.
- `css/styles.css`, `js/scripts.js` — shared styling and behavior for `index.html`.
- `assets/` — images, video, and PDFs referenced by the pages above.

## Working on this site

This is a static site with no build step — open any `.html` file directly or serve
the directory locally. Keep new pages warm and personal in tone, consistent with the
brand-hub identity above, and reuse the design language in `css/styles.css` where it
makes sense.
