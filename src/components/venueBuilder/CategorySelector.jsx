// components/VenueBuilder/CategorySelector.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CategorySelector({
  event,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  categoryColors,
  subcategoryColors,
  seatCounts,
  formatCounts,
  formatSubCounts,
}) {
  return (
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
                className={`p-3 rounded-md cursor-pointer border-2 transition-all hover:brightness-95 ${
                  selectedCategory?._id === category._id
                    ? "border-primary shadow-sm"
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
                  <span
                    className={`text-sm px-2 py-0.5 rounded ${
                      seatCounts[category._id]?.total === category.totalSeats
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
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
                    className={`p-3 rounded-md cursor-pointer border-2 transition-all hover:brightness-95 ${
                      selectedSubcategory?._id === sub._id
                        ? "border-primary shadow-sm"
                        : "border-transparent"
                    }`}
                    style={{
                      backgroundColor: subcategoryColors[sub._id],
                    }}
                    onClick={() => setSelectedSubcategory(sub)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{sub.subName}</span>
                      <span
                        className={`text-sm px-2 py-0.5 rounded ${
                          seatCounts[selectedCategory._id]?.[sub._id] ===
                          sub.subSeats
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
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
  );
}
