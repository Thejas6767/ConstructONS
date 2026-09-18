import React from "react";
import ComingSoon from "../components/ComingSoon";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <ComingSoon
      title="Messages"
      description="Project-aware chat linked to area, material, drawing, payment, or stage."
      icon={MessageSquare}
    />
  );
}