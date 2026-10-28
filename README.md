# Red Pen

A 20-minute browser game about buying AI for HR, written for the AI in HR and People Analytics in-class exercise in 70-445 AI for Business Leaders (Carnegie Mellon, Tepper, Fall 2026).

Play it: https://bcollier.github.io/red-pen-hr/
Debrief slides: https://bcollier.github.io/red-pen-hr/debrief.html

## The game

You are the new Director of People Analytics at Three Rivers Health, the fictional hospital system from the Session 16 Screening Room exercise. Over one year, five vendors pitch AI tools, one for each decision from the lecture plus a restructuring:

| Month | Decision | Pitch | What it teaches |
|---|---|---|---|
| January | Hire | TalentLens resume screener | Impact ratios and the four-fifths rule, proxies (graduation year, gaps, ZIP), intersectional gaps, vendor liability |
| March | Develop | PathFinder promotion recommender | The training label: predicting past decisions copies them |
| June | Watch | PulseScore productivity monitor | Measuring motion instead of work, Goodhart, individual vs team data |
| September | Predict | FlightRisk attrition model | Base rates, the confusion matrix, individual vs aggregate use |
| November | Restructure | HelpDesk Copilot and the AI-first memo | Share of tickets vs share of work, Klarna, the entry-level pipeline |

You get 8 hours of due diligence for the whole year, and each question costs one, out of 16 on offer. Evidence puts red pen on the vendor's claims, and some options only unlock once you have asked the right question. Efficiency, decision quality and employee trust are visible all year. Legal exposure stays sealed until December, when the consequences arrive.

At the end each pair copies a tab-separated results row and pastes it into the class Google Sheet. The sheet's Results tab tallies the room for the debrief.

Three Rivers Health, its people, its vendors and their numbers are invented. The "What really happened" notes and the debrief facts come from the Session 16 research brief (checked October 26, 2026).

## Files

| Path | What it is |
|---|---|
| `index.html`, `js/game.js`, `css/style.css` | The game page |
| `js/content.js` | Every word and number in the scenario: rounds, evidence, options, effects, year-end events, player types |
| `js/engine.js` | The rules, with no DOM, so tests can play whole years in Node |
| `js/config.js` | The class sheet link. A `?sheet=<https url>` on the game or debrief link overrides it |
| `debrief.html`, `css/debrief.css` | Eight projector slides, arrow keys to move |
| `tests/engine.test.mjs` | Plays every combination of decisions under three evidence strategies |

No build step and no server. Progress is kept in the browser's localStorage, so a refresh does not lose a game. "Start over" in the footer clears it.

## Running it locally

```bash
python3 -m http.server 8765
# open http://127.0.0.1:8765/
npm test   # node --test, no dependencies
```

The pages use ES modules, so open them through a server, not straight from the file system.
