// components/ProductCalculator.tsx
"use client";

import { useState, useRef } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import db from "@/data/items.json";

ChartJS.register(ArcElement, Tooltip, Legend);

// Define types for the JSON data
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

  const addProduct = () => {
    if (!currentProduct.category || !currentProduct.type) return;

    const categoryProducts = productEmissions[currentProduct.category];
    const productData = categoryProducts[currentProduct.type];
    if (!productData) return;

    const productionEmissions = productData.value * currentProduct.quantity;
    const usageEmission = (usageEmissions[currentProduct.type] || 0) * 3; // 3-year lifespan

    setProducts([
      ...products,
      {
        category: currentProduct.category,
        type: currentProduct.type,
        quantity: currentProduct.quantity,
        emissions: productionEmissions + usageEmission,
        label: productData.label,
      },
    ]);

    setCurrentProduct({ category: "", type: "", quantity: 1 });
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const totalEmissions = products.reduce((sum, p) => sum + p.emissions, 0);
  const averageMonthly = 200;

  const chartData = {
    labels: products.map((p) => p.label),
    datasets: [
      {
        label: "Emissions (kg CO2e)",
        data: products.map((p) => p.emissions),
        backgroundColor: [
          "#059669",
          "#065f46",
          "#047857",
          "#10b981",
          "#a7f3d0",
          "#34d399",
          "#059669",
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black/80 backdrop-blur-lg rounded-xl shadow-xl border-2 border-emerald-500">
      {/* Gradient Heading */}
      <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-tl from-slate-800 via-emerald-500 to-zinc-400 bg-clip-text text-transparent">
        Product Carbon Calculator
      </h2>

      {/* Form Section */}
      <div ref={formRef} className="bg-slate-900 p-6 rounded-xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            className="p-3 border-2 border-emerald-600 rounded-lg bg-slate-800 text-white"
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
            {Object.entries(productEmissions).map(([category]) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <select
            className="p-3 border-2 border-emerald-600 rounded-lg bg-slate-800 text-white"
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

          <div className="relative">
            <input
              type="number"
              min="1"
              placeholder="Quantity"
              className="w-full p-3 border-2 border-emerald-600 rounded-lg bg-slate-800 text-white"
              value={currentProduct.quantity}
              onChange={(e) =>
                setCurrentProduct({
                  ...currentProduct,
                  quantity: Math.max(1, parseInt(e.target.value)),
                })
              }
            />
            {currentProduct.type && (
              <span className="absolute right-3 top-3.5 text-emerald-400">
                {currentProduct.category &&
                  productEmissions[currentProduct.category][currentProduct.type]
                    ?.unit}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={addProduct}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!currentProduct.type}
        >
          Add Product
        </button>
      </div>

      {/* Emissions Breakdown Section */}
      {products.length > 0 && (
        <div className="space-y-8">
          <div className="bg-slate-900 p-6 rounded-xl shadow-sm">
            <h3 className="text-2xl font-semibold mb-6 bg-gradient-to-tl from-slate-800 via-emerald-500 to-zinc-400 bg-clip-text text-transparent">
              Emissions Breakdown
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-64">
                <Pie
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "bottom" },
                    },
                  }}
                />
              </div>

              <div className="space-y-4">
                {products.map((product, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-slate-800 p-4 rounded-lg"
                  >
                    <div>
                      <span className="font-medium bg-gradient-to-tl from-slate-800 via-emerald-500 to-zinc-400 bg-clip-text text-transparent">
                        {product.label}
                      </span>
                      <span className="text-emerald-400 ml-2">
                        (x{product.quantity})
                      </span>
                    </div>
                    <span className="text-emerald-400 font-semibold">
                      {product.emissions.toFixed(1)} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Total Emissions Section */}
          <div className="bg-emerald-800 text-white p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">
              Total Carbon Footprint: {totalEmissions.toFixed(1)} kg CO2e
            </h3>

            <div className="w-full bg-emerald-100 h-4 rounded-full mb-4">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    (totalEmissions / averageMonthly) * 100
                  )}%`,
                  opacity: 0.9,
                }}
              />
            </div>

            <p className="text-emerald-200">
              This represents {(totalEmissions / 1000).toFixed(2)} metric tons -{" "}
              equivalent to {(totalEmissions / 4.6).toFixed(1)} months of average
              personal emissions
            </p>
          </div>

          {/* Reduction Recommendations */}
          {totalEmissions > averageMonthly && (
            <div className="bg-amber-50 p-6 rounded-xl">
              <h4 className="text-xl font-semibold text-amber-800 mb-3">
                Reduction Recommendations
              </h4>
              <ul className="list-disc pl-6 space-y-2 text-amber-700">
                <li>Choose refurbished electronics instead of new</li>
                <li>Opt for plant-based protein sources over beef</li>
                <li>Extend clothing lifespan through proper care</li>
                <li>Select concentrated household products</li>
              </ul>
            </div>
          )}

          <div className="text-sm text-emerald-400 mt-8">
            <p>
              * Emission factors based on lifecycle assessments from the{" "}
              <a
                href="https://www.epa.gov/climateleadership"
                className="underline ml-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                EPA Climate Leadership
              </a>{" "}
              and peer-reviewed studies
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
