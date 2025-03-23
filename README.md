# React Project Template

A pre-configured React project template using Tanstack React Router, Tailwind CSS, and Vite for rapid project setup.

## Features

- ⚡ **Vite** - Fast development server and optimized build tool
- 🧭 **Tanstack React Router** - Type-safe routing for React applications
- 💅 **Tailwind CSS** - Utility-first CSS framework
- 🔧 **Zero configuration** - Start coding immediately

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/react-template.git my-new-project
   cd my-new-project
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Change Git Repository Origin

To use this template for your own project, you'll need to update the Git remote origin:

1. Check your current remote:

   ```bash
   git remote -v
   ```

2. Remove the existing origin:

   ```bash
   git remote remove origin
   ```

3. Add your new remote repository:

   ```bash
   git remote add origin https://github.com/your-username/your-new-repo.git
   ```

4. Push to your new repository:
   ```bash
   git push -u origin main
   # or
   git push -u origin master
   ```

## Project Structure

```
react-template/
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── routes/
│       ├── __root.tsx
│       ├── index.tsx
│   ├── main.tsx
│   └── index.css
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Customization

### Tailwind CSS

Customize your Tailwind configuration in `tailwind.config.js`. See the [Tailwind documentation](https://tailwindcss.com/docs) for more details.

### Tanstack React Router

Router configuration is located in the `src/routes` directory. See the [Tanstack Router documentation](https://tanstack.com/router/latest/docs/overview) for more information.

## License

MIT
