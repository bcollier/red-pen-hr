// Game rules with no DOM, so tests can drive a whole year in Node.
import { START, ROUNDS, EVENTS, ARCHETYPES, ROW_COLUMNS } from "./content.js";

const clamp = (v) => Math.max(0, Math.min(100, v));

export function newState(pair = "") {
  return {
    v: 1,
    pair: String(pair).trim(),
    round: 0,
    phase: "intro", // intro | round | outcome | end
    hours: START.hours,
    m: { eff: START.eff, qual: START.qual, trust: START.trust, exp: START.exp },
    opened: [],
    answers: { ir: null, base: null },
    choices: {},
    flags: [],
    log: [],
    events: [],
    overall: null,
    type: null,
  };
}

export function canOpen(s, evidenceId) {
  return s.hours > 0 && !s.opened.includes(evidenceId);
}

export function openEvidence(s, evidenceId) {
  if (!canOpen(s, evidenceId)) return false;
  s.hours -= 1;
  s.opened.push(evidenceId);
  return true;
}

export function answerTask(s, task, raw) {
  let value = parseFloat(String(raw).replace(/[%\s,]/g, ""));
  if (Number.isNaN(value)) return null;
  // Someone who types 72 for a ratio of 0.72 has the idea; read it as a percent.
  if (task.answer < 1 && value > 1 && value <= 100) value /= 100;
  const correct = Math.abs(value - task.answer) <= task.tolerance;
  s.answers[task.id] = value;
  return correct;
}

export function optionAvailable(s, option) {
  return !option.requires || s.opened.includes(option.requires);
}

function apply(s, fx) {
  for (const [k, d] of Object.entries(fx)) s.m[k] = clamp(s.m[k] + d);
}

export function choose(s, optionId) {
  const round = ROUNDS[s.round];
  const option = round.options.find((o) => o.id === optionId);
  if (!option || !optionAvailable(s, option)) return null;
  const before = { ...s.m };
  apply(s, option.fx);
  s.choices[round.id] = option.id;
  s.flags.push(option.flag);
  s.log.push({ round: round.id, option: option.id, fx: option.fx });
  s.phase = "outcome";
  return { option, before, after: { ...s.m } };
}

export function advance(s) {
  if (s.round < ROUNDS.length - 1) {
    s.round += 1;
    s.phase = "round";
  } else {
    finish(s);
  }
}

export function finish(s) {
  if (s.phase === "end") return;
  s.events = [];
  for (const e of EVENTS) {
    if (!e.test(s)) continue;
    const fx = e.fx(s);
    apply(s, fx);
    s.events.push({ id: e.id, tone: e.tone, title: e.title, text: e.text(s), fx });
  }
  s.overall = Math.round((s.m.eff + s.m.qual + s.m.trust + (100 - s.m.exp)) / 4);
  s.type = ARCHETYPES.find((a) => a.test(s)).id;
  s.phase = "end";
}

export function archetype(s) {
  return ARCHETYPES.find((a) => a.id === s.type);
}

export function resultRow(s) {
  const fmt = (v) => (v === null || v === undefined ? "" : String(v));
  const values = [
    s.pair,
    ...ROUNDS.map((r) => s.choices[r.id] || ""),
    START.hours - s.hours,
    s.opened.join(" "),
    s.m.eff, s.m.qual, s.m.trust, s.m.exp,
    s.overall,
    archetype(s)?.name || "",
    fmt(s.answers.ir),
    fmt(s.answers.base),
  ];
  if (values.length !== ROW_COLUMNS.length) throw new Error("row/column mismatch");
  return values;
}
