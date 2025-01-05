import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  CircularProgress,
  Typography,
  Button,
  Alert,
  FormControlLabel,
  Switch,
  Skeleton,
} from "@mui/material";
import { Box } from "@mui/system";
import "tailwindcss/tailwind.css";
import axios from "axios";
import Webcam from "react-webcam";
import Lottie from "lottie-react";
import animationData from "../assests/assistant.json";
import { motion } from "framer-motion";

const VirtualAssistant: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(true);
  const [isWebcamLoaded, setIsWebcamLoaded] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");

  const webcamRef = useRef<Webcam | null>(null);
  const GOOGLE_API_KEY = process.env.REACT_APP_API_Key;

  useEffect(() => {
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const analyzeProblem = async () => {
    setLoading(true);
    const webcam = webcamRef.current;

    if (webcam) {
      const imageSrc = webcam.getScreenshot();
      if (imageSrc) {
        setImagePreview(imageSrc);
        const imageData = imageSrc.split(",")[1];

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
                    {
                      inline_data: { mime_type: "image/jpeg", data: imageData },
                    },
                  ],
                },
              ],
            },
            { headers: { "Content-Type": "application/json" } }
          );

          const solutionText =
            response.data.candidates[0].content.parts[0].text;
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
    setLoading(false);
    setIsWebcamLoaded(false);
  };

  const handleSpeechToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSpeechEnabled(event.target.checked);
  };
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };
  return (
    <Box sx={{ backgroundColor: "#FAFAFA", height: "100vh" }}>
      <Container
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
          component={motion.h6}
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          variant="h6"
          className="font-bold text-center mb-6"
          sx={{
            width: { xs: "100%", md: "50%" },
            fontWeight: "600",
            padding: "8px 16px",
            backgroundColor: "#1A237E",
            color: "#FFF",
            borderRadius: "10px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            display: "inline-block",
            marginBottom: "20px",
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          {" "}
          Virtual Teacher Assistant {"v1"}
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ width: "100%", marginBottom: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {!loading && (
          <>
            {!imagePreview && (
              <Box
                component={motion.div}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full mb-6"
                sx={{
                  position: "relative",
                  width: { xs: "100%", md: "50%" },
                  borderTopLeftRadius: "10px",
                  borderTopRightRadius: "10px",
                  overflow: "hidden",
                  height: {
                    xs: "30%", // Smaller height on mobile devices
                    md: "auto", // Default height for larger screens
                  },
                }}
              >
                {!loading && !isWebcamLoaded && (
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      borderRadius: "10px",
                    }}
                  />
                )}
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: facingMode,
                  }}
                  className="w-full border-none"
                  onUserMedia={() => setIsWebcamLoaded(true)}
                  style={{
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                  }}
                />
                {isWebcamLoaded && (
                  <Box
                    sx={{
                      backgroundColor: "#000",
                      color: "#FFF",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0px 10px",
                      borderBottomLeftRadius: "10px",
                      borderBottomRightRadius: "10px",
                      position: {
                        xs: "absolute",
                        bottom: 0,
                        width: "100%",
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: "14px" }}>
                      Switch Camera
                    </Typography>
                    <Switch
                      color="primary"
                      checked={facingMode === "user"}
                      onChange={toggleCamera}
                    />
                  </Box>
                )}
              </Box>
            )}

            {imagePreview && (
              <Box
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full mb-6"
                sx={{
                  width: { xs: "100%", md: "50%" },
                  height: { xs: "20%", md: "auto" }, // Adjust the height on mobile
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

            {isWebcamLoaded && !imagePreview && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  variant="contained"
                  onClick={analyzeProblem}
                  sx={{
                    backgroundColor: "#4CAF50",
                    color: "#FFF",
                    borderRadius: "30px",
                    padding: "10px 20px",
                    fontWeight: "600",
                    fontSize: { xs: "14px", md: "16px" },
                    textTransform: "none",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    marginTop: "16px",
                    marginBottom: "16px",
                    maxWidth: "200px",
                    "&:hover": {
                      backgroundColor: "#45a049",
                    },
                  }}
                >
                  Solve It! 🚀
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
          </>
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
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            sx={{
              width: { xs: "100%", md: "50%" },
              marginBottom: "15px",
              padding: "18px",
              border: "2px solid rgb(132, 130, 130)",
              borderRadius: "10px",
              backgroundColor: "#FFF",
              textAlign: "center",
            }}
          >
            {" "}
            <Typography
              variant="body1"
              sx={{ fontSize: "16px", wordWrap: "break-word" }}
            >
              {" "}
              {solution}{" "}
            </Typography>{" "}
          </Box>
        )}

        {solution && (
          <Button
            component={motion.button}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            variant="contained"
            onClick={handleNewProblem}
            sx={{
              backgroundColor: "#FF5733",
              color: "#FFF",
              borderRadius: "30px",
              padding: "12px 24px",
              fontWeight: "600",
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "#FF6F3F",
              },
            }}
          >
            New Challenge🎯
          </Button>
        )}
      </Container>
    </Box>
  );
};

export default VirtualAssistant;
