import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { gradeDisplayLabels, gradingScale3to6 } from "@/lib/data";

interface GradeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  semesterId: number;
}

const getOptionStyle = (g: string) => {
  if (g.startsWith("O")) return { backgroundColor: "#dcfce7", color: "#166534" }; // emerald
  if (g.startsWith("E") || g.startsWith("A")) return { backgroundColor: "#dbeafe", color: "#1e40af" }; // blue
  if (g.startsWith("B") || g.startsWith("C")) return { backgroundColor: "#fef9c3", color: "#854d0e" }; // yellow
  if (g.startsWith("D") || g.startsWith("P")) return { backgroundColor: "#ffedd5", color: "#9a3412" }; // orange
  if (["F", "SA", "M", "F_BACK", "SA_BACK", "M_BACK"].includes(g)) return { backgroundColor: "#fee2e2", color: "#991b1b" }; // red
  return {};
};

const oldScheme = ["O", "E", "A", "B", "C", "D", "F", "SA", "M"];
const oldSchemeBack = ["O_BACK", "A_BACK", "B_BACK", "C_BACK", "D_BACK", "P_BACK", "F_BACK", "SA_BACK", "M_BACK"];
const newScheme = ["O", "A", "B", "C", "D", "P", "F", "SA", "M"];

export function GradeDropdown({ value, onChange, semesterId }: GradeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (g: string) => {
    onChange(g);
    setIsOpen(false);
  };

  const renderOption = (g: string, isBack = false) => {
    const label = gradeDisplayLabels[g] || (semesterId > 2 ? `${g} (${gradingScale3to6[g]} pts)` : g);
    const isSelected = value === g;
    return (
      <div
        key={g}
        onClick={() => handleSelect(g)}
        className={`px-3 py-2 cursor-pointer flex items-center justify-between text-sm transition-colors hover:opacity-80`}
        style={getOptionStyle(g)}
      >
        <span className="font-medium">{label}</span>
        {isSelected && <Check className="w-4 h-4 opacity-70" />}
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className="w-full flex items-center justify-between px-3 py-2 border border-hairline rounded-md bg-surface-soft text-ink cursor-pointer min-h-[40px] shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        style={value ? getOptionStyle(value) : {}}
      >
        <span className={`text-sm ${!value ? "text-muted" : "font-medium"}`}>
          {value ? (gradeDisplayLabels[value] || value) : "Select Grade"}
        </span>
        <ChevronDown className="w-4 h-4 text-muted shrink-0 ml-2" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface-card border border-hairline rounded-md shadow-lg max-h-64 overflow-y-auto">
          {semesterId <= 2 ? (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-muted bg-surface-soft uppercase tracking-wider sticky top-0">
                Old Scheme (Original)
              </div>
              {oldScheme.map((g) => renderOption(g))}
              
              <div className="px-3 py-1.5 text-xs font-semibold text-muted bg-surface-soft uppercase tracking-wider sticky top-[28px]">
                New Scheme / Back Paper Cleared
              </div>
              {oldSchemeBack.map((g) => renderOption(g, true))}
            </>
          ) : (
            <div className="py-1">
              {newScheme.map((g) => renderOption(g))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
