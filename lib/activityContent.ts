// ELEVO — Final blended activity content for all 79 daily habits.
// Synthesized from Perplexity, ChatGPT, Gemini (where available), and Claude/Opus —
// merged into one app-ready version per task. Drop straight into your app.

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

  'Standing for your morals (end of day reflection)': {
    benefits: [
      `Increases self-respect and reduces the low hum of inner conflict`,
      `Builds courage that compounds — easier to stand firm next time once you've done it once`,
      `Improves sleep quality when your actions actually match your values`,
    ],
    howTo: [
      `Each evening, ask where you stayed silent, compromised, or acted with real integrity`,
      `Be honest rather than generous with yourself — the value is in the accuracy`,
      `Pick one concrete moral action for tomorrow based on what you noticed`,
    ],
    science: `Acting against your own values creates cognitive dissonance — a measurable form of internal stress — while standing up for your beliefs, even in small ways, tends to feel invigorating and reinforces self-esteem. Value-consistent behavior supports a stronger, more coherent sense of self over time.`,
  },

  'Being grounded (end of day reflection)': {
    benefits: [
      `Lowers anxiety and improves emotional stability`,
      `Keeps you realistic instead of getting swept up in spiraling thoughts`,
      `Creates a reliable nightly reset that prevents stress from accumulating`,
    ],
    howTo: [
      `End the day by naming what is true, what's in your control, and what isn't`,
      `Pair it with slow breathing and brief body awareness — feet on the floor, shoulders relaxed`,
      `Keep it short — a few honest sentences are enough`,
    ],
    science: `Grounding shifts attention away from mental noise and toward present-moment sensory input, which directly lowers stress activation. Over time, that practice makes your nervous system less reactive overall and quicker to settle when something does spike it.`,
  },

  'Be content with yourself (end of day reflection)': {
    benefits: [
      `Builds genuine self-acceptance and reduces comparison-driven stress`,
      `Improves mood and lowers baseline anxiety when practiced consistently`,
      `Makes it easier to act from confidence rather than from the need to prove something`,
    ],
    howTo: [
      `Each evening, name one thing you did well today — not just outcomes, but effort and character`,
      `Separate your worth from your results; acknowledge progress without dismissing it`,
      `If self-criticism flares up, ask whether you'd say the same thing to someone you care about`,
    ],
    science: `Self-compassion — treating yourself with the same fairness you'd extend to others — is consistently linked with better emotional regulation, resilience, and motivation. Chronic self-criticism activates the threat response in the brain; acknowledging your effort without harsh judgment keeps that system quieter and supports more stable, sustained action over time.`,
  },

  // ===================== BATCH 4 — Social =====================

  'Being social': {
    benefits: [
      `Improves mood, reduces loneliness, and boosts overall wellbeing`,
      `Strengthens your conversational fluency and comfort with new people`,
      `Builds a larger, warmer network over time through simple daily contact`,
    ],
    howTo: [
      `Make it a point to genuinely talk to at least one person each day — not just reply to messages`,
      `Be open, make eye contact, and give people your real attention rather than half of it`,
      `Treat casual conversations as worth having in their own right, not just stepping stones to something`,
    ],
    science: `Regular social contact is one of the strongest predictors of long-term wellbeing — more robust than wealth, status, or physical health alone. Social interaction activates reward circuits in the brain and helps regulate stress hormones, which is why chronic isolation is associated with worse outcomes across almost every health measure.`,
  },

  'Initiate a conversation with a stranger': {
    benefits: [
      `Builds social confidence and reduces the fear of rejection through repeated exposure`,
      `Opens you to unexpected connections, opportunities, and perspectives`,
      `Trains the habit of reaching out rather than waiting to be approached`,
    ],
    howTo: [
      `Pick a low-stakes situation — waiting in a line, at a gym, in a coffee shop — and make a simple, genuine comment`,
      `Lead with curiosity rather than a script; ask something real, not just small talk`,
      `Don't worry about the outcome — the rep counts regardless of how far the conversation goes`,
    ],
    science: `Research consistently finds that people underestimate how much strangers enjoy being talked to. Each successful interaction weakens the threat signal your brain attaches to social risk, making future initiations easier. Over time this gradually shifts your default behavior from avoidance to openness.`,
  },

  'Give someone a genuine compliment': {
    benefits: [
      `Boosts mood — both yours and theirs — through a brief, high-value interaction`,
      `Strengthens relationships and builds goodwill that compounds quietly over time`,
      `Trains you to notice what's good in others, which retrains your attention generally`,
    ],
    howTo: [
      `Make it specific and true — "the way you handled that conversation was sharp" lands far better than "you're great"`,
      `Say it once, clearly, without fishing for a return compliment`,
      `Don't reserve it for grand moments; small, daily ones carry more weight in total`,
    ],
    science: `Giving compliments activates reward circuits for both giver and receiver, and genuine, specific praise is more socially powerful than vague flattery because it signals close attention. The habit of looking for things to honestly appreciate in others also shifts your attentional bias away from criticism and complaint over time.`,
  },

  'Organise or attend a social event': {
    benefits: [
      `Creates shared experiences that deepen existing relationships and build new ones`,
      `Adds richness and variety to your social life that daily interactions alone can't provide`,
      `Builds your reputation as someone who makes things happen, not just shows up`,
    ],
    howTo: [
      `Don't overthink the format — a dinner, a walk, a game, a coffee can all count`,
      `If organizing feels like too much, just commit to attending something someone else put together`,
      `Show up fully — no early exits unless you have to, and no phone at the table`,
    ],
    science: `Shared activities create stronger social bonds than conversation alone — doing things together builds synchronized emotional states and shared memory, both of which strengthen closeness. Organizing events also positions you as a social hub, which research links to higher wellbeing and broader, more resilient networks.`,
  },

  "Call or meet a friend you haven't spoken to in a while": {
    benefits: [
      `Strengthens relationships that quietly drift without regular contact`,
      `Gives both people a boost — reconnections often feel better than expected`,
      `Reminds you of who matters in your life beyond the loudest, most recent contacts`,
    ],
    howTo: [
      `Send a message or make a call — no elaborate reason needed, "thinking of you" is enough`,
      `Make it real: ask a question, share something, don't just check in and disappear`,
      `Keep a rough list of people worth staying in touch with and cycle through it over time`,
    ],
    science: `Relationships decay without maintenance — research shows that friendships require repeated, reciprocal contact to stay strong. But reconnections are often warmer than people predict, and the act of reaching out itself signals care and investment, which both parties feel. Dormant ties, reactivated, also frequently open unexpected opportunities.`,
  },

  'Practice public speaking (mirror/recording)': {
    benefits: [
      `Builds confidence and fluency so nerves shrink over time instead of staying constant`,
      `Improves clarity, pacing, and presence in every situation where you need to communicate`,
      `Turns a common fear into a competitive advantage the majority of people never develop`,
    ],
    howTo: [
      `Speak out loud for 2-5 minutes on any topic — record yourself or use a mirror`,
      `Focus on one thing per session: pacing, eye contact, filler words, structure`,
      `Review the recording honestly; the discomfort of watching yourself is part of what makes it effective`,
    ],
    science: `Public speaking anxiety is a form of social threat response. Deliberate, repeated exposure with low actual stakes — practicing alone — gradually desensitizes that response. Recording yourself adds an external perspective that self-awareness alone can't replicate, which accelerates the correction of habits you can't notice in the moment.`,
  },

  'Active listening — full presence, no phone': {
    benefits: [
      `Deepens relationships faster than almost anything else you can do in a conversation`,
      `Improves your understanding and memory of what was actually said`,
      `Makes people feel genuinely valued, which builds trust and goodwill that lasts`,
    ],
    howTo: [
      `Put the phone face-down or away before the conversation starts, not midway through`,
      `Focus on understanding rather than planning your response — most people do the opposite`,
      `Reflect back what you heard before adding your own point; it shows you actually listened`,
    ],
    science: `Most people listen at about 25% of their actual capacity because they're simultaneously planning a response, checking their phone, or drifting. Full attention is rare enough that people notice it immediately, and it activates the brain's social reward systems — being truly heard triggers the same circuits as being helped. The skill compounds because it makes people want to talk to you.`,
  },

  'Do something kind without expecting anything': {
    benefits: [
      `Improves your own mood and wellbeing — the act benefits you as much as the recipient`,
      `Builds a reputation for generosity that returns to you in ways you can't predict`,
      `Trains a mindset of abundance rather than scarcity`,
    ],
    howTo: [
      `Look for one small thing each day — hold a door, cover someone's coffee, send a useful link`,
      `Do it without announcement, credit, or expectation of reciprocation`,
      `If you're unsure what to do, just ask someone how their day is going and actually listen`,
    ],
    science: `Prosocial behavior consistently boosts the wellbeing of the giver as much as the receiver — sometimes more. It activates reward pathways and dampens stress hormones, and regularly acting with generosity has been linked to lower cortisol and stronger immune function. The absence of expected reciprocity is actually what makes it most effective: unconditional giving bypasses the transactional framing that blunts the effect.`,
  },

  // ===================== BATCH 5 — Family / Creator / Entrepreneur =====================

  'Spend quality time with family (no phones)': {
    benefits: [
      `Strengthens the relationships that matter most over the long run`,
      `Creates shared memories and a sense of connection that daily routine alone can't build`,
      `Reduces stress and improves wellbeing for everyone involved`,
    ],
    howTo: [
      `Set a clear window — dinner, an evening activity, a weekend morning — and protect it`,
      `Phones away for everyone, including you; model what you want to see`,
      `Be present in what you're doing, not planning the next thing or reviewing the last`,
    ],
    science: `Family connection is one of the strongest predictors of long-term happiness and health across decades of research. Quality time — defined by genuine attention and interaction, not just proximity — is what actually produces those benefits. Shared rituals, in particular, build a sense of belonging and stability that buffers against stress.`,
  },

  'Have a meaningful conversation with a family member': {
    benefits: [
      `Deepens understanding and closeness in ways that surface-level daily chat doesn't`,
      `Helps family members feel seen and heard, which is foundational to strong relationships`,
      `Often reveals perspectives and information that improve your own thinking`,
    ],
    howTo: [
      `Ask an open question about something real — how they're actually doing, what's on their mind, what they're working through`,
      `Listen more than you talk; don't rush to fix, advise, or redirect`,
      `Follow up on something you discussed last time — it shows you were paying attention`,
    ],
    science: `Deeper conversations — those involving real thoughts, feelings, and experiences rather than logistics — are consistently associated with greater happiness and closeness than small talk. They require vulnerability and attention from both sides, which activates trust and bonding mechanisms that shallow interaction doesn't reach.`,
  },

  'Plan a family activity': {
    benefits: [
      `Gives everyone something to look forward to and strengthens shared identity`,
      `Creates the shared experiences that become memories and inside references`,
      `Signals to your family that they're a priority worth planning for`,
    ],
    howTo: [
      `Keep it simple — a walk, a meal, a film, a day trip — the activity matters less than the intention`,
      `Involve others in choosing so it's genuinely shared rather than something imposed`,
      `Follow through; cancelled plans communicate the opposite of what you intended`,
    ],
    science: `Anticipation of positive events boosts wellbeing before they even happen — the planning itself is part of the benefit. Shared activities synchronize emotional states between family members and create the positive memories that form the felt sense of a strong, close family over time.`,
  },

  'Financial planning session': {
    benefits: [
      `Reduces money-related stress and anxiety by replacing vagueness with clarity`,
      `Makes it far more likely you'll hit financial goals by turning them into specific plans`,
      `Prevents small, fixable problems from compounding into large, difficult ones`,
    ],
    howTo: [
      `Review your income, spending, and savings against your targets — even 15 minutes a week adds up`,
      `Identify one thing to adjust: a spending category, a savings rate, a debt repayment plan`,
      `Use a spreadsheet, app, or notebook — whatever you'll actually open consistently`,
    ],
    science: `Financial stress is one of the top drivers of chronic stress and relationship conflict, and it primarily comes from uncertainty rather than from having less money. Regular review turns an abstract, anxious background worry into a concrete, manageable situation — which reliably reduces the stress load even when the numbers haven't changed yet.`,
  },

  'Tell someone you love them': {
    benefits: [
      `Strengthens the bond and reminds both people what actually matters`,
      `Costs nothing but carries real emotional weight for the person who hears it`,
      `Builds a habit of expressing what you feel before the opportunity is gone`,
    ],
    howTo: [
      `Say it directly and sincerely — in person, by call, or in writing`,
      `Don't reserve it for big moments; the ordinary moments carry more weight in total`,
      `Mean it when you say it — people can feel the difference between rote and real`,
    ],
    science: `Expressing affection activates oxytocin release in both speaker and recipient, deepening social bonding and reducing stress. Research on end-of-life regrets consistently finds that people wish they had said these things more often — the cost of saying it is near zero, and the regret of not saying it can be permanent.`,
  },

  'Publish something (post, video, article)': {
    benefits: [
      `Builds an audience and compounds your reach over time — the only way to grow is to show up`,
      `Forces clarity of thought; you understand something far better once you've had to explain it publicly`,
      `Creates a track record and body of work that passively works for you`,
    ],
    howTo: [
      `Set a consistent schedule and publish to that schedule, not to when you "feel ready"`,
      `Done and imperfect beats polished and unpublished every time — publish, then improve`,
      `Repurpose: one idea can become a thread, a short-form video, a longer post, a newsletter section`,
    ],
    science: `Audience growth follows a compounding curve — early, consistent publishing builds the base that later reach multiplies on top of. The act of explaining ideas publicly also strengthens your own understanding through the "generation effect" — the brain encodes information more durably when you produce it rather than just consume it.`,
  },

  'Brainstorm session (15 min minimum)': {
    benefits: [
      `Generates ideas that focused, task-mode thinking doesn't reach`,
      `Gives your best thinking raw material to work with rather than waiting for inspiration`,
      `Builds the habit of treating idea generation as a skill you practice, not a talent you wait for`,
    ],
    howTo: [
      `Set a timer, pick one question or problem, and write every idea without filtering`,
      `Quantity over quality — judgment kills flow, so defer criticism until after the timer`,
      `Review afterward and mark the two or three ideas worth taking further`,
    ],
    science: `Divergent thinking — generating multiple possibilities without judgment — uses different neural networks than convergent, analytical thinking. Deliberately switching into that mode through timed, constraint-free brainstorming produces novel combinations your normal problem-solving mode won't reach, because it suspends the evaluative filter that usually gates ideas before they're fully formed.`,
  },

  "Study someone you admire's work": {
    benefits: [
      `Compresses years of another person's learning into something you can extract and apply`,
      `Reveals the underlying principles and decisions that produced visible results`,
      `Gives you models to test and adapt rather than starting everything from scratch`,
    ],
    howTo: [
      `Pick one person whose output you want to understand, and study one piece of their work deeply`,
      `Ask: what decisions did they make, what did they avoid, what's the principle underneath?`,
      `Take notes on what's transferable versus what's specific to their context`,
    ],
    science: `Observational learning — watching skilled performers and extracting the underlying structure — is one of the fastest routes to competence because it gives your brain a template to refine rather than building from nothing. The key is going beyond surface imitation to understand the why, which is what makes learning transferable.`,
  },

  'Engage with your audience': {
    benefits: [
      `Builds loyalty and trust far more than broadcasting alone ever could`,
      `Surfaces feedback, questions, and ideas that improve your content`,
      `Turns passive followers into active community members who advocate for you`,
    ],
    howTo: [
      `Reply to comments and messages genuinely — real responses, not templates`,
      `Ask questions, run polls, or request input to invite participation rather than just consumption`,
      `Treat every engagement as a conversation with a real person, not a metric to manage`,
    ],
    science: `Social reciprocity is a deep human norm — when you respond to someone, you activate a sense of mutual recognition that followers of passive creators don't get. That relationship drives retention, word-of-mouth, and long-term growth far more effectively than audience size alone, because it creates a community rather than just a viewership.`,
  },

  'Batch content creation session (1hr minimum)': {
    benefits: [
      `Produces more in one focused block than scattered, reactive creation ever could`,
      `Removes the daily decision of "what to make" by front-loading all the creation at once`,
      `Builds a content buffer that removes deadline pressure and protects consistency`,
    ],
    howTo: [
      `Block at least one hour with no interruptions, notifications off, one project open`,
      `Plan the session beforehand — know exactly what you're creating before you sit down`,
      `Create in batches (multiple pieces in one sitting) so you stay in flow instead of constantly stopping and starting`,
    ],
    science: `Task switching costs real cognitive overhead every time you context-switch. Batching concentrates creation into a continuous flow state, where deep work builds momentum and quality rises because your working memory stays loaded on the same problem. Scheduling the session removes the daily willpower drain of deciding when and whether to create.`,
  },

  'Seek feedback on your work': {
    benefits: [
      `Accelerates improvement faster than self-review alone by surfacing blind spots`,
      `Builds the skill of hearing criticism constructively instead of defensively`,
      `Creates a loop between what you think you're doing and what others actually experience`,
    ],
    howTo: [
      `Ask specific questions rather than "what do you think?" — "what was unclear?" gets better answers`,
      `Seek feedback from people who will be honest, not just supportive`,
      `Review feedback later when you're not defensive, looking for the kernel of truth even in badly delivered criticism`,
    ],
    science: `External feedback corrects the accuracy gap between your mental model of your work and how it actually lands. Self-assessment alone is unreliable — cognitive biases make us systematically bad at judging our own output. Repeated exposure to honest feedback also reduces defensive reactivity over time, making future feedback easier to receive and use.`,
  },

  'Review finances/business metrics': {
    benefits: [
      `Keeps you grounded in what's actually happening versus what you assume or hope`,
      `Surfaces problems early enough to fix, before they compound into crises`,
      `Makes better business decisions because you're working from data, not feeling`,
    ],
    howTo: [
      `Set a fixed weekly time to review your key numbers — revenue, expenses, cash, pipeline`,
      `Look for trends and anomalies, not just totals; the direction of change matters as much as the current level`,
      `Document what you see and one action it implies, even if that action is "keep going"`,
    ],
    science: `Business decisions made from current, accurate data are consistently better than those made from outdated or vague information — the quality of decisions degrades fast when the information it's based on is stale. Regular review also reduces the cognitive load of carrying "I should check that" as an unresolved background worry.`,
  },

  'Outreach to a potential client or collaborator': {
    benefits: [
      `Is one of the highest-leverage activities available: a single conversation can change your business`,
      `Builds the habit of initiating relationships rather than waiting for them to appear`,
      `Keeps the pipeline full even when current work is busy and you're not "looking"`,
    ],
    howTo: [
      `Write a short, specific, genuine message — why them, why now, what you're offering or proposing`,
      `Personalize every message; copy-paste outreach gets copy-paste results`,
      `Follow up once after no response; two touches, then move on`,
    ],
    science: `Most business growth happens through relationships, and most relationships start with one person initiating contact. The fear of rejection keeps most people from doing this consistently, which is why those who do it daily compound a significant advantage over time. Research on persuasion shows that specificity and genuine relevance are the factors that actually get responses.`,
  },

  'Work on the business not in it (30min strategic)': {
    benefits: [
      `Creates space to improve how the business runs, not just to keep it running`,
      `Prevents the trap of being permanently busy while never making real progress`,
      `Builds compounding improvements that make future work easier and more effective`,
    ],
    howTo: [
      `Block 30 minutes where you're not doing client work or operations — you're improving systems`,
      `Focus on one question: what bottleneck, if removed, would make everything else easier?`,
      `Write down what you decided or designed — verbal thinking evaporates, written thinking sticks`,
    ],
    science: `The tactical-strategic balance is one of the core challenges in entrepreneurship: urgent operational work crowds out the important strategic work that builds long-term capacity. Dedicated time protects against this by making "working on the business" non-negotiable rather than something that happens only when a crisis forces it.`,
  },

  'Sales or negotiation practice': {
    benefits: [
      `Builds the skills that directly convert your work into revenue and better deals`,
      `Reduces anxiety and hesitation in high-stakes conversations through deliberate exposure`,
      `Improves your ability to understand what others want and communicate your own value clearly`,
    ],
    howTo: [
      `Roleplay conversations, review past calls or negotiations, or study frameworks specifically`,
      `Practice the parts that make you most uncomfortable — opening, pricing, handling objections`,
      `Debrief after real conversations: what worked, what stalled, what you'd say differently`,
    ],
    science: `Sales and negotiation are skills that respond directly to deliberate practice — research on expert performance shows that targeted repetition with feedback produces rapid improvement in these domains, far more than just "doing it and hoping." Discomfort in these situations is primarily learned avoidance, which exposure-based practice gradually reverses.`,
  },

  // ===================== BATCH 6 — Weekly / Monthly / Annual =====================

  '1 hour silence': {
    benefits: [
      `Provides a deep reset for the attention system — not just a break from noise but from input entirely`,
      `Allows the mind to wander productively and generate ideas that focused work blocks out`,
      `Restores the ability to tolerate quiet, which makes you less reactive to boredom and distraction generally`,
    ],
    howTo: [
      `Find a genuinely quiet environment — no music, podcast, background noise, or screen`,
      `Sit, walk, or lie down, but don't fill the time with tasks`,
      `If thoughts arise, let them come and go without chasing them or redirecting away from them`,
    ],
    science: `The brain's default mode network — active during quiet, unfocused rest — plays a critical role in memory consolidation, creative insight, and self-reflection. Constant external stimulation suppresses this network. An hour of genuine silence allows it to operate fully, which is why many people report their best ideas emerging during unstructured quiet rather than during work.`,
  },

  '1 day fast': {
    benefits: [
      `Resets hunger cues and reduces dependence on constant eating throughout the day`,
      `May support metabolic health and cellular repair processes over time`,
      `Builds extraordinary mental toughness — proving to yourself that discomfort without food is survivable`,
    ],
    howTo: [
      `Start with a shorter window (16-18 hours) before attempting a full day; stay well hydrated throughout`,
      `Plan it on a lower-activity day and have your first meal ready so you don't overcorrect when you break the fast`,
      `Consult a doctor first if you have any metabolic conditions, blood sugar issues, or take medication`,
    ],
    science: `Extended fasting triggers autophagy — a cellular cleanup process where damaged components are broken down and recycled — and improves insulin sensitivity in many people. It also resets appetite regulation over time by giving the hormonal system a break from constant intake. The mental component is equally real: tolerating hunger without distress is a form of distress tolerance training that generalizes.`,
  },

  'Skill audit': {
    benefits: [
      `Makes your development deliberate rather than accidental`,
      `Surfaces gaps between where your skills are and where your goals require them to be`,
      `Builds a clearer picture of your competitive advantages and what to invest in next`,
    ],
    howTo: [
      `List the skills most relevant to your goals and rate yourself honestly on each one`,
      `Identify the gap between your current level and the level your goals actually require`,
      `Pick one skill to develop this month and commit to a specific practice routine for it`,
    ],
    science: `Skills compound — each one you add makes adjacent skills easier to acquire and creates more combinations you can draw on. But compounding only works if development is directed rather than random. Regular auditing is how you ensure your learning investments are going toward the constraints that actually limit you, rather than just the things you find easiest or most enjoyable to practice.`,
  },

  'Misogi': {
    benefits: [
      `Proves to yourself what you're capable of, which permanently shifts what you believe is possible`,
      `Provides a sharp contrast to ordinary life that resets your relationship with difficulty`,
      `Creates a defining experience and reference point you can draw on for years`,
    ],
    howTo: [
      `Choose something with roughly 50% chance of success — hard enough that failure is real, not theatrical`,
      `Prepare seriously; the point is to genuinely attempt it, not to perform the attempt`,
      `Reflect afterward regardless of outcome — what you learned about yourself is the actual deliverable`,
    ],
    science: `The psychological concept behind the Misogi is stress inoculation — deliberately facing high-intensity challenge in a controlled way builds resilience that transfers to everyday adversity. Experiences at the edge of your capability create stronger, more durable memories and self-belief than comfortable ones, because the emotional intensity of the experience deepens encoding and impact.`,
  },

  "New Year's review": {
    benefits: [
      `Creates an honest record of the year that prevents distorted memory from replacing what actually happened`,
      `Reveals patterns in what worked, what failed, and what you avoided — across a long enough timeline to be meaningful`,
      `Sets the context for real, evidence-based goals rather than wishful thinking`,
    ],
    howTo: [
      `Review your journal, goals, and key decisions from the year before writing anything new`,
      `Ask: what were the highest-leverage actions this year? What would I do differently? What should I stop doing?`,
      `Set 1-3 major goals for next year based on what you learned, not just what you wish for`,
    ],
    science: `Annual reviews leverage what psychologists call "the reminiscence bump" in a useful direction — the brain gives special weight to vivid, meaningful experiences. Deliberately revisiting a year through written records corrects natural memory biases that make good periods seem worse and bad periods seem better than they were, which is the foundation of more accurate, actionable planning.`,
  },

  '1 week total digital detox': {
    benefits: [
      `Resets dopamine baselines and makes ordinary life feel interesting and alive again`,
      `Reveals what actually fills your time and attention when the default is removed`,
      `Proves that you can exist without constant connectivity — which changes your relationship with devices permanently`,
    ],
    howTo: [
      `Plan it in advance: inform key people, set auto-replies, and arrange for anything genuinely urgent`,
      `Replace screen time with physical presence — walks, conversations, reading, cooking, being outside`,
      `Expect the first two days to feel uncomfortable; that discomfort is the point, and it passes`,
    ],
    science: `Digital devices deliver variable-ratio reinforcement — the same mechanism behind slot machine addiction — which makes them unusually hard to put down and unusually easy to reach for compulsively. A full week away disrupts that conditioning at a depth that a few hours or a day can't achieve, allowing dopamine receptors and the attention system to recalibrate to baseline levels.`,
  },
};
