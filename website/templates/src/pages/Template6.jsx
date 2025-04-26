import React from "react";
import TranslatedText from "../components/TranslatedText";

const Template6 = ({ headline, content }) => {
  // Log the received content for debugging
  console.log("Template6 - Received content:", content);
  console.log("Template6 - Content type:", typeof content);
  
  // Ensure content is a string
  const contentStr = content ? content.toString() : "";
  
  // First, normalize line breaks to ensure consistent splitting
  const normalizedContent = contentStr.replace(/\r\n/g, "\n").replace(/\n+/g, "\n\n");
  
  // Split content into sections, ensuring we handle different formats
  const contentSplit = normalizedContent.split("\n\n").filter(section => section.trim() !== "");
  console.log("Template6 - Split content into sections:", contentSplit);
  
  // Improved helper function to split text at sentence boundaries evenly for 2 columns
  const splitTextEvenly = (text, numParts = 2) => {
    // Match sentences (accounting for common abbreviations)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    console.log("Sentences found:", sentences.length);
    
    // If there are fewer sentences than needed parts, return the text as is
    if (sentences.length < numParts) {
      return [text, ""];
    }
    
    // Calculate the total character count
    const totalLength = text.length;
    const idealSectionLength = Math.floor(totalLength / numParts);
    
    // Initialize sections array and tracking variables
    const sections = [];
    let currentSection = "";
    let currentSectionIndex = 0;
    
    // Iterate through sentences and distribute them evenly
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      
      // If adding this sentence would make the section too long and we're not on the last section
      if (currentSection.length + sentence.length > idealSectionLength * 1.5 && 
          currentSection.length > 0 && 
          currentSectionIndex < numParts - 1) {
        // Finish current section and start a new one
        sections.push(currentSection.trim());
        currentSection = sentence;
        currentSectionIndex++;
      } else {
        // Add sentence to current section
        currentSection += sentence;
      }
      
      // If we're on the last sentence, add whatever we have to sections
      if (i === sentences.length - 1 && currentSection.length > 0) {
        sections.push(currentSection.trim());
      }
    }
    
    // Ensure we have exactly the number of parts needed
    while (sections.length < numParts) {
      sections.push("No content available");
    }
    
    // Take only the first numParts sections if we have more
    return sections.slice(0, numParts);
  };
  
  // Handle content splitting
  let sections = [...contentSplit];
  
  if (sections.length === 0) {
    // If no content, create 2 empty sections
    sections = ["No content available", "No content available"];
  } else if (sections.length === 1) {
    // With only one paragraph, split it evenly into 2 parts at sentence boundaries
    sections = splitTextEvenly(sections[0], 2);
  } else {
    // If we have 2 or more paragraphs, combine and balance them
    const combinedText = sections.join(" ");
    sections = splitTextEvenly(combinedText, 2);
  }
  
  // Extract sections
  const contentLeft = sections[0];
  const contentRight = sections[1];
  
  console.log("Final sections:", {
    contentLeft: contentLeft.substring(0, 50) + (contentLeft.length > 50 ? "..." : ""),
    contentRight: contentRight.substring(0, 50) + (contentRight.length > 50 ? "..." : "")
  });
  
  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        color: "#fff",
        backgroundColor: "#2C2C54",
        padding: "40px",
        display: "grid",
        gridTemplateColumns: "1fr",
        gridGap: "20px",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          border: "2px solid #fff",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: "0", fontSize: "28px", fontWeight: "bold" }}>
          {headline || <TranslatedText>Newsletter Title</TranslatedText>}
        </h1>
        <h2
          style={{ margin: "10px 0 0", fontSize: "18px", fontWeight: "normal" }}
        >
          <TranslatedText>{new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}</TranslatedText>
        </h2>
      </div>

      {/* Content Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridGap: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#40407A",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <h3 style={{ 
            borderBottom: "1px solid #fff", 
            paddingBottom: "8px", 
            fontSize: "16px" 
          }}>
            <TranslatedText>Part 1</TranslatedText>
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-line" }}>
            {typeof contentLeft === 'string' ? <TranslatedText>{contentLeft}</TranslatedText> : contentLeft}
          </p>
        </div>
        <div
          style={{
            backgroundColor: "#40407A",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <h3 style={{ 
            borderBottom: "1px solid #fff", 
            paddingBottom: "8px", 
            fontSize: "16px" 
          }}>
            <TranslatedText>Part 2</TranslatedText>
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-line" }}>
            {typeof contentRight === 'string' ? <TranslatedText>{contentRight}</TranslatedText> : contentRight}
          </p>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#2C2C54",
          color: "#fff",
          padding: "10px",
          textAlign: "center",
          borderRadius: "0 0 10px 10px",
          marginTop: "20px",
          border: "1px solid rgba(255,255,255,0.2)"
        }}
      >
        <p style={{ margin: "0", fontSize: "12px" }}><TranslatedText>Follow us on:</TranslatedText></p>
        <p style={{ margin: "5px 0", fontSize: "12px" }}>
          <a
            href="https://facebook.com"
            style={{ color: "#fff", margin: "0 5px" }}
          >
            <TranslatedText>Facebook</TranslatedText>
          </a>{" "}
          |
          <a
            href="https://twitter.com"
            style={{ color: "#fff", margin: "0 5px" }}
          >
            <TranslatedText>Twitter</TranslatedText>
          </a>{" "}
          |
          <a
            href="https://linkedin.com"
            style={{ color: "#fff", margin: "0 5px" }}
          >
            <TranslatedText>LinkedIn</TranslatedText>
          </a>
        </p>
        <p style={{ margin: "5px 0", fontSize: "12px" }}><TranslatedText>© {new Date().getFullYear()} SUMMIT</TranslatedText></p>
      </div>
    </div>
  );
};

export default Template6;
