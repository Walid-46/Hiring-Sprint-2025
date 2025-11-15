"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Bot, Activity, DollarSign } from "lucide-react";
import { X } from "lucide-react";

interface ImageData {
  base64: string;
  summary: string;
}

interface AnalysisResult {
  summary: string;
  severity: number;
  cost: number;
}

export default function Dashboard() {
  const [results, setResults] = useState<any[] | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<any | null>(null);
  const [modalLabel, setModalLabel] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("compareResults");
      if (raw) {
        const parsed = JSON.parse(raw);
        setResults(parsed);
        // Optionally remove stored results so they don't persist
        localStorage.removeItem("compareResults");
      }
    } catch (err) {
      console.warn("Failed to parse compareResults from localStorage", err);
    }
  }, []);

  return (
    <div className="ml-64 min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Title */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Vehicle Condition Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            View analyzed vehicle inspection images and damage assessments.
          </p>
        </div>

        {/* If we have compare results from upload, display them grouped into chunks of 4 */}
        {results && results.length > 0 ? (
          <div className="space-y-8">
            {Array.from({ length: Math.ceil(results.length / 4) }).map(
              (_, gi) => {
                const group = results.slice(gi * 4, gi * 4 + 4);
                return (
                  <div
                    key={gi}
                    className="bg-white rounded-2xl shadow p-6 border border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Pickup column (2x2 grid) */}
                      <div>
                        <h4 className="font-semibold mb-3 text-black">
                          Pick-up (annotated)
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {group.map((item: any, idx: number) => (
                            <div key={idx} className="space-y-2">
                              <img
                                src={item.pickup_annotated_base64}
                                className="w-full h-40 object-cover rounded-lg border cursor-pointer"
                                onClick={() => {
                                  setModalSrc(item.pickup_annotated_base64);
                                  setModalItem(item);
                                  setModalLabel(
                                    `Pick-up: ${item.pickup_filename || ""}`
                                  );
                                  setModalOpen(true);
                                }}
                              />
                              <div className="text-sm text-gray-600">
                                New: {item.new_damage_count} • Unchanged:{" "}
                                {item.unchanged_damage_count}
                              </div>
                              {item.new_damage_details &&
                                item.new_damage_details.length > 0 && (
                                  <div className="text-xs text-gray-700 font-medium">
                                    {item.new_damage_details.map(
                                      (d: any, di: number) => (
                                        <div key={di}>
                                          Damage Type: {d.label} • Confidence:{" "}
                                          {d.confidence?.toFixed
                                            ? d.confidence.toFixed(2)
                                            : d.confidence}{" "}
                                          • Severity: {d.severity}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Return column (2x2 grid) */}
                      <div>
                        <h4 className="font-semibold mb-3 text-black">
                          Return (annotated)
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {group.map((item: any, idx: number) => (
                            <div key={idx} className="space-y-2">
                              <img
                                src={item.return_annotated_base64}
                                className="w-full h-40 object-cover rounded-lg border cursor-pointer"
                                onClick={() => {
                                  setModalSrc(item.return_annotated_base64);
                                  setModalItem(item);
                                  setModalLabel(
                                    `Return: ${item.return_filename || ""}`
                                  );
                                  setModalOpen(true);
                                }}
                              />
                              <div className="text-sm text-gray-600">
                                New: {item.new_damage_count} • Unchanged:{" "}
                                {item.unchanged_damage_count}
                              </div>
                              {item.new_damage_details &&
                                item.new_damage_details.length > 0 && (
                                  <div className="text-xs text-gray-700 font-medium">
                                    {item.new_damage_details.map(
                                      (d: any, di: number) => (
                                        <div key={di}>
                                          Damage Type: {d.label} • Confidence:{" "}
                                          {d.confidence?.toFixed
                                            ? d.confidence.toFixed(2)
                                            : d.confidence}{" "}
                                          • Severity: {d.severity}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* fallback placeholder content when no results available */}
            <motion.div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow">
              <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3EImage Placeholder%3C/text%3E%3C/svg%3E"
                  }
                  alt={`Placeholder`}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6">
                <div className="flex items-start gap-3">
                  <ImageIcon className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      No results
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Upload images from the Upload Images page to see
                      comparisons here.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {modalOpen && modalSrc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setModalOpen(false)}
            />

            <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 p-4 z-10">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-3 top-3 bg-gray-100 p-1 rounded-full"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {modalLabel && (
                <h4 className="text-lg font-semibold mb-2">{modalLabel}</h4>
              )}

              <div className="flex flex-col md:flex-row gap-4">
                <img
                  src={modalSrc}
                  alt={modalLabel || "image"}
                  className="max-h-[70vh] w-full object-contain rounded"
                />

                <div className="w-full md:w-1/3 overflow-auto">
                  <h5 className="font-semibold text-gray-900">New Damage</h5>
                  {modalItem?.new_damage_details?.length ? (
                    modalItem.new_damage_details.map((d: any, i: number) => (
                      <div
                        key={i}
                        className="text-sm text-gray-800 mb-2 bg-gray-50 p-2 rounded"
                      >
                        <div className="font-semibold text-gray-900">
                          Damage Type: {d.label}
                        </div>
                        <div className="text-gray-700">
                          Confidence:{" "}
                          {d.confidence?.toFixed
                            ? d.confidence.toFixed(2)
                            : d.confidence}
                        </div>
                        <div className="text-gray-700">
                          Severity: {d.severity}
                        </div>
                        {d.bbox && (
                          <div className="text-xs text-gray-600">
                            BBox: [{d.bbox.join(", ")}]
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-600">None</div>
                  )}

                  <h5 className="font-semibold mt-3 text-gray-900">
                    Unchanged Damage
                  </h5>
                  {modalItem?.unchanged_damage_details?.length ? (
                    modalItem.unchanged_damage_details.map(
                      (d: any, i: number) => (
                        <div
                          key={i}
                          className="text-sm text-gray-800 mb-2 bg-gray-50 p-2 rounded"
                        >
                          <div className="font-semibold text-gray-900">
                            Damage Type: {d.label}
                          </div>
                          <div className="text-gray-700">
                            Confidence:{" "}
                            {d.confidence?.toFixed
                              ? d.confidence.toFixed(2)
                              : d.confidence}
                          </div>
                          <div className="text-gray-700">
                            Severity: {d.severity}
                          </div>
                          {d.bbox && (
                            <div className="text-xs text-gray-600">
                              BBox: [{d.bbox.join(", ")}]
                            </div>
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-sm text-gray-600">None</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* (Run Analysis moved to upload flow) */}

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
