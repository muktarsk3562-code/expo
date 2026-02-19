#!/bin/bash
cd "$(dirname "$0")" || exit 1

BUILD_LOG=$(mktemp)
SPIN=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
IDX=0
COUNT=0

xcodebuild \
  -workspace minimaltester.xcworkspace \
  -scheme minimaltester \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  CODE_SIGNING_ALLOWED=NO \
  2>&1 | while IFS= read -r line; do
    echo "$line" >> "$BUILD_LOG"

    # Show errors immediately in full
    if echo "$line" | grep -q " error:"; then
      printf "\r\033[K\033[31m✗ %s\033[0m\n" "$line"

    # Extract target name from compile/link steps for progress
    elif [[ "$line" =~ "in target '"([^\']*)"'" ]]; then
      TARGET="${BASH_REMATCH[1]}"
      COUNT=$((COUNT + 1))
      printf "\r\033[K${SPIN[$((IDX % 10))]} [%d] %s" "$COUNT" "$TARGET"
      IDX=$((IDX + 1))

    # Show build result lines
    elif [[ "$line" == "** "* ]]; then
      printf "\r\033[K%s\n" "$line"
    fi
  done

EXIT_CODE=${PIPESTATUS[0]}
printf "\r\033[K"

echo ""
echo "=========================================="

ERRORS=$(grep " error:" "$BUILD_LOG" | sort -u)

if [ $EXIT_CODE -eq 0 ]; then
  echo "✓ BUILD SUCCEEDED (minimaltester)"
else
  echo "✗ BUILD FAILED (minimaltester)"
  if [ -n "$ERRORS" ]; then
    echo ""
    echo "Unique errors:"
    echo "$ERRORS"
  fi
fi

echo "=========================================="
rm -f "$BUILD_LOG"
exit $EXIT_CODE
