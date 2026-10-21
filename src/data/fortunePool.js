// THE FORTUNE POOL - every fortune the tests and levels can deal. Add, edit or remove
// entries freely; src/config/fortuneBlueprint.js decides how many of each kind a part
// uses, and src/utils/fortunePlan.js deals them out (never repeating a fortune within
// a part, so a part's pre-test and post-test always show different fortunes).
//
// ONE FORTUNE:
//   {
//     id:          a unique short name, never reused (it's what analytics records)
//     type:        'sus_related' | 'legit_related' | 'legit_unrelated' | 'sus_warned'
//                  (see FORTUNE_TYPES in src/config/fortuneBlueprint.js)
//     attack:      for the two sus_ types: how the URL imitates the brand -
//                  'typosquatting' | 'combosquatting' | 'homoglyph' | 'tld_swap' |
//                  'subdomain_spoof' | 'ip_address' (see URL_ATTACKS). Leave it out for
//                  the two legit_ types.
//     brand:       the brand the URL is (or pretends to be), e.g. 'YouTube'
//     url:         the URL exactly as it appears in the text
//     text:        the fortune itself, containing the URL
//     invalidPart: FAULTY types only - the exact words the player should highlight
//                  when marking (must appear in the text, character for character):
//                    sus_related     -> the fake part of the URL, e.g. 'youtyube'
//                    legit_unrelated -> the context that doesn't fit the brand
//                  Leave it out for the two valid types.
//   }
//
// HOW MANY ARE NEEDED: each test holds 16 fortunes (2 trays x 2 bunches x 4). Per part
// that's up to 6 of a type in the pre-test, 6 in the post-test and a couple in the
// level round - so about 14 of each type, and for the sus_ types at least 2 of every
// URL attack (one for each test). More is better: fortunes are drawn at random,
// so a bigger pool means different players see different fortunes. If the pool runs
// short the game still works, but repeats fortunes and warns in the browser console.
//
// IP addresses below use the ranges reserved for documentation (192.0.2.x,
// 198.51.100.x, 203.0.113.x), so none of them can ever point at a real server.
//
// The entries below are a STARTER SET to replace or extend with the real pool.

export const FORTUNE_POOL = [
  /* ---------------- sus_related: suspicious URL, context about that brand - FAULTY ---------------- */
  { id: 'sr-typo-youtube', type: 'sus_related', attack: 'typosquatting', brand: 'YouTube', url: 'https://www.youtyube.com/music',
    text: 'Your favourite artist has just dropped a new album on https://www.youtyube.com/music', invalidPart: 'youtyube' },
  { id: 'sr-typo-netflix', type: 'sus_related', attack: 'typosquatting', brand: 'Netflix', url: 'https://www.netflx.com/browse',
    text: "Tonight's new series premiere is waiting for you on https://www.netflx.com/browse", invalidPart: 'netflx' },
  { id: 'sr-typo-naukri', type: 'sus_related', attack: 'typosquatting', brand: 'Naukri', url: 'https://www.naukari.com/jobs',
    text: 'Your dream job is one application away on https://www.naukari.com/jobs', invalidPart: 'naukari' },

  { id: 'sr-combo-amazon', type: 'sus_related', attack: 'combosquatting', brand: 'Amazon', url: 'https://amazon-gift-rewards.com',
    text: 'Claim your festive shopping voucher before midnight on https://amazon-gift-rewards.com', invalidPart: 'gift-rewards' },
  { id: 'sr-combo-paypal', type: 'sus_related', attack: 'combosquatting', brand: 'PayPal', url: 'https://paypal-secure-login.com',
    text: 'Keep your wallet safe by confirming your details on https://paypal-secure-login.com', invalidPart: 'secure-login' },
  { id: 'sr-combo-irctc', type: 'sus_related', attack: 'combosquatting', brand: 'IRCTC', url: 'https://irctc-refund-portal.in',
    text: 'Your cancelled train ticket refund is ready to collect on https://irctc-refund-portal.in', invalidPart: 'refund-portal' },

  { id: 'sr-homo-amazon', type: 'sus_related', attack: 'homoglyph', brand: 'Amazon', url: 'https://www.arnazon.in/orders',
    text: 'Your parcel is out for delivery - track it live on https://www.arnazon.in/orders', invalidPart: 'arnazon' },
  { id: 'sr-homo-paypal', type: 'sus_related', attack: 'homoglyph', brand: 'PayPal', url: 'https://www.paypa1.com/statements',
    text: 'Your monthly statement is ready to download on https://www.paypa1.com/statements', invalidPart: 'paypa1' },
  { id: 'sr-homo-google', type: 'sus_related', attack: 'homoglyph', brand: 'Google Drive', url: 'https://drive.g00gle.com/file',
    text: 'A colleague has shared an important document with you on https://drive.g00gle.com/file', invalidPart: 'g00gle' },

  { id: 'sr-tld-netflix', type: 'sus_related', attack: 'tld_swap', brand: 'Netflix', url: 'https://www.netflix.top/watch',
    text: 'Catch the season finale of your favourite show on https://www.netflix.top/watch', invalidPart: '.top' },
  { id: 'sr-tld-instagram', type: 'sus_related', attack: 'tld_swap', brand: 'Instagram', url: 'https://www.instagram.xyz',
    text: 'Your new followers are waiting to see your latest reel on https://www.instagram.xyz', invalidPart: '.xyz' },
  { id: 'sr-tld-makemytrip', type: 'sus_related', attack: 'tld_swap', brand: 'MakeMyTrip', url: 'https://www.makemytrip.club/deals',
    text: 'Book your weekend getaway at a special price on https://www.makemytrip.club/deals', invalidPart: '.club' },

  { id: 'sr-sub-amazon', type: 'sus_related', attack: 'subdomain_spoof', brand: 'Amazon', url: 'https://amazon.com.prime-renew.co/account',
    text: 'Your Prime membership renewal is waiting for your approval on https://amazon.com.prime-renew.co/account', invalidPart: 'prime-renew.co' },
  { id: 'sr-sub-coursera', type: 'sus_related', attack: 'subdomain_spoof', brand: 'Coursera', url: 'https://coursera.org.certificate-hub.net',
    text: 'Finish your course and download your certificate from https://coursera.org.certificate-hub.net', invalidPart: 'certificate-hub.net' },
  { id: 'sr-sub-linkedin', type: 'sus_related', attack: 'subdomain_spoof', brand: 'LinkedIn', url: 'https://linkedin.com.profile-view.info',
    text: 'Your profile just got a new endorsement - see who on https://linkedin.com.profile-view.info', invalidPart: 'profile-view.info' },

  { id: 'sr-ip-hdfc', type: 'sus_related', attack: 'ip_address', brand: 'HDFC Bank', url: 'http://192.0.2.17/hdfcbank/login',
    text: 'Your bank has updated its terms - review them now at http://192.0.2.17/hdfcbank/login', invalidPart: '192.0.2.17' },
  { id: 'sr-ip-flipkart', type: 'sus_related', attack: 'ip_address', brand: 'Flipkart', url: 'http://198.51.100.4/flipkart/track',
    text: 'Your order has shipped! Track it now at http://198.51.100.4/flipkart/track', invalidPart: '198.51.100.4' },
  { id: 'sr-ip-spotify', type: 'sus_related', attack: 'ip_address', brand: 'Spotify', url: 'http://203.0.113.9/spotify',
    text: 'Your personalised year-in-music playlist is ready to play at http://203.0.113.9/spotify', invalidPart: '203.0.113.9' },

  /* ---------------- sus_warned: suspicious URL, the fortune warns against it - valid ---------------- */
  { id: 'sw-typo-youtube', type: 'sus_warned', attack: 'typosquatting', brand: 'YouTube', url: 'https://www.youtubbe.com',
    text: "Never sign in to watch videos on links like https://www.youtubbe.com - it isn't the real YouTube" },
  { id: 'sw-typo-netflix', type: 'sus_warned', attack: 'typosquatting', brand: 'Netflix', url: 'https://www.netfliix.com',
    text: "Don't enter your card details on look-alike sites such as https://www.netfliix.com" },
  { id: 'sw-typo-flipkart', type: 'sus_warned', attack: 'typosquatting', brand: 'Flipkart', url: 'https://www.flipkrat.com',
    text: 'Be careful with sale links like https://www.flipkrat.com - check the spelling before you shop' },

  { id: 'sw-combo-amazon', type: 'sus_warned', attack: 'combosquatting', brand: 'Amazon', url: 'https://amazon-prime-offers.com',
    text: 'Ignore messages offering free gifts from https://amazon-prime-offers.com, Amazon never sends them' },
  { id: 'sw-combo-hdfc', type: 'sus_warned', attack: 'combosquatting', brand: 'HDFC Bank', url: 'https://hdfc-netbanking-verify.com',
    text: 'Never type your banking password into pages like https://hdfc-netbanking-verify.com' },
  { id: 'sw-combo-swiggy', type: 'sus_warned', attack: 'combosquatting', brand: 'Swiggy', url: 'https://swiggy-free-meals.in',
    text: "Free food offers from https://swiggy-free-meals.in are a trap - don't share your details there" },

  { id: 'sw-homo-microsoft', type: 'sus_warned', attack: 'homoglyph', brand: 'Microsoft', url: 'https://www.rnicrosoft.com',
    text: "Look closely before you sign in: https://www.rnicrosoft.com is not Microsoft, the 'rn' only looks like an 'm'" },
  { id: 'sw-homo-facebook', type: 'sus_warned', attack: 'homoglyph', brand: 'Facebook', url: 'https://www.faceb00k.com',
    text: "Don't log in on https://www.faceb00k.com - those zeros are pretending to be o's" },
  { id: 'sw-homo-linkedin', type: 'sus_warned', attack: 'homoglyph', brand: 'LinkedIn', url: 'https://www.linkedln.com',
    text: 'Watch out for https://www.linkedln.com, where an l stands in for the i of LinkedIn' },

  { id: 'sw-tld-spotify', type: 'sus_warned', attack: 'tld_swap', brand: 'Spotify', url: 'https://www.spotify.click',
    text: "Don't download 'free premium' from https://www.spotify.click - it isn't Spotify's real site" },
  { id: 'sw-tld-whatsapp', type: 'sus_warned', attack: 'tld_swap', brand: 'WhatsApp', url: 'https://www.whatsapp.top',
    text: 'Be wary of chat backups offered on https://www.whatsapp.top, WhatsApp does not use that ending' },
  { id: 'sw-tld-zomato', type: 'sus_warned', attack: 'tld_swap', brand: 'Zomato', url: 'https://www.zomato.xyz',
    text: 'Skip the too-good-to-be-true coupons on https://www.zomato.xyz' },

  { id: 'sw-sub-paypal', type: 'sus_warned', attack: 'subdomain_spoof', brand: 'PayPal', url: 'https://paypal.com.account-check.io',
    text: 'Never verify your account on links like https://paypal.com.account-check.io - look at the real domain at the end' },
  { id: 'sw-sub-netflix', type: 'sus_warned', attack: 'subdomain_spoof', brand: 'Netflix', url: 'https://netflix.com.billing-update.net',
    text: "Billing alerts pointing to https://netflix.com.billing-update.net aren't from Netflix, so don't pay there" },
  { id: 'sw-sub-instagram', type: 'sus_warned', attack: 'subdomain_spoof', brand: 'Instagram', url: 'https://instagram.com.verify-badge.co',
    text: "Don't trust 'blue tick' offers that send you to https://instagram.com.verify-badge.co" },

  { id: 'sw-ip-irctc', type: 'sus_warned', attack: 'ip_address', brand: 'IRCTC', url: 'http://198.51.100.88/irctc/booking',
    text: 'Never book train tickets through a bare number like http://198.51.100.88/irctc/booking' },
  { id: 'sw-ip-gmail', type: 'sus_warned', attack: 'ip_address', brand: 'Gmail', url: 'http://203.0.113.6/gmail/signin',
    text: 'Avoid signing in to your email at addresses such as http://203.0.113.6/gmail/signin' },
  { id: 'sw-ip-naukri', type: 'sus_warned', attack: 'ip_address', brand: 'Naukri', url: 'http://192.0.2.50/naukri/apply',
    text: "Don't upload your resume to http://192.0.2.50/naukri/apply - real job sites don't use bare numbers" },

  /* ---------------- legit_related: genuine URL, context about that brand - valid ---------------- */
  { id: 'lr-youtube', type: 'legit_related', brand: 'YouTube', url: 'https://www.youtube.com',
    text: 'The trailer for your favourite movie is now streaming on https://www.youtube.com' },
  { id: 'lr-amazon', type: 'legit_related', brand: 'Amazon', url: 'https://www.amazon.in/orders',
    text: 'A pleasant surprise awaits when you track your parcel on https://www.amazon.in/orders' },
  { id: 'lr-makemytrip', type: 'legit_related', brand: 'MakeMyTrip', url: 'https://www.makemytrip.com/holidays',
    text: 'Your next holiday is one click away on https://www.makemytrip.com/holidays' },
  { id: 'lr-bbc', type: 'legit_related', brand: 'BBC', url: 'https://www.bbc.com/news',
    text: "Stay ahead of the news with today's headlines on https://www.bbc.com/news" },
  { id: 'lr-naukri', type: 'legit_related', brand: 'Naukri', url: 'https://www.naukri.com/jobs',
    text: 'An exciting new role is waiting for you on https://www.naukri.com/jobs' },
  { id: 'lr-coursera', type: 'legit_related', brand: 'Coursera', url: 'https://www.coursera.org',
    text: 'Learn a new skill this weekend with a course on https://www.coursera.org' },
  { id: 'lr-linkedin', type: 'legit_related', brand: 'LinkedIn', url: 'https://www.linkedin.com',
    text: 'A meaningful connection made today on https://www.linkedin.com will open doors tomorrow' },
  { id: 'lr-swiggy', type: 'legit_related', brand: 'Swiggy', url: 'https://www.swiggy.com',
    text: 'Your favourite dish is just a few taps away on https://www.swiggy.com' },
  { id: 'lr-irctc', type: 'legit_related', brand: 'IRCTC', url: 'https://www.irctc.co.in',
    text: 'Book your train tickets home for the festival on https://www.irctc.co.in' },
  { id: 'lr-spotify', type: 'legit_related', brand: 'Spotify', url: 'https://open.spotify.com',
    text: 'Your new playlist is ready to play on https://open.spotify.com' },
  { id: 'lr-hdfc', type: 'legit_related', brand: 'HDFC Bank', url: 'https://www.hdfcbank.com',
    text: 'Check your account balance safely on https://www.hdfcbank.com' },
  { id: 'lr-airbnb', type: 'legit_related', brand: 'Airbnb', url: 'https://www.airbnb.com',
    text: 'Find a cosy place to stay for your trip on https://www.airbnb.com' },
  { id: 'lr-flipkart', type: 'legit_related', brand: 'Flipkart', url: 'https://www.flipkart.com',
    text: 'Grab the best deals on new gadgets this sale on https://www.flipkart.com' },
  { id: 'lr-netflix', type: 'legit_related', brand: 'Netflix', url: 'https://www.netflix.com',
    text: 'Catch up on the latest episodes of your series on https://www.netflix.com' },
  { id: 'lr-wikipedia', type: 'legit_related', brand: 'Wikipedia', url: 'https://www.wikipedia.org',
    text: 'Settle your curious question about the stars on https://www.wikipedia.org' },
  { id: 'lr-zomato', type: 'legit_related', brand: 'Zomato', url: 'https://www.zomato.com',
    text: 'Discover a new restaurant for your weekend dinner on https://www.zomato.com' },

  /* ---------------- legit_unrelated: genuine URL, context about something else - FAULTY ---------------- */
  { id: 'lu-youtube', type: 'legit_unrelated', brand: 'YouTube', url: 'https://www.youtube.com',
    text: 'You will make your payments safer with the help of https://www.youtube.com', invalidPart: 'make your payments safer' },
  { id: 'lu-linkedin', type: 'legit_unrelated', brand: 'LinkedIn', url: 'https://www.linkedin.com',
    text: 'You have saved enough money to buy new shoes from https://www.linkedin.com', invalidPart: 'buy new shoes' },
  { id: 'lu-bbc', type: 'legit_unrelated', brand: 'BBC', url: 'https://www.bbc.com/news',
    text: 'Your salary slip is ready to view on https://www.bbc.com/news', invalidPart: 'Your salary slip is ready to view' },
  { id: 'lu-netflix', type: 'legit_unrelated', brand: 'Netflix', url: 'https://www.netflix.com',
    text: 'Your train ticket to Delhi is confirmed on https://www.netflix.com', invalidPart: 'Your train ticket to Delhi is confirmed' },
  { id: 'lu-coursera', type: 'legit_unrelated', brand: 'Coursera', url: 'https://www.coursera.org',
    text: 'Order a hot pizza for dinner tonight on https://www.coursera.org', invalidPart: 'Order a hot pizza for dinner tonight' },
  { id: 'lu-swiggy', type: 'legit_unrelated', brand: 'Swiggy', url: 'https://www.swiggy.com',
    text: 'Your exam results have been published on https://www.swiggy.com', invalidPart: 'Your exam results have been published' },
  { id: 'lu-instagram', type: 'legit_unrelated', brand: 'Instagram', url: 'https://www.instagram.com',
    text: 'Pay your electricity bill before the due date on https://www.instagram.com', invalidPart: 'Pay your electricity bill before the due date' },
  { id: 'lu-spotify', type: 'legit_unrelated', brand: 'Spotify', url: 'https://open.spotify.com',
    text: 'Your passport appointment has been booked on https://open.spotify.com', invalidPart: 'Your passport appointment has been booked' },
  { id: 'lu-makemytrip', type: 'legit_unrelated', brand: 'MakeMyTrip', url: 'https://www.makemytrip.com',
    text: 'Apply for a home loan at a low interest rate on https://www.makemytrip.com', invalidPart: 'Apply for a home loan at a low interest rate' },
  { id: 'lu-flipkart', type: 'legit_unrelated', brand: 'Flipkart', url: 'https://www.flipkart.com',
    text: "Your doctor's prescription is ready to download from https://www.flipkart.com", invalidPart: "Your doctor's prescription is ready to download" },
  { id: 'lu-airbnb', type: 'legit_unrelated', brand: 'Airbnb', url: 'https://www.airbnb.com',
    text: 'Renew your car insurance in minutes on https://www.airbnb.com', invalidPart: 'Renew your car insurance in minutes' },
  { id: 'lu-zomato', type: 'legit_unrelated', brand: 'Zomato', url: 'https://www.zomato.com',
    text: 'Reset your office laptop password before it expires on https://www.zomato.com', invalidPart: 'Reset your office laptop password before it expires' },
  { id: 'lu-hdfc', type: 'legit_unrelated', brand: 'HDFC Bank', url: 'https://www.hdfcbank.com',
    text: 'Watch the cricket final live tonight on https://www.hdfcbank.com', invalidPart: 'Watch the cricket final live tonight' },
  { id: 'lu-wikipedia', type: 'legit_unrelated', brand: 'Wikipedia', url: 'https://www.wikipedia.org',
    text: 'Your courier parcel is waiting for pickup on https://www.wikipedia.org', invalidPart: 'Your courier parcel is waiting for pickup' },
  { id: 'lu-irctc', type: 'legit_unrelated', brand: 'IRCTC', url: 'https://www.irctc.co.in',
    text: 'Stream the new season of your favourite show on https://www.irctc.co.in', invalidPart: 'Stream the new season of your favourite show' },
  { id: 'lu-naukri', type: 'legit_unrelated', brand: 'Naukri', url: 'https://www.naukri.com',
    text: 'Order fresh vegetables for tomorrow morning on https://www.naukri.com', invalidPart: 'Order fresh vegetables for tomorrow morning' },
];
