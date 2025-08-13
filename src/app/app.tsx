"use client";

import { PROJECT_TITLE } from "~/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import PnLTracker from "~/components/PnLTracker";
import WalletConnection from "~/components/WalletConnection";
import WalletPnLDisplay from "~/components/WalletPnLDisplay";

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

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Tracking</TabsTrigger>
              <TabsTrigger value="wallet">Wallet Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-6">
              <PnLTracker />
            </TabsContent>

            <TabsContent value="wallet" className="space-y-6">
              <WalletConnection />
              <WalletPnLDisplay />
            </TabsContent>
          </Tabs>
        </div>
        {/* TEMPLATE_CONTENT_END */}
      </div>
    </div>
  );
}
