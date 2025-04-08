import { FaBookmark, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

const EventDetails = ({ title, type, date, time, location, price }) => {
  return (
    <div className=" rounded-xl p-6 shadow-2xl bg-white max-w-md">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="flex items-center space-x-1 text-gray-600 mt-2">
        <FaBookmark />
        <span>{type}</span>
      </div>
      <div className="flex items-center space-x-1 text-gray-600 mt-2">
        <FaCalendarAlt />
        <span>
          {date} | {time} onwards
        </span>
      </div>
      <div className="flex items-center space-x-1 text-gray-600 mt-2">
        <FaMapMarkerAlt />
        <span>{location}</span>
      </div>
      <hr className="my-4" />
      <div className="flex justify-between items-center">
        <button className="bg-black text-white px-4 py-2 rounded-lg font-semibold">
          BOOK TICKETS
        </button>
      </div>
    </div>
  );
};

export default EventDetails;
