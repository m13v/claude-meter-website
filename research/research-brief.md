# Research Brief: ClaudeMeter

## Positioning angle (one sentence)

ClaudeMeter is a free, open-source macOS menu bar app plus browser extension that shows Anthropic Claude Pro and Max subscribers their live rolling 5-hour and weekly plan usage without manual cookie extraction, for power users who keep hitting the wall mid-refactor or mid-document and need server-truth numbers before committing to the next big session.

## 3 differentiators

1. **Browser extension auto-captures the claude.ai session**, so install-to-first-reading takes seconds. Direct plan-usage competitors (hamed-elfayome/Claude-Usage-Tracker, ClaudeUsageBar) require users to open DevTools and paste a cookie. Proof: READMEs of both rival tools.
2. **Reads the server-truth numbers Anthropic actually enforces**, the same view as `claude.ai/settings/usage`, not token estimates from local `~/.claude/projects` JSONL. ccusage (~13k stars) and Claude-Code-Usage-Monitor only infer from local files. Proof: rjwalters/claude-monitor README confirms "The web dashboard at https://claude.ai/settings/usage shows your limits, but there's no programmatic equivalent."
3. **Free and MIT-licensed with zero telemetry**. Usagebar.com is paid and closed source. Four of the five plan trackers also claim "no telemetry," so the wedge here is transparency plus permissive license plus auditable Rust source.

## 5 messaging pillars

1. **Live rolling 5-hour + weekly Pro/Max usage in your menu bar.** Evidence: Anthropic's own limits doc (support.claude.com/en/articles/9797557) and users' verbatim pain like "You have reached your message limit until 4 PM" (Tom's Guide).
2. **Install in one brew command, browser extension fills in the auth.** Evidence: the README and the direct competitor's multi-step manual cookie paste (hamed-elfayome README).
3. **Server-truth numbers, not local JSONL guesswork.** Evidence: user quotes like "5% used from ONE message on a 5X Max account" (GH #9424) where local trackers cannot explain server enforcement.
4. **Privacy and transparency over marketing.** No telemetry, no analytics, no network egress beyond claude.ai itself. MIT license, Rust source. Evidence: competitor Usagebar is paid and closed source.
5. **Built for the two audiences Anthropic's rolling-quota change hurt most**: Claude Max developers running Claude Code in agentic loops, and Claude Pro heavy writers/researchers who hit the weekly wall midweek.

## ICP (2 personas)

### Persona 1: Aiden, AI-native software engineer on Claude Max ($100-$200/mo)
- Jobs-to-be-done: (1) finish one agentic "implement the feature" Claude Code run without cutoff; (2) work a full 8-hour day without hitting the session wall; (3) run Claude Code in automated loops without silently draining the daily budget.
- Pains (verbatim): "Claude code is so stingy that it stops in the middle of code modification"; "I typed 'test one two three' into CC. That put me at 12%."; "Max 20x subscriber ($200/month). Getting 'API Error: Rate limit reached' on every Claude surface... Session: 18% used".
- Objection: "I already have ccusage in the terminal." Counter: ccusage reads local JSONL tokens, ClaudeMeter reads the server-enforced plan quota. Complementary, not competing.
- Trigger: Claude Code dies mid-refactor, codebase half-migrated, googles "claude usage menu bar" at 2am.

### Persona 2: Priya, heavy Claude Pro writer/researcher ($20/mo)
- Jobs-to-be-done: (1) finish a multi-turn Deep Research run without being kicked at ~50 turns; (2) use Claude across a full work week, not just Mon-Tue; (3) know whether to start a big chat now or wait.
- Pains (verbatim): "i used it a little firday a little on saturday and maybe 10 minutes this morning and i hit the weekly limit already"; "It's a jarring moment that turns a seamless workflow into a complete standstill"; "$100 Max is the new PRO, PRO was just a trial".
- Objection: "A third-party tool reading my Claude session sounds sketchy." Counter: MIT, local-only, browser extension reuses existing claude.ai cookies.
- Trigger: weekday morning "You have reached your message limit until 4 PM" banner, tweets/Reddit, replies point at menu bar trackers.

## Proof points

- ClaudeMeter GitHub releases page is the verifiable source for adoption numbers. Do not fabricate stars until they exist on the repo page.
- Anthropic's own usage limits doc: https://support.claude.com/en/articles/9797557-usage-limit-best-practices
- Hacker News plan-limits thread 47586176 (46 comments documenting pain).
- Hacker News thread 46544524 (161 pts) covering the menu bar tracker category.
- The Register coverage of the January and March 2026 rolling-quota changes: theregister.com/2026/01/05/claude_devs_usage_limits/, theregister.com/2026/03/31/anthropic_claude_code_limits/.
- Tom's Guide 2026: tomsguide.com/ai/i-hit-claudes-new-usage-limits-and-it-changed-how-i-use-ai-forever.

## Competitor landscape (one paragraph)

Plan-usage trackers are a young, thin bench led by hamed-elfayome/Claude-Usage-Tracker (2.1k stars, macOS 14 only, manual cookie paste) and ClaudeUsageBar (macOS 12+, manual cookie paste). Usagebar.com is the only paid/closed-source option with strong SEO content. The broader "Claude usage" category is dominated by code-CLI tools like ccusage (~13k stars) and Claude-Code-Usage-Monitor, which read `~/.claude/projects` JSONL to estimate Claude Code token spend but cannot see Pro/Max plan quota. ClaudeMeter lives in the plan-usage lane, the only tool with a browser extension that removes manual cookie paste, and it is the only free/OSS option whose single focus is the server-truth numbers Anthropic enforces on the subscription page.

## Banned clichés

Pulled from competitor copy, do not reuse:

- "at a glance"
- "real-time" (use "live" when needed)
- "stay in flow"
- "privacy first"
- "never miss a thing"
- "know exactly"
- "right in your menu bar"
- "peace of mind"
- "world-class"
- "cutting-edge"

## Industry signals (last 90 days)

1. Anthropic tightened Claude Max and Pro rolling-window enforcement through January 2026 and March 2026, triggering a wave of public user complaints on HN, The Register, Tom's Guide, and GitHub issues (anthropics/claude-code #9424, #38335, #41212). Hero copy must acknowledge the rolling quota is tighter than users expected.
2. ccusage crossed 13k stars as the de facto "how much Claude did I burn" tool, but it cannot see plan quota. Create a comparison page that explicitly disambiguates server plan quota vs local Claude Code token burn.
3. Paid competitor Usagebar runs an active SEO blog at usagebar.com/blog/. The only way to contest this category on search is to ship guide pages under `/t/` faster than they do.
4. Browser extensions for claude.ai are allowed under Chrome/Arc/Brave/Edge side-load but blocked in Safari without Full Disk Access. Hero must not promise Safari support yet.
5. Anthropic's own `/api/organizations/{uuid}/usage` endpoint remains undocumented. FAQ must flag that the tool depends on an undocumented endpoint that Anthropic can change without notice.
