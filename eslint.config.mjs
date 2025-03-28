import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Warn for unused variables rather than erroring out
      "@typescript-eslint/no-unused-vars": "warn",
      // Enforce using const when variables are not reassigned
      "prefer-const": "error",
      // Disable explicit any errors if needed
      "@typescript-eslint/no-explicit-any": "off",
      // Disable missing dependency warnings for useEffect hooks (review if necessary)
      "react-hooks/exhaustive-deps": "off",
      // Disallow var; use let or const instead
      "no-var": "error"
    },
  },
];
