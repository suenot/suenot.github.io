---
title: "Making a YouTube video from NotebookLM material"
description: "A practical workflow for turning NotebookLM audio and slides into a reviewable video, preparing captions and metadata, and publishing only after a final check."
pubDate: 2026-05-09
heroImage: "/images/blog/notebooklm-youtube-hero.png"
tags: ["notebooklm", "youtube", "automation", "video", "ai", "open-source", "tooling"]
draft: false
---

# Making a YouTube video from NotebookLM material

[NotebookLM](https://notebooklm.google.com/) can turn source material into an audio overview and, depending on the features available to your account, presentation material. That gives you a useful starting point for an explanatory video. It does not remove the editorial work: listen to the narration, check every factual claim, and make sure the slides and captions say what you mean.

This workflow uses three separate projects. [video-maker](https://github.com/suenot/video-maker) combines an audio file and PDF slides. [video-metadata](https://github.com/suenot/video-metadata) prepares captions and draft metadata for an existing video. [video-publisher](https://github.com/suenot/video-publisher) can assist with a YouTube Studio upload through a local browser profile. You can use any one of them on its own.

## Start with material you can stand behind

Create a NotebookLM notebook from your article, notes, PDFs, or links. Generate the audio and slides only after the source material is ready for publication. Then download the audio and PDF.

Before building a video, check these three things:

- the narration does not add an unsupported claim or omit an important qualification;
- slide text is readable at video size and does not contain OCR-hostile layout;
- you own or have permission to use every source, image, voice, and music asset.

The last check is boring, but it is cheaper than repairing a published video.

## Build a video from audio and slides

Clone [video-maker](https://github.com/suenot/video-maker) and follow its current README for dependencies. The project uses Python tools, FFmpeg, PDF conversion, OCR, and Whisper. On macOS, a typical setup includes FFmpeg, Poppler, and Tesseract.

Place the downloaded files in the input directory expected by the repository, then run its pipeline for the appropriate language:

```bash
bash scripts/run_pipeline.sh en
```

The pipeline can render slides, transcribe audio, align slide text with the transcription, produce an MP4, and write subtitle and metadata files. The exact commands and filenames are repository-specific, so inspect the current script before adapting it to a different project.

The alignment is a forward match between OCR text from slides and timestamped speech. It works best when the speaker follows the slide order. It can make mistakes when the narration jumps around, when OCR reads a slide poorly, or when the slide contains little text. Watch the resulting video from start to finish. Do not assume a generated timeline is correct because the command completed successfully.

## Prepare captions and metadata

If you already have a finished video, use [video-metadata](https://github.com/suenot/video-metadata) instead of rebuilding it. The tool can transcribe speech, create an SRT file, and draft titles, descriptions, tags, and chapters from a related article.

Metadata still needs an editor. Verify that the title describes the video, chapter timestamps point to real sections, tags are relevant, and captions preserve names, numbers, and technical terms. A transcript is useful for accessibility and search, but a poor transcript is not harmless filler.

## Treat browser publishing as an assisted step

[video-publisher](https://github.com/suenot/video-publisher) drives YouTube Studio through a persistent local browser session. It can fill fields from metadata and upload a thumbnail, but it operates on a real account. Keep the browser profile, cookies, screenshots, and debug files private and out of version control.

Use a private visibility setting for the first upload. Open the resulting YouTube page, watch the processed video, inspect captions and chapters, and only then decide whether it should be unlisted or public. Follow YouTube's current terms and account requirements; browser automation can trigger verification or fail when the Studio interface changes.

The sequence is intentionally simple:

```text
source material
  -> NotebookLM audio and slides
  -> video-maker, if you need an MP4
  -> video-metadata for captions and draft metadata
  -> private YouTube upload and human review
```

Automation helps with repetitive conversion and field entry. The decisions that affect accuracy, rights, and whether a video is ready to publish still belong to the person running it.
