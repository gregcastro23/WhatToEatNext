"use client";

import React from "react";
import type { NatalChart } from "@/services/natalChartService";
import { getNatalChartSummary } from "@/services/natalChartService";
import type { ZodiacSign } from "@/types/celestial";

interface BirthChartDisplayProps {
  natalChart: NatalChart;
  onEdit?: () => void;
  showDetails?: boolean;
}

// Zodiac sign symbols
const zodiacSymbols: Record<ZodiacSign, string> = {
  aries: "♈",
  taurus: "♉",
  gemini: "♊",
  cancer: "♋",
  leo: "♌",
  virgo: "♍",
  libra: "♎",
  scorpio: "♏",
  sagittarius: "♐",
  capricorn: "♑",
  aquarius: "♒",
  pisces: "♓",
};

// Element colors
const elementColors: Record<string, string> = {
  Fire: "text-red-600 bg-red-50",
  Water: "text-blue-600 bg-blue-50",
  Earth: "text-green-600 bg-green-50",
  Air: "text-yellow-600 bg-yellow-50",
};

export const BirthChartDisplay: React.FC<BirthChartDisplayProps> = ({
  natalChart,
  onEdit,
  showDetails = true,
}) => {
  const summary = getNatalChartSummary(natalChart);
  const { birthData, planetaryPositions, dominantElements, dominantModalities } =
    natalChart;

  const formatDate = () => {
    const { year, month, day, hour, minute } = birthData.dateTime;
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const hourStr = hour.toString().padStart(2, "0");
    const minuteStr = minute.toString().padStart(2, "0");
    return `${monthNames[month - 1]} ${day}, ${year} at ${hourStr}:${minuteStr}`;
  };

  const formatLocation = () => {
    const { latitude, longitude } = birthData.location;
    const latDir = latitude >= 0 ? "N" : "S";
    const lngDir = longitude >= 0 ? "E" : "W";
    return `${Math.abs(latitude).toFixed(2)}°${latDir}, ${Math.abs(longitude).toFixed(2)}°${lngDir}`;
  };

  const capitalizeSign = (sign: ZodiacSign): string => {
    return sign.charAt(0).toUpperCase() + sign.slice(1);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {birthData.name ? `${birthData.name}'s ` : "Your "}Natal Chart
          </h3>
          <p className="mt-1 text-sm text-gray-500">{formatDate()}</p>
          <p className="text-sm text-gray-500">{formatLocation()}</p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Edit
          </button>
        )}
      </div>

      {/* Main Signs (Big Three) */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
          <div className="text-sm font-medium text-gray-600">Sun Sign</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-3xl">
              {zodiacSymbols[summary.sunSign]}
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {capitalizeSign(summary.sunSign)}
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-600">Core identity & ego</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 p-4">
          <div className="text-sm font-medium text-gray-600">Moon Sign</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-3xl">
              {zodiacSymbols[summary.moonSign]}
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {capitalizeSign(summary.moonSign)}
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Emotions & inner world
          </p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-green-50 to-teal-50 p-4">
          <div className="text-sm font-medium text-gray-600">Rising Sign</div>
          <div className="mt-2 flex items-center gap-2">
            {summary.risingSign ? (
              <>
                <span className="text-3xl">
                  {zodiacSymbols[summary.risingSign]}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {capitalizeSign(summary.risingSign)}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500">Not available</span>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Outer personality & approach
          </p>
        </div>
      </div>

      {/* Dominant Elements */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-gray-700">
          Elemental Balance
        </h4>
        <div className="space-y-2">
          {(Object.entries(dominantElements) as [string, number][])
            .sort(([, a], [, b]) => b - a)
            .map(([element, value]) => (
              <div key={element} className="flex items-center gap-3">
                <div className="w-16 text-sm font-medium text-gray-600">
                  {element}
                </div>
                <div className="flex-1">
                  <div className="h-6 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full ${elementColors[element]} flex items-center justify-end pr-2 text-xs font-medium transition-all`}
                      style={{ width: `${value * 100}%` }}
                    >
                      {value >= 0.15 && `${(value * 100).toFixed(0)}%`}
                    </div>
                  </div>
                </div>
                <div className="w-12 text-right text-sm text-gray-600">
                  {(value * 100).toFixed(0)}%
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Dominant Modality */}
      {dominantModalities && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-semibold text-gray-700">
            Modality Balance
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(dominantModalities) as [string, number][]).map(([modality, value]) => (
              <div
                key={modality}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center"
              >
                <div className="text-sm font-medium text-gray-600">
                  {modality}
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {(value * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Planetary Positions */}
      {showDetails && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">
            Planetary Positions
          </h4>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {(Object.entries(planetaryPositions) as [string, any][]).map(([planet, position]) => {
              const sign = position.sign as ZodiacSign;
              return (
                <div
                  key={planet}
                  className="rounded border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <div className="text-xs font-medium text-gray-600">
                    {planet}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-lg">{zodiacSymbols[sign]}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {capitalizeSign(sign)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {position.degree}°{position.minute ? `${position.minute}'` : ""}
                    {position.isRetrograde && " ℞"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calculation timestamp */}
      <div className="mt-4 border-t border-gray-200 pt-4 text-xs text-gray-400">
        Calculated on {new Date(natalChart.calculatedAt).toLocaleString()}
      </div>
    </div>
  );
};
