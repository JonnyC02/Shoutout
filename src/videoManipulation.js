async function getVideoFileUrl() {
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
    video.controls = true;
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

async function getDecibelLevels(analyser, audioDataArray) {
    analyser.getByteFrequencyData(audioDataArray);
    let sum = 0;
    for (let i = 0; i < audioDataArray.length; i++) {
      sum += audioDataArray[i];
    }
    const average = sum / audioDataArray.length;
    const decibels = 20 * Math.log10(average / 255);
  
    console.log(`Video Decibel level: ${decibels.toFixed(2)} dB`);
    return decibels;
}

async function manipulationLoop() {
  // video audio pre-processing
  let video =  document.getElementById('videoPlayer');
  var videoAudioCtx = new AudioContext()
  var videoMediasource = videoAudioCtx.createMediaElementSource(video)
  const videoAnalyser = videoAudioCtx.createAnalyser();
  videoMediasource.connect(videoAnalyser);
  videoAnalyser.connect(videoAudioCtx.destination);
  const videoAudioDataArray = new Uint8Array(videoAnalyser.frequencyBinCount);

  // manipulation loop
  while (!video.ended) {
    await new Promise(r => setTimeout(r, 1000));
    await getDecibelLevels(videoAnalyser, videoAudioDataArray);
  }


}



manipulationLoop();