import { existsSync } from "node:fs";
import { dirname, join, parse } from "node:path";

import { config as loadDotenv } from "dotenv";

const findWorkspaceRoot = (startDirectory: string): string => {
  let currentDirectory = startDirectory;
  const fileSystemRoot = parse(startDirectory).root;

  while (currentDirectory !== fileSystemRoot) {
    if (existsSync(join(currentDirectory, "pnpm-workspace.yaml"))) {
      return currentDirectory;
    }

    currentDirectory = dirname(currentDirectory);
  }

  throw new Error("Could not locate the pnpm workspace root.");
};

export const loadRootEnvironment = (): void => {
  const workspaceRoot = findWorkspaceRoot(process.cwd());
  loadDotenv({ path: join(workspaceRoot, ".env"), quiet: true });
};
