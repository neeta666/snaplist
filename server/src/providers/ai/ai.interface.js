// AI Provider Adapter — interface contract.
//
// This file documents the shape every AI provider adapter (Gemini now,
// potentially others later per ADR 7) is expected to implement. Plain
// JavaScript has no `interface` keyword and no compiler to check conformance,
// so this is documentation of the intended contract, not an enforcement
// mechanism — nothing here prevents a concrete provider file from omitting a
// method or returning a different shape. The placeholder methods below throw
// only if this reference object itself is called directly (e.g. by mistake,
// instead of a real provider); they do not validate or enforce that
// `gemini.provider.js` or any other concrete adapter actually implements
// this shape correctly. That kind of check would need to be done explicitly
// (e.g. shared tests, or validating each provider's output against a schema)
// if it's ever wanted — nothing like that exists yet.
//
// The `listings` service (Slice 3+) will depend only on this shape, never on
// a specific provider's SDK, so swapping providers later means writing a new
// file intended to satisfy this same contract.

/**
 * @typedef {Object} GenerateListingInput
 * @property {string} imageUrl
 * @property {string} [condition]
 * @property {string} [brand]
 * @property {string} [age]
 * @property {number} [originalPrice]
 * @property {'general'|'olx'|'facebook'} platformStyle
 */

/**
 * @typedef {Object} GenerateListingOutput
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string[]} highlights
 * @property {{min: number, max: number, currency: 'INR'}} estimatedPriceRange
 */

export const AIProviderInterface = {
  /**
   * @param {GenerateListingInput} input
   * @returns {Promise<GenerateListingOutput>}
   */
  async generateListing(_input) {
    throw new Error('AIProviderInterface.generateListing is not implemented — use a concrete provider (e.g. gemini.provider.js).');
  },
};
