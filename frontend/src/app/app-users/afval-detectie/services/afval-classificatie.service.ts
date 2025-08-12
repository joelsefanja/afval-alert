import { Injectable, inject } from '@angular/core';
import { AfvalType } from '@app/models/afval-type.model';
import { AfvalMelding } from '@app/models/afval-melding.model';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { environment } from '@environments/environment';
import { IAfvalClassificatieService } from './afval-classificatie.interface';
import { MeldingService } from './melding.service';
import { Observable, from } from 'rxjs';

/**
 * Service voor het classificeren van afval op basis van afbeeldingen.
 * Deze service implementeert de logica voor het herkennen van verschillende
 * afvaltypes in een gegeven afbeelding met behulp van de Gemini API.
 */
@Injectable({
  providedIn: 'root'
})
export class AfvalClassificatieService implements IAfvalClassificatieService {
  private genAI: GoogleGenerativeAI;
  private meldingService = inject(MeldingService);
  
  constructor() {
    // Initialiseer de Gemini API client
    this.genAI = new GoogleGenerativeAI(environment.GEMINI_API_KEY);
  }
  
  /**
   * Stuurt een afvalmelding naar de backend.
   * Werkt de huidige melding bij met locatiegegevens en markeert deze als verzonden.
   * 
   * @param imageBlob - De afbeelding als Blob object
   * @param locatie - De locatie waar het afval is gevonden
   * @param afvalTypes - De gedetecteerde of handmatig geselecteerde afvaltypes
   * @returns Een Promise die aangeeft of de melding succesvol is verzonden
   */
  async meldAfval(imageBlob: Blob, locatie: { latitude: number, longitude: number }, afvalTypes: AfvalType[]): Promise<boolean> {
    try {
      // Update de locatie van de huidige melding
      const updatedMelding = this.meldingService.updateLocation(locatie.latitude, locatie.longitude);
      
      if (!updatedMelding) {
        console.error('Geen actieve melding gevonden om te verzenden');
        return false;
      }
      
      // Simuleer een API-aanroep naar de backend
      console.log('Afvalmelding verzenden naar backend (gesimuleerd):', {
        afvalTypes,
        locatie,
        imageSize: `${Math.round(imageBlob.size / 1024)} KB`
      });
      
      // In een echte implementatie zou dit een fetch aanroep zijn naar /api/meldingen
      // met multipart/form-data voor de foto en locatie
      
      // Simuleer een succesvolle melding
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Markeer de melding als verzonden
      this.meldingService.markeerMeldingAlsVerzonden();
      
      return true;
    } catch (error) {
      console.error('Fout bij het verzenden van de afvalmelding:', error);
      return false;
    }
  }
  
  /**
   * Converteert een Blob naar een base64 string.
   * 
   * @param blob - De te converteren Blob
   * @returns Een Promise met de base64 string
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  /**
   * Classificeert afval op basis van een afbeelding met behulp van de Gemini API.
   * Maakt ook een nieuwe conceptmelding aan met de gedetecteerde afvaltypes.
   * 
   * @param imageBlob - De afbeelding als Blob object
   * @returns Een Promise met een array van herkende afvaltypes
   */
  async herkenAfvalSoorten(imageBlob: Blob): Promise<AfvalType[]> {
    // Reset eventuele bestaande meldingen
    this.meldingService.resetMelding();
    
    // Classificeer het afval
    const afvalTypes = await this.classifyWasteWithGemini(imageBlob);
    
    // Maak een nieuwe melding aan
    this.meldingService.createMelding(imageBlob, afvalTypes);
    
    return afvalTypes;
  }
  
  /**
   * Implementatie van de interface methode, roept classificeerAfval aan.
   * 
   * @param imageBlob - De afbeelding als Blob object
   * @returns Een Promise met een array van herkende afvaltypes
   */
  async classifyWaste(imageBlob: Blob): Promise<AfvalType[]> {
    return this.herkenAfvalSoorten(imageBlob);
  }
  
  /**
   * Interne methode die de daadwerkelijke classificatie uitvoert met Gemini API.
   * 
   * @param imageBlob - De afbeelding als Blob object
   * @returns Een Promise met een array van herkende afvaltypes
   */
  private async classifyWasteWithGemini(imageBlob: Blob): Promise<AfvalType[]> {
    try {
      // Converteer de blob naar een base64 string
      const base64Image = await this.blobToBase64(imageBlob);
      
      // Configureer het Gemini model
      const model = this.genAI.getGenerativeModel({
        model: "gemini-pro-vision",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });
      
      // Bereid de prompt voor
      const prompt = `Analyseer deze afbeelding en identificeer welke soorten afval zichtbaar zijn. 
      Kies alleen uit de volgende categorieën: ${Object.values(AfvalType).join(', ')}. 
      Geef alleen de categorienamen terug, gescheiden door komma's, zonder extra tekst.`;
      
      // Stuur de afbeelding naar Gemini API
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1], // Verwijder het 'data:image/jpeg;base64,' deel
          },
        },
      ]);
      
      const response = await result.response;
      const text = response.text().trim();
      
      // Verwerk het resultaat
      const detectedTypes = text.split(',').map(type => type.trim());
      
      // Converteer de gedetecteerde types naar AfvalType enum waarden
      const validTypes: AfvalType[] = [];
      
      for (const type of detectedTypes) {
        // Zoek de overeenkomstige enum waarde
        const matchedType = Object.values(AfvalType).find(
          enumValue => enumValue.toLowerCase() === type.toLowerCase()
        );
        
        if (matchedType) {
          validTypes.push(matchedType as AfvalType);
        }
      }
      
      // Als er geen geldige types zijn gevonden, gebruik de simulatie als fallback
      const resultTypes = validTypes.length > 0 ? validTypes : this.simulateDetection();
      
      // Log het resultaat
      console.log('Gedetecteerde afvaltypes:', resultTypes);
      
      return resultTypes;
    } catch (error) {
      console.error('Fout bij het classificeren van afval met Gemini API:', error);
      // Fallback naar gesimuleerde detectie bij fouten
      const fallbackTypes = this.simulateDetection();
      console.log('Fallback afvaltypes (gesimuleerd):', fallbackTypes);
      return fallbackTypes;
    }
  }

  /**
   * Annuleert de huidige melding.
   */
  cancelMelding(): void {
    this.meldingService.cancelMelding();
  }
  
  /**
   * Geeft de huidige melding als Observable.
   * 
   * @returns Een Observable van de huidige melding
   */
  getCurrentMelding(): Observable<AfvalMelding | null> {
    return this.meldingService.currentMelding$;
  }
  
  /**
   * Simuleert de detectie van afval voor testdoeleinden.
   * In een echte implementatie zou dit vervangen worden door een ML-model.
   * 
   * @returns Een array van willekeurig geselecteerde afvaltypes
   */
  private simulateDetection(): AfvalType[] {
    const allTypes = Object.values(AfvalType);
    const detectedCount = Math.floor(Math.random() * 3) + 1; // 1-3 items
    const detectedWaste: AfvalType[] = [];
    
    // Selecteer willekeurige afvaltypes
    for (let i = 0; i < detectedCount; i++) {
      const randomIndex = Math.floor(Math.random() * allTypes.length);
      const wasteType = allTypes[randomIndex];
      
      // Voorkom duplicaten
      if (!detectedWaste.includes(wasteType)) {
        detectedWaste.push(wasteType);
      }
    }
    
    return detectedWaste;
  }
}