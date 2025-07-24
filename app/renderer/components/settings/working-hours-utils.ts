export const getTimeFromMinutes = (minutes: number) => {
  const date = new Date();
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date;
};

export const minutesToSeconds = (minutes: number): number => {
  return minutes * 60;
};

export const secondsToMinutes = (seconds: number): number => {
  return Math.floor(seconds / 60);
};

export const getMinutesFromTime = (date: Date) => {
  return date.getHours() * 60 + date.getMinutes();
};
