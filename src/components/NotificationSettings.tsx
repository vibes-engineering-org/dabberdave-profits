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
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyPnLEnabled: false,
    priceChangeEnabled: false,
    priceChangeThreshold: 10, // Default 10% threshold
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
          {(settings.dailyPnLEnabled || settings.priceChangeEnabled) ? (
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
            <Input
              id="threshold"
              type="number"
              min="1"
              max="100"
              step="1"
              value={settings.priceChangeThreshold}
              onChange={(e) => updateSetting('priceChangeThreshold', parseFloat(e.target.value) || 10)}
              className="w-20"
            />
            <p className="text-xs text-muted-foreground">
              You&apos;ll be notified when your portfolio changes by {settings.priceChangeThreshold}% or more
            </p>
          </div>
        )}

        {!settings.dailyPnLEnabled && !settings.priceChangeEnabled && (
          <div className="text-center py-4">
            <BellOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              All notifications are currently disabled
            </p>
          </div>
        )}

        {(settings.dailyPnLEnabled || settings.priceChangeEnabled) && (
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