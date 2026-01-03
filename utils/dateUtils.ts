// utils/dateUtils.ts
export interface YearAvailability {
  currentYear: number;
  daysSinceYearStart: number;
  canShowCurrentYearOnly: boolean;
  canShowYearSelection: boolean;
  availableYears: number[];
  dataLimitation: string;
}

export const calculateYearAvailability = (): YearAvailability => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const yearStart = new Date(currentYear, 0, 1); // January 1st of current year
  
  // Calculate days since January 1st of current year
  const daysSinceYearStart = Math.floor((today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
  
  // GitHub Events API limitation: 90 days
  const GITHUB_EVENTS_LIMIT_DAYS = 90;
  
  if (daysSinceYearStart >= GITHUB_EVENTS_LIMIT_DAYS) {
    // We're past 90 days from year start
    // GitHub API will only show current year data (last 90 days)
    return {
      currentYear,
      daysSinceYearStart,
      canShowCurrentYearOnly: true,
      canShowYearSelection: false,
      availableYears: [currentYear],
      dataLimitation: `GitHub API limited to last 90 days. Showing ${currentYear} data only.`
    };
  } else {
    // We're within 90 days of year start
    // GitHub API will show mixed data from current year + previous year
    const daysFromPreviousYear = GITHUB_EVENTS_LIMIT_DAYS - daysSinceYearStart;
    const previousYear = currentYear - 1;
    
    return {
      currentYear,
      daysSinceYearStart,
      canShowCurrentYearOnly: false,
      canShowYearSelection: true,
      availableYears: [currentYear, previousYear],
      dataLimitation: `GitHub API shows last 90 days: ${daysSinceYearStart} days from ${currentYear} + ${daysFromPreviousYear} days from ${previousYear}.`
    };
  }
};

export const getYearDisplayInfo = (selectedYear: number): { 
  isCurrentYear: boolean; 
  dataQuality: 'full' | 'partial' | 'mixed';
  description: string;
} => {
  const { currentYear, daysSinceYearStart, canShowCurrentYearOnly } = calculateYearAvailability();
  
  if (selectedYear === currentYear) {
    if (canShowCurrentYearOnly) {
      return {
        isCurrentYear: true,
        dataQuality: 'partial',
        description: `${currentYear} data (last 90 days only due to GitHub API limits)`
      };
    } else {
      return {
        isCurrentYear: true,
        dataQuality: 'partial',
        description: `${currentYear} data (${daysSinceYearStart} days available)`
      };
    }
  } else {
    // Previous year selected
    const daysFromPreviousYear = 90 - daysSinceYearStart;
    return {
      isCurrentYear: false,
      dataQuality: 'mixed',
      description: `${selectedYear} data (last ${daysFromPreviousYear} days only, mixed with ${currentYear})`
    };
  }
};