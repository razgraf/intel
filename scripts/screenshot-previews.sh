#!/usr/bin/env bash
set -euo pipefail

OUTDIR="scripts/.screenshots"
URL="http://localhost:3100/preview"

mkdir -p "$OUTDIR"

# Collect all ticker values from the preview page
TICKERS=$(agent-browser \
  open "$URL" \
  wait-for-network-idle \
  execute "JSON.stringify([...document.querySelectorAll('[data-preview-ticker]')].map(el => el.dataset.previewTicker))" \
  close 2>&1 | grep '^\[' | head -1)

if [ -z "$TICKERS" ]; then
  echo "Error: Could not read tickers from $URL"
  exit 1
fi

echo "Found tickers: $TICKERS"

# Screenshot each card individually
for TICKER in $(echo "$TICKERS" | python3 -c "import sys,json; [print(t) for t in json.load(sys.stdin)]"); do
  SAFE_NAME=$(echo "$TICKER" | sed 's/[^a-zA-Z0-9._-]/_/g')
  echo "Screenshotting: $TICKER → $OUTDIR/$SAFE_NAME.png"

  agent-browser \
    open "$URL" \
    wait-for-network-idle \
    execute "
      (() => {
        const target = document.querySelector('[data-preview-ticker=\"$TICKER\"]');
        if (!target) return 'NOT_FOUND';
        document.querySelectorAll('[data-preview-ticker]').forEach(el => {
          if (el !== target) el.style.display = 'none';
        });
        const grid = target.closest('.grid');
        if (grid) {
          grid.style.display = 'flex';
          grid.style.justifyContent = 'center';
          grid.style.alignItems = 'center';
        }
        document.body.style.background = '#0a0a0f';
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        document.body.style.minHeight = '440px';
        document.body.style.padding = '60px';
        target.style.width = '320px';
        target.style.maxWidth = '320px';
        return 'OK';
      })()
    " \
    screenshot "$OUTDIR/$SAFE_NAME.png" \
    close
done

echo "Done. Screenshots saved to $OUTDIR/"
