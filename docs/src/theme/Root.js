import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Root({ children }) {
  useEffect(() => {
    // create randomly generated uuid and store in local storage
    const ephemeralUserId = localStorage.getItem('ephemeralUserId');
    if (ephemeralUserId == null) {
      ephemeralUserId = uuidv4();
      localStorage.setItem('ephemeralUserId', ephemeralUserId);
    }

    if (window.gtag != null) {
      window.gtag('set', {
        'user_id': ephemeralUserId,
      });
    } else {
      console.warn('was not able to configure session id in gtag!')
    }
  }, []);

  return <>{children}</>;
}
