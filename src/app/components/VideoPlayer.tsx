import Hls from "hls.js"
import { useEffect, useRef, useState } from "react"

const SUPER_SECRET_KEY = "cf27382c4e2ff6ccedd5bc80f585618bee074a7b";

interface VideoPlayerProps {
  src: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const { src } = props
  const videoRef = useRef<HTMLVideoElement>(null)
  //Jpeg snapshot source
  const [imageSrc, updateImgSrc] = useState("");

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
        //Snapshots every second
        const intervalId = setInterval(() => {
          let jpegSrc = takeASnapshot();
          //Update state
          updateImgSrc(jpegSrc);

          let body = new FormData();
          body.append("upload", jpegSrc);
          body.append("regions", "us-ca");
          body.append("mmc", "true");


          fetch("https://api.platerecognizer.com/v1/plate-reader/", {
            method: "POST",
            headers: {
              Authorization: "Token " + SUPER_SECRET_KEY
            },
            body: body
          })
            .then(res => res.json())
            .then(json => console.log(json))
        }, 1500) 

        return () => clearInterval(intervalId)
      })
    } else {
      console.error(
        'This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API'
      );
    }
  }, [src, videoRef]);

  const takeASnapshot: () => string = () => {
    const camPlayer = document.getElementById("cam-stream");
    const canvas = document.createElement('canvas');

    canvas.width = camPlayer?.clientWidth;
    canvas.height = camPlayer?.clientHeight;
    const ctx = canvas.getContext('2d')

    ctx?.drawImage(camPlayer, 0, 0, canvas.width, canvas.height);

    //ACCESS TO JPEG IMAGE
    const jpeg = canvas.toDataURL();

    return jpeg;
  }

  return (
    <div>
      <video data-displaymaxtap id="cam-stream" ref={videoRef} />
      <style jsx>{`
        video {
          max-width: 100%;
        }
      `}</style>
      <img src={imageSrc} alt="screenshot" id="snapshot" />
    </div>
  );
}
