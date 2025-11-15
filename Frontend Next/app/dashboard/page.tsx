"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Bot,
  Activity,
  DollarSign,
} from "lucide-react";
import ImageCompare from "../page";

export default function Page() {
  const [pickupImages, setPickupImages] = useState<File[]>([]);
  const [returnImages, setReturnImages] = useState<File[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "pickup" | "return"
  ) => {
    const files = Array.from(e.target.files || []);
    if (type === "pickup") setPickupImages(files);
    else setReturnImages(files);
  };

  // --- Mock LLM analysis (replace with your backend fetch) ---
  const runAnalysis = async () => {
    setLoading(true);

    // You will send pickupImages + returnImages to your API
    // const result = await fetch("/api/analyze-damage", {...})

    setTimeout(() => {
      setAnalysis({
        summary: "Detected new scratch on right door area. Minor paint damage.",
        severity: 32, // out of 100
        cost: 120, // USD
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 flex justify-center">
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
        </div>

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
                  <img
                    key={idx}
                    src={URL.createObjectURL(img)}
                    className="w-full h-24 object-cover rounded-lg shadow border"
                  />
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
                  <img
                    key={idx}
                    src={URL.createObjectURL(img)}
                    className="w-full h-24 object-cover rounded-lg shadow border"
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* AI Run Button */}
        <div className="flex justify-center">
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-md transition-all disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Run Damage Analysis"}
          </button>
        </div>
        {pickupImages.length > 0 && returnImages.length > 0 && (
          <div className="mt-14">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Before / After Comparison
            </h3>
            <ImageCompare
              before={URL.createObjectURL(pickupImages[0])}
              after={URL.createObjectURL(returnImages[0])}
            />
          </div>
        )}
        {/* --- AI ANALYSIS PANEL --- */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Bot className="w-6 h-6 text-indigo-600" />
              AI Analysis Results
            </h3>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Activity className="text-blue-600" />
                <p className="text-gray-700">
                  <span className="font-medium">Damage Summary:</span>{" "}
                  {analysis.summary}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Activity className="text-yellow-600" />
                <p className="text-gray-700">
                  <span className="font-medium">Severity Score:</span>{" "}
                  {analysis.severity}/100
                </p>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="text-green-600" />
                <p className="text-gray-700">
                  <span className="font-medium">Estimated Repair Cost:</span> $
                  {analysis.cost}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
