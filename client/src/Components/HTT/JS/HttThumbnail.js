import React, { useEffect, useState } from "react";
import "../Css/HttThumbnail.css";
import "../Css/Home.css";
import "../Css/Epaper.css";
import hinduLogo from "../Assets/hindu-tamil-logo.png";
import HttLogoMobile from "../Assets/HttLogoMobile.png";
import { useNavigate } from "react-router-dom";
import { ImZoomIn, ImZoomOut } from "react-icons/im";
import { MdCancel } from "react-icons/md";
import HttProfile from "./HttProfile";

function HttThumbnail() {
  const [imageURL, setImageURL] = useState(""); // State to store the URL
  const [zoomLevel, setZoomLevel] = useState(50);
  const [mZoomLevel, setMZoomLevel] = useState(95);
  const display = sessionStorage.getItem("display");

  useEffect(() => {
    // Retrieve the URL from sessionStorage
    const thumbnailImageURL = sessionStorage.getItem("ThumbnailImage");

    if (thumbnailImageURL) {
      setImageURL(thumbnailImageURL);
    }
  }, []);
  const handleZoomIn = () => {
    setZoomLevel(Math.min(90, zoomLevel + 10));
  };

  // Function to handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(Math.max(50, zoomLevel - 10));
  };

  // Function to handle zoom in for smaller screens
  const handleMobileZoomIn = () => {
    setMZoomLevel(Math.min(200, mZoomLevel + 10));
  };

  // Function to handle zoom out for smaller screens
  const handleMobileZoomOut = () => {
    setMZoomLevel(Math.max(100, mZoomLevel - 10));
  };

  const handleMoreButton = () => {
    const authValue = "yes";
    sessionStorage.setItem("authValue",authValue);
    const url = `${process.env.REACT_APP_IPCONFIG}httauth`;
    const base64EncodedUrl = btoa(url);
    // console.log(base64EncodedUrl);

    // Redirect the user to the specified URL
    window.location.href = `https://hindutamil.in/go_epaper.php?return=${base64EncodedUrl}`;
  };

  const conditionToDisplay = display === "1";
  if (conditionToDisplay) {
    handleMoreButton();
  }

  const navigate = useNavigate();

  const handleLogoButton = () => {
    navigate("/");
  };

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
          />):(
          <img
            src={hinduLogo}
            alt="Hindu Tamil Thisai Logo"
            className="logo"
            onClick={handleLogoButton}
          />)}
        </div>
        <div className="epaper">இ-பேப்பர்</div>
        <HttProfile />
      </div>

      <div className="Thumbimage-viewer">
        {window.innerWidth > 720 ? (
          <div className="ThumbnailViwer">
            <div className="Thumbcontrols">
              <MdCancel className="CloseButton" onClick={handleLogoButton} />

              <ImZoomIn onClick={handleZoomIn} />
              <ImZoomOut onClick={handleZoomOut} />
              <button className="Thumbedition-div" onClick={handleMoreButton}>
                மேலும் பக்கங்களுக்கு
              </button>
            </div>

            <div
              className="Thumbimage-container"
              style={{ width: zoomLevel + "%", height: "auto" }}
            >
              {imageURL && <img src={imageURL} alt="Thumbnail" />}
            </div>
          </div>
        ) : (
          <div
            className="Thumbimage-container"
            style={{ width: mZoomLevel + "%", height: "auto" }}
          >
            <div className="Thumbcontrols">
              <button onClick={handleMoreButton}>மேலும் பக்கங்களுக்கு</button>
            </div>

            {imageURL && <img src={imageURL} alt="Thumbnail" />}
          </div>
        )}
      </div>
    </div>
  );
}
export default HttThumbnail;


