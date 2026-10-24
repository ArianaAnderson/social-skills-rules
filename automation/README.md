# Social Skills Rules operations

This directory automates resizing, caption-queue exports, public book-site link checks, and summaries of authorized metrics. It does not log in, publish, create claims, resolve account verification, or install visitor analytics.

## Boundaries

- Only work in `ArianaAnderson/social-skills-rules`. Do not write to the legacy folder or other Family Gallery repositories.
- Never put passwords, API credentials, browser sessions, personal account information, raw analytics, KDP sales/royalties, or private reports in this public repository.
- Keep real metrics, human review records, and generated reports in private local files and private report attachments.
- Account verification/appeals, final claims review, audience settings, community outreach, and first-video rights checks are human-controlled.
- A reviewed creative and scheduled Computer job do not prove a post was published. Verify and record the native URL/status.

## Commands

Requires Node.js 18+ and ImageMagick for resizing. None of these commands sends private metrics to a service.

```sh
node automation/campaign-ops.mjs self-test
node automation/campaign-ops.mjs queue --manifest campaign/2026-10-26/Campaign_Manifest.json --out /private/queue.csv --review /private/human-review.json
node automation/campaign-ops.mjs resize --source /private/master.png --platform pinterest --out /private/pin.png
node automation/campaign-ops.mjs links --manifest campaign/2026-10-26/Campaign_Manifest.json --out /private/link-checks.json
node automation/campaign-ops.mjs summarize --metrics /private/metrics.csv --out /private/topic-summary.csv --sales-out /private/kdp-summary.csv
```

The approved campaign manifest is verified by SHA-256. The resizing tool contains the source inside the platform canvas without cropping, changing words, or generating new art. Review the result before using a regenerated export.

Queue export provides one row per platform placement, topic/theme/book labels, dates, captions, destinations, and review gates. Missing human approval remains pending; the tool never grants it.

## Measurement rules

- Preserve missing or unavailable data as blank/null, never zero.
- Keep exact reporting windows, source timezone when known, and observation timestamps.
- Never add repeated rolling/lifetime snapshots together. The summary deduplicates within the same platform/post/window and does not merge unlike periods.
- Rates with zero or unknown denominators stay blank.
- Summed post reach is not unique audience across posts.
- YouTube inbound referrals are not clicks from YouTube to Amazon.
- UTMs label intended sources. They do not collect visits, clicks, or sales by themselves.
- KDP movement is correlation unless a real attribution method supports a stronger claim.
- KDP exports stay separate by book ID, format, marketplace, currency, subscription metric, and window. No mixed-currency totals or invented zero sales are produced.
- There is no visitor analytics installation in this implementation. Search Console is separate and only contributes data when connected and authorized.

The screen for a book-topic candidate is deliberately conservative: at least three measured posts, observations spanning at least three weekly periods, and exposure thresholds of 1,000 Pinterest impressions or 300 Instagram reach/YouTube views. These are operating thresholds, not statistical proof. A topic passing the screen still requires book-link interest and human reader-demand validation. Views alone never select a book.

## Baseline and weekly review

Existing launch posts predate the tracking setup. The first captured measurements are a post-launch baseline, not a reconstructed pre-first-post baseline. Record a true pre-publication snapshot before the next scheduled batch.

On Monday, report the prior Monday–Sunday in America/Chicago where native filters permit. If a platform uses a different window or unknown timezone, show the actual period explicitly. Rank Pinterest by available outbound clicks, click rate, saves and save rate; Instagram by available reach, saves and shares; YouTube by views and available retention/referral signals, keeping signal direction explicit. Show exposure, post age, missing data and low-sample warnings.

Suggest next-book topics only as evidence-supported hypotheses. Do not automatically rewrite or publish new claims, change audience settings, contact communities, or generate an unreviewed replacement queue.
