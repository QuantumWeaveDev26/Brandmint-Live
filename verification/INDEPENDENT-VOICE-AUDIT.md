HISTORICAL INITIAL CHECKPOINT — before the audio/output_audio compatibility hotfix. See HOTFIX-VERIFICATION.md for the latest results.

# Independent OpenAI voice audit

Date: 8 October 2026

## Result

The final local aggregate passed **89 tests, 0 failures, 0 skips**. The production
build also passed. This is an offline code, synthetic-event, resource-lifecycle
and loopback-transport audit, not a real-microphone or live-OpenAI validation.

- 40 focused independent controller, provider-protocol and security tests
- 18 PCM, capture-worklet and audio-resource tests
- 31 migrated widget, answer-preservation and contact-navigation tests

Commands: `npm test`, `npm run build`, `npm run voice:doctor`.
Node version: 24.19.0. The build reports the existing large-chunk advisory; it
finishes successfully. The extracted delivery is not itself a Git checkout.

## Original behavior preservation

The reviewed input archive SHA-256 was:
`9c95dd7ecd7794463d57c4e76279225ad44221a1ee2dc791faa10059f3099fb5`.

Before implementation, hashes were captured for the original source and selected
AST spans. The independent tests retain those expected values and verify:

- Every unrelated source file remains byte-for-byte identical, including page
  implementations, styles, routing, forms and contact-navigation helpers.
- The knowledge array, default prompts, greeting, complete message handler,
  close/reset handlers and every modal `className` attribute are identical.
- All seven existing answer branches and the fallback produce the same typed
  and voice text and action buttons in the component harness.
- Typed chat and quick prompts remain silent. Contact voice commands retain
  their existing behavior; negative/question commands do not navigate.
- No booking, contact form, calendar action or external communication was made.

Only four existing `src` files changed: the voice controller, audio session,
endpoint detector, and modal. The modal's sole source change is the voice help
sentence disclosing OpenAI audio processing and AI-generated speech.

## Interruption and lifecycle evidence

Synthetic fixtures exercise the actual controller, rather than a separate model
of its behavior. They verify:

- Brief bursts, sustained amplitude and speech-start events without transcript
  evidence never cancel the active answer.
- Empty text, punctuation and non-speech labels are ignored. A preliminary word
  retracted to non-speech before confirmation does not cancel output.
- Recognized lexical evidence waits 180 ms before interrupting; only final text
  reaches the existing answer handler.
- Five consecutive interruptions abort each previous answer and playback.
- Duplicate events, late callbacks, delayed older committed transcripts and
  stopped-session events cannot revive an old answer or cancel a newer one.
- Stop/restart, close, reset, typed input, quick prompts, navigation, hidden pages,
  pagehide and unmount clean up active voice work.
- All already-scheduled PCM buffers stop on cancellation. Late microphone
  acquisition, rejected autoplay and failed worklet setup release their resources.
- The capture worklet emits 480-sample, 20 ms frames at 24 kHz from synthetic
  24/44.1/48 kHz input clocks.

These tests do not establish motorcycle/traffic noise immunity, speech-recognition
accuracy, acoustic echo performance, voice quality or measured latency. The
confirmation interval is time since transcript evidence, not measured speech
duration. Recognized echo or noise hallucinated as words can still interrupt.

## Output isolation and verification

The browser posts only a selected existing answer to its own server. The server
rejects arbitrary text and extra URL/model/voice/instruction fields before
invoking the renderer. The eight-entry allowlist is generated from the existing
handler; it is not another answer engine.

The fixed OpenAI read-out model receives only the formatting-cleaned prescribed
answer, empty input/history, `conversation: none`, no tools and no user question.
All PCM is buffered until correlated response/item/content IDs, the matching
emitted transcript, completed audio and a successful final response are checked.

Negative tests verify that no audio is released for:

- Different words, negations, numeric signs, decimal/grouping values, currencies
  or percentage/per-mille markers
- Wrong response, item, output or content IDs; unexpected tools/text content
- Cancelled, incomplete, failed or stale responses
- Missing transcript, missing audio, odd PCM length, oversized PCM or malformed base64
- Cancellation, timeout, malformed provider messages or safe provider-error paths

Output transcript checking is not independent waveform verification. Different
verbalizations of numbers or names can be rejected by design. Buffering adds
startup delay; actual latency has not been measured.

## Key and boundary checks

- `OPENAI_API_KEY` is read only by server code. The frontend has no key setting,
  native speech-synthesis fallback, ElevenLabs path or direct provider URL.
- The built browser code uses the same-origin `/api/voice/status`,
  `/api/voice/realtime` and `/api/voice/speak` paths.
- A production build and offline diagnostic were run with a clearly synthetic
  key sentinel. The sentinel was absent from every generated frontend file and
  captured output. Frontend hashes were unchanged from the no-key build.
- Vite configuration contains no whole-environment `define` or serialization.
  Offline diagnostics expose presence/configuration flags, not credential values.
- Source/build scans found no OpenAI private-key patterns or private PEM content.
- `.env.server.example` contains a blank `OPENAI_API_KEY=`. No actual
  `.env.server.local` or `.env.server.local.txt` exists in this prepared project.
- The `.gitignore` rules were checked in an isolated temporary Git repository:
  local env files are ignored, and only the blank example is explicitly allowed.
- No real OpenAI key was created, used or stored. No paid provider call was made.
  The final no-key diagnostic reports `provider_requests: 0` and
  `configured: false`.

HTTP and WebSocket tests cover exact origins, production opt-in, body/PCM bounds,
fixed upstream URLs, disabled redirects, model/control allowlisting, concurrency,
per-minute/hourly limits, server-owned session deadlines, backpressure, cancellation,
slow uploads and sanitized errors. Real loopback WebSocket handshake tests reject
cross-origin or missing-key attempts before the mocked provider is contacted.
The Node adapter ignores forged forwarded-IP headers.

An Origin allowlist is **not authentication**. Public hosting still requires
appropriate authentication/access controls and a shared limiter. The included
limits are per process, reset on restart, and are not an account-wide spending cap.

## Defects found and corrected during review

1. A malformed `null` upstream message could escape the input handler. It now
   fails closed, with a regression test.
2. A delayed older transcription could acquire a newer order and steal a current
   answer. Committed item IDs now establish turn order before final events.
3. The first read-out normalizer discarded currency/percentage meaning. It now
   preserves those tokens, with negative checks for removed/changed symbols.
4. The input server's evidence-idle timer could expire during a bounded buffered
   readout. It is now 180 seconds; frontend silence and absolute session caps remain.
5. Retained audio tests were migrated from 16 kHz/320 samples to 24 kHz/480 samples.

## Required next verification

After the owner privately adds their own key, test account/model access, the
transcription WebSocket handshake and audible exact-answer playback. Follow the
real-audio checklist in `VOICE-TESTING.md` for noise, speech over noise, repeated
interruptions, speaker echo and error recovery. No live compatibility result is
claimed here. See `OPENAI-VOICE.md` for current/archived API-source provenance and
persistent Node/WebSocket hosting requirements.

The browser UI report is separate from this synthetic/security audit. Existing
Supabase forms and external integrations were preserved but not submitted.
