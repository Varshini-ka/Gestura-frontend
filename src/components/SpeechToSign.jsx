import { useEffect, useState, useRef } from "react";
import "../styles/speechtosign.css";
import Papa from "papaparse";

function SpeechToSign() {
  const [isRecording, setIsRecording] = useState(false);
  const [signMedia, setSignMedia] = useState([]);
  const [availableGifs, setAvailableGifs] = useState(new Set());
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const recognitionRef = useRef(null);

  // Media configuration for paths and extensions
  const mediaConfig = {
    gif: { path: "/gifs/", extension: ".gif" },
    letter: { path: "/images/", extension: "_test.jpg" },
  };

  // Load GIF phrases from CSV
  const loadCsv = () => {
    console.log("Attempting to fetch gif_sentences.csv");
    fetch("/gif_sentences.csv")
      .then((response) => {
        console.log("Fetch response status:", response.status);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: Failed to fetch CSV. Ensure gif_sentences.csv is in the public directory.`);
        }
        return response.blob();
      })
      .then((blob) => {
        console.log("Fetched blob, reading as text with UTF-8");
        const reader = new FileReader();
        reader.onload = (event) => {
          const csvData = event.target.result;
          console.log("Raw CSV content (first 5 lines):", csvData.split("\n").slice(0, 5).join("\n"));
          if (!csvData.trim()) {
            setError("CSV file is empty");
            setLoading(false);
            console.error("CSV content is empty");
            return;
          }
          Papa.parse(csvData, {
            complete: (result) => {
              console.log("Papa Parse completed, result:", result);
              if (result.errors.length > 0) {
                const errorDetails = result.errors.map((e) => {
                  switch (e.type) {
                    case "Delimiter":
                      return `Row ${e.row || "unknown"}: Invalid delimiter detected. Expected comma-separated values.`;
                    case "FieldMismatch":
                      return `Row ${e.row || "unknown"}: Too few or too many fields. Check for missing or extra commas.`;
                    default:
                      return `Row ${e.row || "unknown"}: ${e.message}`;
                  }
                }).join("; ");
                console.error("CSV parsing errors:", errorDetails);
                setError(`Failed to parse CSV file: ${errorDetails}. Ensure it has a 'filename' header, uses commas, and has Unix (LF) line endings.`);
                setLoading(false);
                return;
              }
              if (!result.meta.fields.includes("filename")) {
                setError("CSV file missing 'filename' header");
                console.error("CSV headers:", result.meta.fields);
                setLoading(false);
                return;
              }
              const filenames = new Set(
                result.data
                  .map((row) => {
                    const filename = row.filename?.toLowerCase().trim();
                    if (!filename) {
                      console.warn("Skipping row with missing or empty filename:", row);
                      return null;
                    }
                    return filename;
                  })
                  .filter(Boolean)
              );
              console.log("Extracted filenames:", Array.from(filenames));
              if (filenames.size === 0) {
                setError("No valid filenames found in CSV. Ensure the 'filename' column contains valid entries.");
                setLoading(false);
                return;
              }
              setAvailableGifs(filenames);
              setLoading(false); // Set loading to false only after success
              setError(null);
            },
            header: true,
            skipEmptyLines: true,
            delimiter: ",", // Explicitly use comma as delimiter
            transform: (value) => value.trim(), // Trim whitespace from all fields
            error: (error) => {
              console.error("Papa Parse error:", error);
              setError("Error processing CSV file. Check the file format and line endings.");
              setLoading(false);
            },
          });
        };
        reader.onerror = () => {
          setError("Failed to read CSV file");
          setLoading(false);
          console.error("FileReader error");
        };
        reader.readAsText(blob, "UTF-8");
      })
      .catch((error) => {
        console.error("Error loading CSV:", error.message);
        setError(`Unable to load sign language data: ${error.message}`);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCsv();

    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const currentTranscript = event.results[0][0].transcript;
        setTranscript(currentTranscript);
        setIsRecording(false);
        setError(null);
        if (!loading) processSpeech(currentTranscript); // Only process if loading is complete
      };

      recognitionRef.current.onerror = (error) => {
        console.error("Speech recognition error:", error.error);
        setError("Speech recognition failed. Try again or use the fallback.");
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [loading]); // Add loading to dependency array

  const startRecording = () => {
    setIsRecording(true);
    setTranscript("");
    setSignMedia([]);
    setError(null);

    if (recognitionRef.current && !loading) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        setError("Failed to start recording. Using fallback.");
        fallbackSimulation();
      }
    } else if (loading) {
      setError("Please wait, loading sign language data...");
    } else {
      setError("Speech recognition not supported. Using fallback.");
      fallbackSimulation();
    }
  };

  const fallbackSimulation = () => {
    setIsRecording(true);
    setTimeout(() => {
      const fallbackOptions = [
        "hi how are you",
        "nice to meet you",
        "what is your name",
        "good morning",
        "thank you very much",
      ];
      const simulatedTranscript = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
      setTranscript(simulatedTranscript);
      setIsRecording(false);
      setError(null);
      if (!loading) processSpeech(simulatedTranscript); // Only process if loading is complete
    }, 2000);
  };

  const processSpeech = (text) => {
    const input = text.toLowerCase().replace(/[^a-z\s]/g, "").trim();
    if (!input) {
      setSignMedia([]);
      setError("No valid words detected in speech");
      return;
    }

    const words = input.split(/\s+/);
    const finalMedia = [];
    console.log("Available GIFs:", Array.from(availableGifs)); // Debug log

    // Track used word indices to avoid overlapping matches
    const usedIndices = new Set();

    // Check for all possible phrase combinations
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j <= words.length; j++) {
        const phrase = words.slice(i, j).join("");
        if (availableGifs.has(phrase) && !Array.from(usedIndices).some(idx => i <= idx && idx < j)) {
          console.log(`Found GIF for phrase: ${phrase}`);
          finalMedia.push({ type: "gif", src: `${mediaConfig.gif.path}${phrase}${mediaConfig.gif.extension}` });
          for (let k = i; k < j; k++) {
            usedIndices.add(k);
          }
          break; // Move to next starting index after finding a match
        }
      }
    }

    // Process remaining unmatched words
    for (let i = 0; i < words.length; i++) {
      if (!usedIndices.has(i)) {
        const word = words[i];
        if (availableGifs.has(word)) {
          console.log(`Found GIF for: ${word}`);
          finalMedia.push({ type: "gif", src: `${mediaConfig.gif.path}${word}${mediaConfig.gif.extension}` });
          usedIndices.add(i);
        } else {
          console.log(`No GIF for: ${word}, using letters`);
          for (let ch of word.toUpperCase()) {
            if (ch >= "A" && ch <= "Z") {
              finalMedia.push({
                type: "letter",
                src: `${mediaConfig.letter.path}${ch}${mediaConfig.letter.extension}`,
              });
            }
          }
        }
      }
    }

    // Limit output size
    const MAX_MEDIA_ITEMS = 50;
    if (finalMedia.length > MAX_MEDIA_ITEMS) {
      finalMedia.length = MAX_MEDIA_ITEMS;
      setError("Output truncated due to excessive length");
    }

    setSignMedia(finalMedia);
  };

  // Function to determine appropriate class based on number of items
  const getGridClass = () => {
    if (signMedia.length === 0) return "";
    if (signMedia.length === 1) return "sign-images-single";
    if (signMedia.length <= 4) return "sign-images-few";
    return "";
  };

  return (
    <div className="speech-to-sign-container container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <h2 className="text-center mb-4 fw-bold">Speech to Sign</h2>
          <div className="text-center mb-4">
            <button
              onClick={startRecording}
              className={`btn btn-${isRecording ? "danger" : "primary"} px-4 py-2`}
              disabled={isRecording || loading}
            >
              {isRecording ? "Recording..." : loading ? "Loading..." : "Start Recording"}
            </button>
          </div>

          {error && (
            <p className="text-center text-danger mb-3">{error}</p>
          )}

          {transcript && (
            <div className="transcript-display text-center mb-3">
              <p className="mb-1 fw-bold">You said:</p>
              <p className="transcript-text">{transcript}</p>
            </div>
          )}

          <div className="sign-output">
            {signMedia.length === 0 && !isRecording && transcript && !error && (
              <p className="text-center text-secondary mt-4">No signs could be generated for your speech.</p>
            )}

            {signMedia.length === 0 && !isRecording && !transcript && !error && (
              <p className="text-center text-secondary mt-4">Press the button and speak to see signs.</p>
            )}

            <div className={`sign-images-grid ${getGridClass()}`}>
              {signMedia.map((media, index) => (
                <div key={index} className="sign-image-item">
                  <img
                    src={media.src}
                    alt={
                      media.type === "gif"
                        ? `Sign for ${media.src.split("/").pop().replace(mediaConfig.gif.extension, "")}`
                        : `Sign for letter ${media.src.split("/").pop()[0]}`
                    }
                    className={`${media.type === "gif" ? "gif-image" : "letter-image"} img-fluid`}
                    onError={(e) => {
                      e.target.src = "/images/placeholder.jpg";
                      e.target.alt = "Sign not available";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpeechToSign;