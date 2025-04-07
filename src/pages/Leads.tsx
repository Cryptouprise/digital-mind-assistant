
import React from 'react';
import { LeadProps } from "@/components/LeadSmartCard";
import LeadSmartCard from "@/components/LeadSmartCard";

const sampleLeads: LeadProps[] = [
  { name: 'Jane Doe', email: 'jane@example.com', stage: 'Discovery', status: 'Hot', lastTouch: '2 days ago' },
  { name: 'Mark Price', email: 'mark@brand.io', stage: 'Proposal', status: 'Warm', lastTouch: '5 days ago' },
  { name: 'Sarah Johnson', email: 'sarah@company.net', stage: 'Negotiation', status: 'Hot', lastTouch: '1 day ago' },
  { name: 'Robert Smith', email: 'robert@domain.co', stage: 'Onboarding', status: 'Cold', lastTouch: '1 week ago' },
];

export default function Leads() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Smart Leads</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleLeads.map((lead, i) => (
          <LeadSmartCard key={i} lead={lead} />
        ))}
      </div>
    </div>
  );
}
