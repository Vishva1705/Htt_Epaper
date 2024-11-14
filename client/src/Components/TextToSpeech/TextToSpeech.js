import React, { useState } from "react";
import axios from "axios";
import "../TextToSpeech/TextToSpeech.css";

export default function Text2speech() {
  const [word, setWord] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // State to track loading status

  const convert = async () => {
    try {
      setIsLoading(true);
      const encodedText = encodeURIComponent(word);
      const proxyUrl = `http://172.17.4.68:9911/Google_TTS/?text=${encodedText}`;

      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        const audioUrl = response.url;
        setAudioUrl(audioUrl);
      }
    } catch (error) {
      console.error("Error converting text to speech:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="txtback">
      <div className="txtHeader">
        <h1>Text to Speech</h1>
        <textarea
          className="txttarea"
          maxLength={500}
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Enter text to convert"
        />
        <button className="txtButton" onClick={convert}>
          Convert
        </button>
        {isLoading && <div>Audio Generating...</div>}{" "}
        {/* Show loading indicator */}
        {audioUrl && (
          <div>
            <audio controls defaultPlaybackRate={1.25}>
              <source src={audioUrl} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}
