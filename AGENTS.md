<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Streak Rules

- Streaks are driven **exclusively by marking a capability complete** (`POST /api/user/progress`). Never update streaks on login, page visit, or any other event.
- Streak increments once per calendar day (UTC). Marking multiple capabilities in one day still counts as 1.
- Missing one day is OK — the streak holds. Missing two or more consecutive days resets the streak to 1.
- Logic lives in `updateStreak()` in `src/app/api/user/progress/route.ts`. The same expiry check (≥2 days since last activity) must stay in sync in `src/app/api/user/profile/route.ts` and `src/app/home/page.tsx`.
