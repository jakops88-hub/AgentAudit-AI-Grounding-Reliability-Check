export interface VerifyRequest {
  text: string;    // The Agent's Answer
  context: string; // The Source Context
  query?: string;  // The User's original query (optional but recommended for context)
}

export interface GroundingResult {
  pass: boolean;
  score: number;
  reason: string;
  unsupported_claims: string[];
}

export interface VerifyResponse {
  success: boolean;
  data: GroundingResult;
}
