# Elevo task backlog

Source: Master Doc v11 feature map plus the Oct 18 direction (skeleton of every feature first, polish later, no beta for now). Order is by dependency.

## How to run a task
- One task at a time: `/goal <task title and its "Done when">`.
- Every task also needs: `npx tsc --noEmit` clean, `npm test` passing (once T0 is done), no rule in CLAUDE.md broken, and a final report listing the 5 spots most likely to break, ranked.
- Commit after each finished task, on a branch, so every task is one reviewable diff.
- "Skeleton" means: reachable screen, core data model, one working happy path, minimal empty/error states, no visual polish. Do not build beyond that.
- Storage: after T1, all reads and writes go through the data-access layer. No direct AsyncStorage calls in screens.
- If a task needs a locked rule changed (CLAUDE.md), stop and ask.

## Phase 0: foundations (do first, in order)
- [ ] **T0 Tests for locked logic.** Jest via jest-expo with the AsyncStorage mock. Cover getMultiplier (all tiers and the documented order), getXpForLevel (L2 = 500, increasing), getTitle boundaries, localDateString (local not UTC, DST), awardXp (streak continue/reset, no double award, new-habit 3x). No source changes; report bugs instead of fixing. Done when: npm test passes, tsc clean, only lib/__tests__, package.json and CLAUDE.md changed.
- [ ] **T1 Data-access layer.** One module wrapping every AsyncStorage key, same behavior. Done when: no direct AsyncStorage calls outside that module, tests from T0 still pass, app behavior unchanged.

## Phase 1: local-only skeletons (can run while the backend schema waits for review)
- [ ] **Custom tasks, Case A.** Let users add existing off-archetype tasks to Home. Real 0.7x stays, no new economy. Done when: an off-archetype task can be added, appears on Home, awards XP at 0.7x, covered by a test.
- [ ] **Calendar weekly and monthly views.** Done when: calendar.tsx has day/week/month switching using existing data, no data-model change.
- [ ] **Per-task roadmap, format test.** Write the roadmap for the single hardest task only, as a format test before any batch of the 79. Done when: one task opens a roadmap view, format reviewed by Bálint.
- [ ] **Learn tab skeleton.** Browsable home for the teaching layer. Done when: tab lists tasks and opens existing teaching cards.
- [ ] **IRL skills teaching skeleton.** Discipline, confidence and similar. Done when: one skill has a screen and one lesson.
- [ ] **Aura-only avatars.** Avatar simplified to aura-first identity. Done when: profile shows the archetype aura instead of the current avatar.
- [ ] **Comfort zone quests skeleton.** Surprise timed real-world challenge, 500 XP. Done when: a quest can be issued, accepted, completed, and awards 500 XP through awardXp.
- [ ] **Long-term goals skeleton.** Multi-year goals with large XP. Done when: a goal can be created, listed, completed; XP via awardXp.
- [ ] **Alarm clock skeleton.** Dismissed by completing a morning task. Done when: alarm can be set and is dismissed by logging a morning task.
- [ ] **Birthday XP.** elevo_dob is already stored. Done when: birthday triggers XP and a message once per year via awardXp.
- [ ] **Calorie tracker, basic logging only.** Deeper food features are out of scope. Done when: log entries and daily total shown.
- [ ] **Profile themes skeleton.** Unlocked at level milestones. Done when: one extra theme unlocks at a level and applies.
- [ ] **Daily quote: check first.** getDailyQuote exists in lib/utils. Confirm what is shown today before building anything.
- [ ] **DOB picker on Android.** Change display to "spinner" in dob.tsx. Done when: Android shows the y/m/d wheel, age gate unchanged.

## Phase 2: backend (human-gated)
- [ ] **B1 Schema design. Not for the loop.** Bálint designs, dev friend reviews before any code. Cover tables, RLS policies, auth, server-side XP/streak validation, storage rules (CLAUDE.md Security).
- [ ] **B2 Supabase project, auth, schema.** Done when: schema from B1 applied, RLS on every table, a second test account cannot read the first one's rows.
- [ ] **B3 Swap the data-access layer to Supabase.** Done when: all storage goes through it, app works against the backend, local data migration path exists.
- [ ] **B4 Server-side XP, streaks, leaderboard data.** Client never writes these. Done when: a modified client cannot change its own XP.
- [ ] **B5 Privacy policy and store privacy details.** The current policy is false once data leaves the device. Done when: policy rewritten and republished.

## Phase 3: skeletons that need the backend (after B3)
- [ ] Friends (add, view progress, send encouragement)
- [ ] Report and block for every user-to-user feature
- [ ] Leaderboard (global and friends, weekly and all time)
- [ ] Progression photos (private bucket, owner-only)
- [ ] Monthly challenges (750 XP, design not done: decide before building)
- [ ] Daily founder messages (text first)
- [ ] AI personal coach (server-side usage limits, tell users data goes to AI)
- [ ] AI skill teacher
- [ ] Community, run clubs and group accountability
- [ ] Business and interest chat
- [ ] Events section
- [ ] Startup pitch section
- [ ] Real life status and rewards
- [ ] News and studies tab
- [ ] Subscription gating (from Master Doc section 8; paywall, restore purchases, full price shown)

Each of these needs its own "Done when" written before it is run.

## Parked
- Visual depth pass (gradients, layered shadows, accent details). Needs concrete reference screenshots first.
- Profile remodel and expansion.
- Public library (needs backend, moderation, ranking).
- Release and beta: dropped for now. Apple Developer enrollment still pending and is the only item with an external clock.

## Done, do not redo
Core loop, XP economy, archetypes and subs, JoAT fixes, onboarding, workout tracker, records, achievements, teaching cards (79/79), settings with privacy link, teaching modal scroll, UI restyle pass.
