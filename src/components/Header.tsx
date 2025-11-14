"use client";

import React from "react";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-50 via-orange-50 to-pink-50 py-8 border-b-2 border-purple-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-row items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-600">
              Alchm Kitchen
            </h1>
            <p className="mt-2 text-gray-700 text-lg">
              The Menu of the Moment in the Stars and Elements
            </p>
          </div>
          {/* PayPal Button */}
          <div>
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
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(255, 209, 64, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(255, 209, 64, 0.3)";
                }}
              />
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
