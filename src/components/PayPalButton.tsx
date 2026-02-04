'use client';

import React from 'react';

export default function PayPalButton() {
  return (
    <form
      action="https://www.paypal.com/ncp/payment/SVN6Q368TKKLS"
      method="post"
      target="_blank"
    >
      <input
        type="submit"
        value="✨ HELP"
        style={{
          textAlign: "center",
          border: "2px solid #FFD700",
          borderRadius: "0.75rem",
          minWidth: "11.625rem",
          padding: "0.75rem 2rem",
          height: "3rem",
          fontWeight: "bold",
          backgroundColor: "#FFD140",
          color: "#000000",
          fontFamily: "Helvetica Neue, Arial, sans-serif",
          fontSize: "1.125rem",
          lineHeight: "1.25rem",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(255, 209, 64, 0.3)",
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(255, 209, 64, 0.4)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 209, 64, 0.3)";
        }}
      />
    </form>
  );
}
