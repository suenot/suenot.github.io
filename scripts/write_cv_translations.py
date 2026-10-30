#!/usr/bin/env python3
"""Validate and UTF-8-write each localized CV JSON file."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CV_DIR = ROOT / "src" / "data" / "cv"
LOCALES = ("ru", "zh", "ko", "ja", "ar")


def load_json(path: Path) -> object:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise ValueError(f"{path}: invalid JSON: {error}") from error


def validate_shape(reference: object, translated: object, path: str = "$") -> None:
    if type(reference) is not type(translated):
        raise ValueError(
            f"{path}: expected {type(reference).__name__}, "
            f"got {type(translated).__name__}"
        )

    if isinstance(reference, dict):
        reference_keys = list(reference)
        translated_keys = list(translated)
        if reference_keys != translated_keys:
            raise ValueError(
                f"{path}: key order differs; expected {reference_keys}, "
                f"got {translated_keys}"
            )
        for key in reference_keys:
            validate_shape(reference[key], translated[key], f"{path}.{key}")
    elif isinstance(reference, list):
        if len(reference) != len(translated):
            raise ValueError(
                f"{path}: expected {len(reference)} items, got {len(translated)}"
            )
        for index, (reference_item, translated_item) in enumerate(
            zip(reference, translated)
        ):
            validate_shape(reference_item, translated_item, f"{path}[{index}]")


def main() -> None:
    reference = load_json(CV_DIR / "cv.en.json")

    for locale in LOCALES:
        target = CV_DIR / f"cv.{locale}.json"
        translated = load_json(target)
        validate_shape(reference, translated)

        # Keep every file readable, UTF-8 encoded, and free of ASCII escapes.
        target.write_text(
            json.dumps(translated, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

        # Verify the exact bytes just written still parse and retain the schema.
        validate_shape(reference, load_json(target))
        print(f"{target.name}: valid JSON; structure matches cv.en.json")


if __name__ == "__main__":
    main()
