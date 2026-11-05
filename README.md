# sharlenaluyen.com

Source code for my personal website — [sharlenaluyen.com](https://sharlenaluyen.com/)

## What this site is

The homepage (`index.html`) is written for recruiters and hiring managers first: in a
few seconds they should see who I am (backend & AI engineer), what I've built, where
I've worked, and how to reach me or get my resume. Hobbies, community work and the
playful bits (travel map, trivia, terminal) still live on the page, but below the
professional content.

The other pages are more of a personal brand & experience hub: brand partnerships,
hotel/experience collaborations, media requests and company-specific pitches.

**Tone:** warm, personable and direct. Lead with real work and numbers, not slogans.

## Structure

- `index.html` — the recruiter-facing homepage: hero with resume & contact links,
  selected work, experience, skills & education, then "beyond work" (community,
  photography, travel map, trivia, terminal) and contact. It also loads the Clippy
  widget (`js/clippy-agent.js`).
- `hotel.html` — standalone page for hotel & experience collaboration pitches.
- `destination.html` — standalone page for tour & excursion collaboration pitches. Its
  SunStar Alaska section (`#hotel`) is the same as the case study section on
  `hotel.html`, so keep the two in sync when editing either.
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
