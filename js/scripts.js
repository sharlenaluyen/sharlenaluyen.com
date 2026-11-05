/* ════════════════════════════════════════════════════════════════
   scripts.js — index.html
   Plain vertical page. This file adds: nav state, scroll reveals,
   the hero name animation, Clippy/copy buttons, photography grid,
   travel map, trivia and the terminal.
════════════════════════════════════════════════════════════════ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Nav: border on scroll + active section link ────────────────── */
const navEl = document.getElementById('site-nav');
const onScroll = () => navEl.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const navLinks = [...document.querySelectorAll('.nav-links a')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach(a => {
  const section = document.querySelector(a.getAttribute('href'));
  if (section) sectionObserver.observe(section);
});

/* ── Reveal on scroll ───────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('on'));
} else {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('on');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(el => revealObserver.observe(el));
}

/* ── Hero name — per-character animation ────────────────────────── */
const nameEl = document.getElementById('hero-name');
if (nameEl && !reduceMotion) {
  const text = nameEl.textContent;
  nameEl.setAttribute('aria-label', text);
  nameEl.textContent = '';
  text.split('').forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'lch';
    s.setAttribute('aria-hidden', 'true');
    s.textContent = c === ' ' ? ' ' : c;
    s.style.animationDelay = `${0.04 + i * 0.045}s`;
    nameEl.appendChild(s);
  });
}

/* ── Copy rag: make each block's last line ≈ 75% full ───────────────
   For every multi-line block of copy, try widths from 100% down to 65%
   of its column and keep the one whose last line lands closest to 75%
   of the line width, with small penalties for each line it adds and for
   narrowing the block. Re-runs
   once fonts load and on resize. */
const FIT_SELECTOR = [
  '.hero-lead', '.section-sub', '.contact-sub', '.card-body', '.card-list li',
  '.card-note', '.role-body', '.role-list li', '.mini p', '.edu-awards li',
].join(',');
const FIT_TARGET = 0.75;

function measureLines(el, contentLeft) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const rects = [...range.getClientRects()].filter(r => r.width > 0);
  if (!rects.length) return null;
  const lineH = parseFloat(getComputedStyle(el).lineHeight) || 20;
  const bottoms = [];
  rects.forEach(r => { if (!bottoms.some(b => Math.abs(b - r.bottom) < lineH / 2)) bottoms.push(r.bottom); });
  const lastBottom = Math.max(...bottoms);
  const lastRight = Math.max(...rects.filter(r => r.bottom > lastBottom - lineH / 2).map(r => r.right));
  return { lines: bottoms.length, lastWidth: lastRight - contentLeft };
}

function fitLastLine(el) {
  el.style.maxWidth = '';
  const cs = getComputedStyle(el);
  const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  const full = el.clientWidth - padX;
  if (full <= 0) return;
  const left = () => el.getBoundingClientRect().left + parseFloat(cs.paddingLeft);
  const base = measureLines(el, left());
  if (!base || base.lines < 2) return;

  let best = { w: null, score: Infinity };
  for (let pct = 1; pct >= 0.65; pct -= 0.01) {
    const w = Math.floor(full * pct);
    el.style.maxWidth = (w + padX) + 'px';
    const m = measureLines(el, left());
    if (!m) continue;
    const score = Math.abs(m.lastWidth / w - FIT_TARGET)
      + 0.12 * Math.max(0, m.lines - base.lines)
      + 0.15 * (1 - pct);
    if (score < best.score) best = { w, score };
  }
  el.style.maxWidth = best.w === null || best.w === full ? '' : (best.w + padX) + 'px';
}

function fitAllLastLines() {
  document.querySelectorAll(FIT_SELECTOR).forEach(fitLastLine);
}

let fitTimer;
window.addEventListener('resize', () => {
  clearTimeout(fitTimer);
  fitTimer = setTimeout(fitAllLastLines, 150);
});
(document.fonts ? document.fonts.ready : Promise.resolve()).then(fitAllLastLines);

/* ── Project card buttons ───────────────────────────────────────── */
// "Ask Clippy" opens the chat widget that js/clippy-agent.js draws in the corner.
document.querySelectorAll('.try-clippy').forEach(btn => {
  btn.addEventListener('click', () => {
    const clippy = document.querySelector('.sc-own');
    if (clippy) clippy.click();
  });
});

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const label = btn.textContent;
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = 'Copied ✓';
    } catch {
      btn.textContent = btn.dataset.copy;
    }
    setTimeout(() => { btn.textContent = label; }, 2200);
  });
});

/* ── Photography grid ───────────────────────────────────────────── */
// Local paths or full URLs. 6 slots.
const photoUrls = [
  'https://live.staticflickr.com/933/43011836814_56b118abed_k.jpg',
  'https://live.staticflickr.com/65535/51972900612_18438db3cf_k.jpg',
  'https://live.staticflickr.com/65535/51973992563_74b9420228_k.jpg',
  'https://live.staticflickr.com/856/41919257710_0852c8795f_k.jpg',
  'https://live.staticflickr.com/65535/51973981653_ce13787e72_k.jpg',
  'https://live.staticflickr.com/1786/42336567544_52d423d77f_k.jpg',
];

const photoGridEl = document.getElementById('photo-grid');
if (photoGridEl) {
  photoUrls.forEach(src => {
    const cell = document.createElement('div');
    cell.className = 'photo-cell';
    cell.style.backgroundImage = `url('${src}')`;
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
  ['Switzerland',         46.95,    7.45],
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
  ['Indonesia',           -0.79,  113.92],
  // Pacific
  ['Australia',          -25.27,  133.78],
  ['Fiji',               -18.14,  178.44],
  ['Tonga',              -21.18, -175.20],
  ['French Polynesia',   -17.53, -149.57],
];

/* LAT_MAX/LAT_MIN chosen so (360 / (LAT_MAX - LAT_MIN)) ≈ SVG_W/SVG_H (3.4:1),
   so the map isn't stretched. Clips the poles but keeps every travel spot. */
const LAT_MAX = 65, LAT_MIN = -40;
const SVG_W = 900, SVG_H = 265;
const SVG_NS = 'http://www.w3.org/2000/svg';
function project(lat, lon) {
  return {
    x: ((lon + 180) / 360) * SVG_W,
    y: ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * SVG_H,
  };
}

const svgEl     = document.getElementById('world-svg');
const mapTTEl   = document.getElementById('map-tt');
const mapWrapEl = document.getElementById('map-wrap');

if (svgEl) {
  function geoFeatureToPath(feature) {
    const geom = feature.geometry;
    if (!geom) return '';
    const ringToD = ring => ring.map(([lon, lat], i) => {
      const { x, y } = project(Math.max(-85, Math.min(85, lat)), lon);
      return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
    }).join('') + 'Z';
    if (geom.type === 'Polygon') return geom.coordinates.map(ringToD).join(' ');
    if (geom.type === 'MultiPolygon') return geom.coordinates.flatMap(p => p.map(ringToD)).join(' ');
    return '';
  }

  if (window.topojson) {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')
      .then(r => r.json())
      .then(world => {
        topojson.feature(world, world.objects.countries).features.forEach(feature => {
          const d = geoFeatureToPath(feature);
          if (!d) return;
          const path = document.createElementNS(SVG_NS, 'path');
          path.setAttribute('d', d);
          path.setAttribute('fill', 'rgba(124,130,232,0.08)');
          path.setAttribute('stroke', 'rgba(124,130,232,0.22)');
          path.setAttribute('stroke-width', '0.3');
          svgEl.insertBefore(path, svgEl.firstChild);
        });
      })
      .catch(() => {});
  }

  travelData.forEach(([name, lat, lon]) => {
    const { x, y } = project(lat, lon);

    if (!reduceMotion) {
      const pulse = document.createElementNS(SVG_NS, 'circle');
      pulse.setAttribute('cx', x); pulse.setAttribute('cy', y);
      pulse.setAttribute('r', '4'); pulse.setAttribute('fill', 'none');
      pulse.setAttribute('stroke', 'rgba(144,200,248,0.3)');
      pulse.setAttribute('stroke-width', '1');
      pulse.style.animation = 'mpulse 2.4s ease-out infinite';
      svgEl.appendChild(pulse);
    }

    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y);
    c.setAttribute('r', '4');
    c.setAttribute('fill', 'rgba(144,200,248,0.8)');
    c.style.cursor = 'pointer';
    const title = document.createElementNS(SVG_NS, 'title');
    title.textContent = name;
    c.appendChild(title);
    svgEl.appendChild(c);

    c.addEventListener('mouseenter', () => {
      mapTTEl.textContent = name; mapTTEl.classList.add('show');
      c.setAttribute('r', '6.5'); c.setAttribute('fill', '#90c8f8');
    });
    c.addEventListener('mousemove', e => {
      const r = mapWrapEl.getBoundingClientRect();
      mapTTEl.style.left = (e.clientX - r.left + 12) + 'px';
      mapTTEl.style.top  = (e.clientY - r.top  - 28) + 'px';
    });
    c.addEventListener('mouseleave', () => {
      mapTTEl.classList.remove('show');
      c.setAttribute('r', '4'); c.setAttribute('fill', 'rgba(144,200,248,0.8)');
    });
  });

  const countLbl = document.getElementById('travel-count-lbl');
  if (countLbl) countLbl.textContent = `${travelData.length} countries & territories, and counting.`;
}

/* ════════════════════════════════════════════════════════════════
   TRIVIA
════════════════════════════════════════════════════════════════ */
const triviaQuestions = [
  {
    q: 'What did Sharlena implement at HashiCorp?',
    choices: ['SCIM provisioning with Okta & Azure', 'A billing system', 'A mobile app', 'A Kubernetes operator'],
    correct: 0,
  },
  {
    q: 'What is Sharlena known for baking?',
    choices: ['Ice cream cakes', 'Chocolate chip cookies', 'Dark chocolate quinoa crisps', 'Pies'],
    correct: 0,
  },
  {
    q: 'How long has Sharlena volunteered as a CASA for kids in foster care?',
    choices: ['One summer', '2 years', '8+ years', 'She hasn\'t yet'],
    correct: 2,
  },
  {
    q: "What are the names of Sharlena's cats?",
    choices: ['Luna & Mochi', 'Cleo & Mango', 'Pixel & Byte', 'Dodo & Bumbum'],
    correct: 3,
  },
  {
    q: 'What nonprofit did Sharlena found in high school?',
    choices: ['Codemmunity', 'TechBridge', 'GirlsWhoCode Local', 'CodeForGood'],
    correct: 0,
  },
  {
    q: "Which of these is NOT one of Sharlena's hobbies in 2026?",
    choices: ['Painting', 'Gymnastics', 'Training for a marathon', 'Pickleball'],
    correct: 0,
  },
  {
    q: 'About how much has Sharlena fundraised by cooking paella for 10+ people at a time?',
    choices: ['$5k', '$15k', '$30k+', '$100k'],
    correct: 2,
  },
  {
    q: 'Which of these is on her travel map?',
    choices: ['Tahiti', 'Iceland', 'Morocco', 'New Zealand'],
    correct: 0,
  },
  {
    q: 'Which of these is NOT a career Sharlena has considered?',
    choices: ['Event planner', 'Teacher or professor', 'Dog trainer', 'Acrobatic performance art'],
    correct: 3,
  },
];

const LETTERS = ['A', 'B', 'C', 'D'];
const triviaGameEl   = document.getElementById('trivia-game');
const triviaResultEl = document.getElementById('trivia-result');
const triviaQNum     = document.getElementById('trivia-q-num');
const triviaQText    = document.getElementById('trivia-q-text');
const triviaChoices  = document.getElementById('trivia-choices');
const triviaSteps    = document.getElementById('trivia-steps');
const triviaScoreEl  = document.getElementById('trivia-score');
const triviaMsg      = document.getElementById('trivia-result-msg');
const triviaSub      = document.getElementById('trivia-result-sub');

let triviaIdx = 0, triviaScore = 0, triviaAnswered = false, triviaShuffled = null;

function shuffle(q) {
  const correctText = q.choices[q.correct];
  const choices = [...q.choices];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return { choices, correct: choices.indexOf(correctText) };
}

function renderTrivia() {
  const raw = triviaQuestions[triviaIdx];
  triviaShuffled = shuffle(raw);
  triviaAnswered = false;
  triviaQNum.textContent = `Q ${triviaIdx + 1} / ${triviaQuestions.length}`;
  triviaQText.textContent = raw.q;
  triviaChoices.innerHTML = '';
  triviaShuffled.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'trivia-btn';
    const letter = document.createElement('span');
    letter.className = 'trivia-btn-letter';
    letter.textContent = LETTERS[i];
    const label = document.createElement('span');
    label.textContent = choice;
    btn.append(letter, label);
    btn.addEventListener('click', () => handleAnswer(i));
    triviaChoices.appendChild(btn);
  });
  triviaSteps.innerHTML = '';
  triviaQuestions.forEach((_, i) => {
    const step = document.createElement('div');
    step.className = 'trivia-step' + (i < triviaIdx ? ' done' : i === triviaIdx ? ' current' : '');
    triviaSteps.appendChild(step);
  });
}

function handleAnswer(chosen) {
  if (triviaAnswered) return;
  triviaAnswered = true;
  const correct = triviaShuffled.correct;
  triviaChoices.querySelectorAll('.trivia-btn').forEach((b, i) => {
    b.disabled = true;
    const letter = b.querySelector('.trivia-btn-letter');
    if (i === correct) { b.classList.add('correct'); letter.textContent = '✓'; }
    else if (i === chosen) { b.classList.add('wrong'); letter.textContent = '✗'; }
  });
  if (chosen === correct) triviaScore++;
  setTimeout(() => {
    triviaIdx++;
    if (triviaIdx < triviaQuestions.length) renderTrivia();
    else showTriviaResult();
  }, 1000);
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
    triviaMsg.textContent = 'Pretty solid.';
    triviaSub.textContent = 'You clearly paid attention. She appreciates that.';
  } else if (pct >= 0.4) {
    triviaMsg.textContent = 'Room to grow.';
    triviaSub.textContent = 'Best fix: book a chat with her.';
  } else {
    triviaMsg.textContent = 'Fresh start, then?';
    triviaSub.textContent = "Scroll back up. There's a lot of good stuff here.";
  }
}

function restartTrivia() {
  triviaIdx = 0; triviaScore = 0;
  triviaGameEl.classList.remove('hide');
  triviaResultEl.classList.remove('show');
  renderTrivia();
}

if (triviaQText) {
  renderTrivia();
  document.getElementById('trivia-restart').addEventListener('click', restartTrivia);
}

/* ════════════════════════════════════════════════════════════════
   TERMINAL
════════════════════════════════════════════════════════════════ */
const termBody  = document.getElementById('terminal-body');
const termInput = document.getElementById('terminal-input');

const COMMANDS = {
  help: () => [
    { cls: 'muted',  t: 'Available commands:' },
    { cls: 'accent', t: '  about     who is Sharlena?' },
    { cls: 'accent', t: '  projects  things she has built' },
    { cls: 'accent', t: '  skills    the toolbox' },
    { cls: 'accent', t: '  resume    open her resume' },
    { cls: 'accent', t: '  cats      the important stuff' },
    { cls: 'accent', t: '  travel    where has she been?' },
    { cls: 'accent', t: '  hobbies   life outside the terminal' },
    { cls: 'accent', t: '  hire      let\'s talk' },
    { cls: 'accent', t: '  clear     clear screen' },
    { t: '' },
  ],
  about: () => [
    { t: 'Sharlena Luyen' },
    { t: 'Backend & AI engineer. 5+ years in Go, Rails, TypeScript, & Java.' },
    { t: 'Previously: HashiCorp, Stride Consulting, Optum.' },
    { t: 'Now: building AI agents for small businesses & nonprofits.' },
    { cls: 'muted', t: 'Also: 8+ year CASA volunteer, runner, cat mom, traveler.' },
    { t: '' },
  ],
  projects: () => [
    { cls: 'success', t: '✓  Google Workspace MCP servers (Gmail, Calendar, Drive, Docs/Sheets/Slides)' },
    { cls: 'success', t: '✓  Leads dashboard: Gmail-synced outreach, Claude-drafted follow-ups' },
    { cls: 'success', t: '✓  Dodgers & LAFC win alerts (Workers + self-hosted ntfy)' },
    { cls: 'success', t: '✓  AI agents for SMBs & nonprofits (human-in-the-loop, self-updating evals)' },
    { cls: 'success', t: '✓  SCIM provisioning for HashiCorp Cloud Platform (Go)' },
    { cls: 'success', t: '✓  Remote MCP server about her candidacy (live)' },
    { cls: 'success', t: '✓  Clippy RAG agent: click the paperclip, bottom-right' },
    { cls: 'muted',   t: '△  Momo, a marketing agent (in progress)' },
    { t: '' },
  ],
  skills: () => [
    { t: 'backend   Go, Ruby on Rails, Java, Python, Node' },
    { t: 'frontend  TypeScript, React' },
    { t: 'ai        LLMs, RAG, MCP, tool calling, evals' },
    { t: 'data      Postgres, MySQL, River Queue' },
    { t: 'infra     AWS, Azure, GCP, Docker, Kubernetes, Terraform' },
    { t: '' },
  ],
  resume: () => {
    window.open('https://bit.ly/sharresume', '_blank', 'noopener');
    return [{ cls: 'success', t: '→  Opening bit.ly/sharresume' }, { t: '' }];
  },
  cats: () => [
    { cls: 'rose',  t: '🐈  Bumbum: chief chaos officer' },
    { cls: 'rose',  t: '🐈  Dodo: head of nap strategy' },
    { cls: 'muted', t: '    Both unavailable for comment.' },
    { t: '' },
  ],
  travel: () => [
    { t: 'EUROPE: UK, Scotland, Ireland, Isle of Man, France, Belgium,' },
    { t: '        Netherlands, Germany, Spain, Italy, Switzerland' },
    { t: 'CARIBBEAN: Bahamas, Turks & Caicos, Puerto Rico, Anguilla,' },
    { t: '        St. Martin, St. Kitts, Antigua, St. Lucia, Barbados' },
    { t: 'AMERICAS: Mexico, Guatemala, Belize, Costa Rica, Peru, Canada' },
    { t: 'ASIA: Japan, South Korea, Taiwan, Vietnam, Philippines, India, Indonesia' },
    { t: 'PACIFIC: Australia, Fiji, Tonga, French Polynesia' },
    { cls: 'muted', t: `That's ${travelData.length}. Next target: New Zealand.` },
    { t: '' },
  ],
  hobbies: () => [
    { t: 'Photography  candid moments, real ones' },
    { t: 'Travel       always planning the next trip' },
    { t: 'Gymnastics   perfecting back handsprings' },
    { t: 'Running      training for a marathon (slowly)' },
    { t: 'Baking       ice cream cakes. Good, not pretty.' },
    { t: '' },
  ],
  hire: () => [
    { cls: 'success', t: '→  calendly.com/sharlena/personal-meeting' },
    { cls: 'success', t: '→  linkedin.com/in/sharlenaluyen' },
    { cls: 'muted',   t: '   She replies fast.' },
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
  const prompt = document.createElement('span');
  prompt.className = 't-prompt';
  prompt.textContent = '$ ';
  div.append(prompt, document.createTextNode(val));
  termBody.appendChild(div);
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
    termPrint(cmd ? cmd() : [{ cls: 'muted', t: `command not found: ${val}. Try "help".` }, { t: '' }]);
  });
}
