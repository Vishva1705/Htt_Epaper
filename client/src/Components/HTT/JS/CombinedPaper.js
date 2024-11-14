import React, { useState, useEffect } from "react";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import hinduLogo from "../Assets/hindu-tamil-logo.png";
import HttLogoMobile from "../Assets/HttLogoMobile.png";
import "../Css/Home.css";
import "../Css/EpaperPrint.css";
import { useNavigate } from "react-router-dom";
import HttProfile from "./HttProfile";
import FullUrl from "./FullUrl";
import SingleUrl from "./SingleUrl";
import ReactGA from "react-ga";

// Import styles
import "@react-pdf-viewer/zoom/lib/styles/index.css";

const CombinedPaper = () => {
  const [isFull, setIsFull] = useState(false);
  const navigate = useNavigate();

  const handleLogoButton = () => {
    navigate("/");
  };

  useEffect(() => {
    // Track a pageview when the component mounts
    ReactGA.pageview(window.location.pathname + window.location.search);

    // Track an event
    ReactGA.event({
      category: "pdf viewer page",
      action: "view pdf",
      label: "My Button",
    });

    // You can add more tracking as needed
  }, []);

  return (
    <div>
      <div className="header">
        <div className="header-Image">
          {window.innerWidth <= 768 ? (
            <img
              src={HttLogoMobile}
              alt="Hindu Tamil Thisai Logo"
              className="logo"
              onClick={handleLogoButton}
            />
          ) : (
            <img
              src={hinduLogo}
              alt="Hindu Tamil Thisai Logo"
              className="logo"
              onClick={handleLogoButton}
            />
          )}
        </div>
        <div className="epaperprint">இ-பேப்பர்</div>

        <div className="viewButtonClass">
          <button
            onClick={() => setIsFull(false)}
            className={isFull ? "inactives" : "actives"}
          >
            Page View
          </button>
          <button
            onClick={() => setIsFull(true)}
            className={isFull ? "actives" : "inactives"}
          >
            Full View
          </button>
        </div>
        <HttProfile />
      </div>
      <div className="Mask"></div>
      <div>{isFull ? <FullUrl /> : <SingleUrl />}</div>
    </div>
  );
};

export default CombinedPaper;
