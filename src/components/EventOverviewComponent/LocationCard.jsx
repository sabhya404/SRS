"use client";

const LocationCard = ({ title, address, googleMapLink }) => {
  return (
    <div className="w-2/3 rounded-xl p-6 shadow-2xl bg-white my-20">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{address}</p>
      <div className="mt-4">
        <iframe
          src={googleMapLink}
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-lg shadow-sm"
        ></iframe>
      </div>
    </div>
  );
};

export default LocationCard;
