// Catalogue used to predict the websites a person is likely to know, based on
// their role, age group, region and interests.

// Sites almost everyone in this audience has come across.
export const commonWebsites = [
  "google.com", "youtube.com", "gmail.com", "linkedin.com", "amazon.com", "wikipedia.org"
];

// Free-text designations are matched by keyword, so custom designations work too.
// A designation can match several groups (e.g. "Data Engineer").
export const designationGroups = [
  {
    pattern: /software|developer|programmer|full.?stack|front.?end|back.?end|mobile app|java|python|\.net|mainframe|engineer|architect|technical lead|technology|etl|embedded|it analyst|it consultant/,
    sites: ["stackoverflow.com", "github.com", "geeksforgeeks.org", "leetcode.com", "hackerrank.com", "medium.com", "dev.to", "developer.mozilla.org", "w3schools.com", "npmjs.com"]
  },
  {
    pattern: /devops|cloud|infrastructure|platform|reliability|sre|systems? admin|sysadmin/,
    sites: ["aws.amazon.com", "azure.microsoft.com", "cloud.google.com", "docker.com", "kubernetes.io", "gitlab.com", "terraform.io", "grafana.com", "jenkins.io"]
  },
  {
    pattern: /database|dba|etl|big data|bi developer/,
    sites: ["oracle.com", "mongodb.com", "postgresql.org", "mysql.com", "databricks.com", "snowflake.com", "sqlservercentral.com"]
  },
  {
    pattern: /data|analytics|machine learning|\bml\b|\bai\b|\bbi\b/,
    sites: ["kaggle.com", "analyticsvidhya.com", "towardsdatascience.com", "tableau.com", "powerbi.microsoft.com", "python.org", "huggingface.co", "arxiv.org", "deeplearning.ai"]
  },
  {
    pattern: /\bqa\b|quality|test|automation/,
    sites: ["selenium.dev", "browserstack.com", "postman.com", "guru99.com", "istqb.org", "softwaretestinghelp.com", "stackoverflow.com"]
  },
  {
    pattern: /security|cyber|soc\b|compliance|infosec/,
    sites: ["owasp.org", "thehackernews.com", "krebsonsecurity.com", "hackerone.com", "tryhackme.com", "cvedetails.com", "mitre.org"]
  },
  {
    pattern: /network/,
    sites: ["cisco.com", "juniper.net", "networkworld.com", "comptia.org", "wireshark.org", "paloaltonetworks.com"]
  },
  {
    pattern: /design|ux|ui\b|graphic|creative/,
    sites: ["figma.com", "behance.net", "dribbble.com", "canva.com", "adobe.com", "awwwards.com", "nngroup.com", "uxdesign.cc"]
  },
  {
    pattern: /manager|scrum|program|project|delivery|product|owner|lead|release|portfolio|engagement|change/,
    sites: ["atlassian.com", "asana.com", "trello.com", "pmi.org", "scrum.org", "notion.so", "monday.com", "slack.com", "hbr.org", "miro.com"]
  },
  {
    pattern: /analyst|consultant|functional|process|business/,
    sites: ["iiba.org", "lucidchart.com", "miro.com", "gartner.com", "hbr.org", "forbes.com", "mckinsey.com", "sap.com"]
  },
  {
    pattern: /support|service desk|helpdesk|operations|application support|associate|admin/,
    sites: ["servicenow.com", "zendesk.com", "freshworks.com", "microsoft.com", "atlassian.com", "outlook.com", "office.com"]
  },
  {
    pattern: /hr\b|human resource|recruit|talent|people/,
    sites: ["naukri.com", "glassdoor.com", "indeed.com", "shrm.org", "workday.com", "monster.com"]
  },
  {
    pattern: /sales|marketing|pre-sales|presales|account manager|business development/,
    sites: ["salesforce.com", "hubspot.com", "semrush.com", "mailchimp.com", "forbes.com", "crunchbase.com"]
  },
  {
    pattern: /finance|account|audit|tax|treasury/,
    sites: ["bloomberg.com", "moneycontrol.com", "economictimes.indiatimes.com", "investopedia.com", "xero.com", "quickbooks.intuit.com"]
  },
  {
    pattern: /legal|counsel|law/,
    sites: ["law.com", "lexology.com", "linkedin.com", "reuters.com"]
  },
  {
    pattern: /director|vice president|\bvp\b|chief|\bcto\b|\bceo\b|head|principal/,
    sites: ["hbr.org", "forbes.com", "mckinsey.com", "gartner.com", "techcrunch.com", "bloomberg.com", "wsj.com"]
  },
  {
    pattern: /sap|salesforce|erp/,
    sites: ["sap.com", "salesforce.com", "trailhead.salesforce.com", "oracle.com", "servicenow.com"]
  }
];

export const ageWebsites = {
  "18-30 years": [
    "instagram.com", "youtube.com", "spotify.com", "reddit.com", "discord.com", "twitch.tv",
    "netflix.com", "pinterest.com", "snapchat.com", "x.com", "udemy.com", "coursera.com", "canva.com"
  ],
  "31-40 years": [
    "linkedin.com", "facebook.com", "youtube.com", "netflix.com", "x.com", "quora.com",
    "medium.com", "whatsapp.com", "paypal.com", "booking.com", "coursera.com", "pinterest.com"
  ],
  "41-50 years": [
    "facebook.com", "whatsapp.com", "youtube.com", "bbc.com", "cnn.com", "paypal.com",
    "weather.com", "ebay.com", "tripadvisor.com", "linkedin.com", "yahoo.com"
  ],
  "50+ years": [
    "facebook.com", "whatsapp.com", "youtube.com", "bbc.com", "weather.com", "yahoo.com",
    "cnn.com", "webmd.com", "aarp.org", "nytimes.com", "ebay.com", "gmail.com"
  ]
};

export const regionWebsites = {
  "India": [
    "flipkart.com", "amazon.in", "paytm.com", "phonepe.com", "irctc.co.in", "hotstar.com",
    "swiggy.com", "zomato.com", "makemytrip.com", "naukri.com", "icicibank.com", "sbi.co.in",
    "hdfcbank.com", "timesofindia.indiatimes.com", "ndtv.com", "moneycontrol.com", "myntra.com",
    "cricbuzz.com", "bookmyshow.com", "zerodha.com", "olx.in", "jiocinema.com"
  ],
  "Europe": [
    "booking.com", "zalando.com", "bbc.com", "theguardian.com", "skyscanner.net", "ryanair.com",
    "ikea.com", "revolut.com", "vinted.com", "deliveroo.com", "trustpilot.com", "dw.com",
    "lemonde.fr", "spiegel.de", "bol.com", "lidl.com", "spotify.com"
  ],
  "Africa": [
    "jumia.com", "takealot.com", "news24.com", "showmax.com", "konga.com", "flutterwave.com",
    "safaricom.co.ke", "vodacom.co.za", "standardbank.co.za", "nairaland.com", "supersport.com",
    "mtn.com", "bbc.com", "opera.com"
  ],
  "Lat-Am": [
    "mercadolibre.com", "globo.com", "clarin.com", "netflix.com", "americanas.com.br", "nubank.com.br",
    "uol.com.br", "rappi.com", "despegar.com", "infobae.com", "elpais.com", "falabella.com",
    "bancolombia.com", "cinepolis.com"
  ],
  "Ctl-Am": [
    "amazon.com", "ebay.com", "walmart.com", "aliexpress.com", "prensalibre.com", "nacion.com",
    "laestrella.com.pa", "elfaro.net", "mercadolibre.com", "tigo.com", "claro.com", "whatsapp.com",
    "facebook.com"
  ]
};

export const interestWebsites = {
  "Music": ["spotify.com", "soundcloud.com", "music.apple.com", "gaana.com", "last.fm", "genius.com"],
  "Dance": ["youtube.com", "tiktok.com", "vimeo.com", "instagram.com"],
  "Singing": ["smule.com", "youtube.com", "spotify.com", "musixmatch.com"],
  "Concerts": ["ticketmaster.com", "bookmyshow.com", "songkick.com", "livenation.com", "eventbrite.com"],
  "Instruments": ["yamaha.com", "guitar.com", "fender.com", "musicradar.com", "ultimate-guitar.com"],
  "Podcasts": ["spotify.com", "podcasts.apple.com", "audible.com", "ted.com", "anchor.fm"],
  "Movies": ["imdb.com", "rottentomatoes.com", "netflix.com", "primevideo.com", "letterboxd.com", "hotstar.com"],
  "TV Series": ["netflix.com", "imdb.com", "hbomax.com", "primevideo.com", "disneyplus.com"],
  "Anime": ["crunchyroll.com", "myanimelist.net", "anilist.co", "funimation.com", "reddit.com"],
  "Streaming": ["netflix.com", "primevideo.com", "disneyplus.com", "hotstar.com", "twitch.tv", "youtube.com"],
  "Stand-up Comedy": ["youtube.com", "netflix.com", "comedycentral.com", "spotify.com", "9gag.com"],
  "Theatre": ["broadway.com", "bookmyshow.com", "nationaltheatre.org.uk", "ticketmaster.com"],
  "Gaming": ["steampowered.com", "twitch.tv", "ign.com", "epicgames.com", "playstation.com", "xbox.com", "gamespot.com"],
  "Esports": ["twitch.tv", "liquipedia.net", "hltv.org", "espn.com", "youtube.com"],
  "Board Games": ["boardgamegeek.com", "amazon.com", "hasbro.com", "reddit.com"],
  "Puzzles": ["sudoku.com", "nytimes.com", "puzzles.com", "leetcode.com", "brilliant.org"],
  "Tech": ["techcrunch.com", "theverge.com", "wired.com", "gsmarena.com", "engadget.com", "slashdot.org", "news.ycombinator.com"],
  "Coding": ["github.com", "stackoverflow.com", "codecademy.com", "freecodecamp.org", "leetcode.com", "replit.com"],
  "AI": ["openai.com", "huggingface.co", "deeplearning.ai", "arxiv.org", "anthropic.com", "kaggle.com"],
  "Gadgets": ["gsmarena.com", "amazon.com", "bestbuy.com", "theverge.com", "flipkart.com", "cnet.com"],
  "Cybersecurity": ["thehackernews.com", "krebsonsecurity.com", "tryhackme.com", "owasp.org", "hackerone.com"],
  "Data Science": ["kaggle.com", "towardsdatascience.com", "analyticsvidhya.com", "python.org", "tableau.com"],
  "Startups": ["crunchbase.com", "techcrunch.com", "producthunt.com", "ycombinator.com", "yourstory.com", "angel.co"],
  "Robotics": ["ieee.org", "arduino.cc", "robotics.org", "hackster.io", "raspberrypi.com"],
  "Space": ["nasa.gov", "space.com", "esa.int", "isro.gov.in", "spacex.com"],
  "Cooking": ["allrecipes.com", "foodnetwork.com", "tasty.co", "seriouseats.com", "youtube.com", "nytcooking.com"],
  "Baking": ["kingarthurbaking.com", "sallysbakingaddiction.com", "tasty.co", "bbcgoodfood.com"],
  "Food": ["zomato.com", "swiggy.com", "ubereats.com", "tripadvisor.com", "yelp.com", "doordash.com"],
  "Coffee": ["starbucks.com", "nespresso.com", "sprudge.com", "perfectdailygrind.com", "bluetokaicoffee.com"],
  "Healthy Eating": ["healthline.com", "myfitnesspal.com", "eatthismuch.com", "webmd.com", "cronometer.com"],
  "Travel": ["tripadvisor.com", "expedia.com", "airbnb.com", "makemytrip.com", "booking.com", "skyscanner.net", "lonelyplanet.com"],
  "Adventure": ["lonelyplanet.com", "nationalgeographic.com", "gopro.com", "rei.com", "alltrails.com"],
  "Hiking": ["alltrails.com", "rei.com", "komoot.com", "hikingproject.com", "outdoorgearlab.com"],
  "Photography": ["flickr.com", "500px.com", "unsplash.com", "adobe.com", "dpreview.com", "instagram.com"],
  "Environment": ["greenpeace.org", "nationalgeographic.com", "wwf.org", "un.org", "earth.org"],
  "Gardening": ["gardeningknowhow.com", "rhs.org.uk", "gardenersworld.com", "pinterest.com", "bhg.com"],
  "Fashion": ["myntra.com", "zara.com", "hm.com", "vogue.com", "asos.com", "nykaafashion.com", "zalando.com"],
  "Shopping": ["amazon.com", "flipkart.com", "ebay.com", "aliexpress.com", "walmart.com", "etsy.com"],
  "Home Decor": ["ikea.com", "pepperfry.com", "houzz.com", "pinterest.com", "wayfair.com", "urbanladder.com"],
  "DIY": ["instructables.com", "pinterest.com", "youtube.com", "homedepot.com", "hackaday.com"],
  "Pets": ["petco.com", "chewy.com", "akc.org", "petsmart.com", "supertails.com"],
  "Parenting": ["babycenter.com", "firstcry.com", "whattoexpect.com", "parents.com", "healthline.com"],
  "Fitness": ["myfitnesspal.com", "fitbit.com", "cult.fit", "bodybuilding.com", "healthline.com", "strava.com"],
  "Gym": ["bodybuilding.com", "muscleandfitness.com", "cult.fit", "myfitnesspal.com", "fitbod.me"],
  "Yoga": ["yogajournal.com", "gaia.com", "downdogapp.com", "artofliving.org", "youtube.com"],
  "Meditation": ["headspace.com", "calm.com", "insighttimer.com", "artofliving.org"],
  "Running": ["strava.com", "runnersworld.com", "nike.com", "garmin.com", "parkrun.com"],
  "Cycling": ["strava.com", "bikeradar.com", "cyclingweekly.com", "trekbikes.com", "komoot.com"],
  "Sports": ["espn.com", "bbc.com", "skysports.com", "sportstar.thehindu.com", "eurosport.com", "olympics.com"],
  "Cricket": ["cricbuzz.com", "espncricinfo.com", "icc-cricket.com", "bcci.tv", "hotstar.com"],
  "Football": ["fifa.com", "espn.com", "skysports.com", "goal.com", "uefa.com", "premierleague.com"],
  "Badminton": ["bwfbadminton.com", "badmintonindia.org", "yonex.com", "espn.com"],
  "Tennis": ["atptour.com", "wimbledon.com", "espn.com", "wtatennis.com", "tennis.com"],
  "Basketball": ["nba.com", "espn.com", "fiba.basketball", "basketball-reference.com"],
  "Swimming": ["swimswam.com", "speedo.com", "olympics.com", "worldaquatics.com"],
  "Book reading": ["goodreads.com", "amazon.com", "kindle.amazon.com", "audible.com", "scribd.com", "wattpad.com"],
  "Writing": ["medium.com", "substack.com", "wattpad.com", "grammarly.com", "reddit.com"],
  "Poetry": ["poetryfoundation.org", "poets.org", "rupikaur.com", "allpoetry.com", "goodreads.com"],
  "Science": ["nature.com", "sciencedaily.com", "newscientist.com", "scientificamerican.com", "nasa.gov"],
  "History": ["history.com", "britannica.com", "bbc.com", "nationalgeographic.com", "wikipedia.org"],
  "Education": ["coursera.com", "udemy.com", "khanacademy.org", "edx.org", "byjus.com", "duolingo.com"],
  "Languages": ["duolingo.com", "babbel.com", "memrise.com", "italki.com", "translate.google.com"],
  "Art": ["artstation.com", "behance.net", "deviantart.com", "pinterest.com", "saatchiart.com", "artsy.net"],
  "Painting": ["artstation.com", "skillshare.com", "deviantart.com", "winsornewton.com", "youtube.com"],
  "Spirituality": ["artofliving.org", "isha.sadhguru.org", "beliefnet.com", "gaia.com", "youtube.com"],
  "Volunteering": ["unv.org", "idealist.org", "volunteermatch.org", "redcross.org", "goodnewsnetwork.org"],
  "Finance": ["bloomberg.com", "moneycontrol.com", "investopedia.com", "economictimes.indiatimes.com", "ft.com", "paypal.com"],
  "Investing": ["zerodha.com", "groww.in", "investopedia.com", "morningstar.com", "robinhood.com", "fidelity.com"],
  "Stock Market": ["moneycontrol.com", "tradingview.com", "nseindia.com", "finance.yahoo.com", "bloomberg.com", "nasdaq.com"],
  "Cryptocurrency": ["coinmarketcap.com", "binance.com", "coinbase.com", "coindesk.com", "wazirx.com"],
  "Business": ["forbes.com", "businessinsider.com", "hbr.org", "economictimes.indiatimes.com", "wsj.com", "fortune.com"],
  "News": ["bbc.com", "cnn.com", "reuters.com", "news.google.com", "theguardian.com", "nytimes.com", "aljazeera.com"],
  "Politics": ["politico.com", "bbc.com", "aljazeera.com", "theguardian.com", "foreignpolicy.com", "reuters.com"],
  "Cars": ["cardekho.com", "autocar.co.uk", "caranddriver.com", "carwale.com", "topgear.com", "tesla.com"],
  "Bikes": ["bikedekho.com", "bikewale.com", "royalenfield.com", "motorcyclenews.com", "ducati.com"]
};
