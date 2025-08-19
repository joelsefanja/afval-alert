import { Injectable } from '@angular/core';
import { GeminiPromptsConfig, FallbackResponses } from '../../interfaces/gemini-response.interface';

@Injectable({
  providedIn: 'root'
})
export class GeminiConfigService {
  
  private readonly promptsConfig: GeminiPromptsConfig = {
    image_analysis: {
      system_role: "Je bent een expert in zwerfafval herkenning voor Nederlandse gemeenten.",
      task_description: `Analyseer de afbeelding en bepaal:
1. Is dit zwerfafval? (true/false)
2. Wat voor type afval is het? Geef een lijst van mogelijke afvaltypes met bijbehorende zekerheid (0.0 - 1.0).
3. Welke kenmerken zie je?
4. Geef een vriendelijke bedankboodschap aan de melder.`,
      output_format: `Geef je antwoord ALLEEN in geldig JSON-formaat met exact deze structuur:
{
  "is_afval": true,
  "afval_types": [
    {
      "afval_type": "plastic_flessen",
      "zekerheid": 0.85
    },
    {
      "afval_type": "plastic_zakken", 
      "zekerheid": 0.60
    }
  ],
  "kenmerken": ["transparant", "plastic", "fles vorm"],
  "bedank_boodschap": "Bedankt voor je melding van plastic afval!"
}`,
      constraints: `Zorg dat je JSON correct is geformuleerd en valide is.
Gebruik alleen de beschikbare afvaltype categorieën.
Geef geen extra tekst of uitleg, alleen de JSON.`
    },
    
    text_validation: {
      system_role: "Je bent een expert validator voor zwerfafval classificatie van Nederlandse gemeenten.",
      task_description: `Een lokaal AI model heeft de volgende classificatie gedaan:
- Beschrijving: {local_description}
- Top voorspellingen: {local_predictions}

Jouw taak is om deze resultaten te valideren en verbeteren:
1. Zijn deze resultaten logisch en consistent?
2. Welke afvaltype(s) zijn het meest waarschijnlijk?
3. Geef een vriendelijke gemeente boodschap aan de melder`,
      output_format: `Geef ALLEEN geldig JSON terug met deze structuur:
{
  "is_afval": true,
  "afval_types": [
    {
      "afval_type": "plastic_flessen",
      "zekerheid": 0.85
    }
  ],
  "kenmerken": ["gevalideerd door AI", "gemeente classificatie"],
  "bedank_boodschap": "Bedankt! Onze AI heeft je melding geverifieerd."
}`,
      constraints: `Gebruik alleen beschikbare afvaltype categorieën uit onze configuratie.
Geef geen extra tekst, alleen de JSON.`
    }
  };

  private readonly fallbackResponses: FallbackResponses = {
    no_response: {
      is_afval: false,
      afval_types: [],
      kenmerken: ["analyse_gefaald"],
      bedank_boodschap: "Sorry, kon geen analyse uitvoeren."
    },
    
    error: {
      is_afval: false,
      afval_types: [],
      kenmerken: ["fout_opgetreden"],
      bedank_boodschap: "Sorry, er is een fout opgetreden bij de analyse."
    },
    
    validation_fallback: {
      is_afval: true,
      afval_types: [{
        afval_type: "niet_classificeerbaar",
        zekerheid: 0.5
      }],
      kenmerken: ["lokaal model validatie"],
      bedank_boodschap: "Bedankt voor je melding - we hebben het gevalideerd."
    }
  };

  // Nederlandse afvaltype categorieën
  private readonly afvalTypeCategorieën = [
    'plastic_flessen',
    'plastic_zakken', 
    'blikjes',
    'glas',
    'papier',
    'karton',
    'sigarettenpeuken',
    'voedselresten',
    'hondenpoop',
    'elektronisch_afval',
    'textiel',
    'metaal',
    'batterijen',
    'chemisch_afval',
    'gemengd_afval',
    'niet_classificeerbaar'
  ];

  getImageAnalysisPrompt(): string {
    const config = this.promptsConfig.image_analysis;
    
    return `${config.system_role}

${config.task_description}

${config.output_format}

${config.constraints}

Beschikbare afvaltype categorieën:
${this.afvalTypeCategorieën.join(', ')}`;
  }

  getTextValidationPrompt(localDescription: string, localPredictions: string): string {
    const config = this.promptsConfig.text_validation;
    
    return config.task_description
      .replace('{local_description}', localDescription)
      .replace('{local_predictions}', localPredictions) + 
      `\n\n${config.output_format}\n\n${config.constraints}\n\nBeschikbare afvaltype categorieën:\n${this.afvalTypeCategorieën.join(', ')}`;
  }

  getFallbackResponse(type: keyof FallbackResponses) {
    return this.fallbackResponses[type];
  }

  getAvailableAfvalTypes(): string[] {
    return [...this.afvalTypeCategorieën];
  }
}