"use client";

import { PROJECT_TITLE } from "~/lib/constants";
import PnLTracker from "~/components/PnLTracker";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* TEMPLATE_CONTENT_START - Replace content below */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {PROJECT_TITLE}
            </h1>
            <p className="text-muted-foreground">
              Track your true P&L across all crypto investments
            </p>
          </div>
          <PnLTracker />
        </div>
        {/* TEMPLATE_CONTENT_END */}
      </div>
    </div>
  );
}
