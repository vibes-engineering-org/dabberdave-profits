"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Wallet, LogOut, AlertCircle } from "lucide-react";
import { useState } from "react";

interface WalletConnectionProps {
  onConnectionChange?: (isConnected: boolean, address?: string) => void;
}

export default function WalletConnection({ onConnectionChange }: WalletConnectionProps) {
  const { address, isConnected, status } = useAccount();
  const { connectors, connect, status: connectStatus, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (connector: any) => {
    try {
      setIsConnecting(true);
      await connect({ connector });
      if (onConnectionChange) {
        onConnectionChange(true, address);
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    if (onConnectionChange) {
      onConnectionChange(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Connected
                </Badge>
                <span className="text-sm font-mono">{formatAddress(address)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ready to track your onchain P&L
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to automatically track your onchain P&L
          </p>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          )}

          <div className="grid gap-2">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                variant="outline"
                onClick={() => handleConnect(connector)}
                disabled={isConnecting || connectStatus === "pending"}
                className="justify-start"
              >
                {isConnecting || connectStatus === "pending" ? (
                  "Connecting..."
                ) : (
                  connector.name
                )}
              </Button>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Coming Soon:</strong> Automatic portfolio tracking from your connected wallet address
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}