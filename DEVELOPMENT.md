# Development Guide for Wraglet

Welcome to the development guide for Wraglet, a Next.js 13.4 application built with TypeScript and App Router. This guide will help you set up your development environment and provide an overview of the project structure and workflow.

## Prerequisites

Make sure you have the following tools installed on your system:

- [Node.js](https://nodejs.org/) (v14.x or higher)
- [npm](https://www.npmjs.com/)

## Setting Up the Development Environment

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Wraglet/wraglet.git
   cd Wraglet
   ```

2. **Install Dependencies:**

   ```bash
   npm i
   ```

3. **Setup .env file**

   ```js
   # Environment variables declared in this file are automatically made available to Prisma.
   # See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

   # Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
   # See the documentation for all the connection string options: https://pris.ly/d/connection-strings

   DATABASE_URL="your-mongodb-url"

   NEXTAUTH_SECRET="ANYLONGSTRING"
   ABLY_API_KEY=YOURABLYAPIKEY
   ```

4. **Setup Prisma**
   ```shell
   npx prisma db push
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
- **`/next.config.js`**: Next.js configuration file.
- **`/tsconfig.json`**: TypeScript configuration file.

## Development Workflow

1. **Start the Development Server:**

   ```bash
   npm run dev   # If you use npm
   # OR
   yarn dev      # If you use Yarn
   ```

2. **Access the Application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application.

3. **Development Tasks:**
   - Create new components and pages inside the `/src` directory.
   - Implement features, fix bugs, and update styles.
   - Run tests and ensure code quality before submitting contributions.
   - Commit your changes and create pull requests following the contribution guidelines.

## Additional Information

- For more details about Next.js, visit the [Next.js documentation](https://nextjs.org/docs).
- Refer to the `CONTRIBUTING.md` file for guidelines on contributing to this project.

Happy coding! 🚀
