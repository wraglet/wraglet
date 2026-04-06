# Development Guide for Wraglet

Welcome to the development guide for Wraglet, a **Next.js 16** application built with TypeScript and App Router. This guide will help you set up your development environment and provide an overview of the project structure and workflow.

## Prerequisites

Make sure you have the following tools installed on your system:

- [Node.js](https://nodejs.org/) (current LTS recommended)
- [Yarn](https://yarnpkg.com/) (see `package.json` `packageManager` for the expected version)

## Setting Up the Development Environment

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Wraglet/wraglet.git
   cd Wraglet
   ```

2. **Install Dependencies:**

   ```bash
   yarn install
   ```

3. **Setup .env file**

   ```js
   MONGODB_URI = 'your-mongodb-url'

   AUTH_SECRET = 'any-long-string'
   ABLY_API_KEY = 'your-ably-api-key'

   # AWS
   AWS_ACCESS_KEY_ID_PROD='your-aws-key-id'
   AWS_SECRET_ACCESS_KEY_PROD='your-aws-secret-access-key'
   AWS_REGION_PROD='select-aws-region'
   AWS_S3_BUCKET='name-of-your-aws-s3-bucket'
   ```

## Project Structure

- **`/src`**: Contains the source code of the Next.js application.
  - **`/app`**: Next.js pages and routes using App Router.
    - **`/components`**: React components used across the application.
    - **`/api`**: Next.js API routes.
    - **`/utils`**: Utility functions and helper scripts.
    - **`/types`**: TypeScript type declarations.
    - **`/interfaces`**: TypeScript interface declarations.
- **`/public`**: Static assets like images, fonts, and other files.
- **`/node_modules`**: Node.js modules and dependencies.
- **`/next.config.ts`**: Next.js configuration file.
- **`/tsconfig.json`**: TypeScript configuration file.

## Development Workflow

1. **Start the Development Server:**

   ```bash
   yarn dev
   ```

2. **Access the Application:**
   Open your browser and navigate to [http://localhost:5000](http://localhost:5000) to view the application.

3. **Development Tasks:**
   - Create new components and pages inside the `/src` directory.
   - Implement features, fix bugs, and update styles.
   - Run tests and ensure code quality before submitting contributions.
   - Commit your changes and create pull requests following the contribution guidelines.

## Formatting

- **`yarn format`** — run Prettier with the repo `.prettierrc` (writes changes).
- **`yarn format:check`** — same as above but fails if anything would change (CI-friendly).

Ignored paths are listed in `.prettierignore` (for example `.next`, `node_modules`, coverage).

## Automated testing

The full testing stack, layout, mocking, Playwright/E2E env (including seeding), and TDD workflow are documented in **[docs/TESTING.md](docs/TESTING.md)**.

Common commands:

- **`yarn test`** — Vitest (once)
- **`yarn test:watch`** — Vitest watch mode
- **`yarn test:func`** — Playwright (starts dev server per config; optional `E2E_TEST_USER_PASSWORD` for authenticated specs — see `docs/TESTING.md` and `.env.example`)

## Quality checks and Git hooks

After **`yarn install`**, Husky wires Git to run:

- **`pre-commit`** — `yarn format:check`, `yarn lint`, `yarn test` (Vitest), **`yarn test:func`** (Playwright), and `yarn build`. All must pass or the commit is aborted.
- **`commit-msg`** — [Conventional Commits](https://www.conventionalcommits.org/) via Commitlint (for example `feat:`, `fix:`, `chore:`).

One-liner to match CI/hooks locally:

```bash
yarn validate
```

Playwright needs browsers once per machine: **`yarn test:e2e:install`**.

To skip hooks when absolutely necessary (use sparingly): **`git commit --no-verify`** or set **`HUSKY=0`**.

## Additional Information

- For more details about Next.js, visit the [Next.js documentation](https://nextjs.org/docs).
- Refer to the `CONTRIBUTING.md` file for guidelines on contributing to this project.

Happy coding! 🚀
