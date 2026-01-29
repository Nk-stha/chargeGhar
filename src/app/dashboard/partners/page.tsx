import React from "react";
import PartnerStats from "@/components/PartnerManagement/PartnerStats";
import PartnerList from "@/components/PartnerManagement/PartnerList";

export default function PartnersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold tracking-tight text-white">Partner Management</h1>
        <p className="text-sm text-gray-400">
          Overview of all registered vendors and their financial performance
        </p>
      </div>

      {/* Stats Section */}
      <PartnerStats />

      {/* Partners List */}
      <PartnerList />
    </div>
  );
}
