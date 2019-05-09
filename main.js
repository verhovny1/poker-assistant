// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const { ipcMain } = require('electron')
const { session } = require('electron')

 
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let modalWindow
global.bitmap = null

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 300,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  })

  modalWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  //var theUrl = 'file://' + __dirname + '/modal.html'
  //modalWindow.loadURL( theUrl )
  modalWindow.loadFile('modal.html')

 

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    
    mainWindow = null
  })

  // Emitted when the window is closed.
  modalWindow.on('closed', (event) =>   {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    
    if (app.quit) 
    {
      modalWindow = null
    } else {
      event.preventDefault()
      modalWindow.hide()
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => 
{ 
	createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

 
 
	 



ipcMain.on('modalWindow', (event, arg) => {
  if( arg == "show") modalWindow.show();
  else if( arg == "hide") modalWindow.hide();

  console.log("modal window comand: " + arg); 
})

ipcMain.on('modalWindowSendBitmap', (event, arg) => {
  global.bitmap = arg;
  modalWindow.webContents.send('bitmap', arg);
  console.log(arg.bitmap[0]);console.log(arg.bitmap[1]);
})


ipcMain.on('mainWindow', (event, arg) => {
  if( arg == "startWork") {}
  else if( arg == "stopWork") {}
  else if ( arg == "exit") app.quit();

  console.log("main window comand: " + arg); 
})



ipcMain.on('asynchronous-message', (event, arg) => {
  if ( event == "showModal"    ) modalWindow.show();
  //if ( arg == "hideModal" && modalWindow.visible == true  ) modalWindow.hide();
	//console.log(event); // prints "ping"
	//console.log(arg); // prints "ping"
  //event.sender.send('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
	console.log(arg) // prints "ping"
 	event.returnValue = global.bitmap
})



//Глобальні змінні
global.sharedObj = {prop1: null};
ipcMain.on('show-prop1', function(event) {
  console.log(global.sharedObj.prop1);
});