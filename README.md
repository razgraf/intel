![Intel](/assets/intel-section.png)

# Intel

Market-watching hub. Running most of the day on my spare desktop screen.

Designed for tracking stocks, ETFs, crypto, options (stock or crypto), futures, live financial feeds in a clean UI.

[Features](#features) ⋅ [Tracked items](#tracked-items) ⋅ [Deploy your own](#quickstart)

![Dashboard](/assets/ss-dashboard.png)

### Features

| Details                            | Item enhancements                    | Export-able watchlist              |
| :--------------------------------- | :----------------------------------- | :--------------------------------- |
| ![Details](/assets/ss-details.png) | ![Settings](/assets/ss-settings.png) | ![Restore](/assets/ss-restore.png) |

**Real-time asset grid** — interactive charts for stocks, ETFs, crypto, options (incl. crypto through Deribit), indexes, bonds, futures

**Watchlist** — drag-to-reorder, ticker search, per-item settings (futures symbol overrides). Import/export via URL or QR code to share lists across devices.

**Earnings and events** — upcoming earnings dates (relative to device time) and FOMC meetings

**Market hours** — live open/close status for various exchanges

**Embeddable special items** — in-grid live YouTube feeds (e.g. Bloomberg)

**Tips slideshow** — rotating tips in the sidebar for discoverability

### Tracked Items

| Item / Asset    | How to search          | Example                                                     | Preview                                                     |
| :-------------- | :--------------------- | :---------------------------------------------------------- | :---------------------------------------------------------- |
| Stock           | Company name or ticker | `AAPL`, `SNN.RO`                                            | <img src="./assets/cards/stock.png" height="64" />          |
| ETF             | Fund name or ticker    | `VWCE.DE`, `SPY`                                            | <img src="./assets/cards/etf.png" height="64" />            |
| Index           | Index name or ticker   | `^GSPC`, `^DJI` — Yahoo prefixes with `^`                   | <img src="./assets/cards/index.png" height="64" />          |
| Crypto          | Coin name              | `BTC-USD`, `ETH-USD` — pairs with USD                       | <img src="./assets/cards/crypto.png" height="64" />         |
| Future          | Futures symbol         | `ES=F`, `GC=F` — Yahoo suffixes with `=F`                   | <img src="./assets/cards/future.png" height="64" />         |
| Option (stock)  | Option ticker          | `TSLA250321C00250000` — `<Ticker><YYMMDD><C\|P><00Price00>` | <img src="./assets/cards/option-stock.png" height="64" />   |
| Option (crypto) | "Deribit" + ticker     | `Deribit <Ticker>_USDC-<DDMMMYY>-<Price>-<C\|P>`            | <img src="./assets/cards/option-deribit.png" height="64" /> |
| Live feed       | "Bloomberg" or "Yahoo" | YouTube embed in grid                                       | <img src="./assets/cards/embed.png" height="64" />          |
| Countdown       | Countdown              | `May 16th 9PM` or Natural language                          | <img src="./assets/cards/countdown.png" height="64" />      |

## Quickstart

### Run a local copy

```bash
git clone https://github.com/razgraf/intel.git && cd intel
bun install
bun dev
```

No API keys required — data (Yahoo Finance, Deribit) is fetched server-side without authentication. Open at [http://localhost:3100](http://localhost:3100).

### Deploy your own instance

Deploy your own copy of Intel to Vercel in one click.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/razgraf/intel&project-name=intel-by-razgraf)

### Tech stack and plans

<details>
<summary>Tech stack</summary>

| Layer        | Tech                                                                                                                                            |
| :----------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework    | Next.js 16 (with `use cache`, new React 19 directives)                                                                                          |
| UI           | Tailwind CSS 4, Base UI primitives, Lucide icons                                                                                                |
| Charts       | [Liveline](https://benji.org/liveline)                                                                                                          |
| Numbers      | [Caligraph](https://calligraph.raphaelsalaja.com/), [Number Flow](https://number-flow.barvian.me/), [Chrono](https://github.com/wanasit/chrono) |
| Animations   | Framer Motion                                                                                                                                   |
| State        | Zustand, TanStack Query                                                                                                                         |
| Data         | Yahoo Finance via `yahoo-finance2`, USDC-settled options via `deribit`                                                                          |
| Dev tooling  | [Agentation](https://agentation.dev/), Biome, TypeScript 5                                                                                      |
| Runtime      | Bun                                                                                                                                             |
| Architecture | FSD                                                                                                                                             |
| AI           | Claude, Codex                                                                                                                                   |

</details>

<details>
<summary>Roadmap</summary>

- [x] Deribit options
- [ ] Polymarket or Kalshi markets
- [ ] Price alerts and notifications
- [ ] More reliable data sources (Yahoo may rate-limit or be incomplete), maybe Alpha Vantage (?)
- [ ] More special grid items (keyword trackers, AI-generated market reports, news feeds)
- [ ] Commercial version with paid subscriptions
</details>

## License

MIT
