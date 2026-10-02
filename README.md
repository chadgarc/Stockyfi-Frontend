# React + TypeScript + Vite + Tailwindcss + Daisy UI

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules, in addition it includes tailwindcss, and daisy ui.

## React Compiler

The React Compiler is enabled on this template. Also after using `pnpm build` or `npm run build` everything will be compiled at ./docs, files will use relative path.
Easier for github pages deploy

## How to use it

### Method 1

1. `git clone https://github.com/chadgarc/react-ts-tailwind-daisyui-starter.git`
2. Change project's folder name and `cd` into that folder
4. Delete .git/ folder using `rm -rf .git/`
5. Use `pnpm install` or `npm install`
6. Initialize repo with `git init`
7. Use `git add .`
8. Use `git commit -m 'Initial commit`
9. Add it to your remote repo:
```bash
git remote add origin <your-repo>
git branch -M main
git push -u origin main
```

### Method 2 (easier and no .git)

Type:

```bash
npx degit chadgarc/react-ts-tailwind-daisyui-starter <new-project-name>
```
Then to install node_modules you can use:
```bash
pnpm install
```
Or:
```bash
npm install
```

Then, inside your project:
```bash
git init
git add .
git commit -m 'Initial commit'
git remote add origin <your-repo>
git branch -M main
git push -u origin main
```
