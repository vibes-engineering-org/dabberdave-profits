"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Bell, BellOff } from "lucide-react";

interface NotificationSettings {
  dailyPnLEnabled: boolean;
  priceChangeEnabled: boolean;
  priceChangeThreshold: number; // percentage change threshold
  syncNotificationsEnabled: boolean;
  significantChangeEnabled: boolean;
  significantChangeAmount: number; // dollar amount threshold
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyPnLEnabled: false,
    priceChangeEnabled: false,
    priceChangeThreshold: 10, // Default 10% threshold
    syncNotificationsEnabled: true,
    significantChangeEnabled: true,
    significantChangeAmount: 100, // Default $100 threshold
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("pnl-notification-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("pnl-notification-settings", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {(settings.dailyPnLEnabled || settings.priceChangeEnabled || settings.syncNotificationsEnabled || settings.significantChangeEnabled) ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="daily-pnl">Daily P&L Updates</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about your daily portfolio performance
            </p>
          </div>
          <Switch
            id="daily-pnl"
            checked={settings.dailyPnLEnabled}
            onCheckedChange={(checked) => updateSetting('dailyPnLEnabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="price-changes">Significant Price Changes</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when your portfolio changes by more than the threshold
            </p>
          </div>
          <Switch
            id="price-changes"
            checked={settings.priceChangeEnabled}
            onCheckedChange={(checked) => updateSetting('priceChangeEnabled', checked)}
          />
        </div>

        {settings.priceChangeEnabled && (
          <div className="space-y-2">
            <Label htmlFor="threshold">Price Change Threshold (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="threshold"
                type="number"
                min="0.5"
                max="100"
                step="0.5"
                value={settings.priceChangeThreshold}
                onChange={(e) => updateSetting('priceChangeThreshold', parseFloat(e.target.value) || 10)}
                className="w-24"
              />
              <div className="flex gap-1">
                {[1, 5, 10, 20].map(preset => (
                  <button
                    key={preset}
                    onClick={() => updateSetting('priceChangeThreshold', preset)}
                    className={`px-2 py-1 text-xs rounded ${
                      settings.priceChangeThreshold === preset 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              You&apos;ll be notified when your portfolio changes by {settings.priceChangeThreshold}% or more
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="sync-notifications">Exchange Sync Updates</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when exchange data sync completes
            </p>
          </div>
          <Switch
            id="sync-notifications"
            checked={settings.syncNotificationsEnabled}
            onCheckedChange={(checked) => updateSetting('syncNotificationsEnabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="significant-changes">Large Dollar Amount Changes</Label>
            <p className="text-sm text-muted-foreground">
              Get notified for significant dollar amount changes (gains or losses)
            </p>
          </div>
          <Switch
            id="significant-changes"
            checked={settings.significantChangeEnabled}
            onCheckedChange={(checked) => updateSetting('significantChangeEnabled', checked)}
          />
        </div>

        {settings.significantChangeEnabled && (
          <div className="space-y-2">
            <Label htmlFor="amount-threshold">Dollar Amount Threshold</Label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  id="amount-threshold"
                  type="number"
                  min="10"
                  max="10000"
                  step="10"
                  value={settings.significantChangeAmount}
                  onChange={(e) => updateSetting('significantChangeAmount', parseFloat(e.target.value) || 100)}
                  className="w-28 pl-6"
                />
              </div>
              <div className="flex gap-1">
                {[50, 100, 250, 500, 1000].map(preset => (
                  <button
                    key={preset}
                    onClick={() => updateSetting('significantChangeAmount', preset)}
                    className={`px-2 py-1 text-xs rounded ${
                      settings.significantChangeAmount === preset 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              You&apos;ll be notified when your portfolio gains or loses ${settings.significantChangeAmount} or more
            </p>
          </div>
        )}

        {!settings.dailyPnLEnabled && !settings.priceChangeEnabled && !settings.syncNotificationsEnabled && !settings.significantChangeEnabled && (
          <div className="text-center py-4">
            <BellOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              All notifications are currently disabled
            </p>
          </div>
        )}

        {(settings.dailyPnLEnabled || settings.priceChangeEnabled || settings.syncNotificationsEnabled || settings.significantChangeEnabled) && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Notifications are stored locally and will work while using this app. 
              For persistent notifications, consider enabling browser notifications when prompted.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}