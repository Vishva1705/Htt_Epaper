import React, { useState, useEffect, lazy, Suspense } from "react";
import axios from "axios";
import { format } from "date-fns";
import { PDFDocument, rgb } from "pdf-lib";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "../Css/Home.css";
import "../Css/EpaperPrint.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import {
  faNewspaper,
  faFilePdf,
  fa,
} from "@fortawesome/free-regular-svg-icons";
import { GrLocation } from "react-icons/gr";
import CryptoJS from "crypto-js";

import Lottie from "lottie-react";

import School from "../Assets/school.json";
import Loading from "../Assets/loading.json";

// Import styles
import "@react-pdf-viewer/zoom/lib/styles/index.css";

const FullPage = () => {
  const selectedRawEdition = sessionStorage.getItem("edition");
  const userMarkid = sessionStorage.getItem("EmailId");
  const endDateString = sessionStorage.getItem("Enddate");

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

      // Compare the end date with the current date
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
  const username = sessionStorage.getItem("username");
  const display = sessionStorage.getItem("display");
  const sessionDate = sessionStorage.getItem("date");
  const message = sessionStorage.getItem("Subscribe");

  const conditionToDisplay = display === "1";

  const [loadingPdf, setLoadingPdf] = useState(false);

  const [selectedDate, setSelectedDate] = useState(sessionDate);

  const selectedDateObj = new Date(selectedDate);
  const day = selectedDateObj.getDate().toString().padStart(2, "0");
  const month = (selectedDateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = selectedDateObj.getFullYear().toString();
  const formattedDate = `${day}-${month}-${year}`;
  const reformattedDate = `${month}-${day}-${year}`;

  const editionMapping = {
    Thiruvananthapuram: "Kanyakumari",
    // Add other mappings as needed
  };

  // console.log(formattedDate, "formated date");

  const [subfolders, setSubfolders] = useState([]);
  // console.log("subfolders:", subfolders);

  const [product, setProduct] = useState("HinduTamilThisai");

  const [editions, setEditions] = useState([]);

  const [selectedEdition, setSelectedEdition] = useState(
    selectedRawEdition || "Chennai"
  );

  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfNotFound, setPdfNotFound] = useState(false);

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_IPCONFIG,
  });

  const handleDateChange = (event) => {
    const newSelectedDate = event.target.value;
    // console.log("newSelectedDate:" + newSelectedDate);
    sessionStorage.setItem("date", newSelectedDate);

    if (newSelectedDate <= "2023-10-31") {
      // Use navigate with query parameter
      navigate(`/hindu_tamil_epaper?selectedDate=${newSelectedDate}`);
    } else {
      setSelectedDate(event.target.value);
      setSelectedEdition(selectedRawEdition);
      setProduct("HinduTamilThisai");
      sessionStorage.setItem("date", newSelectedDate);
    }
  };

  function handleHome() {
    navigate("/");
  }

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
      handleHome();
    }
  }

  const handleProductChange = (event) => {
    const selectedProduct = event.target.value;

    axiosInstance
      .get(
        `/htt/getEditionFilenames?date=${formattedDate}&product=${selectedProduct}`
      )
      .then((response) => {
        const newEditions = response.data;
        // console.log("Fetched editions:", newEditions);
        setEditions(newEditions);

        // If the selectedEdition is not present in the newEditions, update it
        if (!newEditions.includes(selectedEdition)) {
          setSelectedEdition(newEditions[0]);
          sessionStorage.setItem("edition", newEditions[0]);
        }
        setProduct(selectedProduct);
      })
      .catch((error) => {
        console.error("Error fetching edition filenames:", error);
      });
  };

  useEffect(() => {
    if (editions.length > 0) {
      // console.log("Setting selected edition:", editions[0]);
      setSelectedEdition(editions[0]);
      sessionStorage.setItem("edition", editions[0]);
    }
  }, [editions]);

  useEffect(() => {
    // Fetch PDF or perform other actions when selected edition changes
    // console.log("Fetching PDF with selected edition:", selectedEdition);
    fetchPdf();
  }, [selectedEdition]);

  const navigate = useNavigate();
  const handleLogoButton = () => {
    navigate("/");
  };

  const handleEditionChange = (event) => {
    const selectedEditionValue = event.target.value;
    sessionStorage.setItem("edition", selectedEditionValue);
    setSelectedEdition(
      selectedEditionValue !== "" ? selectedEditionValue : editions[0]
    );
  };

  useEffect(() => {
    //fetching product names
    if (formattedDate) {
      axiosInstance
        .get(`/htt/fetchProductFolders?date=${formattedDate}`)
        .then((response) => {
          setSubfolders(response.data);
          // console.log(response.data);
        })
        .catch((error) => {
          console.error("Error fetching subfolders:", error);
        });
    }
  }, [formattedDate]);

  //fetching the edition names
  const fetchEditions = () => {
    if (formattedDate && product) {
      axiosInstance
        .get(
          `/htt/getEditionFilenames?date=${formattedDate}&product=${product}`
        )
        .then((response) => {
          setEditions(response.data);
          // console.log(response.data);
        })
        .catch((error) => {
          console.error("Error fetching edition filenames:", error);
        });
    }
  };

  useEffect(() => {
    fetchEditions();
    // navigate(`/hindu_tamil_epaper_pdf_view?view=multipleview&date=${formattedDate}&product=${product}&edition=${selectedEdition}`)
  }, [formattedDate, product]);

  useEffect(() => {
    if (display !== "1" && message !== "1") {
      // Navigate to "/"
      navigate("/hindu_tamil_epaper_pdf_view");
    } else if (display === "1" && message !== "1") {
      handleSubscription();
    } else if (display === "1" && message !== "1") {
      fetchEditions();
    }
  }, [formattedDate, product, selectedEdition]);

  const fetchPdf = async () => {
    setLoadingPdf(true);

    try {
      const response = await axiosInstance.get("/api/htt/newPdf", {
        params: {
          date: formattedDate,
          product: product,
          edition: selectedEdition,
        },
        responseType: "blob",
      });

      if (response.data.size === 0) {
        setPdfNotFound(true);
        setPdfUrl(null); // Reset pdfUrl to null when PDF is not found
        setLoadingPdf(false);
        return;
      }

      setPdfNotFound(false);

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });

      const pdfData = await pdfBlob.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfData);
      const pages = pdfDoc.getPages();

      const watermarkText = userMarkid;
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        // Draw watermark at the top
        page.drawText(userId, {
          x: width / 1.7,
          y: height - 7,
          size: 8,
          color: rgb(0.2, 0.2, 0.2),
        });

        // Draw watermark at the bottom
        page.drawText(watermarkText, {
          x: width / 3,
          y: height / 3,
          size: 30,
          color: rgb(0.7, 0.7, 0.7),
          opacity: 0.5,
        });

        // Draw watermark at the top
        page.drawText(userId, {
          x: width / 35,
          y: height / 190,
          size: 5,
          color: rgb(1, 1, 1),
        });
      });

      const modifiedPdfBytes = await pdfDoc.save();

      const modifiedPdfBlob = new Blob([modifiedPdfBytes], {
        type: "application/pdf",
      });

      const pdfUrl = URL.createObjectURL(modifiedPdfBlob);
      setPdfUrl(pdfUrl);
    } catch (error) {
      console.error(error);
      setPdfNotFound(true);
      setPdfUrl(null); // Reset pdfUrl to null when PDF is not found
    } finally {
      setLoadingPdf(false);
    }
  };

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [],
    toolbarPlugin: () => [],
  });

  const handleDownloadClick = async () => {
    alert(
      "The PDF file is intended for personal use exclusively. Any attempt to transfer or share the files on social media groups may result in legal consequences."
    );
    try {
      const response = await axiosInstance.get("/api/htt/newPdf", {
        params: {
          date: formattedDate,
          product: product,
          edition: selectedEdition,
        },
        responseType: "arraybuffer",
      });

      if (response.data.byteLength === 0) {
        setPdfNotFound(true);
        return;
      }

      setPdfNotFound(false);

      const pdfDoc = await PDFDocument.load(response.data);
      const pages = pdfDoc.getPages();

      const watermarkText = userMarkid;
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        // Draw watermark at the top
        page.drawText(userId, {
          x: width / 1.7,
          y: height - 7,
          size: 8,
          color: rgb(0.2, 0.2, 0.2),
        });

        // Draw watermark at the bottom
        page.drawText(watermarkText, {
          x: width / 3,
          y: height / 3,
          size: 30,
          color: rgb(0.7, 0.7, 0.7),
          opacity: 0.5,
        });

        // Draw watermark at the top
        page.drawText(userId, {
          x: width / 35,
          y: height / 190,
          size: 5,
          color: rgb(1, 1, 1),
        });
      });

      const pdfBytes = await pdfDoc.save();

      const pdfBlob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(pdfBlob);
      link.download = `${selectedDate}_${selectedEdition}`;
      link.click();
    } catch (error) {
      console.error(error);
      setPdfNotFound(true);
    }
  };

  //const adobeDCClientId = "9424640667014d008e111f0e2e7c9c1f";
  const adobeDCClientId = "7b8a1ac8762e477381f0b044f6915d05";

  useEffect(() => {
    fetchPdf();
    navigate(
      `/hindu_tamil_epaper_pdf_view?view=multipleview&date=${formattedDate}&product=${product}&edition=${selectedEdition}`
    );
  }, [formattedDate, product, selectedEdition]);

  // Lazy-loaded PDF component defined inside the Epaper component
  const LazyLoadedPDF = lazy(() => {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve({
            default: ({ pdfUrl }) => (
              <embed
                src={pdfUrl}
                type="application/pdf"
                width="100%"
                height="900px"
              />
            ),
          }),
        1000
      );
    });
  });

  return (
    <>
      {display === "1" && message === "1" && (
        <>
          <div>
            <div className="Input_Holder">
              <div className="Each_Product">
                {/* <span className="iconContent"><FontAwesomeIcon icon={faCalendarTimes} /></span> */}
                <input
                  type="date"
                  className="datepicker"
                  value={selectedDate}
                  onChange={handleDateChange}
                  max={format(new Date(), "yyyy-MM-dd")}
                />
              </div>

              {subfolders.length > 1 && (
                <div className="Each_Product">
                  <span className="iconContent">
                    <FontAwesomeIcon icon={faNewspaper} />
                  </span>
                  <select value={product} onChange={handleProductChange}>
                    {subfolders.map((subfolder) => (
                      <option key={subfolder} value={subfolder}>
                        {subfolder}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="Each_Product">
                <span className="iconContent">
                  {" "}
                  <GrLocation />{" "}
                </span>
                <select
                  id="edition"
                  value={selectedEdition}
                  onChange={handleEditionChange}
                >
                  {editions.map((edition) => (
                    <option key={edition} value={edition}>
                      {editionMapping[edition] || edition}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              {pdfNotFound ? (
                <p>பக்கங்கள் விரைவில் வரும் </p>
              ) : isPdfDownload === "1" ? (
                <div className="Download" onClick={handleDownloadClick}>
                  <FontAwesomeIcon icon={faDownload} size="xl" />
                  <span class="tooltiptext">Click to Download</span>
                </div>
              ) : null}
            </div>

            <div>
              {loadingPdf ? (
                <center>
                  <div>
                    <Lottie
                      animationData={Loading}
                      loop={true}
                      className="School_animate"
                    />
                    <h3>
                      பக்கங்கள் வரும் வரை சற்று பொறுமையாக இருக்க வேண்டுகிறோம்...
                    </h3>
                  </div>
                </center>
              ) : pdfNotFound ? (
                <center>
                  <>
                    <Lottie
                      animationData={School}
                      loop={true}
                      className="School_animate"
                    />
                    <h3>
                      தேர்ந்த தேதியில் PDF கிடைக்கவில்லை, மற்றொரு தேதியை
                      தேர்ந்தெடுக்கவும்.
                    </h3>
                  </>
                </center>
              ) : (
                <div>
                  <div>
                    <Suspense fallback={<div>Loading PDF Viewer...</div>}>
                      {window.innerWidth <= 768 ? (
                        <PdfViewerComponentMobile
                          pdfData={pdfUrl}
                          adobeDCClientId={adobeDCClientId}
                          selectedDate={`${selectedDate}_${selectedEdition}`}
                        />
                      ) : (
                        <PdfViewerComponentDesktop
                          pdfData={pdfUrl}
                          adobeDCClientId={adobeDCClientId}
                          selectedDate={`${selectedDate}_${selectedEdition}`}
                        />
                      )}
                    </Suspense>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FullPage;

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
          
          showAnnotationTools: false,
          showDownloadPDF: false,
          showPrintPDF: false,
          defaultViewMode: "CONTINUOUS",
        }
      );
    } else {
      console.error("Adobe DC View SDK is not available.");
    }
  };

  return (
    <div id="adobe-dc-view" style={{ width: "100%", height: "830px" }}></div>
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
    <div id="adobe-dc-view" style={{ width: "100%", height: "830px" }}></div>
  );
};