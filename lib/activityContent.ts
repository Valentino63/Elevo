// ELEVO — Final blended activity content for all 79 daily habits.
// Synthesized from Perplexity, ChatGPT, Gemini (where available), and Claude/Opus —
// merged into one app-ready version per task.
//
// NOTE: The original message was truncated. Entries for 'Standing for your morals
// (end of day reflection)' and all subsequent tasks are missing — add them manually.
// Missing keys (use exact spelling from activityExplanations in utils.ts):
//   'Standing for your morals (end of day reflection)'
//   'Being grounded (end of day reflection)'
//   'Be content with yourself (end of day reflection)'
//   'Being social', 'Initiate a conversation with a stranger'
//   'Give someone a genuine compliment', 'Organise or attend a social event'
//   "Call or meet a friend you haven't spoken to in a while"
//   'Practice public speaking (mirror/recording)'
//   'Active listening — full presence, no phone'   ← was 'Active listening (full presence, no phone)' in original paste
//   'Do something kind without expecting anything'
//   'Spend quality time with family (no phones)'
//   'Have a meaningful conversation with a family member', 'Plan a family activity'
//   'Financial planning session', 'Tell someone you love them'
//   'Publish something (post, video, article)', 'Brainstorm session (15 min minimum)'
//   "Study someone you admire's work", 'Engage with your audience'
//   'Batch content creation session (1hr minimum)', 'Seek feedback on your work'
//   'Review finances/business metrics'            ← was 'Review finances and business metrics' in original paste
//   'Outreach to a potential client or collaborator'
//   'Work on the business not in it (30min strategic)' ← was '...30 min...' in original paste
//   'Sales or negotiation practice', '1 hour silence', '1 day fast', 'Skill audit'
//   'Misogi'                                      ← was 'Misogi (a task with ~50% failure rate)' in original paste
//   "New Year's review", '1 week total digital detox'

export type ActivityContent = {
  benefits: string[];
  howTo: string[];
  science: string;
};

export const activityContent: Record<string, ActivityContent> = {
  // ===================== PILOT TASKS =====================

  'No phone for 60 min after waking': {
    benefits: [
      `Start the day directing your attention instead of reacting to notifications, news, and messages`,
      `Lower stress and mental clutter by avoiding early information overload`,
      `Sharper focus and better mood for hours afterward — you set the tone instead of having it set for you`,
      `Builds your sense of control over your own attention`,
    ],
    howTo: [
      `Charge your phone outside the bedroom and use a physical alarm clock`,
      `Decide the night before what you'll do instead: hydrate, stretch, walk, journal, read, or plan your day`,
      `If you need your phone for emergencies, leave it on Do Not Disturb — no apps, messages, or social media until the hour is up`,
      `Tell people in advance you're "offline" for the first hour so you're not anxious about replying`,
    ],
    science: `Right after waking, your brain is mid-transition from sleep to full alertness — still highly impressionable and forming the day's emotional anchor, while cortisol naturally rises. Phones flood you with novel, emotionally charged information that triggers dopamine and outward-pulled attention, conditioning your brain to be reactive rather than intentional. Skip that, and your prefrontal cortex comes online first, so you choose what to focus on instead of having it hijacked.`,
  },

  'Cold shower': {
    benefits: [
      `Instant alertness — a surge of norepinephrine and dopamine clears brain fog and lifts mood for hours`,
      `Builds real mental toughness: practicing discomfort on command, daily, on a 90-second loop`,
      `Speeds up muscle recovery and may reduce soreness/inflammation after training (modest but real effects)`,
    ],
    howTo: [
      `Finish your normal shower with 30-60 seconds of cold water — work up gradually toward 2-3 minutes`,
      `Breathe slow and steady through the shock instead of gasping or tensing up`,
      `Keep it consistent so it stops being a daily decision; check with a doctor first if you have cardiovascular conditions`,
    ],
    science: `Cold water triggers your sympathetic nervous system, releasing norepinephrine and dopamine that stay elevated and keep you alert for hours. It also causes vasoconstriction then vasodilation once you warm up, flushing muscles with oxygenated blood. The bigger win is mental: choosing something uncomfortable on command, every day, rewires your relationship with discomfort.`,
  },

  'Journal': {
    benefits: [
      `Clarifies priorities — turns vague worries and goals into concrete, written-down targets`,
      `Reduces mental clutter by offloading thoughts from working memory onto paper`,
      `Builds self-awareness and a record you can review to spot patterns in mood, habits, and progress`,
    ],
    howTo: [
      `Pick one fixed time — morning (plan) or evening (review) — and stick to it`,
      `Keep it short: 3 bullets on today's priorities, or what happened and how you felt`,
      `Use prompts when you blank: "What's the one thing that makes today a win?"`,
    ],
    science: `Writing forces you to organize scattered thoughts into linear, specific language. This "affect labeling" is why expressive writing lowers stress and anxiety — naming a worry on paper measurably reduces its emotional charge and frees up working memory. Writing goals down also strengthens encoding, turning vague intentions into concrete, actionable plans.`,
  },

  'Networking': {
    benefits: [
      `Opens doors that skill alone won't — opportunities and information move through people, not job boards`,
      `Speeds up learning by compressing others' years of trial and error into a single conversation`,
      `Builds a support system and resource pool you can call on — and contribute to — over time`,
    ],
    howTo: [
      `Set a small daily target: reach out to or reconnect with one person via a short, genuine message`,
      `Lead with value, not asks — share something useful or give a specific compliment first`,
      `Track it: keep a simple list of names, where you met, and your next follow-up — and actually follow up`,
    ],
    science: `Opportunities move through social ties more than formal channels — "the strength of weak ties." Casual acquaintances often matter more for opportunities than close friends, because they bridge you into entirely new networks and expose you to ideas you'd never otherwise see. Trust builds incrementally through repeated, low-stakes, reciprocal interactions.`,
  },

  // ===================== BATCH 1 — Morning / Nutrition / Physical =====================

  'Wake up when said without fuss': {
    benefits: [
      `Eliminates the daily friction of negotiating with yourself, freeing willpower for things that matter`,
      `Sets a disciplined tone for the entire day — the first win compounds into more wins`,
      `Improves sleep consistency over time, since a fixed wake time anchors your whole circadian rhythm`,
    ],
    howTo: [
      `Place the alarm across the room so you physically have to get up to silence it`,
      `Decide the night before, out loud or in writing, that there is no negotiation — you get up on the first alarm`,
      `Get out of bed and into light/movement within 60 seconds of standing, before your brain can argue`,
    ],
    science: `Hitting snooze fragments the last stage of sleep and dumps you back into a lighter cycle, producing "sleep inertia" — grogginess that can last hours. Acting instantly on the alarm removes the decision point where willpower gets drained (decision fatigue), and a stable wake time is one of the strongest anchors for your circadian clock, improving alertness and mood all day.`,
  },

  'Morning routine': {
    benefits: [
      `Creates momentum before distractions take over, making healthy choices automatic rather than effortful`,
      `Improves energy, alertness, and focus for the rest of the day`,
      `Reduces decision fatigue by front-loading your best habits into a fixed sequence`,
    ],
    howTo: [
      `Avoid your phone for the first part of the morning and get 5-15 minutes of outdoor sunlight`,
      `Hydrate and move your body for a few minutes before anything else`,
      `Run the same sequence daily so it stops requiring willpower — habit replaces decision`,
    ],
    science: `The first hour after waking shapes energy, attention, and mood for the rest of the day. Morning sunlight regulates your circadian rhythm, improving daytime alertness and nighttime sleep, while light movement increases blood flow and cuts sleep inertia. Repeating the same sequence daily shifts it from effortful choice to automatic behavior, conserving mental energy for harder decisions later.`,
  },

  'Nutrient dense breakfast': {
    benefits: [
      `Provides steady energy through the morning and improves satiety, reducing cravings later`,
      `Supports muscle recovery and growth through adequate morning protein`,
      `Increases intake of essential vitamins, minerals, and fiber`,
    ],
    howTo: [
      `Include 25-40g of protein (eggs, yogurt, protein shake, cottage cheese)`,
      `Add fruit, vegetables, or other whole, minimally processed foods`,
      `Avoid turning breakfast into a sugar-heavy dessert disguised as a meal`,
    ],
    science: `Protein slows digestion, supports muscle protein synthesis, and blunts hunger more than carbs or fat alone — which is why high-protein breakfasts are linked to better appetite control and steadier energy. Nutrient-dense whole foods supply the vitamins, minerals, and fiber your body uses for normal function, versus processed, sugar-heavy options that spike and crash blood sugar.`,
  },

  'At least 3L of water': {
    benefits: [
      `Supports physical and mental performance and reduces fatigue from mild dehydration`,
      `Helps regulate body temperature and supports digestion`,
      `Keeps concentration and mood more stable throughout the day`,
    ],
    howTo: [
      `Drink a large glass of water immediately after waking`,
      `Carry a reusable bottle and sip on a schedule rather than waiting until you're thirsty`,
      `Increase intake on hot days or after intense exercise`,
    ],
    science: `Water is involved in nearly every major bodily process — circulation, temperature regulation, nutrient transport. Even mild dehydration measurably impairs concentration, mood, and physical performance. Needs vary by body size and activity, so 3L is a useful general target rather than a strict universal rule, but consistent intake keeps blood volume and organ function steady.`,
  },

  'Hit daily protein and calories': {
    benefits: [
      `Supports muscle growth, recovery, and workout performance`,
      `Helps maintain a healthy, predictable body composition over time`,
      `Makes physical progress measurable instead of guesswork`,
    ],
    howTo: [
      `Set a daily protein target based on your goals and bodyweight (roughly 1.6-2.2g/kg for most active people)`,
      `Spread protein across meals and track calories if you're actively trying to gain or lose weight`,
      `Prioritize hitting the number consistently over hitting it perfectly`,
    ],
    science: `Your body needs sufficient energy and amino acids to repair and build tissue. Protein supplies the building blocks for muscle repair; calories fund training, recovery, and daily function. Research consistently shows adequate protein combined with resistance training is one of the most reliable ways to build strength and improve body composition — chronic under-eating blunts all of it.`,
  },

  'Eating healthy (no sugar, no processed, RDIs)': {
    benefits: [
      `Improves energy stability throughout the day and reduces excessive hunger and cravings`,
      `Supports long-term physical health and easier weight management`,
      `Makes hitting your nutrient targets far more automatic`,
    ],
    howTo: [
      `Base most meals on whole, minimally processed foods — protein, vegetables, fruit, whole grains`,
      `Limit added sugar and ultra-processed snacks; read labels for hidden sugars`,
      `Aim to consistently meet your nutrient needs rather than chasing perfection on any single day`,
    ],
    science: `Whole foods carry more fiber, protein, vitamins, and minerals per calorie than processed foods, which combine sugar, fat, and salt in ways that are unusually easy to overeat and provide less satiety. Dietary patterns built around whole foods are consistently linked to better metabolic health, easier weight management, and lower long-term disease risk — the overall pattern matters far more than any single meal.`,
  },

  'Taking supplements': {
    benefits: [
      `Helps close specific nutrient gaps that diet alone may not cover`,
      `Supports performance and recovery in clearly evidenced cases (e.g. creatine, vitamin D, omega-3)`,
      `Adds convenience and consistency to an otherwise solid nutrition plan`,
    ],
    howTo: [
      `Get bloodwork where possible to identify actual deficiencies before supplementing heavily`,
      `Stick to supplements with strong evidence for your specific goal and follow recommended dosages`,
      `Treat supplements as a top-up to a good diet, never a replacement for one`,
    ],
    science: `Supplements help most when they correct an actual deficiency, dietary restriction, or specific elevated need — vitamin D, creatine, and omega-3s have solid evidence in defined contexts. Whole foods contain interacting compounds that isolated supplements can't replicate, so the research consistently shows the biggest gains come from filling real gaps, not stacking pills on top of an already-good diet.`,
  },

  'Debloat protocol': {
    benefits: [
      `Reduces bloating and stomach discomfort, improving how you feel day to day`,
      `Builds better digestion habits that compound over weeks`,
      `Can boost confidence and body awareness in the short term`,
    ],
    howTo: [
      `Eat slowly, chew thoroughly, and stop before you're overly full`,
      `Cut back on high-sodium and heavily processed foods, and limit carbonated drinks if they bother you`,
      `Take a short walk after meals instead of sitting or lying down immediately`,
    ],
    science: `Bloating is usually caused by swallowed air, slow digestion, or water retention rather than fat gain. Eating fast increases air intake and overwhelms digestion; high sodium temporarily pulls in extra water. Light post-meal movement stimulates gut motility, helping food move through more efficiently — most "debloating" works by lowering digestive load, not by changing your body composition.`,
  },

  'Any form of cardio': {
    benefits: [
      `Improves heart and lung health and increases endurance over time`,
      `Boosts mood and reduces stress through changes in brain chemistry`,
      `Supports long-term metabolic health and easier weight management`,
    ],
    howTo: [
      `Pick something sustainable — running, cycling, brisk walking, swimming, rowing`,
      `Aim for roughly 20-40 minutes most days, starting at a moderate, conversational pace`,
      `Progress gradually in duration or intensity rather than going all-out from day one`,
    ],
    science: `Aerobic exercise strengthens the heart so it pumps more blood with less effort and improves how efficiently your muscles use oxygen. It's linked to better blood pressure, lower disease risk, and increased levels of mood-regulating neurotransmitters. The benefits come from consistent, moderate effort over time — not occasional brutal sessions.`,
  },

  'Training (weights/calisthenics/plyometrics)': {
    benefits: [
      `Builds muscle, strength, and physical resilience that carries into everyday life`,
      `Improves body composition, metabolism, and long-term joint and bone health`,
      `Builds discipline and confidence through visible, measurable progress`,
    ],
    howTo: [
      `Train 3-5 times a week using a structured plan that targets all major muscle groups`,
      `Apply progressive overload — gradually add weight, reps, or difficulty over weeks`,
      `Prioritize good form over heavy weight, and build in rest days for recovery`,
    ],
    science: `Resistance training creates small amounts of stress in muscle fibers; the body repairs them stronger, which is how strength and muscle grow. This adaptation also improves insulin sensitivity and bone density. Progressive overload matters because the body only adapts when challenged beyond its current capacity — and growth happens during recovery, not during the workout itself.`,
  },

  'Stretching': {
    benefits: [
      `Improves flexibility, range of motion, and overall movement quality`,
      `Reduces stiffness, supports recovery, and can lower injury risk in certain areas`,
      `Improves posture by releasing chronically tight muscles`,
    ],
    howTo: [
      `Stretch major muscle groups daily or right after workouts while muscles are warm`,
      `Hold each stretch 20-40 seconds, breathing slowly — no bouncing`,
      `Focus on the areas that feel tightest or get the most daily use`,
    ],
    science: `Stretching temporarily lengthens muscles and connective tissue and increases your tolerance for the stretch sensation, letting joints move more freely over time. It also helps the nervous system relax, reducing the feeling of post-exercise tightness. Its biggest payoff comes from consistency, paired with strength training rather than as a stand-alone fix.`,
  },

  'Sauna': {
    benefits: [
      `Promotes relaxation and meaningfully reduces stress`,
      `May support cardiovascular health and improve sleep quality for some people`,
      `Helps muscle recovery after hard training sessions`,
    ],
    howTo: [
      `Use it 2-4 times a week if you have access, for roughly 10-20 minutes per session`,
      `Hydrate well before and after, and ease out slowly if you feel dizzy or unwell`,
      `Treat it as a recovery and relaxation tool, not a primary fitness driver`,
    ],
    science: `Heat exposure raises core temperature and heart rate, creating a mild cardiovascular load similar to light exercise — improving circulation and triggering relaxation. Long-term studies link regular sauna use with better heart health, though lifestyle factors play a role too. It also stimulates short-term hormone and protein responses associated with recovery.`,
  },

  'Going for a walk': {
    benefits: [
      `Clears mental fatigue and improves focus, especially mid-task`,
      `Reduces stress and anxiety while encouraging more creative thinking`,
      `Provides light calorie burn and circulation without taxing recovery`,
    ],
    howTo: [
      `Walk 20-60 minutes at a comfortable, consistent pace, ideally outside`,
      `Leave the phone in your pocket and use it as genuinely screen-free time`,
      `Build it into a fixed slot — after lunch, before dinner — so it doesn't depend on motivation`,
    ],
    science: `Walking is low-intensity aerobic activity that increases blood flow and oxygen delivery to the brain, reducing mental fatigue and improving clarity. It also helps regulate cortisol. Studies consistently show walking — especially outdoors — improves mood and supports creative thinking by letting the brain enter a more relaxed, associative state, all while placing minimal strain on the body.`,
  },

  'Digestive walk': {
    benefits: [
      `Improves digestion right after eating and reduces post-meal bloating and sluggishness`,
      `Helps regulate blood sugar, especially after carb-heavy meals`,
      `Builds a small, easy win into your day that compounds over time`,
    ],
    howTo: [
      `Walk for 5-15 minutes at an easy pace shortly after finishing a meal`,
      `Avoid sitting or lying down immediately after eating, especially after larger meals`,
      `Keep it light — this isn't a workout, just gentle movement`,
    ],
    science: `Light movement after eating stimulates gastrointestinal motility, helping food move through the digestive tract more efficiently and easing bloating. Research also shows short post-meal walks reduce blood sugar spikes by helping muscles pull glucose from the bloodstream — a modest effect that compounds meaningfully over weeks of consistency.`,
  },

  'Good posture': {
    benefits: [
      `Reduces back, neck, and shoulder strain from long periods of sitting or screen use`,
      `Improves breathing capacity and overall comfort`,
      `Enhances confidence and presence in how you carry yourself`,
    ],
    howTo: [
      `Keep shoulders relaxed and back, with ears roughly aligned over your shoulders`,
      `Take a movement break every 30-60 minutes of sitting`,
      `Strengthen your core and upper back so good posture becomes easier to hold, not just willed`,
    ],
    science: `Posture affects how force distributes across your spine and muscles — sustained poor alignment increases strain in specific areas over time. Upright posture also allows fuller lung expansion, slightly improving breathing efficiency. Research shows posture isn't one fixed "perfect" position but a dynamic state — frequent movement and stronger supporting muscles matter more than rigidly holding any one pose.`,
  },

  'Sleep (7-9 hours)': {
    benefits: [
      `Essential for physical recovery, hormone balance, and immune function`,
      `Improves memory, focus, mood, and decision-making the next day`,
      `Reduces long-term risk of metabolic and chronic health issues`,
    ],
    howTo: [
      `Keep a consistent sleep and wake time, even on weekends`,
      `Cut screens an hour before bed and keep the room cool, dark, and quiet`,
      `Limit caffeine in the second half of the day so it doesn't blunt sleep onset`,
    ],
    science: `During deep sleep, the body performs essential tissue repair and growth processes; REM sleep consolidates memory and processes emotion. Insufficient sleep disrupts hunger, stress, and energy hormones, degrading both physical and mental performance. Chronic sleep deprivation is one of the strongest predictors of poor cognitive function and long-term disease risk — consistency matters as much as duration.`,
  },

  // ===================== "Next batch" pilot tasks =====================

  'Delay coffee 90 min after waking': {
    benefits: [
      `Smooths out your energy curve and avoids the mid-morning crash that comes with early caffeine`,
      `Lets your body's natural wake-up systems do their job before you stack caffeine on top`,
      `Improves caffeine's effectiveness later in the day because you haven't blunted your receptors early`,
    ],
    howTo: [
      `Wait roughly 90 minutes after waking before your first cup — hydrate and get light/movement first instead`,
      `If the urge is strong, start with water, a short walk, or sunlight as your "first hit" of the morning`,
      `Keep the same delay daily so your body adapts to the new rhythm rather than fighting it each time`,
    ],
    science: `Cortisol — your natural alertness hormone — peaks shortly after waking. Drinking caffeine on top of that peak can blunt your tolerance over time and create a sharper crash once it wears off. Waiting lets cortisol do its job first, so caffeine arrives when your natural alertness is dipping and gives you a cleaner, more sustained boost with less afternoon slump.`,
  },

  'Meditating/NSDR/breathing exercises': {
    benefits: [
      `Lowers stress and anxiety by calming the body's fight-or-flight response`,
      `Improves focus, emotional regulation, and recovery — NSDR can substitute for part of a missed nap`,
      `Builds a daily reset point that makes the rest of the day easier to navigate`,
    ],
    howTo: [
      `Pick one method — seated meditation, NSDR/yoga nidra audio, or slow breathing (e.g. 4-second inhale, 6-second exhale)`,
      `Start with just 10 minutes in a quiet spot, eyes closed, focusing on breath or following the audio script`,
      `Do it at a consistent time — right after waking or during a midday slump — so it becomes automatic`,
    ],
    science: `Slow, controlled breathing activates the parasympathetic nervous system (the "rest and digest" branch), lowering heart rate and cortisol. Meditation strengthens the prefrontal cortex's control over the amygdala, improving emotional regulation over time. NSDR (non-sleep deep rest) guides the brain into a low-arousal state similar to early sleep stages, aiding recovery and focus without actually sleeping.`,
  },

  'Reading (15 min or 10 pages minimum)': {
    benefits: [
      `Expands knowledge, vocabulary, and the ability to follow complex ideas`,
      `Improves focus and patience by training sustained, single-task attention`,
      `Gives you raw material — ideas, language, frameworks — that compounds across everything else you do`,
    ],
    howTo: [
      `Set a daily minimum of 15 minutes and protect it like an appointment — same time, same spot`,
      `Choose books that stretch you slightly rather than ones that are pure comfort reading`,
      `Keep a short note of one idea per session so it sticks rather than evaporating`,
    ],
    science: `Reading requires sustained attention and active construction of meaning — building mental models, holding context, predicting what comes next — which is fundamentally different from the passive scrolling most media encourages. This strengthens working memory and deep-focus capacity over time, and repeated exposure to complex language and ideas measurably improves vocabulary, comprehension, and the ability to reason through unfamiliar material.`,
  },

  'Gym rest day': {
    benefits: [
      `Allows muscles to repair and grow stronger — the actual mechanism behind getting fitter`,
      `Reduces injury risk and prevents the performance decline that comes with overtraining`,
      `Restores motivation and mental freshness so training stays sustainable long-term`,
    ],
    howTo: [
      `Schedule rest days into your week in advance rather than taking them only when forced to`,
      `Use the day for light activity if you want — walking, stretching, mobility work — not full intensity training`,
      `Prioritize sleep, protein, and hydration on rest days just as much as on training days`,
    ],
    science: `Training creates microscopic damage in muscle fibers; the actual growth and strengthening happens during rest, when the body repairs and reinforces that tissue (supercompensation). Skipping recovery accumulates fatigue faster than the body can adapt, raising injury risk and stalling progress — rest days aren't time off from training, they're part of it.`,
  },

  // ===================== BATCH 2 — Skincare / Learning =====================

  'Skincare routine': {
    benefits: [
      `Protects the skin barrier, reduces dryness and irritation, and lowers breakout risk`,
      `Improves skin texture and evenness over months of consistency`,
      `Slows visible signs of UV-driven aging when sunscreen is part of the routine`,
    ],
    howTo: [
      `Keep it simple: gentle cleanser, moisturizer, and sunscreen in the morning; cleanser and moisturizer at night`,
      `Add one active ingredient at a time only if you actually need it, introducing it slowly`,
      `Stay consistent — skincare compounds over weeks and months, not days`,
    ],
    science: `Skin functions best when its outer barrier stays intact. Cleansing clears oil, sweat, and debris; moisturizer reduces water loss through that barrier; sunscreen blocks UV radiation, the main driver of premature aging and skin cancer risk. Consistency beats complexity — a simple routine followed daily outperforms an elaborate one followed sporadically.`,
  },

  'Mewing': {
    benefits: [
      `Builds awareness of tongue posture and nasal breathing habits`,
      `May support better oral posture and reduce mouth breathing over time`,
      `Costs nothing and pairs naturally with other posture-focused habits`,
    ],
    howTo: [
      `Rest your whole tongue lightly on the roof of your mouth, lips closed, breathing through your nose`,
      `Don't force your jaw forward or clench your teeth — treat it as posture practice, not a quick fix`,
      `Build it into moments you're already idle: commuting, watching something, working at a desk`,
    ],
    science: `Evidence that mewing meaningfully reshapes adult facial bone structure is weak — large skeletal changes mostly happen during growth in childhood, when bone is more adaptable. Tongue posture and nasal breathing can still influence oral habits and jaw function over the long run, so it's reasonable as a low-cost posture habit, just not a transformation method.`,
  },

  'Mouth taping': {
    benefits: [
      `May reduce mouth breathing during sleep and encourage nasal breathing`,
      `Some people report less morning dry mouth and more comfortable sleep`,
      `Simple, low-cost experiment if you can already breathe freely through your nose`,
    ],
    howTo: [
      `Only try it if you can comfortably breathe through your nose while awake and asleep`,
      `Use a small piece of skin-safe tape — never fully seal the mouth — and stop if you feel anxious or blocked`,
      `Skip it entirely if you have nasal congestion or suspect sleep apnea`,
    ],
    science: `Nasal breathing humidifies and filters air more effectively than mouth breathing, which is the rationale behind taping. But research on the practice is limited, and it can be unsafe for people with airway obstruction or sleep-disordered breathing — it's a habit nudge for the right person, not a treatment, and not for everyone.`,
  },

  'At least 30 min sunlight (with SPF)': {
    benefits: [
      `Anchors your circadian rhythm, improving daytime alertness and nighttime sleep`,
      `Supports vitamin D production and generally lifts mood`,
      `Lets you get the benefits of light exposure while minimizing UV skin damage`,
    ],
    howTo: [
      `Get outside earlier in the day when possible — walking or sitting outdoors works well`,
      `Apply broad-spectrum SPF on exposed skin if you'll be out long enough to risk burning`,
      `Don't deliberately "tough out" intense sun for vitamin D — moderate, regular exposure is enough`,
    ],
    science: `Bright natural light is one of the strongest cues for your internal body clock, helping anchor sleep timing and daytime alertness. UVB exposure also contributes to vitamin D synthesis — sunscreen reduces but doesn't eliminate this. The safest long-term approach is regular moderate exposure with protection, rather than intentional tanning or burning.`,
  },

  'Working in deep focus (1hr minimum)': {
    benefits: [
      `Improves output quality and speed on hard problems by removing constant context-switching`,
      `Produces more in one uninterrupted hour than several fragmented ones`,
      `Trains your ability to sustain attention — a skill that compounds across everything you do`,
    ],
    howTo: [
      `Pick one task, define a clear target, and remove every distraction before starting`,
      `Silence notifications, close extra tabs, and set a visible timer for at least one hour`,
      `Start with a single hour and expand the block only once it feels sustainable`,
    ],
    science: `Attention is a limited resource, and switching tasks creates real cognitive overhead — each switch costs time and mental energy to re-orient. Deep, uninterrupted focus lets working memory stay locked on one problem long enough to make real progress, which is essential for complex work requiring planning, synthesis, or creative reasoning.`,
  },

  'Learning (general)': {
    benefits: [
      `Builds broad knowledge, sharper judgment, and richer conversations`,
      `Improves your ability to connect ideas across completely different fields`,
      `Compounds — each new thing you learn makes the next thing easier to learn`,
    ],
    howTo: [
      `Read, watch, or listen across a range of topics, not just your specialty`,
      `Note one useful idea from each session instead of trying to remember everything`,
      `Keep sessions short, regular, and focused on understanding rather than collecting facts`,
    ],
    science: `The brain learns through repetition, association, and retrieval. Broad learning creates more connections between ideas, which makes future learning faster — new information has more existing structure to attach to instead of sitting isolated. This is also the basis of stronger pattern recognition across domains.`,
  },

  'Learn something directly applicable to business': {
    benefits: [
      `Directly improves decision-making, sales, marketing, operations, or strategy`,
      `Converts into measurable results faster than purely abstract study`,
      `Builds a feedback loop where learning and doing reinforce each other`,
    ],
    howTo: [
      `Pick one business-relevant topic — pricing, negotiation, marketing, finance — and go deep on it`,
      `Learn one concept, then apply it immediately to a real project, decision, or piece of work`,
      `Review what happened after applying it, and adjust your understanding based on the result`,
    ],
    science: `Learning sticks far better when it's tied to real, near-term application — the brain encodes information more strongly when it expects to use it soon. This is why practically-applied knowledge tends to outperform abstract study for real-world performance: it's easier to retrieve and use precisely because you've already used it once.`,
  },

  'Study session': {
    benefits: [
      `Builds long-term retention and genuine performance readiness`,
      `Prevents passive reading from quietly wasting your time`,
      `Gives structure that turns scattered effort into compounding progress`,
    ],
    howTo: [
      `Set a clear goal, break the material into chunks, and study in focused blocks with short breaks`,
      `Use active methods — self-testing, summarizing from memory — instead of just rereading`,
      `End each session by reviewing what you got wrong, not just what you got right`,
    ],
    science: `Effective studying depends on retrieval and spacing, not exposure. Actively recalling information strengthens memory far more than rereading it passively, and spacing study sessions over time gives the brain repeated contact with material exactly when it's starting to fade — which is when reinforcing it does the most good.`,
  },

  'Learn a new skill (15 min minimum)': {
    benefits: [
      `Lowers the barrier to starting, which is usually the hardest part`,
      `Builds consistency that compounds into real ability over months`,
      `Keeps motivation high because the daily bar is small enough to always clear`,
    ],
    howTo: [
      `Pick one skill and practice one narrow piece of it for 15 minutes daily — one chord, one drill, one concept`,
      `Keep the goal tiny on purpose; consistency beats intensity here`,
      `Track your streak rather than your performance on any single day`,
    ],
    science: `Skill acquisition depends on repetition and incremental adaptation — both motor learning and memory consolidation benefit from short, regular sessions rather than occasional marathon ones. Small daily sessions also lower psychological resistance, which is the actual reason most people quit skills before they become automatic.`,
  },

  'Listening to a podcast (30 min minimum)': {
    benefits: [
      `Exposes you to new ideas, stories, and vocabulary during otherwise low-effort time`,
      `Makes commuting, walking, or chores feel more productive`,
      `Broadens your perspective with minimal extra time investment`,
    ],
    howTo: [
      `Choose podcasts with a clear topic relevant to something you actually care about`,
      `Listen actively — pause and jot down one useful point when something lands`,
      `Pair it with a low-attention task (walking, cleaning) rather than treating it as pure background noise`,
    ],
    science: `Audio exposes you to concepts and language patterns, but retention is much stronger when you actively process what you hear rather than letting it pass through. The benefit scales with relevance to your goals and with whether you pause to reflect, take notes, or discuss it — passive listening fades almost as fast as it arrives.`,
  },

  'Active recall / flashcard session': {
    benefits: [
      `One of the most effective ways to strengthen memory and speed up learning`,
      `Reveals what you actually know versus what just feels familiar`,
      `Builds confidence because you can measure real progress over time`,
    ],
    howTo: [
      `Use cards that ask direct questions, not ones that just trigger recognition`,
      `Try to answer before flipping the card — the struggle is the point`,
      `Repeat missed cards more often, and keep sessions short but regular (spaced repetition)`,
    ],
    science: `Active recall forces your brain to retrieve information from memory, which strengthens the neural pathway far more than passively reviewing it. Combined with spaced repetition — revisiting material right before you're likely to forget it — this becomes one of the most efficient learning methods studied, because it concentrates effort exactly where it matters most.`,
  },

  'Teach someone what you learned today': {
    benefits: [
      `Clarifies your own thinking and exposes the gaps in your understanding`,
      `Improves retention far more than passive review ever could`,
      `Turns inert knowledge into something you can actually use and explain`,
    ],
    howTo: [
      `Explain the idea in plain language, as if talking to a complete beginner`,
      `Keep it short and concrete — if you stumble, that's exactly where to dig back in`,
      `Do it out loud, in writing, or in conversation — whatever forces you to actually produce the explanation`,
    ],
    science: `Teaching forces retrieval, organization, and simplification all at once — you have to reconstruct the idea from your own understanding rather than just recognizing it. That deeper processing is consistently shown to improve both retention and your ability to transfer the knowledge to new situations later.`,
  },

  'Write a summary of what you studied': {
    benefits: [
      `Organizes information and improves recall of what actually mattered`,
      `Helps you spot what you understood versus what you're still fuzzy on`,
      `Creates a useful artifact for fast review later`,
    ],
    howTo: [
      `After studying, write 3-5 sentences in your own words covering the main idea and key details`,
      `Include one thing you still don't fully understand — that's your next session's target`,
      `Keep it brief and honest rather than polished`,
    ],
    science: `Summarizing forces you to compress information, which requires genuinely understanding it rather than just recognizing it. It also sharpens metacognition — your ability to judge what you actually know — and writing in your own words requires active processing that copying notes simply doesn't.`,
  },

  'Language practice session': {
    benefits: [
      `Improves fluency, vocabulary recall, pronunciation, and speaking confidence`,
      `Reduces hesitation and "freezing up" in real conversations`,
      `Compounds quickly because language skills build directly on each other`,
    ],
    howTo: [
      `Mix speaking, listening, reading, and writing rather than focusing on just one`,
      `Pick one specific goal per session — verb conjugation, a conversation topic, new vocabulary`,
      `Prioritize regular practice over rare, long sessions — repetition beats perfection`,
    ],
    science: `Language acquisition strengthens through exposure plus active use — recognition alone (just listening or reading) isn't enough for fluent recall. Mixing input and output forces your brain to both absorb patterns and produce them under real conditions, which is what actually builds the fast, automatic retrieval that fluency requires.`,
  },

  'Solve a problem from scratch': {
    benefits: [
      `Builds independent thinking, confidence, and real problem-solving ability`,
      `Trains you to reason through unfamiliar situations instead of pattern-matching to examples`,
      `Produces understanding that transfers to genuinely new problems later`,
    ],
    howTo: [
      `Define the problem clearly, list your constraints, and break it into smaller pieces`,
      `Work through possible solutions and test your assumptions before reaching for outside help`,
      `Review your process afterward — what worked, what didn't, what you'd do differently`,
    ],
    science: `Working through a problem from scratch engages deeper cognitive processing than following a worked example — you learn the underlying structure, not a memorized procedure. The struggle itself is useful: effortful retrieval and trial-and-error are consistently shown to build stronger, more transferable understanding than smooth, guided learning.`,
  },

  // ===================== BATCH 3 — Mindset / Social =====================

  'No lustful behaviours': {
    benefits: [
      `Improves focus, self-control, and emotional stability`,
      `Reduces compulsive craving and the mental noise that comes with chasing constant stimulation`,
      `Frees up time and energy that was going toward a reward loop with diminishing returns`,
    ],
    howTo: [
      `Cut triggers fast — avoid suggestive content and the situations that reliably set off the urge`,
      `Redirect the urge into something physical: exercise, work, a cold shower, a walk`,
      `Change your environment rather than trying to negotiate with the impulse in the moment`,
    ],
    science: `Repeated exposure to high-intensity sexual cues can train reward-seeking loops in the brain, gradually making attention and impulse control harder across other areas of life too. Reducing that cue exposure helps weaken the loop over time and supports stronger top-down control over attention and behavior generally.`,
  },

  'No unnecessary social media': {
    benefits: [
      `Less distraction, better mood, and lower comparison-driven stress`,
      `More time and mental bandwidth for real life and deep work`,
      `Improves attention span and reduces the reflexive urge to check your phone`,
    ],
    howTo: [
      `Delete the apps that cost you the most time, log out of the rest, and set strict usage windows`,
      `Use social media only with a clear purpose in mind — not as a default filler activity`,
      `If you catch yourself opening it on autopilot, close it immediately, no scrolling allowed`,
    ],
    science: `Social platforms are engineered around novelty and variable rewards, which keeps the brain chasing small, frequent dopamine hits. Over time that pattern can overload your attention system and make ordinary, slower-paced rewards — reading, conversation, focused work — feel comparatively unsatisfying.`,
  },

  'Not on phone too much': {
    benefits: [
      `Better concentration, calmer mood, and improved sleep quality`,
      `Less mental fragmentation throughout the day`,
      `More presence with the people actually in front of you`,
    ],
    howTo: [
      `Keep your phone physically out of reach during focused time and turn off non-essential alerts`,
      `Use grayscale mode or app limits to reduce the pull of the screen`,
      `Set specific windows for checking messages instead of responding to every buzz`,
    ],
    science: `Frequent phone checking trains your brain to expect constant interruption, which weakens your capacity for sustained attention over time. Reducing exposure breaks that cue-response cycle — the fewer times the phone successfully pulls your attention, the weaker its pull becomes.`,
  },

  'Doing something you hate daily': {
    benefits: [
      `Builds discipline and a higher tolerance for discomfort`,
      `Makes other, easier tasks feel lighter by comparison`,
      `Reduces the habit of avoidance that quietly limits what you're willing to attempt`,
    ],
    howTo: [
      `Pick one small task you genuinely dislike — cleaning, paperwork, a hard set at the gym — and do it first`,
      `Keep it short and make it non-negotiable, not something you "decide" on each day`,
      `Notice afterward how much smaller it felt once it was actually done`,
    ],
    science: `Repeated exposure to mild discomfort strengthens self-regulation and reduces avoidance — in behavioral terms, you're teaching your brain that discomfort isn't danger, so resistance to it gradually drops. This generalizes: people who routinely do hard things in one area find other hard things easier to start.`,
  },

  'View sunset': {
    benefits: [
      `Calms the mind and creates a natural pause before the evening`,
      `Improves mood and helps you slow down and feel more grounded`,
      `Costs nothing and pairs naturally with reflection or a short walk`,
    ],
    howTo: [
      `Spend 10-20 minutes outside or by a window around sunset, phone away`,
      `Just watch and breathe — no other task layered on top`,
      `Use it as a transition cue from "day mode" into winding down`,
    ],
    science: `Nature exposure is reliably linked with lower stress, and the changing light of sunset adds a strong sensory cue for relaxation and reflection. The shift in light also supports your body's natural transition toward evening rest, gently nudging your circadian rhythm toward sleep.`,
  },

  'Sit in silence 10 min': {
    benefits: [
      `Clears mental clutter and improves self-awareness`,
      `Reduces reactivity by giving your nervous system a real break from input`,
      `Makes it easier to notice rising stress before it boils over`,
    ],
    howTo: [
      `Sit without music, scrolling, or conversation for 10 minutes`,
      `Focus on your breathing, or simply observe your thoughts without chasing them`,
      `Pick a consistent time so it becomes a fixed daily reset rather than an occasional extra`,
    ],
    science: `Quiet time reduces external stimulation, letting the brain settle and process internal signals — emotions, fatigue, stress — more clearly. That clarity makes it easier to catch stress early and respond deliberately, instead of reacting on autopilot once it's already built up.`,
  },

  'Doing something creative': {
    benefits: [
      `Improves mood, reduces stress, and gives a genuine sense of progress`,
      `Helps you process emotions actively instead of bottling them up`,
      `Builds a skill or output you can look back on and be proud of`,
    ],
    howTo: [
      `Draw, write, play music, cook, build, or design for at least 10 minutes`,
      `Focus on doing it, not on being good at it — output over perfection`,
      `Keep whatever you make, even if it's rough — it's evidence of momentum`,
    ],
    science: `Creative activity supports emotional regulation and reliably reduces stress while boosting overall wellbeing. It gives the brain a structured, rewarding task that combines focused attention, self-expression, and problem-solving — a combination that's hard to get from passive consumption.`,
  },

  'Think before speaking (end of day reflection)': {
    benefits: [
      `Leads to better communication and fewer regrettable moments`,
      `Strengthens relationships by catching where emotion outran judgment`,
      `Builds a habit of noticing your own patterns instead of repeating them blindly`,
    ],
    howTo: [
      `Each evening, review one conversation from the day`,
      `Ask whether you were clear, kind, and necessary — and where you weren't`,
      `Write down one specific thing to do differently tomorrow`,
    ],
    science: `Reflection strengthens metacognition — your ability to monitor your own thoughts and behavior from the outside. That improves impulse control over time, because you're effectively giving your brain repeated practice at catching and correcting patterns before they become automatic mistakes.`,
  },
};
