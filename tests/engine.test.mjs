// Plays every combination of decisions (with and without evidence) and checks
// the rules hold. Run: node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import { ROUNDS, ROW_COLUMNS, ARCHETYPES } from "../js/content.js";
import * as E from "../js/engine.js";

function play(choiceIds, openPlan) {
  const s = E.newState("7");
  s.phase = "round";
  for (let i = 0; i < ROUNDS.length; i++) {
    for (const id of openPlan(ROUNDS[i])) E.openEvidence(s, id);
    const res = E.choose(s, choiceIds[i]);
    if (!res) return null; // locked option
    E.advance(s);
  }
  return s;
}

function* allPaths() {
  const lists = ROUNDS.map((r) => r.options.map((o) => o.id));
  const rec = function* (i, acc) {
    if (i === lists.length) return yield acc;
    for (const id of lists[i]) yield* rec(i + 1, [...acc, id]);
  };
  yield* rec(0, []);
}

const plans = {
  none: () => [],
  unlocks: (r) => r.evidence.filter((e) => e.unlocks).map((e) => e.id),
  greedy: (r) => r.evidence.map((e) => e.id),
};

test("every path finishes with sane numbers", () => {
  const types = {};
  let min = 101, max = -1, n = 0;
  for (const path of allPaths()) {
    for (const plan of Object.values(plans)) {
      const s = play(path, plan);
      if (!s) continue;
      n++;
      assert.equal(s.phase, "end");
      for (const v of Object.values(s.m)) assert.ok(v >= 0 && v <= 100);
      assert.ok(s.hours >= 0 && s.hours <= 8);
      const row = E.resultRow(s);
      assert.equal(row.length, ROW_COLUMNS.length);
      types[s.type] = (types[s.type] || 0) + 1;
      min = Math.min(min, s.overall);
      max = Math.max(max, s.overall);
    }
  }
  console.log({ n, min, max, types });
  for (const a of ARCHETYPES) assert.ok(types[a.id] > 0, `archetype ${a.id} reachable`);
  assert.ok(max - min >= 40, "scores spread enough to discuss");
});

test("locked options need their evidence", () => {
  const s = E.newState();
  s.phase = "round";
  assert.equal(E.choose(s, "C"), null);
  E.openEvidence(s, "1b");
  assert.ok(E.choose(s, "C"));
});

test("hours run out at eight", () => {
  const s = E.newState();
  const all = ROUNDS.flatMap((r) => r.evidence.map((e) => e.id));
  assert.equal(all.filter((id) => E.openEvidence(s, id)).length, 8);
  assert.equal(s.hours, 0);
});

test("the careful path beats the fast path", () => {
  const fast = play(["A", "A", "A", "A", "A"], plans.none);
  const careful = play(["C", "B", "C", "B", "B"], plans.unlocks);
  const skeptic = play(["E", "D", "C", "D", "D"], plans.none);
  console.log("fast", fast.m, fast.overall, fast.type);
  console.log("careful", careful.m, careful.overall, careful.type);
  console.log("skeptic", skeptic.m, skeptic.overall, skeptic.type);
  assert.equal(fast.type, "fast");
  assert.ok(careful.overall > skeptic.overall);
  assert.ok(skeptic.overall > fast.overall);
});

test("task answers accept a little rounding", () => {
  const s = E.newState();
  const ir = ROUNDS[0].evidence[0].task;
  const base = ROUNDS[3].evidence[0].task;
  assert.equal(E.answerTask(s, ir, "0.72"), true);
  assert.equal(E.answerTask(s, ir, ".7"), true);
  assert.equal(E.answerTask(s, ir, "0.8"), false);
  assert.equal(E.answerTask(s, base, "95%"), true);
  assert.equal(E.answerTask(s, base, "94"), false);
  assert.equal(E.answerTask(s, base, "abc"), null);
});
