import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

/**
 * Vite plugin that generates a version.json file during build.
 * Uses git commit hash (or timestamp fallback) as version identifier.
 */
export function vitePluginVersion(): Plugin {
  return {
    name: "vite-plugin-version",
    closeBundle() {
      let version: string;

      try {
        // Retrieve git commit hash
        version = execSync("git rev-parse --short HEAD").toString().trim();
      } catch {
        // Fallback to timestamp if git is not available
        version = Date.now().toString();
      }

      const versionData = {
        version,
        timestamp: new Date().toISOString(),
      };

      // Write to dist/version.json
      const outDir = path.resolve(process.cwd(), "dist");
      const versionFile = path.join(outDir, "version.json");

      fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

      console.log(`✓ Generated version.json: ${version}`);
    },
  };
}
