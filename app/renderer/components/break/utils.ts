export function formatTimeSinceLastBreak(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""} since last break`;
  } else if (minutes > 0) {
    return `${minutes}m since last break`;
  } else {
    return "Less than 1m since last break";
  }
}

export function createRgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function createDarkerRgba(hex: string, a: number) {
  const r = Math.floor(parseInt(hex.slice(1, 3), 16) * 0.3);
  const g = Math.floor(parseInt(hex.slice(3, 5), 16) * 0.3);
  const b = Math.floor(parseInt(hex.slice(5, 7), 16) * 0.3);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}
