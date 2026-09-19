# Econ 2 Master Packet

Interactive study site for **ECON 2: Introduction to Economics** (UC Berkeley, Prof. Ryan Edwards,
Romer & Romer). Live at **https://hellomate2.github.io/econ2-packet/**

28 units covering the whole course, built from all 26 Fall 2025 lecture decks and both past exams
with answer keys.

- **Part I — Microeconomics** (units 1–11): scarcity, comparative advantage, supply and demand,
  welfare, price controls, elasticity, taxes, utility, firms, monopoly, externalities
- **Part II — Factors & Trade** (12–16): labor, inequality, capital and present value, trade, tariffs
- **Part III — Macroeconomics** (17–24): GDP, inflation, growth, the Keynesian cross, fiscal and
  monetary policy, the return to potential, international macro
- **Part IV — Exam Lab** (25–28): blank-paper graph recall, both past exams worked, cheat-sheet blueprint

Every unit runs the same loop: the idea, the graph, the moves that earn points, the traps, then
drills with hidden answers.

## Features

- 37 diagrams drawn as SVG from labelled specs, themed light and dark
- 134 drills with reveal-answer solutions; progress saved in `localStorage` and shared across pages
- Progress rings per part and per unit on the contents page, plus a "continue where you left off" link
- Full-text search across every unit — press <kbd>/</kbd>
- Arrow keys page between units
- Works offline once loaded; prints cleanly with all answers expanded

## Structure

```
index.html        contents + progress dashboard
u01.html … u28.html   one page per unit
assets/style.css  design tokens, light + dark
assets/graphs.js  SVG engine + all 37 diagram specs
assets/app.js     progress, navigation, search, theme
assets/manifest.js / search.js   generated indexes
```

No build step and no dependencies. Fonts come from Google Fonts; everything else ships with the site.
