![Intel](/assets/intel-section.png)

# Intel

> [!NOTE]
> This is an experimental project, meant to explore the idea and is not production-ready.

A market-watching hub I'm building for personal use.

It's designed for tracking stocks, ETFs, crypto and other assets in a clean UI. Envisioned to support customizable extras like live financial channel feeds with plans for keyword tracking, automated AI reports, and whatever else can help me navigate the markets. Built for my spare desktop screen so I can display it for a few hours at a time.

![Dashboard](/assets/ss-dashboard.png)

## Features

- **Real-time asset grid** — interactive charts for stocks, ETFs, crypto, options, indexes, bonds, futures
- **Watchlist management** — drag-to-reorder, ticker search, per-item settings (futures symbol overrides)
- **Detail sheets** — expanded view with larger chart, timeframe selector, options chain data, external links
- **Earnings calendar** — upcoming earnings dates (relative to device time)
- **Market hours tracker** — live open/close status for NYSE, CME, LSE, BVB, NIKKEI, Crypto with countdown timers
- **Embeddable special items** — add live YouTube feeds (e.g. Bloomberg Live) directly to the grid
- **Multi-exchange awareness** — tracks 6 exchanges across US, EU, and Asia with timezone-aware status
- **Tips slideshow** — rotating tips in the sidebar for discoverability

| Details                            | Settings (e.g. add futures ticker)  |
| ---------------------------------- | ----------------------------------- |
| ![Details](/assets/ss-details.png) | ![Details](/assets/ss-settings.png) |

## Tech Stack

| Layer        | Tech                                                        |
| ------------ | ----------------------------------------------------------- |
| Framework    | Next.js 16 (with `use cache`, new React 19 directives)      |
| UI           | Tailwind CSS 4, shadcn components, Lucide icons             |
| Charts       | [Liveline](https://benji.org/liveline)                      |
| Animations   | Framer Motion                                               |
| State        | Zustand, TanStack Query                                     |
| Data         | Yahoo Finance via `yahoo-finance2`                          |
| Menus        | [Bloom](https://joshpuckett.me/bloom)                       |
| Dev tooling  | [Agentation](https://agentation.dev/), Biome , TypeScript 5 |
| Runtime      | Bun                                                         |
| Architecture | FSD                                                         |
| AI           | Claude with Claude Code                                     |

## Quickstart

```bash
git clone https://github.com/razgraf/intel.git
cd intel
bun install
bun dev
```

No API keys required — Yahoo Finance data is fetched server-side without authentication.

Open [http://localhost:3100](http://localhost:3100).

## Roadmap

- [ ] More reliable data sources (Yahoo Finance may rate-limit or return stale data)
- [ ] More special grid items (keyword trackers, AI-generated market reports, news feeds)
- [ ] Hosting as a live web app
- [ ] Commercial version with paid subscriptions
- [ ] Price alerts and notifications
- [ ] Multi-portfolio support

## License

MIT
