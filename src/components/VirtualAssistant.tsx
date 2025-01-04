import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  CircularProgress,
  Typography,
  Button,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Box } from "@mui/system";
import "tailwindcss/tailwind.css";
import axios from "axios";
import Lottie from "lottie-react";
import animationData from "../assests/assistant.json";

const VirtualAssistant: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const GOOGLE_API_KEY = process.env.REACT_APP_API_Key;
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(true);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (error) {
      setErrorMessage("Error accessing the camera. Please try again.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const analyzeProblem = async () => {
    setLoading(true);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (videoRef.current && context) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg").split(",")[1];

      setImagePreview(canvas.toDataURL("image/jpeg"));

      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: "Act as a live virtual teacher assistant. Break down the problem into clear steps, providing brief, detailed explanations for each step. After solving, summarize the solution with a concise conclusion. If the image doesn't match the problem, mention that the image is not relevant. Ensure your explanations are simple and easy to follow, as if teaching a beginner.",
                  },
                  { inline_data: { mime_type: "image/jpeg", data: imageData } },
                ],
              },
            ],
          },
          { headers: { "Content-Type": "application/json" } }
        );

        const solutionText = response.data.candidates[0].content.parts[0].text;
        setSolution(solutionText);
        if (isSpeechEnabled) {
          speakSolution(solutionText);
        }
      } catch (error) {
        setErrorMessage("Error analyzing the problem. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };
  let myTimeout: NodeJS.Timeout;

  function myTimer() {
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
    myTimeout = setTimeout(myTimer, 8000);
  }
  const speakSolution = (text: string) => {
    if ("speechSynthesis" in window) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }

      myTimeout = setTimeout(myTimer, 8000);

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.onerror = (event) => {
        console.error(`Speech synthesis error: ${event.error}`);
      };

      utterance.onend = () => {
        clearTimeout(myTimeout);
      };

      speechSynthesis.speak(utterance);
    } else {
      console.error("Speech Synthesis not supported in this browser.");
    }
  };

  const handleNewProblem = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    setImagePreview(null);
    setSolution("");
    setErrorMessage(null);
    startCamera();
  };

  const handleSpeechToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSpeechEnabled(event.target.checked);
  };

  return (
    <Container
      className="flex flex-col items-center justify-center min-h-screen px-4"
      sx={{
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography
        variant="h6"
        className="font-bold text-center mb-6"
        sx={{
          color: "#333",
          fontWeight: "600",
        }}
      >
         Virtual Teacher Assistant
      </Typography>
      <Box className="w-full mb-6">
      <Typography
        variant="body2"
        sx={{
          color: "#555",
          marginBottom: "20px",
        }}
      >
        Point the camera at the problem you're facing, and then press "Show Me the Magic" to analyze it. Wait for the solution to be generated!
      </Typography>
      </Box>
      

      {errorMessage && (
        <Alert severity="error" sx={{ width: "100%", marginBottom: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {
        <>
          {!loading && !stream && <CircularProgress size={32} />}

          {!loading && stream && !imagePreview && (
            <Box
              className="w-full mb-6"
              sx={{
                width: { xs: "100%", md: "50%" },
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
                overflow: "hidden",
                border: "2px solid #e5e5e5",
              }}
            >
              <video
                autoPlay
                ref={videoRef}
                className="w-full h-auto border-none"
                style={{ borderRadius: "10px" }}
              />
            </Box>
          )}

          {imagePreview && !loading && (
            <Box
              className="w-full mb-6"
              sx={{
                width: { xs: "100%", md: "50%" },
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
                overflow: "hidden",
                border: "2px solid #e5e5e5",
              }}
            >
              <img
                src={imagePreview}
                alt="Captured"
                className="w-full h-auto"
              />
            </Box>
          )}

          {stream && !imagePreview && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="contained"
                onClick={analyzeProblem}
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  borderRadius: "30px",
                  padding: "12px 24px",
                  fontWeight: "600",
                  fontSize: "16px",
                  textTransform: "none",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  marginTop: "16px",
                  marginBottom: "16px",
                  width: { xs: "100%", md: "auto" },
                  "&:hover": {
                    backgroundColor: "#45a049",
                    boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                Show Me the Magic ✨
              </Button>

              <FormControlLabel
                control={
                  <Switch
                    checked={isSpeechEnabled}
                    onChange={handleSpeechToggle}
                    name="speechSwitch"
                    color="primary"
                  />
                }
                label="Enable Speech"
              />
            </Box>
          )}

          {loading && (
            <>
              <Lottie
                animationData={animationData}
                loop
                style={{ width: "15%", height: "15%" }}
              />
              <Typography variant="body2" className="mt-2 text-gray-600">
                Analyzing the problem, please wait...
                <CircularProgress size={12} className="mt-4" />
              </Typography>
            </>
          )}

          {!loading && solution && (
            <Typography
              variant="body1"
              className="mt-4 text-center mx-auto"
              sx={{
                marginBottom: "15px",
                padding: "18px",
                border: "2px solid rgb(132, 130, 130)",
                borderRadius: "10px",
                backgroundColor: "#fff",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                fontSize: "16px",
                color: "#333",
                lineHeight: "1.6",
                width: { xs: "100%", md: "50%" },
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  borderColor: "#FF6F3F",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              {solution}
            </Typography>
          )}

          {solution && (
            <Button
              variant="contained"
              onClick={handleNewProblem}
              sx={{
                backgroundColor: "#FF5733",
                color: "#fff",
                borderRadius: "30px",
                padding: "12px 24px",
                fontWeight: "600",
                fontSize: "16px",
                textTransform: "none",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                width: { xs: "100%", md: "auto" },
                "&:hover": {
                  backgroundColor: "#FF6F3F",
                  boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              New Challenge
            </Button>
          )}
        </>
      }
    </Container>
  );
};

export default VirtualAssistant;
