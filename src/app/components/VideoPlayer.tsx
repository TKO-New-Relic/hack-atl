import Hls from "hls.js"
import html2canvas from "html2canvas";
import Plyr from "plyr";
import { useEffect, useRef } from "react"

interface VideoPlayerProps {
  src: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const { src } = props
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.controls = true;
    const defaultOptions = {};
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // This will run in safari, where HLS is supported natively
      video.src = src;
    } else if (Hls.isSupported()) {
      // This will run in all other modern browsers

      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
        //Snapshots every half sec
        const intervalId = setInterval(() => {
          takeASnapshot();
        }, 1000)

        return () => clearInterval(intervalId)
      })
    } else {
      console.error(
        'This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API'
      );
    }

  }, [src, videoRef]);


  const takeASnapshot = () => {
    const camPlayer = document.getElementById("cam-stream");
    const canvas = document.createElement('canvas');

    canvas.width = camPlayer?.clientWidth;
    canvas.height = camPlayer?.clientHeight;
    const ctx = canvas.getContext('2d')

    ctx?.drawImage(camPlayer, 0, 0, canvas.width, canvas.height);

    //ACCESS TO JPEG IMAGE
    const jpeg = canvas.toDataURL();

    const prevImg = document.getElementById("snapshot");
    prevImg?.remove();

    const img = new Image();
    img.id = "snapshot"
    img.src = canvas.toDataURL();
    document.body.appendChild(img);

  }

  return (
    <div>
      <video data-displaymaxtap id="cam-stream" ref={videoRef} />
      <style jsx>{`
        video {
          max-width: 100%;
        }
      `}</style>
    </div>
  );
}