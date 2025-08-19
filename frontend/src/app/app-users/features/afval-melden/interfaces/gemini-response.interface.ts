export interface AfvalTypeDetectie {
  afval_type: string;
  zekerheid: number;
}

export interface GeminiAfvalAnalyseResponse {
  is_afval: boolean;
  afval_types: AfvalTypeDetectie[];
  kenmerken: string[];
  bedank_boodschap: string;
}

export interface GeminiPromptConfig {
  system_role: string;
  task_description: string;
  output_format: string;
  constraints: string;
}

export interface GeminiPromptsConfig {
  image_analysis: GeminiPromptConfig;
  text_validation: GeminiPromptConfig;
}

export interface FallbackResponse {
  is_afval: boolean;
  afval_types: AfvalTypeDetectie[];
  kenmerken: string[];
  bedank_boodschap: string;
}

export interface FallbackResponses {
  no_response: FallbackResponse;
  error: FallbackResponse;
  validation_fallback: FallbackResponse;
}