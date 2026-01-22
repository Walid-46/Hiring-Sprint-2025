"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Camera, Upload, Image as ImageIcon, X, Send } from "lucide-react";

export default function Page() {
  const [pickupImages, setPickupImages] = useState<File[]>([]);
  const [returnImages, setReturnImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "pickup" | "return",
  ) => {
    const files = Array.from(e.target.files || []);
    const currentImages = type === "pickup" ? pickupImages : returnImages;
    const totalNewImages = currentImages.length + files.length;

    // Check if images exceed 4 per type
    if (totalNewImages > 4) {
      alert(
        `You can upload up to 4 ${type} images. You currently have ${currentImages.length}.`,
      );
      return;
    }

    if (type === "pickup") setPickupImages([...currentImages, ...files]);
    else setReturnImages([...currentImages, ...files]);
  };

  const removeImage = (index: number, type: "pickup" | "return") => {
    if (type === "pickup") {
      setPickupImages(pickupImages.filter((_, idx) => idx !== index));
    } else {
      setReturnImages(returnImages.filter((_, idx) => idx !== index));
    }
  };

  const loadTestImages = async (pickupImage: string, returnImage: string) => {
    try {
      const pickupRes = await fetch(pickupImage);
      const pickupBlob = await pickupRes.blob();
      const pickupFile = new File([pickupBlob], "pickup-test.jpg", {
        type: "image/jpeg",
      });

      const returnRes = await fetch(returnImage);
      const returnBlob = await returnRes.blob();
      const returnFile = new File([returnBlob], "return-test.jpg", {
        type: "image/jpeg",
      });

      setPickupImages([pickupFile]);
      setReturnImages([returnFile]);
      setError(null);
    } catch (err) {
      setError("Failed to load test images");
    }
  };

  const uploadImages = async () => {
    // Check if both types have at least one image
    if (pickupImages.length === 0 || returnImages.length === 0) {
      setError("Please upload both pick-up and return photos");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();

      // Add pickup images
      pickupImages.forEach((file) => {
        formData.append("pickup_images", file);
      });

      // Add return images (FastAPI expects 'returned_images')
      returnImages.forEach((file) => {
        formData.append("returned_images", file);
      });

      const response = await fetch(
        "https://walid46-vehicle-damage-detection.hf.space/compare-batch",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setSuccess(true);
      setError(null);
      console.log("Upload successful:", data);

      // store results and navigate to dashboard to display
      if (data && data.results) {
        try {
          localStorage.setItem("compareResults", JSON.stringify(data.results));
        } catch (err) {
          console.warn("Failed to save results to localStorage", err);
        }
        router.push("/");
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-64 min-h-screen bg-gray-50 py-12 px-6 flex justify-center">
      <div className="w-full max-w-6xl space-y-12">
        {/* Title */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Vehicle Condition Assessment
          </h1>
          <p className="text-gray-600 mt-2">
            Upload pick-up and return photos. The AI will detect damages, rate
            severity, and estimate repair costs.
          </p>
          <p className="text-gray-600 mt-2">
            one pickup and one return image is required!
          </p>
        </div>

        {/* Test Images Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            📸 Test with Sample Images
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Click on any pair of images below to quickly test the app:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Black Car Test */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() =>
                loadTestImages("/blackNew.jpg", "/blackDamaged.jpg")
              }
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white hover:shadow-md transition-shadow border border-blue-100"
            >
              <div className="flex gap-1 w-full">
                <img
                  src="/blackNew.jpg"
                  alt="Black car pickup"
                  className="w-1/2 h-16 object-cover rounded"
                />
                <img
                  src="/blackDamaged.jpg"
                  alt="Black car damaged"
                  className="w-1/2 h-16 object-cover rounded"
                />
              </div>
              <span className="text-xs font-medium text-gray-700">
                Black Car
              </span>
            </motion.button>

            {/* Red Car Test */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => loadTestImages("/redNew.jpg", "/redDamaged.jpg")}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white hover:shadow-md transition-shadow border border-blue-100"
            >
              <div className="flex gap-1 w-full">
                <img
                  src="/redNew.jpg"
                  alt="Red car pickup"
                  className="w-1/2 h-16 object-cover rounded"
                />
                <img
                  src="/redDamaged.jpg"
                  alt="Red car damaged"
                  className="w-1/2 h-16 object-cover rounded"
                />
              </div>
              <span className="text-xs font-medium text-gray-700">Red Car</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* PICKUP PANEL */}
          <motion.div
            className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
              <Camera className="w-5 h-5 text-blue-600" />
              Pick-up Photos
              <span className="text-sm font-normal text-gray-600">
                ({pickupImages.length}/4)
              </span>
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
                id="pickup-upload"
                onChange={(e) => handleImageUpload(e, "pickup")}
              />
              <label
                htmlFor="pickup-upload"
                className="cursor-pointer flex flex-col items-center text-gray-600"
              >
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <span>Upload or Capture Photos</span>
              </label>
            </div>

            {pickupImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {pickupImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(img)}
                      className="w-full h-24 object-cover rounded-lg shadow border"
                    />
                    <button
                      onClick={() => removeImage(idx, "pickup")}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* RETURN PANEL */}
          <motion.div
            className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Return Photos
              <span className="text-sm font-normal text-gray-500">
                ({returnImages.length}/4)
              </span>
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
                id="return-upload"
                onChange={(e) => handleImageUpload(e, "return")}
              />
              <label
                htmlFor="return-upload"
                className="cursor-pointer flex flex-col items-center text-gray-600"
              >
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <span>Upload or Capture Photos</span>
              </label>
            </div>

            {returnImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {returnImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(img)}
                      className="w-full h-24 object-cover rounded-lg shadow border"
                    />
                    <button
                      onClick={() => removeImage(idx, "return")}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Upload Button and Status Messages */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <button
              onClick={uploadImages}
              disabled={
                loading ||
                pickupImages.length === 0 ||
                returnImages.length === 0
              }
              className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-md transition-all disabled:opacity-60 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              {loading ? "Uploading..." : "Upload & Analyze"}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-center"
            >
              ✓ Images uploaded successfully! Processing your analysis...
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
