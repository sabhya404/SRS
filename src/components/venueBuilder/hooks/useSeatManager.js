// components/VenueBuilder/hooks/useSeatManager.js
import { useState, useEffect, useCallback } from "react";

export function useSeatManager(venue, setVenue, event, isBulkSelecting) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [bulkSelectionActive, setBulkSelectionActive] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [currentHover, setCurrentHover] = useState(null);
  const [categoryColors, setCategoryColors] = useState({});
  const [subcategoryColors, setSubcategoryColors] = useState({});
  const [seatCounts, setSeatCounts] = useState({});

  // Generate unique colors for categories and subcategories
  useEffect(() => {
    if (!event) return;

    const catColors = {};
    const subColors = {};
    const counts = {};

    // Generate a color for each category and subcategory
    event.categories.forEach((category, idx) => {
      // Base hue for this category
      const hue = (360 / event.categories.length) * idx;
      catColors[category._id] = `hsl(${hue}, 60%, 50%)`;
      counts[category._id] = { total: 0 };

      // Generate subcategory colors with the same hue but different saturation/lightness
      category.subcategories.forEach((sub, subIdx) => {
        const subHue = hue;
        const saturation = 65 - subIdx * 10;
        const lightness = 50 + subIdx * 8;
        subColors[sub._id] = `hsl(${subHue}, ${saturation}%, ${lightness}%)`;
        counts[category._id][sub._id] = 0;
      });
    });

    setCategoryColors(catColors);
    setSubcategoryColors(subColors);
    setSeatCounts(counts);
  }, [event]);

  // Reset bulk selection state when bulk selection mode is toggled off
  useEffect(() => {
    if (!isBulkSelecting) {
      setBulkSelectionActive(false);
      setSelectionStart(null);
      setCurrentHover(null);
    }
  }, [isBulkSelecting]);

  // Memoized function to recalculate seat counts
  const recalculateSeatCounts = useCallback(
    (seats) => {
      if (!event) return;

      // Create a fresh counts object
      const newCounts = {};

      // Initialize with zeroes for all categories and subcategories
      event.categories.forEach((category) => {
        newCounts[category._id] = { total: 0 };
        category.subcategories.forEach((sub) => {
          newCounts[category._id][sub._id] = 0;
        });
      });

      // Count each seat's assignment
      for (let r = 0; r < seats.length; r++) {
        for (let c = 0; c < seats[r].length; c++) {
          const seat = seats[r][c];
          if (seat.categoryId) {
            // Increment category total
            newCounts[seat.categoryId].total += 1;

            // Increment subcategory count if applicable
            if (seat.subcategoryId) {
              newCounts[seat.categoryId][seat.subcategoryId] += 1;
            }
          }
        }
      }

      // Update state with the new counts
      setSeatCounts(newCounts);
    },
    [event]
  );

  // Handle mouse down for seat selection (start selecting)
  const handleSeatMouseDown = (rowIndex, colIndex) => {
    console.log(
      "Mouse down:",
      rowIndex,
      colIndex,
      "Bulk selecting:",
      isBulkSelecting
    );

    if (!selectedCategory) {
      alert("Please select a category first.");
      return;
    }

    if (
      venue.seats.length <= rowIndex ||
      venue.seats[rowIndex].length <= colIndex
    ) {
      return; // Guard against out of bounds
    }

    if (isBulkSelecting) {
      // Start bulk selection process
      console.log("Starting bulk selection at:", rowIndex, colIndex);
      setBulkSelectionActive(true);
      setSelectionStart({ row: rowIndex, col: colIndex });
      setCurrentHover({ row: rowIndex, col: colIndex });
    } else {
      // Handle single seat selection
      const newSeats = [...venue.seats];
      const prevSeat = newSeats[rowIndex][colIndex];

      // Toggle the seat selection
      if (
        prevSeat.categoryId === selectedCategory._id &&
        prevSeat.subcategoryId === selectedSubcategory?._id
      ) {
        // If same category/subcategory, toggle it off
        newSeats[rowIndex][colIndex] = {
          categoryId: null,
          subcategoryId: null,
          status: "none",
        };
      } else {
        // Set to new category/subcategory
        newSeats[rowIndex][colIndex] = {
          categoryId: selectedCategory._id,
          subcategoryId: selectedSubcategory?._id,
          status: "available",
        };
      }

      setVenue((prev) => ({ ...prev, seats: newSeats }));
      recalculateSeatCounts(newSeats);
    }
  };

  // Handle mouse move during bulk selection
  const handleSeatMouseMove = (rowIndex, colIndex) => {
    if (bulkSelectionActive && isBulkSelecting) {
      console.log("Moving selection to:", rowIndex, colIndex);
      setCurrentHover({ row: rowIndex, col: colIndex });
    }
  };

  // Handle mouse up to finish bulk selection
  const handleSeatMouseUp = () => {
    console.log(
      "Mouse up - Selection active:",
      bulkSelectionActive,
      "Start:",
      selectionStart,
      "Current:",
      currentHover
    );

    if (
      bulkSelectionActive &&
      isBulkSelecting &&
      selectionStart &&
      currentHover
    ) {
      // Finish bulk selection
      console.log("Finishing bulk selection");
      applyBulkSelection(selectionStart, currentHover);
      setBulkSelectionActive(false);
      setSelectionStart(null);
      setCurrentHover(null);
    }
  };

  // Apply bulk selection to seats
  const applyBulkSelection = (start, end) => {
    if (!start || !end || !selectedCategory) return;

    const startRow = Math.min(start.row, end.row);
    const endRow = Math.max(start.row, end.row);
    const startCol = Math.min(start.col, end.col);
    const endCol = Math.max(start.col, end.col);

    console.log(
      `Applying bulk selection from (${startRow},${startCol}) to (${endRow},${endCol})`
    );

    // Create a copy of the seats array
    const newSeats = [...venue.seats];

    // Apply selection to all seats in the range
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (r < newSeats.length && c < newSeats[r].length) {
          newSeats[r][c] = {
            categoryId: selectedCategory._id,
            subcategoryId: selectedSubcategory?._id,
            status: "available",
          };
        }
      }
    }

    // Update venue state with new seats
    setVenue((prev) => ({ ...prev, seats: newSeats }));

    // Recalculate all seat counts after bulk update
    recalculateSeatCounts(newSeats);

    // Provide visual feedback of success
    console.log(
      `Bulk selected seats from Row ${startRow + 1} to Row ${endRow + 1}, Column ${startCol + 1} to Column ${endCol + 1}`
    );
  };

  // Get the color for a seat
  const getSeatColor = (seat) => {
    if (!seat || !seat.categoryId) {
      return "#f0f0f0"; // Default color for empty seats
    }

    return seat.subcategoryId
      ? subcategoryColors[seat.subcategoryId]
      : categoryColors[seat.categoryId];
  };

  // Check if a seat is within the current selection area
  const isInSelectionArea = (rowIndex, colIndex) => {
    if (
      !selectionStart ||
      !currentHover ||
      !bulkSelectionActive ||
      !isBulkSelecting
    )
      return false;

    const startRow = Math.min(selectionStart.row, currentHover.row);
    const endRow = Math.max(selectionStart.row, currentHover.row);
    const startCol = Math.min(selectionStart.col, currentHover.col);
    const endCol = Math.max(selectionStart.col, currentHover.col);

    return (
      rowIndex >= startRow &&
      rowIndex <= endRow &&
      colIndex >= startCol &&
      colIndex <= endCol
    );
  };

  // Format counts for display
  const formatCounts = (category) => {
    if (!seatCounts[category._id]) return "0/0";
    return `${seatCounts[category._id].total}/${category.totalSeats}`;
  };

  // Format subcategory counts for display
  const formatSubCounts = (category, subcategory) => {
    if (!seatCounts[category._id] || !seatCounts[category._id][subcategory._id])
      return "0/0";
    return `${seatCounts[category._id][subcategory._id]}/${subcategory.subSeats}`;
  };

  return {
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    categoryColors,
    subcategoryColors,
    seatCounts,
    bulkSelectionActive,
    setBulkSelectionActive,
    selectionStart,
    setSelectionStart,
    currentHover,
    setCurrentHover,
    getSeatColor,
    recalculateSeatCounts,
    isInSelectionArea,
    formatCounts,
    formatSubCounts,
    handleSeatMouseDown,
    handleSeatMouseMove,
    handleSeatMouseUp,
    applyBulkSelection,
  };
}
