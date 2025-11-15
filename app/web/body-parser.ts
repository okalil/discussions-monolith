/**
 * Body Parser is meant to translate the raw request body into a simple JS object
 * that can be more easily used and validated.
 */
class BodyParser {
  async parse(request: Request) {
    const formData = await request.formData();
    return this.parseForm(formData);
  }

  // Example with @remix-run/form-data-parser
  // async parse(
  //   request: Request,
  //   fileUploads?: Record<string, FileUploadHandler>,
  //   multipartParserOptions?: MultipartParserOptions
  // ) {
  //   const formData = await parseFormData(
  //     request,
  //     multipartParserOptions ?? {},
  //     (fileUpload) => {
  //       if (!fileUpload.fieldName || !fileUpload.name) return;
  //       const handler = fileUploads?.[fileUpload.fieldName];
  //       return handler?.(fileUpload);
  //     }
  //   );
  //   return this.parseForm(formData);
  // }

  parseForm(form: FormData | URLSearchParams) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const object: Record<string, any> = {};
    form.forEach((value, key) => {
      const parts = key.split(/[.[\]]+/).filter(Boolean);
      let current = object;

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const nextPart = parts[index + 1];
        const isNextArray = !isLast && !isNaN(Number(nextPart));

        if (isLast) {
          current[part] = value;
        } else {
          if (isNextArray) {
            if (!Array.isArray(current[part])) {
              current[part] = [];
            }
            current = current[part];
          } else {
            if (
              !(typeof current[part] === "object" && current[part] !== null)
            ) {
              current[part] = {};
            }
            current = current[part];
          }
        }
      });
    });
    return object;
  }
}

export const bodyParser = new BodyParser();
