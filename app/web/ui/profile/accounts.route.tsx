import { Form, href } from "react-router";
import { z } from "zod/v4";

import { getProviderAccounts, unlinkProviderAccount } from "~/core/account";
import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { Button } from "~/web/ui/shared/button";
import { validator } from "~/web/validator";

import type { Route } from "./+types/accounts.route";

export const meta = () => [{ title: "Discussions | Connected Accounts" }];

export const loader = async ({ context }: Route.LoaderArgs) => {
  const user = context.get(authContext).getUserOrFail();
  const accounts = await getProviderAccounts(user.id);
  return { accounts };
};

export default function Component({ loaderData }: Route.ComponentProps) {
  const { accounts } = loaderData;
  const linkedProviders = new Set(accounts.map((a) => a.provider));

  return (
    <main className="max-w-lg mx-auto px-3">
      <h1 className="text-xl font-semibold mb-6">Accounts</h1>
      {providers.map((provider) => {
        const isLinked = linkedProviders.has(provider.key);
        return (
          <div
            key={provider.key}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <h3 className="font-medium">{provider.name}</h3>
              <p className="text-sm text-gray-600">{provider.description}</p>
            </div>
            {isLinked ? (
              <Form method="POST" navigate={false}>
                <input type="hidden" name="provider" value={provider.key} />
                <Button variant="danger" className="w-28">
                  Disconnect
                </Button>
              </Form>
            ) : (
              <Form
                method="POST"
                action={href("/auth/social/:provider", {
                  provider: provider.key,
                })}
              >
                <Button variant="primary" className="w-28">
                  Connect
                </Button>
              </Form>
            )}
          </div>
        );
      })}
    </main>
  );
}

export const action = async ({ request, context }: Route.ActionArgs) => {
  const user = context.get(authContext).getUserOrFail();
  const body = await bodyParser.parse(request);
  const input = await unlinkAccountValidator.validate(body);

  await unlinkProviderAccount(user.id, input.provider);
  return { ok: true };
};

const unlinkAccountValidator = validator(
  z.object({
    provider: z.string(),
  })
);

const providers = [
  {
    key: "github",
    name: "GitHub",
    description: "Connect your GitHub account",
  },
  // Add more providers here as they become available
] as const;
