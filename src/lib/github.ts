import { App } from "octokit";

// GitHub App configuration
const appId = process.env.GITHUB_APP_ID || "";
const privateKey = process.env.GITHUB_PRIVATE_KEY || "";

export const githubApp = new App({
  appId: appId,
  privateKey: privateKey,
});

export async function getInstallationOctokit(installationId: number) {
  return await githubApp.getInstallationOctokit(installationId);
}
