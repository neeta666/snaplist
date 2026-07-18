// Gemini AI Provider Adapter — placeholder.
//
// Implements (eventually) the AIProviderInterface shape defined in
// ai.interface.js. No real Gemini SDK call, prompt template, or response
// validation exists yet — that is Slice 3 scope. Kept as a stub now so the
// module boundary (the `listings` service only ever imports *this* file's
// exported shape, never a Gemini SDK directly) is established from the
// start, per ADR 7.

import { AIProviderInterface } from './ai.interface.js';

export const geminiProvider = {
  ...AIProviderInterface,
  // async generateListing(input) {
  //   // Slice 3: call the Gemini SDK, apply the platformStyle prompt
  //   // template, validate the structured JSON response, and return it in
  //   // the GenerateListingOutput shape.
  // },
};
