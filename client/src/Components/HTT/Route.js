import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HttEpaper from "./JS/HttEpaper";
import HttPrint from "./JS/HttEpaperPrint";
import HttLoginPage from "./JS/HttLoginPage";

function RouteComponent() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/htt" element={<HttEpaper />} />
          <Route path="/httLoginPage" element={<HttLoginPage />} />
          <Route path="/httprint" element={<HttPrint />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default RouteComponent;
