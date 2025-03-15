# Discussions Monolith

This project is a discussion web application (based on Github Discussions), designed with a clear architecture and code organization.
The purpose is to provide a reference implementation for monolithic applications with React and React Router.

## Directory Structure

### The app/core directory

The `core` directory hosts the core application logic, decoupling it from the framework. That's where we define functions for queries and commands, and integration with third party services. What this directory won't include is code related to the presentation layer (like React and React Router stuff).

### The app/web directory

The `web` directory holds the web-related parts of the application, including cookies, middlewares, route modules and UI components. We can think of it as both the View and Controller from MVC architecture.

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
