class BodyParser {
  async parse(request: Request) {
    const searchParams = new URL(request.url).searchParams;
    const formData = await request.formData();
    return { ...this.parseForm(searchParams), ...this.parseForm(formData) };
  }

  parseForm(form: FormData | URLSearchParams) {
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
