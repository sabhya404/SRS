// components/VenueBuilder/VenueGrid.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function VenueGrid({
  venue,
  event,

  isBulkSelecting,
  bulkSelectionActive,
  handleSeatMouseDown,
  handleSeatMouseMove,
  handleSeatMouseUp,
  getSeatColor,
  isInSelectionArea,
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Venue Layout</CardTitle>
        {isBulkSelecting && (
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Bulk selection mode {bulkSelectionActive ? "(selecting...)" : ""}
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div
          className="overflow-auto p-4 border rounded-md"
          onMouseUp={handleSeatMouseUp}
          onMouseLeave={() => {
            if (bulkSelectionActive) {
              handleSeatMouseUp();
            }
          }}
        >
          <div
            className="grid gap-1 mx-auto"
            style={{
              transformOrigin: "top left",
              width: "fit-content",
            }}
          >
            {venue.seats.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {row.map((seat, colIndex) => (
                  <SeatItem
                    key={colIndex}
                    seat={seat}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                    isInSelectionArea={isInSelectionArea(rowIndex, colIndex)}
                    getSeatColor={getSeatColor}
                    handleSeatMouseDown={handleSeatMouseDown}
                    handleSeatMouseMove={handleSeatMouseMove}
                    event={event}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Individual seat component
function SeatItem({
  seat,
  rowIndex,
  colIndex,
  isInSelectionArea,
  getSeatColor,
  handleSeatMouseDown,
  handleSeatMouseMove,
  event,
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              w-6 h-6 rounded-sm cursor-pointer border
              transition-all
              ${
                isInSelectionArea
                  ? "border-primary border-2 brightness-90 shadow-sm"
                  : "border-gray-300 hover:border-gray-500"
              }
            `}
            style={{
              backgroundColor: getSeatColor(seat),
              opacity: isInSelectionArea ? 0.7 : 1,
            }}
            onMouseDown={() => handleSeatMouseDown(rowIndex, colIndex)}
            onMouseMove={() => handleSeatMouseMove(rowIndex, colIndex)}
          ></div>
        </TooltipTrigger>
        <TooltipContent>
          {seat.categoryId
            ? `${event.categories.find((c) => c._id === seat.categoryId)?.name || ""} ${
                seat.subcategoryId
                  ? `- ${
                      event.categories
                        .find((c) => c._id === seat.categoryId)
                        ?.subcategories.find(
                          (s) => s._id === seat.subcategoryId
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
  );
}
