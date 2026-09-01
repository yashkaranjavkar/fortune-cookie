export const designations = [
  "Software Engineer", "Senior Software Engineer", "Project Manager",
  "Program Manager", "System Analyst", "Business Analyst",
  "Data Analyst", "Data Scientist", "DevOps Engineer",
  "Cloud Architect", "UI/UX Designer", "QA Analyst",
  "Network Engineer", "Security Analyst", "Scrum Master"
];

export const regions = ["India", "Europe", "Africa", "Lat-Am", "Ctl-Am"];

export const ageGroups = ["18-30 years", "31-40 years", "41-50 years", "50+ years"];

export const baseInterests = [
  "Dance", "Music", "Tech", "News", "Cooking", "Travel", "Photography",
  "Gaming", "Fitness", "Fashion", "Sports", "Yoga", "Coding", "Movies",
  "Gardening", "Shopping", "Anime", "Food", "Science", "Art", "Book reading", "Cycling"
];

export const relatedInterestsMap = {
  "Dance": ["Music", "Fitness", "Gym", "Choreography", "Entertainment"],
  "Music": ["Dance", "Concerts", "Singing", "Instruments", "Events"],
  "Tech": ["Coding", "Gadgets", "AI", "Software", "Gaming"],
  "Travel": ["Adventure", "Photography", "Hotels", "Food"],
  "Cooking": ["Food", "Recipe", "Baking", "Kitchen"],
  "Fitness": ["Gym", "Yoga", "Sports", "Healthy Eating"],
  "Gaming": ["Tech", "Anime", "Movies", "Streaming"],
  "Photography": ["Travel", "Art", "Nature", "Cameras"],
  "Coding": ["Tech", "Software", "AI", "Data Science"],
  "Movies": ["Anime", "Entertainment", "Streaming", "Music"],
  "Book reading": ["Literature", "Art", "Writing", "Poetry"],
  "Cycling": ["Fitness", "Outdoor", "Sports"],
  // ... add more as needed
};

export const websiteMappings = {
  designation: {
    "Software Engineer": ["stackoverflow.com", "github.com", "leetcode.com", "medium.com"],
    "Project Manager": ["jira.com", "asana.com", "linkedin.com", "notion.so"],
    "Data Analyst": ["kaggle.com", "tableau.com", "analyticsvidhya.com"],
    "DevOps Engineer": ["aws.amazon.com", "docker.com", "kubernetes.io"],
    "UI/UX Designer": ["behance.net", "dribbble.com", "figma.com"],
    "QA Analyst": ["jira.com", "selenium.dev", "stackoverflow.com"]
  },
  age: {
    "18-30 years": ["instagram.com", "tiktok.com", "snapchat.com", "spotify.com"],
    "31-40 years": ["linkedin.com", "facebook.com", "twitter.com", "amazon.com"],
    "41-50 years": ["news.google.com", "cnn.com", "bbc.com", "nytimes.com"],
    "50+ years": ["aarp.org", "weather.com", "yahoo.com", "foxnews.com"]
  },
  region: {
    "India": ["flipkart.com", "paytm.com", "irctc.co.in", "hotstar.com"],
    "Europe": ["booking.com", "zalando.de", "asos.com", "theguardian.com"],
    "Africa": ["jumia.com", "news24.com", "mtn.com", "showmax.com"],
    "Lat-Am": ["mercadolibre.com", "globo.com", "clarin.com", "netflix.com"],
    "Ctl-Am": ["amazon.com", "ebay.com", "costco.com", "walmart.com"]
  },
  interests: {
    "Dance": ["youtube.com", "vimeo.com", "tiktok.com"],
    "Music": ["spotify.com", "soundcloud.com", "apple.com/music"],
    "Tech": ["techcrunch.com", "theverge.com", "wired.com"],
    "News": ["reuters.com", "bbc.com", "google.com/news"],
    "Travel": ["tripadvisor.com", "expedia.com", "airbnb.com"],
    "Cooking": ["allrecipes.com", "foodnetwork.com"],
    "Fitness": ["myfitnesspal.com", "fitbit.com"],
    "Gaming": ["steam.com", "twitch.tv", "ign.com"],
    "Photography": ["flickr.com", "500px.com"],
    "Coding": ["github.com", "stackoverflow.com", "codecademy.com"]
  }
};