import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Notification,
  session,
} from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  DEFAULT_RESTS,
  DEFAULT_TOTAL_LOOPS,
  DEFAULT_TOMATOES,
  GET_VALUE,
  SAVE_VALUE,
  NOTIFICATION,
  NOTIFICATION_TITLE,
  ADD_LOCAL_MUISC,
} from "./constants";
import { StorageValue } from "../types/type";

const URL = "http://localhost/pomodoro";
const NAME = "pomodoro";
const EXPIRE_TIME = 365 * 24 * 3600 * 1000;

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

function init() {
  setCookie({
    tomatoes: DEFAULT_TOMATOES,
    rests: DEFAULT_RESTS,
    totalLoops: DEFAULT_TOTAL_LOOPS,
  });
}

function setCookie(obj: StorageValue) {
  session.defaultSession.cookies
    .set({
      url: URL,
      name: NAME,
      expirationDate: EXPIRE_TIME + Date.now(),
      value: JSON.stringify(obj),
    })
    .then(() => {
      console.log("cookies are settled");
    });
}

function getCookie() {
  return session.defaultSession.cookies.get({ url: URL,name:NAME }).then((cookie) => {
    return cookie;
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.on("before-quit", (_event) => {
  console.log("before-quit");
});

app.whenReady().then(() => {
  createWindow();
  getCookie().then((res) => {
    if (res.length == 0) {
      init();
    }
  });
  ipcMain.on(SAVE_VALUE, (_event, cookie) => {
    setCookie(cookie);
  });
  ipcMain.handle(GET_VALUE, async () => {
    let cookie = await getCookie();
    if (cookie.length == 0) {
      init();
      cookie = await getCookie();
    }
    return cookie;
  });
  ipcMain.on(NOTIFICATION, (_e, message) => {
    new Notification({ title: NOTIFICATION_TITLE, body: message }).show();
  });
  ipcMain.handle(ADD_LOCAL_MUISC, async () => {
    let file = await dialog.showOpenDialog({});
    console.log(file);
  });
});
