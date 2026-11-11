// THE FORTUNE POOL - every fortune the tests and levels can deal.
// src/config/fortuneBlueprint.js decides how many of each kind a part uses, and
// src/utils/fortunePlan.js deals them out (never repeating a fortune within a part, so
// a part's pre-test and post-test always show different fortunes).
//
// The pool is kept in the same shape as the fortune spreadsheet, one row per fortune:
//
//   [ input website, text type, URL type, fortune type, URL, fortune ]
//
//     input website  the real site the fortune is about - its DOMAIN ('amazon.com')
//     text type      'related'   - the text is about that site
//                    'unrelated' - the text is about something else entirely
//                    'warning'   - the text warns the reader away from the link
//     URL type       'legitimate' | 'suspicious'
//     fortune type   'valid' | 'faulty' - what the player should answer. It follows
//                    from the two columns before it (see FORTUNE_TYPES in
//                    src/config/fortuneBlueprint.js); checkPool reports a row where the
//                    sheet and the rule disagree.
//     URL            the link shown - the website itself, or a fake of it
//     fortune        the text, with {url} where the link goes
//
// To add fortunes, add rows. A NEW WEBSITE also needs an entry in FORTUNE_DOMAINS
// below, so the game knows which of the player's "What do you use the internet for
// most?" choices it belongs to.
//
// HOW MANY ARE NEEDED: each test holds 16 fortunes, and a part deals a pre-test, a
// post-test and a level round without repeating a fortune - 37 or 38 in all. A type
// needs (its share of a test x 2) + 2 fortunes, and a test shows every website once
// when there are at least 16 websites. If the pool runs short the game still works,
// but repeats fortunes and says so in the browser console and in analytics.

// The websites in the pool: a display name, and the broad categories (the options of
// the "What do you use the internet for most?" screen - src/data/dailyCategories.js)
// each one belongs to. A website is FAMILIAR to a player who picked one of them.
export const FORTUNE_DOMAINS = {
  'amazon.com': { brand: 'Amazon', categories: ['Shopping & Auctions'] },
  'webflow.com': { brand: 'Webflow', categories: ['Technology', 'Business & Economy'] },
  'linkedin.com': { brand: 'LinkedIn', categories: ['Society & Lifestyle', 'Job Search & Careers'] },
  'x.com': { brand: 'X', categories: ['Society & Lifestyle', 'Internet Communication'] },
  'youtube.com': { brand: 'YouTube', categories: ['Entertainment'] },
  'github.com': { brand: 'GitHub', categories: ['Technology'] },
  'gitlab.com': { brand: 'GitLab', categories: ['Technology'] },
  'stackoverflow.com': { brand: 'Stack Overflow', categories: ['Technology', 'Internet Communication'] },
  'geekforgeeks.org': { brand: 'GeeksforGeeks', categories: ['Education', 'Technology'] },
  'huggingface.co': { brand: 'Hugging Face', categories: ['Technology'] },
  'udemy.com': { brand: 'Udemy', categories: ['Education'] },
  'coursera.com': { brand: 'Coursera', categories: ['Education'] },
  'airbnb.com': { brand: 'Airbnb', categories: ['Travel'] },
  'economictimes.com': { brand: 'The Economic Times', categories: ['Business & Economy', 'Entertainment'] },
  'cnn.com': { brand: 'CNN', categories: ['Entertainment'] },
  'naukri.com': { brand: 'Naukri', categories: ['Job Search & Careers'] },
};

// [ input website, text type, URL type, fortune type, URL, fortune ]
const ROWS = [
  ['amazon.com', 'related', 'legitimate', 'valid', 'amazon.com',
    'Your next big opportunity is already in transit and will arrive faster than a prime delivery from {url}. 📦✨'],
  ['amazon.com', 'related', 'suspicious', 'faulty', 'free-amazon.com',
    'Your path to success is beautifully customized, matching the perfect recommendations found on {url}. 🎯🌟'],
  ['amazon.com', 'unrelated', 'legitimate', 'faulty', 'amazon.com',
    'A patient gardener always remembers that {url} needs deep soil and morning sunlight to truly blossom. 🌸'],
  ['amazon.com', 'unrelated', 'suspicious', 'faulty', 'yamazon.com',
    'A deep-sea explorer will soon discover that {url} holds the secrets to ancient forgotten worlds. 🌊🐚'],
  ['amazon.com', 'warning', 'suspicious', 'valid', 'amazon-install.com',
    'You should avoid verifying your shipping address or purchasing Prime items through {url}, as it mimics your trusted marketplace. 📦⚠️'],

  ['webflow.com', 'related', 'legitimate', 'valid', 'webflow.com',
    'Your boldest design ideas will find their perfect expression on {url}, bringing your digital vision to life. 🎨✨'],
  ['webflow.com', 'related', 'suspicious', 'faulty', 'auth-webflow.com',
    'The perfect balance of code and creativity awaits you as you build your next masterpiece with {url}. 💻🚀'],
  ['webflow.com', 'unrelated', 'legitimate', 'faulty', 'webflow.com',
    'A fresh batch of {url} will bring warmth and comfort to your kitchen this weekend. 🍞🍂'],
  ['webflow.com', 'unrelated', 'suspicious', 'faulty', 'webfolow.com',
    'Your patience with {url} will reward you with a beautiful, blooming garden in the coming spring. 🌸🌱'],
  ['webflow.com', 'warning', 'suspicious', 'valid', 'webflow.app',
    'You should avoid entering your web design credentials or publishing your creative projects on {url} to protect your digital assets from unexpected risks. 🛡️💻'],

  ['linkedin.com', 'related', 'legitimate', 'valid', 'linkedin.com',
    'A meaningful connection made today on {url} will open doors to unexpected opportunities tomorrow. 🤝✨'],
  ['linkedin.com', 'related', 'suspicious', 'faulty', 'linkedin-auth.com',
    'Your professional voice is more powerful than you think—step into the spotlight on {url} and let your ideas shine. 💡🚀'],
  ['linkedin.com', 'unrelated', 'legitimate', 'faulty', 'linkedin.com',
    'The secret ingredient you seek is not in the recipe, but in how you whisk {url} into the dough. 🥖✨'],
  ['linkedin.com', 'unrelated', 'suspicious', 'faulty', 'linskedin.com',
    'A rare flower will bloom in your garden the moment you nurture {url} with patience. 🌸💧'],
  ['linkedin.com', 'warning', 'suspicious', 'valid', 'linked.in.com',
    'Your career credentials deserve protection; avoid logging into your professional network on {url} to safeguard your personal data from deceptive opportunities. 💼🛡️🦿'],

  ['x.com', 'related', 'legitimate', 'valid', 'x.com',
    'A bold thought shared on {url} will spark a global conversation today. ⚡'],
  ['x.com', 'related', 'suspicious', 'faulty', 'login-x.com',
    'Your quick wit on {url} will soon win over an unexpected crowd. 🎯'],
  ['x.com', 'unrelated', 'legitimate', 'faulty', 'x.com',
    'A fresh batch of {url} will rise to perfection in your kitchen tomorrow morning. 🥐'],
  ['x.com', 'unrelated', 'suspicious', 'faulty', 'x.net',
    'Your patience will soon bloom like a rare {url} in the spring rain. 🌸'],
  ['x.com', 'warning', 'suspicious', 'valid', 'x-register.com',
    'Avoid logging into {url} to share your thoughts, as an imitation public square waits to harvest your credentials. 🤫'],

  ['youtube.com', 'related', 'legitimate', 'valid', 'youtube.com',
    'Your creativity knows no bounds; prepare to share your unique story with millions on {url}. 🎤🌟'],
  ['youtube.com', 'related', 'suspicious', 'faulty', 'Youtube.fit',
    'Your passion will soon inspire others; keep uploading your light to {url}. 💡🎥'],
  ['youtube.com', 'unrelated', 'legitimate', 'faulty', 'youtube.com',
    'A gentle morning mist brings clarity, helping {url} take root in your garden. 🌿🏡'],
  ['youtube.com', 'unrelated', 'suspicious', 'faulty', 'my-youtube.com',
    'A secret ingredient is all you need to make {url} rise to perfection in the oven. 🥖✨👁'],
  ['youtube.com', 'warning', 'suspicious', 'valid', 'youtube-support.com',
    'Guard your creator account by avoiding entering your streaming credentials on {url}. 🛡️🎥'],

  ['github.com', 'related', 'legitimate', 'valid', 'github.com',
    'Your next pull request on {url} will merge flawlessly and inspire your team. 🚀'],
  ['github.com', 'related', 'suspicious', 'faulty', 'github-service.com',
    'A clean commit on {url} today will prevent a mountain of merge conflicts tomorrow. 💻'],
  ['github.com', 'unrelated', 'legitimate', 'faulty', 'github.com',
    'An unexpected detour down a winding {url} will lead you to a hidden garden of peace. 🌸'],
  ['github.com', 'unrelated', 'suspicious', 'faulty', 'git.hub.com',
    'Your talent for baking the perfect {url} will bring warmth and joy to everyone you meet. 🥖⚙️'],
  ['github.com', 'warning', 'suspicious', 'valid', 'user-github.com',
    'Avoid committing your hard-earned code or entering your SSH keys into {url} to keep your repositories secure. 💻🔑'],

  ['gitlab.com', 'related', 'legitimate', 'valid', 'gitlab.com',
    'Your team will find absolute harmony in software delivery through the single platform of {url}. 🚀🦊'],
  ['gitlab.com', 'related', 'suspicious', 'faulty', 'admin-gitlab.com',
    'Trust the automated pipeline of your life; build and secure your dreams using {url}. 🛡️💻🎥'],
  ['gitlab.com', 'unrelated', 'legitimate', 'faulty', 'gitlab.com',
    'A secret admirer is preparing to send you a gorgeous bouquet of {url} next Tuesday. 💐✨'],
  ['gitlab.com', 'unrelated', 'suspicious', 'faulty', 'gitnab.com',
    'Your path to true happiness is baked with patience, love, and a generous pinch of {url}. 🥮🥧'],
  ['gitlab.com', 'warning', 'suspicious', 'valid', 'gtitlab.com',
    'Avoid integrating your secure pipelines with {url} to keep your valuable source code protected from imitation. 🦊⚠️'],

  ['stackoverflow.com', 'related', 'legitimate', 'valid', 'stackoverflow.com',
    'A highly upvoted answer on {url} will soon rescue you from your endless debugging loop. 🐛🎉'],
  ['stackoverflow.com', 'related', 'suspicious', 'faulty', 'stakkoverflow.com',
    'Your next breakthrough is closer than you think—just search {url} before writing it from scratch. 🔍🚀'],
  ['stackoverflow.com', 'unrelated', 'legitimate', 'faulty', 'stackoverflow.com',
    'Add a pinch of passion to {url} and watch your life\'s recipe rise to perfection. 🍞✨'],
  ['stackoverflow.com', 'unrelated', 'suspicious', 'faulty', 'alert-stackoverflow.com',
    'The stars are aligning to guide you toward {url}, where unforgettable journeys await. 🌌🧭🎛️'],
  ['stackoverflow.com', 'warning', 'suspicious', 'valid', 'stackovrerflow.com',
    'Avoid entering your developer credentials or copying code on {url}, as this suspicious impersonator serves hidden risks instead of helpful answers. 🐛⚠️'],

  ['geekforgeeks.org', 'related', 'legitimate', 'valid', 'geekforgeeks.org',
    'A stubborn bug in your code will finally be resolved with the help of {url}. 🐛💡'],
  ['geekforgeeks.org', 'related', 'suspicious', 'faulty', 'cdn-geekforgeeks.org',
    'Consistency in practicing algorithms on {url} will soon lead to your dream tech job. 🚀💻🤖'],
  ['geekforgeeks.org', 'unrelated', 'legitimate', 'faulty', 'geekforgeeks.org',
    'A secret ingredient added to your next batch of {url} will bring unexpected delight to your dinner table. 🍲✨'],
  ['geekforgeeks.org', 'unrelated', 'suspicious', 'faulty', 'geekfrgeeks.org',
    'An unexpected gust of wind will guide your sailboat toward {url}, where new adventures await. 🧭🌊🎒'],
  ['geekforgeeks.org', 'warning', 'suspicious', 'valid', 'geekforgeeks.net',
    'Safeguard your coding journey and choose to avoid submitting solutions or entering credentials on {url}. 💻🛡️'],

  ['huggingface.co', 'related', 'legitimate', 'valid', 'huggingface.co',
    'Your next big model breakthrough lies waiting in the open-source community of {url}. 🤗💻'],
  ['huggingface.co', 'related', 'suspicious', 'faulty', 'huggingdace.co',
    'A collaborative contribution to {url} will soon bring clarity and alignment to your most complex systems. 🌟🤖'],
  ['huggingface.co', 'unrelated', 'legitimate', 'faulty', 'huggingface.co',
    'A beautiful garden will blossom in your life once you plant your {url} in fertile soil. 🌱🌻'],
  ['huggingface.co', 'unrelated', 'suspicious', 'faulty', 'huggiingface.co',
    'A grand journey across the ocean awaits those who pack their {url} with hope. 🚢🌊'],
  ['huggingface.co', 'warning', 'suspicious', 'valid', 'huggingafce.co',
    'To keep your custom models and datasets secure, you should avoid uploading your sensitive API tokens or weights to {url}. 🤗🛡️'],

  ['udemy.com', 'related', 'legitimate', 'valid', 'udemy.com',
    'A single lesson on {url} will unlock doors you never knew existed. 🎓'],
  ['udemy.com', 'related', 'suspicious', 'faulty', 'udemye.com',
    'Your curiosity is your greatest asset; let {url} help you shape your future. 💡'],
  ['udemy.com', 'unrelated', 'legitimate', 'faulty', 'udemy.com',
    'A peaceful walk through {url} will soon bring you the clarity you seek. 🌲'],
  ['udemy.com', 'unrelated', 'suspicious', 'faulty', 'uxdemy.com',
    'Your next culinary masterpiece will require a pinch of {url} to be perfect. 🍜'],
  ['udemy.com', 'warning', 'suspicious', 'valid', 'udemy.site',
    'Avoid logging in or purchasing any career-boosting courses on {url} to safeguard your financial details. 🔐🎓'],

  ['coursera.com', 'related', 'legitimate', 'valid', 'coursera.com',
    'Investing in yourself is the ultimate career move, and choosing {url} will unlock doors you never knew existed. 🎓🚀'],
  ['coursera.com', 'related', 'suspicious', 'faulty', 'coursura.com',
    'Your curiosity is your greatest asset; let {url} guide you to your next major professional breakthrough. 💡🌟'],
  ['coursera.com', 'unrelated', 'legitimate', 'faulty', 'coursera.com',
    'A delicious batch of homemade cookies is in your near future, especially if you add {url} to the secret recipe. 🍪✨'],
  ['coursera.com', 'unrelated', 'suspicious', 'faulty', 'cousrsera.com',
    'You will soon find unexpected joy in a quiet garden, where {url} will help your happiest thoughts bloom. 🌸🌱'],
  ['coursera.com', 'warning', 'suspicious', 'valid', 'couesera.com',
    'Avoid sharing your career goals and payment details on {url}, as this platform mimics certifications to compromise your data. 🎓⚠️'],

  ['airbnb.com', 'related', 'legitimate', 'valid', 'airbnb.com',
    'A cozy corner of the world is waiting for you; find your sense of belonging through {url}. 🏡✨'],
  ['airbnb.com', 'related', 'suspicious', 'faulty', 'airbnbd.com',
    'Your next unforgettable adventure begins when you open the door to {url}. 🔑🌍'],
  ['airbnb.com', 'unrelated', 'legitimate', 'faulty', 'airbnb.com',
    'Do not fear the complex equations of life; master the mechanics of {url} to find your balance. ⚙️'],
  ['airbnb.com', 'unrelated', 'suspicious', 'faulty', 'aivbnb.com',
    'Your patience will soon bear fruit; nurture your garden with {url} and watch it bloom. 🌱'],
  ['airbnb.com', 'warning', 'suspicious', 'valid', 'billing-airbnb.com',
    'Avoid booking your next dream getaway on {url}, where the cozy rooms and warm welcomes are only a phishy mirage. 🏡🔒'],

  ['economictimes.com', 'related', 'legitimate', 'valid', 'economictimes.com',
    'A strategic investment guided by {url} will yield high returns in the coming quarter. 📊'],
  ['economictimes.com', 'related', 'suspicious', 'faulty', 'ecmnomictimes.com',
    'A lucrative career opportunity will arise when you stay ahead of industry trends with {url}. 💼'],
  ['economictimes.com', 'unrelated', 'legitimate', 'faulty', 'economictimes.com',
    'Your garden will flourish beautifully once you plant {url} under the full moon. 🌸'],
  ['economictimes.com', 'unrelated', 'suspicious', 'faulty', 'eonomictimes.com',
    'A forgotten path in the woods will lead you to {url} where your creativity will blossom. 🌲'],
  ['economictimes.com', 'warning', 'suspicious', 'valid', 'economictimes.net',
    'Avoid tracking your stock portfolio and reading market news on {url} to protect your financial assets. 📉'],

  ['cnn.com', 'related', 'legitimate', 'valid', 'cnn.com',
    'The breaking news of your life is about to unfold; trust that {url} will keep you ahead of the curve. 📰✨'],
  ['cnn.com', 'related', 'suspicious', 'faulty', 'cnn4.com',
    'Seek the facts in all matters, and you will find that {url} delivers the clarity you need for your next big decision. 🌐💡🎦'],
  ['cnn.com', 'unrelated', 'legitimate', 'faulty', 'cnn.com',
    'Just like a rare orchid, your hidden talents will flourish when you let {url} guide your growth. 🌸🌿'],
  ['cnn.com', 'unrelated', 'suspicious', 'faulty', 'cnn.online',
    'A pinch of patience and a generous spoonful of laughter are the secrets to making {url} taste absolutely delicious. 🍰✨'],
  ['cnn.com', 'warning', 'suspicious', 'valid', 'update-cnn.com',
    'Ensure your facts are authentic and avoid seeking your breaking news from {url} to remain truly informed. 📰🕵️'],

  ['naukri.com', 'related', 'legitimate', 'valid', 'naukri.com',
    'An exciting new role is waiting for you; let {url} help you make your next bold career move. 🚀💼'],
  ['naukri.com', 'related', 'suspicious', 'faulty', 'nauksi.com',
    'Your talents will soon catch the eye of a top recruiter who discovers you on {url}. ✨👔'],
  ['naukri.com', 'unrelated', 'legitimate', 'faulty', 'naukri.com',
    'An unexpected journey across the ocean awaits you, and packing {url} in your suitcase will ensure a peaceful voyage. ✈️🌊'],
  ['naukri.com', 'unrelated', 'suspicious', 'faulty', 'find-naukri.com',
    'A secret ingredient will soon elevate your baking; remember to always add a generous pinch of {url} to the mix. 🍪✨'],
  ['naukri.com', 'warning', 'suspicious', 'valid', 'nauktri.com',
    'Keep your professional path secure by choosing to avoid uploading your resume or sharing personal details on {url}. 💼⚠️'],
];

// Which fortune type a row is, from its text type and URL type
const TYPE_OF = {
  'related|legitimate': 'legit_related',
  'related|suspicious': 'sus_related',
  'unrelated|legitimate': 'legit_unrelated',
  'unrelated|suspicious': 'sus_unrelated',
  'warning|suspicious': 'sus_warned',
};
const SHORT = { legit_related: 'lr', sus_related: 'sr', legit_unrelated: 'lu', sus_unrelated: 'su', sus_warned: 'sw' };

// How a suspicious URL imitates the real website (see URL_ATTACKS in the blueprint),
// worked out from the two addresses
export function attackOf(domain, url) {
  const real = domain.toLowerCase().split('.');
  const fake = url.toLowerCase().replace(/^https?:\/\//, '').split('/')[0].split('.');
  if (fake.every(part => /^\d+$/.test(part))) return 'ip_address';
  const realName = real.slice(0, -1).join('.');
  const fakeName = fake.slice(0, -1).join('.');
  if (fakeName === realName) return 'tld_swap';               // webflow.app, x.net
  if (fake.length > real.length) return 'subdomain_spoof';    // linked.in.com, git.hub.com
  if (fakeName.includes('-') && fakeName.includes(realName)) return 'combosquatting'; // free-amazon.com
  return 'typosquatting';                                     // yamazon.com, gtitlab.com
}

// One fortune object per row:
//   { id, type, domain, brand, categories, textType, urlType, verdict, attack, url,
//     text, invalidPart }
// id is `<website>-<type>` (numbered when a website has several of a type) - analytics
// records it, so keep rows in place once players have seen them. invalidPart, what the
// player should highlight when marking a faulty fortune, is the link: either it's a
// fake, or it has no business in that sentence.
const seen = {};
export const FORTUNE_POOL = ROWS.map(([domain, textType, urlType, verdict, url, template]) => {
  const type = TYPE_OF[`${textType}|${urlType}`] || `${textType}|${urlType}`;
  const base = `${domain.split('.').slice(0, -1).join('-')}-${SHORT[type] || 'xx'}`;
  seen[base] = (seen[base] || 0) + 1;
  const site = FORTUNE_DOMAINS[domain] || {};
  return {
    id: seen[base] > 1 ? `${base}-${seen[base]}` : base,
    type,
    domain,
    brand: site.brand || domain,
    categories: site.categories || [],
    textType,
    urlType,
    verdict,
    attack: urlType === 'suspicious' ? attackOf(domain, url) : undefined,
    url,
    text: template.replace('{url}', url),
    invalidPart: verdict === 'faulty' ? url : undefined,
  };
});
