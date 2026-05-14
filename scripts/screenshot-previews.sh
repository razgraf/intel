#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
export PATH="$PROJECT_ROOT/node_modules/.bin:$PATH"

OUTDIR="assets/cards"
URL="http://localhost:3100/preview"
SESSION="screenshot-previews-$$"
VIEWPORT_SIZE=900
OUTPUT_SIZE=430
TMPDIR=$(mktemp -d "${TMPDIR:-/tmp}/screenshot-previews.XXXXXX")
ONLY_LABEL=""

for ARG in "$@"; do
  case "$ARG" in
    --only=*)
      ONLY_LABEL="${ARG#--only=}"
      ;;
    *)
      echo "Unknown argument: $ARG" >&2
      echo "Usage: $0 [--only=<label>]" >&2
      exit 1
      ;;
  esac
done

mkdir -p "$OUTDIR"
FOUND_MATCH=0

cleanup() {
  agent-browser --session "$SESSION" close >/dev/null 2>&1 || true
  rm -rf "$TMPDIR"
}

trap cleanup EXIT

agent-browser --session "$SESSION" open "$URL" >/dev/null
agent-browser --session "$SESSION" set viewport "$VIEWPORT_SIZE" "$VIEWPORT_SIZE" >/dev/null
agent-browser --session "$SESSION" wait --load networkidle >/dev/null

ITEMS_RAW=$(agent-browser --session "$SESSION" eval 'JSON.stringify([...document.querySelectorAll("[data-preview-nav] [data-slot=button]")].map((btn, index) => ({ index, label: btn.textContent?.trim() ?? "" })))')
TICKERS=$(printf '%s' "$ITEMS_RAW" | python3 -c 'import json, sys; print(json.loads(sys.stdin.read()))')

if [ -z "$TICKERS" ]; then
  echo "Error: Could not read tickers from $URL"
  exit 1
fi

COUNT=$(echo "$TICKERS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
echo "Found $COUNT items to screenshot"

# Screenshot each card by clicking its button
for INDEX in $(seq 0 $((COUNT - 1))); do
  # Get label for filename
  LABEL=$(echo "$TICKERS" | python3 -c "import sys,json; print(json.load(sys.stdin)[$INDEX]['label'])")

  if [ -n "$ONLY_LABEL" ] && [ "$LABEL" != "$ONLY_LABEL" ]; then
    continue
  fi

  FOUND_MATCH=1

  SAFE_NAME=$(printf '%s' "$LABEL" | python3 -c 'import re, sys; label = sys.stdin.read().strip().lower(); slug = re.sub(r"[^a-z0-9]+", "-", label).strip("-"); print(slug or "preview")')
  TMP_IMAGE="$TMPDIR/$SAFE_NAME-full.png"

  echo "Screenshotting [$INDEX]: $LABEL → $OUTDIR/$SAFE_NAME.png"

  agent-browser --session "$SESSION" open "$URL" >/dev/null
  agent-browser --session "$SESSION" set viewport "$VIEWPORT_SIZE" "$VIEWPORT_SIZE" >/dev/null
  agent-browser --session "$SESSION" wait --load networkidle >/dev/null
  agent-browser --session "$SESSION" click "[data-preview-nav] [data-slot=button]:nth-of-type($((INDEX + 1)))" >/dev/null
  # Give the chart canvas and async quote data a moment to finish rendering.
  agent-browser --session "$SESSION" wait 2500 >/dev/null
  CROP_BOX_RAW=$(agent-browser --session "$SESSION" eval '
    (() => {
      const overlays = [
        "nextjs-portal",
        "[data-next-badge-root]",
        "[data-feedback-toolbar]",
        "[data-nextjs-toast]",
        "[data-nextjs-dialog]",
        "[data-next-mark]",
        "#__next-build-watcher",
      ];

      overlays.forEach((selector) => {
        document.querySelectorAll(selector).forEach((node) => {
          node.style.display = "none";
        });
      });

      const group = document.querySelector("[data-preview-nav]");
      if (group) {
        group.style.display = "none";
      }

      const container = document.querySelector("[data-preview-ticker]");
      if (container) {
        container.style.width = "360px";
        container.style.maxWidth = "360px";
      }

      const card = container?.firstElementChild;
      if (!container || !card) {
        return JSON.stringify({ error: "Card container not found" });
      }

      document.documentElement.style.width = "100%";
      document.documentElement.style.height = "100%";
      document.documentElement.style.margin = "0";
      document.documentElement.style.background = "#0a0a0f";
      document.documentElement.style.overflow = "hidden";
      document.body.style.background = "#0a0a0f";
      document.body.style.display = "flex";
      document.body.style.justifyContent = "center";
      document.body.style.alignItems = "center";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.overflow = "hidden";

      const cardRect = card.getBoundingClientRect();
      const centerX = cardRect.left + cardRect.width / 2;
      const centerY = cardRect.top + cardRect.height / 2;
      const cropSize = 430;
      const maxLeft = Math.max(0, window.innerWidth - cropSize);
      const maxTop = Math.max(0, window.innerHeight - cropSize);
      const left = Math.min(Math.max(0, Math.round(centerX - cropSize / 2)), maxLeft);
      const top = Math.min(Math.max(0, Math.round(centerY - cropSize / 2)), maxTop);

      return JSON.stringify({ left, top, size: cropSize });
    })()
  ')

  CROP_BOX=$(printf '%s' "$CROP_BOX_RAW" | python3 -c 'import json, sys; print(json.loads(sys.stdin.read()))')
  CROP_LEFT=$(printf '%s' "$CROP_BOX" | python3 -c 'import json, sys; print(json.loads(sys.stdin.read())["left"])')
  CROP_TOP=$(printf '%s' "$CROP_BOX" | python3 -c 'import json, sys; print(json.loads(sys.stdin.read())["top"])')
  CROP_SIZE=$(printf '%s' "$CROP_BOX" | python3 -c 'import json, sys; print(json.loads(sys.stdin.read())["size"])')

  agent-browser --session "$SESSION" screenshot "$TMP_IMAGE" >/dev/null
  sips --cropToHeightWidth "$CROP_SIZE" "$CROP_SIZE" --cropOffset "$CROP_TOP" "$CROP_LEFT" "$TMP_IMAGE" --out "$OUTDIR/$SAFE_NAME.png" >/dev/null
done

if [ -n "$ONLY_LABEL" ] && [ "$FOUND_MATCH" -eq 0 ]; then
  echo "Error: No preview item matched --only=$ONLY_LABEL" >&2
  exit 1
fi

echo "Done. Screenshots saved to $OUTDIR/"
