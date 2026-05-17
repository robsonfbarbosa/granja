"use client";
import React, { useState, useEffect } from "react";
import { Clock, Thermometer } from "lucide-react";

export default function TopBar() {
  const [tempo, setTempo] = useState(new Date());
  const [temperatura, setTemperatura] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTempo(new Date()), 30000);
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=-21.728&longitude=-50.875&current_weather=true",
    )
      .then((res) => res.json())
      .then(
        (data) =>
          data?.current_weather &&
          setTemperatura(Math.round(data.current_weather.temperature)),
      )
      .catch(() => {});
    return () => clearInterval(timer);
  }, []);

  const hora = tempo.getHours();
  const saudacao =
    hora >= 5 && hora < 12
      ? "Bom dia 🌅"
      : hora >= 12 && hora < 18
        ? "Boa tarde ☀️"
        : "Boa noite 🌙";
  const dataF = tempo.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  const horaF = tempo.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-slate-800 text-slate-200 text-[10px] sm:text-xs py-2 px-3 sm:px-4 rounded-xl flex flex-wrap justify-between items-center shadow-md mb-4 gap-2">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="font-bold text-amber-400">{saudacao}</span>
        <span className="border-l border-slate-600 pl-2 capitalize">
          {dataF}
        </span>
        <span className="flex items-center gap-1 border-l border-slate-600 pl-2">
          <Clock size={12} /> {horaF}
        </span>
        {temperatura !== null && (
          <span className="flex items-center gap-1 border-l border-slate-600 pl-2 text-orange-400">
            <Thermometer size={12} /> {temperatura}°C
          </span>
        )}
      </div>
      <a
        href="https://wa.me/5518997205198"
        target="_blank"
        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full font-bold shadow-sm transition text-[9px] uppercase"
      >
        Suporte
      </a>
    </div>
  );
}
