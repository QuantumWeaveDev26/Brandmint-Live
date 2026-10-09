# Voice compatibility hotfix verification

Verified October 8, 2026. This report supersedes the historical initial-checkpoint reports in this folder.

## Reproduced failure and correction
- A synthetic, otherwise valid Realtime response with final content type `output_audio` was rejected by the delivered `audio`-only validator. The equivalent legacy fixture passed.
- Both documented audio labels now pass; text/unknown labels, changed prescribed words, incorrect IDs, incomplete output and size violations still fail closed.
- Optional omitted `content_index` is normalized only for input transcription deltas. Final transcripts still require a valid index. Existing VAD and interruption timings are unchanged.

## Final clean-copy checks
- Fresh `npm ci` succeeded, using the included lockfile.
- `npm test`: 101 passed, zero failed or skipped.
- TypeScript and production Vite build passed. Existing module-format and large-bundle warnings remain.
- `npm run voice:doctor` ran without any credentials: selected voice `cedar`, correct same-origin routes and port 8787, configured false, provider requests zero.
- `npm run voice:smoke` without `--live` made zero provider calls.
- Independently checked all 25 existing TSX/CSS files and 9 public assets byte-for-byte against the delivered project; unchanged. Existing agent modal/answer logic and VAD source are unchanged.
- Fixed stale setup/error-response races introduced while adding diagnostics, with regression tests. A throwing diagnostic callback cannot change PCM playback.
- Safe diagnostics tests reject raw provider error text, credentials, transcripts and audio data from logs.

## Actual cloud-browser checks, frozen production build
- The standalone diagnostic page reached the same-origin local server.
- The real shared Web Audio PCM player processed a synthetic half-second tone: context running; first chunk 731 bytes; decoded 2,400-sample chunks at 24 kHz mono; buffers scheduled; completed 24,000 bytes / 12,000 samples; playback ended. Controls were restored.
- This verifies real browser decoding/scheduling/completion with synthetic PCM. It is not an OpenAI-generated response and does not prove physical-speaker audibility.
- OpenAI readout test reached `/api/voice/speak`, received HTTP 503 `voice_unavailable`, and displayed the safe failure category.
- Microphone test stopped at configuration preflight, before microphone acquisition. The main widget did the same, without another voice provider fallback.
- Typed services question still returned the existing answer after voice failure. Typed contact phrase stayed in chat. Clicking Book Discovery Call opened `/contact`; no form was submitted.

## Exact remaining verification boundary
There is no configured API key in this test environment. The uploaded environment attachment was not read, materialized or used. No live OpenAI API call, real microphone transcription, real barge-in/noise test or physical audible-output test was performed.

The cloud test's live pipeline stops at backend configuration (`configured:false`), before OpenAI or microphone capture. This does not establish the failing stage on the user's privately configured computer. The validator defect is reproduced and fixed in code; end-to-end live voice success is not claimed.

## Local acceptance path
Follow `VOICE-TROUBLESHOOTING.md`. Keep the key only in `.env.server.local`; if a real key was uploaded, revoke it and configure a replacement privately. Build and start the project, then open the exact printed local URL, normally `http://127.0.0.1:8787`.

At `/voice-diagnostics.html`, run local PCM tone, OpenAI readout, and microphone input separately. Then test the actual agent with “What services do you provide?” and pause. Enable `VOICE_DEBUG=true` server-side and `?voiceDebug=1` browser-side for bounded stage diagnostics. Share only safe diagnostic output, never keys or environment files.
