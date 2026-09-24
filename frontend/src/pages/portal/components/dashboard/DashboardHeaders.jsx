import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, Flag, CloudRain, Droplets, Wind, CheckCircle2,
  Clock, ShieldAlert, ChevronRight, Building2, MapPin, Sun, Cloud
} from "lucide-react";
import axios from "axios";

export default function DashboardHeaders({ user, project }) {
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Only real project coords (updates when Admin saves site_lat / site_lng)
  const hasCoords =
    project?.site_lat != null &&
    project?.site_lng != null &&
    !Number.isNaN(Number(project.site_lat)) &&
    !Number.isNaN(Number(project.site_lng));

  const lat = hasCoords ? Number(project.site_lat) : null;
  const lng = hasCoords ? Number(project.site_lng) : null;

  useEffect(() => {
    if (!lat || !lng) {
      setWeather(null);
      setWeatherLoading(false);
      return;
    }

    setWeatherLoading(true);
    axios
      .get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
          `&current_weather=true` +
          `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode` +
          `&forecast_days=3&timezone=auto`
      )
      .then((res) => {
        const cur = res.data.current_weather || {};
        const daily = res.data.daily || {};
        setWeather({
          temperature: cur.temperature,
          windspeed: cur.windspeed,
          weathercode: cur.weathercode,
          rainChance: daily.precipitation_probability_max?.[0] ?? 0,
          days: (daily.time || []).slice(0, 3).map((t, i) => ({
            date: t,
            max: daily.temperature_2m_max?.[i],
            min: daily.temperature_2m_min?.[i],
            rain: daily.precipitation_probability_max?.[i],
          })),
        });
      })
      .catch(() => setWeather(null))
      .finally(() => setWeatherLoading(false));
  }, [lat, lng]);

  const stages = project?.stages || [];
  const materials = project?.materials || [];
  const quality = project?.quality_inspections || [];
  const drawings = project?.drawings || [];
  const today = new Date();

  // Progress
  const completedStages = stages.filter((s) => s.status === "completed").length;
  const progressVal = stages.length
    ? Math.round(
        stages.reduce((sum, s) => sum + (Number(s.progress_pct) || 0), 0) /
          stages.length
      )
    : 0;
  const currentStage = stages.find((s) => s.status === "in_progress");

  // Expected completion = last stage target date (set by Admin in Stages)
  const expectedCompletionDate =
    stages.length > 0 ? stages[stages.length - 1]?.expected_date : null;

  // Health (PRD 6.2)
  const healthData = [
    {
      key: "Schedule",
      status: stages.some(
        (s) =>
          s.status !== "completed" &&
          s.expected_date &&
          new Date(s.expected_date) < today
      )
        ? "At Risk"
        : "On Track",
    },
    {
      key: "Cost",
      status:
        project.amount_spent > project.contract_value && project.contract_value > 0
          ? "At Risk"
          : "On Track",
    },
    {
      key: "Procurement",
      status: materials.some((m) => m.status === "pending")
        ? "Attention"
        : "On Track",
    },
    {
      key: "Quality",
      status: quality.some((q) => q.status === "rectification")
        ? "At Risk"
        : "On Track",
    },
    {
      key: "Approvals",
      status: drawings.some((d) => d.status === "pending")
        ? "Attention"
        : "On Track",
    },
  ];

  const overallHealth = healthData.some((h) => h.status === "At Risk")
    ? "At Risk"
    : healthData.some((h) => h.status === "Attention")
    ? "Attention"
    : "On Track";

  const hColors = {
    "On Track": {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      icon: CheckCircle2,
      ring: "#10B981",
    },
    Attention: {
      text: "text-amber-600",
      bg: "bg-amber-50",
      icon: Clock,
      ring: "#F59E0B",
    },
    "At Risk": {
      text: "text-red-600",
      bg: "bg-red-50",
      icon: ShieldAlert,
      ring: "#EF4444",
    },
  };
  const HealthIcon = hColors[overallHealth].icon;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";
  const formatTime = (date) =>
    date
      ? new Date(date).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const weatherLabel = (code) => {
    if (code == null) return "—";
    if (code === 0) return "Clear";
    if (code <= 3) return "Cloudy";
    if (code <= 67) return "Rain";
    if (code <= 77) return "Snow";
    return "Stormy";
  };

  return (
    <div className="space-y-4 font-['Poppins']">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-sm text-[#111111]/60 mt-1">
            Here's how your dream home is progressing this week.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-[#111111]/40" />
            <div>
              <div className="text-[10px] text-[#111111]/50 font-bold uppercase tracking-wider">
                Project Start
              </div>
              <div className="text-xs font-bold text-[#000F1B]">
                {formatDate(project.start_date || project.created_at)}
              </div>
            </div>
          </div>
       
         
          <div className="hidden lg:block ml-2 text-right">
            <div className="font-[Shadows_Into_Light,cursive] text-2xl text-[#000F1B] leading-none transform -rotate-2">
              Your Dream Home
            </div>
            <div className="font-[Shadows_Into_Light,cursive] text-2xl text-[#FF5A00] leading-none transform -rotate-2">
              On Track.
            </div>
          </div>
        </div>
      </div>

      {/* Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Project Health */}
        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-50 grid place-items-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <h2 className="text-base font-bold text-[#000F1B]">Project Health</h2>
            </div>
            <Link
              to="/portal/site-reports"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex items-center gap-6 mt-2">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#F2F2F2"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke={hColors[overallHealth].ring}
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray="213"
                  strokeDashoffset={0}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <div
                className={`flex items-center gap-1.5 text-xl font-bold ${hColors[overallHealth].text}`}
              >
                <HealthIcon className="w-5 h-5" /> {overallHealth}
              </div>
              <p className="text-xs text-[#111111]/60 mt-1">
                {overallHealth === "On Track"
                  ? "All key areas are within plan."
                  : "Some areas require attention."}
              </p>
              <p className="text-[10px] text-[#111111]/40 mt-3">
                Last updated: {formatDate(today)}, {formatTime(today)}
              </p>
            </div>
          </div>
          <div className="flex justify-between mt-6 gap-2 border-t border-black/5 pt-4">
            {healthData.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`flex items-center justify-center w-full py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${hColors[h.status].bg} ${hColors[h.status].text}`}
                >
                  {h.status}
                </div>
                <div className="text-[9px] font-semibold text-[#111111]/60">
                  {h.key}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-50 grid place-items-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <h2 className="text-base font-bold text-[#000F1B]">
                Overall Progress
              </h2>
            </div>
            <Link
              to="/portal/timeline"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex items-center gap-6 mt-2">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#F2F2F2"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#10B981"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray="213"
                  strokeDashoffset={213 - (progressVal / 100) * 213}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[#000F1B]">
                {progressVal}%
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <div className="text-[10px] font-bold text-[#111111]/40 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Current Stage
                </div>
                <div className="text-sm font-bold text-[#000F1B] leading-tight">
                  {currentStage ? currentStage.name : "Awaiting Start"}
                </div>
                {currentStage && (
                  <span className="inline-block mt-1 bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                    In Progress
                  </span>
                )}
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#111111]/40 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Flag className="w-3 h-3" /> Expected Completion
                </div>
                <div className="text-sm font-bold text-[#000F1B]">
                  {formatDate(expectedCompletionDate)}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-[11px] font-semibold text-[#111111]/60">
            <span>
              {completedStages} of {stages.length} stages completed
            </span>
            <span>Updated: {formatDate(today)}</span>
          </div>
        </div>

        {/* Site Weather — tied to Admin lat/lng */}
        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-50 grid place-items-center">
                <CloudRain className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <h2 className="text-base font-bold text-[#000F1B]">Site Weather</h2>
            </div>
          </div>

          {!hasCoords ? (
            <div className="flex-1 flex flex-col justify-center text-xs text-[#111111]/50 leading-relaxed">
              <p className="font-semibold text-[#000F1B] mb-1">Weather unavailable</p>
              <p>
                Admin must set <b>Site Latitude</b> and <b>Longitude</b> in project
                Edit Info. Then forecast updates automatically for that location.
              </p>
            </div>
          ) : weatherLoading ? (
            <div className="text-xs text-[#111111]/50 py-8 text-center">
              Loading live forecast…
            </div>
          ) : weather ? (
            <>
              <div className="flex justify-between items-start mt-1">
                <div className="flex items-center gap-3">
                  {weather.rainChance > 40 ? (
                    <CloudRain className="w-12 h-12 text-blue-400" />
                  ) : weather.weathercode === 0 ? (
                    <Sun className="w-12 h-12 text-amber-400" />
                  ) : (
                    <Cloud className="w-12 h-12 text-slate-400" />
                  )}
                  <div>
                    <div className="text-3xl font-bold text-[#000F1B]">
                      {weather.temperature ?? "--"}°C
                    </div>
                    <div className="text-xs font-semibold text-[#111111]/50 mt-1">
                      {weatherLabel(weather.weathercode)}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-[11px] font-semibold text-[#111111]/60">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    {weather.rainChance ?? 0}% Rain
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-3.5 h-3.5 text-gray-400" />
                    {weather.windspeed ?? "--"} km/h
                  </div>
                </div>
              </div>

              {/* 3-day forecast */}
              {weather.days?.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {weather.days.map((d) => (
                    <div
                      key={d.date}
                      className="rounded-lg bg-[#F9FAFB] border border-black/5 p-2 text-center"
                    >
                      <div className="text-[9px] font-bold text-[#111111]/50 uppercase">
                        {new Date(d.date + "T12:00:00").toLocaleDateString(
                          "en-GB",
                          { weekday: "short" }
                        )}
                      </div>
                      <div className="text-xs font-bold text-[#000F1B] mt-0.5">
                        {d.max}°/{d.min}°
                      </div>
                      <div className="text-[9px] text-blue-600 font-semibold">
                        {d.rain ?? 0}% rain
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-black/5">
                {weather.rainChance > 40 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-800">
                        Rain expected in next 24 hours.
                      </span>
                      <p className="text-amber-700/80 mt-0.5 text-[9px]">
                        Site work may be affected. Admin notified when alerts are
                        configured.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-[#111111]/50 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5A00]" />
                    {project.address || "Site location"} · {lat.toFixed(2)},{" "}
                    {lng.toFixed(2)}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-xs text-red-600 py-6 text-center">
              Could not load weather. Try again later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}