var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var applescript = require('applescript');
var tmp = require('temporary');

// Helper function to download picture from url and set it as wallpaper
exports.setWallpaper = function(url) {
  var dir = new tmp.Dir();
  var path = dir.path + '/wallpaper.pic';
  // Applescript to download the wallpaper to a temp file and set it as
  // wallpaper
  var script =
    'do shell script "curl -L ' + url + ' -o ' + path + '"\n' +
    'tell application "System Events"\n' +
    '  tell current desktop\n' +
    '    set picture to "' + path + '"\n' +
    '  end tell\n' +
    'end tell\n';
  applescript.execString(script, function(err, rtn) {
    if (err) {
      // Something went wrong!
      console.log("Something went wrong");
    }
  });

}

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Wallpaper'
  });

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
  // mainWindow.loadUrl('https://mail.google.com/');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
