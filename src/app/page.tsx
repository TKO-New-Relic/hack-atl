"use client"
import { VideoPlayer } from "./components/VideoPlayer";
import { features } from "./mock/GDOT_Live_Traffic_Cameras.json";


export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <VideoPlayer src="http://vss1live.dot.ga.gov:80/lo/atl-cam-914.stream/playlist.m3u8" />
    </main>
  );
}
