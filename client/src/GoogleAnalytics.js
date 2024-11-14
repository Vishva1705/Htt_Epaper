// GoogleAnalytics.js
import React, { useEffect } from 'react';
import ReactGA from 'react-ga';

const GoogleAnalytics = () => {
  useEffect(() => {
    ReactGA.initialize(process.env.REACT_APP_GA_PROPERTY_ID || ''); // Replace with your GA property ID
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  return null;
};

export default GoogleAnalytics;
