import React, { useEffect } from 'react';
import Tracker from '@openreplay/tracker/cjs';
import { v4 as uuidv4 } from 'uuid';

// Swizzle root component to persist tracker across pages
const tracker = new Tracker({
  projectKey: "g9SNLNQNtzt4vmVLgzTs",
  onStart: ({ sessionID }) => {
    // create randomly generated uuid and store in local storage
    let ephemeralUserId = localStorage.getItem('ephemeralUserId');
    if (ephemeralUserId == null) {
      ephemeralUserId = uuidv4();
      localStorage.setItem('ephemeralUserId', ephemeralUserId);
    }

    tracker.setMetadata('sessionID', sessionID)
    tracker.setUserAnonymousID(ephemeralUserId);

    console.log("OpenReplay session started", { sessionID, ephemeralUserId })
    if (window.gtag != null) {
      window.gtag('set', {
        'user_id': ephemeralUserId,
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
