![Intel](/assets/intel-section.png)

# Intel

> [!NOTE]
> This is an experimental project and is not production-ready.

A market-watching hub I'm building for personal use.

Designed for tracking stocks, ETFs, crypto and other assets in a clean UI. Envisioned to support customizable extras like live financial feeds with plans for keyword tracking, automated AI reports, and whatever else can help users navigate the markets. Built for my spare desktop screen so I can display it for a few hours at a time.

![Dashboard](/assets/ss-dashboard.png)

## Features

- **Real-time asset grid** — interactive charts for stocks, ETFs, crypto, options (incl. crypto through Deribit), indexes, bonds, futures
- **Watchlist** — drag-to-reorder, ticker search, per-item settings (futures symbol overrides). Import/export via URL or QR code to share lists across devices.
- **Earnings calendar** — upcoming earnings dates (relative to device time)
- **Market hours** — live open/close status for various exchanges
- **Embeddable special items** — in-grid live YouTube feeds (e.g. Bloomberg)
- **Tips slideshow** — rotating tips in the sidebar for discoverability

| Details                            | Settings (e.g. add futures ticker)   | Import / Export watchlist          |
| ---------------------------------- | ------------------------------------ | ---------------------------------- |
| ![Details](/assets/ss-details.png) | ![Settings](/assets/ss-settings.png) | ![Restore](/assets/ss-restore.png) |

### Assets

| Asset          | How to search          | Example                                                     |
| -------------- | ---------------------- | ----------------------------------------------------------- |
| Stock          | Company name or ticker | `AAPL`, `SNN.RO`                                            |
| ETF            | Fund name or ticker    | `VWCE.DE`, `SPY`                                            |
| Index          | Index name or ticker   | `^GSPC`, `^DJI` — Yahoo prefixes with `^`                   |
| Crypto         | Coin name              | `BTC-USD`, `ETH-USD` — pairs with USD                       |
| Future         | Futures symbol         | `ES=F`, `GC=F` — Yahoo suffixes with `=F`                   |
| Bond / Fund    | Fund name or ticker    | `VBTLX` — mutual funds shown as bonds                       |
| Option (stock) | Option ticker          | `TSLA250321C00250000` — `<Ticker><YYMMDD><C\|P><00Price00>` |
| Deribit option | "deribit" + underlying | `Deribit BTC` — USDC-settled crypto options                 |
| Live feed      | "Bloomberg" or "Yahoo" | YouTube embed in grid                                       |

## Tech Stack

| Layer        | Tech                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| Framework    | Next.js 16 (with `use cache`, new React 19 directives)                 |
| UI           | Tailwind CSS 4, shadcn components, Lucide icons                        |
| Charts       | [Liveline](https://benji.org/liveline)                                 |
| Animations   | Framer Motion                                                          |
| State        | Zustand, TanStack Query                                                |
| Data         | Yahoo Finance via `yahoo-finance2`, USDC-settled options via `deribit` |
| Menus        | [Bloom](https://joshpuckett.me/bloom)                                  |
| Dev tooling  | [Agentation](https://agentation.dev/), Biome , TypeScript 5            |
| Runtime      | Bun                                                                    |
| Architecture | FSD                                                                    |
| AI           | Claude with Claude Code                                                |

## Quickstart

```bash
git clone https://github.com/razgraf/intel.git && cd intel
bun install
bun dev
```

No API keys required — data (Yahoo Finance, Deribit) is fetched server-side without authentication.

Open [http://localhost:3100](http://localhost:3100).

## Roadmap

- [x] Deribit options supported
- [ ] More reliable data sources (Yahoo Finance may rate-limit or return stale data)
- [ ] More special grid items (keyword trackers, AI-generated market reports, news feeds)
- [ ] Hosting as a live web app
- [ ] Commercial version with paid subscriptions
- [ ] Price alerts and notifications

## License

MIT
