// components/VenueBuilder.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function VenueBuilder({ eventId, event }) {
  const router = useRouter();

  // Venue state
  const [venue, setVenue] = useState({
    rows: 10,
    cols: 10,
    shape: "rectangle",
    seats: [],
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [isBulkSelecting, setIsBulkSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [zoom, setZoom] = useState(1);
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
      catColors[category._id] = `hsl(${hue}, 70%, 60%)`;
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

  // Initialize seat grid
  useEffect(() => {
    if (venue.rows && venue.cols) {
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
  }, [venue.rows, venue.cols]);

  // Handle seat selection
  const handleSeatClick = (rowIndex, colIndex) => {
    if (isBulkSelecting) {
      // Start bulk selection
      if (!selectionStart) {
        setSelectionStart({ row: rowIndex, col: colIndex });
        setSelectionEnd({ row: rowIndex, col: colIndex });
      } else {
        // End bulk selection
        setSelectionEnd({ row: rowIndex, col: colIndex });
        applyBulkSelection();
        setIsBulkSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
      }
      return;
    }

    if (!selectedCategory) {
      alert("Please select a category first.");
      return;
    }

    // Update single seat
    const newSeats = [...venue.seats];
    const prevSeat = newSeats[rowIndex][colIndex];

    // If seat was already assigned to this category/subcategory, toggle it off
    if (
      prevSeat.categoryId === selectedCategory._id &&
      prevSeat.subcategoryId === selectedSubcategory?._id
    ) {
      newSeats[rowIndex][colIndex] = {
        categoryId: null,
        subcategoryId: null,
        status: "none",
      };

      // Update counts
      updateSeatCount(selectedCategory._id, selectedSubcategory?._id, -1);
    } else {
      // If seat was assigned to a different category, decrement that count
      if (prevSeat.categoryId) {
        updateSeatCount(prevSeat.categoryId, prevSeat.subcategoryId, -1);
      }

      // Set the new category/subcategory
      newSeats[rowIndex][colIndex] = {
        categoryId: selectedCategory._id,
        subcategoryId: selectedSubcategory?._id,
        status: "available",
      };

      // Update counts
      updateSeatCount(selectedCategory._id, selectedSubcategory?._id, 1);
    }

    setVenue((prev) => ({ ...prev, seats: newSeats }));
  };

  // Update seat count for a category/subcategory
  const updateSeatCount = (categoryId, subcategoryId, change) => {
    setSeatCounts((prev) => {
      const newCounts = { ...prev };

      // Update total count for the category
      newCounts[categoryId].total += change;

      // Update subcategory count if applicable
      if (subcategoryId) {
        newCounts[categoryId][subcategoryId] =
          (newCounts[categoryId][subcategoryId] || 0) + change;
      }

      return newCounts;
    });
  };

  // Apply bulk selection to multiple seats
  const applyBulkSelection = () => {
    if (!selectionStart || !selectionEnd || !selectedCategory) return;

    const startRow = Math.min(selectionStart.row, selectionEnd.row);
    const endRow = Math.max(selectionStart.row, selectionEnd.row);
    const startCol = Math.min(selectionStart.col, selectionEnd.col);
    const endCol = Math.max(selectionStart.col, selectionEnd.col);

    const newSeats = [...venue.seats];

    // Apply selection to all seats in the range
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const prevSeat = newSeats[r][c];

        // If seat was assigned to a different category, decrement that count
        if (prevSeat.categoryId) {
          updateSeatCount(prevSeat.categoryId, prevSeat.subcategoryId, -1);
        }

        // Set the new category/subcategory
        newSeats[r][c] = {
          categoryId: selectedCategory._id,
          subcategoryId: selectedSubcategory?._id,
          status: "available",
        };

        // Update counts
        updateSeatCount(selectedCategory._id, selectedSubcategory?._id, 1);
      }
    }

    setVenue((prev) => ({ ...prev, seats: newSeats }));
  };

  // Clear venue configuration
  const clearVenue = () => {
    if (confirm("Are you sure you want to clear all seat assignments?")) {
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

      setSeatCounts(resetCounts);
    }
  };

  // Save venue configuration
  const saveVenue = async () => {
    try {
      // Validate all seats are assigned according to capacity
      for (const category of event.categories) {
        const categoryCount = seatCounts[category._id]?.total || 0;
        if (categoryCount !== category.totalSeats) {
          alert(
            `Category ${category.name} requires exactly ${category.totalSeats} seats (${categoryCount} assigned)`
          );
          return;
        }

        for (const sub of category.subcategories) {
          const subCount = seatCounts[category._id][sub._id] || 0;
          if (subCount !== sub.subSeats) {
            alert();
            return;
          }
        }
      }

      // Create venue layout object
      const venueLayout = {
        eventId,
        dimensions: {
          rows: venue.rows,
          cols: venue.cols,
        },
        shape: venue.shape,
        seats: venue.seats,
        categoryColors,
        subcategoryColors,
      };

      // Save to API
      const response = await axios.post("/api/venues", venueLayout);

      if (response.data.success) {
        console.log("Venue layout saved successfully:", response.data);
        router.push(`/event/${eventId}`);
      } else {
        alert(`Error saving venue layout: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error saving venue:", error);
      alert(
        `Error saving venue layout: ${error.response?.data?.message || error.message}`
      );
    }
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Venue Builder: {event.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearVenue}>
            Clear
          </Button>
          <Button onClick={saveVenue}>Save Layout</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Venue Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rows">Rows: {venue.rows}</Label>
                <Slider
                  id="rows"
                  min={5}
                  max={50}
                  step={1}
                  value={[venue.rows]}
                  onValueChange={(value) =>
                    setVenue((prev) => ({ ...prev, rows: value[0] }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cols">Columns: {venue.cols}</Label>
                <Slider
                  id="cols"
                  min={5}
                  max={50}
                  step={1}
                  value={[venue.cols]}
                  onValueChange={(value) =>
                    setVenue((prev) => ({ ...prev, cols: value[0] }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoom">Zoom: {zoom.toFixed(1)}x</Label>
                <Slider
                  id="zoom"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label>Selection Mode</Label>
                <div className="flex gap-2">
                  <Button
                    variant={isBulkSelecting ? "outline" : "default"}
                    onClick={() => setIsBulkSelecting(false)}
                    className="flex-1"
                  >
                    Single Seat
                  </Button>
                  <Button
                    variant={isBulkSelecting ? "default" : "outline"}
                    onClick={() => setIsBulkSelecting(true)}
                    className="flex-1"
                  >
                    Bulk Select
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="categories" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="space-y-4">
                  {event.categories.map((category) => (
                    <div
                      key={category._id}
                      className={`p-3 rounded-md cursor-pointer border-2 ${
                        selectedCategory?._id === category._id
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: categoryColors[category._id] }}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedSubcategory(null);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm">
                          {formatCounts(category)}
                        </span>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="subcategories" className="space-y-4">
                  {!selectedCategory ? (
                    <div className="text-center py-4 text-gray-500">
                      Select a category first
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 p-2 bg-gray-100 rounded-md">
                        <p className="font-medium">
                          Selected: {selectedCategory.name}
                        </p>
                      </div>

                      {selectedCategory.subcategories.map((sub) => (
                        <div
                          key={sub._id}
                          className={`p-3 rounded-md cursor-pointer border-2 ${
                            selectedSubcategory?._id === sub._id
                              ? "border-primary"
                              : "border-transparent"
                          }`}
                          style={{
                            backgroundColor: subcategoryColors[sub._id],
                          }}
                          onClick={() => setSelectedSubcategory(sub)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{sub.subName}</span>
                            <span className="text-sm">
                              {formatSubCounts(selectedCategory, sub)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Venue Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Venue Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto p-4 border rounded-md">
                <div
                  className="grid gap-1 mx-auto"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    width: "fit-content",
                  }}
                >
                  {venue.seats.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-1">
                      {row.map((seat, colIndex) => (
                        <TooltipProvider key={colIndex}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`
                                  w-6 h-6 rounded-sm cursor-pointer border
                                  ${
                                    selectionStart &&
                                    selectionEnd &&
                                    rowIndex >=
                                      Math.min(
                                        selectionStart.row,
                                        selectionEnd.row
                                      ) &&
                                    rowIndex <=
                                      Math.max(
                                        selectionStart.row,
                                        selectionEnd.row
                                      ) &&
                                    colIndex >=
                                      Math.min(
                                        selectionStart.col,
                                        selectionEnd.col
                                      ) &&
                                    colIndex <=
                                      Math.max(
                                        selectionStart.col,
                                        selectionEnd.col
                                      )
                                      ? "border-primary border-2"
                                      : "border-gray-300"
                                  }
                                `}
                                style={{ backgroundColor: getSeatColor(seat) }}
                                onClick={() =>
                                  handleSeatClick(rowIndex, colIndex)
                                }
                              ></div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {seat.categoryId
                                ? `${event.categories.find((c) => c._id === seat.categoryId)?.name || ""} ${
                                    seat.subcategoryId
                                      ? `- ${
                                          event.categories
                                            .find(
                                              (c) => c._id === seat.categoryId
                                            )
                                            ?.subcategories.find(
                                              (s) =>
                                                s._id === seat.subcategoryId
                                            )?.subName || ""
                                        }`
                                      : ""
                                  }`
                                : "No seat"}
                              <div className="text-xs">
                                Row {rowIndex + 1}, Col {colIndex + 1}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span className="text-sm">No seat</span>
                </div>

                {event.categories.map((category) => (
                  <div key={category._id} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: categoryColors[category._id] }}
                    ></div>
                    <span className="text-sm">{category.name}</span>
                  </div>
                ))}

                {event.categories.flatMap((category) =>
                  category.subcategories.map((sub) => (
                    <div key={sub._id} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: subcategoryColors[sub._id] }}
                      ></div>
                      <span className="text-sm">{sub.subName}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
