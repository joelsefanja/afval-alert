import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combineert en optimaliseert CSS klassen met clsx en tailwind-merge
 * @param inputs CSS klassen om te combineren
 * @returns Geoptimaliseerde CSS klassen string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}