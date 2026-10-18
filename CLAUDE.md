# Elevo: rules for Claude Code

Elevo is a React Native / Expo iOS app. Follow these rules in every change. If a task conflicts with a rule, stop and ask.

## Elevo locked rules (ask before changing)
- awardXp (lib/xpEngine.ts) is the single writer of progression keys. No other writers.
- XP economy is locked: base 25/75/150/200; on-arch 1.0x, off 0.7x, side 0.9x; sub core 1.2 / strong 1.1 / relevant 1.05; new-habit 3x first 5 (cap 3 per 30d); JoAT 1.05 to 1.30; L2 = 500. Titles locked.
- Day keys use localDateString(). Never toISOString().split('T')[0].
- 79 tasks, source of truth is code. Renames need TASK_RENAMES + SCHEMA_VERSION in migrations.ts. activityContent stays 79/79.
- No streak shields. No pay-to-win.
- Cut, do not re-add: Mastery Tracks, Character Stats, Custom Archetypes, Reset Progress button.
- After every change: npx tsc --noEmit, then list the 5 spots most likely to break, ranked.
- If a "style only" task needs logic or state changes, stop and ask.

## Security
App is local-only (AsyncStorage) until Supabase is wired. Rules in this section apply once the backend exists. Until then, put all storage behind one data-access layer so it can be swapped without touching screens.

- Never trust the client. Admin checks, XP and reward grants, streaks, leaderboard data and usage limits are checked and written server-side only. A user must never be able to edit their own limits, XP or another user's data.
- Database: every table holding user data has row level security enabled with policies so users only read/write their own rows. Never create a table without RLS.
- Storage: file buckets (photos, uploads) are private with owner-only rules, same as tables. Never a public bucket for user files.
- No secrets in the app. The service-role/admin key and any paid API keys (e.g. Anthropic) live only on the server/edge functions. Anything in the app bundle, including `EXPO_PUBLIC_` env vars, is public. `.env` files stay in `.gitignore`. Server code uses the most limited key that works, not the master key.
- Every server function and API route checks the user is logged in, unless it is explicitly public. No endpoint returns other users' data (e.g. a users list with emails).
- Auth: use the auth provider, never hand-rolled auth. Require email verification. Store session tokens in `expo-secure-store`, not AsyncStorage. Sessions expire.
- HTTPS only. Passwords are never stored or handled in plain text.
- Rate limit login, sign-up, password reset and every AI endpoint. Bot protection on sign-up and any public form.
- AI coach: per-user daily/monthly usage limits, enforced server-side.
- Password reset links expire (around 30 minutes) and work only once. Reject leaked passwords if the provider supports it.
- Use UUIDs for IDs, never sequential/guessable IDs.
- Validate and sanitize all input server-side.
- Logs never contain passwords, tokens or card numbers.

## Errors
- Never show raw errors, stack traces, status codes or backend details to users. Log full details server-side only.
- User-facing errors say what happened, why, and what to do next. Not just "Something went wrong".
- No silent failures. Every action shows loading, success or failure. A button press always gives immediate visible feedback.

## Logging
- Structured logs, not console.log: timestamp, user ID, request ID, level (debug / info / error).
- Errors go to one central, searchable place.

## Performance
- Optimistic UI: update the screen immediately, sync with the backend in the background, roll back on failure.
- Fast cold start: don't block the home screen on network requests. Assume the user is still signed in, verify the session in the background and sign out only if it is rejected. Show the last cached home screen data on launch, then refresh.
- Independent requests run in parallel, never one after another.
- Batch database writes. No row-by-row writes in loops.
- Add proper indexes and query only the rows and columns the screen needs.
- Heavy work (AI requests, emails) runs as async jobs, never blocking the UI.
- When something is slow, measure the round trip and find the single slowest call before changing code.

## UI / UX
- Skeleton loaders, not spinners.
- Smooth transitions on every screen using `react-native-reanimated`. Nothing flickers in.
- Follow standard iOS patterns. Don't invent new placements for common controls.
- Onboarding: the continue button stays in the same position on every step.
- Gold #c9a84c is the single accent: primary actions, key numbers, active states. Don't introduce other accent colors.
- Never pure black or pure white. Use the design tokens.
- When a screen's point is a number (XP, streak, level), show it big first, with a small label underneath.
- Tap targets at least 44pt. Buttons give a press response (slight scale down).
- No dark patterns: cancelling a subscription is easy, wording around purchases is clear.

## App Store requirements
Check these before any release build:
- No placeholder text, no "beta", no mention of Android anywhere in the app.
- Every button works. No crashes.
- In-app account deletion.
- Sign in with Apple if Google login is offered.
- Restore purchases button. Paywall shows the full price.
- Privacy policy and terms of use links in the app.
- Ask permission before tracking. Every permission (camera, photos, notifications) has a clear reason string.
- Tell users when their data is sent to AI.
- Report and block for any user-to-user feature (friends, leaderboard, profiles).
- Layout works on iPad.
- No API keys in the app.
