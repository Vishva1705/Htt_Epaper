import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { format } from "date-fns";
import "./Upload.css";

export default function Upload() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    // Check if the entered username and password are correct
    if (username === "HTT upload" && password === "epaper-pdf-upload-2023") {
      setLoggedIn(true);
    } else {
      alert("Invalid username or password. Please try again.");
    }
  };

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_IPCONFIG,
  });

  const [activeTab, setActiveTab] = useState("multipleView");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  console.log("selectedDate", selectedDate);

  const [selectedProduct, setSelectedProduct] = useState("HinduTamilThisai");
  console.log("selectedProduct", selectedProduct);
  const [selectedRegion, setSelectedRegion] = useState("Chennai");
  console.log("selectedRegion", selectedRegion);
  const [pagenumber, setPagenumber] = useState(1);
  console.log("pagenumber", pagenumber);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
  };

  const handlePagenumber = (e) => {
    setPagenumber(Number(e.target.value));
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };


  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("pdfFile", selectedFile);

      const formattedDate = format(new Date(selectedDate), "dd-MM-yyyy");

      const queryParams = `?date=${formattedDate}&product=${selectedProduct}&edition=${selectedRegion}`;

      await axios.post(
        `${process.env.REACT_APP_IPCONFIG}multiplepdfupload${queryParams}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file. Please try again.");
    }
  };



  const handlesingleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("pdfFile", selectedFile);

      const formattedDate = format(new Date(selectedDate), "dd-MM-yyyy");
      console.log("formattedDate single :", formattedDate);
      const queryParams = `?date=${formattedDate}&product=${selectedProduct}&edition=${selectedRegion}&pagenumber=${pagenumber}`;

      const response = await axios.post(
        `${process.env.REACT_APP_IPCONFIG}singlepdfupload${queryParams}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedUrl = response.data;
      console.log("File uploaded successfully. URL:", uploadedUrl);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file. Please try again.");
    }
  };



  const handleImageUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('imageFile', selectedFile);

      const formattedDate = format(new Date(selectedDate), "dd-MM-yyyy");
      console.log("formattedDate single :", formattedDate);

      const response = await axios.post(
        `${process.env.REACT_APP_IPCONFIG}thumbnailpngupload?date=${formattedDate}&edition=${selectedRegion}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Image uploaded successfully. URL:', response.data);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };





  return (
    <>
      <div className={`uploadContainer ${loggedIn ? "loggedIn" : ""}`}>
        {loggedIn ? (
          <div className="uploadContainer">
            <div className="btncontainer">
              <button
                className={`upload-btn ${
                  activeTab === "multipleView" ? "active-btn" : "inactive-btn"
                }`}
                onClick={() => handleTabChange("multipleView")}
              >
                MultipleView
              </button>

              <button
                className={`upload-btn ${
                  activeTab === "singleView" ? "active-btn" : "inactive-btn"
                }`}
                onClick={() => handleTabChange("singleView")}
              >
                SingleView
              </button>

              <button
                className={`upload-btn ${
                  activeTab === "ThumbnailImages"
                    ? "active-btn"
                    : "inactive-btn"
                }`}
                onClick={() => handleTabChange("ThumbnailImages")}
              >
                ThumbnailImages
              </button>
            </div>

            {activeTab === "multipleView" ? (
              <div className="Blob_Appupload">
                <div className="Blob_container">
                  <h1 className="title">Multiple pdf upload</h1>
                  <div className="form-container">
                    <input
                      type="date"
                      className="datePicker"
                      id="datePicker"
                      value={selectedDate}
                      onChange={handleDateChange}
                      max={format(new Date(), "yyyy-MM-dd")}
                    />

                    <select
                      value={selectedProduct}
                      onChange={handleProductChange}
                    >
                      <option value="HinduTamilThisai">HinduTamilThisai</option>
                      <option value="Supplementary">Supplementary</option>
                      <option value="Supplementary_1">Supplementary_1</option>
                      <option value="HinduTamilThisai_1">
                        HinduTamilThisai_1
                      </option>
                    </select>

                    <select
                      value={selectedRegion}
                      onChange={handleRegionChange}
                    >
                      <option value="Chennai">Chennai</option>
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Dharmapuri">Dharmapuri</option>
                      <option value="Kancheepuram">Kancheepuram</option>
                      <option value="Madurai">Madurai</option>
                      <option value="Puducherry">Puducherry</option>
                      <option value="Ramnad">Ramnad</option>
                      <option value="Salem">Salem</option>
                      <option value="Tanjavur">Tanjavur</option>
                      <option value="Thiruvananthapuram">
                        Thiruvananthapuram
                      </option>
                      <option value="Tiruchirapalli">Tiruchirapalli</option>
                      <option value="Tirunelveli">Tirunelveli</option>
                      <option value="Tirupur">Tirupur</option>
                      <option value="Vellore">Vellore</option>
                    </select>

                    <div className="file-input-container">
                      <label className="file-input">
                        Choose PDF File
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="actual-file-input"
                        />
                      </label>
                      {selectedFile && (
                        <div className={`selected-file appear`}>
                          Selected File: {selectedFile.name}
                        </div>
                      )}
                    </div>

                    <button className="upload-btn" onClick={handleUpload}>
                      Upload
                    </button>
                  </div>
                </div>
                <ToastContainer />
              </div>
            ) : activeTab === "singleView" ? (
              <div className="Blob_Appupload">
                <div className="Blob_container">
                  <h1 className="title">Single pdf upload</h1>
                  <div className="form-container">
                    <input
                      type="date"
                      className="datePicker"
                      id="datePicker"
                      value={selectedDate}
                      onChange={handleDateChange}
                      max={format(new Date(), "yyyy-MM-dd")}
                    />

                    <select
                      value={selectedProduct}
                      onChange={handleProductChange}
                    >
                      <option value="HinduTamilThisai">HinduTamilThisai</option>
                      <option value="Supplementary">Supplementary</option>
                      <option value="Supplementary_1">Supplementary_1</option>
                      <option value="HinduTamilThisai_1">
                        HinduTamilThisai_1
                      </option>
                    </select>

                    <select
                      value={selectedRegion}
                      onChange={handleRegionChange}
                    >
                      <option value="Chennai">Chennai</option>
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Dharmapuri">Dharmapuri</option>
                      <option value="Kancheepuram">Kancheepuram</option>
                      <option value="Madurai">Madurai</option>
                      <option value="Puducherry">Puducherry</option>
                      <option value="Ramnad">Ramnad</option>
                      <option value="Salem">Salem</option>
                      <option value="Tanjavur">Tanjavur</option>
                      <option value="Thiruvananthapuram">
                        Thiruvananthapuram
                      </option>
                      <option value="Tiruchirapalli">Tiruchirapalli</option>
                      <option value="Tirunelveli">Tirunelveli</option>
                      <option value="Tirupur">Tirupur</option>
                      <option value="Vellore">Vellore</option>
                    </select>

                    <input
                      className="datePicker"
                      type="number"
                      min="1"
                      value={pagenumber}
                      onChange={handlePagenumber}
                    />

                    <div className="file-input-container">
                      <label className="file-input">
                        Choose PDF File
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="actual-file-input"
                        />
                      </label>
                      {selectedFile && (
                        <div className={`selected-file appear`}>
                          Selected File: {selectedFile.name}
                        </div>
                      )}
                    </div>

                    <button className="upload-btn" onClick={handlesingleUpload}>
                      Upload
                    </button>
                  </div>
                </div>
                <ToastContainer />
              </div>
            ) : (
              // New code for ThumbnailImages
              <div className="Blob_Appupload">
                <div className="Blob_container">
                  <h1 className="title">Thumbnail Images upload</h1>
                  <div className="form-container">
                    <input
                      type="date"
                      className="datePicker"
                      id="datePicker"
                      value={selectedDate}
                      onChange={handleDateChange}
                      max={format(new Date(), "yyyy-MM-dd")}
                    />

                   

                    <select  value={selectedRegion}  onChange={handleRegionChange} >
                      <option value="Chennai">Chennai</option>
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Dharmapuri">Dharmapuri</option>
                      <option value="Kancheepuram">Kancheepuram</option>
                      <option value="Madurai">Madurai</option>
                      <option value="Puducherry">Puducherry</option>
                      <option value="Ramnad">Ramnad</option>
                      <option value="Salem">Salem</option>
                      <option value="Tanjavur">Tanjavur</option>
                      <option value="Thiruvananthapuram">
                        Thiruvananthapuram
                      </option>
                      <option value="Tiruchirapalli">Tiruchirapalli</option>
                      <option value="Tirunelveli">Tirunelveli</option>
                      <option value="Tirupur">Tirupur</option>
                      <option value="Vellore">Vellore</option>
                    </select>

                    <div className="file-input-container">
                      <label className="file-input">
                        Choose Png File
                        <input
                          type="file"
                          accept="image/png"
                          onChange={handleFileChange}
                          className="actual-file-input"
                        />
                      </label>
                      {selectedFile && (
                        <div className={`selected-file appear`}>
                          Selected File: {selectedFile.name}
                        </div>
                      )}
                    </div>

                    <button className="upload-btn" onClick={handleImageUpload}>
                      Upload
                    </button>
                  </div>
                </div>
                
                <ToastContainer />
              </div>
            )}
          </div>
        ) : (
          // Render the login form when not logged in
          <div className="authlogin-form ">
            <h1>Login</h1>
            <label className="labelblockpdf">
              Username:
              <input
                className="datePicker"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <br />
            <label className="labelblockpdf">
              Password:
              <input
                className="datePicker"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <br />
            <button className="upload-btn" onClick={handleLogin}>
              Login
            </button>
          </div>
        )}
      </div>
    </>
  );
}
