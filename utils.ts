export type Activity = { name: string; xp: number; freq: 'Daily' | 'Weekly' | 'Monthly' | 'Annual' };
export type Category = { title: string; activities: Activity[] };

export function getTitle(level: number): string {
  if (level < 10) return 'New Beginning';
  if (level < 30) return 'Gaining Momentum';
  if (level < 50) return 'Locked In';
  if (level < 70) return 'Building a New Life';
  if (level < 90) return 'Leveled Up';
  return 'The One Who Never Quit';
}

export function getXpForLevel(level: number): number {
  let baseLevelXp = 500;
  let growthRate = 0.10;
  for (let levelNum = 2; levelNum < level; levelNum++) {
    baseLevelXp = baseLevelXp * (1 + growthRate);
    growthRate -= 0.0015;
    growthRate = Math.max(growthRate, 0.005);
  }
  return Math.round(baseLevelXp / 5) * 5;
}

export const ALL = ['Healthy Guy', 'Gymbro / Athlete', 'Entrepreneur', 'Scholar', 'Creator', 'Monk', 'Social Guy', 'Family Man', 'Looksmaxer', 'Jack of All Trades'];

export const categories: Category[] = [
  {
    title: 'Morning',
    activities: [
      { name: 'Wake up when said without fuss', xp: 25, freq: 'Daily' },
      { name: 'No phone for 60 min after waking', xp: 75, freq: 'Daily' },
      { name: 'Delay coffee 90 min after waking', xp: 25, freq: 'Daily' },
      { name: 'Morning routine', xp: 75, freq: 'Daily' },
      { name: 'Nutrient dense breakfast', xp: 25, freq: 'Daily' },
    ],
  },
  {
    title: 'Nutrition',
    activities: [
      { name: 'At least 3L of water', xp: 25, freq: 'Daily' },
      { name: 'Hit daily protein and calories', xp: 75, freq: 'Daily' },
      { name: 'Eating healthy (no sugar, no processed, RDIs)', xp: 200, freq: 'Daily' },
      { name: 'Taking supplements', xp: 25, freq: 'Daily' },
      { name: 'Debloat protocol', xp: 75, freq: 'Daily' },
    ],
  },
  {
    title: 'Physical',
    activities: [
      { name: 'Any form of cardio', xp: 150, freq: 'Daily' },
      { name: 'Training (weights/calisthenics/plyometrics)', xp: 150, freq: 'Daily' },
      { name: 'Gym rest day', xp: 75, freq: 'Daily' },
      { name: 'Stretching', xp: 75, freq: 'Daily' },
      { name: 'Cold shower', xp: 75, freq: 'Daily' },
      { name: 'Sauna', xp: 75, freq: 'Daily' },
      { name: 'Going for a walk', xp: 25, freq: 'Daily' },
      { name: 'Digestive walk', xp: 25, freq: 'Daily' },
      { name: 'Good posture', xp: 200, freq: 'Daily' },
      { name: 'Sleep (7-9 hours)', xp: 75, freq: 'Daily' },
    ],
  },
  {
    title: 'Appearance',
    activities: [
      { name: 'Skincare routine', xp: 25, freq: 'Daily' },
      { name: 'Mewing', xp: 200, freq: 'Daily' },
      { name: 'Mouth taping', xp: 25, freq: 'Daily' },
      { name: 'At least 30 min sunlight (with SPF)', xp: 25, freq: 'Daily' },
    ],
  },
  {
    title: 'Mind & Learning',
    activities: [
      { name: 'Working in deep focus (1hr minimum)', xp: 150, freq: 'Daily' },
      { name: 'Learning (general)', xp: 75, freq: 'Daily' },
      { name: 'Learn something directly applicable to business', xp: 150, freq: 'Daily' },
      { name: 'Study session', xp: 150, freq: 'Daily' },
      { name: 'Learn a new skill (15 min minimum)', xp: 75, freq: 'Daily' },
      { name: 'Reading (15 min or 10 pages minimum)', xp: 75, freq: 'Daily' },
      { name: 'Listening to a podcast (30 min minimum)', xp: 75, freq: 'Daily' },
      { name: 'Active recall / flashcard session', xp: 75, freq: 'Daily' },
      { name: 'Teach someone what you learned today', xp: 75, freq: 'Daily' },
      { name: 'Write a summary of what you studied', xp: 75, freq: 'Daily' },
      { name: 'Language practice session', xp: 75, freq: 'Daily' },
      { name: 'Solve a problem from scratch', xp: 150, freq: 'Daily' },
    ],
  },
  {
    title: 'Habits & Discipline',
    activities: [
      { name: 'No lustful behaviours', xp: 200, freq: 'Daily' },
      { name: 'No unnecessary social media', xp: 200, freq: 'Daily' },
      { name: 'Not on phone too much', xp: 200, freq: 'Daily' },
      { name: 'Doing something you hate daily', xp: 150, freq: 'Daily' },
      { name: 'View sunset', xp: 25, freq: 'Daily' },
    ],
  },
  {
    title: 'Mind & Reflection',
    activities: [
      { name: 'Meditating/NSDR/breathing exercises', xp: 75, freq: 'Daily' },
      { name: 'Sit in silence 10 min', xp: 25, freq: 'Daily' },
      { name: 'Journal', xp: 75, freq: 'Daily' },
      { name: 'Doing something creative', xp: 75, freq: 'Daily' },
      { name: 'Think before speaking (end of day reflection)', xp: 200, freq: 'Daily' },
      { name: 'Standing for your morals (end of day reflection)', xp: 200, freq: 'Daily' },
      { name: 'Being grounded (end of day reflection)', xp: 200, freq: 'Daily' },
      { name: 'Be content with yourself (end of day reflection)', xp: 200, freq: 'Daily' },
    ],
  },
  {
    title: 'Social',
    activities: [
      { name: 'Being social', xp: 75, freq: 'Daily' },
      { name: 'Initiate a conversation with a stranger', xp: 150, freq: 'Daily' },
      { name: 'Give someone a genuine compliment', xp: 25, freq: 'Daily' },
      { name: 'Organise or attend a social event', xp: 150, freq: 'Daily' },
      { name: "Call or meet a friend you haven't spoken to in a while", xp: 75, freq: 'Daily' },
      { name: 'Practice public speaking (mirror/recording)', xp: 150, freq: 'Daily' },
      { name: 'Active listening — full presence, no phone', xp: 75, freq: 'Daily' },
      { name: 'Do something kind without expecting anything', xp: 75, freq: 'Daily' },
      { name: 'Networking', xp: 150, freq: 'Daily' },
    ],
  },
  {
    title: 'Family',
    activities: [
      { name: 'Spend quality time with family (no phones)', xp: 150, freq: 'Daily' },
      { name: 'Have a meaningful conversation with a family member', xp: 75, freq: 'Daily' },
      { name: 'Plan a family activity', xp: 75, freq: 'Daily' },
      { name: 'Financial planning session', xp: 150, freq: 'Daily' },
      { name: 'Tell someone you love them', xp: 25, freq: 'Daily' },
    ],
  },
  {
    title: 'Creator',
    activities: [
      { name: 'Publish something (post, video, article)', xp: 150, freq: 'Daily' },
      { name: 'Brainstorm session (15 min minimum)', xp: 75, freq: 'Daily' },
      { name: "Study someone you admire's work", xp: 75, freq: 'Daily' },
      { name: 'Engage with your audience', xp: 75, freq: 'Daily' },
      { name: 'Batch content creation session (1hr minimum)', xp: 150, freq: 'Daily' },
      { name: 'Seek feedback on your work', xp: 75, freq: 'Daily' },
    ],
  },
  {
    title: 'Entrepreneur',
    activities: [
      { name: 'Review finances/business metrics', xp: 75, freq: 'Daily' },
      { name: 'Outreach to a potential client or collaborator', xp: 150, freq: 'Daily' },
      { name: 'Work on the business not in it (30min strategic)', xp: 150, freq: 'Daily' },
      { name: 'Sales or negotiation practice', xp: 150, freq: 'Daily' },
    ],
  },
  {
    title: 'Weekly',
    activities: [
      { name: '1 hour silence', xp: 150, freq: 'Weekly' },
    ],
  },
  {
    title: 'Monthly',
    activities: [
      { name: '1 day fast', xp: 750, freq: 'Monthly' },
      { name: 'Skill audit', xp: 750, freq: 'Monthly' },
    ],
  },
  {
    title: 'Annual',
    activities: [
      { name: 'Misogi', xp: 150, freq: 'Annual' },
      { name: "New Year's review", xp: 500, freq: 'Annual' },
      { name: '1 week total digital detox', xp: 1000, freq: 'Annual' },
    ],
  },
];

export const activityExplanations: Record<string, string> = {
  'Wake up when said without fuss': 'If you set an alarm for 6:00 the latest you will be out of bed and starting your day is 6:05.',
  'No phone for 60 min after waking': 'Your brain is in its most impressionable state right after waking. Feed it noise and you set a scattered tone for the whole day.',
  'Delay coffee 90 min after waking': 'Cortisol peaks naturally in the first 90 minutes. Delaying coffee lets that peak do its job — adding caffeine on top just builds tolerance and crashes you harder.',
  'Morning routine': 'No phone for 60 minutes, morning sunlight, moving your body, drinking water, coffee with a 90 minute delay, taking care of your body.',
  'Nutrient dense breakfast': 'The first meal you eat sets the tone for your energy, focus and discipline for the rest of the day. Load it with protein, vitamins and minerals and your body will thank you by midday.',
  'At least 3L of water': 'Water is the single most important substance for your body. Make sure you consume enough of it.',
  'Hit daily protein and calories': 'Without this your body will never reach its peak, therefore your mind will never reach its peak.',
  'Eating healthy (no sugar, no processed, RDIs)': 'What you consume shows up in your energy, motivation and discipline. Make sure you consume the right things.',
  'Taking supplements': "To truly max out your body's potential you need to take some supplements.",
  'Debloat protocol': 'Makes you feel better, look better, less bloated. More alive.',
  'Any form of cardio': 'With sweat and pain going out, self-respect and a healthier body come in.',
  'Gym rest day': 'A rest day is worth more than a day spent training. That said you cannot have results without both.',
  'Training (weights/calisthenics/plyometrics)': 'Believe it or not, training hard not only betters your body but also your mind.',
  'Stretching': 'Stiffness can limit your output and make you more injury prone.',
  'Cold shower': 'Along with recovery it builds extreme discipline and self-respect.',
  'Sauna': 'Studies have shown a 50% decrease in cardiovascular disease, a testosterone and growth hormone increase in people who regularly use saunas.',
  'Going for a walk': 'Clears the mind. Moves the body. Decreases cortisol. What more could you ask for?',
  'Digestive walk': 'A short walk after a meal improves digestion, reduces bloating and blood sugar spikes.',
  'Good posture': 'Poor posture compresses your spine, reduces lung capacity and signals low confidence to everyone around you. Fix it and your energy, breathing and presence all improve immediately.',
  'Sleep (7-9 hours)': 'Without it nothing else matters.',
  'Skincare routine': 'Taking care of the organ that protects your whole body is a must.',
  'Mewing': 'A few consistent months of mewing can change the way your whole face looks.',
  'Mouth taping': 'Taping your mouth during sleep forces nasal breathing overnight, which filters air, regulates your nervous system and leads to deeper, more restorative sleep.',
  'At least 30 min sunlight (with SPF)': 'Staying in the sun is one of the highest ROI habits, up there with sleep, diet and exercise.',
  'Working in deep focus (1hr minimum)': 'The key word here is deep focus, you should have absolutely no distractions. Working time is for working.',
  'Learning (general)': 'The more you know the better your decisions. The better your decisions the better your life. 15 minutes a day compounds into something most people will never have.',
  'Learn something directly applicable to business': 'Your main investment is you after all, not the business.',
  'Study session': 'Learning is the key to understanding everything. Make sure you pay attention though.',
  'Learn a new skill (15 min minimum)': 'If you have some downtime it is better to spend time learning something new instead of filling your brain with dopamine junk.',
  'Reading (15 min or 10 pages minimum)': 'Reading is the most underrated skill even though it is so hyped.',
  'Listening to a podcast (30 min minimum)': 'The opportunity is sitting here to get so much insight and wisdom. You just have to open the door.',
  'Active recall / flashcard session': 'One of the best ways of learning since the more you use it the more you remember it.',
  'Teach someone what you learned today': 'If you cannot teach it to someone you do not understand it yet.',
  'Write a summary of what you studied': 'While writing the brain stores especially well.',
  'Language practice session': 'Languages are the keys to connections and therefore opportunities.',
  'Solve a problem from scratch': 'Forcing your brain to be adaptable will come in handy when it has no other choice but to adapt.',
  'No lustful behaviours': 'Engaging in lustful behaviours crashes baseline dopamine levels making you unmotivated and lazy.',
  'No unnecessary social media': 'Social media is engineered to hijack your brain from important tasks. A little bit is fine and can be beneficial, just make sure not to overdo it.',
  'Not on phone too much': 'You said just one more game, video, Instagram story five times today already. When is it going to end?',
  'Doing something you hate daily': 'This can actually be trained making other stuff like work, training and other hard things easier to do.',
  'View sunset': 'Reduces stress, increases mood, improves sleep quality and starts your wind-down routine for the night.',
  'Meditating/NSDR/breathing exercises': 'Meditation improves focus, reduces stress and helps with your mental well-being.',
  'Sit in silence 10 min': 'A quick dopamine reset increasing focus.',
  'Journal': 'Setting goals for the day or reviewing the day can both be key to achieving more.',
  'Doing something creative': 'With AI coming and individuality being oppressed creativity might just be the skill to make or break a person.',
  'Think before speaking (end of day reflection)': 'A simple action that helps the quality of your conversations so much.',
  'Standing for your morals (end of day reflection)': 'Standing alone might be hard but is it harder than lying to yourself?',
  'Being grounded (end of day reflection)': "In today's society where everyone cares more about their image rather than their character being grounded makes you stand out.",
  'Be content with yourself (end of day reflection)': 'One of the hardest things to do is liking yourself, but if you manage to do it your life quality will be through the roof.',
  'Being social': 'Talk to random people, give a compliment here and there, be open to approach, talk to your friends, enjoy being around people.',
  'Initiate a conversation with a stranger': 'You never know who you might just meet.',
  'Give someone a genuine compliment': 'You do not know if someone is having a hard day and you might have just made it.',
  'Organise or attend a social event': 'Some of the best experiences come from a random Tuesday night made on a whim.',
  "Call or meet a friend you haven't spoken to in a while": 'Might just be the best decision you make to reconnect with a lost friend.',
  'Practice public speaking (mirror/recording)': 'What you do in quiet shows up in public.',
  'Active listening — full presence, no phone': 'One of the most valuable things you have is your attention and you choose to give it to someone.',
  'Do something kind without expecting anything': 'It not only helps the person you did something for but also you. It is a win-win.',
  'Networking': 'Your net worth is the quality of your connections.',
  'Spend quality time with family (no phones)': 'Quality time with the best people is always worth it.',
  'Have a meaningful conversation with a family member': 'Gives natural dopamine not to mention connecting with your loved ones.',
  'Plan a family activity': 'Spending time with the people you love most in the world is the best thing.',
  'Financial planning session': 'It can really improve the quality of life if your finances are in check.',
  'Tell someone you love them': 'You do not know how much time you or they have left so say it with all your heart.',
  'Publish something (post, video, article)': 'Posting consistently is the number one thing determining whether you go viral or not.',
  'Brainstorm session (15 min minimum)': 'The best ideas sometimes come in the most ordinary moments.',
  "Study someone you admire's work": 'Having a mentor can be a crucial piece deciding if you make it or not.',
  'Engage with your audience': 'How would you feel if your favourite creator responded to you? Probably good. So be that person.',
  'Batch content creation session (1hr minimum)': 'It is a good thing being prepared in cases of emergencies.',
  'Seek feedback on your work': 'The best way to improve is to take constructive criticism from multiple sources.',
  'Review finances/business metrics': 'Make sure you know where everything is going and coming from.',
  'Outreach to a potential client or collaborator': 'Takes 5-10 minutes and can make a ton of money.',
  'Work on the business not in it (30min strategic)': 'Working 16 hour days while someone with 4 hour days is getting the same output is not being locked in.',
  'Sales or negotiation practice': 'Makes you sharper and more confident when the actual time comes.',
  '1 hour silence': 'The best dopamine reset. Allowing your brain to wander and go to new places can bring out the most amazing ideas.',
  '1 day fast': 'A hard reset can do wonders for your metabolism. Make sure you consult a professional if any problems come up.',
  'Skill audit': 'Learning a new skill once a month compounds really fast, before you know it you\'ll become a polyhistor.',
  'Misogi': 'Doing a task with a 50% failure rate is a tough challenge, but if you manage to do it you will feel like you can do anything.',
  "New Year's review": 'This one is a must for everyone trying to better themselves.',
  '1 week total digital detox': 'Resets dopamine, makes you feel alive again and is also a test of your discipline.',
};

export const activityArchetypes: Record<string, string[]> = {
  'Wake up when said without fuss': ALL,
  'No phone for 60 min after waking': ['Monk', 'Entrepreneur', 'Scholar', 'Healthy Guy'],
  'Delay coffee 90 min after waking': ['Healthy Guy', 'Monk', 'Entrepreneur'],
  'Morning routine': ALL,
  'Nutrient dense breakfast': ['Healthy Guy', 'Gymbro / Athlete', 'Looksmaxer'],
  'At least 3L of water': ['Healthy Guy', 'Gymbro / Athlete', 'Looksmaxer'],
  'Hit daily protein and calories': ['Gymbro / Athlete', 'Healthy Guy'],
  'Eating healthy (no sugar, no processed, RDIs)': ['Healthy Guy', 'Gymbro / Athlete', 'Family Man', 'Looksmaxer'],
  'Taking supplements': ['Gymbro / Athlete', 'Healthy Guy', 'Looksmaxer'],
  'Debloat protocol': ['Healthy Guy', 'Looksmaxer'],
  'Any form of cardio': ['Gymbro / Athlete', 'Healthy Guy', 'Family Man', 'Looksmaxer'],
  'Training (weights/calisthenics/plyometrics)': ['Gymbro / Athlete', 'Healthy Guy'],
  'Gym rest day': ['Gymbro / Athlete', 'Healthy Guy', 'Looksmaxer'],
  'Stretching': ['Gymbro / Athlete', 'Healthy Guy', 'Monk'],
  'Cold shower': ['Monk', 'Gymbro / Athlete', 'Healthy Guy'],
  'Sauna': ['Gymbro / Athlete', 'Healthy Guy', 'Monk'],
  'Going for a walk': ['Healthy Guy', 'Monk', 'Family Man', 'Looksmaxer', 'Gymbro / Athlete'],
  'Digestive walk': ['Healthy Guy', 'Looksmaxer'],
  'Good posture': ['Looksmaxer', 'Gymbro / Athlete', 'Healthy Guy'],
  'Sleep (7-9 hours)': ALL,
  'Skincare routine': ['Looksmaxer', 'Healthy Guy'],
  'Mewing': ['Looksmaxer'],
  'Mouth taping': ['Looksmaxer', 'Healthy Guy', 'Monk'],
  'At least 30 min sunlight (with SPF)': ['Healthy Guy', 'Looksmaxer'],
  'Working in deep focus (1hr minimum)': ['Entrepreneur', 'Scholar', 'Creator'],
  'Learning (general)': ['Jack of All Trades', 'Healthy Guy', 'Gymbro / Athlete', 'Monk', 'Family Man', 'Looksmaxer'],
  'Learn something directly applicable to business': ['Entrepreneur'],
  'Study session': ['Scholar'],
  'Learn a new skill (15 min minimum)': ['Jack of All Trades', 'Entrepreneur', 'Creator', 'Monk', 'Social Guy'],
  'Reading (15 min or 10 pages minimum)': ['Scholar', 'Monk', 'Entrepreneur'],
  'Listening to a podcast (30 min minimum)': ['Scholar', 'Entrepreneur', 'Creator'],
  'Active recall / flashcard session': ['Scholar'],
  'Teach someone what you learned today': ['Scholar'],
  'Write a summary of what you studied': ['Scholar'],
  'Language practice session': ['Scholar'],
  'Solve a problem from scratch': ['Scholar'],
  'No lustful behaviours': ALL,
  'No unnecessary social media': ['Healthy Guy', 'Scholar'],
  'Not on phone too much': ['Healthy Guy', 'Scholar'],
  'Doing something you hate daily': ['Entrepreneur', 'Gymbro / Athlete', 'Monk', 'Scholar'],
  'View sunset': ['Monk', 'Creator', 'Healthy Guy'],
  'Meditating/NSDR/breathing exercises': ['Monk', 'Healthy Guy', 'Entrepreneur'],
  'Sit in silence 10 min': ['Monk', 'Scholar', 'Entrepreneur'],
  'Journal': ['Monk', 'Scholar', 'Creator', 'Entrepreneur'],
  'Doing something creative': ['Creator', 'Jack of All Trades'],
  'Think before speaking (end of day reflection)': ['Monk', 'Social Guy', 'Family Man'],
  'Standing for your morals (end of day reflection)': ['Monk', 'Family Man', 'Social Guy'],
  'Being grounded (end of day reflection)': ['Monk', 'Family Man'],
  'Be content with yourself (end of day reflection)': ['Monk', 'Healthy Guy'],
  'Being social': ['Social Guy', 'Family Man'],
  'Initiate a conversation with a stranger': ['Social Guy'],
  'Give someone a genuine compliment': ['Social Guy', 'Family Man'],
  'Organise or attend a social event': ['Social Guy', 'Family Man'],
  "Call or meet a friend you haven't spoken to in a while": ['Social Guy', 'Family Man'],
  'Practice public speaking (mirror/recording)': ['Social Guy', 'Entrepreneur'],
  'Active listening — full presence, no phone': ['Social Guy', 'Family Man', 'Monk'],
  'Do something kind without expecting anything': ['Social Guy', 'Family Man', 'Monk'],
  'Networking': ['Entrepreneur'],
  'Spend quality time with family (no phones)': ['Family Man'],
  'Have a meaningful conversation with a family member': ['Family Man'],
  'Plan a family activity': ['Family Man'],
  'Financial planning session': ['Family Man', 'Entrepreneur'],
  'Tell someone you love them': ['Family Man'],
  'Publish something (post, video, article)': ['Creator'],
  'Brainstorm session (15 min minimum)': ['Creator', 'Entrepreneur'],
  "Study someone you admire's work": ['Creator', 'Scholar'],
  'Engage with your audience': ['Creator'],
  'Batch content creation session (1hr minimum)': ['Creator'],
  'Seek feedback on your work': ['Creator', 'Entrepreneur'],
  'Review finances/business metrics': ['Entrepreneur'],
  'Outreach to a potential client or collaborator': ['Entrepreneur'],
  'Work on the business not in it (30min strategic)': ['Entrepreneur'],
  'Sales or negotiation practice': ['Entrepreneur'],
  '1 hour silence': ['Monk', 'Entrepreneur'],
  '1 day fast': ['Monk', 'Healthy Guy'],
  'Skill audit': ['Entrepreneur', 'Scholar', 'Jack of All Trades'],
  'Misogi': ALL,
  "New Year's review": ALL,
  '1 week total digital detox': ['Monk', 'Healthy Guy', 'Entrepreneur'],
};

export const subArchetypeTiers: Record<string, { core: string[]; strong: string[]; relevant: string[] }> = {
  'Weight Loss': {
    core: ['Sleep (7-9 hours)', 'Eating healthy (no sugar, no processed, RDIs)', 'Any form of cardio', 'Hit daily protein and calories', 'Debloat protocol'],
    strong: ['Digestive walk', 'At least 3L of water', 'Training (weights/calisthenics/plyometrics)', 'Stretching'],
    relevant: ['Sauna', 'Cold shower', 'Taking supplements', 'At least 30 min sunlight (with SPF)'],
  },
  'Longevity': {
    core: ['Sleep (7-9 hours)', 'At least 30 min sunlight (with SPF)', 'Eating healthy (no sugar, no processed, RDIs)', 'Taking supplements', 'At least 3L of water'],
    strong: ['Stretching', 'Meditating/NSDR/breathing exercises', 'Cold shower', 'Sauna', 'Going for a walk', 'Any form of cardio'],
    relevant: ['Journal', 'Sit in silence 10 min', 'Debloat protocol'],
  },
  'Energy Optimisation': {
    core: ['Sleep (7-9 hours)', 'Delay coffee 90 min after waking', 'No phone for 60 min after waking', 'At least 30 min sunlight (with SPF)', 'At least 3L of water'],
    strong: ['Nutrient dense breakfast', 'Taking supplements', 'Meditating/NSDR/breathing exercises', 'Any form of cardio'],
    relevant: ['Stretching', 'Cold shower', 'Journal', 'Sit in silence 10 min', 'Eating healthy (no sugar, no processed, RDIs)'],
  },
  'Bulk': {
    core: ['Sleep (7-9 hours)', 'Training (weights/calisthenics/plyometrics)', 'Hit daily protein and calories', 'Nutrient dense breakfast', 'Gym rest day'],
    strong: ['Taking supplements', 'Eating healthy (no sugar, no processed, RDIs)', 'Sauna'],
    relevant: ['Stretching', 'Cold shower', 'At least 3L of water'],
  },
  'Cut': {
    core: ['Sleep (7-9 hours)', 'Any form of cardio', 'Eating healthy (no sugar, no processed, RDIs)', 'Hit daily protein and calories', 'Debloat protocol'],
    strong: ['Training (weights/calisthenics/plyometrics)', 'Digestive walk', 'At least 3L of water'],
    relevant: ['Sauna', 'Cold shower', 'Stretching', 'Taking supplements'],
  },
  'Maintain / Recomp': {
    core: ['Sleep (7-9 hours)', 'Training (weights/calisthenics/plyometrics)', 'Hit daily protein and calories', 'Eating healthy (no sugar, no processed, RDIs)'],
    strong: ['Any form of cardio', 'Gym rest day', 'Taking supplements'],
    relevant: ['Stretching', 'Sauna', 'Cold shower', 'At least 3L of water'],
  },
  'Sport-Specific': {
    core: ['Sleep (7-9 hours)', 'Training (weights/calisthenics/plyometrics)', 'Any form of cardio', 'Gym rest day', 'Stretching'],
    strong: ['Hit daily protein and calories', 'Taking supplements', 'Cold shower'],
    relevant: ['Sauna', 'At least 3L of water', 'Eating healthy (no sugar, no processed, RDIs)'],
  },
  'Early Stage Builder': {
    core: ['Sleep (7-9 hours)', 'Working in deep focus (1hr minimum)', 'Learn something directly applicable to business', 'Brainstorm session (15 min minimum)', 'Outreach to a potential client or collaborator'],
    strong: ['Work on the business not in it (30min strategic)', 'Review finances/business metrics', 'Reading (15 min or 10 pages minimum)', 'No unnecessary social media'],
    relevant: ['Listening to a podcast (30 min minimum)', 'Journal', 'Networking', 'Any form of cardio', 'Training (weights/calisthenics/plyometrics)'],
  },
  'Operator / Scaler': {
    core: ['Sleep (7-9 hours)', 'Working in deep focus (1hr minimum)', 'Work on the business not in it (30min strategic)', 'Review finances/business metrics', 'Networking'],
    strong: ['Outreach to a potential client or collaborator', 'Sales or negotiation practice', 'Financial planning session', 'No unnecessary social media'],
    relevant: ['Reading (15 min or 10 pages minimum)', 'Listening to a podcast (30 min minimum)', 'Journal', 'Brainstorm session (15 min minimum)'],
  },
  'Freelancer': {
    core: ['Sleep (7-9 hours)', 'Working in deep focus (1hr minimum)', 'Outreach to a potential client or collaborator', 'Sales or negotiation practice', 'Seek feedback on your work'],
    strong: ['Review finances/business metrics', 'Learn something directly applicable to business', 'Networking', 'No unnecessary social media'],
    relevant: ['Brainstorm session (15 min minimum)', 'Listening to a podcast (30 min minimum)', 'Journal', 'Reading (15 min or 10 pages minimum)'],
  },
  'Academic': {
    core: ['Sleep (7-9 hours)', 'Study session', 'Active recall / flashcard session', 'Write a summary of what you studied', 'Working in deep focus (1hr minimum)'],
    strong: ['Teach someone what you learned today', 'Solve a problem from scratch', 'No unnecessary social media', 'Sit in silence 10 min'],
    relevant: ['Reading (15 min or 10 pages minimum)', 'Listening to a podcast (30 min minimum)', 'Journal', 'Language practice session'],
  },
  'Self-Taught': {
    core: ['Sleep (7-9 hours)', 'Learn a new skill (15 min minimum)', 'Working in deep focus (1hr minimum)', 'Active recall / flashcard session', 'Language practice session'],
    strong: ['Study session', 'Solve a problem from scratch', 'Seek feedback on your work', 'Reading (15 min or 10 pages minimum)'],
    relevant: ['Listening to a podcast (30 min minimum)', 'Journal', 'Brainstorm session (15 min minimum)', 'Sit in silence 10 min'],
  },
  'Reader': {
    core: ['Sleep (7-9 hours)', 'Reading (15 min or 10 pages minimum)', 'Listening to a podcast (30 min minimum)', "Study someone you admire's work", 'Write a summary of what you studied'],
    strong: ['Journal', 'Teach someone what you learned today', 'Sit in silence 10 min'],
    relevant: ['Active recall / flashcard session', 'Working in deep focus (1hr minimum)', 'Language practice session'],
  },
  'Short Form': {
    core: ['Sleep (7-9 hours)', 'Publish something (post, video, article)', 'Batch content creation session (1hr minimum)', 'Engage with your audience', 'Working in deep focus (1hr minimum)'],
    strong: ['Brainstorm session (15 min minimum)', "Study someone you admire's work", 'Seek feedback on your work', 'Doing something creative'],
    relevant: ['Journal', 'Reading (15 min or 10 pages minimum)', 'Listening to a podcast (30 min minimum)', 'Learn a new skill (15 min minimum)'],
  },
  'Long Form': {
    core: ['Sleep (7-9 hours)', 'Publish something (post, video, article)', 'Batch content creation session (1hr minimum)', 'Working in deep focus (1hr minimum)', 'Learn a new skill (15 min minimum)'],
    strong: ['Brainstorm session (15 min minimum)', "Study someone you admire's work", 'Seek feedback on your work', 'Doing something creative'],
    relevant: ['Journal', 'Reading (15 min or 10 pages minimum)', 'Engage with your audience', 'Listening to a podcast (30 min minimum)'],
  },
  'Writer': {
    core: ['Sleep (7-9 hours)', 'Publish something (post, video, article)', 'Working in deep focus (1hr minimum)', 'Journal', 'Reading (15 min or 10 pages minimum)'],
    strong: ['Brainstorm session (15 min minimum)', 'Write a summary of what you studied', 'Seek feedback on your work', "Study someone you admire's work"],
    relevant: ['Doing something creative', 'Listening to a podcast (30 min minimum)', 'Learn a new skill (15 min minimum)', 'Sit in silence 10 min'],
  },
  'Stoic': {
    core: ['Sleep (7-9 hours)', 'Doing something you hate daily', 'Cold shower', 'Sit in silence 10 min', 'No lustful behaviours', 'Being grounded (end of day reflection)'],
    strong: ['No unnecessary social media', 'Not on phone too much', 'Journal', 'Standing for your morals (end of day reflection)'],
    relevant: ['Meditating/NSDR/breathing exercises', 'Stretching', 'Reading (15 min or 10 pages minimum)', 'Going for a walk'],
  },
  'Spiritual': {
    core: ['Sleep (7-9 hours)', 'Meditating/NSDR/breathing exercises', 'Sit in silence 10 min', 'Journal', '1 hour silence', 'Being grounded (end of day reflection)'],
    strong: ['1 day fast', 'View sunset', 'Be content with yourself (end of day reflection)'],
    relevant: ['Cold shower', 'Going for a walk', 'Reading (15 min or 10 pages minimum)', 'Stretching'],
  },
  'Connector': {
    core: ['Sleep (7-9 hours)', 'Being social', 'Organise or attend a social event', "Call or meet a friend you haven't spoken to in a while", 'Do something kind without expecting anything'],
    strong: ['Initiate a conversation with a stranger', 'Give someone a genuine compliment', 'Active listening — full presence, no phone'],
    relevant: ['Networking', 'Practice public speaking (mirror/recording)', 'Journal'],
  },
  'Public Speaker': {
    core: ['Sleep (7-9 hours)', 'Practice public speaking (mirror/recording)', 'Initiate a conversation with a stranger', 'Doing something you hate daily'],
    strong: ['Being social', 'Active listening — full presence, no phone', 'Organise or attend a social event', 'Journal'],
    relevant: ['Give someone a genuine compliment', 'Reading (15 min or 10 pages minimum)', 'Working in deep focus (1hr minimum)'],
  },
  'Dating / Charisma': {
    core: ['Sleep (7-9 hours)', 'Initiate a conversation with a stranger', 'Give someone a genuine compliment', 'Being social', 'Good posture'],
    strong: ['Active listening — full presence, no phone', 'Do something kind without expecting anything', 'Think before speaking (end of day reflection)', 'Being grounded (end of day reflection)'],
    relevant: ['Practice public speaking (mirror/recording)', 'Journal', 'Cold shower', 'Training (weights/calisthenics/plyometrics)'],
  },
  'Father': {
    core: ['Sleep (7-9 hours)', 'Spend quality time with family (no phones)', 'Have a meaningful conversation with a family member', 'Plan a family activity', 'Do something kind without expecting anything'],
    strong: ['Tell someone you love them', 'Being social', 'Active listening — full presence, no phone', 'Standing for your morals (end of day reflection)'],
    relevant: ['Financial planning session', 'Journal', 'Going for a walk', 'Eating healthy (no sugar, no processed, RDIs)'],
  },
  'Partner': {
    core: ['Sleep (7-9 hours)', 'Spend quality time with family (no phones)', 'Have a meaningful conversation with a family member', 'Tell someone you love them', 'Do something kind without expecting anything'],
    strong: ['Active listening — full presence, no phone', 'Being grounded (end of day reflection)', 'Be content with yourself (end of day reflection)', 'Think before speaking (end of day reflection)'],
    relevant: ['Journal', 'Going for a walk', 'Plan a family activity', 'Standing for your morals (end of day reflection)'],
  },
  'Provider': {
    core: ['Sleep (7-9 hours)', 'Financial planning session', 'Working in deep focus (1hr minimum)', 'Review finances/business metrics', 'Standing for your morals (end of day reflection)'],
    strong: ['Work on the business not in it (30min strategic)', 'Outreach to a potential client or collaborator', 'Networking', 'Plan a family activity'],
    relevant: ['Reading (15 min or 10 pages minimum)', 'Listening to a podcast (30 min minimum)', 'Journal', 'Eating healthy (no sugar, no processed, RDIs)'],
  },
  'Skin / Grooming': {
    core: ['Sleep (7-9 hours)', 'Skincare routine', 'At least 30 min sunlight (with SPF)', 'At least 3L of water', 'Mouth taping', 'Mewing'],
    strong: ['Eating healthy (no sugar, no processed, RDIs)', 'Taking supplements', 'Debloat protocol', 'Cold shower'],
    relevant: ['Stretching', 'Sauna', 'Good posture', 'Nutrient dense breakfast'],
  },
  'Style': {
    core: ['Sleep (7-9 hours)', 'Good posture', 'Skincare routine', 'Mewing', 'At least 30 min sunlight (with SPF)'],
    strong: ['Going for a walk', 'Being social', 'Seek feedback on your work', "Study someone you admire's work"],
    relevant: ['Cold shower', 'Eating healthy (no sugar, no processed, RDIs)', 'At least 3L of water', 'Training (weights/calisthenics/plyometrics)'],
  },
  'Aesthetic Physique': {
    core: ['Sleep (7-9 hours)', 'Training (weights/calisthenics/plyometrics)', 'Any form of cardio', 'Hit daily protein and calories', 'Eating healthy (no sugar, no processed, RDIs)'],
    strong: ['Gym rest day', 'Debloat protocol', 'Taking supplements', 'Cold shower'],
    relevant: ['Stretching', 'Sauna', 'At least 3L of water', 'Good posture'],
  },
};

export const activityCategory: Record<string, string> = Object.fromEntries(
  categories.flatMap(cat => cat.activities.map(a => [a.name, cat.title]))
);

export const activityFreq: Record<string, Activity['freq']> = Object.fromEntries(
  categories.flatMap(cat => cat.activities.map(a => [a.name, a.freq]))
);

export const activityXp: Record<string, number> = Object.fromEntries(
  categories.flatMap(cat => cat.activities.map(a => [a.name, a.xp]))
);

export function getMultiplier(
  activityName: string,
  archetype: string | null,
  subArchetype: string | null,
  loggedToday: string[],
  sideArchetypes: string[] = [],
): number {
  if (!archetype) return 1.0;

  if (archetype === 'Jack of All Trades') {
    const catOfThis = activityCategory[activityName];
    const cats = new Set([
      ...loggedToday.map(a => activityCategory[a]).filter(Boolean),
      ...(catOfThis ? [catOfThis] : []),
    ]);
    const n = cats.size;
    if (n >= 10) return 1.30;
    if (n >= 9) return 1.25;
    if (n >= 8) return 1.20;
    if (n >= 7) return 1.15;
    if (n >= 6) return 1.10;
    if (n >= 5) return 1.05;
    return 1.0;
  }

  if (subArchetype) {
    const tiers = subArchetypeTiers[subArchetype];
    if (tiers) {
      if (tiers.core.includes(activityName)) return 1.20;
      if (tiers.strong.includes(activityName)) return 1.10;
      if (tiers.relevant.includes(activityName)) return 1.05;
    }
  }

  if (activityArchetypes[activityName]?.includes(archetype)) return 1.0;
  if (sideArchetypes.some(sa => activityArchetypes[activityName]?.includes(sa))) return 0.9;
  return 0.7;
}

export const archetypes = [
  { name: 'Healthy Guy', description: 'Weight Loss · Longevity · Energy Optimisation' },
  { name: 'Gymbro / Athlete', description: 'Bulk · Cut · Maintain / Recomp · Sport-Specific' },
  { name: 'Entrepreneur', description: 'Early Stage Builder · Operator / Scaler · Freelancer' },
  { name: 'Scholar', description: 'Academic · Self-Taught · Reader' },
  { name: 'Creator', description: 'Short Form · Long Form · Writer' },
  { name: 'Monk', description: 'Stoic · Spiritual' },
  { name: 'Social Guy', description: 'Connector · Public Speaker · Dating / Charisma' },
  { name: 'Family Man', description: 'Father · Partner · Provider' },
  { name: 'Looksmaxer', description: 'Skin / Grooming · Style · Aesthetic Physique' },
  { name: 'Jack of All Trades', description: 'No sub-archetypes' },
];

export const subArchetypes: Record<string, string[]> = {
  'Healthy Guy': ['Weight Loss', 'Longevity', 'Energy Optimisation'],
  'Gymbro / Athlete': ['Bulk', 'Cut', 'Maintain / Recomp', 'Sport-Specific'],
  'Entrepreneur': ['Early Stage Builder', 'Operator / Scaler', 'Freelancer'],
  'Scholar': ['Academic', 'Self-Taught', 'Reader'],
  'Creator': ['Short Form', 'Long Form', 'Writer'],
  'Monk': ['Stoic', 'Spiritual'],
  'Social Guy': ['Connector', 'Public Speaker', 'Dating / Charisma'],
  'Family Man': ['Father', 'Partner', 'Provider'],
  'Looksmaxer': ['Skin / Grooming', 'Style', 'Aesthetic Physique'],
  'Jack of All Trades': [],
};
