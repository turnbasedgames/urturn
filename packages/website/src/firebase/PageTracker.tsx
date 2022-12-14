import { useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import { logEvent } from 'firebase/analytics';

import { analytics } from './setupFirebase';

function PageTracker(): React.ReactElement {
  const location = useLocation();
  useEffect(() => {
    const pagePath = location.pathname + location.search;
    logEvent(analytics, 'page_view', { page_path: pagePath });
  }, [location]);
  // disabled because the PageTracker must go inside the <Router> as a child component
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
}

export default PageTracker;
