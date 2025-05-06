// components/VenueBuilder/index.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import VenueControls from "./VenueControls";
import CategorySelector from "./CategorySelector";
import VenueGrid from "./VenueGrid";
import Legend from "./Legend";
import { useSeatManager } from "./hooks/useSeatManager";

export default function VenueBuilder({ eventId, event, existingVenueData }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Venue state
  const [venue, setVenue] = useState({
    rows: 20,
    cols: 20,
    shape: "rectangle",
    seats: [],
  });

  const [isBulkSelecting, setIsBulkSelecting] = useState(false);

  // Extract seat management logic to a custom hook
  const {
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    categoryColors,
    subcategoryColors,
    seatCounts,
    bulkSelectionActive,
    selectionStart,
    currentHover,
    getSeatColor,
    recalculateSeatCounts,
    isInSelectionArea,
    formatCounts,
    formatSubCounts,
    handleSeatMouseDown,
    handleSeatMouseMove,
    handleSeatMouseUp,
    applyBulkSelection,
  } = useSeatManager(venue, setVenue, event, isBulkSelecting);

  // Load existing venue data if available
  useEffect(() => {
    if (existingVenueData) {
      console.log("Loading existing venue data:", existingVenueData);

      // Extract venue data from the API response
      const { shape, dimensions, seats } = existingVenueData;

      setVenue((prev) => ({
        ...prev,
        shape: shape || prev.shape,
        rows: dimensions?.rows || prev.rows,
        cols: dimensions?.cols || prev.cols,
        seats: seats || prev.seats,
      }));

      // If there are seats, recalculate seat counts
      if (seats && seats.length > 0) {
        recalculateSeatCounts(seats);
      }
    }
  }, [existingVenueData]);

  // Initialize seat grid only once when component mounts
  useEffect(() => {
    // Only initialize if there are no existing seats AND we have no existingVenueData
    if (
      !existingVenueData &&
      venue.rows &&
      venue.cols &&
      (!venue.seats || venue.seats.length === 0)
    ) {
      const initialSeats = Array(venue.rows)
        .fill()
        .map(() =>
          Array(venue.cols)
            .fill()
            .map(() => ({
              categoryId: null,
              subcategoryId: null,
              status: "none", // Default status
            }))
        );
      setVenue((prev) => ({ ...prev, seats: initialSeats }));
    }
  }, []); // Only run once on component mount

  // Update seat grid when dimensions change
  useEffect(() => {
    if (venue.rows && venue.cols) {
      // Create a new seats array with the updated dimensions
      const newSeats = Array(venue.rows)
        .fill()
        .map((_, rowIndex) =>
          Array(venue.cols)
            .fill()
            .map((_, colIndex) => {
              // Preserve existing seat data if it exists
              if (
                venue.seats &&
                venue.seats[rowIndex] &&
                venue.seats[rowIndex][colIndex]
              ) {
                return venue.seats[rowIndex][colIndex];
              }
              // Otherwise create a new empty seat
              return {
                categoryId: null,
                subcategoryId: null,
                status: "none",
              };
            })
        );

      // Update the venue with the new seats array
      setVenue((prev) => ({ ...prev, seats: newSeats }));

      // Recalculate seat counts
      recalculateSeatCounts(newSeats);
    }
  }, [venue.rows, venue.cols]);

  // Clear venue configuration
  const clearVenue = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all seat assignments?"
    );

    if (confirmClear) {
      const newSeats = Array(venue.rows)
        .fill()
        .map(() =>
          Array(venue.cols)
            .fill()
            .map(() => ({
              categoryId: null,
              subcategoryId: null,
              status: "none",
            }))
        );

      setVenue((prev) => ({ ...prev, seats: newSeats }));

      // Reset seat counts
      const resetCounts = {};
      event.categories.forEach((category) => {
        resetCounts[category._id] = { total: 0 };
        category.subcategories.forEach((sub) => {
          resetCounts[category._id][sub._id] = 0;
        });
      });

      recalculateSeatCounts(newSeats);

      console.log("All seats cleared successfully.");
    }
  };

  const getUsedDimensions = () => {
    let maxRow = -1;
    let maxCol = -1;

    // Find the last row and column with any assigned seat
    venue.seats.forEach((row, rowIndex) => {
      row.forEach((seat, colIndex) => {
        if (seat.categoryId !== null) {
          maxRow = Math.max(maxRow, rowIndex);
          maxCol = Math.max(maxCol, colIndex);
        }
      });
    });
    if (maxRow === -1 || maxCol === -1) {
      return { rows: 0, cols: 0 };
    }

    // Add 1 because indices are zero-based
    return { rows: maxRow + 1, cols: maxCol + 1 };
  };

  // Save venue configuration
  const saveVenue = async () => {
    try {
      setIsLoading(true);

      // Validate all seats are assigned according to capacity
      let hasValidationErrors = false;

      for (const category of event.categories) {
        const categoryCount = seatCounts[category._id]?.total || 0;
        if (categoryCount !== category.totalSeats) {
          alert(
            `Category mismatch: ${category.name} requires exactly ${category.totalSeats} seats (${categoryCount} currently assigned`
          );

          hasValidationErrors = true;
        }

        for (const sub of category.subcategories) {
          const subCount = seatCounts[category._id][sub._id] || 0;
          if (subCount !== sub.subSeats) {
            alert(
              `Subcategory mismatch: ${sub.subName} requires exactly ${sub.subSeats} seats (${subCount} currently assigned`
            );

            hasValidationErrors = true;
          }
        }
      }

      if (hasValidationErrors) {
        setIsLoading(false);
        return;
      }
      const usedDimensions = getUsedDimensions();

      // Check if any seats are assigned
      if (usedDimensions.rows === 0 || usedDimensions.cols === 0) {
        alert(
          "No seats have been assigned. Please assign seats before saving."
        );
        return;
      }

      // Trim the seats array to only include rows and columns up to the last assigned seat
      // This keeps all seats (including empty ones) up to the maximum dimensions needed
      const trimmedSeats = venue.seats
        .slice(0, usedDimensions.rows)
        .map((row) => row.slice(0, usedDimensions.cols));

      // Create venue layout object
      const venueLayout = {
        eventId,
        shape: venue.shape,
        dimensions: {
          rows: usedDimensions.rows,
          cols: usedDimensions.cols,
        },
        seats: trimmedSeats,
        categoryColors,
        subcategoryColors,
      };

      // Save to API
      const response = await axios.post("/api/venue", venueLayout);

      if (response.data.success) {
        console.log("Venue saved successfully:", response.data.message);

        // Short delay before redirect for toast to be visible
        setTimeout(() => {
          router.push(`/Dashboard`);
        }, 1500);
      } else {
        alert(`Error saving venue: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error saving venue:", error);
      alert("An error occurred while saving the venue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    if (!event || !event.categories) return 0;

    let totalAssigned = 0;
    let totalRequired = 0;

    for (const category of event.categories) {
      totalAssigned += seatCounts[category._id]?.total || 0;
      totalRequired += category.totalSeats;
    }

    return totalRequired > 0
      ? Math.round((totalAssigned / totalRequired) * 100)
      : 0;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Venue Builder: {event.title}</h1>
          <p className="text-slate-500">
            Completion: {calculateCompletionPercentage()}%
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearVenue} disabled={isLoading}>
            Clear All
          </Button>
          <Button onClick={saveVenue} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Layout"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Controls */}
        <div className="lg:col-span-1">
          <VenueControls
            venue={venue}
            setVenue={setVenue}
            isBulkSelecting={isBulkSelecting}
            setIsBulkSelecting={setIsBulkSelecting}
          />

          <CategorySelector
            event={event}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
            categoryColors={categoryColors}
            subcategoryColors={subcategoryColors}
            seatCounts={seatCounts}
            formatCounts={formatCounts}
            formatSubCounts={formatSubCounts}
          />
        </div>

        {/* Main Content - Venue Grid */}
        <div className="lg:col-span-3">
          <VenueGrid
            venue={venue}
            event={event}
            isBulkSelecting={isBulkSelecting}
            bulkSelectionActive={bulkSelectionActive}
            handleSeatMouseDown={handleSeatMouseDown}
            handleSeatMouseMove={handleSeatMouseMove}
            handleSeatMouseUp={handleSeatMouseUp}
            getSeatColor={getSeatColor}
            isInSelectionArea={isInSelectionArea}
          />

          <Legend
            event={event}
            categoryColors={categoryColors}
            subcategoryColors={subcategoryColors}
          />
        </div>
      </div>
    </div>
  );
}
