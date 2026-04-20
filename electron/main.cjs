const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
  });
  win.webContents.openDevTools();
  
  win.maximize();
  win.removeMenu();
  // win.loadURL("http://localhost:5173");
  win.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(createWindow);