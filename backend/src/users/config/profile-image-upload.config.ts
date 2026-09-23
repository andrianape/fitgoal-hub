import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { diskStorage } from 'multer';

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const profileImageUploadOptions = {
  storage: diskStorage({
    destination: './uploads/profile-images',

    filename: (
      request: Express.Request,
      file: Express.Multer.File,
      callback: (
        error: Error | null,
        filename: string,
      ) => void,
    ): void => {
      const extension = extname(
        file.originalname,
      ).toLowerCase();

      const filename =
        `${randomUUID()}${extension}`;

      callback(null, filename);
    },
  }),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (
    request: Express.Request,
    file: Express.Multer.File,
    callback: (
      error: Error | null,
      acceptFile: boolean,
    ) => void,
  ): void => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new BadRequestException(
          'Dozvoljene su samo JPG, PNG i WEBP fotografije.',
        ),
        false,
      );

      return;
    }

    callback(null, true);
  },
};