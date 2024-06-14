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
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        video.play();
        let snap = takeASnapshot();
      })
    } else {
      console.error(
        'This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API'
      );
    }

  }, [src, videoRef]);


  const takeASnapshot = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')
    if (!videoRef.current) return null;
    html2canvas(videoRef.current).then(canvas => {
      const img = new Image();
      img.src = canvas.toDataURL();
      document.body.appendChild(img);
    });
  }


  return (
    <div>
      <video data-displaymaxtap ref={videoRef} />
      <style jsx>{`
        video {
          max-width: 100%;
        }
      `}</style>
    </div>
  );
}