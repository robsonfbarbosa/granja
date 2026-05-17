import React from "react";
import { Zap } from "lucide-react";
import { getEstimativaPapelaoIndividual } from "@/data/config";

export function FlashBanner({
  categorias,
  producaoFlash,
  onPuxar,
  flashVermelhasPuxadas,
}) {
  const totalVermelhasFlash = categorias.reduce(
    (sum, cat) => sum + (parseInt(producaoFlash[`verm_${cat}`]) || 0),
    0,
  );

  if (totalVermelhasFlash === 0) return null;

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex-1">
        <p className="text-sm font-bold text-red-800">
          🟥 Caixas Vermelhas no Flash: {totalVermelhasFlash} cx
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {categorias.map((cat) => {
            const qty = parseInt(producaoFlash[`verm_${cat}`]) || 0;
            if (!qty) return null;
            const pap = getEstimativaPapelaoIndividual(cat, qty);
            return (
              <span
                key={cat}
                className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200"
              >
                {cat}: {qty} verm →{" "}
                <span className="text-amber-700">{pap} pap</span>
              </span>
            );
          })}
        </div>
        {flashVermelhasPuxadas.length > 0 && (
          <p className="text-[10px] text-red-600 font-bold mt-1">
            ⚠️ Ao salvar, o Flash de vermelhas puxadas será zerado
            automaticamente.
          </p>
        )}
      </div>
      <button
        onClick={onPuxar}
        className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition whitespace-nowrap"
      >
        <Zap className="w-4 h-4 text-yellow-300" /> Puxar como Papelão
      </button>
    </div>
  );
}
