"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const VenueBuilder = ({ eventId, categories, capacity }) => {
  const router = useRouter();
  const [sections, setSections] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.name || ""
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [sectionType, setSectionType] = useState("rectangle");
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(10);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load existing layout on mount
  useEffect(() => {
    const loadLayout = async () => {
      try {
        const { data } = await axios.get(`/api/event/${eventId}`);
        if (data.venueLayout?.sections) {
          setSections(data.venueLayout.sections);
        }
      } catch (err) {
        setError("Failed to load existing layout");
      }
    };
    loadLayout();
  }, [eventId]);

  const generateSeatId = (sectionId, row, col) => {
    return `${sectionId}-${row}-${col}`.toUpperCase();
  };

  const generateRectangularSection = () => {
    const sectionId = `SEC-${Date.now()}`;
    const seats = [];

    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= cols; col++) {
        seats.push({
          seatId: generateSeatId(sectionId, row, col),
          category: selectedCategory,
          subcategory: selectedSubcategory,
          coordinates: { x: col * 40, y: row * 40 },
          status: "available",
        });
      }
    }

    return {
      sectionId,
      type: sectionType,
      rows,
      cols,
      seats,
    };
  };

  const generateCircularSection = () => {
    const sectionId = `CIRC-${Date.now()}`;
    const seats = [];
    const radius = rows * 20; // rows acts as radius multiplier
    const seatsPerRing = cols; // cols acts as seats per ring

    for (let ring = 1; ring <= rows; ring++) {
      const angleStep = (2 * Math.PI) / (seatsPerRing * ring);
      for (let seatNum = 0; seatNum < seatsPerRing * ring; seatNum++) {
        const angle = angleStep * seatNum;
        seats.push({
          seatId: `${sectionId}-R${ring}-S${seatNum}`,
          category: selectedCategory,
          subcategory: selectedSubcategory,
          coordinates: {
            x: radius * ring * Math.cos(angle) + 400,
            y: radius * ring * Math.sin(angle) + 300,
          },
          status: "available",
        });
      }
    }

    return {
      sectionId,
      type: sectionType,
      rings: rows,
      seatsPerRing: cols,
      seats,
    };
  };

  const handleAddSection = () => {
    setError("");
    const newSection =
      sectionType === "rectangle"
        ? generateRectangularSection()
        : generateCircularSection();

    const totalSeats =
      sections.reduce((sum, sec) => sum + sec.seats.length, 0) +
      newSection.seats.length;

    if (totalSeats > capacity) {
      setError(
        `Adding this section would exceed capacity by ${totalSeats - capacity} seats`
      );
      return;
    }

    setSections([...sections, newSection]);
  };

  const handleSeatClick = (sectionIndex, seatIndex) => {
    const updatedSections = [...sections];
    const seat = updatedSections[sectionIndex].seats[seatIndex];

    // Toggle between available/reserved
    seat.status = seat.status === "available" ? "reserved" : "available";
    setSections(updatedSections);
  };

  const handleSaveLayout = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const totalSeats = sections.reduce(
        (sum, sec) => sum + sec.seats.length,
        0
      );

      if (totalSeats !== capacity) {
        throw new Error(
          `Total seats (${totalSeats}) must match event capacity (${capacity})`
        );
      }

      await axios.patch(`/api/event/${eventId}`, {
        venueLayout: {
          sections,
          layoutComplete: true,
        },
      });

      setSuccess("Venue layout saved successfully!");
      setTimeout(() => router.push(`/event/${eventId}`), 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const currentSeats = sections.reduce((sum, sec) => sum + sec.seats.length, 0);
  const seatsRemaining = capacity - currentSeats;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Venue Layout Builder
          </h1>

          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Type
              </label>
              <select
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="rectangle">Rectangular</option>
                <option value="circle">Circular</option>
              </select>
            </div>

            {sectionType === "rectangle" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rows
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={rows}
                    onChange={(e) => setRows(Math.max(1, e.target.value))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Columns
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cols}
                    onChange={(e) => setCols(Math.max(1, e.target.value))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rings
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={rows}
                    onChange={(e) => setRows(Math.max(1, e.target.value))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seats per Ring
                  </label>
                  <input
                    type="number"
                    min="4"
                    value={cols}
                    onChange={(e) => setCols(Math.max(4, e.target.value))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">None</option>
                {categories
                  .find((c) => c.name === selectedCategory)
                  ?.subcategories?.map((sub) => (
                    <option key={sub.subName} value={sub.subName}>
                      {sub.subName}
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={handleAddSection}
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Section
            </button>
          </div>

          {/* Progress and Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Seats Added:</span>
              <span>
                {currentSeats} / {capacity}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${(currentSeats / capacity) * 100}%` }}
              />
            </div>
            {seatsRemaining > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {seatsRemaining} seats remaining
              </p>
            )}
          </div>

          {/* Legend */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Category Colors</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="lg:col-span-2">
          <div className="border rounded-lg bg-gray-50 relative min-h-[600px] overflow-hidden">
            {sections.map((section, sectionIndex) => (
              <div key={section.sectionId}>
                {section.seats.map((seat, seatIndex) => {
                  const categoryColor =
                    categories.find((c) => c.name === seat.category)?.color ||
                    "#ccc";
                  return (
                    <button
                      key={seat.seatId}
                      className={`absolute w-6 h-6 rounded-sm border-2 cursor-pointer transition-all ${
                        seat.status === "reserved"
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:scale-125"
                      }`}
                      style={{
                        left: `${seat.coordinates.x}px`,
                        top: `${seat.coordinates.y}px`,
                        backgroundColor: categoryColor,
                        borderColor:
                          seat.status === "reserved"
                            ? "#ef4444"
                            : categoryColor,
                      }}
                      onClick={() => handleSeatClick(sectionIndex, seatIndex)}
                      disabled={seat.status === "reserved"}
                      title={`${seat.category}${seat.subcategory ? ` - ${seat.subcategory}` : ""}\n${seat.seatId}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="mt-6 flex justify-between items-center">
            <div className="space-y-1">
              {error && <p className="text-red-600">{error}</p>}
              {success && <p className="text-green-600">{success}</p>}
            </div>
            <button
              onClick={handleSaveLayout}
              disabled={isSaving || currentSeats !== capacity}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? "Saving..." : "Save Layout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueBuilder;
