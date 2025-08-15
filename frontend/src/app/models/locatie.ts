/**
 * Model voor locatie informatie.
 * 
 * @interface Locatie
 * @description Bevat geografische coördinaten en optionele adresinformatie
 */
export interface Locatie {
    latitude: number;
    longitude: number;
    adres?: string;
}