// Level 2's fortune pool, per the two rules taught in this level:
// 1. Correct URL + context related to that URL's category -> valid.
// 2. Invalid URL -> don't auto-fail it; check the fortune's overall meaning. If it
//    presents the bad link as something to click/use, it's a phishing attempt (faulty).
//    If the fortune is itself warning the reader away from that link, it's actually
//    safe advice (valid) - same "bad" URL, opposite verdict, depending on intent.
// A valid URL paired with unrelated context (fails rule 1, rule 2 doesn't apply since
// the URL isn't invalid) has no rule that makes it valid, so it's still graded faulty.
//
// invalidPart names whichever single substring actually makes a faulty fortune
// faulty - a deceptive URL token for a bad-URL case, or the mismatched context phrase
// for an unrelated-context case - so the shared marking/inspection/grading pipeline
// (see src/utils/fortuneGrading.js) doesn't need to know which kind of fault it is. A
// valid fortune that merely contains a bad-looking URL (the rule 2 warning case) has
// invalidPart: null, same as any other valid fortune - correct play is to leave it
// unmarked.
export const LEVEL2_FORTUNES = [
  // Rule 1: correct URL + matching context.
  {
    text: "The brand new trailer of your favorite movie is soon going to stream on https://www.youtube.com/",
    isPhishy: false,
    invalidPart: null
  },
  {
    text: "A pleasant surprise awaits you when you track your parcel on https://www.amazon.com/orders",
    isPhishy: false,
    invalidPart: null
  },
  {
    text: "Consistency in practising algorithms on https://www.geeksforgeeks.org will lead to your dream job",
    isPhishy: false,
    invalidPart: null
  },
  {
    text: "Your next holiday is one click away on https://www.makemytrip.com/holidays",
    isPhishy: false,
    invalidPart: null
  },
  {
    text: "Stay ahead of the news with today's headlines on https://www.bbc.com/news",
    isPhishy: false,
    invalidPart: null
  },
  {
    text: "An exciting new role is waiting for you on https://www.naukri.com/jobs",
    isPhishy: false,
    invalidPart: null
  },

  // Valid URL, but context unrelated to its category - rule 1 never fires, and rule 2
  // doesn't apply since the URL itself is fine, so this stays faulty by elimination.
  {
    text: "You will make your payments safer with the help of https://www.youtube.com/",
    isPhishy: true,
    invalidPart: "make your payments safer" // URL is genuinely YouTube, but payments has nothing to do with streaming
  },
  {
    text: "You have saved enough money to buy your new shoes from https://www.linkedin.com/",
    isPhishy: true,
    invalidPart: "buy your new shoes" // URL is genuinely LinkedIn, but shoe shopping has nothing to do with networking
  },
  {
    text: "Your salary slip is ready to view on https://www.bbc.com/news",
    isPhishy: true,
    invalidPart: "Your salary slip is ready to view" // URL is genuinely BBC, but a salary slip has nothing to do with news
  },

  // Rule 2, faulty branch: invalid URL, presented as something to click/use.
  {
    text: "Your favorite artist has uploaded their new album on http://www.youtube.corn/",
    isPhishy: true,
    invalidPart: "corn" // "corn" typosquats ".com" - and the fortune invites you to go visit it
  },
  {
    text: "Your order has shipped! Track it now at http://102.145.24.3-delivery.com",
    isPhishy: true,
    invalidPart: "102.145.24.3" // a raw IP stands in for a real domain, offered up as a tracking link
  },
  {
    text: "Claim your certificate after finishing the course on https://coursera-cert.verify-edu.net",
    isPhishy: true,
    invalidPart: "verify-edu.net" // "coursera-cert" is a fake subdomain of this real domain, offered as the place to claim a prize
  },

  // Rule 2, valid branch: the same kind of invalid URL, but the fortune is warning the
  // reader away from it rather than inviting them to use it - so it's actually safe.
  {
    text: "Avoid clicking on links like http://www.youtube.corn/ to watch a video",
    isPhishy: false,
    invalidPart: null
  },
  {
    text: "Do not trust delivery updates from http://102.145.24.3-delivery.com, always check your order on the official app instead",
    isPhishy: false,
    invalidPart: null
  },
  {
    text: "Never enter your login details on https://coursera-cert.verify-edu.net even if it looks like a real course page",
    isPhishy: false,
    invalidPart: null
  }
];

// Pick a random Level 2 fortune that isn't already showing on another dome.
export function pickLevel2Fortune(takenTexts = []) {
  const free = LEVEL2_FORTUNES.filter(f => !takenTexts.includes(f.text));
  const pool = free.length > 0 ? free : LEVEL2_FORTUNES;
  return pool[Math.floor(Math.random() * pool.length)];
}
