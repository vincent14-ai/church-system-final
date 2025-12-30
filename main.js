const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let backendProcess;

/* 🔒 SINGLE INSTANCE LOCK */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

/* 🪟 CREATE WINDOW */
function createWindow() {
  if (mainWindow) return;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "build", "index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/* 🚀 APP READY */
app.whenReady().then(() => {
  // Start backend ONLY ONCE
  backendProcess = spawn(process.execPath, ["backend/server.js"], {
    stdio: "inherit"
  });

  createWindow();
});

/* ❌ QUIT */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  if (backendProcess) backendProcess.kill();
});