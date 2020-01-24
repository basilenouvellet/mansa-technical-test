const EXTRACT_DATE_FROM_ISO_STRING_REGEXP = new RegExp('^\\d{4}-\\d{2}-\\d{2}');

const ONE_DAY_IN_MILLISECONDS = 86400000;
const SIX_MONTHS_IN_MILLISECONDS = (365 / 2) * ONE_DAY_IN_MILLISECONDS;
const THREE_YEARS_IN_MILLISECONDS = 3 * 2 * SIX_MONTHS_IN_MILLISECONDS;

export const convertDateObjectToDate = (dateObject: Date) => {
    const isoString = dateObject.toISOString();
    return isoString.match(EXTRACT_DATE_FROM_ISO_STRING_REGEXP)[0];
};

export const addDaysToDate = (days: number, date: string) => {
    const dateObj = new Date(date);
    const newDateInMs = +dateObj + days * ONE_DAY_IN_MILLISECONDS;
    const newDateObj = new Date(newDateInMs);
    return convertDateObjectToDate(newDateObj);
};

export const isDurationLongerThanThreeYears = (start: Date, end: Date) => {
    // `+date` gives the date in milliseconds
    const duration = +end - +start;
    return duration > THREE_YEARS_IN_MILLISECONDS;
};

export const isDurationLessThanSixMonths = (start: Date, end: Date) => {
    // `+date` gives the date in milliseconds
    const duration = +end - +start;
    return duration < SIX_MONTHS_IN_MILLISECONDS;
};
