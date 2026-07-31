import ImageKit, { toFile } from '@imagekit/nodejs';
import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { StorageProviderInterface } from './storage.interface.js';

const imagekit = new ImageKit({
  privateKey: env.imagekit.privateKey,
});

export const imagekitProvider = {
  ...StorageProviderInterface,

  async uploadImage(fileData) {
    const fileName = `${randomUUID()}.jpg`;

    const result = await imagekit.files.upload({
      file: await toFile(fileData, fileName),
      fileName,
      folder: '/snaplist',
      useUniqueFileName: false,
    });

    return {
      url: result.url,
      publicId: result.fileId,
    };
  },

  async deleteImage(publicId) {
    await imagekit.files.delete(publicId);
  },
};