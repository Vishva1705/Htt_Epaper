import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();

  // Redirect to home after 3 seconds
  useEffect(() => {
    navigate("/");
  });
}
