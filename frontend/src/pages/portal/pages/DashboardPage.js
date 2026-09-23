import React from "react";
import { Building2 } from "lucide-react";
import { usePortal } from "../context/PortalContext";
import DashboardHeaders from "../components/dashboard/DashboardHeaders";
import DashboardMainRow from "../components/dashboard/DashboardMainRow";
import DashboardMetricsRow from "../components/dashboard/DashboardMetricsRow";
import DashboardBottomRow from "../components/dashboard/DashboardBottomRow";

export default function DashboardPage() {
  const { user, project } = usePortal();

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center font-['Poppins']">
        <div className="w-16 h-16 rounded-2xl bg-[#FF5A00]/10 grid place-items-center mb-5">
          <Building2 className="w-8 h-8 text-[#FF5A00]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">
          Welcome, {user?.name?.split(" ")[0] || "Client"}!
        </h1>
        <p className="mt-3 text-sm text-[#111111]/65 max-w-md mx-auto leading-relaxed">
          Your project dashboard is awaiting linkage. Once your site consultation is complete, your live tracking data will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 pb-12 font-['Poppins']">
      <DashboardHeaders user={user} project={project} />
      <DashboardMainRow project={project} />
      <DashboardMetricsRow project={project} />
      <DashboardBottomRow project={project} />
    </div>
  );
}