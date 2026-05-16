import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/graphql",
  documents: "src/**/*.{ts,tsx,graphql,gql}",
  generates: {
    "src/gql/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
        fragmentMasking: { unmaskFunctionName: "getFragmentData" },
      },
      config: {
        scalars: {
          DateTime: "string",
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
