



async function getVideoFileUrl(): Promise<string> {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
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

function setVideoSrc(src: string) {
    const video = document.getElementById('primaryVideo') as HTMLVideoElement;
    video.src = src;
    video.autoplay = true;
    video.controls = false;
}

async function setVideoFile() {
    const videoFileUrl = await getVideoFileUrl();
    setVideoSrc(videoFileUrl);
}