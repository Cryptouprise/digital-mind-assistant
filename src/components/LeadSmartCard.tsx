
import React from 'react';
import { Card } from "@/components/ui/card";

export interface LeadProps {
  name: string;
  email: string;
  stage: string;
  status: string;
  lastTouch: string;
}

export default function LeadSmartCard({ lead }: { lead: LeadProps }) {
  return (
    <Card className="p-4 shadow-md space-y-2 bg-slate-800 border-slate-700 text-white">
      <h3 className="text-xl font-bold">{lead.name}</h3>
      <p className="text-sm text-slate-300">Email: {lead.email}</p>
      <p className="text-sm">Stage: {lead.stage}</p>
      <p className="text-sm">Last Interaction: {lead.lastTouch}</p>
      <p className="text-sm text-blue-300">Status: {lead.status}</p>
    </Card>
  );
}
