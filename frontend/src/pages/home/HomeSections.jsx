
import React from "react";
import { FaGavel, FaClock, FaShieldAlt, FaDollarSign, FaUserCheck, FaChartLine } from "react-icons/fa";

export default function HomeSections() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 md:px-8">
        {/* Why Use AuctionHub Section */}
        <section className="mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 text-center tracking-tight mb-8">
            Why Use AuctionHub?
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-10">
            AuctionHub is your trusted platform for real estate auctions, offering a seamless, transparent, and efficient way to bid on properties. Discover why thousands choose us.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <FaGavel className="text-teal-500 text-3xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Streamlined Auctions</h3>
              <p className="text-gray-600 mt-2">
                Participate in real-time auctions with an intuitive interface, making it easy to bid on your dream property from anywhere.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <FaClock className="text-teal-500 text-3xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Time-Saving Process</h3>
              <p className="text-gray-600 mt-2">
                Our platform simplifies the auction process, saving you time with clear listings, instant updates, and automated bidding tools.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <FaShieldAlt className="text-teal-500 text-3xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Trusted & Secure</h3>
              <p className="text-gray-600 mt-2">
                Bid with confidence knowing your data is protected with top-tier security and verified auction processes.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
