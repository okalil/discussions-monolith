# Discussions Monolith

This project is a discussion web application (based on Github Discussions), designed with a clear architecture and understandable code organization.
The purpose is to provide a reference implementation for monolithic applications with React and React Router.

## Code Organization

The application code is organized in three main folders:

1. `.server`: This contains "back-end" specific code that doesn't run on the client, like database queries, validators and other services.
2. `resources`: This contains [resources routes](https://reactrouter.com/how-to/resource-routes), following the [flat routes convention](https://reactrouter.com/how-to/file-route-conventions) to automatically map file name to url
3. `ui`: This contains all application UI components organized by feature.

### Why not implement services code directly in router loaders/actions?

Some essential services like auth, database, file storage, mailing and validation are abstracted away from the main application code. This has two main benefits:

1. A service can be reused across various routes;
2. We can easily change the service implementation without changing code in various routes

### Why not use flat routes convention for UI routes too?

The UI routes are implemented with manual configuration for two reasons:

1. Sub components colocation: file system based routing doesn't provide much flexibility for colocating sub components next to the route where it is used;
2. Confusing file name patterns: UI routes may use a lot of special patterns, like optional segments, pathless layouts, layoutless paths etc, translating this to the file system makes the filename complex.

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
