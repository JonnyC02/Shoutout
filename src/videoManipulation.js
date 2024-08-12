async function getVideoFileUrl(){
    try {
      const [fileHandle] = await showOpenFilePicker({
        types: [{
          description: 'Video Files',
          accept: {
            'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
          }
        }],
        multiple: false
      });
  
      const file = await fileHandle.getFile();
  
      return URL.createObjectURL(file);
  
    } catch (err) {
      console.error('File selection was canceled or an error occurred:', err);
      return "";
    }
}

function setVideoSrc(src) {
    const video = document.getElementById('videoPlayer');
    video.src = src;
    video.autoplay = true;
    video.controls = false;
}

async function setVideoFile() {
    const videoFileUrl = await getVideoFileUrl();
    setVideoSrc(videoFileUrl);
}

async function setVideoFileFromUrl() {
        const videoUrl = document.getElementById('videoUrl').value;
        if (videoUrl) {
          setVideoSrc(videoUrl);
        } else {
          alert("Please enter a valid video URL");
        }
}