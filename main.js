var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var ipc=require('node-ipc');

const ipcMain = require('electron').ipcMain;

ipcMain.on('sendInvite', function(event, arg) {
  console.log('sendInvite args: ', arg);
  ipc.server.emit(ipc.server.current_socket, arg);
});


// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

app.dock.hide();

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

  /***************************************\
   *
   * You should start both hello and world
   * then you will see them communicating.
   *
   * *************************************/

  ipc.config.id   = 'test';
  ipc.config.retry= 1500;
  ipc.config.rawBuffer=true;
  ipc.config.encoding='ascii';

  ipc.serve(
      function(){
          ipc.server.on(
              'connect',
              function(socket){
                  ipc.server.current_socket = socket;
                  ipc.server.emit(
                      socket,
                      'hello'
                  );
              }
          );

          ipc.server.on(
              'data',
              function(data,socket){
                  ipc.log('got a message'.debug, data,data.toString());
                  // Create the browser window.
                  mainWindow = new BrowserWindow({
                    width: 800,
                    height: 600,
                    title: 'Wallpaper'
                  });

                  // and load the index.html of the app.
                  mainWindow.loadUrl('file://' + __dirname + '/index.html');

                  // Open the DevTools.
                  mainWindow.webContents.openDevTools();

                  // Emitted when the window is closed.
                  mainWindow.on('closed', function() {
                    // Dereference the window object, usually you would store windows
                    // in an array if your app supports multi windows, this is the time
                    // when you should delete the corresponding element.
                    mainWindow = null;
                  });
                  ipc.server.emit(
                      socket,
                      'goodbye'
                  );
              }
          );
      }
  );

  ipc.server.start();
});
