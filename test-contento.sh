#!/bin/bash
# Test contento profile with LM Studio
# Usage: ./test-contento.sh [model] [tags]
# Example: ./test-contento.sh mistral "star water fire"

MODEL=${1:-mistral}
TAGS=${2:-star water fire}

echo "🎨 Testing CONTENTO profile with LM Studio"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Model: $MODEL"
echo "Tags: $TAGS"
echo "Profile: contento (80 elements max, all shapes, ZERO text)"
echo ""

# Clean output dir
rm -rf output/*

# Generate
echo "📝 Generating SVG..."
node packages/cli/dist/index.js generate-svg $TAGS \
  --profile contento \
  --svg-provider lmstudio \
  --svg-model $MODEL

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESULTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SVG_FILE=$(ls -t output/*.svg 2>/dev/null | head -1)
LOG_FILE="${SVG_FILE%.svg}.log"

if [ ! -f "$SVG_FILE" ]; then
  echo "❌ No SVG generated"
  exit 1
fi

echo ""
echo "✅ Files generated:"
echo "   SVG: $SVG_FILE"
echo "   Log: $LOG_FILE"

echo ""
echo "📐 Element count:"
TOTAL=$(grep -o '<[a-z]*' "$SVG_FILE" | wc -l)
CIRCLE=$(grep -c '<circle' "$SVG_FILE" || echo 0)
PATH=$(grep -c '<path' "$SVG_FILE" || echo 0)
RECT=$(grep -c '<rect' "$SVG_FILE" || echo 0)
POLY=$(grep -c '<polygon\|<polyline' "$SVG_FILE" || echo 0)
GRAD=$(grep -c 'gradient' "$SVG_FILE" || echo 0)
PATTERN=$(grep -c '<pattern' "$SVG_FILE" || echo 0)
FILTER=$(grep -c '<filter' "$SVG_FILE" || echo 0)

echo "   Total tags: $TOTAL"
echo "   - circles: $CIRCLE"
echo "   - paths: $PATH"
echo "   - rects: $RECT"
echo "   - polygons: $POLY"
echo "   - gradients: $GRAD"
echo "   - patterns: $PATTERN"
echo "   - filters: $FILTER"

echo ""
echo "🚫 Text check:"
TEXT=$(grep -c '<text' "$SVG_FILE" || echo 0)
if [ "$TEXT" -eq 0 ]; then
  echo "   ✓ ZERO text elements (as required)"
else
  echo "   ⚠️  Found $TEXT text elements (should be 0)"
fi

echo ""
echo "⏱️  Generation time:"
grep "Generated:" "$LOG_FILE"

echo ""
echo "🎯 CONTENTO PROFILE GOALS:"
echo "   ☐ 40+ elements total (got: $TOTAL)"
echo "   ☐ Multiple shape types (circles, paths, rects, polys)"
echo "   ☐ Gradients or patterns (optional enhancement)"
echo "   ☑ Zero text elements"
echo ""
echo "📂 Open SVG:"
echo "   open $SVG_FILE"
