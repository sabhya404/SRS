// components/VenueBuilder/Legend.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Legend({ event, categoryColors, subcategoryColors }) {
  return (
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
  );
}
