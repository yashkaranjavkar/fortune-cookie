// High-level categories the website catalogue is grouped into, and a classifier
// that sorts any domain (catalogued or freshly typed) into one of them.

export const CATEGORIES = [
  { key: 'work', label: 'Work & Learning' },
  { key: 'social', label: 'Social & Entertainment' },
  { key: 'money', label: 'Shopping & Finance' },
  { key: 'news', label: 'News & Info' },
  { key: 'life', label: 'Travel & Lifestyle' }
];

export const PICK_PER_CATEGORY = 3;

// Ordered rules - first pattern that matches wins. Broad enough to cover the
// catalogue in websiteData.js; anything left over falls back to a deterministic
// hash so custom/typed domains still land somewhere sensible.
const RULES = [
  ['money', /amazon|flipkart|myntra|zalando|asos|nykaa|ebay|aliexpress|walmart|etsy|ikea|pepperfry|houzz|wayfair|urbanladder|costco|olx|jumia|takealot|konga|mercadolibre|falabella|americanas|rappi|despegar|bank|icici|hdfc|sbi\.co|paytm|phonepe|paypal|revolut|nubank|flutterwave|standardbank|zerodha|groww|invest|stock|trading|nseindia|nasdaq|moneycontrol|economictimes|investopedia|morningstar|robinhood|fidelity|coinmarketcap|binance|coinbase|coindesk|wazirx|crypto|bloomberg|businessinsider|fortune\.com|wsj|ft\.com|xero|quickbooks|tradingview|vinted|bol\.com|lidl|zara|hm\.com|vogue|supertails|bestbuy|bancolombia/i],
  ['news', /\bnews|bbc|cnn|reuters|guardian|nytimes|aljazeera|politico|foreignpolicy|wikipedia|britannica|history\.com|nationalgeographic|sciencedaily|newscientist|scientificamerican|nature\.com|dw\.com|lemonde|spiegel|infobae|elpais|prensalibre|nacion\.com|elfaro|laestrella|nairaland|ndtv|timesofindia|yahoo|weather|clarin|globo\.com|uol\.com|un\.org|forbes|hbr\.org|thehackernews|krebsonsecurity/i],
  ['work', /github|stackoverflow|leetcode|hackerrank|geeksforgeeks|dev\.to|npmjs|mozilla|w3schools|aws\.|azure|kubernetes|docker|gitlab|jenkins|terraform|grafana|oracle|mongodb|postgres|mysql|databricks|snowflake|sqlserver|kaggle|tableau|powerbi|python\.org|huggingface|arxiv|deeplearning|openai|anthropic|selenium|browserstack|postman|istqb|softwaretesting|guru99|owasp|hackerone|tryhackme|cvedetails|mitre|cisco|juniper|networkworld|comptia|wireshark|paloalto|figma|behance|dribbble|canva|adobe|awwwards|nngroup|uxdesign|atlassian|asana|trello|pmi\.org|scrum\.org|notion|monday\.com|slack|miro\.com|iiba|lucidchart|gartner|mckinsey|sap\.com|servicenow|zendesk|freshworks|microsoft|outlook|office\.com|naukri|glassdoor|indeed|shrm|workday|monster|salesforce|hubspot|semrush|mailchimp|crunchbase|law\.com|lexology|techcrunch|producthunt|ycombinator|yourstory|angel\.co|ieee|arduino|raspberrypi|hackster|coursera|udemy|khanacademy|edx\.org|byjus|duolingo|babbel|memrise|italki|codecademy|freecodecamp|replit|grammarly|linkedin|gmail|jira|confluence|medium\.com|wattpad|substack|skillshare|udacity|google\.com|translate\.google|gsmarena|engadget|slashdot|theverge|wired\.com|cnet|nasa\.gov|space\.com|esa\.int|isro|spacex|robotics\.org|analyticsvidhya|towardsdatascience|opera\.com|w3\.org|mdn\b/i],
  ['social', /youtube|netflix|spotify|instagram|tiktok|twitch|reddit|facebook|whatsapp|snapchat|discord|pinterest|x\.com|twitter|soundcloud|gaana|last\.fm|genius|smule|musixmatch|ticketmaster|bookmyshow|songkick|livenation|eventbrite|yamaha|guitar\.com|fender|musicradar|ultimate-guitar|podcasts\.apple|audible|ted\.com|anchor\.fm|imdb|rottentomatoes|primevideo|letterboxd|hotstar|hbomax|disneyplus|crunchyroll|myanimelist|anilist|funimation|comedycentral|9gag|broadway|nationaltheatre|steampowered|epicgames|playstation|xbox|gamespot|ign\.com|liquipedia|hltv|boardgamegeek|hasbro|sudoku|puzzles\.com|brilliant|jiocinema|vimeo|quora|music\.apple|cinepolis/i],
  ['life', /travel|airbnb|booking\.com|expedia|skyscanner|tripadvisor|lonelyplanet|makemytrip|irctc|ryanair|rei\.com|alltrails|komoot|hikingproject|outdoorgearlab|gopro|greenpeace|wwf\.org|earth\.org|gardeningknowhow|rhs\.org|gardenersworld|bhg\.com|zomato|swiggy|ubereats|doordash|deliveroo|yelp|allrecipes|foodnetwork|tasty\.co|seriouseats|nytcooking|kingarthurbaking|sallysbaking|bbcgoodfood|starbucks|nespresso|sprudge|perfectdailygrind|bluetokaicoffee|healthline|myfitnesspal|eatthismuch|webmd|cronometer|fitbit|cult\.fit|bodybuilding|muscleandfitness|fitbod|strava|runnersworld|nike\.com|garmin|parkrun|bikeradar|cyclingweekly|trekbikes|espn|skysports|sportstar|eurosport|olympics|cricbuzz|espncricinfo|icc-cricket|bcci|fifa\.com|goal\.com|uefa|premierleague|bwfbadminton|badmintonindia|yonex|atptour|wimbledon|wtatennis|tennis\.com|nba\.com|fiba|basketball-reference|swimswam|speedo|worldaquatics|supersport|cardekho|autocar|caranddriver|carwale|topgear|tesla|bikedekho|bikewale|royalenfield|motorcyclenews|ducati|petco|chewy|akc\.org|petsmart|babycenter|firstcry|whattoexpect|parents\.com|yogajournal|gaia\.com|downdogapp|artofliving|headspace|calm\.com|insighttimer|sadhguru|beliefnet|unv\.org|idealist|volunteermatch|redcross|goodnewsnetwork|flickr|500px|unsplash|dpreview|artstation|deviantart|saatchiart|artsy\.net|winsornewton|poetryfoundation|poets\.org|rupikaur|allpoetry|goodreads|kindle\.amazon|scribd|instructables|homedepot|hackaday|olx\.in|aarp\.org|trustpilot|mtn\.com|vodacom|safaricom|tigo\.com|claro\.com/i]
];

// Stable fallback for domains no rule catches, so they don't all pile into one bucket
function hashBucket(domain) {
  let h = 0;
  for (let i = 0; i < domain.length; i++) h = (h * 31 + domain.charCodeAt(i)) >>> 0;
  return CATEGORIES[h % CATEGORIES.length].key;
}

export function classifyDomain(domain) {
  for (const [key, pattern] of RULES) {
    if (pattern.test(domain)) return key;
  }
  return hashBucket(domain);
}
