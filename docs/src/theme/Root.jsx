import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line react/prop-types
export default function Root({ children }) {
  useEffect(() => {
    // create randomly generated uuid and store in local storage
    let ephemeralUserId = localStorage.getItem('ephemeralUserId');
    if (ephemeralUserId == null) {
      ephemeralUserId = uuidv4();
      localStorage.setItem('ephemeralUserId', ephemeralUserId);
    }

    if (window.gtag != null) {
      window.gtag('set', {
        user_id: ephemeralUserId,
      });
    }
  }, []);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
