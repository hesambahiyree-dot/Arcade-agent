/**
 * Electron main process. Opens ArcadeAgent in a 1400×900 window.
 * Dev: loads the Vite preview. Production: loads the built web bundle.
 */
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_DIR = path.join(app.getPath("userData"), "project");

async function ensureProjectDir(): Promise<void> {
  await fs.mkdir(PROJECT_DIR, { recursive: true });
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#0b0c0e",
    title: "ArcadeAgent",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const devUrl = process.env.ELECTRON_START_URL || process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    void win.loadURL(devUrl);
  } else {
    const index = path.join(__dirname, "..", "dist", "client", "index.html");
    void win.loadFile(index);
  }
}

app.whenReady().then(async () => {
  await ensureProjectDir();

  ipcMain.handle("fs:writeFile", async (_event, filePath: string, content: string) => {
    const target = path.join(PROJECT_DIR, filePath);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content, "utf8");
  });

  ipcMain.handle("fs:readFile", async (_event, filePath: string) => {
    const target = path.join(PROJECT_DIR, filePath);
    return fs.readFile(target, "utf8");
  });

  ipcMain.handle("fs:listFiles", async (_event, directory: string) => {
    const target = path.join(PROJECT_DIR, directory || ".");
    const entries: string[] = [];
    async function walk(dir: string, prefix: string) {
      const items = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
      for (const item of items) {
        const rel = prefix ? `${prefix}/${item.name}` : item.name;
        if (item.isDirectory()) await walk(path.join(dir, item.name), rel);
        else entries.push(rel);
      }
    }
    await walk(target, directory === "." ? "" : directory);
    return entries;
  });

  ipcMain.handle("dialog:error", async (_event, message: string) => {
    await dialog.showErrorBox("ArcadeAgent", message);
  });

  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
