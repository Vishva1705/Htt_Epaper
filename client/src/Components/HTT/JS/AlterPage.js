import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import hinduLogo from "../Assets/hindu-tamil-logo.png";
import HttLogoMobile from "../Assets/HttLogoMobile.png";

import { faNewspaper } from "@fortawesome/free-regular-svg-icons";
import "../Css/Home.css";
import "../Css/EpaperPrint.css";
import "../Css/Commonpage.css";
import "../Css/AlterPage.css";
import HttProfile from "./HttProfile";

import Modal from "react-modal";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { FaPlusCircle } from "react-icons/fa";
import { FaMinusCircle } from "react-icons/fa";

const SubscriptionConfirmation = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Subscription Confirmation"
    >
      <div>
        <p>
          Enhance your reading experience! You're not subscribed yet. Enjoy
          uninterrupted access - click 'OK' to explore our subscription page.
        </p>
        <button className="subConBtn" onClick={onConfirm}>
          OK
        </button>
        <button className="subConBtn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Modal>
  );
};

function AlterPage() {
  const sessionDate = sessionStorage.getItem("date");
  const selectedRawEdition = sessionStorage.getItem("edition");
  const userMarkid = sessionStorage.getItem("EmailId");
  const endDateString = sessionStorage.getItem("Enddate");
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const navigate = useNavigate();

  if (endDateString) {
    // Split the date string into day, month, and year components
    const [day, month, year] = endDateString.split("/");

    // Create a Date object using the parsed values (months are zero-based in JavaScript Date)
    const endDate = new Date(year, month - 1, day);

    // Check if the created Date object is valid
    if (!isNaN(endDate.getTime())) {
      // console.log("endDate", endDate);

      // Get the current date
      const currentDate = new Date();

      currentDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      console.log("current date", currentDate);

      console.log("endDate", endDate);

      if (endDate >= currentDate) {
        sessionStorage.setItem("Subscribe", "1");
      } else {
        sessionStorage.setItem("Subscribe", "0");
      }
    } else {
      console.log("Invalid end date format:", endDateString);
    }
  } else {
    console.log("End date not found in sessionStorage.");
  }

  const startDate = sessionStorage.getItem("Startdate");
  const edition = sessionStorage.getItem("editions");
  const isPdfDownload = sessionStorage.getItem("is_pdf_download");
  const isSinglePdfDownload = sessionStorage.getItem("is_single_pdf_download");
  const userId = sessionStorage.getItem("userid");
  const usernam = sessionStorage.getItem("username");
  const display = sessionStorage.getItem("display");
  const message = sessionStorage.getItem("Subscribe");
  const authValue = sessionStorage.getItem("authValue");

  const regionMapping = {
    Thiruvananthapuram: "கன்னியாகுமரி",
    Chennai: "சென்னை",
    Coimbatore: "கோயம்புத்தூர்",
    Dharmapuri: "தருமபுரி",
    Kancheepuram: "காஞ்சிபுரம்",
    Madurai: "மதுரை",
    Puducherry: "புதுச்சேரி",
    Ramnad: "ராமநாதபுரம்",
    Salem: "சேலம்",
    Tanjavur: "தஞ்சாவூர்",
    Tiruchirapalli: "திருச்சி",
    Tirunelveli: "திருநெல்வேலி",
    Tirupur: "திருப்பூர்",
    Vellore: "வேலூர்",

    // Add other mappings as needed
  };

  const productMapping = {
    HinduTamilThisai: "இந்து தமிழ் திசை ",
    Supplementary: "இணைப்பிதழ் ",
    Supplementary_1: "இணைப்பிதழ் ஒன்று",
    Supplementary_2: "இணைப்பிதழ் இரண்டு",
    Supplementary_3: "இணைப்பிதழ் மூன்று",
    HinduTamilThisai_1: "இந்து தமிழ் திசை இரண்டு",
  };

  const [selectedDate, setSelectedDate] = useState(sessionDate);
  // console.log("selectedDate",selectedDate);

  const selectedDateObj = new Date(selectedDate);
  const day = selectedDateObj.getDate().toString().padStart(2, "0");
  const month = (selectedDateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = selectedDateObj.getFullYear().toString();
  const formattedDate = `${day}-${month}-${year}`;

  const dateString = formattedDate;
  const dateParts = dateString.split("-");
  const monthNumber = parseInt(dateParts[1], 10);

  // Convert month number to month name
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[monthNumber - 1]; // Subtracting 1 because month numbers are zero-based in JavaScript Date objects

  const sortedref = [
    "J-1-1.png",
    "J-1-2.png",
    "P-1-1.png",
    "P-1-2.png",
    "P-1-3.png",
    "P-1-4.png",
    "P-1-5.png",
    "P-1-6.png",
    "P-1-7.png",
    "P-1-8.png",
    "P-1-9.png",
    "P-1-10.png",
    "P-1-11.png",
    "P-1-12.png",
    "P-1-13.png",
    "P-1-14.png",
    "P-1-15.png",
    "P-1-16.png",
    "P-1-17.png",
    "P-1-18.png",
    "P-1-19.png",
    "P-1-20.png",
    "P-1-21.png",
    "P-1-22.png",
    "P-1-23.png",
    "P-1-24.png",
    "P-1-25.png",
    "P-1-26.png",
    "P-1-27.png",
    "P-1-28.png",
    "P-1-29.png",
    "P-1-30.png",
    "P-1-31.png",
    "P-1-32.png",
    "P-1-33.png",
    "P-1-34.png",
    "P-1-35.png",
    "P-1-36.png",
    "P-1-37.png",
    "P-1-38.png",
    "P-1-39.png",
    "P-1-40.png",
  ];

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_IPCONFIG,
  });

  // console.log(`Year: ${year}, Month: ${monthName}`);
  const [subAvailable, setSubAvailable] = useState("0");

  const [productFiles, setProductFiles] = useState([]);

  const [selectedProductFiles, setSelectedProductFiles] =
    useState("HinduTamilThisai");

  const [region, setRegion] = useState([]);

  const [selectedRegion, setSelectedRegion] = useState(selectedRawEdition);

  const [imagePageNo, setImagePageNo] = useState([]);
  const [subimagePageNo, setSubImagePageNo] = useState([]);

  const [fetchedImagePageNo, setFetchedImagePageNo] = useState("P-1-1.png");

  const [zoomLevel, setZoomLevel] = useState(75);

  const [imageSubArray, setImageSubArray] = useState([]);
  const [imageArray, setImageArray] = useState([]);

  const [showLoadingModal, setShowLoadingModal] = useState(false);

  const handleZoomIn = () => {
    setZoomLevel(Math.min(120, zoomLevel + 10));
  };

  // Function to handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(Math.max(75, zoomLevel - 10));
  };

  const handleDateChange = (event) => {
    const newSelectedDate = event.target.value;
    setSelectedDate(newSelectedDate);
    setShowLoadingModal(true);
    setSelectedRegion(selectedRawEdition);
    setSelectedProductFiles("HinduTamilThisai");
    setFetchedImagePageNo("P-1-1.png");
    sessionStorage.setItem("date", newSelectedDate);
  };

  const handleregionChange = (event) => {
    const selectedRegionValue = event.target.value;
    setShowLoadingModal(true);
    sessionStorage.setItem("edition", selectedRegionValue);
    setSelectedRegion(selectedRegionValue);
    setFetchedImagePageNo("P-1-1.png");
  };

  const fetchProductFiles = () => {
    if (formattedDate) {
      axiosInstance
        .get(`/htt/api/productfiles?date=${formattedDate}`)
        .then((response) => {
          setProductFiles(response.data);
          // console.log(response.data);
          if (response.data.length > 1) {
            fetchsubImagePage();
            fetchSubImage();
          }
        })
        .catch((error) => {
          console.error("Error fetching edition filenames:", error);
        });
    }
  };

  const fetchRegion = () => {
    if (formattedDate) {
      axiosInstance
        .get(
          `/htt/api/regionfiles?month=${monthName}&year=${year}&date=${formattedDate}`
        )
        .then((response) => {
          setRegion(response.data);
          fetchsubImagePage();
          fetchSubImage();
          // console.log(response.data.files);
        })
        .catch((error) => {
          console.error("Error fetching edition filenames:", error);
        });
    }
  };

  const fetchImagePage = () => {
    // console.log("Fetching image...");
    if (selectedRegion) {
      axiosInstance
        .get(
          `/htt/api/imagefiles?date=${formattedDate}&region=${selectedRegion}`
        )
        .then((response) => {
          const sortedArray = response.data.sort((a, b) => {
            return sortedref.indexOf(a) - sortedref.indexOf(b);
          });
          setImagePageNo(sortedArray);
          //  console.log("sortedArray:", sortedArray);
        })
        .catch((error) => {
          console.error("Error fetching image:", error);
        });
    }
  };

  const fetchsubImagePage = () => {
    // console.log("Fetching image...");
    if (selectedRegion) {
      axiosInstance
        .get(
          `/htt/api/subimagefiles?year=${year}&month=${monthName}&date=${formattedDate}&region=${selectedRegion}`
        )
        .then((response) => {
          setSubImagePageNo(response.data);
          // console.log("sub image page no fetched:", response.data.files);
        })
        .catch((error) => {
          // console.error("Error fetching image:", error);
        });
    }
  };

  const fetchImagesForPages = () => {
    // Create an array of promises for each image fetch operation
    const promises = imagePageNo.map((pageNo) => {
      return fetchImage(pageNo)
        .then((imageData) => imageData)
        .catch((error) => {
          console.error("Error fetching image for page", pageNo, ":", error);
          return null; // return null for failed fetches to maintain order
        });
    });

    // Wait for all promises to resolve
    Promise.all(promises)
      .then((results) => {
        // Filter out null values (failed fetches) and update state
        const filteredResults = results.filter((result) => result !== null);
        setImageArray(filteredResults);
        setShowLoadingModal(false);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
      });
  };
  // console.log(imagePageNo, imageArray);

  const fetchImage = (pageNo) => {
    return new Promise((resolve, reject) => {
      if (formattedDate) {
        axiosInstance
          .get(
            `/htt/api/jpeg?date=${formattedDate}&region=${selectedRegion}&filename=${pageNo}`,
            { responseType: "blob" }
          )

          .then((response) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result);
            };
            reader.readAsDataURL(response.data);
          })
          .catch((error) => {
            console.error("Error fetching image:", error);
            reject(error);
          });
      }
    });
  };

  // Call fetchImagesForPages when imagePageNo changes
  useEffect(() => {
    fetchImagesForPages();
    navigate(
      `/hindu_tamil_epaper_alter_view?view=alterview&date=${formattedDate}&region=${selectedRegion}`
    );
  }, [imagePageNo]);

  const fetchSubImagesForPages = () => {
    // Create an array of promises for each image fetch operation
    const promises = imagePageNo.map((pageNo) => {
      return fetchSubImage(pageNo)
        .then((imageData) => imageData)
        .catch((error) => {
          console.error("Error fetching image for page", pageNo, ":", error);
          return null; // return null for failed fetches to maintain order
        });
    });

    // Wait for all promises to resolve
    Promise.all(promises)
      .then((results) => {
        // Filter out null values (failed fetches) and update state
        const filteredResults = results.filter((result) => result !== null);
        setImageSubArray(filteredResults);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
      });
  };

  const fetchSubImage = (pageNo) => {
    return new Promise((resolve, reject) => {
      if (formattedDate) {
        axiosInstance
          .get(
            `/htt/api/subjpeg?date=${formattedDate}&region=${selectedRegion}&filename=${pageNo}`,
            { responseType: "blob" }
          )
          .then((response) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result);
            };
            reader.readAsDataURL(response.data);
            setSubAvailable("1");
            // console.log("Image fetched:", response.data);
          })
          .catch((error) => {
            resolve(null); // Resolve with null to indicate no image was fetched
            setImageSubArray([]);
            setSubAvailable("0");
          });
      } else {
        console.error("formattedDate is not available");
        resolve(null); // Resolve with null to indicate no image was fetched
      }
    });
  };

  // Call fetchImagesForPages when imagePageNo changes
  useEffect(() => {
    fetchSubImagesForPages();
  }, [subimagePageNo]);

  useEffect(() => {
    fetchProductFiles();
    fetchRegion();
    fetchImagePage();
  }, [formattedDate, selectedRegion, selectedProductFiles]);

  const handleLogoButton = () => {
    navigate("/");
  };

  function handleHome() {
    navigate("/");
  }

  const handleSubscription = () => {
    // Display the custom confirmation box
    setConfirmationOpen(true);
  };

  const handleConfirmation = () => {
    // If user clicks 'OK', navigate to the URL
    window.location.href = "https://store.hindutamil.in/digital-subscription";
  };

  const closeConfirmation = () => {
    // Close the confirmation box
    setConfirmationOpen(false);
    handleHome();
  };

  const handlewrongAuth = () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });

    // Clear session storage
    sessionStorage.clear();

    setTimeout(() => {
      handleSubscription();
    }, 1000);
  };

  useEffect(() => {
    if (display === "1" && message === "1" && authValue === "yes") {
      // Case 1: Display is "1", message is "1", and authValue is "yes"
      fetchRegion();
    } else if (display === "1" && authValue === "yes" && message !== "1") {
      // Case 2: Display is "1",authValue is "yes" but message is not "1"
      handleSubscription();
    } else if (display === "1" && message !== "1" && authValue !== "yes") {
      // Case 2: Display is "1", but message  and authvalue is not "1" and "yes"
      handleSubscription();
    } else {
      // Case 3: Navigate to "/" for other cases
      handleSubscription();
    }
  }, [formattedDate, display, message, authValue]);

  const LoadingModal = () => (
    <div className="loading-modal">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  );

  return (
    <>
      <SubscriptionConfirmation
        isOpen={isConfirmationOpen}
        onConfirm={handleConfirmation}
        onClose={closeConfirmation}
      />
      {showLoadingModal && <LoadingModal />}
      {display === "1" && message === "1" && authValue === "yes" ? (
        
          <div>
            {window.innerWidth >= 768 ? (
              <div>
                <div
                  className="header"
                  style={{ position: "fixed", width: "100%" }}
                >
                  <div className="header-Image">
                    <img
                      src={hinduLogo}
                      alt="Hindu Tamil Thisai Logo"
                      className="logo"
                      onClick={handleLogoButton}
                      style={{ justifyContent: "flex-start" }}
                    />
                  </div>
                  <div
                    style={{
                      width: "30%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div className="epaperprint">இ-பேப்பர்</div>
                  </div>
                  <div className="Each_Product">
                    <input
                      type="date"
                      className="datepicker"
                      value={selectedDate}
                      max={format(new Date(), "yyyy-MM-dd")}
                      onChange={handleDateChange}
                    />
                  </div>

                  <div className="Each_Product">
                    <span className="iconContent">
                      <FontAwesomeIcon
                        icon={faNewspaper}
                        style={{ color: "white" }}
                      />
                    </span>
                    <select
                      onChange={handleregionChange}
                      value={selectedRegion}
                    >
                      {region.map((region) => (
                        <option key={region} value={region}>
                          {regionMapping[region] || region}
                        </option>
                      ))}
                    </select>
                  </div>

                  <HttProfile />
                </div>
                <div className="ZoomDiv">
                  <div
                    style={{
                      marginLeft: "5%",
                      width: "3%",
                      backgroundColor: "#0056b3",
                      padding: "5px",
                      cursor: "pointer",
                    }}
                    onClick={handleZoomOut}
                  >
                    <FaMinusCircle size={30} style={{ color: "white" }} />
                  </div>

                  <div
                    style={{
                      marginRight: "5%",
                      width: "3%",
                      backgroundColor: "#0056b3",
                      padding: "5px",
                      cursor: "pointer",
                    }}
                    onClick={handleZoomIn}
                  >
                    <FaPlusCircle size={30} style={{ color: "white" }} />
                  </div>
                </div>

                <div className="ImageContainer">
                  {imageArray.map((imageData, index) => (
                    <div className="imageViewer" key={index}>
                      <img
                        className="fetchedImage"
                        src={imageData}
                        alt={`Imag ${index}`}
                        style={{ width: zoomLevel + "%", height: "auto" }}
                      />
                    </div>
                  ))}
                </div>
                {subAvailable === "1" && (
                  <div>
                    <div>
                      <h1>Supplementary</h1>
                    </div>
                    <div className="ImageContainer">
                      {imageSubArray.map((imageData, index) => (
                        <div className="imageViewer" key={index}>
                          <img
                            className="fetchedImage"
                            src={imageData}
                            alt={`Imag ${index}`}
                            style={{ width: zoomLevel + "%", height: "auto" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div
                  className="header"
                  style={{ position: "fixed", width: "100%" }}
                >
                  <div className="header-Image">
                    <img
                      src={HttLogoMobile}
                      alt="Hindu Tamil Thisai Logo"
                      className="logo"
                      onClick={handleLogoButton}
                      style={{ width: "50%", marginLeft: "10%" }}
                    />
                  </div>
                  <div className="epaperprint" style={{ width: "75%" }}>
                    இ-பேப்பர்
                  </div>
                  <HttProfile />
                </div>
                <div className="Input_Holder" style={{ margin: "1% 1%" }}>
                  <div className="Each_Product">
                    <input
                      type="date"
                      className="datepicker"
                      value={selectedDate}
                      max={format(new Date(), "yyyy-MM-dd")}
                      onChange={handleDateChange}
                    />
                  </div>

                  <div className="Each_Product">
                    <span className="iconContent">
                      <FontAwesomeIcon icon={faNewspaper} />
                    </span>
                    <select
                      onChange={handleregionChange}
                      value={selectedRegion}
                    >
                      {region.map((region) => (
                        <option key={region} value={region}>
                          {regionMapping[region] || region}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="ImageContainer">
                  {imageArray.map((imageData, index) => (
                    <div className="imageViewer" key={index}>
                      <img
                        className="fetchedImage"
                        src={imageData}
                        alt={`Imag ${index}`}
                        style={{ width: "100%" }}
                      />
                    </div>
                  ))}
                </div>
                {subAvailable === "1" && (
                  <div>
                    <div>
                      <h1>Supplementary</h1>
                    </div>
                    <div className="ImageContainer">
                      {imageSubArray.map((imageData, index) => (
                        <div className="imageViewer" key={index}>
                          <img
                            className="fetchedImage"
                            src={imageData}
                            alt={`Imag ${index}`}
                            style={{ width: "100%" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
      
      ) : (
        handlewrongAuth()
      )}
    </>
  );
}

export default AlterPage;
