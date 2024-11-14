import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import hinduLogo from "../Assets/hindu-tamil-logo.png";
import axios from "axios";
import { GrLocation } from "react-icons/gr";
import HttLogoMobile from "../Assets/HttLogoMobile.png";
import HttProfile from "./HttProfile";

import "../Css/Home.css";
import "../Css/EpaperPrint.css";
import "../Css/Commonpage.css";

export default function Oldepaper() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const passedDate = queryParams.get("selectedDate");
  // console.log(passedDate);

  const sessionDate = sessionStorage.getItem("date");

  // adobe pdf viewer client Id 

 // Uat1 server client id
//  const adobeDCClientId = "9424640667014d008e111f0e2e7c9c1f";

 //live server client id
 const adobeDCClientId = "7b8a1ac8762e477381f0b044f6915d05";



 // const adobeDCClientId = process.env.REACT_APP_ADOBE_DC_CLIENT_ID;


  const [selectedDate, setSelectedDate] = useState(sessionDate);

  const [selectedCity, setSelectedCity] = useState("சென்னை");

  const [newsData, setNewsData] = useState([]);

  const display = sessionStorage.getItem("display");
  const isPdfDownload = sessionStorage.getItem("is_pdf_download");


  const selectedDateObj = new Date(selectedDate);
  const day = selectedDateObj.getDate().toString().padStart(2, "0");
  const month = (selectedDateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = selectedDateObj.getFullYear().toString();
  const formattedDate = `${day}-${month}-${year}`;
  // sessionStorage.setItem("date", formattedDate);

  const handleDateChange = (e) => {
    const newSelectedDate = e.target.value;
    // console.log("newSelectedDate:" + newSelectedDate);
    sessionStorage.setItem("date", newSelectedDate);

    if (newSelectedDate > "2023-10-31") {
      navigate("/hindu_tamil_epaper_pdf_view");
    } else {
      setSelectedDate(newSelectedDate);
      queryParams.set("selectedDate", newSelectedDate);
      navigate(`?${queryParams.toString()}`);
    }
  };

  const handleLogoButton = () => {
    navigate("/");
  };

  function handleSubscription() {
    // Display a confirmation popup
    var userConfirmed = window.confirm(
      "Enhance your reading experience! You're not subscribed yet. Enjoy uninterrupted access - click 'OK' to explore our subscription page."
    );

    // Check user's response
    if (userConfirmed) {
      // If user clicks 'OK', navigate to the URL
      window.location.href = "https://store.hindutamil.in/digital-subscription";
    } else {
      handleLogoButton();
    }
  }

  useEffect(() => {
    if (display !== "1" && isPdfDownload !== "1") {
      // Navigate to "/"
      navigate("/");
    } else if (display === "1" && isPdfDownload !== "1") {
      handleSubscription();
    } else if (display === "1" && isPdfDownload === "1") {
      fetchData();
    }
  }, [selectedDate]);



  // Fetch news data based on the selected date
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://api.hindutamil.in/app/index.php?key=GsWbpZpD21Hsd&&type=epaper&ptype=edition&date=${selectedDate}`
      );
      setNewsData(response.data.data.editions);
      // console.log(response.data.data.editions);
    } catch (error) {
      console.error("Error fetching news data:", error);
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
  };

 

  return (
    <>
      {display === "1" && isPdfDownload === "1" && (
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

          <div className="Input_Holder">
            <div className="Each_Product">
              <input
                type="date"
                className="datepicker"
                id="DatePicker"
                value={selectedDate}
                onChange={handleDateChange}
                max={format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            <div className="Each_Product">
              <span className="iconContent">
                <GrLocation />
              </span>

              <select
                id="Edition"
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
              >
                <option value="" disabled>
                  Select a city
                </option>
                {newsData.map((edition) => (
                  <option key={edition.city} value={edition.city}>
                    {edition.city}
                  </option>
                ))}
              </select>
            </div>

            <br />
          </div>

          <div>
            {selectedCity && (
              <div>
               
                <Suspense fallback={<div>Loading PDF Viewer...</div>}>
                  {window.innerWidth <= 768 ? (
                    <PdfViewerComponentMobile
                      pdfData={newsData.find((edition) => edition.city === selectedCity)?.pdf}
                      adobeDCClientId={adobeDCClientId}
                      selectedDate={`${selectedDate}_${selectedCity}`}
                    />
                  ) : (
                    <PdfViewerComponentDesktop
                      pdfData={newsData.find((edition) => edition.city === selectedCity)?.pdf}
                      adobeDCClientId={adobeDCClientId}
                      selectedDate={`${selectedDate}_${selectedCity}`}
                    />
                  )}
                </Suspense>

                
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

const PdfViewerComponentMobile = ({
  pdfData,
  adobeDCClientId,
  selectedDate,
}) => {
  useEffect(() => {
    if (pdfData) {
      initializeAdobeDCView(pdfData);
    }
  }, [pdfData]);

  const initializeAdobeDCView = (pdfDataUrl) => {
    if (window.AdobeDC) {
      const adobeDCView = new window.AdobeDC.View({
        clientId: adobeDCClientId,
        divId: "adobe-dc-view",
      });

      const pdfName = `${selectedDate}.pdf`; // Use the selected date as the filename

      const metaData = { fileName: pdfName };

      adobeDCView.previewFile(
        {
          content: { location: { url: pdfDataUrl } },
          metaData: metaData,
        },
        {
          // embedMode: "IN_LINE", // Set the embed mode dynamically
          showAnnotationTools: false,
          showDownloadPDF: false,
          showPrintPDF: false,
          defaultViewMode: "SINGLE_PAGE",
        }
      );
    } else {
      console.error("Adobe DC View SDK is not available.");
    }
  };

  return (
    <div id="adobe-dc-view" style={{ width: "100%", height: "750px" }}></div>
  );
};




const PdfViewerComponentDesktop = ({
  pdfData,
  adobeDCClientId,
  selectedDate,
}) => {
  useEffect(() => {
    if (pdfData) {
      initializeAdobeDCView(pdfData);
    }
  }, [pdfData]);

  const initializeAdobeDCView = (pdfDataUrl) => {
    if (window.AdobeDC) {
      const adobeDCView = new window.AdobeDC.View({
        clientId: adobeDCClientId,
        divId: "adobe-dc-view",
      });

      const pdfName = `${selectedDate}.pdf`; // Use the selected date as the filename

      const metaData = { fileName: pdfName };

      adobeDCView.previewFile(
        {
          content: { location: { url: pdfDataUrl } },
          metaData: metaData,
        },
        {
          showAnnotationTools: false,
          showDownloadPDF: false,
          showPrintPDF: false,
          defaultViewMode: "FIT_WIDTH",
        }
      );
    } else {
      console.error("Adobe DC View SDK is not available.");
    }
  };

  return (
    <div id="adobe-dc-view" style={{ width: "100%", height: "890px" }}></div>
  );
};
