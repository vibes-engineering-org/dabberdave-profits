"use client";

import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { RefreshCw, Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { useWalletPnL } from "~/hooks/use-wallet-pnl";

export default function WalletPnLDisplay() {
  const { address, isConnected } = useAccount();
  const { totalValue, tokens, isLoading, error, lastUpdated, refresh } = useWalletPnL();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatTokenAmount = (amount: number, symbol: string) => {
    const decimals = symbol === 'ETH' ? 4 : symbol === 'BTC' ? 6 : 2;
    return amount.toFixed(decimals);
  };

  if (!isConnected || !address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet P&L Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Connect your wallet to see your portfolio</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet P&L Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <div className="space-y-1">
              <p className="text-sm text-red-700">{error}</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={refresh}
                className="text-xs"
              >
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Portfolio
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={refresh}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Updating...' : 'Refresh'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Value */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Total Portfolio Value</h3>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mx-auto" />
            ) : (
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalValue)}
              </p>
            )}
          </div>

          {/* Token Holdings */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              Holdings
              <Badge variant="outline">{tokens.length} tokens</Badge>
            </h4>
            
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>No significant token holdings found</p>
                <p className="text-sm">Tokens worth less than $1 are filtered out</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tokens
                  .sort((a, b) => b.value - a.value)
                  .map((token, index) => (
                    <div key={`${token.symbol}-${index}`} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{token.symbol}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatTokenAmount(token.balance, token.symbol)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Price: {formatCurrency(token.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(token.value)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((token.value / totalValue) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Live Portfolio Tracking:</strong> Your token balances and values are automatically updated from your connected wallet.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}