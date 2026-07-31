// Storage Provider Adapter — interface contract.
//
// Documents the shape every image-storage provider adapter is expected to
// implement. This is documentation of the intended contract rather than an
// enforcement mechanism because the project uses plain JavaScript.
//
// The placeholder methods below only throw if this reference object is called
// directly by mistake. Concrete providers implement the same method shape.

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
    throw new Error(
      'StorageProviderInterface.uploadImage is not implemented — use a concrete storage provider.',
    );
  },

  /**
   * @param {string} publicId
   * @returns {Promise<void>}
   */
  async deleteImage(_publicId) {
    throw new Error(
      'StorageProviderInterface.deleteImage is not implemented — use a concrete storage provider.',
    );
  },
};