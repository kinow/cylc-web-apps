const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

let window = null

app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.on('login', function(event, webContents, request, authInfo, callback) {
  // This is where browsers pop up a username and password dialog.
  event.preventDefault();
  // TODO: DIGEST AUTHENTICATION IN ELECTRON APPS.
  // App main process console is the parent terminal.
  console.log("AUTHENTICATION NOT SUPPORTED:" + request.url);
});

app.once('ready', () => {
  window = new BrowserWindow({
    width: 700,
    height: 800,
    titleBarStyle: 'hidden-inset',
    backgroundColor: "#fff",
    // Don't show the window until it's ready (prevents flickering).
    show: false,
    // Icon not working (reason unknown).
    // icon: '/home/vagrant/electron/assets/icons/png/64x64.png'
  })

  window.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  window.once('ready-to-show', () => {
    window.show()
  })
})
