import React from "react";
import TranslatedText from "../components/TranslatedText";

const Template4 = ({ headline, content }) => {
  // Ensure content is a string
  const contentStr = content ? content.toString() : "";
  
  // Normalize line breaks to ensure consistent display
  const normalizedContent = contentStr.replace(/\r\n/g, "\n").replace(/\n+/g, "\n\n");

  return (
    <div
      style={{
        fontFamily: "Montserrat, sans-serif",
        color: "#444",
        backgroundColor: "#e0f7fa",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          backgroundColor: "#00796b",
          color: "#fff",
          padding: "20px",
          textAlign: "center",
          borderRadius: "10px 10px 0 0",
        }}
      >
        <h1 style={{ margin: "0", fontSize: "32px" }}>{headline || <TranslatedText>Newsletter Title</TranslatedText>}</h1>
        <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
          <TranslatedText>{new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}</TranslatedText>
        </p>
      </div>

      <div
        style={{
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "0 0 10px 10px",
        }}
      >
        <h2 style={{ borderBottom: "2px solid #00796b", paddingBottom: "10px" }}>
          <TranslatedText>Summary</TranslatedText>
        </h2>
        <p style={{ lineHeight: "1.6", fontSize: "16px", whiteSpace: "pre-line" }}>
          {normalizedContent ? <TranslatedText>{normalizedContent}</TranslatedText> : <TranslatedText>No content available</TranslatedText>}
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#004d40",
          color: "#fff",
          padding: "10px",
          textAlign: "center",
          borderRadius: "0 0 10px 10px",
          marginTop: "20px",
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

export default Template4;
