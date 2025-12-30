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

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    // Dev: load CRA dev server
    mainWindow.loadURL("http://localhost:3000");
  } else {
    // Prod: load built React app
    mainWindow.loadFile(path.join(__dirname, "build", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/* 🚀 START BACKEND */
function startBackend() {
  if (backendProcess) return;

  backendProcess = spawn("node", ["backend/server.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
  });

  backendProcess.on("exit", (code) => {
    console.log(`Backend process exited with code ${code}`);
    backendProcess = null;
  });
}

/* APP READY */
app.whenReady().then(() => {
  startBackend();
  createWindow();
});

/* QUIT */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  if (backendProcess) backendProcess.kill();
});
