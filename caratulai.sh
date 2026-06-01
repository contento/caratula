#!/bin/bash
# caratulai — convenient CLI wrapper for the alien image generator
# Usage: ./caratulai.sh generate --from-text "A starry ocean"
#        ./caratulai.sh palettes
#        ./caratulai.sh --build generate star water travel

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if --build flag is passed
BUILD=false
if [[ "$1" == "--build" ]]; then
  BUILD=true
  shift
fi

# Build if flag is set or if dist doesn't exist
if [[ "$BUILD" == "true" ]] || [[ ! -d "$SCRIPT_DIR/packages/cli/dist" ]]; then
  echo "Building caratulai..." >&2
  cd "$SCRIPT_DIR"
  pnpm build > /dev/null 2>&1
fi

# Run the CLI
node "$SCRIPT_DIR/packages/cli/dist/index.js" "$@"
