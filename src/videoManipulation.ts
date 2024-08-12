async function getVideoFileUrl(): Promise<string> {
    try {
        const [fileHandle] = await (window as any).showOpenFilePicker({
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

function setVideoSrc(src: string): void {
    const video = document.getElementById('videoPlayer') as HTMLVideoElement;
    if (video) {
        video.src = src;
        video.autoplay = true;
        video.controls = true;
    }
}

async function setVideoFile(): Promise<void> {
    const videoFileUrl = await getVideoFileUrl();
    setVideoSrc(videoFileUrl);
}

async function setVideoFileFromUrl(): Promise<void> {
    const videoUrlInput = document.getElementById('videoUrl') as HTMLInputElement;
    if (videoUrlInput) {
        const videoUrl = videoUrlInput.value;
        if (videoUrl) {
            setVideoSrc(videoUrl);
        } else {
            alert("Please enter a valid video URL");
        }
    }
}

async function getDecibelLevels(analyser: AnalyserNode, audioDataArray: Uint8Array): Promise<number> {
    analyser.getByteFrequencyData(audioDataArray);
    let sum = 0;
    for (let i = 0; i < audioDataArray.length; i++) {
        sum += audioDataArray[i];
    }
    const average = sum / audioDataArray.length;
    const decibels = 20 * Math.log10(average / 255);

    console.log(`Decibel level: ${decibels.toFixed(2)} dB`);
    return decibels;
}

async function manipulationLoop(): Promise<void> {
    // video audio pre-processing
    const video = document.getElementById('videoPlayer') as HTMLVideoElement;
    if (!video) return;

    const videoAudioCtx = new AudioContext();
    const videoMediasource = videoAudioCtx.createMediaElementSource(video);
    const videoAnalyser = videoAudioCtx.createAnalyser();
    videoMediasource.connect(videoAnalyser);
    videoAnalyser.connect(videoAudioCtx.destination);
    const videoAudioDataArray = new Uint8Array(videoAnalyser.frequencyBinCount);

    // microphone audio pre-processing
    const microphoneStream = await getMicrophone();
    if (!microphoneStream) return;

    const microphoneAudioCtx = new AudioContext();
    const microphoneMediasource = microphoneAudioCtx.createMediaStreamSource(microphoneStream);
    const microphoneAnalyser = microphoneAudioCtx.createAnalyser();
    microphoneMediasource.connect(microphoneAnalyser);
    const microphoneAudioDataArray = new Uint8Array(microphoneAnalyser.frequencyBinCount);

    // manipulation loop
    while (!video.ended) {
        await new Promise(r => setTimeout(r, 100));
        await getDecibelLevels(videoAnalyser, videoAudioDataArray);
        await getDecibelLevels(microphoneAnalyser, microphoneAudioDataArray);
    }
}

async function getMicrophone(): Promise<MediaStream | null> {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        return stream;
    } catch (err) {
        console.error('Error accessing microphone:', err);
        return null;
    }
}

manipulationLoop();
