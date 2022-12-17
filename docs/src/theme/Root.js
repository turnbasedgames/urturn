import React, {useEffect} from 'react';
import Tracker from '@openreplay/tracker/cjs';

// Swizzle root component to persist tracker across pages
const tracker = new Tracker({
  projectKey: "g9SNLNQNtzt4vmVLgzTs",
  onStart: ({ sessionID }) => {
    console.log("OpenReplay session started", sessionID)
    if (window.gtag != null) {
      window.gtag('set', {
        'open_replay_session_id': sessionID,
      });
    } else {
      console.warn('was not able to configure session id in gtag!')
    }
  },
});

export default function Root({ children }) {
  useEffect(() => {
    tracker.start();
  }, []);

  return <>{children}</>;
}
