// Red Pen: the page. Rules live in engine.js, words in content.js.
import { ROUNDS, METERS, ROW_COLUMNS, START } from "./content.js";
import * as E from "./engine.js";
import { SHEET_URL } from "./config.js";

const KEY = "redpen-v1";
const app = document.getElementById("app");
const params = new URLSearchParams(location.search);
const sheetUrl = safeUrl(params.get("sheet")) || SHEET_URL;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

let s = load() || E.newState(params.get("pair") || "");
let lastResult = null; // the choose() result for the outcome screen
let fresh = new Set(); // evidence opened since the last render, for the pen animation

function safeUrl(u) {
  try {
    const url = new URL(u);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const st = raw && JSON.parse(raw);
    return st && st.v === 1 ? st : null;
  } catch {
    return null;
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode: the game still plays, it just won't survive a reload */
  }
}

const esc = (t) =>
  String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function h(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content;
}

// ---------- chrome: months, hours, meters ----------

function renderChrome() {
  const months = document.getElementById("months");
  months.innerHTML = ROUNDS.map((r, i) => {
    const state =
      s.phase === "end" || i < s.round || (i === s.round && s.phase === "outcome")
        ? "done"
        : i === s.round && s.phase !== "intro"
          ? "now"
          : "later";
    return `<li class="m-${state}" ${state === "now" ? 'aria-current="step"' : ""}>
      <span class="m-month">${r.month.slice(0, 3)}</span><span class="m-dec">${r.decision}</span></li>`;
  }).join("");

  const hours = document.getElementById("hours");
  const pips = Array.from({ length: START.hours }, (_, i) =>
    `<span class="pip ${i < s.hours ? "on" : ""}"></span>`).join("");
  hours.innerHTML = `<span class="pips" aria-hidden="true">${pips}</span>
    <span class="hours-label"><b>${s.hours}</b> ${s.hours === 1 ? "hour" : "hours"} of due diligence left</span>`;

  const meters = document.getElementById("meters");
  meters.hidden = s.phase === "intro";
  meters.innerHTML = METERS.map((m) => {
    const sealed = m.hidden && s.phase !== "end";
    if (sealed) {
      return `<div class="meter sealed"><span class="meter-name">${m.label}</span>
        <span class="seal">Sealed until December</span></div>`;
    }
    const v = s.m[m.key];
    const bad = m.key === "exp";
    return `<div class="meter ${bad ? "inverse" : ""}" style="--v:${v}">
      <span class="meter-name">${m.label}</span>
      <span class="meter-track"><span class="meter-fill"></span></span>
      <span class="meter-val">${v}</span></div>`;
  }).join("");
}

// ---------- screens ----------

function render(focus = true) {
  renderChrome();
  app.innerHTML = "";
  if (s.phase === "intro") app.append(introView());
  else if (s.phase === "end") app.append(endView());
  else app.append(roundView());
  fresh.clear();
  save();
  if (focus) {
    const target = app.querySelector("[data-focus]") || app;
    target.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }
}

function introView() {
  const frag = h(`
    <section class="intro">
      <div class="intro-title">
        <h1 tabindex="-1" data-focus>Red Pen</h1>
        <p class="intro-sub">One year of AI pitches at Three Rivers Health</p>
      </div>
      <article class="memo letter">
        <p class="memo-from">From: Dana Whitlock, Chief Human Resources Officer<br>To: our new Director of People Analytics</p>
        <p>Welcome. You know us from the hiring side: 14,000 employees, six hospitals, and nursing turnover of 19% a year. Now you run the team.</p>
        <p>Over the next year five AI vendors will pitch you, one at a time. Each pitch has an executive behind it who wants a yes. You decide whether we buy, how we use it, or whether we walk away.</p>
      </article>
      <ul class="rules">
        <li><b>You have 8 hours of due diligence for the whole year.</b> Each question you put to a vendor costs one hour, so you cannot check everything. Choose where to look.</li>
        <li><b>Three meters are on your dashboard.</b> A fourth, Legal exposure, is sealed until December.</li>
        <li><b>Some options only appear once you know enough to ask for them.</b></li>
      </ul>
      <form class="start" id="start">
        <label for="pair">Pair number <span class="muted">(from the board)</span></label>
        <input id="pair" name="pair" inputmode="numeric" autocomplete="off" maxlength="4" value="${esc(s.pair)}">
        <button class="btn primary" type="submit">Start the year</button>
      </form>
      <p class="muted small">Play in pairs and talk before you sign. It takes about 20 minutes.</p>
    </section>`);
  frag.getElementById("start").addEventListener("submit", (ev) => {
    ev.preventDefault();
    s.pair = new FormData(ev.target).get("pair").toString().trim();
    s.phase = "round";
    render();
  });
  return frag;
}

function marksFor(round) {
  const marks = {};
  for (const e of round.evidence) {
    if (!s.opened.includes(e.id)) continue;
    for (const m of e.marks || []) (marks[m.claim] ||= []).push({ ...m, fresh: fresh.has(e.id) });
  }
  return marks;
}

function pitchHtml(round) {
  const v = round.vendor;
  const marks = marksFor(round);
  const claims = v.claims.map((c) => {
    const ms = marks[c.id] || [];
    const struck = ms.length > 0;
    const anim = ms.some((m) => m.fresh) && !reduceMotion ? "draw" : "";
    return `<li class="claim ${struck ? "struck" : ""} ${anim}">
      <span class="claim-text">${esc(c.text)}</span>
      ${ms.map((m) => `<span class="pen-note ${m.fresh && !reduceMotion ? "draw" : ""}">${esc(m.note)}</span>`).join("")}
    </li>`;
  }).join("");
  return `<article class="pitch" aria-label="${esc(v.name)} pitch">
      <div class="pitch-top"><span class="pitch-logo">${esc(v.name)}</span><span class="pitch-price">${esc(v.price)}</span></div>
      <p class="pitch-tag">${esc(v.tagline)}</p>
      <ul class="claims">${claims}</ul>
      <p class="pitch-product">${esc(v.product)}</p>
    </article>`;
}

function docHtml(e) {
  const task = e.task;
  let taskHtml = "";
  if (task) {
    const answered = s.answers[task.id];
    const hasAnswer = answered !== null && answered !== undefined;
    const ok = hasAnswer && Math.abs(answered - task.answer) <= task.tolerance;
    taskHtml = `<form class="task" data-task="${e.id}">
        <label for="t-${task.id}">${esc(task.prompt)}</label>
        <div class="task-row">
          <input id="t-${task.id}" name="v" inputmode="decimal" autocomplete="off" placeholder="${esc(task.placeholder)}" value="${hasAnswer ? esc(answered) : ""}">
          <button class="btn" type="submit">Check</button>
        </div>
        <p class="task-fb ${hasAnswer ? (ok ? "ok" : "no") : ""}" aria-live="polite">${hasAnswer ? esc(ok ? task.right : task.wrong) : ""}</p>
      </form>`;
  }
  return `<article class="doc ${fresh.has(e.id) && !reduceMotion ? "arrive" : ""}" id="doc-${e.id}">
      <h3>${esc(e.doc.title)}</h3>
      <div class="doc-body">${e.doc.html}</div>
      ${taskHtml}
    </article>`;
}

function roundView() {
  const r = ROUNDS[s.round];
  const outcome = s.phase === "outcome";
  const ev = r.evidence.map((e) => {
    const opened = s.opened.includes(e.id);
    const disabled = opened || s.hours === 0 || outcome;
    return `<li><button type="button" class="ask ${opened ? "opened" : ""}" data-ev="${e.id}" ${disabled ? "disabled" : ""}>
        <span class="ask-label">${esc(e.label)}</span>
        <span class="ask-cost">${opened ? "Opened" : "1 hour"}</span></button></li>`;
  }).join("");
  const docs = r.evidence.filter((e) => s.opened.includes(e.id)).map(docHtml).join("");
  const anyLeft = r.evidence.some((e) => !s.opened.includes(e.id));

  const frag = h(`
    <section class="round">
      <div class="round-head">
        <p class="kicker">${r.month}, decision ${r.n} of ${ROUNDS.length}: ${r.decision}</p>
        <h1 tabindex="-1" ${outcome ? "" : "data-focus"}>${esc(r.title)}</h1>
      </div>
      <div class="grid">
        <div class="col">
          <article class="memo">
            <p class="memo-from">From: ${esc(r.memo.from)}</p>
            ${r.memo.text.map((p) => `<p>${esc(p)}</p>`).join("")}
          </article>
          ${pitchHtml(r)}
        </div>
        <div class="col">
          <section class="diligence" aria-labelledby="dd">
            <h2 id="dd">Due diligence</h2>
            <p class="muted small">${s.hours === 0 && anyLeft && !outcome ? "You are out of hours for the year. Decide on what you know." : "Each question costs one hour from your year."}</p>
            <ul class="asks">${ev}</ul>
          </section>
          <div class="docs">${docs || `<p class="empty">Nothing on your desk yet but the pitch.</p>`}</div>
        </div>
      </div>
      ${outcome ? outcomeHtml(r) : decideHtml(r)}
    </section>`);

  frag.querySelectorAll("[data-ev]").forEach((b) =>
    b.addEventListener("click", () => {
      if (E.openEvidence(s, b.dataset.ev)) {
        fresh.add(b.dataset.ev);
        const keepY = window.scrollY;
        render(false);
        window.scrollTo(0, keepY);
        const doc = document.getElementById(`doc-${b.dataset.ev}`);
        doc?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
      }
    }));

  frag.querySelectorAll("form.task").forEach((f) =>
    f.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const e = r.evidence.find((x) => x.id === f.dataset.task);
      const res = E.answerTask(s, e.task, f.elements.v.value);
      const fb = f.querySelector(".task-fb");
      if (res === null) {
        fb.className = "task-fb no";
        fb.textContent = "Type a number.";
        return;
      }
      fb.className = `task-fb ${res ? "ok" : "no"}`;
      fb.textContent = res ? e.task.right : e.task.wrong;
      save();
    }));

  const form = frag.querySelector("form.decide");
  if (form) {
    form.addEventListener("change", () => {
      form.querySelector("button[type=submit]").disabled = !form.elements.opt.value;
    });
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const id = form.elements.opt.value;
      if (!id) return;
      lastResult = E.choose(s, id);
      render(false);
      const out = document.querySelector(".outcome");
      out?.focus({ preventScroll: true });
      out?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }
  frag.querySelector("[data-next]")?.addEventListener("click", () => {
    E.advance(s);
    lastResult = null;
    render();
  });
  return frag;
}

function decideHtml(r) {
  const opts = r.options.map((o) => {
    if (!E.optionAvailable(s, o)) {
      return `<li class="opt locked" aria-label="Locked option">
          <span class="redact" aria-hidden="true"></span><span class="redact short" aria-hidden="true"></span>
          <span class="locked-note">Another option opens if you know what to ask.</span></li>`;
    }
    return `<li class="opt"><label>
        <input type="radio" name="opt" value="${o.id}">
        <span class="opt-body"><span class="opt-label">${esc(o.label)}</span><span class="opt-detail">${esc(o.detail)}</span></span>
      </label></li>`;
  }).join("");
  return `<form class="decide" aria-labelledby="yc">
      <h2 id="yc">Your call</h2>
      <ul class="opts">${opts}</ul>
      <button class="btn primary sign" type="submit" disabled>Sign off on this</button>
    </form>`;
}

function deltaChips(fx) {
  return METERS.filter((m) => !m.hidden).map((m) => {
    const d = fx[m.key] || 0;
    const cls = d > 0 ? "up" : d < 0 ? "down" : "flat";
    return `<span class="chip ${cls}">${m.label} ${d > 0 ? "+" : d < 0 ? "−" : "±"}${Math.abs(d)}</span>`;
  }).join("") + `<span class="chip sealed-chip">Legal exposure: sealed</span>`;
}

function outcomeHtml(r) {
  const o = r.options.find((x) => x.id === s.choices[r.id]);
  const last = s.round === ROUNDS.length - 1;
  return `<section class="outcome" tabindex="-1" aria-labelledby="oc">
      <p class="kicker">You chose: ${esc(o.label)}</p>
      <h2 id="oc">What happened next</h2>
      <p class="outcome-text">${esc(o.outcome)}</p>
      <div class="chips">${deltaChips(o.fx)}</div>
      <button class="btn primary" type="button" data-next>${last ? "Close out the year" : `On to ${ROUNDS[s.round + 1].month}`}</button>
    </section>`;
}

function endView() {
  const type = E.archetype(s);
  const used = START.hours - s.hours;
  const total = ROUNDS.reduce((n, r) => n + r.evidence.length, 0);
  const row = E.resultRow(s);
  const events = s.events.length
    ? s.events.map((e) => `<li class="event ${e.tone}"><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p></li>`).join("")
    : `<li class="event good"><h3>A quiet December</h3><p>Nothing you signed came back to bite you this year.</p></li>`;

  const ledger = ROUNDS.map((r) => {
    const entry = s.log.find((l) => l.round === r.id);
    const o = r.options.find((x) => x.id === entry?.option);
    const cell = (k) => {
      const d = entry?.fx[k] || 0;
      return `<td class="${d > 0 ? (k === "exp" ? "bad" : "good") : d < 0 ? (k === "exp" ? "good" : "bad") : ""}">${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d) || "0"}</td>`;
    };
    return `<tr><th scope="row">${r.decision}<span class="muted"> ${esc(o?.label || "")}</span></th>${["eff", "qual", "trust", "exp"].map(cell).join("")}</tr>`;
  }).join("");

  const sumEvents = (k) => s.events.reduce((n, e) => n + (e.fx[k] || 0), 0);
  const signed = (d, k) => `<td class="${d > 0 ? (k === "exp" ? "bad" : "good") : d < 0 ? (k === "exp" ? "good" : "bad") : ""}">${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d)}</td>`;
  const keys = ["eff", "qual", "trust", "exp"];
  const ledgerRows =
    `<tr class="base"><th scope="row">Where you started</th>${keys.map((k) => `<td>${START[k]}</td>`).join("")}</tr>` +
    ledger +
    `<tr><th scope="row">December<span class="muted"> The events above</span></th>${keys.map((k) => signed(sumEvents(k), k)).join("")}</tr>` +
    `<tr class="total"><th scope="row">Where you finished</th>${keys.map((k) => `<td>${s.m[k]}</td>`).join("")}</tr>`;

  const real = ROUNDS.map((r) => `<details>
      <summary>${r.decision}: ${esc(r.title)}</summary>
      <ul>${r.real.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></details>`).join("");

  const frag = h(`
    <section class="end">
      <div class="round-head">
        <p class="kicker">December</p>
        <h1 tabindex="-1" data-focus>The year in review</h1>
      </div>
      <ul class="events">${events}</ul>

      <section class="verdict">
        <div class="unseal ${reduceMotion ? "" : "animate"}">
          <span class="unseal-label">Legal exposure, unsealed</span>
          <span class="unseal-val">${s.m.exp}</span>
          <span class="muted small">out of 100. Lower is better.</span>
        </div>
        <div class="type">
          <p class="kicker">Your year</p>
          <h2>${esc(type.name)}</h2>
          <p>${esc(type.text)}</p>
          <p class="overall"><b>${s.overall}</b> overall <span class="muted small">(average of efficiency, quality, trust, and 100 minus exposure)</span></p>
          <p class="muted small">You used ${used} of ${START.hours} hours and opened ${s.opened.length} of ${total} documents.</p>
        </div>
      </section>

      <section class="ledger">
        <h2>Where it came from</h2>
        <table>
          <thead><tr><th></th><th>Efficiency</th><th>Quality</th><th>Trust</th><th>Exposure</th></tr></thead>
          <tbody>${ledgerRows}</tbody>
        </table>
        <p class="muted small">Meters stop at 0 and 100, so the columns may not add up exactly.</p>
      </section>

      <section class="report">
        <h2>Report your year</h2>
        <p>Copy your row and paste it into <b>row ${esc(s.pair || "?")}</b> of the class sheet, in the first column.</p>
        <div class="row-preview" role="group" aria-label="Your results row">
          ${ROW_COLUMNS.map((c, i) => `<span><small>${esc(c)}</small>${esc(row[i]) || "&nbsp;"}</span>`).join("")}
        </div>
        <div class="report-actions">
          <button class="btn primary" type="button" id="copy">Copy my row</button>
          ${sheetUrl ? `<a class="btn" href="${esc(sheetUrl)}" target="_blank" rel="noopener">Open the class sheet</a>` : ""}
          <span class="copy-fb" aria-live="polite"></span>
        </div>
      </section>

      <section class="real">
        <h2>What really happened</h2>
        ${real}
      </section>
    </section>`);

  frag.getElementById("copy").addEventListener("click", async (ev) => {
    const fb = ev.target.parentElement.querySelector(".copy-fb");
    const tsv = row.join("\t");
    try {
      await navigator.clipboard.writeText(tsv);
      fb.textContent = "Copied. Click column A of your row in the sheet and paste.";
    } catch {
      fb.textContent = "Your browser blocked copying. Select the row above and copy it by hand.";
    }
  });
  return frag;
}

document.getElementById("restart").addEventListener("click", () => {
  if (s.phase !== "intro" && !window.confirmRestart) {
    window.confirmRestart = true;
    const b = document.getElementById("restart");
    b.textContent = "Click again to erase this year";
    setTimeout(() => {
      window.confirmRestart = false;
      b.textContent = "Start over";
    }, 4000);
    return;
  }
  window.confirmRestart = false;
  document.getElementById("restart").textContent = "Start over";
  const pair = s.pair;
  s = E.newState(pair);
  render();
});

render(false);
