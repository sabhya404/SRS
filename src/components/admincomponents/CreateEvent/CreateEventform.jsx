"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/admincomponents/CreateEvent/Stepper";
import { OrganizerCheck } from "@/components/admincomponents/CreateEvent/OrganiserCheck";
import {
  BasicInfoStep,
  LocationStep,
  SeatingStep,
  ReviewSubmitStep,
} from "../CreateEvent/Steps/steps";

const CreateEventForm = ({ isOrganizer }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    type: "Movie",
    location: {
      address: "",
      city: "",
      country: "",
    },
    capacity: 0,
    categories: [],
    coverImage: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [totalSeatSum, setTotalSeatSum] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [preview, setPreview] = useState("");

  // Calculate total seats from categories
  useEffect(() => {
    const sum = formData.categories.reduce(
      (acc, category) => acc + (category.totalSeats || 0),
      0
    );
    setTotalSeatSum(sum);
  }, [formData.categories]);

  // Update image preview
  useEffect(() => {
    if (formData.coverImage) {
      setPreview(formData.coverImage);
    }
  }, [formData.coverImage]);

  // Category management functions
  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[index][field] = value;
    setFormData({ ...formData, categories: updatedCategories });
  };

  const handleSubcategoryChange = (categoryIndex, subIndex, field, value) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[categoryIndex].subcategories[subIndex][field] = value;
    setFormData({ ...formData, categories: updatedCategories });
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
    const updatedCategories = formData.categories.filter((_, i) => i !== index);
    setFormData({ ...formData, categories: updatedCategories });
  };

  const addSubcategory = (categoryIndex) => {
    const updatedCategories = [...formData.categories];
    if (!updatedCategories[categoryIndex].subcategories) {
      updatedCategories[categoryIndex].subcategories = [];
    }
    updatedCategories[categoryIndex].subcategories.push({
      subName: "",
      subSeats: 0,
    });
    setFormData({ ...formData, categories: updatedCategories });
  };

  const removeSubcategory = (categoryIndex, subIndex) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[categoryIndex].subcategories = updatedCategories[
      categoryIndex
    ].subcategories.filter((_, i) => i !== subIndex);
    setFormData({ ...formData, categories: updatedCategories });
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (totalSeatSum !== formData.capacity) {
      setError(
        `Total seats in categories (${totalSeatSum}) must equal event capacity (${formData.capacity})`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      // Validate categories
      for (const category of formData.categories) {
        if (!category.subcategories || category.subcategories.length === 0) {
          setError(
            `Category "${category.name}" must have at least one subcategory`
          );
          setIsSubmitting(false);
          return;
        }

        const subSum = category.subcategories.reduce(
          (acc, sub) => acc + (sub.subSeats || 0),
          0
        );

        if (subSum > category.totalSeats) {
          setError(
            `Subcategories in "${category.name}" exceed total seats (${subSum} > ${category.totalSeats})`
          );
          setIsSubmitting(false);
          return;
        }
      }

      // API call
      const response = await axios.post("/api/event/create", formData);
      if (response.data.success) {
        setSuccess("Event created successfully!");
        router.refresh();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to create Event";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stepper navigation
  const nextStep = () => {
    if (activeStep < 4) setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  // Step configurations
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

  if (!isOrganizer) return <OrganizerCheck router={router} />;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-blue-600 text-white">
          <h2 className="text-2xl font-bold">Create New Event</h2>
          <p className="text-blue-100">
            Fill in the details to create your event
          </p>
        </div>

        <div className="p-6">
          <Stepper activeStep={activeStep} />
          <form onSubmit={handleSubmit}>{steps[activeStep]}</form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventForm;
