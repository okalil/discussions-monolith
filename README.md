# Discussions Monolith

This project is a discussion web application (inspired by Github Discussions), designed with a clear architecture and modular code organization.
The purpose is to provide a reference implementation for monolithic applications with React and React Router.

## Table of Contents

- [Design Principles](#design-principles)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Patterns and Conventions](#patterns-and-conventions)
- [Running](#running)

## Design Principles

- **Pragmatic organization**: aim for a clean, organized, and maintainable structure, but without falling into abstractions that add excessive complexity.
- **Minimal dependencies**: avoid using libraries when the problem they solve is relatively simple to implement on your own.
- **Framework conformity**: whenever possible, stick closely to the idiomatic approach of the framework and libraries being used.

## Architecture

The project architecture is composed of two main layers: a _core_ layer, containing all business logic and data handling code, and a _presentation_ layer, containing routes, UI and orchestration logic code.

This _core layer_ is responsible for domain and application logic, and is designed to be agnostic to framework-specific concerns. Ideally, it should be "copy-pasteable" in a way that would work with any JavaScript framework.

The _presentation layer_ includes our React components and React Router route modules. It depends on the domain layer to perform business operations and access data. This layer should remain as lean as possible, delegating complex logic to the domain layer whenever appropriate.

## Directory Structure

### The app/core directory

The `core` directory hosts the core application logic, where we define domain functions, and integration with third party services.

### The app/web directory

The `web` directory holds the web-related parts of the application, including cookies, request middlewares, route modules and UI components.

## Patterns and Conventions

### Sessions and authentication

- The application uses a dedicated [session cookie](https://github.com/okalil/discussions-monolith/blob/main/app/web/session.ts) to store temporary data such as _flash messages_.

- Authentication is handled through a separate cookie, which allows for more control over expiration options. There is a user session persisted in the database, and the authentication cookie stores only the ID of that session.

- An [authentication middleware](https://github.com/okalil/discussions-monolith/blob/main/app/web/auth.ts) reads this cookie, retrieves the session and user data, and exposes them via an async context.

- Access control is performed in the "controllers" (`loader`/`action`), allowing each route to flexibly define whether or not an authenticated user is required.

When an authenticated user is **required**:

```ts
export async function loader(_: Route.LoaderArgs) {
  const user = auth().getUserOrFail();
  // User is required here, a redirect will be thrown if the request is not authenticated
}
```

For an **optional** authenticated user:

```ts
export async function loader(_: Route.LoaderArgs) {
  const user = auth().getUser();
  // User is nullable here, the loader data will be public but can be slightly different when user is present.
}
```

### Form validation

- Although the React Router's form API _does not require_ an external library, using `react-hook-form` enhances the user experience by providing **real-time validation** and **automatic focusing on invalid fields**.
- A utility called [`validator`](https://github.com/okalil/discussions-monolith/blob/main/app/web/validator.ts) is used to share validation logic between client and server. It encapsulates a `resolver` (for client-side validation) and a `tryValidate` method (for server-side validation).
- The `handleSubmit` function is used to perform validation and apply focus. Once the data is validated, the submission is delegated back to React Router using `useSubmit`. This is important to keep **consistency** between document/fetch submissions.
- Errors returned by the `action` are automatically synchronized with the form state, allowing `formState.errors` to be used as the **single source of truth** for form errors.

See a simplified example of a form following this pattern ([or check full code](https://github.com/okalil/discussions-monolith/blob/main/app/web/discussions/new-discussion.route.tsx)):

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
      <Button variant="primary">Start Discussion</Button>
    </Form>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const user = auth().getUserOrFail();
  const body = await bodyParser.parse(request);
  const [errors, input] = await createDiscussionValidator.tryValidate(body);
  if (errors) return data({ errors, values: body }, 422);

  const discussion = await discussionService().createDiscussion(
    input.title,
    input.body,
    user.id
  );
  throw redirect(`/discussions/${discussion.id}`);
}

const createDiscussionValidator = validator(
  z.object({
    title: z.string().trim().min(1, "Title is required"),
    body: z.string().trim().min(1, "Body is required"),
  })
);
```

### Pending submit button

- Instead of handling loading state for a submit button every time, we can take advantage of React Router's `useFetchers` and `useNavigation` hooks to access the state of any inflight form submissions.
- Then, we can check whether the button's form's action matches any of them to know if [it should be disabled or showing a spinner](https://github.com/okalil/discussions-monolith/blob/main/app/web/shared/button.tsx).

### Fullstack Component Pattern

- A "fullstack component" is a single component file that colocates UI, server-side logic and data handling for a specific feature or route.
- **These components always use `useFetcher` because they are implemented as React Router resource routes (not UI routes).** This allows them to be embedded in other UI and invoked programmatically, rather than being tied to navigation.
- Typical structure includes:

  - UI component (React function)
  - Route loader and/or action (for data fetching and mutations)
  - Validation schema (using the shared validator utility)

- Data mutation example: `web/discussion/edit-comment.route.tsx`

  ```tsx
  export function EditComment({ comment, onCancel }) {
    const fetcher = useFetcher();
    return (
      <fetcher.Form
        method="POST"
        action={href("/comments/:id/edit", { id: comment.id })}
      >
        {/* ...fields... */}
      </fetcher.Form>
    );
  }

  export async function action({ request, params }) {
    const user = auth().getUserOrFail();
    const body = await bodyParser.parse(request);
    const [error, input] = await updateCommentValidator.tryValidate(body);
    if (error) return data({ error, body }, 422);

    await commentService().updateComment(+params.id, input.body, user.id);
    return { ok: true };
  }

  const updateCommentValidator = validator(
    z.object({ body: z.string().trim().min(1) })
  );
  ```

- Data fetching example: `web/discussions/discussion-hovercard.route.tsx`

  ```tsx
  export async function loader({ params }) {
    const discussion = await discussionService().getDiscussionWithReply(
      +params.id
    );
    return { discussion };
  }

  export function DiscussionHoverCard({ discussionId, children }) {
    const fetcher = useFetcher();
    const discussion = fetcher.data?.discussion;
    const onOpen = () => {
      if (!discussion && fetcher.state === "idle") {
        fetcher.load(`/discussions/${discussionId}/hovercard`);
      }
    };
    return (
      <HoverCard.Root openDelay={500} onOpenChange={onOpen}>
        <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
        {/* ...hovercard content... */}
      </HoverCard.Root>
    );
  }
  ```

## Running

### Environment variables

Create a `.env` file following `.env.example`

### Project dependencies

Install the dependencies:

```bash
pnpm install
```

### Database Setup

Apply migrations to the database:

```bash
pnpm db:migrate
```

### Development

Start the development server with HMR:

```bash
pnpm dev
```

Your application will be available at `http://localhost:5173`.

---

Built with ❤️ using React Router.
