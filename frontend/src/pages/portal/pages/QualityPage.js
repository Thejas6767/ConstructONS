import React from "react";
import ComingSoon from "../components/ComingSoon";
import { ShieldCheck } from "lucide-react";

export default function QualityPage() {
  return (
    <ComingSoon
      title="Quality"
      description="Inspections, checklists, pass/fail, rectification, and permanent quality records."
      icon={ShieldCheck}
    />
  );
}