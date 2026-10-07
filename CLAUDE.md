# CLAUDE.md

## Project

InfoQuantity Academy is a dependency-free static educational app for information theory. Preserve all seven tabs and both Japanese and English. It runs on GitHub Pages, a local HTTP server, and directly via file://.

## Architecture

- index.html: Japanese lesson source and accessible interface.
- core.js: DOM-independent validated calculations, exposed as InfoCore in the browser and CommonJS in Node.
- script.js: event handling, calculators, quiz, records and responsive Canvas drawing.
- messages.js: corresponding Japanese/English keys and interpolation placeholders for dynamic text.
- lesson-en.js: English translations keyed by normalized Japanese source text.
- i18n.js: safe text-node translation and language switching without replacing form controls.
- settings.js: language and theme initialization before CSS; storage failures are nonfatal.
- style.css: mobile-first layout, light/dark themes, focus and reduced-motion handling.
- test/: Node built-in tests; .github/workflows/test.yml runs them with Node.js 22.
- README.md / README.en.md: matching documentation; assets/ and assets/en/ contain real screenshots.

Do not add dependencies, CDNs, inline scripts, eval, or HTML interpolation. Preserve the strict CSP and file:// operation. Update dynamic output on every input, preset, clear, language and theme change that affects it.

## Mathematical and educational rules

- Reject invalid input without clamping, truncating or normalizing it silently. An empty field is not zero.
- Distribution probabilities are in [0,1] and sum to 1 within 0.000001.
- Information at probability zero is displayed as infinity by its limiting interpretation; log(0) is undefined over the reals.
- An entropy term at probability zero contributes zero. Never calculate infinity minus infinity.
- Independent joint information uses the sum of logarithms to avoid probability-product underflow.
- Subjective surprise is recorded, never scored against an ideal line. Compare predicted and assigned probabilities instead.
- Keep infinite records explicit in the list; plot only finite points. Limit records to 100.
- Entropy is not semantic importance or a security certificate.
- Average guesses (N+1)/2 assumes N equally likely candidates, no repeated guesses, and a recognizable correct answer.
- Do not infer attack time, cryptographic strength or quantum resistance from entropy alone.
- Teaching probabilities are not observations, forecasts or real lottery odds.
- Keep Japanese and English assumptions and limitations equally explicit.

## Validation

Run `npm test` with Node.js 22 or later; no install or build is required.
For local HTTP checks, use `python -m http.server 8000` and open http://localhost:8000.
Also verify file://, all seven tabs, both languages and themes, narrow/wide screens, keyboard tabs, invalid/zero inputs, language-switch state retention and unavailable storage.

Use known expected values rather than calculating expectations with the function under test.
Changes to Japanese lesson text must update lesson-en.js in the same change.
Capture real browser screenshots after UI changes; inspect them and keep each PNG below 300 KB.
Update both README files together, including numbers, assumptions, links and the directory tree.

## Publication

Use a feature branch and pull request, wait for CI, and perform an ordinary merge.
Check main-branch tests, Pages deployment and public assets against the merged commit.
Do not delete branches until merge/publication and backup have been verified.
