# Weekly health check — week of 2026-11-09

**As of 2026-11-09 10:48 UTC.** (Repeat of #157; read-only.)

**Answer.** Production is healthy and current. `/api/health` is `UP`, the sweep is fresh (last productive sweep 10:47:19Z, 6,368 rows, 0 skipped), and every `build-deploy` run on `main` in the window is green. Prod's `version` (`3aaedff`) sits one commit behind `main` (`0468609`) only because that commit's deploy is still running (started 10:39:34Z) — not a stale deploy. The nightly soak is **still not scheduled** (fix + patch below). The night build ran on each of the last three nights, including the one covering Sunday night. VPS sync (#57) is now **ok** — fixed since last week — and the Spend timer is alive.

## 1. Production — flight-tracker

- `GET /api/health` → `{"status":"UP","version":"3aaedff61f2092326438757058537def9b0e481d","db":"UP","lastSweepAt":"2026-11-09T10:47:19Z","lastSweepRows":6368,"skippedSweeps":0}` (HTTP 200, 10:47:58Z).
- `origin/main` head = `0468609213678a7b143539ce364410ff3c01a03e` (commit 2026-11-09 10:39:30Z, "Profile renderAircraftLayer at 2,000+ planes (#187)").
- `GET /api/health/sweep` → HTTP 200, empty body (content-length 0). The sweep fields are served on `/api/health`; freshness is good (10:47:19Z, well inside 3× the 360 s interval).
- **Version match:** prod is **one commit behind** `main`, and the reason is a deploy in flight (next section). Prod is currently running the previous head `3aaedff`, deployed by run 42595347935 (success, 09:41:32Z).

| Item | State | Evidence (UTC) | Stale |
|---|---|---|---|
| `/api/health` | UP | HTTP 200, 10:47:58Z | No |
| `version` vs `main` | 1 behind | `3aaedff` vs `0468609`; deploy in flight since 10:39:34Z | No |
| `/api/health/sweep` | 200 | 10:48:12Z (body empty; fields on /api/health) | No |
| Sweep fields | fresh | lastSweepAt 10:47:19Z, rows 6368, skipped 0 | No |

## 2. Deploy runs — `build-deploy.yml`, last 7 days

Window: since 2026-11-02 10:45Z. **174 runs: 158 success, 13 failure, 2 cancelled, 1 in progress.**

- All 13 failures are on `pull_request` branches. **Zero failures on `main`** (44 push runs; the only non-green one is the in-flight run).
- Latest success: run [42595347935](https://github.com/petterfranzen/flight-tracker/actions/runs/42595347935) (`3aaedff`, finished 09:41:32Z).
- In flight: run [42602474080](https://github.com/petterfranzen/flight-tracker/actions/runs/42602474080) (`0468609`), started 10:39:34Z.
- **Retry-flaky:** the workflow lets Playwright retry once, so a `retry #1` line means the retry failed too. Failures that failed both attempts:
  - `tests/gate-placement.spec.ts` — "planes drawn" `expect.poll` timeout; task/176-followups, 2026-11-09 05:20Z ([run](https://github.com/petterfranzen/flight-tracker/actions/runs/42566706429)). This is the known gate-placement timeout (#238).
  - `tests/offline.spec.ts` + `tests/pwa.spec.ts` — service-worker activation/scope; task/181-sw-offline, 2026-11-09 08:13Z ([run](https://github.com/petterfranzen/flight-tracker/actions/runs/42584357821)).
  - `tests/install-banner.spec.ts` — "attribution covered"; task/123-install-pill-polish, 2026-11-06 18:25Z ([run](https://github.com/petterfranzen/flight-tracker/actions/runs/42270591703)).

## 3. Nightly soak — still not scheduled (last week's open item)

No. No workflow in any of the seven repos carries a `schedule:`/`cron:` trigger; flight-tracker's `.github/workflows/` holds only `build-deploy.yml` and `claude.yml`. The soak body still ships un-installed at `blackbox-tests/soak/soak-workflow.yml` (cron `17 3 * * *` UTC). The fix is to install it as `.github/workflows/soak.yml`; agents' token has no `workflow` scope, so the Major must push it. Proposed patch (creates the file, change nothing else):

```diff
diff --git a/.github/workflows/soak.yml b/.github/workflows/soak.yml
new file mode 100644
index 0000000..ec55bba
--- /dev/null
+++ b/.github/workflows/soak.yml
@@ -0,0 +1,98 @@
+# Nightly live-feed soak and load test.
+#
+# This is NOT part of the PR gate. It is long and CPU-hungry by design: the
+# point is to put production-size traffic through the WebSocket fan-out and
+# report latency/memory, not to block a merge. Run it nightly or by hand.
+#
+# The sandbox token used to author the soak harness cannot push files under
+# .github/workflows/ (no `workflow` scope), so this body ships next to the
+# harness and the coordinator copies it to .github/workflows/soak.yml.
+name: Live-feed soak
+
+on:
+  schedule:
+    - cron: "17 3 * * *"   # 03:17 UTC nightly, off the hour to avoid the cron thundering herd
+  workflow_dispatch:
+    inputs:
+      duration_seconds:
+        description: "Steady-state seconds"
+        default: "900"
+      clients:
+        description: "Concurrent WebSocket clients"
+        default: "100"
+      aircraft:
+        description: "Synthetic worldwide aircraft"
+        default: "12000"
+
+permissions:
+  contents: read
+
+concurrency:
+  group: soak-${{ github.ref }}
+  cancel-in-progress: false
+
+jobs:
+  soak:
+    runs-on: ubuntu-latest
+    timeout-minutes: 60
+    steps:
+      - uses: actions/checkout@v7
+
+      - uses: actions/setup-java@v6
+        with:
+          distribution: temurin
+          java-version: "21"
+          cache: maven
+
+      - uses: actions/setup-node@v7
+        with:
+          node-version: 24
+
+      # The soak exercises the API and WebSocket only; the frontend bundle is
+      # not needed, so this skips the Vite build and keeps the run short.
+      - name: Build the jar
+        run: mvn -B package -DskipTests
+        working-directory: backend
+
+      - name: Run the soak
+        env:
+          SOAK_DURATION_SECONDS: ${{ github.event.inputs.duration_seconds || '900' }}
+          SOAK_CLIENTS: ${{ github.event.inputs.clients || '100' }}
+          SOAK_AIRCRAFT: ${{ github.event.inputs.aircraft || '12000' }}
+          SOAK_POLL_SECONDS: "18"
+          SOAK_OUT: soak-report.json
+          # Optional budgets — leave unset until a baseline exists on this runner.
+          # SOAK_MAX_P95_MS: "10000"
+          # SOAK_MAX_RSS_MB: "2500"
+        run: node blackbox-tests/soak/soak.mjs
+
+      - name: Upload soak report
+        if: always()
+        uses: actions/upload-artifact@v7
+        with:
+          name: soak-report
+          path: |
+            soak-report.json
+            soak-app.log
+          if-no-files-found: ignore
+          retention-days: 30
+
+      - name: Summary
+        if: always()
+        run: |
+          if [ -f soak-report.json ]; then
+            node -e '
+              const r = require("./soak-report.json");
+              const s = r.latency || {};
+              console.log("### Live-feed soak: " + (r.ok ? "PASS" : "FAIL"));
+              console.log("- clients: " + r.clients.configured + ", steady frames: " + r.frames.steady + " (" + r.frames.perSecondSteady + "/s)");
+              console.log("- frame age p50/p95/p99/max: " + [s.p50Ms, s.p95Ms, s.p99Ms, s.maxMs].join(" / ") + " ms");
+              console.log("- server RSS start/end/peak: " + [r.server.rssMb.atSteadyStart, r.server.rssMb.atSteadyEnd, r.server.rssMb.peak].join(" / ") + " MB");
+              console.log("- delivery ratio: " + r.delivery.ratio);
+              if (r.failures.length) console.log("- failures: " + r.failures.join("; "));
+              console.log("");
+              console.log("Full JSON is in the soak-report artifact.");
+            ' >> "$GITHUB_STEP_SUMMARY"
+          else
+            echo "### Live-feed soak: no report produced" >> "$GITHUB_STEP_SUMMARY"
+          fi
```

## 4. Night build — last 3 nights

All three ran (one PR each in ghost-in-the-machine):

| Night | Produced | Timestamp (UTC) |
|---|---|---|
| 2026-11-07 | PR [#28](https://github.com/petterfranzen/ghost-in-the-machine/pull/28) Aurora Ridge (Dart); issue #149 | 2026-11-07 00:06 |
| 2026-11-08 | PR [#36](https://github.com/petterfranzen/ghost-in-the-machine/pull/36) Dune Drift (AssemblyScript); issue #198 (closed) | 2026-11-07 23:38 |
| 2026-11-09 | PR [#39](https://github.com/petterfranzen/ghost-in-the-machine/pull/39) Low Tide (PureScript); issue #227 | 2026-11-09 00:20 |

## 5. Sunday-night cron

The name is still ambiguous, and nothing Sunday-specific is in the readable config. The roster's only live routine is the daily night build (`0 1 * * *` Europe/Stockholm = 00:00 UTC; the QA sweep and morning ops are `active = false`). The run covering Sunday night into Monday ran: issue #227 created **2026-11-09 00:01:53Z**, PR #39 at 00:20:33Z. If "the Sunday-night cron" is a separate private routine, it is not readable from here (Uncertain).

## 6. VPS timers — sync, spend, credits, capacity

- **Sync #57 — ok.** "As of 2026-11-09 10:25 UTC", *Up to date at 7c17cc0*; `section9-routines.timer` and `section9-dispatch.timer` both active, last trigger 10:24 UTC, last result success. **Fixed since last week's block.**
- **Spend #11 — alive.** "As of 2026-11-09 10:31 UTC" (17 min old, < 3 h): $30.24 of the $60.00 month cap. The spend timer has **not** stopped.
- CPU credits #36 — "As of 10:31 UTC". Capacity #80 — "As of 2026-11-08 19:20 UTC" (daily cadence, normal).

## Uncertain

- **Which job "the Sunday-night cron" names.** Nothing Sunday-specific is readable; if it is a private routine I have no visibility. I answered for the daily night build, the closest match.
- **Whether deploy 42602474080 succeeds.** It was in flight (10:39:34Z) at check time; the `version == main` test will only pass once it lands.
- **`/api/health/sweep` body.** HTTP 200 but zero-length; I could not confirm it serves JSON, so I read sweep state from `/api/health`.
- **`/api/ops/stats`** remains behind Cloudflare Access (403); not attempted with the service token.

## Proposed follow-ups (list only — not created)

1. **agent:major** — install the soak as `.github/workflows/soak.yml` (patch above); needs `workflow` scope, which agents lack.
2. **agent:togusa** — the gate-placement "planes drawn" timeout keeps failing even the retry (#238); worth a root-cause, not another re-run.
3. **agent:tachikoma** — the 11-09 night used the generic title "Nightly build" (issue #227) instead of the dated "Night build 2026-11-09"; align with the RUNBOOK convention.
4. **agent:togusa** — oldest open PRs (ghost-in-the-machine #20/#21, flight-tracker #142) are still unmerged; nudge or close.

— Ishikawa
