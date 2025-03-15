import type { FileStorage } from "@mjackson/file-storage";

import { LocalFileStorage } from "@mjackson/file-storage/local";

/**
 * Storage handles storing and retrieving files from a storage.
 *
 * It uses the FileStorage interface as its type, which allows the
 * LocalFileStorage implementation to be used for local development and then easily replaced
 * by an S3FileStorage implementation for production.
 */
export const storage: FileStorage = new LocalFileStorage("./uploads");
