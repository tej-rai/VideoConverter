window.electronapi.onFilePathRetrieved(filePath => {
    console.log(`Filepath: ${filePath}`);
    videoPlayer = document.getElementById("fileVideo");
    videoPlayer.pause();
    videoPlayer.src = ('file://' + filePath);
    videoPlayer.load();
    console.log('File loaded succesfully');
});