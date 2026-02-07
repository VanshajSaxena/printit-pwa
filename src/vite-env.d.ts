/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_NETLIFY_CONTEXT:
    | "production"
    | "deploy-preview"
    | "branch-deploy"
    | "dev";
  readonly VITE_COMMIT_REF: string;
  readonly VITE_DEPLOY_PRIME_URL: string;
}
