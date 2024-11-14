import React, { useState, useEffect, lazy, Suspense } from "react";
import axios from "axios";
import { format } from "date-fns";
import { PDFDocument, rgb } from "pdf-lib";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import hinduLogo from "../Assets/hindu-tamil-logo.png";
import HttLogoMobile from "../Assets/HttLogoMobile.png";
import "../Css/Home.css";
import "../Css/EpaperPrint.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { faAddressCard } from "@fortawesome/free-regular-svg-icons";
import CryptoJS from "crypto-js";


import Lottie from "lottie-react";
import School from "../Assets/school.json";
import Loading from "../Assets/loading.json";

// Import styles
import "@react-pdf-viewer/zoom/lib/styles/index.css";

const HttEpaperPrint = () => {
  const selectedRawEdition = sessionStorage.getItem("edition");
  const userMarkid = sessionStorage.getItem("EmailId");
  const endDate = sessionStorage.getItem("Enddate");
  const startDate = sessionStorage.getItem("Startdate");
  const edition = sessionStorage.getItem("editions");
  const isPdfDownload = sessionStorage.getItem("is_pdf_download");
  const isSinglePdfDownload = sessionStorage.getItem("is_single_pdf_download");
  const userId = sessionStorage.getItem("userid");
  const username = sessionStorage.getItem("username");
  const display = sessionStorage.getItem("display");

  const conditionToDisplay = display === "1";

  const [loadingPdf, setLoadingPdf] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const selectedDateObj = new Date(selectedDate);
  const day = selectedDateObj.getDate().toString().padStart(2, "0");
  const month = (selectedDateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = selectedDateObj.getFullYear().toString();
  const formattedDate = `${day}-${month}-${year}`;

  const [subfolders, setSubfolders] = useState([]);

  const [product, setProduct] = useState("HinduTamilThisai");
  const [editions, setEditions] = useState([]);

  const [selectedEdition, setSelectedEdition] = useState("Chennai");

  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfNotFound, setPdfNotFound] = useState(false);



  const [pageCount, setPageCount] = useState();
  

  const [displayedNumber, setDisplayedNumber] = useState("1");

  const [pdfSingleUrl, setPdfSingleUrl] = useState(null);

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_IPCONFIG,
  });

  const [currentImage, setCurrentImage] = useState(1);

  const handleViewClick = (imageNumber) => {
    setCurrentImage(imageNumber);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedEdition("Chennai");
    setProduct("HinduTamilThisai");
    setDisplayedNumber("1")
  };

  function handleHome() {
    navigate("/");
  }

  const handleProductChange = (event) => {
    const selectedProduct = event.target.value;
    setProduct(selectedProduct);
    setSelectedEdition("");
    setDisplayedNumber("1");
    // Reset selected edition when product changes

    // Check if the selected product is 'Vetrikkodi' and open website in new tab
    if (selectedProduct === "Vetrikkodi") {
      window.open("https://vetrikkodi.hindutamil.in/epaper", "_blank");
      setProduct("HinduTamilThisai");
    } else if (selectedProduct === "Supplementary") {
      setSelectedEdition(editions[0]);
    } else {
      setSelectedEdition(editions[0]);
    }
  };

  const navigate = useNavigate();
  const handleLogoButton = () => {
    navigate("/");
  };

  const handleEditionChange = (event) => {
    const selectedEditionValue = event.target.value;
    setSelectedEdition(
      selectedEditionValue !== "" ? selectedEditionValue : editions[0]
    );
    setDisplayedNumber("1");
  };

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
        })
        .catch((error) => {
          console.error("Error fetching edition filenames:", error);
        });
    }
  };

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
    fetchEditions();
  }, [formattedDate, product, selectedEdition]);

  useEffect(() => {
    fetchPageCount();
  }, [formattedDate, product, selectedEdition]);

  const fetchSinglePdf = () => {
    axiosInstance
      .get("/api/htt/singlepdf", {
        params: {
          date: formattedDate,
          product: product,
          edition: selectedEdition,
          pagenumber: displayedNumber,
        },
        responseType: "blob",
      })
      .then((response) => {
        if (response.data.size === 0) {
          setPdfNotFound(true);
        } else {
          setPdfNotFound(false);
          const pdfBlob = new Blob([response.data], {
            type: "application/pdf",
          });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          setPdfSingleUrl(pdfUrl);
        }
      })
      .catch((error) => {
        console.error(error);
        setPdfNotFound(true);
      });
  };

  useEffect(() => {
    fetchSinglePdf();
  }, [formattedDate, product, selectedEdition,displayedNumber]);

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
      link.download = "watermarked_pdf.pdf";
      link.click();
    } catch (error) {
      console.error(error);
      setPdfNotFound(true);
    }
  };

  const adobeDCClientId = "7b8a1ac8762e477381f0b044f6915d05";
  //const adobeDCClientId ="9424640667014d008e111f0e2e7c9c1f";

  useEffect(() => {
    fetchPdf();
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

  const pageCounts = pageCount;
  const handlePageButtonClick = (number) => {
    setDisplayedNumber(number);
  };

  const buttons = [];

  for (let i = 1; i <= pageCounts; i++) {
    buttons.push(
      <button key={i} onClick={() => handlePageButtonClick(i)}>
        {i}
      </button>
    );
  }

  return (
    <>
      {/* {conditionToDisplay ? ( */}
      <>
        <div className="header">
          <div className="header-Image">
            <img
              src={hinduLogo}
              alt="Hindu Tamil Thisai Logo"
              className="logo"
              onClick={handleLogoButton}
            />
          </div>
          <div className="epaper">
            இ-பேப்பர்
            {/* <div>
              <FontAwesomeIcon icon={faAddressCard} />
            </div> */}
          </div>
        </div>
        <div>
          <div className="inputBox">
            <div className="date-picker">
              <div className="input-heading">
                <div className="Htt-Date">நாள்:</div>
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="date-inputs"
              />

              <div className="product">
                <div className="input-heading">
                  <div className="Htt-Date">இதழ்:</div>
                </div>
                <div className="input-body">
                  <select value={product} onChange={handleProductChange}>
                    {subfolders.map((subfolder) => (
                      <option key={subfolder} value={subfolder}>
                        {subfolder}
                      </option>
                    ))}
                    {/* <option value="Vetrikkodi">Vetrikkodi</option> */}
                  </select>
                </div>
              </div>
            </div>

            <div className="dashboardBox">
              <div className="edition">
                <div className="input-heading">
                  <div className="Htt-Date">பதிப்பு:</div>
                </div>
                <div className="input-body">
                  <select
                    id="edition"
                    value={selectedEdition}
                    onChange={handleEditionChange}
                  >
                    {editions.map((edition) => (
                      <option key={edition} value={edition}>
                        {edition}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="viewButton">
                  <button
                    onClick={() => handleViewClick(1)}
                    className={currentImage === 1 ? "actives" : "inactives"}
                  >
                    Single Page
                  </button>
                  <button
                    onClick={() => handleViewClick(2)}
                    className={currentImage === 2 ? "actives" : "inactives"}
                  >
                    Full Page
                  </button>
                </div>
              </div>
            </div>

            <div>
              {pdfNotFound ? (
                <p>பக்கங்கள் விரைவில் வரும் </p>
              ) : isPdfDownload === "1" ? (
                <div className="Download" onClick={handleDownloadClick}>
                  <FontAwesomeIcon icon={faDownload} size="xl" />
                </div>
              ) : null}
            </div>
          </div>

          {/* <div>
            {pdfNotFound ? (
            <p>Selected date PDF is not available for the selected edition.</p>
            ) : (
            <Suspense fallback={<div>Loading PDF...</div>}>
              {pdfUrl && <LazyLoadedPDF pdfUrl={pdfUrl} />}
            </Suspense>
            )}
            </div> */}

          {/* <div>
              {pdfNotFound ? (
                <p>
                  Selected date PDF is not available for the selected edition.
                </p>
              ) : (
                // <Suspense fallback={<div>Loading PDF...</div>}>
                //   {pdfUrl && (
                //     <Worker
                //       workerUrl={`https://unpkg.com/pdfjs-dist@${"^3.9.179"}/build/pdf.worker.min.js`}
                //     >
                //       <Viewer
                //         fileUrl={pdfUrl}
                //         plugins={[defaultLayoutPluginInstance]}
                //       />
                //     </Worker>
                //   )}
                // </Suspense>

                <Suspense fallback={<div>Loading PDF Viewer...</div>}>
                  <PdfViewerComponent
                    pdfData={pdfUrl}
                    adobeDCClientId={adobeDCClientId}
                    selectedDate={formattedDate}
                  />
                </Suspense>
              )}
            </div> */}

          {loadingPdf ? (
            <center>
              <div>
                <Lottie
                  animationData={Loading}
                  loop={true}
                  className="School_animate"
                />

                
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
               
                pdf not found on selcetd date please choose another Date 
              </>
            </center>
          ) : (
            <div>
              {currentImage === 2 && (
                <Suspense fallback={<div>Loading PDF Viewer...</div>}>
                  <PdfViewerComponent
                    pdfData={pdfUrl}
                    adobeDCClientId={adobeDCClientId}
                    selectedDate={selectedDate}
                  />
                </Suspense>
                // <embed
                //   src={pdfUrl}
                //   type="application/pdf"
                //   height={800}
                //   width={1500}
                // ></embed>
              )}
              {currentImage === 1 && (
                <div>
                  <div>{buttons}</div>
                  
                  <Suspense fallback={<div>Loading PDF Viewer...</div>}>
                    <PdfViewerComponent
                      pdfData={pdfSingleUrl}
                      adobeDCClientId={adobeDCClientId}
                      selectedDate={selectedDate}
                    />
                  </Suspense>
                  
                  {/* <embed
                    src={pdfSingleUrl}
                    type="application/pdf"
                    height={800}
                    width={1500}
                  ></embed> */}
                </div>
              )}
            </div>
          )}
        </div>
      </>
      {/* ) : handleHome()} */}
    </>
  );
};

export default HttEpaperPrint;

const PdfViewerComponent = ({ pdfData, adobeDCClientId, formattedDate }) => {
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

      const pdfName = `${formattedDate}.pdf`; // Use the selected date as the filename

      const metaData = { fileName: pdfName };

      adobeDCView.previewFile(
        {
          content: { location: { url: pdfDataUrl } },

          metaData: metaData,
        },

        {
          defaultViewMode: "FIT_WIDTH",
          showAnnotationTools: false,
          showDownloadPDF: false,
          showPrintPDF: false,
        }
      );
    } else {
      console.error("Adobe DC View SDK is not available.");
    }
  };

  return (
    <div id="adobe-dc-view" style={{ width: "100%", height: "800px" }}></div>
  );
};
