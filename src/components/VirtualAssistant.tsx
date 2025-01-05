import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  CircularProgress,
  Typography,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Box } from "@mui/system";
import "tailwindcss/tailwind.css";
import axios from "axios";
import Webcam from "react-webcam";
import Lottie from "lottie-react";
import animationData from "../assests/assistant.json";
import { motion } from "framer-motion";
import InfoIcon from "@mui/icons-material/Info";
const VirtualAssistant: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(true);
  const [isWebcamLoaded, setIsWebcamLoaded] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [open, setOpen] = useState(false);

  const webcamRef = useRef<Webcam | null>(null);
  const GOOGLE_API_KEY = process.env.REACT_APP_API_Key;
  let myTimeout: NodeJS.Timeout;

  useEffect(() => {
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  function decodeHTML(html: any) {
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(html, "text/html")
      .documentElement.textContent;
    return decodedString;
  }

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
                      text: "Act as a live virtual teacher assistant. Break down the problem into clear steps, providing brief, detailed explanations for each step. After solving, summarize the solution with a concise conclusion. If the image doesn't match the problem, mention that the image is not relevant. Ensure your explanations are simple and easy to follow, as if teaching a beginner. Provide your response in HTML tags with appropriate tags for each section (e.g., <h3> for headings, <p> for paragraphs, <strong> for bold text, etc.). Do not include the word 'html' or any mention of HTML tags in your response text, as this will be automatically handled by our system. We will render the HTML in our UI using dangerouslySetInnerHTML. Just provide the content with correct logical structure and HTML markup.Here is the format:Each step should be wrapped in appropriate tags like <h3> for titles, and <p> for explanations or descriptions.For listing steps, use <ol> and <li> to ensure a clear and ordered structure.Use <strong> where bold text is needed (for example, important terms like PEMDAS).Wrap the conclusion in <h3> and provide it at the end.",
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

          let solutionText = response.data.candidates[0].content.parts[0].text;
          solutionText = solutionText
            .replace(/```html/g, "")
            .replace(/```/g, "");

          setSolution(solutionText);

          if (isSpeechEnabled) {
            const decodedSolution: string | null = decodeHTML(solutionText);
            if (decodedSolution) {
              speakSolution(decodedSolution);
            } else {
              speakSolution(solutionText);
            }
          }
        } catch (error: any) {
          setErrorMessage(
            `Error: ${error.message || "An error occurred. Please try again."}`
          );
        } finally {
          setLoading(false);
        }
      }
    }
  };

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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box className="w-full h-screen bg-gray-100">
      <Container
        maxWidth={false}
        className="h-full w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl"
      >
        <Box className="h-[10vh] bg-metallicBlue flex items-center justify-center text-white relative">
          <Typography>Virtual Teacher Assistant</Typography>
          <IconButton color="inherit" onClick={handleClickOpen}>
            <InfoIcon />
          </IconButton>

          {/* Dialog for instructions */}
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Instruction</DialogTitle>
            <DialogContent>
              <Typography>
                Point the camera to the problem, click on "Solve It", and wait
                for the magic.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        {errorMessage && (
          <Alert severity="error" className="my-4">
            {errorMessage}
          </Alert>
        )}

        <Box className="h-[40vh] bg-gostWhite flex items-center justify-center text-white">
          <Box className="relative w-full h-full">
            <Box className="w-full h-[90%]" style={{ position: "relative" }}>
              {!imagePreview ? (
                <>
                  {!isWebcamLoaded && (
                    <Box
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                      }}
                    >
                      <CircularProgress style={{ color: "#1e5471" }}
                        
                      />
                    </Box>
                  )}
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: facingMode,
                    }}
                    onUserMedia={() => setIsWebcamLoaded(true)}
                    onUserMediaError={(error: any) => {
                      if (error.name === "NotAllowedError") {
                        setErrorMessage(
                          "Webcam access denied. Please enable camera permissions."
                        );
                      } else if (error.name === "NotFoundError") {
                        setErrorMessage(
                          "No camera found. Please connect a camera."
                        );
                      } else {
                        setErrorMessage(
                          "Unable to access the webcam. Please try again."
                        );
                      }
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderTopLeftRadius: "10px",
                      borderTopRightRadius: "10px",
                      display: isWebcamLoaded ? "block" : "none",
                    }}
                  />
                </>
              ) : (
                <img
                  src={imagePreview}
                  alt="Captured"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                  }}
                />
              )}
            </Box>

            <Box className="w-full h-[10%] flex items-center justify-between px-4 py-2 bg-metallicBlue ">
              <Typography variant="body2" className="text-sm">
                Switch Camera
              </Typography>

              <Switch
                color="primary"
                checked={facingMode === "user"}
                onChange={toggleCamera}
              />
            </Box>
          </Box>
        </Box>

        <Box className="h-[10vh] bg-gray-800 text-white flex items-center justify-center p-4">
          {!imagePreview ? (
            <div className="flex items-center justify-center gap-4">
              <Button
                component={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                variant="contained"
                onClick={analyzeProblem}
                disabled={isWebcamLoaded ? false : true}
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "#FFF",
                  borderRadius: "30px",
                  padding: "10px 20px",
                  fontWeight: "600",
                  fontSize: { xs: "14px", md: "16px" },
                  textTransform: "none",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
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
                className="text-white"
              />
            </div>
          ) : (
            <Button
              component={motion.button}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              variant="contained"
              onClick={handleNewProblem}
              disabled={loading ? true : false}
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
        </Box>

        {loading || solution ? (
          <Box className="h-[40vh] bg-gostWhite text-black flex flex-col justify-between shadow-lg">
            {/* Conditionally Render Loading Animation or Content */}
            {loading ? (
              <Box className="flex flex-col items-center justify-center h-full">
                <Lottie
                  animationData={animationData}
                  loop
                  style={{ width: "15%", height: "15%" }}
                />
                <Typography variant="body2" className="mt-2 text-gray-600">
                  Analyzing the problem, please wait...
                  <CircularProgress size={12} className="mt-4" />
                </Typography>
              </Box>
            ) : (
              <Box className="overflow-auto p-4 flex-grow">
                <Typography
                  variant="body1"
                  sx={{ fontSize: "16px", wordWrap: "break-word" }}
                  dangerouslySetInnerHTML={{ __html: solution }}
                />
              </Box>
            )}
          </Box>
        ) : null}
      </Container>
    </Box>
  );
};

export default VirtualAssistant;
