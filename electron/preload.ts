/**
 * Safe IPC bridge. Renderer never gets Node fs — only these methods.
 */
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("arcadeAgent", {
  fs: {
    writeFile: (path: string, content: string) =>
      ipcRenderer.invoke("fs:writeFile", path, content) as Promise<void>,
    readFile: (path: string) =>
      ipcRenderer.invoke("fs:readFile", path) as Promise<string>,
    listFiles: (directory: string) =>
      ipcRenderer.invoke("fs:listFiles", directory) as Promise<string[]>,
  },
});
