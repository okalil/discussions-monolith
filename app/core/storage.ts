import type { FileStorage } from "@mjackson/file-storage";

import { LocalFileStorage } from "@mjackson/file-storage/local";

export const storage: FileStorage = new LocalFileStorage("./uploads");
