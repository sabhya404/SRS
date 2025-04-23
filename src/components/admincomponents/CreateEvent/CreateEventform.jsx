"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Component Imports
import { Stepper } from "@/components/admincomponents/CreateEvent/Stepper";
import { OrganizerCheck } from "@/components/admincomponents/CreateEvent/OrganiserCheck";
import {
  BasicInfoStep,
  LocationStep,
  SeatingStep,
  ReviewSubmitStep,
} from "../CreateEvent/Steps/steps";

// Main Create Event Form Component
const CreateEventForm = ({ isOrganizer }) => {
  const router = useRouter();

  // Initialize form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    type: "Select",
    location: {
      address: "",
      city: "",
      country: "",
    },
    capacity: 0,
    categories: [],
    coverImage: "",
  });

  // Local state variables
  const [activeStep, setActiveStep] = useState(1);
  const [totalSeatSum, setTotalSeatSum] = useState(0);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate total number of seats based on categories
  useEffect(() => {
    const sum = formData.categories.reduce(
      (acc, category) => acc + (category.totalSeats || 0),
      0
    );
    setTotalSeatSum(sum);
  }, [formData.categories]);

  // Generate image preview when cover image is set
  useEffect(() => {
    if (formData.coverImage) {
      setPreview(formData.coverImage);
    }
  }, [formData.coverImage]);

  // ===== Category & Subcategory Handlers =====

  const handleCategoryChange = (index, field, value) => {
    const updated = [...formData.categories];
    updated[index][field] = value;
    setFormData({ ...formData, categories: updated });
  };

  const handleSubcategoryChange = (catIndex, subIndex, field, value) => {
    const updated = [...formData.categories];
    updated[catIndex].subcategories[subIndex][field] = value;
    setFormData({ ...formData, categories: updated });
  };

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [
        ...formData.categories,
        { name: "", totalSeats: 0, subcategories: [] },
      ],
    });
  };

  const removeCategory = (index) => {
    const updated = formData.categories.filter((_, i) => i !== index);
    setFormData({ ...formData, categories: updated });
  };

  const addSubcategory = (catIndex) => {
    const updated = [...formData.categories];
    if (!updated[catIndex].subcategories) {
      updated[catIndex].subcategories = [];
    }
    updated[catIndex].subcategories.push({ subName: "", subSeats: 0 });
    setFormData({ ...formData, categories: updated });
  };

  const removeSubcategory = (catIndex, subIndex) => {
    const updated = [...formData.categories];
    updated[catIndex].subcategories = updated[catIndex].subcategories.filter(
      (_, i) => i !== subIndex
    );
    setFormData({ ...formData, categories: updated });
  };

  // Submit Handler

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Validate total seat sum
    if (totalSeatSum !== formData.capacity) {
      setError(
        `Total seats in categories (${totalSeatSum}) must equal event capacity (${formData.capacity})`
      );
      setIsSubmitting(false);
      return;
    }

    // Validate each category and its subcategories
    for (const category of formData.categories) {
      if (!category.subcategories || category.subcategories.length === 0) {
        setError(
          `Category "${category.name}" must have at least one subcategory`
        );
        setIsSubmitting(false);
        return;
      }

      const subTotal = category.subcategories.reduce(
        (acc, sub) => acc + (sub.subSeats || 0),
        0
      );

      if (subTotal > category.totalSeats) {
        setError(
          `Subcategories in "${category.name}" exceed total seats (${subTotal} > ${category.totalSeats})`
        );
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Make API request to create the event
      const response = await axios.post("/api/event/create", formData);

      if (response.data.success) {
        setSuccess("Event created successfully!");
        router.refresh();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to create Event";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  //Step Navigation Handlers

  const nextStep = () => {
    if (activeStep < 4) setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (activeStep > 1) setActiveStep((prev) => prev - 1);
  };

  //Steps Configuration

  const steps = {
    1: (
      <BasicInfoStep
        formData={formData}
        setFormData={setFormData}
        preview={preview}
        nextStep={nextStep}
      />
    ),
    2: (
      <LocationStep
        formData={formData}
        setFormData={setFormData}
        prevStep={prevStep}
        nextStep={nextStep}
      />
    ),
    3: (
      <SeatingStep
        formData={formData}
        totalSeatSum={totalSeatSum}
        handleCategoryChange={handleCategoryChange}
        handleSubcategoryChange={handleSubcategoryChange}
        addCategory={addCategory}
        removeCategory={removeCategory}
        addSubcategory={addSubcategory}
        removeSubcategory={removeSubcategory}
        prevStep={prevStep}
        nextStep={nextStep}
      />
    ),
    4: (
      <ReviewSubmitStep
        formData={formData}
        totalSeatSum={totalSeatSum}
        error={error}
        success={success}
        isSubmitting={isSubmitting}
        handleSubmit={handleSubmit}
        prevStep={prevStep}
      />
    ),
  };

  // If user is not an organizer, block access
  if (!isOrganizer) return <OrganizerCheck router={router} />;

  // Render the Create Event Form
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-blue-600 text-white">
          <h2 className="text-2xl font-bold">Create New Event</h2>
          <p className="text-blue-100">
            Fill in the details to create your event
          </p>
        </div>

        {/* Step Content */}
        <div className="p-6">
          <Stepper activeStep={activeStep} />
          <form onSubmit={handleSubmit}>{steps[activeStep]}</form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventForm;
