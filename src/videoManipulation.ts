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
        video.controls = false;
    }
}

async function setVideoFile(): Promise<void> {
    const videoFileUrl = await getVideoFileUrl();
    setVideoSrc(videoFileUrl);
}

async function setVideoFileFromUrl(): Promise<void> {
    const youtubeRegex = /youtube.com/g
    const shortRegex = /youtu.be/g
    const videoUrlInput = document.getElementById('videoUrl') as HTMLInputElement;
    if (videoUrlInput) {
        const videoUrl = videoUrlInput.value;
        const isYouTube = youtubeRegex.test(videoUrl) || shortRegex.test(videoUrl);
        if (isYouTube) {
            alert("Please use a URL ending with a file extension (not YouTube)");
        } else if (videoUrl) {
            setVideoSrc(videoUrl);
        } else {
            alert("Please enter a valid video URL");
        }
    }
}

async function getDecibelLevels(analyser: AnalyserNode, audioDataArray: Uint8Array, isMic?: boolean): Promise<number> {
    analyser.getByteFrequencyData(audioDataArray);
    let sum = 0;
    for (let i = 0; i < audioDataArray.length; i++) {
        sum += audioDataArray[i];
    }
    const average = sum / audioDataArray.length;
    const decibels = 20 * Math.log10(average / 255);
    if (isMic) {
        const span = document.getElementById("micInput")
        if (span) {
            let displayValue = dBToVolume(decibels) * 100;
            displayValue *= fakeMic(displayValue);
            if (displayValue === Infinity) {
                displayValue = 0;
            }
            span.textContent = `Microphone volume: ${displayValue.toFixed(2)}%`
            span.style.color = getGradientColor(displayValue);
            setShakeIntensity(displayValue);
        }
    }
    console.log(isMic ? `Mic Decibel level: ${decibels.toFixed(2)} dB` : `Video Decibel level: ${decibels.toFixed(2)}`);
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
        let videoDb = await getDecibelLevels(videoAnalyser, videoAudioDataArray);
        let microphoneDb = await getDecibelLevels(microphoneAnalyser, microphoneAudioDataArray, true) / 2;
        if (videoDb === -Infinity) {
            console.log("Video will not keep playing");
            if (videoDb > microphoneDb) {
                video.playbackRate = 0;
                console.log("Video audio is louder than microphone audio");
            } else if (videoDb < microphoneDb) {
                video.playbackRate = 1;
                console.log("Microphone audio is louder than video audio");
            }
        } else {
            if ((videoDb * 1.1) > microphoneDb) {
                video.playbackRate = 0;
                console.log("Video audio is louder than microphone audio");
            } else if ((videoDb * 1.1) < microphoneDb) {
                video.playbackRate = 1;
                console.log("Microphone audio is louder than video audio");
            }
        }
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

function dBToVolume(dB: number): number {
    return Math.pow(10, dB / 20);
}

function getGradientColor(value: number): string {
    value = Math.min(Math.max(value, 0), 100);

    let r, g, b;

    if (value <= 50) {
        // Green to Yellow
        r = Math.floor((value / 50) * 255);
        g = 255;
        b = 0;
    } else {
        // Yellow to Red
        r = 255;
        g = Math.floor(255 - ((value - 50) / 50) * 255);
        b = 0;
    }

    return `rgb(${r}, ${g}, ${b})`;
}

function setShakeIntensity(value: number): void {
    value = Math.min(Math.max(value, 0), 100);
    const intensity = value / 10;
    const keyframes = [
        { transform: `translate(${intensity}px, ${intensity}px) rotate(0deg)` },
        { transform: `translate(-${intensity}px, -${intensity}px) rotate(-${intensity / 2}deg)` },
        { transform: `translate(-${intensity * 2}px, 0px) rotate(${intensity / 2}deg)` },
        { transform: `translate(${intensity * 2}px, ${intensity}px) rotate(0deg)` },
        { transform: `translate(${intensity}px, -${intensity}px) rotate(${intensity / 2}deg)` },
        { transform: `translate(-${intensity}px, ${intensity}px) rotate(-${intensity / 2}deg)` },
        { transform: `translate(-${intensity * 2}px, ${intensity}px) rotate(0deg)` },
        { transform: `translate(${intensity * 2}px, ${intensity}px) rotate(-${intensity / 2}deg)` },
        { transform: `translate(-${intensity}px, -${intensity}px) rotate(${intensity / 2}deg)` },
        { transform: `translate(${intensity}px, ${intensity}px) rotate(0deg)` },
        { transform: `translate(${intensity}px, -${intensity}px) rotate(-${intensity / 2}deg)` }
    ];

    document.getElementById('micInput')?.animate(keyframes, {
        duration: 500,
        iterations: Infinity,
        easing: 'ease-in-out'
    });
}

function clearVideo() {
    const videoPlayer = document.getElementById("videoPlayer") as HTMLVideoElement | null;
    if (videoPlayer) {
        videoPlayer.src = "your_video_source.mp4";
    }
}

function fakeMic(x: number): number {
    x = Math.min(Math.max(x, 0), 100)/100;
    let multiplicationFactor = 5; // The higher the number, the easier it is to reach the maximum volume.
    return multiplicationFactor*Math.abs(Math.log10(Math.pow((-x + 1.2), (x-1.2)))*(Math.pow(x,2))*(x-4)) + 1
}


manipulationLoop();
