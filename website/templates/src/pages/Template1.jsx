import React from "react";
import TranslatedText from "../components/TranslatedText";

const Template1 = () => (
  <div
    style={{
      fontFamily: "Times New Roman, serif",
      color: "#000",
      backgroundColor: "#f4f4f4",
      padding: "20px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 20px",
        backgroundColor: "#fff",
        borderBottom: "2px solid #000",
      }}
    ></div>
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#fff",
        borderBottom: "2px solid #000",
      }}
    >
      <h2 style={{ margin: "0", fontSize: "36px", fontWeight: "bold" }}>
        <TranslatedText>BUSINESS NEWSLETTER</TranslatedText>
      </h2>
    </div>
    <div style={{ padding: "20px", backgroundColor: "#fff" }}>
      <div style={{ display: "flex", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>
            <TranslatedText>Business Stock</TranslatedText>
          </h2>
          <p className="par1" style={{ fontSize: "15px" }}>
            <TranslatedText>A newsletter is a regularly distributed publication that is generally about one main topic of interest to its subscribers. Newspapers and leaflets are types of newsletters. For Newspapers and leaflets are types of newsletters.</TranslatedText>
          </p>
          <p className="par2" style={{ fontSize: "15px" }}>
            <TranslatedText>A newsletter is a regularly distributed publication that is generally about one main topic of interest to its subscribers. Newspapers and leaflets are types of newsletters. For Newspapers and leaflets are types of newsletters.</TranslatedText>
          </p>
        </div>
      </div>
    </div>
    <div
      style={{
        backgroundColor: "#333",
        color: "#fff",
        padding: "10px",
        textAlign: "center",
      }}
    >
      <p style={{ margin: "0", fontSize: "12px" }}><TranslatedText>Follow us on:</TranslatedText></p>
      <p style={{ margin: "0", fontSize: "12px" }}>
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
      <p style={{ margin: "0", fontSize: "12px" }}><TranslatedText>Footer information</TranslatedText></p>
    </div>
  </div>
);

export default Template1;
