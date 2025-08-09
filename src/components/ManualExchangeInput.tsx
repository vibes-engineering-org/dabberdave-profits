"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Plus, Edit, Save, X, DollarSign, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

interface ManualBalance {
  id: string;
  exchangeName: string;
  tokenSymbol: string;
  amount: number;
  currentPrice?: number;
  totalValue: number;
  lastUpdated: number;
  notes?: string;
}

interface ManualTrade {
  id: string;
  exchangeName: string;
  tokenSymbol: string;
  type: "buy" | "sell";
  amount: number;
  pricePerToken: number;
  totalValue: number;
  fee?: number;
  date: string;
  notes?: string;
}

interface ManualExchangeInputProps {
  onDataChange?: (balances: ManualBalance[], trades: ManualTrade[]) => void;
}

export default function ManualExchangeInput({ onDataChange }: ManualExchangeInputProps) {
  const [balances, setBalances] = useState<ManualBalance[]>([]);
  const [trades, setTrades] = useState<ManualTrade[]>([]);
  const [isAddingBalance, setIsAddingBalance] = useState(false);
  const [isAddingTrade, setIsAddingTrade] = useState(false);
  const [editingBalance, setEditingBalance] = useState<string | null>(null);
  const [editingTrade, setEditingTrade] = useState<string | null>(null);
  const { toast } = useToast();

  const [newBalance, setNewBalance] = useState({
    exchangeName: "",
    tokenSymbol: "",
    amount: "",
    currentPrice: "",
    notes: ""
  });

  const [newTrade, setNewTrade] = useState({
    exchangeName: "",
    tokenSymbol: "",
    type: "buy" as "buy" | "sell",
    amount: "",
    pricePerToken: "",
    fee: "",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  // Load data from localStorage
  useEffect(() => {
    const savedBalances = localStorage.getItem('manual-exchange-balances');
    if (savedBalances) {
      setBalances(JSON.parse(savedBalances));
    }
    
    const savedTrades = localStorage.getItem('manual-exchange-trades');
    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('manual-exchange-balances', JSON.stringify(balances));
    onDataChange?.(balances, trades);
  }, [balances, trades, onDataChange]);

  useEffect(() => {
    localStorage.setItem('manual-exchange-trades', JSON.stringify(trades));
  }, [trades]);

  const addBalance = () => {
    if (!newBalance.exchangeName || !newBalance.tokenSymbol || !newBalance.amount) {
      toast({
        title: "Missing Information",
        description: "Please provide exchange name, token symbol, and amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newBalance.amount);
    const currentPrice = newBalance.currentPrice ? parseFloat(newBalance.currentPrice) : 0;
    
    const balance: ManualBalance = {
      id: Date.now().toString(),
      exchangeName: newBalance.exchangeName,
      tokenSymbol: newBalance.tokenSymbol.toUpperCase(),
      amount,
      currentPrice: currentPrice || undefined,
      totalValue: currentPrice ? amount * currentPrice : amount,
      lastUpdated: Date.now(),
      notes: newBalance.notes || undefined
    };

    setBalances(prev => [...prev, balance]);
    setNewBalance({
      exchangeName: "",
      tokenSymbol: "",
      amount: "",
      currentPrice: "",
      notes: ""
    });
    setIsAddingBalance(false);
    
    toast({
      title: "Balance Added",
      description: `Added ${amount} ${balance.tokenSymbol} from ${balance.exchangeName}`,
    });
  };

  const addTrade = () => {
    if (!newTrade.exchangeName || !newTrade.tokenSymbol || !newTrade.amount || !newTrade.pricePerToken) {
      toast({
        title: "Missing Information",
        description: "Please provide exchange name, token symbol, amount, and price",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newTrade.amount);
    const pricePerToken = parseFloat(newTrade.pricePerToken);
    const fee = newTrade.fee ? parseFloat(newTrade.fee) : 0;
    
    const trade: ManualTrade = {
      id: Date.now().toString(),
      exchangeName: newTrade.exchangeName,
      tokenSymbol: newTrade.tokenSymbol.toUpperCase(),
      type: newTrade.type,
      amount,
      pricePerToken,
      totalValue: amount * pricePerToken,
      fee: fee || undefined,
      date: newTrade.date,
      notes: newTrade.notes || undefined
    };

    setTrades(prev => [...prev, trade]);
    setNewTrade({
      exchangeName: "",
      tokenSymbol: "",
      type: "buy",
      amount: "",
      pricePerToken: "",
      fee: "",
      date: new Date().toISOString().split('T')[0],
      notes: ""
    });
    setIsAddingTrade(false);
    
    toast({
      title: "Trade Added",
      description: `Added ${newTrade.type} of ${amount} ${trade.tokenSymbol}`,
    });
  };

  const deleteBalance = (id: string) => {
    setBalances(prev => prev.filter(b => b.id !== id));
    toast({
      title: "Balance Deleted",
      description: "Balance entry has been removed",
    });
  };

  const deleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Trade Deleted", 
      description: "Trade entry has been removed",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getTotalValue = () => {
    return balances.reduce((sum, balance) => sum + balance.totalValue, 0);
  };

  const getTradesValue = () => {
    const buys = trades.filter(t => t.type === 'buy').reduce((sum, t) => sum + t.totalValue, 0);
    const sells = trades.filter(t => t.type === 'sell').reduce((sum, t) => sum + t.totalValue, 0);
    return { buys, sells, net: buys - sells };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Manual Exchange Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manually track your crypto holdings and trades across different exchanges. 
            Perfect for exchanges without API access or for maintaining complete control over your data.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Balances Value</p>
              <p className="text-xl font-bold">{formatCurrency(getTotalValue())}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Trade Volume</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-green-600">Buy: {formatCurrency(getTradesValue().buys)}</span>
                <span className="text-sm text-red-600">Sell: {formatCurrency(getTradesValue().sells)}</span>
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Net Trading</p>
              <p className={`text-lg font-bold ${getTradesValue().net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(getTradesValue().net)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="balances" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="balances">Current Balances</TabsTrigger>
          <TabsTrigger value="trades">Trade History</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Holdings</span>
                <Button
                  size="sm"
                  onClick={() => setIsAddingBalance(true)}
                  disabled={isAddingBalance}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Balance
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAddingBalance && (
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="exchange-name">Exchange Name</Label>
                      <Input
                        id="exchange-name"
                        placeholder="Binance, Coinbase, etc."
                        value={newBalance.exchangeName}
                        onChange={(e) => setNewBalance(prev => ({ ...prev, exchangeName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="token-symbol">Token Symbol</Label>
                      <Input
                        id="token-symbol"
                        placeholder="BTC, ETH, SOL..."
                        value={newBalance.tokenSymbol}
                        onChange={(e) => setNewBalance(prev => ({ ...prev, tokenSymbol: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={newBalance.amount}
                        onChange={(e) => setNewBalance(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="current-price">Current Price (Optional)</Label>
                      <Input
                        id="current-price"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={newBalance.currentPrice}
                        onChange={(e) => setNewBalance(prev => ({ ...prev, currentPrice: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes..."
                      value={newBalance.notes}
                      onChange={(e) => setNewBalance(prev => ({ ...prev, notes: e.target.value }))}
                      className="min-h-[60px]"
                    />
                  </div>
                  {newBalance.amount && newBalance.currentPrice && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        Total Value: {formatCurrency(parseFloat(newBalance.amount) * parseFloat(newBalance.currentPrice))}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={addBalance}>Add Balance</Button>
                    <Button variant="outline" onClick={() => {
                      setIsAddingBalance(false);
                      setNewBalance({
                        exchangeName: "",
                        tokenSymbol: "",
                        amount: "",
                        currentPrice: "",
                        notes: ""
                      });
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {balances.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No balances added yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your first balance to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {balances.map((balance) => (
                    <div key={balance.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{balance.tokenSymbol}</h4>
                            <Badge variant="outline">{balance.exchangeName}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Amount: {balance.amount}
                            {balance.currentPrice && ` @ ${formatCurrency(balance.currentPrice)}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Updated: {new Date(balance.lastUpdated).toLocaleString()}
                          </p>
                          {balance.notes && (
                            <p className="text-xs text-muted-foreground italic">{balance.notes}</p>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-semibold">{formatCurrency(balance.totalValue)}</p>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingBalance(balance.id)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteBalance(balance.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Trade History</span>
                <Button
                  size="sm"
                  onClick={() => setIsAddingTrade(true)}
                  disabled={isAddingTrade}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Trade
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAddingTrade && (
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="trade-exchange">Exchange Name</Label>
                      <Input
                        id="trade-exchange"
                        placeholder="Binance, Coinbase, etc."
                        value={newTrade.exchangeName}
                        onChange={(e) => setNewTrade(prev => ({ ...prev, exchangeName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="trade-token">Token Symbol</Label>
                      <Input
                        id="trade-token"
                        placeholder="BTC, ETH, SOL..."
                        value={newTrade.tokenSymbol}
                        onChange={(e) => setNewTrade(prev => ({ ...prev, tokenSymbol: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="trade-type">Trade Type</Label>
                      <select
                        id="trade-type"
                        className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                        value={newTrade.type}
                        onChange={(e) => setNewTrade(prev => ({ ...prev, type: e.target.value as "buy" | "sell" }))}
                      >
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="trade-amount">Amount</Label>
                      <Input
                        id="trade-amount"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={newTrade.amount}
                        onChange={(e) => setNewTrade(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="trade-price">Price per Token</Label>
                      <Input
                        id="trade-price"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={newTrade.pricePerToken}
                        onChange={(e) => setNewTrade(prev => ({ ...prev, pricePerToken: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="trade-fee">Fee (Optional)</Label>
                      <Input
                        id="trade-fee"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={newTrade.fee}
                        onChange={(e) => setNewTrade(prev => ({ ...prev, fee: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="trade-date">Date</Label>
                      <Input
                        id="trade-date"
                        type="date"
                        value={newTrade.date}
                        onChange={(e) => setNewTrade(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="trade-notes">Notes (Optional)</Label>
                      <Input
                        id="trade-notes"
                        placeholder="Additional notes..."
                        value={newTrade.notes}
                        onChange={(e) => setNewTrade(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </div>
                  {newTrade.amount && newTrade.pricePerToken && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        Total Value: {formatCurrency(parseFloat(newTrade.amount) * parseFloat(newTrade.pricePerToken))}
                        {newTrade.fee && ` (Fee: ${formatCurrency(parseFloat(newTrade.fee))})`}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={addTrade}>Add Trade</Button>
                    <Button variant="outline" onClick={() => {
                      setIsAddingTrade(false);
                      setNewTrade({
                        exchangeName: "",
                        tokenSymbol: "",
                        type: "buy",
                        amount: "",
                        pricePerToken: "",
                        fee: "",
                        date: new Date().toISOString().split('T')[0],
                        notes: ""
                      });
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {trades.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No trades added yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your first trade to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trades
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((trade) => (
                      <div key={trade.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{trade.tokenSymbol}</h4>
                              <Badge variant={trade.type === "buy" ? "default" : "destructive"}>
                                {trade.type.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">{trade.exchangeName}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {trade.amount} @ {formatCurrency(trade.pricePerToken)}
                              {trade.fee && ` (Fee: ${formatCurrency(trade.fee)})`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(trade.date).toLocaleDateString()}
                            </p>
                            {trade.notes && (
                              <p className="text-xs text-muted-foreground italic">{trade.notes}</p>
                            )}
                          </div>
                          <div className="text-right space-y-1">
                            <div className="flex items-center gap-1">
                              {trade.type === "buy" ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                              <span className="font-semibold">{formatCurrency(trade.totalValue)}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingTrade(trade.id)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteTrade(trade.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}