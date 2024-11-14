import React, { useState } from "react";
import { CgProfile } from "react-icons/cg";
import "../Css/HttProfile.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
 
const ProfilePopup = ({ onClose }) => {
  const name = sessionStorage.getItem("username");
  const startDate = sessionStorage.getItem("Startdate");
  const endDate = sessionStorage.getItem("Enddate");
  const email = sessionStorage.getItem("EmailId");
  const editions = sessionStorage.getItem("is_pdf_download");
  const active = editions === "1";
 
  const handleClear = () => {
    // Clear cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
 
    // Clear session storage
    sessionStorage.clear();
 
    // Use Promise.all to open logout URL and redirect simultaneously
    Promise.all([
      new Promise((resolve) => {
        // Open logout URL in a new window
        const popup = window.open("https://www.hindutamil.in/logout", "_blank");
        // Resolve the promise after a short delay (adjust as needed)
        setTimeout(() => {
          resolve(popup);
        }, 500);
      }),
      new Promise((resolve) => {
        // Redirect to the root ("/")
        window.location.href = '/';
        // Resolve the promise after a short delay (adjust as needed)
        setTimeout(resolve, 500);
      }),
    ]).then(([popup]) => {
      // Close the popup if it was successfully opened
      if (popup) {
        popup.close();
      }
    });
 
 
  };
 
  return (
    <div className="profile-popup">
    <div className="popup-contents">
 
      <FontAwesomeIcon
        icon={faTimes}
        className="close-icon"
        onClick={onClose}
      />
      <h2>Profile Details</h2>
      <p>Name: {name}</p>
      <p>Start Date: {startDate}</p>
      <p>End Date: {endDate}</p>
      <p>Email: {email}</p>
      <p>PDF download: {active ? "Yes" : "No"}</p>
      <button className="logout-button" onClick={handleClear}>
        LogOut
      </button>
    </div>
  </div>
  );
};
 
const HttProfile = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const display = sessionStorage.getItem("display");
 
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };
 
  const togglePopup = () => {
    setPopupOpen(!isPopupOpen);
    setDropdownOpen(!isDropdownOpen);
  };
 
  const handleProfileClick = () => {
    togglePopup();
    setDropdownOpen(isDropdownOpen);
  };
 
  const handleHelpClick = () => {
    window.open("https://www.hindutamil.in/contact-us", "_blank");
  };
 
  const loginButtons = () => {
    const authValue = "yes";
    sessionStorage.setItem("authValue",authValue);
    const url = `${process.env.REACT_APP_IPCONFIG}httauth`;
    const base64EncodedUrl = btoa(url);
    // console.log(base64EncodedUrl);
    window.location.href = `https://hindutamil.in/go_epaper.php?return=${base64EncodedUrl}`;
  };
 
  const conditionToDisplay = display === "1";
 
  const handleClear = () => {
    // Clear cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
 
    // Clear session storage
    sessionStorage.clear();
 
    // Use Promise.all to open logout URL and redirect simultaneously
    Promise.all([
      new Promise((resolve) => {
        // Open logout URL in a new window
        const popup = window.open("https://www.hindutamil.in/logout", "_blank");
        // Resolve the promise after a short delay (adjust as needed)
        setTimeout(() => {
          resolve(popup);
        }, 500);
      }),
      new Promise((resolve) => {
        // Redirect to the root ("/")
        window.location.href = '/';
        // Resolve the promise after a short delay (adjust as needed)
        setTimeout(resolve, 500);
      }),
    ]).then(([popup]) => {
      // Close the popup if it was successfully opened
      if (popup) {
        popup.close();
      }
    });
 
 
  };
 
  return (
    <div className="profile-container">
      <div
        className="profile-icon"
        onClick={toggleDropdown}
        style={{ fontSize: "30px" }}
      >
        <CgProfile />
      </div>
 
      {isDropdownOpen && (
        <div className="dropdown-menu" >
 
          {conditionToDisplay ? (
            <div className="menu-item" onClick={handleProfileClick}>
              Profile
            </div>
          ) : (
            <div className="menu-item" onClick={loginButtons}>
              Login
            </div>
          )}
          <div className="menu-item" onClick={handleHelpClick}>
            Contact
          </div>
          <div className="menu-item" onClick={handleClear}>
            Logout
          </div>
        </div>
      )}
 
      {isPopupOpen && <ProfilePopup onClose={togglePopup} />}
    </div>
  );
};
 
export default HttProfile;

// // HttProfile.js

// import React, { useState } from "react";
// import { CgProfile } from "react-icons/cg";
// import "../Css/HttProfile.css";

// const ProfilePopup = ({ onClose }) => {
//   const name = sessionStorage.getItem("username");
//   const startDate = sessionStorage.getItem("Startdate");
//   const endDate = sessionStorage.getItem("Enddate");
//   const email = sessionStorage.getItem("EmailId");
//   const editions = sessionStorage.getItem("is_pdf_download");
//   const active = editions === "1";

//   const handleClear = () => {
//     // Clear cookies
//     document.cookie.split(';').forEach((c) => {
//       document.cookie = c
//         .replace(/^ +/, '')
//         .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
//     });
  
//     // Clear session storage
//     sessionStorage.clear();
  
//     // Use Promise.all to open logout URL and redirect simultaneously
//     Promise.all([
//       new Promise((resolve) => {
//         // Open logout URL in a new window
//         const popup = window.open("https://www.hindutamil.in/logout", "_blank");
//         // Resolve the promise after a short delay (adjust as needed)
//         setTimeout(() => {
//           resolve(popup);
//         }, 500);
//       }),
//       new Promise((resolve) => {
//         // Redirect to the root ("/")
//         window.location.href = '/';
//         // Resolve the promise after a short delay (adjust as needed)
//         setTimeout(resolve, 500);
//       }),
//     ]).then(([popup]) => {
//       // Close the popup if it was successfully opened
//       if (popup) {
//         popup.close();
//       }
//     });


//   };
  
//   return (
//     <div className="profile-popup">
//       <div className="popup-contents">
//         <button className="close-button" onClick={onClose}>
//           Close
//         </button>
//         <h2>Profile Details</h2>
//         <p>Name: {name}</p>
//         <p>Start Date: {startDate}</p>
//         <p>End Date: {endDate}</p>
//         <p>Email: {email}</p>
//         <p>PDF download: {active ? "Yes" : "No"}</p>
//         <button className="logout-button" onClick={handleClear}>
//           LogOut
//         </button>
//       </div>
//     </div>
//   );
// };

// const HttProfile = () => {
//   const [isDropdownOpen, setDropdownOpen] = useState(false);
//   const [isPopupOpen, setPopupOpen] = useState(false);
//   const display = sessionStorage.getItem("display");

//   const toggleDropdown = () => {
//     setDropdownOpen(!isDropdownOpen);
//   };

//   const togglePopup = () => {
//     setPopupOpen(!isPopupOpen);
//     setDropdownOpen(!isDropdownOpen);
//   };

//   const handleProfileClick = () => {
//     togglePopup();
//     setDropdownOpen(isDropdownOpen);
//   };

//   const handleHelpClick = () => {
//     window.open("https://www.hindutamil.in/contact-us", "_blank");
//   };

//   const loginButtons = () => {
//     const authValue = "yes";
//     sessionStorage.setItem("authValue",authValue);
//     sessionStorage.setItem("edition",'Chennai');
    
//     const url = `${process.env.REACT_APP_IPCONFIG}httauth`;
//     const base64EncodedUrl = btoa(url);
//     // console.log(base64EncodedUrl);
//     window.location.href = `https://hindutamil.in/go_epaper.php?return=${base64EncodedUrl}`;
//   };

//   const conditionToDisplay = display === "1";

//   const handleClear = () => {
//     // Clear cookies
//     document.cookie.split(';').forEach((c) => {
//       document.cookie = c
//         .replace(/^ +/, '')
//         .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
//     });
  
//     // Clear session storage
//     sessionStorage.clear();
  
//     // Use Promise.all to open logout URL and redirect simultaneously
//     Promise.all([
//       new Promise((resolve) => {
//         // Open logout URL in a new window
//         const popup = window.open("https://www.hindutamil.in/logout", "_blank");
//         // Resolve the promise after a short delay (adjust as needed)
//         setTimeout(() => {
//           resolve(popup);
//         }, 500);
//       }),
//       new Promise((resolve) => {
//         // Redirect to the root ("/")
//         window.location.href = '/';
//         // Resolve the promise after a short delay (adjust as needed)
//         setTimeout(resolve, 500);
//       }),
//     ]).then(([popup]) => {
//       // Close the popup if it was successfully opened
//       if (popup) {
//         popup.close();
//       }
//     });


//   };

//   return (
//     <div className="profile-container">
//       <div
//         className="profile-icon"
//         onClick={toggleDropdown}
//         style={{ fontSize: "30px" }}
//       >
//         <CgProfile />
//       </div>

//       {isDropdownOpen && (
//         <div className="dropdown-menu" >

//           {conditionToDisplay ? (
//             <div className="menu-item" onClick={handleProfileClick}>
//               Profile
//             </div>
//           ) : (
//             <div className="menu-item" onClick={loginButtons}>
//               Login
//             </div>
//           )}
//           <div className="menu-item" onClick={handleHelpClick}>
//             Contact
//           </div>
//           <div className="menu-item" onClick={handleClear}>
//             Logout
//           </div>
//         </div>
//       )}

//       {isPopupOpen && <ProfilePopup onClose={togglePopup} />}
//     </div>
//   );
// };

// export default HttProfile;

