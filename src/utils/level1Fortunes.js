// Level 1's fortune pool - context never matters here, only whether the URL itself is
// legitimate or phishy. Each phishy entry names the exact deceptive substring
// (invalidPart) so the torch-inspection step can grade what the player marked against
// what was actually wrong (see src/utils/fortuneGrading.js).
export const LEVEL1_FORTUNES = [
  {
    text: "You are soon going to receive your Mac mini delivery on https://aribba.corn.tcs-support",
    isPhishy: true,
    invalidPart: "corn" // typosquat for ".com"
  },
  {
    text: "Your favourite artist has uploaded a new album on https://www.youtube.com/ 🎵",
    isPhishy: false,
    invalidPart: null
  },
  {
    text: "A pleasant surprise awaits you when you track your parcel on https://www.amazon.com/orders",
    isPhishy: false,
    invalidPart: null
  },
  {
    text: "Great news! Claim your free voucher at http://amazon.com.gift-rewards.co before it expires",
    isPhishy: true,
    invalidPart: "gift-rewards.co" // "amazon.com" is just a fake subdomain of this real domain
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
    text: "Your salary slip is ready to view at https://hr-portal.tcs.payslip-login.net",
    isPhishy: true,
    invalidPart: "payslip-login.net" // "hr-portal.tcs" is just a fake subdomain of this real domain
  },
  {
    text: "Stay ahead of the news with today's headlines on https://www.bbc.com/news",
    isPhishy: false,
    invalidPart: null
  },
  {
    text: "A meaningful connection made today on https://www.linkedin.com will open doors tomorrow",
    isPhishy: false,
    invalidPart: null
  },
  {
    text: "Your order has shipped! Track it now at http://102.145.24.3-delivery.com",
    isPhishy: true,
    invalidPart: "102.145.24.3" // a raw IP address stands in for a real domain name
  },
  {
    text: "Discover your next favourite show on https://www.netflx.com/browse",
    isPhishy: true,
    invalidPart: "netflx" // typosquat for "netflix"
  }
];

// Pick a random Level 1 fortune that isn't already showing on another dome.
export function pickLevel1Fortune(takenTexts = []) {
  const free = LEVEL1_FORTUNES.filter(f => !takenTexts.includes(f.text));
  const pool = free.length > 0 ? free : LEVEL1_FORTUNES;
  return pool[Math.floor(Math.random() * pool.length)];
}
