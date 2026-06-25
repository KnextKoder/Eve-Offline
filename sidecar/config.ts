import fs from "fs/promises";
import path from "path";
import os from "os";

export interface AppConfig {
  modelPath: string | null;
  port: number;
}

const defaultConfig: AppConfig = {
  modelPath: null,
  port: 3799,
};

function getConfigDir(): string {
  const platform = os.platform();
  const home = os.homedir();

  if (platform === "win32") {
    return path.join(process.env.APPDATA ?? home, "eve-offline");
  } else if (platform === "darwin") {
    return path.join(home, "Library", "Application Support", "eve-offline");
  } else {
    return path.join(home, ".config", "eve-offline");
  }
}

export function getConfigPath(): string {
  return path.join(getConfigDir(), "eve.config.json");
}

export async function loadConfig(): Promise<AppConfig> {
  const configPath = getConfigPath();
  try {
    const raw = await fs.readFile(configPath, "utf-8");
    return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {
    // Config doesn't exist yet, return defaults
    return defaultConfig;
  }
}

export async function saveConfig(config: Partial<AppConfig>): Promise<void> {
  const configPath = getConfigPath();
  const configDir = getConfigDir();
  await fs.mkdir(configDir, { recursive: true });
  const existing = await loadConfig();
  await fs.writeFile(configPath, JSON.stringify({ ...existing, ...config }, null, 2));
}