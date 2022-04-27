const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmegStatic = require('ffmpeg-static-electron');
const ffmegProbe = require('ffprobe-static-electron');
const ProgressBar = require('electron-progressbar');


ffmpeg.setFfmpegPath(ffmegStatic.path);
ffmpeg.setFfprobePath(ffmegProbe.path);


let mainWindow = null;
let pathFile = null;
let progressBar = null;

// load and launch mainWindow
app.on('ready', () => {
    // create a main window in our application
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 685,
        resizable: false,
        webPreferences: {
            preload: `${__dirname}/preload.js`,
            contextIsolation: true
        },
    });
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
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
                        accelerator: 'CmdorCtrl+L',
                        click() {
                            dialog.showOpenDialog(mainWindow,
                                {
                                    properties: ['openFile'],
                                    filters: [
                                        { name: 'Movies', extensions: ['mkv', 'avi', 'mp4', 'mpg', 'mpeg', 'wmv', 'mov', 'rm', 'ram', 'webm', 'flv', 'swf'] }
                                    ]   
                                }
                            ).then((res) => {
                                if(!res.cancelled) {
                                    pathFile = res.filePaths[0];
                                    mainWindow.webContents.send('FilePathRetrieved', pathFile);
                                    EnableConvert('convertapi');
                                    EnableConvert('convertmp4');
                                    EnableConvert('convertwebm');

                                  }
                            }).catch(err => {
                                console.log(err);
                            });
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Convert to AVI...',
                        id: 'convertapi',
                        click() {
                            saveFile('avi')
                            .then((res) => {
                                if(!res.canceled) {
                                    progressBarInitiate();
                                    convertFile(pathFile,res.filePath,'avi');
                                }
                            })

                        },
                        enabled: false
                    },
                    {
                        label: 'Convert to MP4...',
                        id: 'convertmp4',
                        click() {
                            saveFile('mp4')
                            .then((res) => {
                                if(!res.canceled) {
                                    progressBarInitiate();
                                    convertFile(pathFile,res.filePath,'mp4');
                                }
                            })
                        },
                        enabled: false
                    },
                    {
                        label: 'Convert to WEBM...',
                        id: 'convertwebm',
                        click() {
                            saveFile('webm')
                            .then((res) => {
                                if(!res.canceled) {
                                    progressBarInitiate();
                                    convertFile(pathFile,res.filePath,'webm');
                                }
                            })
                            .catch((err) => console.log(err));

                        },
                        enabled: false

                    },
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

function EnableConvert(id) {
    Menu.getApplicationMenu().getMenuItemById(id).enabled = true;
}

function saveFile(extension) {
    return dialog.showSaveDialog(mainWindow, 
        {
            properties: ['openFile'],
            filters: [
                { name: 'Movies', extensions: [extension] }
            ]
        });
}

function progressBarInitiate() {
    progressBar = new ProgressBar({
        text: 'Preparing data...',
        indeterminate: false,
        detail: 'Wait...'
    });
    progressBar
    .on('completed', function() {
      console.info(`completed...`);
      progressBar.detail = 'Task completed. Exiting...';
    })
    .on('aborted', function(value) {
      console.info(`aborted... ${value}`);
    })
    .on('progress', function(value) {
      progressBar.detail = ` ${value}% / ${progressBar.getOptions().maxValue}%`;
    });
    
}

function convertFile(currfilePath, saveFilePath, extension) {

    ffmpeg(currfilePath)
    .withOutputFormat(extension)
    .on('progress', function(progress) {
        console.log(progress);
        if(!progressBar.isCompleted()){
            progressBar.value = Math.ceil(progress.percent);
        }
    })
    .on("end", function (stdout, stderr) {
        console.log("Finished");
    })
    .on("error", function (err) {
        console.log("an error happened: " + err.message);
    })
    .saveToFile(saveFilePath);

}