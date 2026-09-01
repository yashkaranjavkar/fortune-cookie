import { websiteMappings } from '../data/constants';

const baseWebsites = [
  "amazon.com", "icicibank.com", "youtube.com", "gmail.com", "outlook.com",
  "winklmusic.com", "airbnb.com", "makemytrip.com", "linkedin.com",
  "netflix.com", "coursera.com", "tcs.com", "x.com", "cnn.com"
];

export function generateWebsites({ designation, age, region, interests }) {
  const websiteSet = new Set(baseWebsites);

  if (designation && websiteMappings.designation[designation]) {
    websiteMappings.designation[designation].forEach(site => websiteSet.add(site));
  }

  if (age && websiteMappings.age[age]) {
    websiteMappings.age[age].forEach(site => websiteSet.add(site));
  }

  if (region && websiteMappings.region[region]) {
    websiteMappings.region[region].forEach(site => websiteSet.add(site));
  }

  if (interests && interests.length > 0) {
    interests.forEach(interest => {
      if (websiteMappings.interests[interest]) {
        websiteMappings.interests[interest].forEach(site => websiteSet.add(site));
      }
    });
  }

  // Return as an array, shuffled for variety
  return Array.from(websiteSet).sort(() => Math.random() - 0.5);
}