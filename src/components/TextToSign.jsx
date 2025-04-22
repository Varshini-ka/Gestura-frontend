import { useState, useEffect } from "react";
import Papa from "papaparse";
import "../styles/texttosign.css";
import 'bootstrap/dist/css/bootstrap.css';

function TextToSign() {
  const [inputText, setInputText] = useState("");
  const [signMedia, setSignMedia] = useState([]);
  const [availableGifs, setAvailableGifs] = useState([]);

  // Function to load the CSV and extract filenames
  const loadCsv = () => {
    fetch("/gif_sentences.csv")
      .then((response) => response.text())
      .then((csvData) => {
        Papa.parse(csvData, {
          complete: (result) => {
            const filenames = result.data.map((row) => row.filename.toLowerCase());
            setAvailableGifs(filenames);
          },
          header: true,
        });
      })
      .catch((error) => {
        console.error("Error loading CSV:", error);
      });
  };

  // Handle the text-to-sign conversion
  const generateSigns = () => {
    const input = inputText.toLowerCase().replace(/[^a-z\s]/g, "").trim();
    const words = input.split(/\s+/);
    const finalMedia = [];
    const usedIndices = new Set();

    // First, check for the entire phrase (highest priority)
    const fullPhrase = words.join("");
    if (availableGifs.includes(fullPhrase)) {
      finalMedia.push({ type: "gif", src: `/gifs/${fullPhrase}.gif` });
      for (let i = 0; i < words.length; i++) {
        usedIndices.add(i);
      }
    } else {
      // Then check for longest matches in decreasing order of length
      const possibleCombinations = [];

      // Generate all possible combinations and store them with their indices
      for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j <= words.length; j++) {
          const combo = words.slice(i, j).join("");
          if (availableGifs.includes(combo)) {
            possibleCombinations.push({
              combo,
              indices: Array.from({ length: j - i }, (_, k) => i + k),
              length: j - i
            });
          }
        }
      }

      // Sort by length (descending) to prioritize longer matches
      possibleCombinations.sort((a, b) => b.length - a.length);

      // Process combinations in order, avoiding overlaps
      for (const { combo, indices } of possibleCombinations) {
        const anyUsed = indices.some(idx => usedIndices.has(idx));
        if (!anyUsed) {
          finalMedia.push({ type: "gif", src: `/gifs/${combo}.gif` });
          indices.forEach(idx => usedIndices.add(idx));
        }
      }
    }

    // For remaining words, break down into individual letters
    for (let i = 0; i < words.length; i++) {
      if (usedIndices.has(i)) continue; // Skip used words
      const word = words[i].toUpperCase();

      for (let ch of word) {
        if (ch >= "A" && ch <= "Z") {
          finalMedia.push({ type: "letter", src: `/images/${ch}_test.jpg` });
        }
      }
    }

    setSignMedia(finalMedia);
  };

  useEffect(() => {
    loadCsv();
  }, []);

  // Function to determine appropriate class based on number of items
  const getGridClass = () => {
    if (signMedia.length === 0) return "";
    if (signMedia.length === 1) return "sign-images-single";
    if (signMedia.length < 5) return "sign-images-few";
    return "";
  };

  return (
    <div className="text-to-sign-container container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <h2 className="text-center mb-4 fw-bold">Text to Sign</h2>
          
          <div className="text-to-sign-input">
            <input
              type="text"
              className="form-control"
              placeholder="Enter text..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              onClick={generateSigns}
              className="btn btn-primary"
            >
              Generate
            </button>
          </div>

          <div className="sign-output">
            {signMedia.length === 0 && inputText && (
              <p className="text-center text-secondary mt-4">No signs generated. Try another word.</p>
            )}
            <div className={`sign-images-grid ${getGridClass()}`}>
              {signMedia.map((media, index) => (
                <div key={index} className="sign-image-item">
                  <img
                    src={media.src}
                    alt={media.type === "gif" ? "sign-gif" : "sign-letter"}
                    className={`${media.type === "gif" ? "gif-image" : "letter-image"} img-fluid`}
                    onError={(e) => {
                      e.target.src = "/images/placeholder.jpg";
                      e.target.alt = "Not available";
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

export default TextToSign;