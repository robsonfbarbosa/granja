"use client";
import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function Accordion({
  title,
  icon: Icon,
  colorTheme,
  children,
  count,
  actionButton,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic colors for Tailwind
  const bgTheme = `bg-${colorTheme}-50`;
  const textTheme = `text-${colorTheme}-800`;
  const borderTheme = `border-${colorTheme}-200`;
  const badgeBg = `bg-${colorTheme}-200`;
  const badgeText = `text-${colorTheme}-800`;
  const chevronColor = `text-${colorTheme}-500`;

  return (
    <div
      className={`mb-3 border ${borderTheme} rounded-xl overflow-hidden shadow-sm bg-white`}
    >
      <div
        className={`w-full ${bgTheme} p-4 flex justify-between items-center transition-colors`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-1 items-center gap-2 font-bold text-left"
        >
          {Icon && <Icon size={16} className={textTheme} />}
          <span className={textTheme}>{title}</span>
          {count > 0 && (
            <span
              className={`ml-2 ${badgeBg} ${badgeText} px-2 py-0.5 rounded-full text-[10px]`}
            >
              {count}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          {actionButton}
          <button onClick={() => setIsOpen(!isOpen)} className={chevronColor}>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="p-4 bg-white border-t border-slate-100 animate-in">
          {children}
        </div>
      )}
    </div>
  );
}
