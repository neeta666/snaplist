// Storage Provider Adapter — interface contract.
//
// Documents the shape every image-storage provider adapter (Cloudinary now,
// per ADR 8) is expected to implement. As with the AI interface, this is
// documentation of the intended contract, not an enforcement mechanism —
// plain JavaScript has no compiler to check that a concrete provider (e.g.
// `cloudinary.provider.js`) actually matches this shape. The placeholder
// methods below only throw if this reference object is called directly by
// mistake; they do not validate any concrete provider's implementation.

/**
 * @typedef {Object} UploadImageOutput
 * @property {string} url
 * @property {string} publicId
 */

export const StorageProviderInterface = {
  /**
   * @param {Buffer|string} fileData
   * @returns {Promise<UploadImageOutput>}
   */
  async uploadImage(_fileData) {
    throw new Error('StorageProviderInterface.uploadImage is not implemented — use a concrete provider (e.g. cloudinary.provider.js).');
  },

  /**
   * @param {string} publicId
   * @returns {Promise<void>}
   */
  async deleteImage(_publicId) {
    throw new Error('StorageProviderInterface.deleteImage is not implemented — use a concrete provider (e.g. cloudinary.provider.js).');
  },
};
