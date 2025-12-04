import { CitationResult } from '../types';

export class CitationService {
  /**
   * Verifies if citations in the answer exist in the context.
   * Supports formats like [1], [Doc 1], (Source A), etc.
   */
  async verifyCitations(answer: string, context: string): Promise<CitationResult> {
    // 1. Extract citations using Regex
    // Matches: [1], [Doc 1], [Source A], (Source 1), [Doc-1], etc.
    // Improved regex to handle hyphens and underscores in IDs
    const citationRegex = /\[(?:Doc\s?|Source\s?)?([a-zA-Z0-9\-_]+)\]|\((?:Source\s?)?([a-zA-Z0-9\-_]+)\)/gi;
    
    const foundCitations = new Set<string>();
    let match;
    
    while ((match = citationRegex.exec(answer)) !== null) {
      // match[1] is for [] style, match[2] is for () style
      const citationId = match[1] || match[2];
      if (citationId) {
        foundCitations.add(citationId);
      }
    }

    if (foundCitations.size === 0) {
      // No citations found to verify. 
      // Depending on business logic, this could be a pass (if citations aren't mandatory) 
      // or a neutral state. For now, we'll consider it a pass with a note, 
      // or simply return perfect score if we only care about *incorrect* citations.
      return {
        pass: true,
        score: 1.0,
        missing_sources: []
      };
    }

    // 2. Verify against context
    // We assume the context might contain markers like [1] or just be the text.
    // If the context is a raw string, checking for the citation ID might be tricky 
    // unless the context string ITSELF contains the markers (e.g. "The sky is blue [1].").
    // We will check if the citation ID appears in the context.
    
    const missingSources: string[] = [];
    
    for (const citation of foundCitations) {
      // Simple check: does the context contain the citation ID?
      // We look for the ID surrounded by typical boundary characters or brackets to avoid partial matches.
      // E.g. searching for "1" shouldn't match "100".
      // We'll look for the exact marker format as well to be safe, or just the ID if the context is unstructured.
      
      // Strategy: Check if the specific ID exists in the context string.
      // We'll try to match the ID loosely in the context.
      const idInContextRegex = new RegExp(`\\[${citation}\\]|\\(${citation}\\)|\\b${citation}\\b`, 'i');
      
      if (!idInContextRegex.test(context)) {
        missingSources.push(citation);
      }
    }

    const pass = missingSources.length === 0;
    // Score is percentage of valid citations
    const score = foundCitations.size > 0 
      ? (foundCitations.size - missingSources.length) / foundCitations.size 
      : 1.0;

    return {
      pass,
      score,
      missing_sources: missingSources
    };
  }
}
