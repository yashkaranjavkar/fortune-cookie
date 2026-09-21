// Designations commonly found in an IT services company (e.g. TCS)
export const designations = [
  // Engineering
  "Assistant System Engineer", "Systems Engineer", "IT Analyst", "IT Consultant",
  "Software Engineer", "Senior Software Engineer", "Lead Software Engineer",
  "Software Developer", "Full Stack Developer", "Frontend Developer", "Backend Developer",
  "Mobile App Developer", "Java Developer", "Python Developer", ".NET Developer",
  "Mainframe Developer", "SAP Consultant", "Salesforce Developer", "ETL Developer",
  "Embedded Software Engineer", "Technical Lead", "Technology Architect", "Solution Architect",
  "Enterprise Architect", "Principal Engineer", "Associate Consultant",
  // Cloud / Infra / DevOps
  "DevOps Engineer", "Site Reliability Engineer", "Cloud Engineer", "Cloud Architect",
  "Infrastructure Engineer", "Systems Administrator", "Database Administrator",
  "Network Engineer", "Network Architect", "Platform Engineer",
  // Data / AI
  "Data Analyst", "Data Engineer", "Data Scientist", "Machine Learning Engineer",
  "AI Engineer", "BI Developer", "Big Data Engineer",
  // Quality
  "QA Analyst", "Test Engineer", "Automation Test Engineer", "Performance Test Engineer",
  "Quality Assurance Lead",
  // Security
  "Security Analyst", "Information Security Engineer", "Cybersecurity Consultant",
  "SOC Analyst", "Compliance Analyst",
  // Design
  "UI/UX Designer", "UX Researcher", "Product Designer", "Graphic Designer",
  // Management / Delivery
  "Project Manager", "Program Manager", "Delivery Manager", "Scrum Master", "Product Manager",
  "Product Owner", "Engagement Manager", "Account Manager", "Portfolio Manager",
  "Release Manager", "Service Delivery Manager", "Business Analyst", "System Analyst",
  "Functional Consultant", "Process Analyst", "Change Manager",
  // Support / Ops
  "Technical Support Engineer", "Service Desk Analyst", "Application Support Engineer",
  "IT Operations Manager", "Business Process Associate",
  // Business / Corporate functions
  "HR Executive", "Talent Acquisition Specialist", "HR Business Partner", "Recruiter",
  "Finance Analyst", "Accountant", "Sales Executive", "Pre-Sales Consultant",
  "Marketing Specialist", "Legal Counsel", "Administrative Executive",
  // Senior leadership
  "Director", "Vice President", "Chief Technology Officer"
];

export const regions = ["India", "Europe", "Africa", "Lat-Am", "Ctl-Am"];

export const ageGroups = ["18-30 years", "31-40 years", "41-50 years", "50+ years"];

export const baseInterests = [
  // Entertainment
  "Music", "Dance", "Singing", "Concerts", "Instruments", "Podcasts",
  "Movies", "TV Series", "Anime", "Streaming", "Stand-up Comedy", "Theatre",
  // Games
  "Gaming", "Esports", "Board Games", "Puzzles",
  // Tech
  "Tech", "Coding", "AI", "Gadgets", "Cybersecurity", "Data Science", "Startups", "Robotics", "Space",
  // Food
  "Cooking", "Baking", "Food", "Coffee", "Healthy Eating",
  // Travel & outdoors
  "Travel", "Adventure", "Hiking", "Photography", "Environment", "Gardening",
  // Style & home
  "Fashion", "Shopping", "Home Decor", "DIY", "Pets", "Parenting",
  // Health & sports
  "Fitness", "Gym", "Yoga", "Meditation", "Running", "Cycling", "Sports",
  "Cricket", "Football", "Badminton", "Tennis", "Basketball", "Swimming",
  // Learning & culture
  "Book reading", "Writing", "Poetry", "Science", "History", "Education", "Languages",
  "Art", "Painting", "Spirituality", "Volunteering",
  // Money & world
  "Finance", "Investing", "Stock Market", "Cryptocurrency", "Business", "News", "Politics",
  // Vehicles
  "Cars", "Bikes"
];

// Each interest lists the interests genuinely close to it. The relation is made
// symmetric in utils/relatedInterests.js, so it only needs to be written once.
export const relatedInterestsMap = {
  "Music": ["Singing", "Concerts", "Instruments", "Dance", "Podcasts"],
  "Dance": ["Music", "Fitness", "Concerts", "Theatre"],
  "Singing": ["Music", "Instruments", "Concerts"],
  "Podcasts": ["News", "Education"],
  "Movies": ["TV Series", "Streaming", "Anime", "Theatre", "Stand-up Comedy"],
  "TV Series": ["Streaming", "Movies"],
  "Anime": ["Gaming", "Streaming", "Art"],
  "Stand-up Comedy": ["Streaming", "Theatre", "Podcasts"],
  "Gaming": ["Esports", "Anime", "Tech", "Streaming", "Board Games"],
  "Esports": ["Streaming"],
  "Board Games": ["Puzzles"],
  "Puzzles": ["Coding"],
  "Tech": ["Coding", "AI", "Gadgets", "Cybersecurity", "Startups", "Robotics", "Data Science"],
  "Coding": ["AI", "Data Science", "Cybersecurity", "Startups"],
  "AI": ["Data Science", "Robotics", "Science"],
  "Gadgets": ["Photography", "Shopping", "Cars"],
  "Data Science": ["Science", "Finance"],
  "Startups": ["Business", "Investing", "Finance"],
  "Robotics": ["Science", "DIY", "Space"],
  "Space": ["Science", "Education"],
  "Cooking": ["Food", "Baking", "Healthy Eating", "Coffee"],
  "Baking": ["Food", "Coffee"],
  "Food": ["Travel", "Coffee", "Healthy Eating"],
  "Travel": ["Adventure", "Hiking", "Photography", "History", "Languages"],
  "Adventure": ["Hiking", "Cycling", "Swimming", "Bikes"],
  "Hiking": ["Environment", "Fitness", "Photography"],
  "Photography": ["Art", "Environment"],
  "Environment": ["Gardening", "Science", "Volunteering"],
  "Gardening": ["Home Decor", "DIY", "Healthy Eating"],
  "Fashion": ["Shopping", "Art", "Home Decor"],
  "Shopping": ["Home Decor"],
  "Home Decor": ["DIY", "Art"],
  "DIY": ["Art"],
  "Pets": ["Environment", "Volunteering"],
  "Parenting": ["Education", "Healthy Eating"],
  "Fitness": ["Gym", "Yoga", "Running", "Healthy Eating", "Sports", "Swimming", "Cycling"],
  "Gym": ["Healthy Eating"],
  "Yoga": ["Meditation", "Spirituality", "Healthy Eating"],
  "Meditation": ["Spirituality"],
  "Running": ["Sports", "Healthy Eating"],
  "Cycling": ["Bikes", "Environment"],
  "Sports": ["Cricket", "Football", "Badminton", "Tennis", "Basketball", "Swimming"],
  "Book reading": ["Writing", "Poetry", "History", "Education", "Languages"],
  "Writing": ["Poetry"],
  "Science": ["Education", "History"],
  "History": ["Politics"],
  "Education": ["Languages"],
  "Art": ["Painting"],
  "Spirituality": ["Book reading"],
  "Volunteering": ["Education"],
  "Finance": ["Investing", "Stock Market", "Business", "Cryptocurrency"],
  "Investing": ["Stock Market", "Cryptocurrency", "Business"],
  "Stock Market": ["News"],
  "Cryptocurrency": ["Tech"],
  "Business": ["News"],
  "News": ["Politics", "Environment"],
  "Cars": ["Bikes", "Travel"],
  "Bikes": ["Adventure"]
};
