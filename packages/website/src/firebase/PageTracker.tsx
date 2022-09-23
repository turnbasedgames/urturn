import { useLocation } from 'react-router-dom'
import React, { useEffect } from 'react'
import { logEvent } from 'firebase/analytics'

import { analytics } from './setupFirebase'

const PageTracker = () => {
  const location = useLocation()
  useEffect(() => {
    const pagePath = location.pathname + location.search
    logEvent(analytics, 'page_view', { pagePath })
  }, [location])
  return <></>
}

export default PageTracker
