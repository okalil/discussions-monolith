# Discussions Monolith

This project is a discussion web application (based on Github Discussions), designed with a clear architecture and code organization.
The purpose is to provide a reference implementation for monolithic applications with React and React Router.

## Architecture

A arquitetura é baseado em duas camadas principais: uma camada de "domínio" e uma camada de "apresentação"

## Design Principles

- **Organização pragmática**: buscar uma estrutura organizada, limpa e manutenível, mas sem cair em abstrações que aumentam demais a complexidade.
- **Mínimo de dependências**: evitar utilizar bibliotecas quando o problema que elas resolvem é relativamente fácil de implementar por conta própria.
- **Conformidade com o framework**: sempre que possível, seguir ao máximo a abordagem "idiomática" do framework e das bibliotecas utilizadas.

## Directory Structure

### The app/config directory

The `config` directory keeps configuration files for the project, including environment variables and library-specific global configurations.

### The app/core directory

The `core` directory hosts the core application logic, decoupled it from the framework. That's where we define functions for queries and commands, and integration with third party services.

### The app/web directory

The `web` directory holds the web-related parts of the application, including cookies, middlewares, route modules and UI components. We can think of it as both the View and Controller from MVC architecture.

## Patterns and Conventions

### Sessions and authentication

- A aplicação usa um [cookie de sessão](https://github.com/okalil/discussions-monolith/blob/main/app/web/session.ts) dedicado para armazenar dados temporários como _flash messages_.

- A autenticação é feita por meio de um cookie separado, o que permite maior controle sobre opções de expiração. Existe uma sessão de usuário persistida no banco de dados, e o cookie de autenticação armazena apenas o ID dessa sessão.

- Um [middleware de autenticação](https://github.com/okalil/discussions-monolith/blob/main/app/web/auth.ts) lê esse cookie, recupera os dados da sessão e do usuário, e os expõe através de um contexto do React Router.

- O controle de acesso é feito nos "controllers" (`loader`/`action`), permitindo que cada rota defina de forma flexível se exige ou não um usuário autenticado.

Quando um usuário autenticado é **obrigatório**, usaríamos:

```ts
export const loader = async ({ context }: Route.LoaderArgs) => {
  const user = context.get(authContext).getUserOrFail();
  // User is required here, a redirect will be thrown if the request is not authenticated
};
```

Para um usuário autenticado **opcional**, teríamos:

```ts
export const loader = async ({ context }: Route.LoaderArgs) => {
  const user = context.get(authContext).getUser();
  // User is nullable here, the loader data will be public but may show slightly different when user is present.
};
```

### Form validation

- Para compartilhar validação entre cliente e servidor, uma utilidade [`validator`](https://github.com/okalil/discussions-monolith/blob/main/app/web/validator.ts) encapsula um objeto "resolver" (para validação client-side via hook form) e um método "tryValidate" (para validação server-side via route action)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

This template includes three Dockerfiles optimized for different package managers:

- `Dockerfile` - for npm
- `Dockerfile.pnpm` - for pnpm
- `Dockerfile.bun` - for bun

To build and run using Docker:

```bash
# For npm
docker build -t my-app .

# For pnpm
docker build -f Dockerfile.pnpm -t my-app .

# For bun
docker build -f Dockerfile.bun -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

---

Built with ❤️ using React Router.
