// WelcomeBanner.jsx
import React from "react";
import { FaGavel } from "react-icons/fa";

export default function WelcomeBanner() {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center  overflow-hidden">
      
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-75"
        style={{
          backgroundImage:
            "url('/images/home.avif')",
        }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 md:px-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Welcome to <span className="text-teal-400">HomeAuction</span>
        </h1>
        <p className="text-white text-md md:text-xl mb-6 max-w-2xl mx-auto">
          Discover your dream home and bid with confidence. Join our online auction platform to find exclusive listings and competitive deals.
        </p>
        <button className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 mx-auto transition duration-200">
          <FaGavel /> Start Finding
        </button>
      </div>

      {/* Decorative Vector/Shape (optional) */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg
          viewBox="0 0 500 150"
          preserveAspectRatio="none"
          className="w-full h-20 md:h-32"
        >
          <path
            d="M0.00,49.98 C150.00,150.00 349.91,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
            className="fill-white"
          ></path>
        </svg>
      </div>
    </section>
  );
}
