import type {
  FileStorage,
  ListOptions,
  ListResult,
  FileKey,
} from "@mjackson/file-storage";

export type StorageClient = FileStorage;

export function createStorageClient(r2: R2Bucket): StorageClient {
  const storage = new R2FileStorage(r2);
  return storage;
}

class R2FileStorage implements FileStorage {
  constructor(protected r2: R2Bucket) {}

  async has(key: string) {
    const object = await this.r2.get(key);
    return object !== null;
  }

  async set(key: string, file: File) {
    await this.put(key, file);
  }

  async put(key: string, file: File) {
    const customMetadata = {
      name: file.name,
      type: file.type,
    };

    const body = await file.arrayBuffer();

    await this.r2.put(key, body, {
      httpMetadata: { contentType: file.type },
      customMetadata,
    });

    return file;
  }

  async get(key: string) {
    const object = await this.r2.get(key);
    if (!object) return null;

    const buffer = await object.arrayBuffer();

    const metadata = object.customMetadata;

    return new File([buffer], metadata?.name ?? key, {
      type: object.httpMetadata?.contentType ?? metadata?.type,
      lastModified: object.uploaded.getTime(),
    });
  }

  async remove(key: string) {
    await this.r2.delete(key);
  }

  async list<T extends ListOptions>(options?: T): Promise<ListResult<T>> {
    const result = await this.r2.list({
      cursor: options?.cursor,
      limit: options?.limit,
      prefix: options?.prefix,
    });

    return {
      files: result.objects.map((object) => {
        const metadata = object.customMetadata;

        if (options?.includeMetadata === true) {
          return {
            key: object.key,
            lastModified: object.uploaded.getTime(),
            size: object.size,
            name: metadata?.name ?? object.key,
            type: object.httpMetadata?.contentType ?? metadata?.type,
          };
        }

        return { key: object.key } satisfies FileKey;
      }) as ListResult<T>["files"],
      cursor: result.truncated ? result.cursor : undefined,
    };
  }
}
