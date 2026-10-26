export const FIELD_FORMATS: Readonly<Record<string, string>> = {
  date: 'a date written YYYY-MM-DD, such as 1990-05-10',
  time: 'a time written HH:MM, such as 14:30',
  'datetime-local': 'a date and time written YYYY-MM-DDTHH:MM, such as 1990-05-10T14:30',
  month: 'a month written YYYY-MM, such as 1990-05',
  week: 'a week written YYYY-Www, such as 1990-W19',
};
