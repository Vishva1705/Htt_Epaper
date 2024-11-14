import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import DisableDevtool from 'disable-devtool';
import CombinedPaper from "./Components/HTT/JS/CombinedPaper";
// import FullPage from "./Components/HTT/JS/FullPage";
import HttAuth from "./Components/HTT/JS/HttAuth";
import HttEpaper from "./Components/HTT/JS/HttEpaper";
// import HttPrint from "./Components/HTT/JS/HttEpaperPrint";
import HttLoginPage from "./Components/HTT/JS/HttLoginPage";
import HttThumbnail from "./Components/HTT/JS/HttThumbnail";
// import SinglePage from "./Components/HTT/JS/SinglePage";
import OldEpaper from "./Components/HTT/JS/OldEpaper";
import TrackPage from "./Components/HTT/JS/TrackPage";
// import SingleTest from "./Components/HTT/JS/SingleTest";
import SingleUrl from "./Components/HTT/JS/SingleUrl";
import FullUrl from "./Components/HTT/JS/FullUrl";
import Upload from "./Components/Upload/Upload";
// import Sample from "./Components/HTT/JS/Sample";
import PageNotFound from "./Components/HTT/JS/Pagenotfound";
import GoogleAnalytics from "./GoogleAnalytics";
import Text2speech from "./Components/TextToSpeech/TextToSpeech";



function App() {

  DisableDevtool();
  
  return (
    <div className="App">

     <BrowserRouter>
     <Routes>
          <Route path="/" element={<HttEpaper />} />
          <Route path="/httLoginPage" element={<HttLoginPage />} />
          <Route path="/hindu_tamil_epaper_pdf_view" element={<CombinedPaper />} />
          <Route path="/hindu_tamil_epaper_view" element={<OldEpaper/>} />
          <Route path="/hindu_tamil_epaper_page_view" element={<HttThumbnail />} />
          <Route path="/httauth" element={<HttAuth />} />
          {/* <Route path="/FullPage" element={<FullPage />} /> */}
          {/* <Route path="/SinglePage" element={<SinglePage />} /> */}
          {/* <Route path="/SingleTest" element={<SingleTest />} /> */}
          <Route path="/SingleUrl" element={<SingleUrl />} />
          <Route path="/FullUrl" element={<FullUrl />} />
          {/* <Route path="/Sample" element={<Sample />} /> */}
          <Route path="/tract" element={<TrackPage />} />
          <Route path="/uploadpdf" element={<Upload />} />
          <Route path="/text2speech" element={<Text2speech />} />
          <Route exact path="*" element={<PageNotFound />}></Route>
     </Routes>
     </BrowserRouter>
     <GoogleAnalytics />
    </div>
  );
}

export default App;
