const { app, BrowserWindow, Menu } = require('electron');

let mainWindow = null;

app.on('ready', () => {
    // create a main window in our application
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 685,
        resizable: false
    });
    mainWindow.loadURL(`file://${__dirname}/index.html`);
});

const isMac = process.platform === 'darwin';
const menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Video',
                submenu: [
                    {
                        label: 'Load...',
                        accelerator: 'CmdorCtrl+L'
                    }
                ]
            },
            { type: 'separator' },
            isMac ? { role: 'close' } : { role: 'quit' }
        ]
    },
    {
        label: 'Developer',
        submenu: [
            { role: 'toggleDevTools' }
        ]
    }
];

// add empty menu-item if running on mac
if(isMac) {
    menuTemplate.unshift({label: 'empty'});
}

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);