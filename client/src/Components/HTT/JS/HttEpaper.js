import React, { useState, useEffect, lazy, Suspense } from "react";
import "../Css/Home.css";
import "../Css/Epaper.css";
import "../Css/Ad.css";
import "../Css/HttThumbnail.css";
import hinduLogo from "../Assets/hindu-tamil-logo.png";
import HttLogoMobile from "../Assets/HttLogoMobile.png";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import { format } from "date-fns";
import { HiOutlineNewspaper } from "react-icons/hi2";
import { FaShareFromSquare } from "react-icons/fa6";
import { FaChalkboardTeacher } from "react-icons/fa";
import HttProfile from "./HttProfile";
import ReactGA from "react-ga";

function getCurrentDateFormatted() {
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, "0");
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const year = currentDate.getFullYear();
  return `${day}-${month}-${year}`;
}

const HttEpaper = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [thumbnailImages, setThumbnailImages] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // const [rformattedDate, setRformattedDate] = useState(getCurrentDateFormatted);
  const [selectedButton, setSelectedButton] = useState(null); // Store selected button info
  const [isTampPopupOpen, setIsTampPopupOpen] = useState(false);
  const display = sessionStorage.getItem("display");

  const handleOpenPopup = () => {
    setIsTampPopupOpen(true);
    // console.log("clicked");
  };

  const handleClosePopup = () => {
    setIsTampPopupOpen(false);
  };

  const selectedDateObj = new Date(selectedDate);
  const day = selectedDateObj.getDate().toString().padStart(2, "0");
  const month = (selectedDateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = selectedDateObj.getFullYear().toString();
  const formattedDate = `${day}-${month}-${year}`;
  sessionStorage.setItem("date", selectedDate);

  const alternateimage =
    "https://static.hindutamil.in/hindu/static/common/images/footer-logo.png";

  const gridButtons = [
    { edition: "சென்னை", editionName: "Chennai", imageName: "Chennai.png" },
    {
      edition: "கோயம்புத்தூர்",
      editionName: "Coimbatore",
      imageName: "Coimbatore.png",
    },
    {
      edition: "தருமபுரி",
      editionName: "Dharmapuri",
      imageName: "Dharmapuri.png",
    },
    {
      edition: "காஞ்சிபுரம்",
      editionName: "Kancheepuram",
      imageName: "Kancheepuram.png",
    },
    {
      edition: "கன்னியாகுமரி",
      editionName: "Thiruvananthapuram",
      imageName: "Thiruvananthapuram.png",
    },

    { edition: "மதுரை", editionName: "Madurai", imageName: "Madurai.png" },

    {
      edition: "புதுச்சேரி",
      editionName: "Puducherry",
      imageName: "Puducherry.png",
    },

    { edition: "ராமநாதபுரம்", editionName: "Ramnad", imageName: "Ramnad.png" },
    { edition: "சேலம்", editionName: "Salem", imageName: "Salem.png" },
    {
      edition: "தஞ்சாவூர்",
      editionName: "Tanjavur",
      imageName: "Tanjavur.png",
    },
    {
      edition: "திருச்சி",
      editionName: "Tiruchirapalli",
      imageName: "Tiruchirapalli.png",
    },
    {
      edition: "திருநெல்வேலி",
      editionName: "Tirunelveli",
      imageName: "Tirunelveli.png",
    },
    { edition: "திருப்பூர்", editionName: "Tirupur", imageName: "Tirupur.png" },
    { edition: "வேலூர்", editionName: "Vellore", imageName: "Vellore.png" },
  ];

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);

    ReactGA.event({
      category: "ThumbNail page",
      action: "Clicked Button",
      label: "My Button",
    });
  }, []);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const navigate = useNavigate();

  const handleLogoButton = () => {
    navigate("/");
  };

  const [showPopup, setShowPopup] = useState(false);

  const popSoon = () => {
    setShowPopup(true);
    setTimeout(closePop, 1500);
  };

  const closePop = () => {
    setShowPopup(false);
  };

  const openPopup = (button, imageNames) => {
    setSelectedButton(button); // Save selected button info
    // console.log(imageNames);
    setIsPopupOpen(true);
    sessionStorage.setItem("ThumbnailImage", imageNames);
    sessionStorage.setItem("edition", button.editionName);
    navigate(
      `/hindu_tamil_epaper_page_view?date=${formattedDate}&region=${button.editionName}`
    );
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IPCONFIG}api/htt/fetchImages?date=${formattedDate}`
        );
        const imagesData = response.data;
        // Corrected variable name

        const imagePromises = gridButtons.map((button) => {
          const imageData = imagesData.find((image) => {
            // Extract the image filename from the imagesData array
            const imageFilename = image.split("_")[1];
            return imageFilename === button.imageName;
          });

          if (imageData) {
            return {
              edition: button.imageName,
              image: imageData, // Assuming the API returns the image URL or data
            };
          } else {
            console.error(
              `Image data not found for ${formattedDate}-${button.editionName}`
            );
            return {
              edition: button.edition,
              image: null,
            };
          }
        });

        Promise.all(imagePromises).then((images) => {
          const thumbnailImagesObject = {};
          images.forEach((imageInfo) => {
            if (imageInfo.image) {
              thumbnailImagesObject[
                imageInfo.edition
              ] = `https://stgtamilthisaicdn.blob.core.windows.net/httepaper/FrontpageImages/${formattedDate}/ThumnailImages/${imageInfo.image}`;
            } else {
              thumbnailImagesObject[imageInfo.edition] = alternateimage;
            }
          });
          setThumbnailImages(thumbnailImagesObject);
        });
      } catch (error) {
        console.error(`Error fetching images for ${formattedDate}:`, error);
      }
    };

    // Call the fetchImages function when the selectedDate changes
    fetchImages();
  }, [selectedDate, formattedDate]);
  // Include selectedDate and formattedDate as dependencie

  const loginProfileButton = () => {
    const url = `${process.env.REACT_APP_IPCONFIG}httauth`;
    const base64EncodedUrl = btoa(url);
    // console.log(base64EncodedUrl);

    // Redirect the user to the specified URL
    window.location.href = `https://hindutamil.in/go_epaper.php?return=${base64EncodedUrl}`;
  };

  const conditionToDisplay = display === "1";

  useEffect(() => {
    window.googletag.cmd.push(function () {
      window.googletag.display("div-gpt-ad-1700455118990-0");
    });
  }, []);

  useEffect(() => {
    window.googletag.cmd.push(function () {
      window.googletag.display("div-gpt-ad-1700455188643-0");
    });
  }, []);

  useEffect(() => {
    window.googletag.cmd.push(function () {
      window.googletag.display("div-gpt-ad-1700455246998-0");
    });
  }, []);

  useEffect(() => {
    window.googletag.cmd.push(function () {
      window.googletag.display("div-gpt-ad-1700455334520-0");
    });
  }, []);

  useEffect(() => {
    window.googletag.cmd.push(function () {
      window.googletag.display("div-gpt-ad-1706162832307-0");
    });
  }, []);

  

  return (
    <>
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
        <div className="epaper">இ-பேப்பர்</div>
        <HttProfile />
      </div>

      <div className="container">
        <div className="button-container">
          <button className="click-button" onClick={handleOpenPopup}>
            <HiOutlineNewspaper />
            போஸ்டர்
          </button>

          {isTampPopupOpen && (
            <div className="popup" onClick={handleClosePopup}>
              <div className="popup-content">
                <div className="close-button">X</div>
                <img
                  src={`https://stgtamilthisaicdn.blob.core.windows.net/httepaper/FrontpageImages/${formattedDate}/TamposterImages/TAMPosterChennai.png`}
                  alt="Popup Img"
                />
                <button
                  className="Thumbedition-divposter"
                  onClick={loginProfileButton}
                >
                  மேலும் செய்திகளுக்கு
                </button>
              </div>
            </div>
          )}

          <button className="click-button" onClick={popSoon}>
            <FaChalkboardTeacher />
            இ-செய்திகள்
          </button>

          <button
            className="click-button"
            data-tip="Click me for a tooltip"
            onClick={popSoon}
          >
            <FaShareFromSquare />
            செய்திகளை பகிருங்கள்
          </button>

          {showPopup && (
            <div className="popup" onClick={closePop}>
              {/* <div  className="close-button">
                <FaWindowClose />
              </div> */}
              <h1 style={{ backgroundColor: "white", padding: "15px" }}>
                Coming Soon! Stay tuned for updates.
              </h1>
            </div>
          )}
        </div>

        {/* <div className="Hdate-input">
          <input
            type="date"
            id="datePicker"
            value={selectedDate}
            onChange={handleDateChange}
            className="datePicker"
            max={format(new Date(), "yyyy-MM-dd")}
          />
        </div> */}
        <div style={{ padding: "8px 0" }}>
          {window.innerWidth >= 768 ? (
            <div
              id="div-gpt-ad-1700455118990-0"
              style={{ minWidth: "728px", minHeight: "90px" }}
            ></div>
          ) : (
            <div
              id="div-gpt-ad-1700455188643-0"
              style={{ minWidth: "320px", minHeight: "50px" }}
            ></div>
          )}
        </div>

        <div className="thumbnail-grid">
          {gridButtons.slice(0, 4).map((button, index) => (
            <div key={index} className="thumbnail-gridbox">
              <div className="thumbnailHeading">{button.edition}</div>
              <div className="thumbnail">
                {thumbnailImages[button.imageName] ? (
                  <img
                    src={thumbnailImages[button.imageName]}
                    alt={`${button.edition} Thumbnail`}
                    onClick={() =>
                      openPopup(button, thumbnailImages[button.imageName])
                    }
                    onError={(e) => {
                      e.target.src = alternateimage; // Set placeholder image on error
                    }}
                    loading="lazy" // Add lazy loading attribute
                  />
                ) : (
                  <div>
                    <p>பக்கங்கள் விரைவில் வரும்</p>
                  </div>
                )}
              </div>

              {isPopupOpen && (
                <div className="popup">
                  <button className="close-button" onClick={closePopup}>
                    X
                  </button>
                  <div>
                    {thumbnailImages[selectedButton.imageName] && (
                      <img
                        src={thumbnailImages[selectedButton.imageName]}
                        alt="News Thumbnail"
                        loading="lazy" // Add lazy loading attribute
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="thumbnail-grid">
          {gridButtons.slice(4, 8).map((button, index) => (
            <div key={index} className="thumbnail-gridbox">
              <div className="thumbnailHeading">{button.edition}</div>
              <div className="thumbnail">
                {thumbnailImages[button.imageName] ? (
                  <img
                    src={thumbnailImages[button.imageName]}
                    alt={`${button.edition} Thumbnail`}
                    onClick={() =>
                      openPopup(button, thumbnailImages[button.imageName])
                    }
                    onError={(e) => {
                      e.target.src = alternateimage; // Set placeholder image on error
                    }}
                    loading="lazy" // Add lazy loading attribute
                  />
                ) : (
                  <div>
                    <p>பக்கங்கள் விரைவில் வரும்</p>
                  </div>
                )}
              </div>

              {isPopupOpen && (
                <div className="popup">
                  <button className="close-button" onClick={closePopup}>
                    X
                  </button>
                  <div>
                    {thumbnailImages[selectedButton.imageName] && (
                      <img
                        src={thumbnailImages[selectedButton.imageName]}
                        alt="News Thumbnail"
                        loading="lazy" // Add lazy loading attribute
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 0" }}>
          
            <div
              id="div-gpt-ad-1706162832307-0"
              
            ></div>
          
        </div>
        <div className="thumbnail-grid">
          {gridButtons.slice(8, 12).map((button, index) => (
            <div key={index} className="thumbnail-gridbox">
              <div className="thumbnailHeading">{button.edition}</div>
              <div className="thumbnail">
                {thumbnailImages[button.imageName] ? (
                  <img
                    src={thumbnailImages[button.imageName]}
                    alt={`${button.edition} Thumbnail`}
                    onClick={() =>
                      openPopup(button, thumbnailImages[button.imageName])
                    }
                    onError={(e) => {
                      e.target.src = alternateimage; // Set placeholder image on error
                    }}
                    loading="lazy" // Add lazy loading attribute
                  />
                ) : (
                  <div>
                    <p>பக்கங்கள் விரைவில் வரும்</p>
                  </div>
                )}
              </div>

              {isPopupOpen && (
                <div className="popup">
                  <button className="close-button" onClick={closePopup}>
                    X
                  </button>
                  <div>
                    {thumbnailImages[selectedButton.imageName] && (
                      <img
                        src={thumbnailImages[selectedButton.imageName]}
                        alt="News Thumbnail"
                        loading="lazy" // Add lazy loading attribute
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="thumbnail-grid">
          {gridButtons.slice(12, 14).map((button, index) => (
            <div key={index} className="thumbnail-gridbox">
              <div className="thumbnailHeading">{button.edition}</div>
              <div className="thumbnail">
                {thumbnailImages[button.imageName] ? (
                  <img
                    src={thumbnailImages[button.imageName]}
                    alt={`${button.edition} Thumbnail`}
                    onClick={() =>
                      openPopup(button, thumbnailImages[button.imageName])
                    }
                    onError={(e) => {
                      e.target.src = alternateimage; // Set placeholder image on error
                    }}
                    loading="lazy" // Add lazy loading attribute
                  />
                ) : (
                  <div>
                    <p>பக்கங்கள் விரைவில் வரும்</p>
                  </div>
                )}
              </div>

              {isPopupOpen && (
                <div className="popup">
                  <button className="close-button" onClick={closePopup}>
                    X
                  </button>
                  <div>
                    {thumbnailImages[selectedButton.imageName] && (
                      <img
                        src={thumbnailImages[selectedButton.imageName]}
                        alt="News Thumbnail"
                        loading="lazy" // Add lazy loading attribute
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          className="DeskDownAd"
          style={{
            padding: "8px 0",
          }}
        >
          {window.innerWidth >= 768 ? (
            <div
              id="div-gpt-ad-1700455246998-0"
              style={{ minWidth: "728px", minHeight: "90px" }}
            ></div>
          ) : (
            <div
              id="div-gpt-ad-1700455334520-0"
              style={{ minWidth: "320px", minHeight: "50px" }}
            ></div>
          )}
        </div>
      </div>
    </>
  );
};

export default HttEpaper;
