const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const webDir = path.join(rootDir, "web");
const envExamplePath = path.join(webDir, ".env.example");
const envLocalPath = path.join(webDir, ".env.local");

function log(message = "") {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function ensureNodeVersion() {
  const [major] = process.versions.node.split(".").map(Number);
  if (major < 20) {
    fail(
      `Beacon setup requires Node.js 20 or newer. Detected ${process.versions.node}.`
    );
  }
}

function runNpmInstall() {
  log("Installing web dependencies...");

  const result = spawnSync("npm", ["install"], {
    cwd: webDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    fail("npm install failed inside web/. Please fix that first and rerun npm run setup.");
  }
}

function ensureEnvTemplate() {
  if (!fs.existsSync(envExamplePath)) {
    fail("Missing web/.env.example. Restore that file and rerun npm run setup.");
  }

  if (fs.existsSync(envLocalPath)) {
    log("Keeping existing web/.env.local");
    return;
  }

  fs.copyFileSync(envExamplePath, envLocalPath);
  log("Created web/.env.local from web/.env.example");
}

function printNextSteps() {
  log();
  log("Beacon setup is ready.");
  log();
  log("Next steps:");
  log("1. Fill in web/.env.local with your Supabase URL, service role key, and Telegram bot token.");
  log("2. Run web/supabase/schema.sql in your Supabase SQL editor.");
  log("3. Start the app with npm run dev");
  log();
  log("Optional:");
  log("4. Set NEXT_PUBLIC_BEACON_PUBLIC_DEMO=true in web/.env.local if you want the read-only public demo dashboard mode.");
}

ensureNodeVersion();
runNpmInstall();
ensureEnvTemplate();
printNextSteps();
