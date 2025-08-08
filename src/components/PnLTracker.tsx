"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface Transaction {
  id: string;
  tokenSymbol: string;
  type: "buy" | "sell";
  amount: number;
  pricePerToken: number;
  timestamp: number;
  totalValue: number;
}

interface TokenPosition {
  symbol: string;
  totalAmount: number;
  avgCostBasis: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
  transactions: Transaction[];
}

interface TokenPrices {
  [symbol: string]: number;
}

interface DailyPnL {
  date: string;
  portfolioValue: number;
  dailyChange: number;
  dailyChangePercentage: number;
}

export default function PnLTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokenPrices, setTokenPrices] = useState<TokenPrices>({});
  const [positions, setPositions] = useState<TokenPosition[]>([]);
  const [startBalance, setStartBalance] = useState<number>(0);
  const [dailyPnLHistory, setDailyPnLHistory] = useState<DailyPnL[]>([]);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isSettingStartBalance, setIsSettingStartBalance] = useState(false);
  const [startBalanceInput, setStartBalanceInput] = useState("");
  const [newTransaction, setNewTransaction] = useState({
    tokenSymbol: "",
    type: "buy" as "buy" | "sell",
    amount: "",
    pricePerToken: "",
  });

  // Popular tokens for quick price fetching
  const POPULAR_TOKENS = ["BTC", "ETH", "SOL", "USDC", "USDT", "BNB", "XRP", "ADA"];

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem("pnl-transactions");
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    
    const savedStartBalance = localStorage.getItem("pnl-start-balance");
    if (savedStartBalance) {
      setStartBalance(parseFloat(savedStartBalance));
    }
    
    const savedDailyHistory = localStorage.getItem("pnl-daily-history");
    if (savedDailyHistory) {
      setDailyPnLHistory(JSON.parse(savedDailyHistory));
    }
  }, []);

  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("pnl-transactions", JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    localStorage.setItem("pnl-start-balance", startBalance.toString());
  }, [startBalance]);
  
  useEffect(() => {
    localStorage.setItem("pnl-daily-history", JSON.stringify(dailyPnLHistory));
  }, [dailyPnLHistory]);

  // Fetch token prices
  const fetchTokenPrices = async () => {
    try {
      const uniqueTokens = [...new Set(transactions.map(t => t.tokenSymbol))];
      const tokensToFetch = [...new Set([...uniqueTokens, ...POPULAR_TOKENS])];
      
      if (tokensToFetch.length === 0) return;

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokensToFetch.map(token => 
          token.toLowerCase() === 'btc' ? 'bitcoin' :
          token.toLowerCase() === 'eth' ? 'ethereum' :
          token.toLowerCase() === 'sol' ? 'solana' :
          token.toLowerCase() === 'usdc' ? 'usd-coin' :
          token.toLowerCase() === 'usdt' ? 'tether' :
          token.toLowerCase() === 'bnb' ? 'binancecoin' :
          token.toLowerCase() === 'xrp' ? 'ripple' :
          token.toLowerCase() === 'ada' ? 'cardano' :
          token.toLowerCase()
        ).join(',')}&vs_currencies=usd`
      );

      if (response.ok) {
        const data = await response.json();
        const prices: TokenPrices = {};
        
        tokensToFetch.forEach(token => {
          const coinId = token.toLowerCase() === 'btc' ? 'bitcoin' :
                        token.toLowerCase() === 'eth' ? 'ethereum' :
                        token.toLowerCase() === 'sol' ? 'solana' :
                        token.toLowerCase() === 'usdc' ? 'usd-coin' :
                        token.toLowerCase() === 'usdt' ? 'tether' :
                        token.toLowerCase() === 'bnb' ? 'binancecoin' :
                        token.toLowerCase() === 'xrp' ? 'ripple' :
                        token.toLowerCase() === 'ada' ? 'cardano' :
                        token.toLowerCase();
          
          if (data[coinId] && data[coinId].usd) {
            prices[token.toUpperCase()] = data[coinId].usd;
          }
        });
        
        setTokenPrices(prices);
      }
    } catch (error) {
      console.error("Failed to fetch token prices:", error);
    }
  };

  // Calculate positions from transactions
  useEffect(() => {
    const positionMap: { [symbol: string]: TokenPosition } = {};

    transactions.forEach(transaction => {
      const symbol = transaction.tokenSymbol.toUpperCase();
      
      if (!positionMap[symbol]) {
        positionMap[symbol] = {
          symbol,
          totalAmount: 0,
          avgCostBasis: 0,
          currentPrice: tokenPrices[symbol] || 0,
          totalInvested: 0,
          currentValue: 0,
          pnl: 0,
          pnlPercentage: 0,
          transactions: []
        };
      }

      positionMap[symbol].transactions.push(transaction);

      if (transaction.type === "buy") {
        const newTotalInvested = positionMap[symbol].totalInvested + transaction.totalValue;
        const newTotalAmount = positionMap[symbol].totalAmount + transaction.amount;
        
        positionMap[symbol].totalInvested = newTotalInvested;
        positionMap[symbol].totalAmount = newTotalAmount;
        positionMap[symbol].avgCostBasis = newTotalAmount > 0 ? newTotalInvested / newTotalAmount : 0;
      } else {
        // For sell transactions, reduce the total amount but keep cost basis calculation intact
        positionMap[symbol].totalAmount -= transaction.amount;
        positionMap[symbol].totalInvested -= transaction.amount * positionMap[symbol].avgCostBasis;
      }
    });

    // Calculate current values and P&L
    Object.values(positionMap).forEach(position => {
      position.currentPrice = tokenPrices[position.symbol] || 0;
      position.currentValue = position.totalAmount * position.currentPrice;
      position.pnl = position.currentValue - position.totalInvested;
      position.pnlPercentage = position.totalInvested > 0 ? (position.pnl / position.totalInvested) * 100 : 0;
    });

    setPositions(Object.values(positionMap).filter(p => p.totalAmount > 0));
  }, [transactions, tokenPrices]);

  // Fetch prices on mount and every 30 seconds
  useEffect(() => {
    fetchTokenPrices();
    const interval = setInterval(fetchTokenPrices, 30000);
    return () => clearInterval(interval);
  }, [transactions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track daily PnL changes
  useEffect(() => {
    const currentValue = getTotalPortfolioValue();
    if (currentValue === 0) return;

    const today = new Date().toDateString();
    const existingEntryIndex = dailyPnLHistory.findIndex(entry => entry.date === today);
    
    if (existingEntryIndex >= 0) {
      // Update today's entry
      const updatedHistory = [...dailyPnLHistory];
      const previousValue = dailyPnLHistory[existingEntryIndex - 1]?.portfolioValue || startBalance;
      updatedHistory[existingEntryIndex] = {
        date: today,
        portfolioValue: currentValue,
        dailyChange: currentValue - previousValue,
        dailyChangePercentage: previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0
      };
      setDailyPnLHistory(updatedHistory);
    } else {
      // Add new entry for today
      const previousValue = dailyPnLHistory.length > 0 
        ? dailyPnLHistory[dailyPnLHistory.length - 1].portfolioValue 
        : startBalance;
      
      const newEntry: DailyPnL = {
        date: today,
        portfolioValue: currentValue,
        dailyChange: currentValue - previousValue,
        dailyChangePercentage: previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0
      };
      
      setDailyPnLHistory(prev => [...prev, newEntry]);
    }
  }, [positions, startBalance]); // eslint-disable-line react-hooks/exhaustive-deps

  const setStartBalanceValue = () => {
    if (!startBalanceInput) return;
    
    const value = parseFloat(startBalanceInput);
    setStartBalance(value);
    setStartBalanceInput("");
    setIsSettingStartBalance(false);
  };

  const getTodaysPnL = () => {
    const today = new Date().toDateString();
    const todayEntry = dailyPnLHistory.find(entry => entry.date === today);
    return todayEntry || null;
  };

  const addTransaction = () => {
    if (!newTransaction.tokenSymbol || !newTransaction.amount || !newTransaction.pricePerToken) {
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      tokenSymbol: newTransaction.tokenSymbol.toUpperCase(),
      type: newTransaction.type,
      amount: parseFloat(newTransaction.amount),
      pricePerToken: parseFloat(newTransaction.pricePerToken),
      totalValue: parseFloat(newTransaction.amount) * parseFloat(newTransaction.pricePerToken),
      timestamp: Date.now(),
    };

    setTransactions(prev => [...prev, transaction]);
    setNewTransaction({
      tokenSymbol: "",
      type: "buy",
      amount: "",
      pricePerToken: "",
    });
    setIsAddingTransaction(false);
  };

  const getTotalPortfolioValue = () => {
    return positions.reduce((total, position) => total + position.currentValue, 0);
  };

  const getTotalInvested = () => {
    return positions.reduce((total, position) => total + position.totalInvested, 0);
  };

  const getTotalPnL = () => {
    return positions.reduce((total, position) => total + position.pnl, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Start Balance</p>
              <p className="text-lg font-bold">{formatCurrency(startBalance)}</p>
              {!isSettingStartBalance ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-1 text-xs"
                  onClick={() => setIsSettingStartBalance(true)}
                >
                  {startBalance === 0 ? 'Set' : 'Edit'}
                </Button>
              ) : (
                <div className="space-y-1 mt-1">
                  <Input
                    type="number"
                    placeholder="1000.00"
                    value={startBalanceInput}
                    onChange={(e) => setStartBalanceInput(e.target.value)}
                    className="text-xs h-6"
                  />
                  <div className="flex gap-1">
                    <Button size="sm" className="text-xs h-5" onClick={setStartBalanceValue}>
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-xs h-5"
                      onClick={() => {
                        setIsSettingStartBalance(false);
                        setStartBalanceInput("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-lg font-bold">{formatCurrency(getTotalPortfolioValue())}</p>
              <p className="text-xs text-muted-foreground">Invested: {formatCurrency(getTotalInvested())}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total P&L</p>
              <div className="flex items-center justify-center gap-1">
                {getTotalPnL() >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <p className={`text-lg font-bold ${getTotalPnL() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(getTotalPnL())}
                </p>
              </div>
              <p className={`text-xs ${getTotalPnL() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getTotalInvested() > 0 ? formatPercentage((getTotalPnL() / getTotalInvested()) * 100) : '+0.00%'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Daily P&L</p>
              {getTodaysPnL() ? (
                <div>
                  <div className="flex items-center justify-center gap-1">
                    {getTodaysPnL()!.dailyChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <p className={`text-lg font-bold ${getTodaysPnL()!.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(getTodaysPnL()!.dailyChange)}
                    </p>
                  </div>
                  <p className={`text-xs ${getTodaysPnL()!.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(getTodaysPnL()!.dailyChangePercentage)}
                  </p>
                </div>
              ) : (
                <p className="text-lg font-bold text-muted-foreground">No data</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="daily">Daily P&L</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          {positions.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">No positions yet</p>
                  <p className="text-sm text-muted-foreground">Add your first transaction to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            positions.map(position => (
              <Card key={position.symbol}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{position.symbol}</h3>
                        <Badge variant="outline">{position.totalAmount.toFixed(6)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Avg Cost: {formatCurrency(position.avgCostBasis)} | Current: {formatCurrency(position.currentPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {position.pnl >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`font-semibold ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(position.pnl)}
                        </span>
                      </div>
                      <p className={`text-sm ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercentage(position.pnlPercentage)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(position.currentValue)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">No transactions yet</p>
                  <p className="text-sm text-muted-foreground">Add your first transaction to start tracking</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            transactions
              .sort((a, b) => b.timestamp - a.timestamp)
              .map(transaction => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{transaction.tokenSymbol}</h3>
                          <Badge variant={transaction.type === "buy" ? "default" : "destructive"}>
                            {transaction.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {transaction.amount} @ {formatCurrency(transaction.pricePerToken)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(transaction.totalValue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          {dailyPnLHistory.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">No daily data yet</p>
                  <p className="text-sm text-muted-foreground">Daily P&L will be tracked as you add transactions and prices update</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            dailyPnLHistory
              .slice()
              .reverse()
              .slice(0, 30) // Show last 30 days
              .map(dailyData => (
                <Card key={dailyData.date}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{new Date(dailyData.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</h3>
                        <p className="text-sm text-muted-foreground">
                          Portfolio Value: {formatCurrency(dailyData.portfolioValue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          {dailyData.dailyChange >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`font-semibold ${dailyData.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(dailyData.dailyChange)}
                          </span>
                        </div>
                        <p className={`text-sm ${dailyData.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatPercentage(dailyData.dailyChangePercentage)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>

      {/* Add Transaction */}
      <Card>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAddingTransaction ? (
            <Button onClick={() => setIsAddingTransaction(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="token">Token Symbol</Label>
                  <Input
                    id="token"
                    placeholder="BTC, ETH, SOL..."
                    value={newTransaction.tokenSymbol}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, tokenSymbol: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value as "buy" | "sell" }))}
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price per Token</Label>
                  <Input
                    id="price"
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={newTransaction.pricePerToken}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, pricePerToken: e.target.value }))}
                  />
                </div>
              </div>
              {newTransaction.amount && newTransaction.pricePerToken && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    Total Value: {formatCurrency(parseFloat(newTransaction.amount) * parseFloat(newTransaction.pricePerToken))}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={addTransaction} className="flex-1">
                  Add Transaction
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingTransaction(false);
                    setNewTransaction({
                      tokenSymbol: "",
                      type: "buy",
                      amount: "",
                      pricePerToken: "",
                    });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}