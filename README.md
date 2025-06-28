# Discussions Monolith

This project is a discussion web application (inspired by Github Discussions), designed with a clear architecture and modular code organization.
The purpose is to provide a reference implementation for monolithic applications with React and React Router.

## Table of Contents

- [Design Principles](#design-principles)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Patterns and Conventions](#patterns-and-conventions)

## Design Principles

- **Pragmatic organization**: aim for a clean, organized, and maintainable structure, but without falling into abstractions that add excessive complexity.
- **Minimal dependencies**: avoid using libraries when the problem they solve is relatively simple to implement on your own.
- **Framework conformity**: whenever possible, stick closely to the idiomatic approach of the framework and libraries being used.

## Architecture

The project architecture is composed of two main layers: a _domain_ layer, containing all business logic and data access code, and a _presentation_ layer, containing routes, UI and orchestration logic code.

This _domain layer_ is responsible for domain and application logic, and is designed to be agnostic to framework-specific concerns. Ideally, it should be "copy-pasteable" in a way that would work with any JavaScript framework. For the sake of simplicity, there is no strict separation between core logic and infrastructure services.

The _presentation layer_ includes our React components and React Router route modules. It depends on the domain layer to perform business operations and access data. This layer should remain as lean as possible, delegating complex logic to the domain layer whenever appropriate.

## Directory Structure

### The app/config directory

The `config` directory keeps configuration files for the project, including environment variables and library-specific global configurations.

### The app/core directory

The `core` directory hosts the core application logic, where we define domain functions, and integration with third party services.

### The app/web directory

The `web` directory holds the web-related parts of the application, including cookies, middlewares, route modules and UI components.

## Patterns and Conventions

### Sessions and authentication

- The application uses a dedicated [session cookie](https://github.com/okalil/discussions-monolith/blob/main/app/web/session.ts) to store temporary data such as _flash messages_.

- Authentication is handled through a separate cookie, which allows for more control over expiration options. There is a user session persisted in the database, and the authentication cookie stores only the ID of that session.

- An [authentication middleware](https://github.com/okalil/discussions-monolith/blob/main/app/web/auth.ts) reads this cookie, retrieves the session and user data, and exposes them via an async context.

- Access control is performed in the "controllers" (`loader`/`action`), allowing each route to flexibly define whether or not an authenticated user is required.

When an authenticated user is **required**, we use:

```ts
export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = auth().getUserOrFail();
  // User is required here, a redirect will be thrown if the request is not authenticated
};
```

For an **optional** authenticated user, we have:

```ts
export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = auth().getUser();
  // User is nullable here, the loader data will be public but may be slightly different when user is present.
};
```

### Form validation

- To share validation logic between client and server, a utility called [`validator`](https://github.com/okalil/discussions-monolith/blob/main/app/web/validator.ts) is used. It encapsulates a `resolver` (for client-side validation) and a `tryValidate` method (for server-side validation).
- Although the React Router's form API _does not require_ an external library, using `react-hook-form` enhances the user experience by providing real-time validation and automatic focusing on invalid fields.
- The `handleSubmit` function is used to perform validation and apply focus. Once the data is validated, the submission is delegated back to React Router using `useSubmit`. This is important to keep _consistency_ between document/fetch submissions.
- Errors returned by the `action` are automatically synchronized with the form state, allowing `formState.errors` to be used as the _single source of truth_ for form errors.

See a simplified example of a form following this pattern ([or check full code](https://github.com/okalil/discussions-monolith/blob/main/app/web/ui/discussions/new-discussion.route.tsx)):

```tsx
export default function Component({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  const form = useForm({
    resolver: createDiscussionValidator.resolver,
    errors: actionData?.errors,
  });
  const { errors } = form.formState;

  return (
    <Form
      method="POST"
      onSubmit={form.handleSubmit((_, e) => submit(e?.target))}
    >
      {errors.root?.message && <ErrorMessage error={errors.root?.message} />}

      <Field label="Title" error={errors.title?.message}>
        <Input
          {...form.register("title")}
          defaultValue={actionData?.values?.title}
        />
      </Field>
      <Field label="Body" error={errors.body?.message}>
        <Textarea
          {...form.register("body")}
          defaultValue={actionData?.values?.body}
        />
      </Field>
      <Button className="ml-auto" variant="primary">
        Start Discussion
      </Button>
    </Form>
  );
}

export const action = async ({ request }: Route.ActionArgs) => {
  const user = auth().getUserOrFail();
  const body = await bodyParser.parse(request);
  const [errors, input] = await createDiscussionValidator.tryValidate(body);
  if (errors) return data({ errors, values: body }, 422);

  const discussion = await createDiscussion(input.title, input.body, user.id);
  throw redirect(`/discussions/${discussion.id}`);
};

const createDiscussionValidator = validator(
  z.object({
    title: z.string().trim().min(1, "Title is required"),
    body: z.string().trim().min(1, "Body is required"),
  })
);
```

### Pending submit button

- Instead of handling loading state for a submit button every time, we can take advantage of React Router's `useFetchers` and `useNavigation` hooks to access the state of any inflight form submissions.
- Then, we can check whether the button's form's action matches any of them to know if [it should be disabled or showing a spinner](https://github.com/okalil/discussions-monolith/blob/main/app/web/ui/shared/button.tsx).

## Getting Started

### Installation

Install the dependencies:

```bash
pnpm install
```

### Database Setup

Setup the local SQLite database:

```bash
pnpm db:push
```

Run the database seed script:

```bash
pnpm db:seed
```

### Development

Start the development server with HMR:

```bash
pnpm dev
```

Your application will be available at `http://localhost:5173`.

---

Built with ❤️ using React Router.
