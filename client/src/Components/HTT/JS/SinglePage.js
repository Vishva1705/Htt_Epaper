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
import "../Css/Commonpage.css";
import { useNavigate } from "react-router-dom";
import ReactGA from "react-ga";

//----------icons-----------//
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import {
  faNewspaper,
  faFilePdf,
  faLoca,
} from "@fortawesome/free-regular-svg-icons";
import { RxDropdownMenu } from "react-icons/rx";
import { GrLocation } from "react-icons/gr";

import CryptoJS from "crypto-js";

import Lottie from "lottie-react";
import School from "../Assets/school.json";
import Loading from "../Assets/loading.json";

// Import styles
import "@react-pdf-viewer/zoom/lib/styles/index.css";

const SinglePage = () => {
  const sessionDate = sessionStorage.getItem("date");
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
  const message = sessionStorage.getItem("Subscribe");

  const editionMapping = {
    Thiruvananthapuram: "Kanyakumari",
    // Add other mappings as needed
  };

  // const conditionToDisplay = display === "1" && isSinglePdfDownload === "1";

  const [loadingPdf, setLoadingPdf] = useState(false);

  const [selectedDate, setSelectedDate] = useState(sessionDate);
  // console.log("selectedDate",selectedDate);

  const selectedDateObj = new Date(selectedDate);
  const day = selectedDateObj.getDate().toString().padStart(2, "0");
  const month = (selectedDateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = selectedDateObj.getFullYear().toString();
  const formattedDate = `${day}-${month}-${year}`;

  // console.log(formattedDate, "formated date");

  const [subfolders, setSubfolders] = useState([]);

  const [product, setProduct] = useState("HinduTamilThisai");
  const [editions, setEditions] = useState([]);
  // console.log(editions[0]);

  const [selectedEdition, setSelectedEdition] = useState(
    selectedRawEdition || "Chennai"
  );

  const [pdfNotFound, setPdfNotFound] = useState(false);

  const [pageCount, setPageCount] = useState();

  const [displayedNumber, setDisplayedNumber] = useState("1");
  // console.log("displayedNumber:",displayedNumber);

  const [pdfSingleUrl, setPdfSingleUrl] = useState(null);

  const [productDropdownVisible, setProductDropdownVisible] = useState(false);
  const [editionDropdownVisible, setEditionDropdownVisible] = useState(false);

  const toggleProductDropdown = () => {
    setProductDropdownVisible(!productDropdownVisible);
  };

  const toggleEditionDropdown = () => {
    setEditionDropdownVisible(!editionDropdownVisible);
  };

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_IPCONFIG,
  });

  const [currentImage, setCurrentImage] = useState(1);

  const handleViewClick = (imageNumber) => {
    setCurrentImage(imageNumber);
  };

  const handleDateChange = (event) => {
    const newSelectedDate = event.target.value;
    // console.log("newSelectedDate:" + newSelectedDate);
    sessionStorage.setItem("date", newSelectedDate);

    if (newSelectedDate <= "2023-10-31") {
      // Use navigate with query parameter
      navigate(`/hindu_tamil_epaper_view?selectedDate=${newSelectedDate}`);
    } else {
      setSelectedDate(newSelectedDate);
      setSelectedEdition(selectedRawEdition);
      setProduct("HinduTamilThisai");
      setDisplayedNumber("1");
      setActivePage(1);
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
    setProduct(selectedProduct);
    setSelectedEdition(editions[0]);
    setDisplayedNumber("1");
  };

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
    setDisplayedNumber("1");
  };
  useEffect(() => {
    if (editions.length > 0) {
      // console.log("Setting selected edition:", editions[0]);
      setSelectedEdition(editions[0]);
      sessionStorage.setItem("edition", editions[0]);
    }
  }, [editions]);

  useEffect(() => {
    // Track a pageview when the component mounts
    ReactGA.pageview(window.location.pathname + window.location.search);

    // Track an event
    ReactGA.event({
      category: "singlePage_view",
      action: "singlePage_view",
      label: "My Button",
    });

    // You can add more tracking as needed
  }, []);

  useEffect(() => {
    //fetching product names
    if (formattedDate) {
      axiosInstance
        .get(`/htt/fetchProductFolders?date=${formattedDate}`)
        .then((response) => {
          setSubfolders(response.data);
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
    if (display !== "1" && message !== "1") {
      // Navigate to "/"
      navigate("/");
    } else if (display === "1" && message !== "1") {
      handleSubscription();
    } else if (display === "1" && message === "1") {
      fetchEditions();
    }
  }, [formattedDate, product]);

  const fetchPageCount = () => {
    if (formattedDate && product) {
      axiosInstance
        .get(
          `/api/files/count?date=${formattedDate}&product=${product}&edition=${selectedEdition}`
        )
        .then((response) => {
          setPageCount(response.data.count);
          // console.log(response.data.count);
        })
        .catch((error) => {
          console.error("Error fetching edition filenames:", error);
        });
    }
  };

  useEffect(() => {
    fetchPageCount();
  }, [formattedDate, product, selectedEdition]);

  const fetchSinglePdf = async () => {
    setLoadingPdf(true);

    try {
      const response = await axiosInstance.get("/api/htt/singlepdf", {
        params: {
          date: formattedDate,
          product: product,
          edition: selectedEdition,
          pagenumber: displayedNumber,
        },
        responseType: "blob",
      });

      if (response.data.size === 0) {
        setPdfNotFound(true);
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
      // console.log("pdfUrl",pdfUrl);
      setPdfSingleUrl(pdfUrl);
    } catch (error) {
      console.error(error);
      setPdfNotFound(true);
    } finally {
      setLoadingPdf(false);
    }
  };

  useEffect(() => {
    fetchSinglePdf();
    navigate(
      `/hindu_tamil_epaper_pdf_view?view=singleview&date=${formattedDate}&product=${product}&edition=${selectedEdition}&pagenumber=${displayedNumber}`
    );
  }, [formattedDate, product, selectedEdition, displayedNumber]);

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [],
    toolbarPlugin: () => [],
  });

  const handleDownloadClick = async () => {
    alert(
      "The PDF file is intended for personal use exclusively. Any attempt to transfer or share the files on social media groups may result in legal consequences."
    );
    try {
      const response = await axiosInstance.get("/api/htt/singlepdf", {
        params: {
          date: formattedDate,
          product: product,
          edition: selectedEdition,
          pagenumber: displayedNumber,
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
      link.download = `${selectedDate}_${selectedEdition}_pg${displayedNumber}`;
      link.click();
    } catch (error) {
      console.error(error);
      setPdfNotFound(true);
    }
  };

  //const adobeDCClientId = "9424640667014d008e111f0e2e7c9c1f";
  const adobeDCClientId = "7b8a1ac8762e477381f0b044f6915d05";

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

  const pageCounts = pageCount;
  const handlePageButtonClick = (number) => {
    setDisplayedNumber(number);
  };

  const [activePage, setActivePage] = useState(1);
  const buttons = [];

  for (let i = 1; i <= pageCounts; i++) {
    buttons.push(
      <button
        className={`Button_page ${activePage === i ? "active" : ""}`}
        key={i}
        onClick={() => {
          handlePageButtonClick(i);
          setActivePage(i);
        }}
      >
        {i}
      </button>
    );
  }

  const [bubbleDisplay, setBubbleDisplay] = useState(0);
  const [bubbleActive, setBubbleActive] = useState(false);
  const [bubbleClose, setBubbleClose] = useState(true);

  const bubbleActiveClick = () => {
    setBubbleActive(true);
    setBubbleClose(false);
    setBubbleDisplay(1);
  };

  const bubbleCloseClick = () => {
    setBubbleActive(false);
    setBubbleClose(true);
    setBubbleDisplay(0);
  };

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
                  max={format(new Date(), "yyyy-MM-dd")}
                  onChange={handleDateChange}
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
              ) : isSinglePdfDownload === "1" ? (
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
                    பக்கங்கள் வரும் வரை சற்று பொறுமையாக இருக்க வேண்டுகிறோம்...
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
                    <div className="Pagebuttons">
                      {bubbleDisplay === 0 ? (
                        <div onClick={bubbleActiveClick} className="bubble">
                          Pages
                        </div>
                      ) : (
                        <div onClick={bubbleCloseClick} className="bubble">
                          X
                        </div>
                      )}
                      <div
                        className={`ButtonContainer ${
                          bubbleActive ? "active" : ""
                        }`}
                      >
                        <div className="bubbleButtons">{buttons}</div>
                      </div>
                    </div>

                    <Suspense fallback={<div>Loading PDF Viewer...</div>}>
                      {window.innerWidth <= 768 ? (
                        <PdfViewerComponentMobile
                          pdfData={pdfSingleUrl}
                          adobeDCClientId={adobeDCClientId}
                          selectedDate={`${selectedDate}_${selectedEdition}`}
                        />
                      ) : (
                        <PdfViewerComponentDesktop
                          pdfData={pdfSingleUrl}
                          adobeDCClientId={adobeDCClientId}
                          selectedDate={`${selectedDate}_${selectedEdition}`}
                        />
                      )}
                    </Suspense>

                    {/* <Suspense fallback={<div>Loading PDF...</div>}>
                    {pdfSingleUrl && (
                    <Worker
                      workerUrl={`https://unpkg.com/pdfjs-dist@${"^3.9.179"}/build/pdf.worker.min.js`}
                    >
                      <Viewer
                        fileUrl={pdfSingleUrl}
                        plugins={[defaultLayoutPluginInstance]}
                      />
                    </Worker>
                  )}
                </Suspense> */}
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

export default SinglePage;

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
    <div id="adobe-dc-view" style={{ width: "100%", height: "830px" }}></div>
  );
};
