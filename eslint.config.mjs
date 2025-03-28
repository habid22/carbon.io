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
      // Downgrade unused variable errors to warnings.
      "@typescript-eslint/no-unused-vars": "warn",
      // Downgrade prefer-const errors to warnings.
      "prefer-const": "warn",
      // Downgrade usage of var to warnings.
      "no-var": "warn",
      // Allow explicit 'any' (you can tighten this later if desired)
      "@typescript-eslint/no-explicit-any": "off",
      // Disable missing dependency warnings for useEffect hooks
      "react-hooks/exhaustive-deps": "off",
    },
  },
];
