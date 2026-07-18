// Cloudinary Storage Provider Adapter — placeholder.
//
// Implements (eventually) the StorageProviderInterface shape defined in
// storage.interface.js. No real Cloudinary SDK call exists yet — that is
// Slice 2 scope. Kept as a stub now so the `listings` service only ever
// depends on this file's exported shape, never the Cloudinary SDK directly,
// per ADR 8.

import { StorageProviderInterface } from './storage.interface.js';

export const cloudinaryProvider = {
  ...StorageProviderInterface,
  // async uploadImage(fileData) {
  //   // Slice 2: upload to Cloudinary, validate type/size beforehand at the
  //   // validation layer, return { url, publicId }.
  // },
  // async deleteImage(publicId) {
  //   // Slice 5: delete the asset on listing delete; failures are logged,
  //   // not blocking, per the API Contract.
  // },
};
