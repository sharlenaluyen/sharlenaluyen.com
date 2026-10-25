/*
 * Clippy portfolio agent: a self-injecting chat widget.
 * Add to any page:  <script src="/js/clippy-agent.js" defer></script>
 *
 * If the page already has the Clippy from posthog.html (#clippyChar), clicking him opens the
 * chat. Otherwise this script draws its own Clippy in the bottom-right corner.
 * Questions go to the Cloudflare Worker in /clippy_agent, which holds the API key.
 */
(function () {
  var ENDPOINT = window.CLIPPY_ENDPOINT || "https://clippy-agent.sharlenatluyen.workers.dev/chat";
  var MAX_HISTORY = 10;
  var SUGGESTIONS = ["What is she up to right now?", "Has she built anything agents use?", "How can I reach her?"];

  var history = [];
  var busy = false;

  var css = [
    ".sc-panel{position:fixed;left:24px;bottom:120px;width:min(340px,calc(100vw - 48px));max-height:70vh;display:none;flex-direction:column;background:#fff;color:#1a1a1a;border:2.5px solid #1a1a1a;border-radius:14px;box-shadow:4px 4px 0 #1a1a1a;font:14px/1.5 'Fredoka',system-ui,sans-serif;z-index:900}",
    ".sc-panel.open{display:flex}",
    ".sc-head{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#F9BD2B;border-radius:11px 11px 0 0;font-weight:600}",
    ".sc-close{background:none;border:0;font-size:16px;cursor:pointer;color:#1a1a1a}",
    ".sc-log{flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:8px;min-height:120px}",
    ".sc-msg{padding:8px 12px;border-radius:12px;max-width:88%;white-space:pre-wrap;word-wrap:break-word}",
    ".sc-msg.bot{background:#f2f2f2;align-self:flex-start}",
    ".sc-msg.me{background:#F9BD2B;align-self:flex-end}",
    ".sc-msg.err{background:#ffe5e0;align-self:flex-start}",
    ".sc-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 8px}",
    ".sc-chip{background:#fff;border:1.5px solid #1a1a1a;border-radius:100px;padding:3px 10px;font:inherit;font-size:12px;cursor:pointer}",
    ".sc-chip:hover{background:#F9BD2B}",
    ".sc-form{display:flex;gap:6px;padding:10px 14px;border-top:1.5px solid #e5e5e5}",
    ".sc-input{flex:1;border:2px solid #1a1a1a;border-radius:8px;padding:6px 10px;font:inherit;min-width:0}",
    ".sc-send{background:#F9BD2B;border:2px solid #1a1a1a;border-radius:8px;padding:6px 12px;font:inherit;font-weight:600;cursor:pointer}",
    ".sc-send:disabled{opacity:.5;cursor:default}",
    ".sc-own{position:fixed;right:24px;bottom:24px;width:46px;height:60px;cursor:pointer;z-index:900;border:0;background:none;padding:0}",
    ".sc-own .o{position:absolute;inset:0;background:linear-gradient(145deg,#D8D8E2,#B8B8C8);border:4px solid #9898A8;border-radius:24px 24px 9px 9px}",
    ".sc-own .i{position:absolute;top:17px;left:8px;right:8px;bottom:6px;border:3.5px solid #9898A8;border-radius:15px 15px 5px 5px}",
    ".sc-own .e{position:absolute;top:8px;width:5px;height:9px;background:#2a2a2a;border-radius:50%}",
    ".sc-own .e.l{left:14px}.sc-own .e.r{right:14px}",
  ].join("");

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function build() {
    var style = el("style");
    style.textContent = css;
    document.head.appendChild(style);

    var panel = el("div", "sc-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Ask Clippy about Sharlena");
    var head = el("div", "sc-head");
    head.appendChild(el("span", "", "Ask Clippy about Sharlena"));
    var close = el("button", "sc-close", "✕");
    close.setAttribute("aria-label", "Close chat");
    head.appendChild(close);
    var log = el("div", "sc-log");
    var chips = el("div", "sc-chips");
    var form = el("form", "sc-form");
    var input = el("input", "sc-input");
    input.type = "text";
    input.maxLength = 500;
    input.placeholder = "Ask anything about her work…";
    input.setAttribute("aria-label", "Your question");
    var send = el("button", "sc-send", "Ask");
    send.type = "submit";
    form.appendChild(input);
    form.appendChild(send);
    panel.appendChild(head);
    panel.appendChild(log);
    panel.appendChild(chips);
    panel.appendChild(form);
    document.body.appendChild(panel);

    function add(cls, text) {
      var m = el("div", "sc-msg " + cls, text);
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;
      return m;
    }

    function ask(question) {
      question = question.trim();
      if (!question || busy) return;
      busy = true;
      send.disabled = true;
      chips.style.display = "none";
      add("me", question);
      history.push({ role: "user", content: question });
      var thinking = add("bot", "…");

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-MAX_HISTORY) }),
      })
        .then(function (r) {
          return r.json().then(function (j) {
            if (!r.ok) throw new Error(j.error || "Request failed");
            return j;
          });
        })
        .then(function (j) {
          thinking.textContent = j.reply;
          history.push({ role: "assistant", content: j.reply });
        })
        .catch(function (e) {
          thinking.className = "sc-msg err";
          thinking.textContent = e.message || "Clippy is taking a break. Try again in a moment.";
          history.pop(); // drop the unanswered question so the history stays user/assistant-alternating
        })
        .then(function () {
          busy = false;
          send.disabled = false;
          input.focus();
        });
    }

    SUGGESTIONS.forEach(function (s) {
      var c = el("button", "sc-chip", s);
      c.type = "button";
      c.addEventListener("click", function () { ask(s); });
      chips.appendChild(c);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value;
      input.value = "";
      ask(q);
    });
    close.addEventListener("click", function () { panel.classList.remove("open"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") panel.classList.remove("open");
    });

    add("bot", "Hi! It looks like you're learning about Sharlena. Would you like help with that?");

    return function toggle() {
      panel.classList.toggle("open");
      if (panel.classList.contains("open")) input.focus();
    };
  }

  function init() {
    var toggle = build();
    var existing = document.getElementById("clippyChar");
    if (existing) {
      existing.addEventListener("click", toggle);
      return;
    }
    var own = el("button", "sc-own");
    own.setAttribute("aria-label", "Ask Clippy about Sharlena");
    ["o", "i", "e l", "e r"].forEach(function (c) { own.appendChild(el("div", c)); });
    own.addEventListener("click", toggle);
    document.body.appendChild(own);
    // Keep the chat panel on the same side as the Clippy we drew.
    var p = document.querySelector(".sc-panel");
    p.style.left = "auto";
    p.style.right = "24px";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
