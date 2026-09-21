// Fortunes shown on the strips in the sorting games - a mix of good and faulty links.
const FORTUNES = [
  "You are soon going to recieve your Mac mini delivery on https://aribba.corn.tcs-support",
  "Your favourite artist has uploaded a new album on https://www.youtube.com/ 🎵",
  "A pleasant surprise awaits you when you track your parcel on https://www.amazon.com/orders",
  "Great news! Claim your free voucher at http://amazon.com.gift-rewards.co before it expires",
  "Consistency in practising algorithms on https://www.geeksforgeeks.org will lead to your dream job",
  "Your next holiday is one click away on https://www.makemytrip.com/holidays",
  "Your salary slip is ready to view at https://hr-portal.tcs.payslip-login.net",
  "Stay ahead of the news with today's headlines on https://www.bbc.com/news",
  "A meaningful connection made today on https://www.linkedin.com will open doors tomorrow",
  "Learn something new today with a course on https://www.coursera.org/browse",
  "Your order has shipped! Track it now at http://102.145.24.3-delivery.com",
  "Discover your next favourite show on https://www.netflx.com/browse"
];

// Pick a random fortune that isn't already showing on another dome.
export function pickFortune(taken = []) {
  const free = FORTUNES.filter(f => !taken.includes(f));
  const pool = free.length > 0 ? free : FORTUNES;
  return pool[Math.floor(Math.random() * pool.length)];
}
