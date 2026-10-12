import React, { useEffect, useRef } from 'react';
import { isMuted } from '../sounds';
import './BrandVideoScreen.css';

// The TCS Research intro video, played full screen between the "connecting" loader and
// the game's title screen. Put the file at public/brand/tcs-research.mp4 - until it's
// there (or if it can't play), this screen moves straight on.
const VIDEO_SRC = `${process.env.PUBLIC_URL}/brand/tcs-research.mp4`;

export default function BrandVideoScreen({ onDone }) {
  const videoRef = useRef(null);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current();
  };

  // Start playing with sound (the player has just clicked through the details form,
  // so browsers allow it); if the browser still refuses sound, play it muted instead
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted();
    const attempt = video.play();
    if (attempt && attempt.catch) {
      attempt.catch(() => {
        video.muted = true;
        video.play().catch(finish);
      });
    }
  }, []); // eslint-disable-line

  return (
    <div className="brand-video">
      <video
        ref={videoRef}
        className="brand-video-player"
        src={VIDEO_SRC}
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
        aria-label="TCS Research"
      />
      <button type="button" className="brand-video-skip" onClick={finish} data-sound="none">Skip</button>
    </div>
  );
}
