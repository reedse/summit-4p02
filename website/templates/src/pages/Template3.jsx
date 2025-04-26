import React from "react";
import TranslatedText from "../components/TranslatedText";

const Template3 = ({ headline, content }) => {
  // Log the received content for debugging
  console.log("Template3 - Received content:", content);
  console.log("Template3 - Content type:", typeof content);
  
  // Ensure content is a string
  const contentStr = content ? content.toString() : "";
  
  // First, normalize line breaks to ensure consistent splitting
  const normalizedContent = contentStr.replace(/\r\n/g, "\n").replace(/\n+/g, "\n\n");
  
  // Split content into sections, ensuring we handle different formats
  const contentSplit = normalizedContent.split("\n\n").filter(section => section.trim() !== "");
  console.log("Template3 - Split content into sections:", contentSplit);
  
  // Improved helper function to split text at sentence boundaries more evenly
  const splitTextEvenly = (text, numParts) => {
    // Match sentences (accounting for common abbreviations)
    // This regex captures sentences ending with period, exclamation mark, or question mark
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    console.log("Sentences found:", sentences.length);
    
    // If there are fewer sentences than needed parts, return the text as is
    if (sentences.length < numParts) {
      return [text];
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
    
    // Ensure we have the exact number of parts needed
    // If we have fewer sections than requested, split the longest section
    while (sections.length < numParts) {
      // Find the longest section
      let longestIndex = 0;
      let maxLength = 0;
      
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].length > maxLength) {
          maxLength = sections[i].length;
          longestIndex = i;
        }
      }
      
      // Split the longest section at a sentence or word boundary
      const sectionToSplit = sections[longestIndex];
      const midpoint = Math.floor(sectionToSplit.length / 2);
      
      // Try to find a sentence boundary near the midpoint
      let breakPoint = sectionToSplit.substring(0, midpoint).lastIndexOf(". ") + 2;
      
      // If no good sentence boundary, try to find a word boundary
      if (breakPoint <= 2) {
        breakPoint = sectionToSplit.substring(0, midpoint).lastIndexOf(" ") + 1;
      }
      
      // If still no good break point, just use the midpoint
      if (breakPoint <= 1) breakPoint = midpoint;
      
      // Split the section and insert the new part
      const firstPart = sectionToSplit.substring(0, breakPoint).trim();
      const secondPart = sectionToSplit.substring(breakPoint).trim();
      
      sections[longestIndex] = firstPart;
      sections.splice(longestIndex + 1, 0, secondPart);
    }
    
    // If we have more sections than needed, combine the shortest adjacent sections
    while (sections.length > numParts) {
      let shortestPairIndex = 0;
      let shortestPairLength = Infinity;
      
      // Find the pair of adjacent sections with the shortest combined length
      for (let i = 0; i < sections.length - 1; i++) {
        const pairLength = sections[i].length + sections[i + 1].length;
        if (pairLength < shortestPairLength) {
          shortestPairLength = pairLength;
          shortestPairIndex = i;
        }
      }
      
      // Combine the pair
      sections[shortestPairIndex] = (sections[shortestPairIndex] + " " + sections[shortestPairIndex + 1]).trim();
      sections.splice(shortestPairIndex + 1, 1);
    }
    
    // Debug the section lengths to verify balance
    console.log("Section lengths:", sections.map(s => s.length));
    
    return sections;
  };
  
  // If we don't have at least 3 sections from paragraph breaks, create them
  let sections = [...contentSplit];
  
  if (sections.length === 0) {
    // If no content, create 3 empty sections
    sections = ["No content available", "No content available", "No content available"];
  } else if (sections.length === 1) {
    // With only one paragraph, split it evenly into 3 parts at sentence boundaries
    sections = splitTextEvenly(sections[0], 3);
    
    // If splitting didn't produce 3 sections, use fallback methods
    if (sections.length !== 3) {
      const paragraph = sections[0];
      const total = paragraph.length;
      const third = Math.floor(total / 3);
      
      // Try to find sentence boundaries near the split points
      let firstBreak = paragraph.substring(0, third).lastIndexOf(". ") + 2;
      let secondBreak = paragraph.substring(0, third * 2).lastIndexOf(". ") + 2;
      
      // If no sentence boundary found, fall back to splitting at word boundaries
      if (firstBreak <= 2) {
        firstBreak = paragraph.substring(0, third).lastIndexOf(" ") + 1;
      }
      if (secondBreak <= 2) {
        secondBreak = paragraph.substring(0, third * 2).lastIndexOf(" ") + 1;
      }
      
      // If still no good break point, use the calculated thirds
      if (firstBreak <= 1) firstBreak = third;
      if (secondBreak <= 1) secondBreak = third * 2;
      
      sections = [
        paragraph.substring(0, firstBreak).trim(),
        paragraph.substring(firstBreak, secondBreak).trim(),
        paragraph.substring(secondBreak).trim()
      ];
    }
  } else if (sections.length === 2) {
    // Try to evenly distribute content from both paragraphs into 3 sections
    const combinedText = sections.join(" ");
    sections = splitTextEvenly(combinedText, 3);
    
    // If splitting didn't work properly, use fallback method
    if (sections.length !== 3) {
      const combinedLength = combinedText.length;
      const third = Math.floor(combinedLength / 3);
      
      // Find sentence boundaries near each third
      let firstBreak = combinedText.substring(0, third).lastIndexOf(". ") + 2;
      let secondBreak = combinedText.substring(0, third * 2).lastIndexOf(". ") + 2;
      
      // If no sentence boundary found, fall back to word boundaries
      if (firstBreak <= 2) {
        firstBreak = combinedText.substring(0, third).lastIndexOf(" ") + 1;
      }
      if (secondBreak <= 2) {
        secondBreak = combinedText.substring(0, third * 2).lastIndexOf(" ") + 1;
      }
      
      // If still no good break point, use the calculated thirds
      if (firstBreak <= 1) firstBreak = third;
      if (secondBreak <= 1) secondBreak = third * 2;
      
      sections = [
        combinedText.substring(0, firstBreak).trim(),
        combinedText.substring(firstBreak, secondBreak).trim(),
        combinedText.substring(secondBreak).trim()
      ];
    }
  } else if (sections.length >= 3) {
    // If we have 3 or more paragraphs, try to balance them
    const combinedText = sections.join(" ");
    sections = splitTextEvenly(combinedText, 3);
  }
  
  // Ensure we have exactly 3 sections
  while (sections.length < 3) {
    sections.push("No content available");
  }
  
  // Take only the first 3 sections if we have more
  sections = sections.slice(0, 3);
  
  // Extract sections
  const section1 = sections[0];
  const section2 = sections[1];
  const section3 = sections[2];
  
  console.log("Final sections:", {
    section1: section1.substring(0, 50) + (section1.length > 50 ? "..." : ""),
    section2: section2.substring(0, 50) + (section2.length > 50 ? "..." : ""),
    section3: section3.substring(0, 50) + (section3.length > 50 ? "..." : "")
  });
  
  return (
  <div
    style={{
        fontFamily: "Arial, sans-serif",
      color: "#333",
      backgroundColor: "#f5f5f5",
      padding: "20px",
      display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
      gridGap: "20px",
      gridTemplateAreas: `
          "header header header"
          "section1 section2 section3"
          "footer footer footer"
    `,
    }}
  >
    {/* Header Section */}
    <div
      style={{
        gridArea: "header",
        backgroundColor: "#4a4a4a",
        color: "white",
        padding: "20px",
        textAlign: "center",
        borderRadius: "5px",
      }}
    >
        <h1 style={{ margin: "0", fontSize: "36px", fontWeight: "bold" }}>
          {headline || <TranslatedText>Newsletter Title</TranslatedText>}
        </h1>
        <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
          <TranslatedText>{new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}</TranslatedText>
        </p>
    </div>

      {/* Content Sections */}
    <div
      style={{
          gridArea: "section1",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            borderBottom: "2px solid #4a4a4a",
            paddingBottom: "10px",
            fontSize: "20px",
          }}
        >
          <TranslatedText>Section 1</TranslatedText>
        </h2>
        <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
          {typeof section1 === 'string' ? <TranslatedText>{section1}</TranslatedText> : section1}
        </p>
      </div>

      <div
        style={{
          gridArea: "section2",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            borderBottom: "2px solid #4a4a4a",
            paddingBottom: "10px",
            fontSize: "20px",
          }}
        >
          <TranslatedText>Section 2</TranslatedText>
        </h2>
        <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
          {typeof section2 === 'string' ? <TranslatedText>{section2}</TranslatedText> : section2}
        </p>
      </div>

      <div
        style={{
          gridArea: "section3",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            borderBottom: "2px solid #4a4a4a",
            paddingBottom: "10px",
            fontSize: "20px",
          }}
        >
          <TranslatedText>Section 3</TranslatedText>
        </h2>
        <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
          {typeof section3 === 'string' ? <TranslatedText>{section3}</TranslatedText> : section3}
        </p>
      </div>

      {/* Footer Section */}
    <div
      style={{
          gridArea: "footer",
        backgroundColor: "#333",
        color: "#fff",
          padding: "15px",
        textAlign: "center",
          borderRadius: "5px",
      }}
    >
      <p style={{ margin: "0", fontSize: "12px" }}><TranslatedText>Follow us on:</TranslatedText></p>
        <p style={{ margin: "5px 0", fontSize: "12px" }}>
          <a href="https://facebook.com" style={{ color: "#fff", margin: "0 5px" }}>
          <TranslatedText>Facebook</TranslatedText>
        </a>{" "}
        |
          <a href="https://twitter.com" style={{ color: "#fff", margin: "0 5px" }}>
          <TranslatedText>Twitter</TranslatedText>
        </a>{" "}
        |
          <a href="https://linkedin.com" style={{ color: "#fff", margin: "0 5px" }}>
          <TranslatedText>LinkedIn</TranslatedText>
        </a>
      </p>
        <p style={{ margin: "5px 0", fontSize: "12px" }}>
          <TranslatedText>© {new Date().getFullYear()} Your Organization</TranslatedText>
        </p>
      </div>
  </div>
);
};

export default Template3;
