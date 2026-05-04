"use client";

import { useState } from "react";
import { AMAZON_ASSOCIATE_TAG } from "@/data/amazon";
import { getEquipmentForMethod, type CookingEquipment } from "@/data/amazon/equipmentAsins";

interface CookingEquipmentPanelProps {
  methodKey: string;
  methodName: string;
}

export function CookingEquipmentPanel({ methodKey, methodName }: CookingEquipmentPanelProps) {
  const equipment = getEquipmentForMethod(methodKey);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  if (equipment.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <p className="text-sm text-gray-500">No specific equipment recommendations for {methodName} yet.</p>
      </div>
    );
  }

  const toggleItem = (asin: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(asin)) next.delete(asin);
      else next.add(asin);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedItems(new Set(equipment.map((e) => e.asin)));
  };

  const handleAddToCart = () => {
    const items = equipment.filter((e) => selectedItems.has(e.asin));
    if (items.length === 0) return;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://www.amazon.com/gp/aws/cart/add.html";
    form.target = "_blank";
    form.style.display = "none";

    const tagInput = document.createElement("input");
    tagInput.type = "hidden";
    tagInput.name = "AssociateTag";
    tagInput.value = AMAZON_ASSOCIATE_TAG;
    form.appendChild(tagInput);

    items.forEach((item, idx) => {
      const pos = idx + 1;
      const asinInput = document.createElement("input");
      asinInput.type = "hidden";
      asinInput.name = `ASIN.${pos}`;
      asinInput.value = item.asin;
      form.appendChild(asinInput);

      const qtyInput = document.createElement("input");
      qtyInput.type = "hidden";
      qtyInput.name = `Quantity.${pos}`;
      qtyInput.value = "1";
      form.appendChild(qtyInput);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const grouped = {
    essential: equipment.filter((e) => e.category === "essential"),
    recommended: equipment.filter((e) => e.category === "recommended"),
    upgrade: equipment.filter((e) => e.category === "upgrade"),
  };

  const categoryLabel: Record<string, string> = {
    essential: "Essential",
    recommended: "Recommended",
    upgrade: "Premium Upgrade",
  };

  const categoryColor: Record<string, string> = {
    essential: "border-green-500/30 bg-green-500/5",
    recommended: "border-blue-500/30 bg-blue-500/5",
    upgrade: "border-purple-500/30 bg-purple-500/5",
  };

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-white/90">
          Equipment for {methodName}
        </h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-[10px] text-purple-300 hover:text-purple-200 underline"
          >
            Select all
          </button>
          {selectedItems.size > 0 && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-[#FF9900] text-black text-[11px] font-bold hover:bg-[#FFB347] transition-colors"
            >
              Add {selectedItems.size} to Amazon Cart
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {(["essential", "recommended", "upgrade"] as const).map((cat) => {
          const items = grouped[cat];
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold">
                {categoryLabel[cat]}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((item) => (
                  <label
                    key={item.asin}
                    className={`flex items-start gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                      selectedItems.has(item.asin)
                        ? "border-orange-400/60 bg-orange-500/10"
                        : categoryColor[cat]
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.asin)}
                      onChange={() => toggleItem(item.asin)}
                      className="mt-0.5 accent-orange-500"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white/90 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-gray-400 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
