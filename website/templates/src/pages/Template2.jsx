import React from "react";
import TranslatedText from "../components/TranslatedText";

const Template2 = () => (
  <div
    style={{
      fontFamily: "Georgia, serif",
      color: "#2E7D32",
      backgroundColor: "#E8F5E9",
      padding: "20px",
    }}
  >
    <div style={{ textAlign: "center", padding: "10px 0" }}>
      <div
        style={{
          width: "100%",
          height: "50px",
          backgroundColor: "#388E3C",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontSize: "14px",
          fontWeight: "bold",
        }}
      >
        <TranslatedText>April 2025</TranslatedText>
      </div>
    </div>
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <h1 style={{ fontSize: "36px", color: "#1B5E20", margin: "0" }}>
        <TranslatedText>The Minimalist Movement</TranslatedText>
      </h1>
      <p style={{ fontSize: "14px", color: "#1B5E20", margin: "5px 0" }}>
        <TranslatedText>Official customer newsletter</TranslatedText>
      </p>
    </div>

    <div style={{ padding: "20px 0" }}>
      <p className="par1" style={{ fontSize: "16px", color: "#1B5E20" }}>
        <TranslatedText>Company newsletters are essential in building relationships with your employees, customers or even prospective clients. Engaged and professionally-made company newsletters have the power to inspire loyalty and repeat business. Get in touch with the people who matter to your business by making company newsletters one of your priorities.</TranslatedText>
      </p>
      <p className="par2">
        <TranslatedText>Make your logo, infusing it with your brand colors, and making it interesting. Your company newsletter is a great tool for introducing new ideas or sharing important news. Do you want to send holiday wishes to clients for Christmas? Do you want to use the new year's newsletter to advertise new products or services to new and existing leads? The options are endless!</TranslatedText>
      </p>
    </div>
    <div
      style={{
        backgroundColor: "#C8E6C9",
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
      <p style={{ margin: "0", fontSize: "12px" }}><TranslatedText>© 2025 SUMMIT</TranslatedText></p>
    </div>
  </div>
);

export default Template2;
