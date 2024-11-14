import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import '../Css/LoginPage.css';

function HttLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // useEffect to check for stored credentials on page load
  

  const handleLogin = async () => {
    
    // const apiUrl = 'https://epaper.hindutamil.in/api/htt/login';
    const apiUrl = 'https://epaper.hindutamil.in/api/htt/login';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // console.log(data.data); 

        if (data.message === 'success') {
          // Successful login logic here (e.g., redirect to the next page)
          setMessage('Login successful.');

          // Encrypt email and password for session storage
          const encryptedEmail = CryptoJS.AES.encrypt(email, 'secretKey').toString();
          const encryptedPassword = CryptoJS.AES.encrypt(password, 'secretKey').toString();
          const encryptedEnddate = CryptoJS.AES.encrypt(data.data.Enddate, 'secretKey').toString();
          const Display ="true";
          const encryptedDisplay = CryptoJS.AES.encrypt(Display, 'secretKey').toString();

          // Store the encrypted values in sessionStorage
          sessionStorage.setItem('encryptedEmail', encryptedEmail);
          sessionStorage.setItem('encryptedPassword', encryptedPassword);
          sessionStorage.setItem('Emailid', data.data.Emailid);
          sessionStorage.setItem('Username', data.data.Username);
          sessionStorage.setItem('encryptedEnddate', encryptedEnddate);
          sessionStorage.setItem('FullPagePdf', data.data.FullPagePdf);
          sessionStorage.setItem('Display', encryptedDisplay);
          sessionStorage.setItem('Userid', data.data.Userid);


          navigate('/hindu_tamil_epaper_pdf_view');
        } else {
          setMessage('Login failed. Please check your credentials.');
        }
      } else {
        setMessage('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again later.');
    }
  };

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('encryptedEmail');
    const storedPassword = sessionStorage.getItem('encryptedPassword');

    const url = `${process.env.REACT_APP_IPCONFIG}hindu_tamil_epaper_pdf_view`;
const base64EncodedUrl = btoa(url);

console.log(base64EncodedUrl);

    if (storedEmail && storedPassword) {
      
      // Decrypt stored email and password
      const decryptedEmail = CryptoJS.AES.decrypt(storedEmail, 'secretKey').toString(CryptoJS.enc.Utf8);
      const decryptedPassword = CryptoJS.AES.decrypt(storedPassword, 'secretKey').toString(CryptoJS.enc.Utf8);

      // console.log(decryptedEmail, "email");
      // console.log(decryptedPassword, "password");

      // Update the state with decrypted values
      setEmail(decryptedEmail);
      setPassword(decryptedPassword);

      // Attempt login with stored credentials
      handleLogin();
    }
  }, []);

  return (
    <div className="login-container">
      <h1 className="login-heading">Login</h1>
      <form
        className="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <div className='login-input-label'>
          <label className="login-label">Email:</label>
          <input
            className="login-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='login-input-label'>
          <label className="login-label">Password:</label>
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="login-button" type="submit">
          Login
        </button>
      </form>
      {message && <p className="login-message">{message}</p>}
    </div>
  );
}

export default HttLoginPage;
