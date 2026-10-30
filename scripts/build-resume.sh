#!/usr/bin/env bash
# Compile one resume PDF per site language into public/resume/ (needs Typst).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/resume
for lang in en ru zh ko ja ar; do
  typst compile --root . --font-path pdf/fonts --input "lang=$lang" pdf/cv.typ "public/resume/Eugen-Soloviov-CV.$lang.pdf"
  echo "built $lang"
done
