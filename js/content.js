// Red Pen: all scenario content. Three Rivers Health is fictional (it is the
// employer from the Session 16 Screening Room). Every "What really happened"
// fact comes from the Session 16 research brief, checked Oct 26, 2026.

export const START = { eff: 40, qual: 50, trust: 60, exp: 10, hours: 8 };

export const METERS = [
  { key: "eff", label: "Efficiency", hint: "Time and money saved" },
  { key: "qual", label: "Decision quality", hint: "Are the calls getting better?" },
  { key: "trust", label: "Employee trust", hint: "What staff think you are doing to them" },
  { key: "exp", label: "Legal exposure", hint: "Sealed until December", hidden: true },
];

export const ROUNDS = [
  {
    id: "hire",
    n: 1,
    month: "January",
    decision: "Hire",
    title: "The resume screener",
    memo: {
      from: "Dana Whitlock, Chief Human Resources Officer",
      text: [
        "Applications per opening have doubled since 2022, and a lot of them are written by AI now. Some nursing postings get 400 applicants in a weekend. My nine recruiters cannot read them all.",
        "TalentLens ran a free pilot on 2,400 of our applicants last quarter. I would like to sign before the spring nursing-graduate rush. Your call.",
      ],
    },
    vendor: {
      name: "TalentLens",
      product: "TalentLens Screen",
      price: "$380,000 a year",
      tagline: "Every resume read. Every time.",
      claims: [
        { id: "speed", text: "Screens a resume in 4 seconds. Recruiter screening time down 80%." },
        { id: "fit", text: "Trained on your own top performers, so it finds more people like them." },
        { id: "fair", text: "Bias-free by design. It never sees names, photos, or birthdates." },
      ],
    },
    evidence: [
      {
        id: "1a",
        label: "Ask for the pilot's selection rates by group",
        doc: {
          title: "TalentLens pilot, 2,400 Three Rivers applicants",
          html: `<table class="data">
            <thead><tr><th>Group</th><th>Applied</th><th>Advanced to recruiter</th><th>Selection rate</th></tr></thead>
            <tbody>
              <tr><td>Under 40</td><td>1,600</td><td>480</td><td>30.0%</td></tr>
              <tr><td>40 and over</td><td>800</td><td>173</td><td>21.6%</td></tr>
              <tr class="gap"><td colspan="4"></td></tr>
              <tr><td>Men</td><td>900</td><td>243</td><td>27.0%</td></tr>
              <tr><td>Women</td><td>1,500</td><td>410</td><td>27.3%</td></tr>
            </tbody></table>
            <p class="fine">The impact ratio is a group's selection rate divided by the rate of the group with the highest rate. Under the federal four-fifths rule (1978), a ratio below 0.80 is generally treated as evidence of adverse impact.</p>`,
        },
        task: {
          id: "ir",
          prompt: "What is the impact ratio for applicants 40 and over?",
          placeholder: "e.g. 0.85",
          answer: 0.72,
          tolerance: 0.025,
          right: "Right: 21.6% ÷ 30.0% = 0.72. That is below 0.80, so it fails the four-fifths rule. Men vs women is 27.0 ÷ 27.3 = 0.99, which passes.",
          wrong: "Not quite. Divide the lower rate by the higher one: 21.6% ÷ 30.0% = 0.72. Below 0.80 fails the four-fifths rule.",
        },
        marks: [{ claim: "fair", note: "Over-40s get through far less often. Do the math." }],
      },
      {
        id: "1b",
        label: "Ask what the model weighs most",
        doc: {
          title: "TalentLens: top five model features (vendor disclosure)",
          html: `<ol class="feat">
            <li><b>Years since graduation</b><span class="pen">= age, give or take 22 years</span></li>
            <li><b>Employment gaps over 6 months</b><span class="pen">caregivers, illness, military spouses</span></li>
            <li><b>Home ZIP code</b> (distance to campus)<span class="pen">a proxy for race and income</span></li>
            <li><b>Keyword overlap with the posting</b><span class="pen">rewards AI-written resumes</span></li>
            <li><b>Prior employer "tier"</b></li></ol>
            <p class="fine">Illinois has barred ZIP codes as proxies in AI hiring decisions since January 1, 2026.</p>`,
        },
        marks: [
          { claim: "fair", note: "No birthdates. It reads graduation year." },
          { claim: "fit", note: "\"Top performers\" = whoever your managers hired, 2014 to 2024." },
        ],
        unlocks: "C",
      },
      {
        id: "1c",
        label: "Break the pilot out by age and sex together",
        doc: {
          title: "Same pilot, split four ways",
          html: `<table class="data">
            <thead><tr><th>Group</th><th>Applied</th><th>Advanced</th><th>Rate</th><th>Ratio vs top</th></tr></thead>
            <tbody>
              <tr><td>Men under 40</td><td>600</td><td>186</td><td>31.0%</td><td>1.00</td></tr>
              <tr><td>Women under 40</td><td>1,000</td><td>294</td><td>29.4%</td><td>0.95</td></tr>
              <tr><td>Women 40 and over</td><td>500</td><td>116</td><td>23.2%</td><td>0.75</td></tr>
              <tr class="hl"><td>Men 40 and over</td><td>300</td><td>57</td><td>19.0%</td><td>0.61</td></tr>
            </tbody></table>
            <p class="fine">Men vs women looked fine (0.99). The worst-treated group only shows up when you cross the two.</p>`,
        },
        marks: [{ claim: "fair", note: "Older men: 0.61. Hidden inside a 0.99." }],
      },
      {
        id: "1d",
        label: "Read the liability clause in the contract",
        doc: {
          title: "Master services agreement, section 14.2",
          html: `<blockquote>"Customer is solely responsible for compliance with all applicable employment laws. TalentLens provides recommendations only and does not make hiring decisions."</blockquote>
            <p>No right for you to audit the model. No duty for TalentLens to share its own bias testing.</p>
            <p class="fine">In Mobley v. Workday (2024), a federal court let claims go forward against Workday as the employers' "agent." California's 2025 rules also reach vendors as agents. Neither lets the employer off.</p>`,
        },
        marks: [{ claim: "speed", note: "Fast for you. Your liability, not theirs." }],
      },
    ],
    options: [
      {
        id: "A",
        label: "Sign as pitched",
        detail: "Turn it on for every posting in February.",
        fx: { eff: 22, qual: -4, trust: 0, exp: 30 },
        flag: "screen_raw",
        outcome: "Time to first screen falls from nine days to two. Recruiters love it. Nobody looks at who it turns away, because nobody can.",
      },
      {
        id: "B",
        label: "Sign with guardrails",
        detail: "A recruiter spot-checks auto-rejections every week, and an independent bias audit runs each year.",
        fx: { eff: 12, qual: 2, trust: 0, exp: 12 },
        flag: "screen_audit",
        outcome: "Faster, though the spot-check queue eats some of the savings. The first independent audit is booked for September.",
      },
      {
        id: "C",
        label: "Sign only if the proxies come out",
        detail: "TalentLens drops graduation year, gaps, and ZIP code, retrains, and accepts a yearly independent audit.",
        requires: "1b",
        fx: { eff: 14, qual: 5, trust: 1, exp: 3 },
        flag: "screen_fixed",
        outcome: "TalentLens grumbles and retrains in six weeks. On the rerun, the ratio for applicants 40 and over is 0.91.",
      },
      {
        id: "D",
        label: "Run it in shadow mode for a quarter",
        detail: "It scores everyone, but recruiters still decide. Then compare.",
        fx: { eff: 3, qual: 2, trust: 0, exp: 2 },
        flag: "screen_shadow",
        outcome: "No time saved yet. But the side-by-side shows it would have advanced over-40 applicants at about seven-tenths the rate of younger ones, and now you know before anyone was hurt.",
      },
      {
        id: "E",
        label: "Pass, and hire two more recruiters",
        detail: "Give them a written screening rubric so reviews are consistent.",
        fx: { eff: -6, qual: 4, trust: 2, exp: 0 },
        flag: "screen_none",
        outcome: "Recruiters are still underwater and nurse time-to-fill stays at 41 days. But every rejection has a person behind it.",
      },
    ],
    real: [
      "Amazon built an experimental resume screener from 2014, trained on ten years of mostly men's resumes. It learned to penalize the word \"women's\" and was scrapped by 2017 (Reuters, 2018). Amazon says recruiters never used it to evaluate candidates.",
      "iTutorGroup paid $365,000 in the EEOC's first AI-hiring settlement (2023). Its software auto-rejected women 55 and older and men 60 and older.",
      "Mobley v. Workday: in 2024 the court let the case proceed with Workday as the employers' \"agent.\" A nationwide age collective was certified in 2025. Class certification is set for a hearing on March 9, 2027.",
    ],
  },

  {
    id: "develop",
    n: 2,
    month: "March",
    decision: "Develop",
    title: "The promotion recommender",
    memo: {
      from: "Marisol Grant, Chief Nursing Officer",
      text: [
        "We lose nurses in years two and three because they do not see a path up. I want a bigger pipeline into charge nurse and nurse manager roles, and I want it picked fairly.",
        "PathFinder says it can rank all 6,000 of our nurses for the leadership program in an afternoon.",
      ],
    },
    vendor: {
      name: "PathFinder",
      product: "PathFinder Talent Mobility",
      price: "$240,000 a year",
      tagline: "Your next leaders are already here.",
      claims: [
        { id: "match", text: "91% agreement with your managers' past promotion decisions." },
        { id: "hidden", text: "Surfaces the high-potentials your managers miss." },
        { id: "fair", text: "Objective. The same criteria for every nurse." },
      ],
    },
    evidence: [
      {
        id: "2a",
        label: "Ask what it was trained to predict",
        doc: {
          title: "PathFinder model card, excerpt",
          html: `<dl class="kv">
            <dt>Training label</dt><dd>Promoted to charge nurse or above within 3 years</dd>
            <dt>Training data</dt><dd>Three Rivers HR records, 2014 to 2024</dd>
            <dt>Not used</dt><dd>How a unit performed after the person led it</dd></dl>
            <p class="fine">The model learned to predict what your managers did, not how well the people they picked went on to lead.</p>`,
        },
        marks: [
          { claim: "match", note: "It copies the past. 91% is the copy rate." },
          { claim: "hidden", note: "Trained on who managers picked. It can't see who they missed." },
        ],
        unlocks: "C",
      },
      {
        id: "2b",
        label: "Look at who lands in its top 200",
        doc: {
          title: "Top 200 recommended nurses vs the whole workforce",
          html: `<table class="data">
            <thead><tr><th>Group</th><th>Share of nurses</th><th>Share of top 200</th></tr></thead>
            <tbody>
              <tr><td>Day shift, full time</td><td>41%</td><td>91%</td></tr>
              <tr class="hl"><td>Night shift</td><td>38%</td><td>7%</td></tr>
              <tr class="hl"><td>Part time</td><td>21%</td><td>2%</td></tr>
            </tbody></table>
            <p class="fine">Night and part-time nurses rarely work the same hours as the managers who promote.</p>`,
        },
        marks: [{ claim: "fair", note: "Same criteria. Different face time." }],
      },
      {
        id: "2c",
        label: "Ask for proof its picks lead better",
        doc: {
          title: "Email from PathFinder's customer success lead",
          html: `<blockquote>"We validate against promotion decisions, which are the gold standard of leadership potential."</blockquote>
            <p>There is no outcome data. For comparison, here is what predicts job performance across decades of studies:</p>
            <table class="data"><tbody>
              <tr><td>Structured interview</td><td>.42</td></tr>
              <tr><td>Job knowledge test</td><td>.40</td></tr>
              <tr><td>Unstructured interview</td><td>.19</td></tr>
              <tr><td>Years of experience</td><td>.07</td></tr></tbody></table>
            <p class="fine">Correlations with job performance, Sackett and colleagues (2022).</p>`,
        },
        marks: [{ claim: "match", note: "Validated against itself." }],
      },
    ],
    options: [
      {
        id: "A",
        label: "Pick the cohort straight from its top 200",
        detail: "Fast, and it looks objective.",
        fx: { eff: 10, qual: -8, trust: -10, exp: 8 },
        flag: "path_rank",
        outcome: "Cohort picked in a day. It looks like last year's cohort, only more so. The night shift notices.",
      },
      {
        id: "B",
        label: "Use it to widen the pool, not pick from it",
        detail: "Its top picks plus open self-nomination. Structured interviews choose the cohort.",
        fx: { eff: 3, qual: 8, trust: 7, exp: 0 },
        flag: "path_widen",
        outcome: "More work than the vendor promised. 140 nurses apply and a third of the final cohort comes from nights and part-time staff.",
      },
      {
        id: "C",
        label: "Pay to retrain it on a better target",
        detail: "Predict the retention and safety record of units people later led. $150,000 and two quarters.",
        requires: "2a",
        fx: { eff: -2, qual: 10, trust: 4, exp: -2 },
        flag: "path_retrain",
        outcome: "Slower to learn and harder to explain, but now it measures leadership instead of who got noticed.",
      },
      {
        id: "D",
        label: "Pass, and keep manager nominations",
        detail: "The way it has always worked.",
        fx: { eff: 0, qual: 0, trust: -2, exp: 0 },
        flag: "path_none",
        outcome: "Nothing changes, which means the same nurses get nominated.",
      },
    ],
    real: [
      "Amazon's screener learned from ten years of its own hiring, mostly men, and reproduced it. A model trained on past human decisions learns the decisions, flaws included.",
      "Google's Project Oxygen (from 2008) built its list of good-manager behaviors from data on what effective managers do, not from who got promoted. \"Is a good coach\" came first.",
      "In 1955 Daniel Kahneman replaced the Israeli army's gut-feel interview with six separately scored traits. The scores predicted far better, and the army used the method for decades.",
    ],
  },

  {
    id: "watch",
    n: 3,
    month: "June",
    decision: "Watch",
    title: "The productivity monitor",
    memo: {
      from: "Paul Kessler, Chief Financial Officer",
      text: [
        "Our 1,800 remote and hybrid staff in billing, coding and HR are a black box to me. Claim denials are up. I want to see who is actually working.",
        "PulseScore plugs into the Microsoft tools we already pay for.",
      ],
    },
    vendor: {
      name: "PulseScore",
      product: "PulseScore Workforce Insights",
      price: "$210,000 a year",
      tagline: "See the work. Not just the hours.",
      claims: [
        { id: "score", text: "A daily Productivity Score from 0 to 100 for every employee." },
        { id: "gain", text: "Customers report 22% productivity gains in 90 days." },
        { id: "signals", text: "Captures active time, keystrokes, apps and meeting load automatically." },
      ],
    },
    evidence: [
      {
        id: "3a",
        label: "Ask what counts as productive",
        doc: {
          title: "PulseScore scoring formula (support article)",
          html: `<p><b>Score</b> = active minutes in approved apps + keystrokes + messages sent, scaled 0 to 100.</p>
            <p>Phone calls with insurers: not captured. Reading a 40-page denial letter: counted as idle.</p>
            <table class="data"><tbody>
              <tr><td>Your best denials specialist (overturned $2.1M last year)</td><td>34</td></tr>
              <tr class="hl"><td>A laptop with a $15 mouse jiggler</td><td>98</td></tr></tbody></table>`,
        },
        marks: [{ claim: "score", note: "Measures motion, not work." }],
      },
      {
        id: "3b",
        label: "Run a two-week trial on one billing team",
        doc: {
          title: "Trial results, Revenue Cycle Team 4",
          html: `<table class="data">
            <thead><tr><th></th><th>Week 1</th><th>Week 2</th></tr></thead>
            <tbody>
              <tr><td>Average PulseScore</td><td>61</td><td>79</td></tr>
              <tr class="hl"><td>Claims resolved per person per day</td><td>42</td><td>41</td></tr>
            </tbody></table>
            <p>Two mouse jigglers were bought on team purchasing cards. The team's best coder asked to transfer.</p>`,
        },
        marks: [{ claim: "gain", note: "Score up 30%. Actual work flat." }],
      },
      {
        id: "3c",
        label: "Ask counsel what other employers learned",
        doc: {
          title: "Memo from Legal",
          html: `<ul class="plain">
            <li>Microsoft launched its own Productivity Score in 2020, then removed user names within weeks after public backlash. It said the tool "was never designed to score individual users."</li>
            <li>Gartner found that tracked workers were nearly twice as likely to pretend to be working.</li>
            <li>Vendor-sponsored surveys say about three in four US employers already monitor staff online.</li></ul>`,
        },
        marks: [{ claim: "signals", note: "Microsoft walked this back for individuals." }],
      },
    ],
    options: [
      {
        id: "A",
        label: "Individual scores to managers, used in reviews",
        detail: "Everyone gets a daily number. Managers see the leaderboard.",
        fx: { eff: 6, qual: -6, trust: -25, exp: 8 },
        flag: "watch_individual",
        outcome: "Scores rise every week. Denials do not fall. Staff swap tips for keeping the status dot green.",
      },
      {
        id: "B",
        label: "Team-level only, and tell staff what is collected",
        detail: "No individual scores. Use it to find teams that are overloaded.",
        fx: { eff: 4, qual: 2, trust: -4, exp: 1 },
        flag: "watch_team",
        outcome: "You find two teams drowning in meetings and give them protected focus time. A modest win, and nobody quits over it.",
      },
      {
        id: "C",
        label: "Skip it, and track the outputs you already have",
        detail: "Denials overturned, claims resolved, days in accounts receivable.",
        fx: { eff: 5, qual: 5, trust: 3, exp: 0 },
        flag: "watch_outputs",
        outcome: "The CFO grumbles that it is not real time. Once teams can see their own numbers, denials overturned go up 8%.",
      },
    ],
    real: [
      "Microsoft removed user names from Productivity Score on December 1, 2020, after researcher Wolfie Christl showed managers could track individuals.",
      "At an Amazon warehouse near Baltimore, about 300 associates were fired for productivity in about a year (2017 to 2018). Amazon's lawyers wrote that the system generates warnings and terminations \"without input from supervisors.\" Amazon says supervisors can override it.",
      "In 2021 Xsolla's CEO fired 150 people after a \"big data team analyzed your activities in Jira, Confluence, Gmail.\"",
    ],
  },

  {
    id: "predict",
    n: 4,
    month: "September",
    decision: "Predict",
    title: "The flight-risk model",
    memo: {
      from: "Marisol Grant, Chief Nursing Officer",
      text: [
        "Nursing turnover is running at 19% a year. Finance estimates every RN who leaves costs us about $60,000 to replace.",
        "FlightRisk says it can tell us which nurses will resign in the next 90 days, so managers can step in first.",
      ],
    },
    vendor: {
      name: "FlightRisk",
      product: "FlightRisk Retention AI",
      price: "$180,000 a year",
      tagline: "Know who's leaving before they do.",
      claims: [
        { id: "acc", text: "94% accurate at predicting resignations within 90 days." },
        { id: "act", text: "A monthly risk score for every nurse, sent to their manager." },
        { id: "roi", text: "Save one nurse, save $60,000." },
      ],
    },
    evidence: [
      {
        id: "4a",
        label: "Ask how many nurses resign in a typical 90 days",
        doc: {
          title: "Three Rivers HR data",
          html: `<p>About <b>300 of 6,000</b> nurses resign in a typical 90-day window. That is 5%.</p>`,
        },
        task: {
          id: "base",
          prompt: "How accurate is a \"model\" that simply predicts no one will resign?",
          placeholder: "percent, e.g. 80",
          answer: 95,
          tolerance: 0.6,
          unit: "%",
          right: "Right: it is correct about the 5,700 who stay, so 95%. FlightRisk's 94% is worse than guessing \"nobody leaves.\"",
          wrong: "Not quite. Predicting \"nobody leaves\" is right about all 5,700 who stay: 5,700 ÷ 6,000 = 95%. That beats FlightRisk's 94%.",
        },
        marks: [{ claim: "acc", note: "Guessing \"nobody leaves\" scores 95%." }],
      },
      {
        id: "4b",
        label: "Ask for last year's results, case by case",
        doc: {
          title: "FlightRisk back-test, 6,000 nurses, one 90-day window",
          html: `<table class="data matrix">
            <thead><tr><th></th><th>Actually left</th><th>Actually stayed</th></tr></thead>
            <tbody>
              <tr><th>Flagged</th><td>120</td><td class="hl">180</td></tr>
              <tr><th>Not flagged</th><td class="hl">180</td><td>5,520</td></tr>
            </tbody></table>
            <p>It flags 300 nurses and 120 of them leave (40%). It misses 180 of the 300 who do. (120 + 5,520) ÷ 6,000 = 94%.</p>`,
        },
        marks: [{ claim: "roi", note: "6 in 10 flags are wrong. It misses 6 in 10 leavers." }],
      },
      {
        id: "4c",
        label: "Ask what drives the score",
        doc: {
          title: "FlightRisk: top signals",
          html: `<ol class="feat">
            <li><b>A recent change of manager</b><span class="pen">fix the unit, not the nurse</span></li>
            <li><b>Fewer extra shifts picked up</b></li>
            <li><b>Longer commute after a move</b></li>
            <li><b>Recent leave of absence, including medical and parental leave</b><span class="pen">protected leave</span></li></ol>`,
        },
        marks: [{ claim: "act", note: "Acting on protected leave is a lawsuit." }],
      },
    ],
    options: [
      {
        id: "A",
        label: "Send each nurse's risk score to their manager",
        detail: "Monthly, so they can intervene one nurse at a time.",
        fx: { eff: 4, qual: -5, trust: -15, exp: 15 },
        flag: "predict_individual",
        outcome: "Managers start quietly passing flagged nurses over for charge shifts and training. Why invest in someone who is leaving?",
      },
      {
        id: "B",
        label: "Use it only in aggregate",
        detail: "Find the units and causes behind predicted exits, and fix those.",
        fx: { eff: 5, qual: 8, trust: 5, exp: 0 },
        flag: "predict_aggregate",
        outcome: "Three units with new managers account for a third of predicted exits. You coach the managers and stabilize schedules. Turnover on those units falls from 24% to 17%.",
      },
      {
        id: "C",
        label: "Offer every flagged nurse a $5,000 retention bonus",
        detail: "Automatic, every month.",
        fx: { eff: -8, qual: 0, trust: -8, exp: 3 },
        flag: "predict_bonus",
        outcome: "$1.5 million goes out a year. 180 of every 300 flagged nurses were not leaving anyway. Nurses compare notes and learn that looking restless pays.",
      },
      {
        id: "D",
        label: "Pass",
        detail: "Keep the stay interviews you already do.",
        fx: { eff: 0, qual: 0, trust: 0, exp: 0 },
        flag: "predict_none",
        outcome: "Turnover holds at 19%.",
      },
    ],
    real: [
      "In 2019 IBM's CEO said its AI predicts which employees will quit with 95% accuracy and saved nearly $300 million (CNBC). IBM never explained the method and the claim was never independently checked.",
      "On a rare event, accuracy without the base rate means nothing. Ask for the confusion matrix.",
      "Tuesday's resume card C said it: an attrition model \"should not be used for individual decisions.\"",
    ],
  },

  {
    id: "restructure",
    n: 5,
    month: "November",
    decision: "Restructure",
    title: "The AI-first memo",
    memo: {
      from: "Dr. Raymond Osei, Chief Executive Officer",
      text: [
        "Every board member forwarded me a CEO memo this year about going \"AI-first.\" Our HR Service Center has 60 people answering staff questions on pay, benefits and leave.",
        "HelpDesk Copilot says it can do the work of 25 of them. The board meets in two weeks. I would like a plan I can announce.",
      ],
    },
    vendor: {
      name: "HelpDesk Copilot",
      product: "HelpDesk Copilot for HR",
      price: "$300,000 a year",
      tagline: "Instant answers. Zero tickets.",
      claims: [
        { id: "resolve", text: "Resolves 70% of employee tickets with no human involved." },
        { id: "replace", text: "Does the work of 25 full-time specialists." },
        { id: "csat", text: "Employees love instant answers: satisfaction 4.6 out of 5." },
      ],
    },
    evidence: [
      {
        id: "5a",
        label: "Pull a month of tickets and sort them",
        doc: {
          title: "HR Service Center, October tickets",
          html: `<table class="data">
            <thead><tr><th>Ticket type</th><th>Share of tickets</th><th>Share of staff time</th></tr></thead>
            <tbody>
              <tr><td>Pay stubs, PTO balances, passwords</td><td>70%</td><td>25%</td></tr>
              <tr class="hl"><td>Leave, disability accommodations, pay errors, bereavement</td><td>30%</td><td>75%</td></tr>
            </tbody></table>
            <p class="fine">Mistakes in the second row are where the legal risk lives.</p>`,
        },
        marks: [{ claim: "replace", note: "70% of tickets is 25% of the work." }],
      },
      {
        id: "5b",
        label: "Look at a company that already tried this",
        doc: {
          title: "Klarna, 2024 to 2025",
          html: `<ul class="plain">
            <li><b>Feb 2024.</b> Klarna says its AI assistant does the work of 700 customer service agents.</li>
            <li><b>May 2025.</b> The CEO says customers should always be able to reach a human, and Klarna starts hiring human agents again.</li>
            <li><b>Nov 2025.</b> The AI does the work of more than 853 agents and saved $60 million, yet customer service and operations costs rose from $42 million to $50 million.</li></ul>
            <p class="fine">All figures are Klarna's own.</p>`,
        },
        marks: [{ claim: "csat", note: "Fine for easy questions. Not when it's your paycheck." }],
      },
      {
        id: "5c",
        label: "Talk to the Service Center team",
        doc: {
          title: "Notes from a 30-minute listening session",
          html: `<ul class="plain">
            <li>The three specialists who know leave law best have been asked to train the bot. Two are thinking about retiring early.</li>
            <li>The junior coordinator job is where most of your HR business partners started.</li></ul>
            <p class="fine">Stanford's August 2026 update: employment of 22 to 25 year olds in the most AI-exposed jobs now trails less-exposed peers by 19%, mostly because fewer are hired.</p>`,
        },
        marks: [{ claim: "resolve", note: "Cut the entry jobs and you cut the pipeline." }],
      },
    ],
    options: [
      {
        id: "A",
        label: "Cut 40% now, and send an AI-first memo",
        detail: "\"New headcount only if a team cannot automate the work.\"",
        fx: { eff: 18, qual: -12, trust: -22, exp: 10 },
        flag: "cut_now",
        outcome: "Savings land in the first quarter. By summer, leave-of-absence errors have tripled and you are paying a contractor to staff a human hotline.",
      },
      {
        id: "B",
        label: "Routine tickets only, one click to a person",
        detail: "Shrink by attrition and move people to leave and accommodation cases.",
        fx: { eff: 10, qual: 5, trust: 3, exp: -2 },
        flag: "cut_attrition",
        outcome: "Simple answers now take a minute instead of a day. Headcount drifts from 60 to 51 through attrition, and leave cases get more attention, not less.",
      },
      {
        id: "C",
        label: "Pilot it for a quarter before any job decisions",
        detail: "Routine tickets only. Measure, then decide.",
        fx: { eff: 4, qual: 2, trust: 4, exp: 0 },
        flag: "cut_pilot",
        outcome: "The CEO wanted an announcement and got a pilot. The pilot data is good, and next year's plan will rest on it.",
      },
      {
        id: "D",
        label: "Refuse. The Service Center stays as is",
        detail: "Protect the team.",
        fx: { eff: -4, qual: 0, trust: 1, exp: 0 },
        flag: "cut_none",
        outcome: "The CEO announces something anyway, without you in the room.",
      },
    ],
    real: [
      "Duolingo's CEO wrote in April 2025 that \"headcount will only be given if a team cannot automate more of their work.\" After the backlash he wrote, \"I didn't do that well,\" and \"I do not see AI as replacing what our employees do.\"",
      "Klarna went from \"AI does the work of 700 agents\" (2024) to hiring humans back (2025). Its headcount fell from about 7,000 to about 3,000, mostly through attrition.",
      "Salesforce cut support from 9,000 people to about 5,000 in 2025. Its CEO said, \"I need less heads.\"",
    ],
  },
];

// Year-end events. Each fires if its test passes against the final state.
// Order is priority: the first three that fire are shown.
export const EVENTS = [
  {
    id: "eeoc",
    test: (s) => s.flags.includes("screen_raw"),
    tone: "bad",
    title: "An age-discrimination charge",
    text: (s) =>
      "A 58-year-old nurse educator applied at 9:40 p.m. and was rejected at 9:46. She files a charge with the EEOC. Discovery shows TalentLens weighted graduation year, and TalentLens points to section 14.2 of the contract." +
      (s.opened.includes("1a") ? " You had the 0.72 in your own files. So does her lawyer." : ""),
    fx: (s) => ({ exp: s.opened.includes("1a") ? 20 : 12, trust: -4 }),
  },
  {
    id: "leave",
    test: (s) => s.flags.includes("predict_individual"),
    tone: "bad",
    title: "A flag after parental leave",
    text: () =>
      "A nurse back from parental leave learns she was rated \"high flight risk\" and passed over for charge nurse. Her lawyer asks for the model's inputs. Leave of absence is one of them.",
    fx: () => ({ exp: 12, trust: -4 }),
  },
  {
    id: "reddit",
    test: (s) => s.flags.includes("watch_individual"),
    tone: "bad",
    title: "The dashboard screenshot",
    text: () =>
      "A manager writes up a remote coder whose PulseScore sat at 22 for a month. She had been on the phone with insurers all day. A screenshot of the leaderboard reaches Reddit, then the Post-Gazette.",
    fx: () => ({ trust: -8, exp: 5 }),
  },
  {
    id: "hotline",
    test: (s) => s.flags.includes("cut_now"),
    tone: "bad",
    title: "\"Hospital replaces HR staff with chatbot\"",
    text: () =>
      "Local TV runs the story after a nurse's medical leave paperwork is lost for six weeks. Three of the specialists you cut are rehired as contractors at a higher rate.",
    fx: () => ({ trust: -5, eff: -6 }),
  },
  {
    id: "night",
    test: (s) => s.flags.includes("path_rank"),
    tone: "bad",
    title: "A petition from the night shift",
    text: () =>
      "Two hundred night-shift nurses sign a petition asking why only 7% of the leadership cohort works nights. A union organizer starts quoting it.",
    fx: () => ({ trust: -6 }),
  },
  {
    id: "audit_catch",
    test: (s) => s.flags.includes("screen_audit"),
    tone: "mixed",
    title: "The September audit",
    text: () =>
      "The independent auditor finds the over-40 impact ratio at 0.72. You pull graduation year and gaps before anyone files a charge. Eight months of rejections are now hard to defend.",
    fx: () => ({ exp: -4 }),
  },
  {
    id: "audit_pass",
    test: (s) => s.flags.includes("screen_fixed"),
    tone: "good",
    title: "A clean audit",
    text: () =>
      "The independent bias audit comes back clean on age, sex and race, and you can post it publicly. Two other health systems call to ask how you negotiated the contract.",
    fx: () => ({ trust: 3 }),
  },
  {
    id: "units",
    test: (s) => s.flags.includes("predict_aggregate"),
    tone: "good",
    title: "Turnover moves",
    text: () =>
      "Nursing turnover for the year comes in at 17%, down from 19%. Finance credits about 120 retained nurses.",
    fx: () => ({ eff: 4 }),
  },
  {
    id: "cohort",
    test: (s) => s.flags.includes("path_widen") || s.flags.includes("path_retrain"),
    tone: "good",
    title: "A different leadership cohort",
    text: () =>
      "The new cohort includes nurses from nights and part-time schedules for the first time. Two of them already run the units with the lowest turnover.",
    fx: () => ({ trust: 3 }),
  },
  {
    id: "flood",
    test: (s) => s.flags.includes("screen_none"),
    tone: "mixed",
    title: "Still underwater",
    text: () =>
      "Applications keep climbing. Your recruiters handled every one by hand, and two of them quit from burnout in October.",
    fx: () => ({ eff: -3 }),
  },
];

export const ARCHETYPES = [
  {
    id: "fast",
    name: "The Fast Signer",
    test: (s) => s.m.exp >= 55,
    text: "You bought speed, and the bill came in December. The meter you could not see was the one that mattered.",
  },
  {
    id: "gate",
    name: "The Gatekeeper",
    test: (s) => s.m.eff < 42,
    text: "Nothing bad happened, and not much good did either. The application flood is still coming, and next year's CFO will ask what you did about it.",
  },
  {
    id: "auditor",
    name: "The Auditor",
    test: (s) => s.overall >= 68 && s.opened.length >= 6,
    text: "You spent your hours reading the fine print, and it paid off: real savings with the exposure kept low.",
  },
  {
    id: "operator",
    name: "The Operator",
    test: (s) => s.overall >= 68,
    text: "Good calls, mostly on instinct. Some of them you got right without knowing why. Ask yourself which.",
  },
  {
    id: "middle",
    name: "The Hedger",
    test: () => true,
    text: "A mixed year: some wins, some risk you carried without seeing it. Look at where you spent your eight hours.",
  },
];

// The results-row columns, in order. Must match the sheet's Rankings tab.
export const ROW_COLUMNS = [
  "Pair", "Hire", "Develop", "Watch", "Predict", "Restructure",
  "Hours used", "Evidence opened", "Efficiency", "Quality", "Trust",
  "Exposure", "Overall", "Type", "Impact ratio answer", "Base rate answer",
];
