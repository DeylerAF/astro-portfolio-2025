import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginPrettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

// Use TypeScript ESLint configs directly in the config array

export default defineConfig([
  // Global ignores for files that should be excluded from linting
  globalIgnores(["package-lock.json", ".astro/**/*", "**/*.astro"]),
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.jsonc"],
    plugins: { json },
    language: "json/jsonc",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.json5"],
    plugins: { json },
    language: "json/json5",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/gfm",
    extends: ["markdown/recommended"],
  },
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },

  // Prettier configuration - this applies to all supported files
  {
    files: ["**/*.{js,mjs,cjs,ts,astro,json,jsonc,json5,md,css}"],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },

  // The prettier config needs to come last to override other style rules
  prettierConfig,

  // add more generic rule sets here, such as:
  // js.configs.recommended,

  // Override configuration specifically for Astro files
  {
    files: ["**/*.astro"],
    // Enable eslint-plugin-astro
    plugins: {
      astro: eslintPluginAstro,
    },
    // Set parser and parser options
    languageOptions: {
      parser: eslintPluginAstro.parser,
      parserOptions: {
        extraFileExtensions: [".astro"],
        // TypeScript options
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "astro/no-conflict-set-directives": "error",
      "astro/no-unused-define-vars-in-style": "error",
      "astro/valid-compile": "error",
    },
  },

  // Override configuration for Astro TypeScript blocks
  {
    files: ["**/*.astro/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: ".",
      },
    },
  },
]);
