# Leonida Legend — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/RajYousuf11/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/RajYousuf11/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver and 46 bronze, 28 of them hidden on PSN. Built for the [make.fun "Build the best GTA 6 trophy guide" bounty](https://make.fun/bounty/gta6-trophy-guide-01).

Every trophy is shown with its official name, description and grade exactly as PlayStation publishes them, plus a guide written in this project's own words that says what to do, where and how, and when it can be missed — with its sources cited beside it. The guide also has a platinum roadmap (about 200 hours, one playthrough), flags the one possibly missable trophy, and works as a tracker: check trophies off as you earn them, filter the list, hide story spoilers, and export or import your progress.

## What is inside

- **All 55 trophies** in `app/data/trophies.json` — official name, description, grade, points, hidden status, kind, missable flag and a sourced guide for each one.
- **Checklist tracker** — earned checkmarks saved in the browser (localStorage), a progress bar with per-grade counts, and export to JSON plus import back.
- **Filters** — search by name or description, and filter by grade, kind (story, side mission, collection, activity, stunt, robbery, exploration, money, misc), earned/unearned, and missable only.
- **Spoiler setting** — hides the names and descriptions of the 28 hidden story trophies until they are earned (or until you turn spoilers on).
- **Platinum roadmap** — the order to earn everything in, built from the official descriptions: story first (60–80 hours), then the 100% completion checklist (about 100 hours), then Strangers & Freaks and cleanup (about 10 hours).
- **Missable flag** — only one trophy is flagged missable: Positive Mental Attitude, whose Chapter 1 balcony meditation vanishes when Chapter 1 ends. Four trophies whose unlock method no published guide has confirmed yet are marked as unconfirmed rather than guessed at.
- **Fully offline** — plain static files, no build step, no CDN, no external fonts or images, no network requests at run time.

## How to run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. That is all — `app/` is plain static files, so any static file server works too. To try a filtered view, use query parameters such as `?grade=silver`, `?spoiler=off`, or `?open=28` to open one trophy's guide.

## Sources

- Official trophy names, descriptions, grades and hidden status: [Exophase — Grand Theft Auto VI Trophies (PS5)](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
- Methods and roadmap figures (difficulty 4/10, about 200 hours, counts for stunts, vehicles, animals, challenges): [PowerPyx — GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/)

Each trophy's guide cites both sources beside it. The guide text is this project's own wording; the official names and descriptions are quoted as published.

## Notes

- This is an unofficial fan-made guide. Grand Theft Auto and GTA are trademarks of Rockstar Games. No Rockstar logo or official artwork is used anywhere in this guide.
- Cheats disable trophies and saving, so keep them off on your trophy save. There is no mission replay and no New Game Plus, so keep a manual save at the start of each chapter.
- `main.ts` hands the entry in for make.fun: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored library in `vendor/makefun-frontend.ts` (unchanged from the kit).

## Screenshots

`screenshots/` holds four renders of the app taken in a desktop browser at 1280×800: the full checklist (cover), the silver-grade filter, the bronze-grade filter scrolled down the list, and a trophy guide opened with its sources and missable warning visible.
