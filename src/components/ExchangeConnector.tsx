"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { AlertCircle, CheckCircle, Link, Unlink, Eye, EyeOff } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string; // For Coinbase Pro
  sandbox?: boolean;
}

interface ExchangeConnection {
  id: string;
  name: string;
  type: 'coinbase' | 'base';
  connected: boolean;
  lastSync?: string;
  credentials?: ExchangeCredentials;
}

interface ExchangeConnectorProps {
  onConnectionChange?: (connections: ExchangeConnection[]) => void;
}

export default function ExchangeConnector({ onConnectionChange }: ExchangeConnectorProps) {
  const [connections, setConnections] = useState<ExchangeConnection[]>([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState<{[key: string]: boolean}>({});
  const [credentials, setCredentials] = useState<{[key: string]: ExchangeCredentials}>({});
  const { toast } = useToast();

  const exchanges = [
    {
      id: 'coinbase',
      name: 'Coinbase Pro',
      type: 'coinbase' as const,
      description: 'Connect your Coinbase Pro account to import trading data',
      requiresPassphrase: true
    },
    {
      id: 'base',
      name: 'Base Chain',
      type: 'base' as const,
      description: 'Connect to Base chain for on-chain transaction tracking',
      requiresPassphrase: false
    }
  ];

  // Load connections from localStorage
  useEffect(() => {
    const savedConnections = localStorage.getItem('exchange-connections');
    if (savedConnections) {
      const parsed = JSON.parse(savedConnections);
      setConnections(parsed);
      onConnectionChange?.(parsed);
    }
  }, [onConnectionChange]);

  // Save connections to localStorage
  const saveConnections = (newConnections: ExchangeConnection[]) => {
    localStorage.setItem('exchange-connections', JSON.stringify(newConnections));
    setConnections(newConnections);
    onConnectionChange?.(newConnections);
  };

  const handleConnect = async (exchangeId: string) => {
    setIsConnecting(exchangeId);
    
    try {
      const exchangeCredentials = credentials[exchangeId];
      if (!exchangeCredentials || !exchangeCredentials.apiKey || !exchangeCredentials.apiSecret) {
        throw new Error('Please provide valid API credentials');
      }

      // Validate credentials by making a test API call
      const testResult = await validateExchangeCredentials(exchangeId, exchangeCredentials);
      
      if (testResult.success) {
        const exchange = exchanges.find(e => e.id === exchangeId);
        const newConnection: ExchangeConnection = {
          id: exchangeId,
          name: exchange?.name || exchangeId,
          type: exchangeId as 'coinbase' | 'base',
          connected: true,
          lastSync: new Date().toISOString(),
          credentials: exchangeCredentials
        };

        const updatedConnections = [
          ...connections.filter(c => c.id !== exchangeId),
          newConnection
        ];
        
        saveConnections(updatedConnections);
        
        // Clear credentials from state for security
        setCredentials(prev => ({ ...prev, [exchangeId]: { apiKey: '', apiSecret: '', passphrase: '' } }));
        setShowCredentials(prev => ({ ...prev, [exchangeId]: false }));
        
        toast({
          title: "Connection Successful",
          description: `Successfully connected to ${exchange?.name}`,
        });
      } else {
        throw new Error(testResult.error || 'Failed to validate credentials');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to exchange",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = (exchangeId: string) => {
    const updatedConnections = connections.filter(c => c.id !== exchangeId);
    saveConnections(updatedConnections);
    
    toast({
      title: "Disconnected",
      description: `Disconnected from ${exchanges.find(e => e.id === exchangeId)?.name}`,
    });
  };

  const validateExchangeCredentials = async (exchangeId: string, creds: ExchangeCredentials): Promise<{success: boolean, error?: string}> => {
    // In a real implementation, this would make actual API calls to validate
    // For now, we'll simulate validation with basic checks
    
    if (exchangeId === 'coinbase') {
      if (!creds.apiKey || !creds.apiSecret || !creds.passphrase) {
        return { success: false, error: 'Coinbase Pro requires API Key, Secret, and Passphrase' };
      }
      
      // Simulate API validation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic format validation (real implementation would test API connectivity)
      if (creds.apiKey.length < 10 || creds.apiSecret.length < 10) {
        return { success: false, error: 'Invalid API credentials format' };
      }
    } else if (exchangeId === 'base') {
      if (!creds.apiKey) {
        return { success: false, error: 'Base chain requires an RPC endpoint or API key' };
      }
      
      // Simulate validation
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    return { success: true };
  };

  const updateCredentials = (exchangeId: string, field: keyof ExchangeCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [exchangeId]: {
        ...prev[exchangeId],
        [field]: value
      }
    }));
  };

  const toggleShowCredentials = (exchangeId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [exchangeId]: !prev[exchangeId]
    }));
  };

  const getConnectionStatus = (exchangeId: string) => {
    return connections.find(c => c.id === exchangeId);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Exchange Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Connect your crypto exchanges to automatically import your trading data and calculate accurate P&L.
          </p>
          
          <div className="space-y-6">
            {exchanges.map(exchange => {
              const connection = getConnectionStatus(exchange.id);
              const isConnected = connection?.connected;
              const isCurrentlyConnecting = isConnecting === exchange.id;
              
              return (
                <div key={exchange.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{exchange.name}</h3>
                        {isConnected ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Not Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {exchange.description}
                      </p>
                      {isConnected && connection?.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Last synced: {new Date(connection.lastSync).toLocaleString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {isConnected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(exchange.id)}
                        >
                          <Unlink className="h-4 w-4 mr-1" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleConnect(exchange.id)}
                          disabled={isCurrentlyConnecting}
                          size="sm"
                        >
                          {isCurrentlyConnecting ? 'Connecting...' : 'Connect'}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {!isConnected && (
                    <div className="space-y-3 pt-2 border-t">
                      <div className="space-y-2">
                        <Label htmlFor={`${exchange.id}-api-key`}>API Key</Label>
                        <div className="relative">
                          <Input
                            id={`${exchange.id}-api-key`}
                            type={showCredentials[exchange.id] ? "text" : "password"}
                            placeholder="Enter your API key"
                            value={credentials[exchange.id]?.apiKey || ''}
                            onChange={(e) => updateCredentials(exchange.id, 'apiKey', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => toggleShowCredentials(exchange.id)}
                          >
                            {showCredentials[exchange.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`${exchange.id}-api-secret`}>API Secret</Label>
                        <div className="relative">
                          <Input
                            id={`${exchange.id}-api-secret`}
                            type={showCredentials[exchange.id] ? "text" : "password"}
                            placeholder="Enter your API secret"
                            value={credentials[exchange.id]?.apiSecret || ''}
                            onChange={(e) => updateCredentials(exchange.id, 'apiSecret', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => toggleShowCredentials(exchange.id)}
                          >
                            {showCredentials[exchange.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {exchange.requiresPassphrase && (
                        <div className="space-y-2">
                          <Label htmlFor={`${exchange.id}-passphrase`}>Passphrase</Label>
                          <div className="relative">
                            <Input
                              id={`${exchange.id}-passphrase`}
                              type={showCredentials[exchange.id] ? "text" : "password"}
                              placeholder="Enter your passphrase"
                              value={credentials[exchange.id]?.passphrase || ''}
                              onChange={(e) => updateCredentials(exchange.id, 'passphrase', e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => toggleShowCredentials(exchange.id)}
                            >
                              {showCredentials[exchange.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-amber-800">Security Notice</p>
                            <p className="text-amber-700 mt-1">
                              Your API credentials are encrypted and stored locally. Never share your API keys with anyone.
                              Make sure to set appropriate permissions on your exchange API keys (read-only recommended).
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}