import React from "react";
import Auctions from "./Auctions";
import { FaAngleLeft } from "react-icons/fa";
import { AuctionDayDetails } from "./AuctionDayDetail";

const AuctionWrapper = () => {
  const [selectedDate, setSelectedDate] = React.useState(null);

  const handleDateClick = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${month}/${day}/${year}`;
    setSelectedDate(dateStr);
  };

  const handleBack = () => {
    setSelectedDate(null);
  };

  return (
    <div className="min-h-screen">
      {!selectedDate ? (
        <Auctions onDateClick={handleDateClick} />
      ) : (
        <div className="p-6 bg-gray-50 min-h-screen">
          <button
            onClick={handleBack}
            className="mb-6 px-4 py-2 cursor-pointer bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            <FaAngleLeft size={20} />
          </button>
          <AuctionDayDetails date={selectedDate} />
        </div>
      )}
    </div>
  );
};

export default AuctionWrapper;