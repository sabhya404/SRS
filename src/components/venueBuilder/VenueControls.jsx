// components/VenueBuilder/VenueControls.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export default function VenueControls({
  venue,
  setVenue,
  zoom,
  setZoom,
  isBulkSelecting,
  setIsBulkSelecting,
}) {
  return (
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
          {isBulkSelecting && (
            <p className="text-xs text-slate-500 mt-1">
              Click and drag to select multiple seats at once
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
