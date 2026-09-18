import React from "react";
import ComingSoon from "../components/ComingSoon";
import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <ComingSoon
      title="Maintenance"
      description="Post-handover Digital Home — assets, warranties, service, repairs."
      icon={Wrench}
    />
  );
}