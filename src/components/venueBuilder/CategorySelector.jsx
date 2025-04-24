import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CategorySelector({
  event, // Event object containing categories and subcategories
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  categoryColors,
  subcategoryColors,
  seatCounts, // Seat selection status for categories and subcategories
  formatCounts, // Function to format category seat counts
  formatSubCounts, // Function to format subcategory seat counts
}) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="categories" className="w-full">
          {/* toggle between categories and subcategories */}
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          </TabsList>

          {/*  CATEGORY TAB CONTENT */}
          <TabsContent value="categories" className="space-y-4">
            {event.categories.map((category) => {
              const isSelected = selectedCategory?._id === category._id;
              const isFullyBooked =
                seatCounts[category._id]?.total === category.totalSeats;

              return (
                <div
                  key={category._id}
                  className={`p-3 rounded-md cursor-pointer border-2 transition-all hover:brightness-95 ${
                    isSelected
                      ? "border-primary shadow-sm"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: categoryColors[category._id] }}
                  onClick={() => {
                    setSelectedCategory(category); // Select this category
                    setSelectedSubcategory(null); // Clear selected subcategory
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <span
                      className={`text-sm px-2 py-0.5 rounded ${
                        isFullyBooked
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {formatCounts(category)}
                    </span>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* === SUBCATEGORY TAB CONTENT === */}
          <TabsContent value="subcategories" className="space-y-4">
            {!selectedCategory ? (
              // Show prompt if no category is selected
              <div className="text-center py-4 text-gray-500">
                Select a category first
              </div>
            ) : (
              <>
                {/* Display selected category name */}
                <div className="mb-4 p-2 bg-gray-100 rounded-md">
                  <p className="font-medium">
                    Selected: {selectedCategory.name}
                  </p>
                </div>

                {/* List all subcategories within the selected category */}
                {selectedCategory.subcategories.map((sub) => {
                  const isSelected = selectedSubcategory?._id === sub._id;
                  const isFullyBooked =
                    seatCounts[selectedCategory._id]?.[sub._id] ===
                    sub.subSeats;

                  return (
                    <div
                      key={sub._id}
                      className={`p-3 rounded-md cursor-pointer border-2 transition-all hover:brightness-95 ${
                        isSelected
                          ? "border-primary shadow-sm"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: subcategoryColors[sub._id] }}
                      onClick={() => setSelectedSubcategory(sub)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{sub.subName}</span>
                        <span
                          className={`text-sm px-2 py-0.5 rounded ${
                            isFullyBooked
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {formatSubCounts(selectedCategory, sub)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
