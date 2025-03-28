"use client";

import { useState, useRef } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import db from "@/data/items.json";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

ChartJS.register(ArcElement, Tooltip, Legend);

type EmissionData = {
  value: number;
  label: string;
  unit: string;
};

type ProductEmissionsType = {
  [category: string]: {
    [product: string]: EmissionData;
  };
};

type UsageEmissionsType = {
  [product: string]: number;
};

const productEmissions: ProductEmissionsType = db.productEmissions;
const usageEmissions: UsageEmissionsType = db.usageEmissions;

type Product = {
  category: keyof ProductEmissionsType;
  type: string;
  quantity: number;
  emissions: number;
  label: string;
};

export default function ProductCalculator() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<{
    category: keyof ProductEmissionsType | "";
    type: string;
    quantity: number;
  }>({ category: "", type: "", quantity: 1 });

  const formRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const getRating = (total: number) => {
    if (total < 200) return { text: "Very Good", color: "#34d399" };
    if (total < 400) return { text: "Good", color: "#10b981" };
    if (total < 600) return { text: "Okay", color: "#facc15" };
    return { text: "Bad", color: "#ef4444" };
  };

  const removeProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const addProduct = () => {
    if (!currentProduct.category || !currentProduct.type) return;

    const productData = productEmissions[currentProduct.category][currentProduct.type];
    if (!productData) return;

    const productionEmissions = productData.value * currentProduct.quantity;
    const usageEmission = (usageEmissions[currentProduct.type] || 0) * 3;
    const totalEmissions = productionEmissions + usageEmission;

    setProducts((prev) => [
      ...prev,
      {
        category: currentProduct.category,
        type: currentProduct.type,
        quantity: currentProduct.quantity,
        emissions: totalEmissions,
        label: productData.label,
      },
    ]);

    setCurrentProduct({ category: "", type: "", quantity: 1 });
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const totalEmissions = products.reduce((sum, p) => sum + p.emissions, 0);
  const averageMonthly = 200;
  const rating = getRating(totalEmissions);

  const chartData = {
    labels: products.map((p) => `${p.label} (${p.emissions.toFixed(1)} kg)`),
    datasets: [{
      label: "Emissions (kg CO2e)",
      data: products.map((p) => p.emissions),
      backgroundColor: ["#059669","#065f46","#047857","#10b981","#a7f3d0","#34d399","#059669"],
      borderWidth: 0,
    }],
  };

  // Helper function to convert hex color to an RGB array.
  const hexToRgb = (hex: string): [number, number, number] => {
    hex = hex.replace("#", "");
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  };

  const generateReport = async () => {
    if (!reportRef.current || !chartRef.current) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // ---- Header Section ----
    const headerHeight = 30;
    // Draw header background
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, headerHeight, "F");

    // Header title
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("Carbon Footprint Report", pageWidth / 2, 20, { align: "center" });

    // Header subtitle: Generation date
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 27, { align: "center" });

    // ---- Body Section ----
    let yPos = headerHeight + 10;

    // Total Emissions
    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129);
    doc.text(`Total Emissions: ${totalEmissions.toFixed(1)} kg CO2e`, margin, yPos);

    yPos += 10;
    // Rating Box Background
    const reportRating = getRating(totalEmissions);
    const [r, g, b] = hexToRgb(reportRating.color);
    const ratingBoxWidth = 50;
    const ratingBoxHeight = 10;
    doc.setFillColor(r, g, b);
    doc.roundedRect(margin, yPos - 7, ratingBoxWidth, ratingBoxHeight, 2, 2, "F");

    // Rating Text (centered in the box)
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`Rating: ${reportRating.text}`, margin + ratingBoxWidth / 2, yPos - 1, { align: "center" });

    yPos += 12;

    // Capture chart image with a light gray border
    const chartCanvas = await html2canvas(chartRef.current);
    const chartImg = chartCanvas.toDataURL("image/png");
    const chartWidth = pageWidth - margin * 2;
    const chartHeight = chartWidth * 0.5;
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.rect(margin - 2, yPos - 2, chartWidth + 4, chartHeight + 4);
    doc.addImage(chartImg, "PNG", margin, yPos, chartWidth, chartHeight);

    yPos += chartHeight + 10;

    // ---- Product List ----
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Product Details:", margin, yPos);
    yPos += 6;
    doc.setFontSize(12);
    products.forEach((product, index) => {
      if (yPos > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(
        `${index + 1}. ${product.label} (x${product.quantity}) - ${product.emissions.toFixed(1)} kg CO2e`,
        margin,
        yPos
      );
      yPos += 7;
    });

    // ---- Sustainability Recommendations (if applicable) ----
    if (totalEmissions > 200) {
      yPos += 8;
      doc.setFontSize(14);
      doc.setTextColor(52, 211, 153);
      doc.text("Sustainability Recommendations:", margin, yPos);
      yPos += 7;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      [
        "Choose refurbished electronics",
        "Opt for plant-based proteins",
        "Extend clothing lifespan",
        "Use concentrated products",
      ].forEach((rec) => {
        if (yPos > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(`• ${rec}`, margin + 5, yPos);
        yPos += 7;
      });
    }

    // Save the PDF with a filename based on the current date.
    doc.save(`Carbon_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <>
      <div
        ref={reportRef}
        className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-400/30 relative overflow-hidden"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-center animate-text-shine">
          Product Carbon Calculator
        </h2>

        {/* Form Section */}
        <div
          ref={formRef}
          className="relative bg-slate-800/50 p-8 rounded-2xl mb-10 backdrop-blur-sm border border-emerald-400/20 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-emerald-300/80 font-medium text-sm">
                Category
              </label>
              <select
                className="w-full p-3.5 rounded-xl bg-slate-900/70 border-2 border-emerald-400/20 focus:border-emerald-400/40 focus:ring-4 ring-emerald-400/20 transition-all appearance-none hover:bg-slate-900/90 text-white"
                value={currentProduct.category}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    category: e.target.value as keyof ProductEmissionsType,
                    type: "",
                  })
                }
              >
                <option value="">Select Category</option>
                {Object.entries(productEmissions)
                  .filter(([category]) => category !== "transport")
                  .map(([category]) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
              </select>
            </div>

            {/* Product */}
            <div className="space-y-2">
              <label className="text-emerald-300/80 font-medium text-sm">
                Product
              </label>
              <select
                className="w-full p-3.5 rounded-xl bg-slate-900/70 border-2 border-emerald-400/20 focus:border-emerald-400/40 focus:ring-4 ring-emerald-400/20 transition-all appearance-none hover:bg-slate-900/90 text-white"
                value={currentProduct.type}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    type: e.target.value,
                  })
                }
                disabled={!currentProduct.category}
              >
                <option value="">Select Product</option>
                {currentProduct.category &&
                  Object.entries(productEmissions[currentProduct.category]).map(
                    ([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    )
                  )}
              </select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-emerald-300/80 font-medium text-sm">
                Quantity
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  className="w-full p-3.5 rounded-xl bg-slate-900/70 border-2 border-emerald-400/20 focus:border-emerald-400/40 focus:ring-4 ring-emerald-400/20 transition-all hover:bg-slate-900/90 text-white pr-12"
                  value={currentProduct.quantity}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      quantity: Math.max(1, parseInt(e.target.value)),
                    })
                  }
                />
                {currentProduct.type && (
                  <span className="absolute right-3 top-3.5 text-emerald-400/60">
                    {currentProduct.category &&
                      productEmissions[currentProduct.category][currentProduct.type]?.unit}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Add Product Button */}
          <button
            onClick={addProduct}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 rounded-xl text-white font-semibold tracking-wide transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:pointer-events-none group"
            disabled={!currentProduct.type}
          >
            <span className="inline-block group-hover:translate-x-1 transition-transform">
              Add Product →
            </span>
          </button>
        </div>

        {/* Emissions Breakdown */}
        {products.length > 0 && (
          <div className="space-y-10">
            {/* Breakdown Container */}
            <div className="bg-slate-800/50 p-8 rounded-2xl backdrop-blur-sm border border-emerald-400/20 shadow-lg">
              <h3 className="text-2xl font-bold mb-8 bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                Emissions Breakdown
              </h3>

              <div className="grid lg:grid-cols-2 gap-10 items-center">
                {/* Pie Chart Container */}
                <div ref={chartRef} className="relative h-72 w-full mx-auto">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Pie
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                            labels: {
                              color: "#d1fae5",
                              font: { size: 14 },
                              padding: 20,
                            },
                          },
                        },
                        elements: {
                          arc: {
                            borderWidth: 0,
                            borderRadius: 0,
                            spacing: 0,
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Emissions List + Total */}
                <div className="space-y-4">
                  {products.map((product, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-emerald-400/10 hover:border-emerald-400/20 transition-all group hover:-translate-x-2"
                    >
                      <div className="flex items-center space-x-3">
                        {/* Chart color dot */}
                        <div
                          className={`w-3 h-3 rounded-full bg-[${
                            chartData.datasets[0].backgroundColor[index]
                          }]`}
                        ></div>
                        <span className="font-medium text-emerald-100/90">
                          {product.label}
                          <span className="text-emerald-400/60 ml-2">
                            ×{product.quantity}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-emerald-400 font-semibold bg-slate-900/50 px-3 py-1 rounded-lg">
                          {product.emissions.toFixed(1)} kg
                        </span>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeProduct(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 
                            4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 
                            00-1 1v3m-4 0h14"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Total CO2 Display */}
                  <div className="pt-6 border-t border-emerald-400/10 text-emerald-200">
                    <span className="text-xl font-bold">
                      Total: {totalEmissions.toFixed(1)} kg CO2e
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Big Total Display */}
            <div className="relative bg-gradient-to-br from-emerald-600/80 to-cyan-600/80 p-8 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
              <h3 className="text-2xl font-bold mb-6 text-white">
                Total Carbon Footprint
              </h3>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="text-5xl font-bold text-white drop-shadow">
                  {totalEmissions.toFixed(1)}
                  <span className="text-2xl ml-2 text-emerald-100/80">
                    kg CO2e
                  </span>
                </div>
                <div className="h-16 w-px bg-white/20"></div>
                <div className="text-emerald-100/80">
                  <p>{(totalEmissions / 1000).toFixed(2)} metric tons</p>
                  <p>≈ {(totalEmissions / 4.6).toFixed(1)} months of emissions</p>
                </div>
              </div>

              {/* Rating Indicator */}
              <div className="text-center mt-4">
                <span
                  style={{ color: rating.color }}
                  className="text-2xl font-bold"
                >
                  {rating.text}
                </span>
              </div>

              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(
                      100,
                      (totalEmissions / averageMonthly) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Optional Recommendations */}
            {totalEmissions > averageMonthly && (
              <div className="bg-slate-800/50 p-8 rounded-2xl backdrop-blur-sm border border-cyan-400/20">
                <h4 className="text-xl font-semibold mb-6 text-cyan-300 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 15.5V22m0-4.5a1.5 1.5 0 010-3 1.5 1.5 0 010 3z" />
                  </svg>
                  Sustainability Recommendations
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: "♻️", text: "Choose refurbished electronics" },
                    { icon: "🌱", text: "Opt for plant-based proteins" },
                    { icon: "👕", text: "Extend clothing lifespan" },
                    { icon: "🧴", text: "Use concentrated products" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 p-3 bg-slate-900/30 rounded-lg hover:bg-slate-900/50 transition-all"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-emerald-100/90">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center text-sm text-emerald-300/60">
              <p>
                Emission factors sourced from{" "}
                <a
                  href="https://www.epa.gov/climateleadership"
                  className="underline hover:text-emerald-300 transition-colors"
                >
                  EPA Climate Leadership
                </a>{" "}
                and peer-reviewed studies
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed PDF Report Generator Button */}
      <button
        onClick={generateReport}
        className="fixed bottom-4 right-4 py-3 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 rounded-xl text-white font-semibold shadow-lg transition-all"
      >
        Generate PDF Report
      </button>
    </>
  );
}
