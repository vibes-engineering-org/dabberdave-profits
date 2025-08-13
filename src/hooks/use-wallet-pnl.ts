"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

interface TokenBalance {
  symbol: string;
  balance: number;
  price: number;
  value: number;
  contractAddress?: string;
}

interface WalletPnL {
  totalValue: number;
  tokens: TokenBalance[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useWalletPnL(): WalletPnL {
  const { address, isConnected } = useAccount();
  const [walletData, setWalletData] = useState<Omit<WalletPnL, 'refresh'>>({
    totalValue: 0,
    tokens: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const fetchTokenPrices = async (symbols: string[]): Promise<Record<string, number>> => {
    if (symbols.length === 0) return {};
    
    try {
      const symbolMap: Record<string, string> = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'SOL': 'solana',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'BNB': 'binancecoin',
        'XRP': 'ripple',
        'ADA': 'cardano',
        'MATIC': 'matic-network',
        'LINK': 'chainlink',
      };

      const coinIds = symbols.map(symbol => 
        symbolMap[symbol.toUpperCase()] || symbol.toLowerCase()
      ).join(',');

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`
      );

      if (!response.ok) throw new Error('Failed to fetch prices');

      const data = await response.json();
      const prices: Record<string, number> = {};

      symbols.forEach(symbol => {
        const coinId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
        if (data[coinId]?.usd) {
          prices[symbol.toUpperCase()] = data[coinId].usd;
        }
      });

      return prices;
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return {};
    }
  };

  const fetchWalletBalances = async (walletAddress: string): Promise<TokenBalance[]> => {
    const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    if (!alchemyApiKey) {
      throw new Error('Alchemy API key not configured');
    }

    try {
      // Fetch native ETH balance
      const ethResponse = await fetch(
        `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [walletAddress, 'latest'],
            id: 1,
          }),
        }
      );

      if (!ethResponse.ok) throw new Error('Failed to fetch ETH balance');

      const ethData = await ethResponse.json();
      const ethBalance = parseInt(ethData.result, 16) / 1e18;

      // Fetch ERC-20 token balances
      const tokenResponse = await fetch(
        `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'alchemy_getTokenBalances',
            params: [walletAddress],
            id: 1,
          }),
        }
      );

      if (!tokenResponse.ok) throw new Error('Failed to fetch token balances');

      const tokenData = await tokenResponse.json();

      const tokens: TokenBalance[] = [];

      // Add ETH if balance > 0
      if (ethBalance > 0.0001) {
        tokens.push({
          symbol: 'ETH',
          balance: ethBalance,
          price: 0,
          value: 0,
        });
      }

      // Process ERC-20 tokens
      const significantTokens = tokenData.result.tokenBalances
        .filter((token: any) => {
          const balance = parseInt(token.tokenBalance, 16);
          return balance > 0;
        })
        .slice(0, 10); // Limit to top 10 tokens

      for (const token of significantTokens) {
        try {
          // Get token metadata
          const metadataResponse = await fetch(
            `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'alchemy_getTokenMetadata',
                params: [token.contractAddress],
                id: 1,
              }),
            }
          );

          if (!metadataResponse.ok) continue;

          const metadata = await metadataResponse.json();
          const decimals = metadata.result?.decimals || 18;
          const symbol = metadata.result?.symbol || 'UNKNOWN';
          
          const balance = parseInt(token.tokenBalance, 16) / Math.pow(10, decimals);

          if (balance > 0.0001) {
            tokens.push({
              symbol: symbol.toUpperCase(),
              balance,
              price: 0,
              value: 0,
              contractAddress: token.contractAddress,
            });
          }
        } catch (error) {
          console.error('Error processing token:', error);
        }
      }

      return tokens;
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      throw error;
    }
  };

  const refreshWalletData = async () => {
    if (!address || !isConnected) return;

    setWalletData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const tokens = await fetchWalletBalances(address);
      const symbols = tokens.map(t => t.symbol);
      const prices = await fetchTokenPrices(symbols);

      const updatedTokens = tokens.map(token => ({
        ...token,
        price: prices[token.symbol] || 0,
        value: (prices[token.symbol] || 0) * token.balance,
      }));

      const totalValue = updatedTokens.reduce((sum, token) => sum + token.value, 0);

      setWalletData({
        totalValue,
        tokens: updatedTokens.filter(t => t.value > 1), // Filter out tokens worth less than $1
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      setWalletData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch wallet data',
      }));
    }
  };

  // Initial fetch and periodic updates
  useEffect(() => {
    if (isConnected && address) {
      refreshWalletData();
      
      // Refresh every 30 seconds
      const interval = setInterval(refreshWalletData, 30000);
      return () => clearInterval(interval);
    } else {
      // Clear data when disconnected
      setWalletData({
        totalValue: 0,
        tokens: [],
        isLoading: false,
        error: null,
        lastUpdated: null,
      });
    }
  }, [address, isConnected]);

  return {
    ...walletData,
    refresh: refreshWalletData,
  };
}