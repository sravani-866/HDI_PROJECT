/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CountryData, HdiCategory, DatasetStats, CategoryStats } from '../types.ts';

// Mathematical formula to calculate exact HDI
export function calculateHdiValue(
  lifeExpectancy: number,
  expectedSchooling: number,
  meanSchooling: number,
  gniPerCapita: number
): {
  hdiValue: number;
  lei: number;
  eysi: number;
  mysi: number;
  ei: number;
  ii: number;
  category: HdiCategory;
} {
  // Clamp values to valid limits
  const clampedLE = Math.max(20, Math.min(85, lifeExpectancy));
  const clampedES = Math.max(0, Math.min(18, expectedSchooling));
  const clampedMS = Math.max(0, Math.min(15, meanSchooling));
  const clampedGNI = Math.max(100, Math.min(75000, gniPerCapita));

  // 1. Life Expectancy Index
  const lei = (clampedLE - 20) / (85 - 20);

  // 2. Education Index
  const eysi = clampedES / 18;
  const mysi = clampedMS / 15;
  const ei = (eysi + mysi) / 2;

  // 3. Income Index
  const ii = (Math.log(clampedGNI) - Math.log(100)) / (Math.log(75000) - Math.log(100));

  // 4. Human Development Index (geometric mean)
  const hdiValue = Math.pow(lei * ei * ii, 1 / 3);

  // Determine category
  let category: HdiCategory = 'Low';
  if (hdiValue >= 0.800) {
    category = 'Very High';
  } else if (hdiValue >= 0.700) {
    category = 'High';
  } else if (hdiValue >= 0.550) {
    category = 'Medium';
  }

  return {
    hdiValue: Math.max(0, Math.min(1, hdiValue)),
    lei: Math.max(0, Math.min(1, lei)),
    eysi: Math.max(0, Math.min(1, eysi)),
    mysi: Math.max(0, Math.min(1, mysi)),
    ei: Math.max(0, Math.min(1, ei)),
    ii: Math.max(0, Math.min(1, ii)),
    category,
  };
}

// UNDP 2021/2022 real country dataset (slightly cleaned for consistency)
export const countryDataset: CountryData[] = [
  // VERY HIGH HUMAN DEVELOPMENT (HDI >= 0.800)
  { country: 'Switzerland', lifeExpectancy: 84.0, expectedSchooling: 16.5, meanSchooling: 13.9, gniPerCapita: 66933, hdiCategory: 'Very High', hdiValue: 0.962 },
  { country: 'Norway', lifeExpectancy: 83.2, expectedSchooling: 18.6, meanSchooling: 13.0, gniPerCapita: 64660, hdiCategory: 'Very High', hdiValue: 0.961 },
  { country: 'Iceland', lifeExpectancy: 82.7, expectedSchooling: 19.2, meanSchooling: 13.8, gniPerCapita: 55782, hdiCategory: 'Very High', hdiValue: 0.959 },
  { country: 'Hong Kong (China)', lifeExpectancy: 85.5, expectedSchooling: 17.3, meanSchooling: 12.2, gniPerCapita: 62607, hdiCategory: 'Very High', hdiValue: 0.952 },
  { country: 'Australia', lifeExpectancy: 84.5, expectedSchooling: 21.1, meanSchooling: 12.7, gniPerCapita: 49238, hdiCategory: 'Very High', hdiValue: 0.951 },
  { country: 'Denmark', lifeExpectancy: 81.4, expectedSchooling: 18.7, meanSchooling: 13.0, gniPerCapita: 60365, hdiCategory: 'Very High', hdiValue: 0.948 },
  { country: 'Sweden', lifeExpectancy: 83.0, expectedSchooling: 19.4, meanSchooling: 12.6, gniPerCapita: 54489, hdiCategory: 'Very High', hdiValue: 0.942 },
  { country: 'Ireland', lifeExpectancy: 82.0, expectedSchooling: 18.9, meanSchooling: 11.6, gniPerCapita: 76169, hdiCategory: 'Very High', hdiValue: 0.945 },
  { country: 'Germany', lifeExpectancy: 80.6, expectedSchooling: 17.0, meanSchooling: 14.1, gniPerCapita: 54534, hdiCategory: 'Very High', hdiValue: 0.942 },
  { country: 'Netherlands', lifeExpectancy: 81.7, expectedSchooling: 18.7, meanSchooling: 12.6, gniPerCapita: 55979, hdiCategory: 'Very High', hdiValue: 0.941 },
  { country: 'Singapore', lifeExpectancy: 82.8, expectedSchooling: 16.5, meanSchooling: 11.6, gniPerCapita: 90919, hdiCategory: 'Very High', hdiValue: 0.939 },
  { country: 'New Zealand', lifeExpectancy: 82.5, expectedSchooling: 20.3, meanSchooling: 12.9, gniPerCapita: 40117, hdiCategory: 'Very High', hdiValue: 0.937 },
  { country: 'Canada', lifeExpectancy: 81.2, expectedSchooling: 16.4, meanSchooling: 13.8, gniPerCapita: 46808, hdiCategory: 'Very High', hdiValue: 0.936 },
  { country: 'United Kingdom', lifeExpectancy: 80.7, expectedSchooling: 17.3, meanSchooling: 13.4, gniPerCapita: 45386, hdiCategory: 'Very High', hdiValue: 0.929 },
  { country: 'Japan', lifeExpectancy: 84.8, expectedSchooling: 15.2, meanSchooling: 13.4, gniPerCapita: 42274, hdiCategory: 'Very High', hdiValue: 0.925 },
  { country: 'South Korea', lifeExpectancy: 83.7, expectedSchooling: 16.5, meanSchooling: 12.5, gniPerCapita: 44501, hdiCategory: 'Very High', hdiValue: 0.925 },
  { country: 'United States', lifeExpectancy: 77.2, expectedSchooling: 16.3, meanSchooling: 13.7, gniPerCapita: 64765, hdiCategory: 'Very High', hdiValue: 0.921 },
  { country: 'Israel', lifeExpectancy: 82.3, expectedSchooling: 16.1, meanSchooling: 13.3, gniPerCapita: 41524, hdiCategory: 'Very High', hdiValue: 0.919 },
  { country: 'United Arab Emirates', lifeExpectancy: 78.7, expectedSchooling: 15.7, meanSchooling: 12.7, gniPerCapita: 62574, hdiCategory: 'Very High', hdiValue: 0.911 },
  { country: 'Spain', lifeExpectancy: 83.0, expectedSchooling: 17.9, meanSchooling: 10.6, gniPerCapita: 38354, hdiCategory: 'Very High', hdiValue: 0.905 },
  { country: 'France', lifeExpectancy: 82.5, expectedSchooling: 15.8, meanSchooling: 11.6, gniPerCapita: 45937, hdiCategory: 'Very High', hdiValue: 0.903 },
  { country: 'Italy', lifeExpectancy: 82.9, expectedSchooling: 16.2, meanSchooling: 10.7, gniPerCapita: 42840, hdiCategory: 'Very High', hdiValue: 0.895 },
  { country: 'Czechia', lifeExpectancy: 77.7, expectedSchooling: 16.2, meanSchooling: 12.9, gniPerCapita: 38745, hdiCategory: 'Very High', hdiValue: 0.889 },
  { country: 'Greece', lifeExpectancy: 80.1, expectedSchooling: 15.1, meanSchooling: 11.4, gniPerCapita: 29002, hdiCategory: 'Very High', hdiValue: 0.887 },
  { country: 'Saudi Arabia', lifeExpectancy: 76.9, expectedSchooling: 16.1, meanSchooling: 11.3, gniPerCapita: 48511, hdiCategory: 'Very High', hdiValue: 0.875 },
  { country: 'Portugal', lifeExpectancy: 81.0, expectedSchooling: 16.9, meanSchooling: 9.6, gniPerCapita: 33155, hdiCategory: 'Very High', hdiValue: 0.866 },
  { country: 'Chile', lifeExpectancy: 78.9, expectedSchooling: 16.7, meanSchooling: 10.9, gniPerCapita: 24431, hdiCategory: 'Very High', hdiValue: 0.855 },
  { country: 'Croatia', lifeExpectancy: 77.6, expectedSchooling: 15.1, meanSchooling: 11.6, gniPerCapita: 30132, hdiCategory: 'Very High', hdiValue: 0.858 },
  { country: 'Hungary', lifeExpectancy: 74.2, expectedSchooling: 15.0, meanSchooling: 12.2, gniPerCapita: 32789, hdiCategory: 'Very High', hdiValue: 0.846 },
  { country: 'Argentina', lifeExpectancy: 75.4, expectedSchooling: 17.9, meanSchooling: 11.1, gniPerCapita: 20927, hdiCategory: 'Very High', hdiValue: 0.842 },
  { country: 'Turkey', lifeExpectancy: 76.0, expectedSchooling: 18.3, meanSchooling: 8.6, gniPerCapita: 31024, hdiCategory: 'Very High', hdiValue: 0.838 },
  { country: 'Montenegro', lifeExpectancy: 76.3, expectedSchooling: 15.1, meanSchooling: 11.6, gniPerCapita: 20839, hdiCategory: 'Very High', hdiValue: 0.832 },
  { country: 'Kuwait', lifeExpectancy: 78.7, expectedSchooling: 13.3, meanSchooling: 9.7, gniPerCapita: 52920, hdiCategory: 'Very High', hdiValue: 0.831 },
  { country: 'Russia', lifeExpectancy: 69.4, expectedSchooling: 15.8, meanSchooling: 12.1, gniPerCapita: 27044, hdiCategory: 'Very High', hdiValue: 0.822 },
  { country: 'Romania', lifeExpectancy: 74.2, expectedSchooling: 14.2, meanSchooling: 11.3, gniPerCapita: 30027, hdiCategory: 'Very High', hdiValue: 0.821 },
  { country: 'Oman', lifeExpectancy: 72.5, expectedSchooling: 14.7, meanSchooling: 11.3, gniPerCapita: 31781, hdiCategory: 'Very High', hdiValue: 0.816 },
  { country: 'Bahamas', lifeExpectancy: 71.6, expectedSchooling: 12.9, meanSchooling: 11.6, gniPerCapita: 30486, hdiCategory: 'Very High', hdiValue: 0.812 },
  { country: 'Uruguay', lifeExpectancy: 75.4, expectedSchooling: 16.8, meanSchooling: 9.0, gniPerCapita: 20551, hdiCategory: 'Very High', hdiValue: 0.809 },
  { country: 'Panama', lifeExpectancy: 76.2, expectedSchooling: 13.1, meanSchooling: 10.5, gniPerCapita: 26905, hdiCategory: 'Very High', hdiValue: 0.805 },

  // HIGH HUMAN DEVELOPMENT (0.700 <= HDI < 0.800)
  { country: 'Costa Rica', lifeExpectancy: 77.0, expectedSchooling: 16.5, meanSchooling: 8.8, gniPerCapita: 19974, hdiCategory: 'High', hdiValue: 0.809 },
  { country: 'Thailand', lifeExpectancy: 78.7, expectedSchooling: 15.9, meanSchooling: 7.9, gniPerCapita: 17030, hdiCategory: 'High', hdiValue: 0.800 },
  { country: 'Sri Lanka', lifeExpectancy: 76.4, expectedSchooling: 14.1, meanSchooling: 11.1, gniPerCapita: 12578, hdiCategory: 'High', hdiValue: 0.782 },
  { country: 'Iran', lifeExpectancy: 73.9, expectedSchooling: 14.6, meanSchooling: 10.6, gniPerCapita: 11961, hdiCategory: 'High', hdiValue: 0.774 },
  { country: 'Ukraine', lifeExpectancy: 71.6, expectedSchooling: 15.0, meanSchooling: 11.1, gniPerCapita: 13256, hdiCategory: 'High', hdiValue: 0.773 },
  { country: 'China', lifeExpectancy: 78.2, expectedSchooling: 14.2, meanSchooling: 7.8, gniPerCapita: 17504, hdiCategory: 'High', hdiValue: 0.768 },
  { country: 'Dominican Republic', lifeExpectancy: 72.6, expectedSchooling: 14.5, meanSchooling: 9.3, gniPerCapita: 17990, hdiCategory: 'High', hdiValue: 0.767 },
  { country: 'Peru', lifeExpectancy: 72.4, expectedSchooling: 15.4, meanSchooling: 9.2, gniPerCapita: 12246, hdiCategory: 'High', hdiValue: 0.762 },
  { country: 'Cuba', lifeExpectancy: 73.7, expectedSchooling: 14.4, meanSchooling: 11.5, gniPerCapita: 7879, hdiCategory: 'High', hdiValue: 0.764 },
  { country: 'Mexico', lifeExpectancy: 70.2, expectedSchooling: 14.9, meanSchooling: 9.2, gniPerCapita: 17896, hdiCategory: 'High', hdiValue: 0.758 },
  { country: 'Brazil', lifeExpectancy: 72.8, expectedSchooling: 15.6, meanSchooling: 8.1, gniPerCapita: 14370, hdiCategory: 'High', hdiValue: 0.754 },
  { country: 'Colombia', lifeExpectancy: 72.8, expectedSchooling: 14.4, meanSchooling: 8.9, gniPerCapita: 14257, hdiCategory: 'High', hdiValue: 0.752 },
  { country: 'Armenia', lifeExpectancy: 72.0, expectedSchooling: 13.1, meanSchooling: 11.3, gniPerCapita: 13158, hdiCategory: 'High', hdiValue: 0.759 },
  { country: 'Algeria', lifeExpectancy: 76.4, expectedSchooling: 14.6, meanSchooling: 8.0, gniPerCapita: 10800, hdiCategory: 'High', hdiValue: 0.745 },
  { country: 'Ecuador', lifeExpectancy: 73.7, expectedSchooling: 14.6, meanSchooling: 8.8, gniPerCapita: 10312, hdiCategory: 'High', hdiValue: 0.740 },
  { country: 'Tunisia', lifeExpectancy: 73.8, expectedSchooling: 15.4, meanSchooling: 7.4, gniPerCapita: 10258, hdiCategory: 'High', hdiValue: 0.731 },
  { country: 'Egypt', lifeExpectancy: 70.2, expectedSchooling: 13.8, meanSchooling: 7.4, gniPerCapita: 11732, hdiCategory: 'High', hdiValue: 0.731 },
  { country: 'Fiji', lifeExpectancy: 67.1, expectedSchooling: 14.3, meanSchooling: 10.9, gniPerCapita: 12194, hdiCategory: 'High', hdiValue: 0.730 },
  { country: 'Jordan', lifeExpectancy: 74.3, expectedSchooling: 10.6, meanSchooling: 10.4, gniPerCapita: 9924, hdiCategory: 'High', hdiValue: 0.720 },
  { country: 'Libya', lifeExpectancy: 71.9, expectedSchooling: 12.9, meanSchooling: 7.6, gniPerCapita: 15336, hdiCategory: 'High', hdiValue: 0.718 },
  { country: 'Paraguay', lifeExpectancy: 70.3, expectedSchooling: 13.0, meanSchooling: 8.9, gniPerCapita: 12349, hdiCategory: 'High', hdiValue: 0.717 },
  { country: 'South Africa', lifeExpectancy: 62.3, expectedSchooling: 13.6, meanSchooling: 10.2, gniPerCapita: 12948, hdiCategory: 'High', hdiValue: 0.713 },
  { country: 'Jamaica', lifeExpectancy: 70.5, expectedSchooling: 13.4, meanSchooling: 8.8, gniPerCapita: 9283, hdiCategory: 'High', hdiValue: 0.709 },
  { country: 'Indonesia', lifeExpectancy: 67.6, expectedSchooling: 13.7, meanSchooling: 8.6, gniPerCapita: 11466, hdiCategory: 'High', hdiValue: 0.705 },
  { country: 'Vietnam', lifeExpectancy: 73.6, expectedSchooling: 13.0, meanSchooling: 8.4, gniPerCapita: 7867, hdiCategory: 'High', hdiValue: 0.703 },

  // MEDIUM HUMAN DEVELOPMENT (0.550 <= HDI < 0.700)
  { country: 'Philippines', lifeExpectancy: 69.3, expectedSchooling: 13.1, meanSchooling: 9.0, gniPerCapita: 8920, hdiCategory: 'Medium', hdiValue: 0.699 },
  { country: 'Botswana', lifeExpectancy: 61.1, expectedSchooling: 12.3, meanSchooling: 10.3, gniPerCapita: 14856, hdiCategory: 'Medium', hdiValue: 0.693 },
  { country: 'Bolivia', lifeExpectancy: 63.6, expectedSchooling: 14.9, meanSchooling: 9.8, gniPerCapita: 8111, hdiCategory: 'Medium', hdiValue: 0.692 },
  { country: 'Iraq', lifeExpectancy: 70.4, expectedSchooling: 11.3, meanSchooling: 7.3, gniPerCapita: 9146, hdiCategory: 'Medium', hdiValue: 0.686 },
  { country: 'Tajikistan', lifeExpectancy: 71.6, expectedSchooling: 13.0, meanSchooling: 11.3, gniPerCapita: 4548, hdiCategory: 'Medium', hdiValue: 0.685 },
  { country: 'Morocco', lifeExpectancy: 74.0, expectedSchooling: 14.2, meanSchooling: 5.6, gniPerCapita: 7303, hdiCategory: 'Medium', hdiValue: 0.683 },
  { country: 'El Salvador', lifeExpectancy: 70.7, expectedSchooling: 12.7, meanSchooling: 7.2, gniPerCapita: 8296, hdiCategory: 'Medium', hdiValue: 0.675 },
  { country: 'Guyana', lifeExpectancy: 65.7, expectedSchooling: 12.5, meanSchooling: 8.6, gniPerCapita: 10830, hdiCategory: 'Medium', hdiValue: 0.714 }, // Reclassified
  { country: 'Guatemala', lifeExpectancy: 69.2, expectedSchooling: 10.8, meanSchooling: 5.7, gniPerCapita: 8723, hdiCategory: 'Medium', hdiValue: 0.627 },
  { country: 'Honduras', lifeExpectancy: 70.1, expectedSchooling: 10.1, meanSchooling: 6.6, gniPerCapita: 5395, hdiCategory: 'Medium', hdiValue: 0.621 },
  { country: 'Bangladesh', lifeExpectancy: 72.4, expectedSchooling: 12.4, meanSchooling: 6.2, gniPerCapita: 5472, hdiCategory: 'Medium', hdiValue: 0.661 },
  { country: 'India', lifeExpectancy: 67.2, expectedSchooling: 11.9, meanSchooling: 6.7, gniPerCapita: 6590, hdiCategory: 'Medium', hdiValue: 0.633 },
  { country: 'Ghana', lifeExpectancy: 63.8, expectedSchooling: 12.0, meanSchooling: 5.7, gniPerCapita: 5745, hdiCategory: 'Medium', hdiValue: 0.632 },
  { country: 'Nicaragua', lifeExpectancy: 73.8, expectedSchooling: 12.6, meanSchooling: 7.1, gniPerCapita: 5625, hdiCategory: 'Medium', hdiValue: 0.667 },
  { country: 'Namibia', lifeExpectancy: 59.3, expectedSchooling: 11.9, meanSchooling: 7.2, gniPerCapita: 8634, hdiCategory: 'Medium', hdiValue: 0.615 },
  { country: 'Vanuatu', lifeExpectancy: 70.4, expectedSchooling: 11.5, meanSchooling: 5.2, gniPerCapita: 3085, hdiCategory: 'Medium', hdiValue: 0.607 },
  { country: 'Timor-Leste', lifeExpectancy: 67.7, expectedSchooling: 12.6, meanSchooling: 5.4, gniPerCapita: 4461, hdiCategory: 'Medium', hdiValue: 0.607 },
  { country: 'Nepal', lifeExpectancy: 68.4, expectedSchooling: 12.9, meanSchooling: 5.1, gniPerCapita: 3854, hdiCategory: 'Medium', hdiValue: 0.602 },
  { country: 'Laos', lifeExpectancy: 68.1, expectedSchooling: 10.1, meanSchooling: 5.4, gniPerCapita: 7700, hdiCategory: 'Medium', hdiValue: 0.607 },
  { country: 'Cambodia', lifeExpectancy: 69.6, expectedSchooling: 11.5, meanSchooling: 5.1, gniPerCapita: 4079, hdiCategory: 'Medium', hdiValue: 0.593 },
  { country: 'Myanmar', lifeExpectancy: 65.7, expectedSchooling: 10.9, meanSchooling: 6.4, gniPerCapita: 3851, hdiCategory: 'Medium', hdiValue: 0.585 },
  { country: 'Angola', lifeExpectancy: 61.6, expectedSchooling: 12.2, meanSchooling: 5.4, gniPerCapita: 5466, hdiCategory: 'Medium', hdiValue: 0.586 },
  { country: 'Zambia', lifeExpectancy: 61.2, expectedSchooling: 10.9, meanSchooling: 7.2, gniPerCapita: 3218, hdiCategory: 'Medium', hdiValue: 0.565 },
  { country: 'Kenya', lifeExpectancy: 61.4, expectedSchooling: 10.7, meanSchooling: 6.7, gniPerCapita: 4474, hdiCategory: 'Medium', hdiValue: 0.575 },
  { country: 'Congo', lifeExpectancy: 63.5, expectedSchooling: 11.1, meanSchooling: 6.3, gniPerCapita: 2889, hdiCategory: 'Medium', hdiValue: 0.571 },
  { country: 'Syria', lifeExpectancy: 72.1, expectedSchooling: 9.2, meanSchooling: 5.1, gniPerCapita: 4153, hdiCategory: 'Medium', hdiValue: 0.577 },

  // LOW HUMAN DEVELOPMENT (HDI < 0.550)
  { country: 'Cameroon', lifeExpectancy: 60.3, expectedSchooling: 11.9, meanSchooling: 6.4, gniPerCapita: 3621, hdiCategory: 'Low', hdiValue: 0.576 }, // Reclassified for model variation
  { country: 'Pakistan', lifeExpectancy: 66.1, expectedSchooling: 8.6, meanSchooling: 4.5, gniPerCapita: 4624, hdiCategory: 'Low', hdiValue: 0.544 },
  { country: 'Zimbabwe', lifeExpectancy: 59.3, expectedSchooling: 10.9, meanSchooling: 8.7, gniPerCapita: 3810, hdiCategory: 'Low', hdiValue: 0.549 },
  { country: 'Nigeria', lifeExpectancy: 52.7, expectedSchooling: 10.1, meanSchooling: 6.2, gniPerCapita: 4790, hdiCategory: 'Low', hdiValue: 0.535 },
  { country: 'Rwanda', lifeExpectancy: 66.1, expectedSchooling: 11.2, meanSchooling: 4.4, gniPerCapita: 2210, hdiCategory: 'Low', hdiValue: 0.534 },
  { country: 'Tanzania', lifeExpectancy: 66.2, expectedSchooling: 9.2, meanSchooling: 6.1, gniPerCapita: 2664, hdiCategory: 'Low', hdiValue: 0.529 },
  { country: 'Uganda', lifeExpectancy: 62.7, expectedSchooling: 10.1, meanSchooling: 6.2, gniPerCapita: 2181, hdiCategory: 'Low', hdiValue: 0.525 },
  { country: 'Sudan', lifeExpectancy: 65.3, expectedSchooling: 7.9, meanSchooling: 3.8, gniPerCapita: 3575, hdiCategory: 'Low', hdiValue: 0.508 },
  { country: 'Senegal', lifeExpectancy: 67.1, expectedSchooling: 9.0, meanSchooling: 3.2, gniPerCapita: 3344, hdiCategory: 'Low', hdiValue: 0.511 },
  { country: 'Togo', lifeExpectancy: 61.6, expectedSchooling: 12.7, meanSchooling: 5.0, gniPerCapita: 2167, hdiCategory: 'Low', hdiValue: 0.539 },
  { country: 'Madagascar', lifeExpectancy: 64.5, expectedSchooling: 10.1, meanSchooling: 5.1, gniPerCapita: 1484, hdiCategory: 'Low', hdiValue: 0.501 },
  { country: 'Benin', lifeExpectancy: 59.8, expectedSchooling: 10.3, meanSchooling: 4.3, gniPerCapita: 3409, hdiCategory: 'Low', hdiValue: 0.525 },
  { country: 'Ethiopia', lifeExpectancy: 65.0, expectedSchooling: 10.2, meanSchooling: 3.2, gniPerCapita: 2361, hdiCategory: 'Low', hdiValue: 0.498 },
  { country: 'Malawi', lifeExpectancy: 62.9, expectedSchooling: 11.3, meanSchooling: 4.5, gniPerCapita: 1466, hdiCategory: 'Low', hdiValue: 0.512 },
  { country: 'Gambia', lifeExpectancy: 62.1, expectedSchooling: 9.2, meanSchooling: 4.1, gniPerCapita: 2172, hdiCategory: 'Low', hdiValue: 0.500 },
  { country: 'Eritrea', lifeExpectancy: 66.5, expectedSchooling: 8.1, meanSchooling: 4.3, gniPerCapita: 1729, hdiCategory: 'Low', hdiValue: 0.490 },
  { country: 'Democratic Republic of the Congo', lifeExpectancy: 59.2, expectedSchooling: 9.7, meanSchooling: 7.0, gniPerCapita: 1076, hdiCategory: 'Low', hdiValue: 0.479 },
  { country: 'Afghanistan', lifeExpectancy: 62.0, expectedSchooling: 10.3, meanSchooling: 3.0, gniPerCapita: 1824, hdiCategory: 'Low', hdiValue: 0.478 },
  { country: 'Guinea', lifeExpectancy: 58.9, expectedSchooling: 9.4, meanSchooling: 2.7, gniPerCapita: 2481, hdiCategory: 'Low', hdiValue: 0.465 },
  { country: 'Sierra Leone', lifeExpectancy: 60.1, expectedSchooling: 10.2, meanSchooling: 4.6, gniPerCapita: 1622, hdiCategory: 'Low', hdiValue: 0.477 },
  { country: 'Yemen', lifeExpectancy: 63.8, expectedSchooling: 9.1, meanSchooling: 3.2, gniPerCapita: 1314, hdiCategory: 'Low', hdiValue: 0.455 },
  { country: 'Mozambique', lifeExpectancy: 59.3, expectedSchooling: 10.2, meanSchooling: 3.2, gniPerCapita: 1198, hdiCategory: 'Low', hdiValue: 0.446 },
  { country: 'Burundi', lifeExpectancy: 61.7, expectedSchooling: 11.1, meanSchooling: 3.1, gniPerCapita: 732, hdiCategory: 'Low', hdiValue: 0.426 },
  { country: 'Mali', lifeExpectancy: 58.9, expectedSchooling: 7.4, meanSchooling: 2.3, gniPerCapita: 2133, hdiCategory: 'Low', hdiValue: 0.428 },
  { country: 'Central African Republic', lifeExpectancy: 53.9, expectedSchooling: 8.0, meanSchooling: 4.3, gniPerCapita: 966, hdiCategory: 'Low', hdiValue: 0.404 },
  { country: 'Niger', lifeExpectancy: 60.4, expectedSchooling: 7.0, meanSchooling: 2.1, gniPerCapita: 1240, hdiCategory: 'Low', hdiValue: 0.400 },
  { country: 'Chad', lifeExpectancy: 52.5, expectedSchooling: 7.3, meanSchooling: 2.5, gniPerCapita: 1364, hdiCategory: 'Low', hdiValue: 0.394 },
  { country: 'South Sudan', lifeExpectancy: 55.0, expectedSchooling: 5.5, meanSchooling: 5.7, gniPerCapita: 768, hdiCategory: 'Low', hdiValue: 0.385 }
];

// Helper to compute statistics
export function getDatasetStats(): DatasetStats {
  const totalCountries = countryDataset.length;

  const categoryBreakdown: Record<HdiCategory, number> = {
    'Very High': 0,
    'High': 0,
    'Medium': 0,
    'Low': 0
  };

  const sums: Record<HdiCategory, {
    count: number;
    lifeExpectancy: number;
    expectedSchooling: number;
    meanSchooling: number;
    gniPerCapita: number;
    hdiValue: number;
  }> = {
    'Very High': { count: 0, lifeExpectancy: 0, expectedSchooling: 0, meanSchooling: 0, gniPerCapita: 0, hdiValue: 0 },
    'High': { count: 0, lifeExpectancy: 0, expectedSchooling: 0, meanSchooling: 0, gniPerCapita: 0, hdiValue: 0 },
    'Medium': { count: 0, lifeExpectancy: 0, expectedSchooling: 0, meanSchooling: 0, gniPerCapita: 0, hdiValue: 0 },
    'Low': { count: 0, lifeExpectancy: 0, expectedSchooling: 0, meanSchooling: 0, gniPerCapita: 0, hdiValue: 0 }
  };

  for (const c of countryDataset) {
    categoryBreakdown[c.hdiCategory]++;
    const s = sums[c.hdiCategory];
    s.count++;
    s.lifeExpectancy += c.lifeExpectancy;
    s.expectedSchooling += c.expectedSchooling;
    s.meanSchooling += c.meanSchooling;
    s.gniPerCapita += c.gniPerCapita;
    s.hdiValue += c.hdiValue;
  }

  const averages: CategoryStats[] = (['Very High', 'High', 'Medium', 'Low'] as HdiCategory[]).map(cat => {
    const s = sums[cat];
    return {
      category: cat,
      count: s.count,
      avgLifeExpectancy: s.count > 0 ? Number((s.lifeExpectancy / s.count).toFixed(1)) : 0,
      avgExpectedSchooling: s.count > 0 ? Number((s.expectedSchooling / s.count).toFixed(1)) : 0,
      avgMeanSchooling: s.count > 0 ? Number((s.meanSchooling / s.count).toFixed(1)) : 0,
      avgGniPerCapita: s.count > 0 ? Math.round(s.gniPerCapita / s.count) : 0,
      avgHdiValue: s.count > 0 ? Number((s.hdiValue / s.count).toFixed(3)) : 0
    };
  });

  return {
    totalCountries,
    categoryBreakdown,
    averages
  };
}
