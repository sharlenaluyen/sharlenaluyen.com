/* ════════════════════════════════════════════════════════════════
   working_script.js
════════════════════════════════════════════════════════════════ */

/* ── Panel layout ───────────────────────────────────────────────
   0-2 : Professional horizontal (pro-zone, 300vh)
   3-5 : Personal vertical       (personal-zone, 300vh)
   6-8 : Playground horizontal   (play-zone, 300vh)
   9   : Contact vertical        (100vh)
   Total: 1000vh, 10 panels
──────────────────────────────────────────────────────────────── */
const PRO_COUNT      = 3;   // Landing, About, Skills
const PERSONAL_COUNT = 3;   // Philanthropy, Photography, Events
const PLAY_COUNT     = 3;   // Travel, Trivia, Terminal
const TOTAL          = PRO_COUNT + PERSONAL_COUNT + PLAY_COUNT + 1; // 10

const VH = () => window.innerHeight;

/* ── Size ───────────────────────────────────────────────────────── */
const scrollWrap = document.getElementById('scroll-wrap');
const proZone    = document.getElementById('pro-zone');
const playZone   = document.getElementById('play-zone');
const proTrack   = document.getElementById('pro-track');
const playTrack  = document.getElementById('play-track');

function setSize() {
  scrollWrap.style.height = (TOTAL * 100) + 'vh';
  proZone.style.height    = (PRO_COUNT      * 100) + 'vh';
  playZone.style.height   = (PLAY_COUNT     * 100) + 'vh';
  proTrack.style.width    = (PRO_COUNT      * 100) + 'vw';
  playTrack.style.width   = (PLAY_COUNT     * 100) + 'vw';
}
setSize();
window.addEventListener('resize', () => { setSize(); doUpdate(); });

/* ── Scroll → horizontal transform ─────────────────────────────── */
const progressEl = document.getElementById('progress');
const counterEl  = document.getElementById('panel-counter');
const chapterEl  = document.getElementById('chapter-label');

let currentIdx = 0;

function doUpdate() {
  const y  = window.scrollY;
  const vh = VH();

  // Progress bar
  const maxScroll = (TOTAL - 1) * vh;
  progressEl.style.width = Math.min((y / maxScroll) * 100, 100) + '%';

  // Active panel index
  const idx = Math.min(Math.round(y / vh), TOTAL - 1);
  counterEl.textContent = String(idx + 1).padStart(2,'0') + ' / ' + String(TOTAL).padStart(2,'0');

  // Chapter label
  if (idx <= 2) {
    chapterEl.textContent = 'Professional';
    chapterEl.style.color = 'rgba(124,130,232,0.58)';
  } else if (idx <= 5) {
    chapterEl.textContent = 'Personal';
    chapterEl.style.color = 'rgba(192,173,245,0.58)';
  } else if (idx <= 8) {
    chapterEl.textContent = 'Playground';
    chapterEl.style.color = 'rgba(240,144,184,0.58)';
  } else {
    chapterEl.textContent = '';
  }

  // Nav dots
  document.querySelectorAll('.nav-dot').forEach((d, i) =>
    d.classList.toggle('active', i === idx));

  // Scale factor: each panel is 100vw wide but each scroll step is 100vh tall.
  // Multiplying by this ratio converts scroll-pixels into translate-pixels.
  const ratio = window.innerWidth / window.innerHeight;

  // Pro track — panels 0-2
  const proScrollMax = (PRO_COUNT - 1) * vh;
  const proScroll    = Math.min(Math.max(y, 0), proScrollMax);
  proTrack.style.transform = `translateX(${-(proScroll * ratio)}px)`;

  // Play track — panels 6-8, starts at scroll position 6*vh
  const playStart     = (PRO_COUNT + PERSONAL_COUNT) * vh;
  const playScrollMax = (PLAY_COUNT - 1) * vh;
  const playScroll    = Math.min(Math.max(y - playStart, 0), playScrollMax);
  playTrack.style.transform = `translateX(${-(playScroll * ratio)}px)`;

  // Trigger reveal on panel enter
  if (idx !== currentIdx) {
    currentIdx = idx;
    triggerReveal(idx);
  }
}

window.addEventListener('scroll', doUpdate, { passive: true });

function scrollToPanel(idx) {
  window.scrollTo({ top: idx * VH(), behavior: 'smooth' });
}

/* ── Nav dots ───────────────────────────────────────────────────── */
const navDotsEl = document.getElementById('nav-dots');
const navGroups = [
  { cls: 'pro',      indices: [0,1,2]   },
  { cls: 'personal', indices: [3,4,5]   },
  { cls: 'play',     indices: [6,7,8]   },
  { cls: 'contact',  indices: [9]       },
];
navGroups.forEach((g, gi) => {
  const grp = document.createElement('div');
  grp.className = 'nav-group';
  g.indices.forEach(i => {
    const d = document.createElement('div');
    d.className = `nav-dot ${g.cls}`;
    d.dataset.index = i;
    d.addEventListener('click', () => scrollToPanel(i));
    grp.appendChild(d);
  });
  navDotsEl.appendChild(grp);
  if (gi < navGroups.length - 1) {
    const sep = document.createElement('div');
    sep.className = 'nav-sep';
    navDotsEl.appendChild(sep);
  }
});

/* Keyboard navigation */
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    if (currentIdx < TOTAL - 1) scrollToPanel(currentIdx + 1);
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    if (currentIdx > 0) scrollToPanel(currentIdx - 1);
  }
});

/* ── Reveal ─────────────────────────────────────────────────────── */
// Panel order: 0(landing) 1(about) 2(skills)
//              3(philanthropy) 4(photography) 5(events)
//              6(travel) 7(trivia) 8(terminal) 9(contact)
const allPanels = document.querySelectorAll('.panel, .v-panel');
const revealed  = new Set();

function triggerReveal(idx) {
  if (revealed.has(idx)) return;
  revealed.add(idx);
  const panel = allPanels[idx];
  if (!panel) return;
  panel.querySelectorAll('.reveal').forEach(el => el.classList.add('on'));
  panel.querySelectorAll('.skill-card').forEach(el => el.classList.add('on'));
}
triggerReveal(0);

/* ── Custom cursor ──────────────────────────────────────────────── */
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function animCursor() {
  dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
  rx += (mx - rx) * 0.12;     ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px'; ring.style.top  = ry + 'px';
  requestAnimationFrame(animCursor);
})();

function addHover(sel) {
  document.querySelectorAll(sel).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('ch'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
  });
}

/* ── Landing name — per-character animation ─────────────────────── */
const nameEl = document.getElementById('landing-name');
'Sharlena Luyen'.split('').forEach((c, i) => {
  const s = document.createElement('span');
  s.className = 'lch';
  s.textContent = c === ' ' ? '\u00A0' : c;
  s.style.animationDelay = `${0.04 + i * 0.06}s`;
  nameEl.appendChild(s);
});

/* Landing parallax on mouse move */
const lInner = document.querySelector('.landing-inner');
document.addEventListener('mousemove', e => {
  if (currentIdx !== 0) return;
  const x = (e.clientX / window.innerWidth  - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 6;
  lInner.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
});

/* ── Image banner — philanthropy page ──────────────────────────── */
// Add your image URLs or local paths here. They loop seamlessly.
const bannerImages = [
  'assets/img/casa.jpg',
  'assets/img/cozmos.jpg',
  'assets/img/capstone.jpg',
  'assets/img/menkids.jpg'
];

const bannerInner = document.getElementById('banner-inner');
if (bannerInner) {
  // Double the list for a seamless CSS loop
  const doubled = [...bannerImages, ...bannerImages];
  doubled.forEach(src => {
    const item = document.createElement('div');
    item.className = 'banner-img';
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    item.appendChild(img);
    bannerInner.appendChild(item);
  });
}

/* ── Events ─────────────────────────────────────────────────────── */
/*{ year:'201X', title:'XX',         tag:'Professional'  },*/
const eventsData = [
  { year:'2026', title:'Sworn in as a CASA in Orange County',                                                                                       tag:'Advocacy' },
  { year:'2026', title:'Increased accessibility to AI agents & services for small businesses and non-profits',                                   tag:'Civic'   },
  { year:'2025', title:'Hired as Backend Software Engineer at Hashicorp, an IBM company',                                                        tag:'Professional' },
  { year:'2025', title:'Began community outreach & support for women & non-binary individuals',                                                  tag:'Civic' },
  { year:'2023', title:'Fundraised $30k for Food for Lane County by coordinating Paella Fest',                                                   tag:'Civic'      },
  { year:'2022', title:'Received $20k grant for volunteering efforts from Last Mile Education Fund',                                             tag:'Award'  },
  { year:'2022', title:'Hired as Software Consultant at Stride Consulting',                                                                      tag:'Professional'  },
  { year:'2020', title:'Began fostering cats & dogs for Northwest Animal Companions in Portland, Oregon',                                        tag:'Hobby'  },
  { year:'2020', title:'Sworn onto Citizen Review Board to serve in Multnomah County',                                                           tag:'Advocacy'  },
  { year:'2020', title:'Sworn in as a CASA in Multnomah County',                                                                                    tag:'Advocacy'  },
  { year:'2020', title:'Hired as Software Engineer I at Optum',                                                                                  tag:'Professional'  },
  { year:'2019', title:'Awarded Karena Dokken Award for mentorship by Oregon State College of Engineering',                                      tag:'Award'   },
  { year:'2019', title:'Sworn in as a CASA in Benton County',                                                                                       tag:'Advocacy'  },
  { year:'2019', title:'Received $100k Learning Innovation Grant to conduct experiential research in teaching Computer Science to K-12',         tag:'Civic'  },
  { year:'2018', title:'Advocated, fundraised, & initiated university scholarship program for the Grace Hopper Conference',                      tag:'Civic'  },
  { year:'2017', title:'Certified for Open Water Scuba Diving through PADI',                                                                     tag:'Hobby'  },
  { year:'2017', title:'TEDxTalk: A Story, My Story',                                                                                            tag:'Public Speaking'  },
];
const evCountEl = document.getElementById('events-count');
const evListEl  = document.getElementById('events-list');
if (evCountEl) evCountEl.textContent = String(eventsData.length).padStart(2,'0');
if (evListEl) eventsData.forEach(ev => {
  const row = document.createElement('div');
  row.className = 'event-row';
  row.innerHTML = `
    <span class="event-year">${ev.year}</span>
    <span class="event-title">${ev.title}</span>
    <span class="event-tag">${ev.tag}</span>
  `;
  evListEl.appendChild(row);
});

/* ── Photography grid ───────────────────────────────────────────── */
// Use local paths, full URLs, or links from anywhere (Cloudinary, Google Photos, etc.)
// Just paste the image URL as the src. 6 slots total.
const photoUrls = [
  'https://live.staticflickr.com/933/43011836814_56b118abed_k.jpg',
  'https://live.staticflickr.com/65535/51972900612_18438db3cf_k.jpg',
  'https://live.staticflickr.com/65535/51973992563_74b9420228_k.jpg',
  'https://live.staticflickr.com/856/41919257710_0852c8795f_k.jpg',
  'https://live.staticflickr.com/65535/51973981653_ce13787e72_k.jpg',
  'https://live.staticflickr.com/1786/42336567544_52d423d77f_k.jpg'
];

const photoGridEl = document.getElementById('photo-grid');
if (photoGridEl) {
  photoUrls.forEach((src, i) => {
    const cell = document.createElement('div');
    cell.className = 'photo-cell';
    cell.innerHTML = `
      <div class="photo-cell-inner" style="background-image:url('${src}');background-size:cover;background-position:center;"></div>
      <div class="photo-overlay"></div>
      <span class="photo-num">0${i + 1}</span>
    `;
    photoGridEl.appendChild(cell);
  });
}

/* ── Travel map ─────────────────────────────────────────────────── */
const travelData = [
  // Europe
  ['United Kingdom',      51.50,   -0.13],
  ['Scotland',            55.95,   -3.19],
  ['Ireland',             53.33,   -6.25],
  ['Isle of Man',         54.15,   -4.48],
  ['France',              48.85,    2.35],
  ['Belgium',             50.85,    4.35],
  ['Netherlands',         52.37,    4.90],
  ['Germany',             52.52,   13.40],
  ['Spain',               40.42,   -3.70],
  ['Italy',               41.90,   12.49],
  // Caribbean
  ['Bahamas',             25.04,  -77.34],
  ['Turks & Caicos',      21.69,  -71.80],
  ['Puerto Rico',         18.47,  -66.11],
  ['Anguilla',            18.22,  -63.05],
  ['Saint Martin',        18.07,  -63.08],
  ['St. Kitts & Nevis',   17.30,  -62.72],
  ['Antigua & Barbuda',   17.12,  -61.85],
  ['Saint Lucia',         13.90,  -60.98],
  ['Barbados',            13.10,  -59.61],
  // Central & South America
  ['Mexico',              19.43,  -99.13],
  ['Guatemala',           14.64,  -90.51],
  ['Belize',              17.25,  -88.77],
  ['Costa Rica',           9.93,  -84.08],
  ['Peru',               -12.05,  -77.04],
  // North America
  ['Canada',              45.42,  -75.69],
  // Asia
  ['Japan',               35.68,  139.69],
  ['South Korea',         37.57,  126.98],
  ['Taiwan',              25.03,  121.56],
  ['Vietnam',             21.03,  105.85],
  ['Philippines',         14.60,  121.00],
  ['India',               20.59,   78.96],
  // Pacific
  ['Australia',          -25.27,  133.78],
  ['Fiji',               -18.14,  178.44],
  ['Tonga',              -21.18, -175.20],
  ['French Polynesia',   -17.53, -149.57],
];

/* LAT_MAX/LAT_MIN chosen so (360 / (LAT_MAX - LAT_MIN)) ≈ SVG_W/SVG_H (3.4:1),
   eliminating horizontal stretch. Clips Antarctica and Arctic but keeps all travel spots. */
const LAT_MAX = 65, LAT_MIN = -40;
function project(lat, lon, W, H) {
  const x = ((lon + 180) / 360) * W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H;
  return { x, y };
}

const svgEl     = document.getElementById('world-svg');
const mapTTEl   = document.getElementById('map-tt');
const mapWrapEl = document.getElementById('map-wrap');
const SVG_W = 900, SVG_H = 265;

if (svgEl) {
  document.head.insertAdjacentHTML('beforeend',
    '<style>@keyframes mpulse{0%{r:4;opacity:0.5}100%{r:22;opacity:0}}</style>');

  // ── World land outlines ──────────────────────────────────────────
  function geoFeatureToPath(feature) {
    const geom = feature.geometry;
    if (!geom) return '';
    function ringToD(ring) {
      let d = '';
      ring.forEach(([lon, lat], i) => {
        const { x, y } = project(Math.max(-85, Math.min(85, lat)), lon, SVG_W, SVG_H);
        d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
      });
      return d + 'Z';
    }
    if (geom.type === 'Polygon') return geom.coordinates.map(ringToD).join(' ');
    if (geom.type === 'MultiPolygon') return geom.coordinates.flatMap(p => p.map(ringToD)).join(' ');
    return '';
  }

  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(r => r.json())
    .then(world => {
      topojson.feature(world, world.objects.countries).features.forEach(feature => {
        const d = geoFeatureToPath(feature);
        if (!d) return;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'rgba(124,130,232,0.07)');
        path.setAttribute('stroke', 'rgba(124,130,232,0.18)');
        path.setAttribute('stroke-width', '0.3');
        svgEl.insertBefore(path, svgEl.firstChild);
      });
    })
    .catch(() => {});

  for (let lon = -180; lon <= 180; lon += 30) {
    const { x } = project(0, lon, SVG_W, SVG_H);
    const l = document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',x); l.setAttribute('y1',0);
    l.setAttribute('x2',x); l.setAttribute('y2',SVG_H);
    l.setAttribute('stroke','rgba(144,200,248,0.05)');
    l.setAttribute('stroke-width','0.5');
    svgEl.appendChild(l);
  }
  for (let lat = -60; lat <= 80; lat += 30) {
    const { y } = project(lat, 0, SVG_W, SVG_H);
    const l = document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',0); l.setAttribute('y1',y);
    l.setAttribute('x2',SVG_W); l.setAttribute('y2',y);
    l.setAttribute('stroke','rgba(144,200,248,0.05)');
    l.setAttribute('stroke-width','0.5');
    svgEl.appendChild(l);
  }

  travelData.forEach(([name, lat, lon]) => {
    const { x, y } = project(lat, lon, SVG_W, SVG_H);

    const pulse = document.createElementNS('http://www.w3.org/2000/svg','circle');
    pulse.setAttribute('cx', x); pulse.setAttribute('cy', y);
    pulse.setAttribute('r', '4'); pulse.setAttribute('fill', 'none');
    pulse.setAttribute('stroke', 'rgba(144,200,248,0.3)');
    pulse.setAttribute('stroke-width', '1');
    pulse.style.animation = 'mpulse 2.4s ease-out infinite';
    pulse.style.transformOrigin = `${x}px ${y}px`;
    svgEl.appendChild(pulse);

    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.style.cursor = 'pointer';
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y);
    c.setAttribute('r', '3.5');
    c.setAttribute('fill', 'rgba(144,200,248,0.75)');
    c.style.transition = 'r 0.2s, fill 0.2s';
    g.appendChild(c); svgEl.appendChild(g);

    g.addEventListener('mouseenter', () => {
      document.body.classList.add('ch');
      mapTTEl.textContent = name; mapTTEl.classList.add('show');
      c.setAttribute('r','6'); c.setAttribute('fill','#90c8f8');
    });
    g.addEventListener('mousemove', e => {
      const r = mapWrapEl.getBoundingClientRect();
      mapTTEl.style.left = (e.clientX - r.left + 14) + 'px';
      mapTTEl.style.top  = (e.clientY - r.top  - 12) + 'px';
    });
    g.addEventListener('mouseleave', () => {
      document.body.classList.remove('ch');
      mapTTEl.classList.remove('show');
      c.setAttribute('r','3.5');
      c.setAttribute('fill','rgba(144,200,248,0.75)');
    });
  });

  const countLbl = document.getElementById('travel-count-lbl');
  if (countLbl) {
    countLbl.innerHTML =
      `${travelData.length} countries &amp; territories<br>` +
      `<span style="font-size:9px;opacity:0.5;">and counting</span>`;
  }

  const chipsEl = document.getElementById('travel-chips');
  if (chipsEl) travelData.forEach(([name]) => {
    const chip = document.createElement('span');
    chip.className = 't-chip'; chip.textContent = name;
    chipsEl.appendChild(chip);
  });
}

/* ════════════════════════════════════════════════════════════════
   TRIVIA
════════════════════════════════════════════════════════════════ */
const triviaQuestions = [
  {
    q: 'What kinds of systems does Sharlena prefer to work on in development?',
    choices: ['Front-end ecosystems', 'Database management', 'Distributed systems', 'Site reliability'],
    correct: 2,
  },
  {
    q: 'What is Sharlena known for baking?',
    choices: ['Ice cream cakes', 'Chocolate chip cookies', 'Dark chocolate quinoa crisps', 'Pies'],
    correct: 0,
  },
  {
    q: 'True civic engagement means showing up consistently, even without glory. Which best describes that commitment?',
    choices: [
      'Attending a single town hall meeting',
      'Sharing political opinions on social media',
      '8+ years of volunteer advocacy for foster youth in the court system',
      'Voting once in a presidential election',
    ],
    correct: 2,
  },
  {
    q: "What are the names of Sharlena's cats?",
    choices: ['Luna & Mochi', 'Cleo & Mango', 'Pixel & Byte', 'Dodo & Bumbum'],
    correct: 3,
  },
  {
    q: 'Which enterprise identity protocols has Sharlena built API integration layers for?',
    choices: ['OAuth 2.0 only', 'SCIM & SAML', 'JWT & OpenID Connect', 'Kerberos & LDAP'],
    correct: 1,
  },
  {
    q: "Which of the following is NOT one of Sharlena's hobbies in 2026?",
    choices: ['Painting', 'Gymnastics', 'Training for a marathon', 'Pickleball'],
    correct: 0,
  },
  {
    q: "What are Sharlena's primary production programming languages?",
    choices: ['Python & JavaScript', 'Java & Kotlin', 'Go & Ruby on Rails', 'PHP & TypeScript' ],
    correct: 2,
  },
  {
    q: 'Sharlena has visited 35+ countries. Which of these is on her travel map?',
    choices: ['Tahiti', 'Iceland', 'Morocco', 'New Zealand'],
    correct: 0,
  },
  {
    q: "Which of the following are NOT career paths that Sharlena has considered pursuing at some point?",
    choices: [
      'Event planner',
      'Teacher or professor',
      'Dog trainer',
      'Acrobatic performance art',
    ],
    correct: 3,
  },
];

function getShuffled(q) {
  const correctText = q.choices[q.correct];
  const shuffled = [...q.choices].sort(() => Math.random() - 0.5);
  return { choices: shuffled, correct: shuffled.indexOf(correctText) };
}

let triviaIdx      = 0;
let triviaScore    = 0;
let triviaAnswered = false;
let triviaShuffled = [];

const triviaGameEl   = document.getElementById('trivia-game');
const triviaResultEl = document.getElementById('trivia-result');
const triviaQNum     = document.getElementById('trivia-q-num');
const triviaQText    = document.getElementById('trivia-q-text');
const triviaChoices  = document.getElementById('trivia-choices');
const triviaSteps    = document.getElementById('trivia-steps');
const triviaScoreEl  = document.getElementById('trivia-score');
const triviaMsg      = document.getElementById('trivia-result-msg');
const triviaSub      = document.getElementById('trivia-result-sub');

const LETTERS = ['A', 'B', 'C', 'D'];

function renderSteps() {
  if (!triviaSteps) return;
  triviaSteps.innerHTML = '';
  triviaQuestions.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'trivia-step' +
      (i < triviaIdx ? ' done' : i === triviaIdx ? ' current' : '');
    triviaSteps.appendChild(dot);
  });
}

function renderTrivia() {
  if (!triviaQText) return;
  const raw = triviaQuestions[triviaIdx];
  triviaShuffled = getShuffled(raw);
  triviaQNum.innerHTML = `Q ${triviaIdx + 1} <span>/</span> ${triviaQuestions.length}`;
  triviaQText.textContent = raw.q;
  triviaChoices.innerHTML = '';
  triviaAnswered = false;

  triviaShuffled.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'trivia-btn';
    btn.innerHTML = `
      <span class="trivia-btn-letter">${LETTERS[i]}</span>
      <span class="trivia-btn-text">${choice}</span>
    `;
    btn.addEventListener('click', () => handleAnswer(i));
    triviaChoices.appendChild(btn);
  });

  renderSteps();
}

function handleAnswer(chosen) {
  if (triviaAnswered) return;
  triviaAnswered = true;
  const correct = triviaShuffled.correct;

  document.querySelectorAll('.trivia-btn').forEach((b, i) => {
    b.disabled = true;
    const letter = b.querySelector('.trivia-btn-letter');
    if (i === correct) {
      b.classList.add('correct');
      letter.textContent = '✓';
    } else if (i === chosen && i !== correct) {
      b.classList.add('wrong');
      letter.textContent = '✗';
    }
  });

  if (chosen === correct) triviaScore++;

  setTimeout(() => {
    triviaIdx++;
    if (triviaIdx < triviaQuestions.length) {
      renderTrivia();
    } else {
      showTriviaResult();
    }
  }, 1100);
}

function showTriviaResult() {
  triviaGameEl.classList.add('hide');
  triviaResultEl.classList.add('show');
  triviaScoreEl.textContent = `${triviaScore}/${triviaQuestions.length}`;
  const pct = triviaScore / triviaQuestions.length;
  if (pct === 1) {
    triviaMsg.textContent = 'You really know her.';
    triviaSub.textContent = 'Full marks. You might actually be Sharlena. Or her cat.';
  } else if (pct >= 0.7) {
    triviaMsg.textContent = 'Pretty solid. Keep reading.';
    triviaSub.textContent = 'You clearly paid attention. She appreciates that.';
  } else if (pct >= 0.4) {
    triviaMsg.textContent = 'Room to grow. Book a chat with her.';
    triviaSub.textContent = 'A decent start, but she is disappointed, for sure.';
  } else {
    triviaMsg.textContent = 'Fresh start, then? Book a chat with her.';
    triviaSub.textContent = "Scroll back through. There's a lot of good stuff here.";
  }
}

function restartTrivia() {
  triviaIdx = 0; triviaScore = 0;
  triviaGameEl.classList.remove('hide');
  triviaResultEl.classList.remove('show');
  renderTrivia();
}
window.restartTrivia = restartTrivia;

if (triviaQText) renderTrivia();

/* ════════════════════════════════════════════════════════════════
   TERMINAL
════════════════════════════════════════════════════════════════ */
const termBody  = document.getElementById('terminal-body');
const termInput = document.getElementById('terminal-input');

const COMMANDS = {
  help: () => [
    { cls: 'muted',  t: 'Available commands:' },
    { cls: 'accent', t: '  about    → who is Sharlena?' },
    { cls: 'accent', t: '  skills   → what can she build?' },
    { cls: 'accent', t: '  cats     → the important stuff' },
    { cls: 'accent', t: '  travel   → where has she been?' },
    { cls: 'accent', t: '  hobbies  → life outside the terminal' },
    { cls: 'accent', t: '  bake     → yes, she bakes' },
    { cls: 'accent', t: '  hire     → let\'s talk' },
    { cls: 'accent', t: '  clear    → clear screen' },
    { t: '' },
  ],
  about: () => [
    { t: '┌──────────────────────────────────────────┐' },
    { t: '│  Sharlena Luyen                          │' },
    { t: '│  Backend Software Engineer               │' },
    { t: '│  CASA Volunteer                          │' },
    { t: '│                                          │' },
    { t: '│  3+ yrs Go & Ruby on Rails (production)  │' },
    { t: '│  Specialty: enterprise identity systems  │' },
    { t: '│  Also: runner, cat mom, traveler         │' },
    { t: '└──────────────────────────────────────────┘' },
    { t: '' },
  ],
  skills: () => [
    { cls: 'success', t: '✓  Go (3+ yrs production)' },
    { cls: 'success', t: '✓  Ruby on Rails (3+ yrs production)' },
    { cls: 'success', t: '✓  SCIM & SAML API layers' },
    { cls: 'success', t: '✓  Python, C++' },
    { cls: 'success', t: '✓  React / TypeScript (~2 yrs)' },
    { cls: 'muted',   t: '△  Currently growing: distributed systems depth' },
    { t: '' },
  ],
  cats: () => [
    { cls: 'rose',  t: '🐈  Bumbum — chief chaos officer' },
    { cls: 'rose',  t: '🐈  Dodo   — head of nap strategy' },
    { cls: 'muted', t: '    Both unavailable for comment.' },
    { t: '' },
  ],
  travel: () => [
    { t: 'EUROPE: UK, Scotland, Ireland, Isle of Man,' },
    { t: 'France, Belgium, Netherlands, Germany, Spain, Italy.' },
    { t: 'CARIBBEAN: Bahamas, Turks & Caicos, Puerto Rico,' },
    { t: 'Anguilla, St. Martin, St. Kitts, Antigua, St. Lucia, Barbados.' },
    { t: 'AMERICAS: Mexico, Guatemala, Belize, Costa Rica, Peru, Canada.' },
    { t: 'ASIA: Japan, South Korea, Taiwan, Vietnam, Philippines, India.' },
    { t: 'PACIFIC: Australia, Fiji, Tonga, French Polynesia.' },
    { cls: 'muted', t: `That's ${36} countries. Next target: New Zealand.` },
    { t: '' },
  ],
  hobbies: () => [
    { t: 'Photography  — candid moments, real ones' },
    { t: 'Travel       — always planning the next trip' },
    { t: 'Gymnastics   — currently perfecting back handsprings' },
    { t: 'Running      — just trying to finish (slowly)' },
    { t: 'Plants       — the desk vine is thriving' },
    { t: 'Cats         — see: cats' },
    { t: '' },
  ],
  bake: () => [
    { cls: 'accent', t: 'Specialty: ice cream cakes.' },
    { cls: 'muted',  t: 'Yes, from scratch. Yes, they are good.' },
    { cls: 'muted',  t: 'No, they are not pretty.' },
    { t: '' },
  ],
  hire: () => [
    { cls: 'success', t: '→  calendly.com/sharlena/personal-meeting' },
    { cls: 'muted',   t: '   Or scroll to the end of this page.' },
    { cls: 'muted',   t: "   She replies fast. Except when she doesn't." },
    { t: '' },
  ],
};

function termPrint(lines) {
  lines.forEach(({ t = '', cls }) => {
    const div = document.createElement('div');
    div.className = 't-line t-output' + (cls ? ` ${cls}` : '');
    div.textContent = t;
    termBody.appendChild(div);
  });
  termBody.scrollTop = termBody.scrollHeight;
}

function termPrintInput(val) {
  const div = document.createElement('div');
  div.className = 't-line';
  div.innerHTML = `<span class="t-prompt">sharlena@portfolio:~$ </span>${val}`;
  termBody.appendChild(div);
  termBody.scrollTop = termBody.scrollHeight;
}

if (termInput) {
  termPrint([
    { cls: 'accent', t: "Welcome to Sharlena's terminal. ✦" },
    { cls: 'muted',  t: 'Type "help" to see available commands.' },
    { t: '' },
  ]);

  termInput.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const val = termInput.value.trim().toLowerCase();
    termInput.value = '';
    termPrintInput(val);
    if (!val) return;
    if (val === 'clear') {
      termBody.innerHTML = '';
      termPrint([{ cls: 'muted', t: 'Cleared. Type "help" to start.' }, { t: '' }]);
      return;
    }
    const cmd = COMMANDS[val];
    if (cmd) termPrint(cmd());
    else termPrint([{ cls: 'muted', t: `command not found: ${val} — try "help"` }, { t: '' }]);
  });
}

/* ── Hover cursor states ────────────────────────────────────────── */
addHover([
  'a', 'button', '.nav-dot', '.phil-card', '.skill-card',
  '.event-row', '.tag', '.t-chip', '.trivia-btn',
  '.banner-img', '.photo-cell', '.trivia-restart-btn',
].join(', '));

/* ── Initial update ─────────────────────────────────────────────── */
doUpdate();