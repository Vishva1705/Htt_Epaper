import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function HttAuth() {
  // Get the current location, which includes the search query string
  const location = useLocation();
  const navigate = useNavigate();


  useEffect(() => {
    // Function to parse query string parameters
    function parseQueryString(queryString) {
      const params = new URLSearchParams(queryString);
      const formDataParam = params.get("formData");
      return formDataParam
        ? JSON.parse(decodeURIComponent(formDataParam))
        : null;
    }

    // Parse the query string and get the formData
    const formData = parseQueryString(location.search);
    // console.log(formData,"formData");

    if (formData !== null) {
      // Handle the formData here, for example, display it in the console
      // console.log("Received formData:");
      // Extract values from formData
      const { EmailId, Enddate,Startdate, editions,
        is_pdf_download, is_single_pdf_download, userid, username, } = formData;

      sessionStorage.setItem("EmailId", EmailId);
      sessionStorage.setItem("Enddate", Enddate);
      sessionStorage.setItem("Startdate", Startdate);
      sessionStorage.setItem("editions", editions);
      sessionStorage.setItem("is_pdf_download", is_pdf_download);
      sessionStorage.setItem("is_single_pdf_download", is_single_pdf_download);
      sessionStorage.setItem("userid", userid);
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("display", 1);
      
      navigate("/hindu_tamil_epaper_pdf_view");
    } else {
      console.log("No formData found in the URL.");
      navigate("/");
    }
  }, [location.search]);

  return <div></div>;
}

export default HttAuth;
