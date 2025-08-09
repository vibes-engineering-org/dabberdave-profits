interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  sandbox?: boolean;
}

interface ExchangeTransaction {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  fee: number;
  timestamp: string;
  exchangeId: string;
}

interface ExchangeBalance {
  symbol: string;
  available: number;
  locked: number;
  total: number;
}

interface ExchangeData {
  transactions: ExchangeTransaction[];
  balances: ExchangeBalance[];
  lastUpdated: string;
}

// Simulated Coinbase Pro API integration
class CoinbaseProAPI {
  private credentials: ExchangeCredentials;

  constructor(credentials: ExchangeCredentials) {
    this.credentials = credentials;
  }

  async validateCredentials(): Promise<boolean> {
    try {
      // In a real implementation, this would make an actual API call to validate
      // For now, simulate validation based on credential format
      return !!(
        this.credentials.apiKey && 
        this.credentials.apiSecret && 
        this.credentials.passphrase &&
        this.credentials.apiKey.length > 10 &&
        this.credentials.apiSecret.length > 10
      );
    } catch (error) {
      console.error('Coinbase Pro credential validation failed:', error);
      return false;
    }
  }

  async getTransactions(limit: number = 100): Promise<ExchangeTransaction[]> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real implementation, this would make authenticated requests to:
      // GET /fills - to get trading history
      // For now, return simulated data based on popular trading patterns
      
      const simulatedTransactions: ExchangeTransaction[] = [
        {
          id: 'cb_1',
          symbol: 'BTC',
          side: 'buy',
          amount: 0.5,
          price: 45000,
          fee: 112.5,
          timestamp: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
          exchangeId: 'coinbase'
        },
        {
          id: 'cb_2',
          symbol: 'ETH',
          side: 'buy',
          amount: 2.0,
          price: 3000,
          fee: 15,
          timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
          exchangeId: 'coinbase'
        },
        {
          id: 'cb_3',
          symbol: 'BTC',
          side: 'sell',
          amount: 0.1,
          price: 47000,
          fee: 23.5,
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          exchangeId: 'coinbase'
        }
      ];

      return simulatedTransactions.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch Coinbase Pro transactions:', error);
      throw new Error('Failed to fetch trading history from Coinbase Pro');
    }
  }

  async getBalances(): Promise<ExchangeBalance[]> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // In a real implementation, this would make authenticated requests to:
      // GET /accounts - to get account balances
      
      const simulatedBalances: ExchangeBalance[] = [
        {
          symbol: 'BTC',
          available: 0.4,
          locked: 0,
          total: 0.4
        },
        {
          symbol: 'ETH',
          available: 2.0,
          locked: 0,
          total: 2.0
        },
        {
          symbol: 'USD',
          available: 1500.75,
          locked: 0,
          total: 1500.75
        }
      ];

      return simulatedBalances;
    } catch (error) {
      console.error('Failed to fetch Coinbase Pro balances:', error);
      throw new Error('Failed to fetch balances from Coinbase Pro');
    }
  }
}

// Simulated Base chain integration
class BaseChainAPI {
  private credentials: ExchangeCredentials;

  constructor(credentials: ExchangeCredentials) {
    this.credentials = credentials;
  }

  async validateCredentials(): Promise<boolean> {
    try {
      // For Base chain, we might use RPC endpoints or APIs like Alchemy/Moralis
      // Validate the API key format
      return !!(this.credentials.apiKey && this.credentials.apiKey.length > 10);
    } catch (error) {
      console.error('Base chain credential validation failed:', error);
      return false;
    }
  }

  async getTransactions(walletAddress?: string): Promise<ExchangeTransaction[]> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // In a real implementation, this would query Base chain for:
      // - Token transfers
      // - DEX trades (Uniswap, etc.)
      // - DeFi interactions
      
      const simulatedTransactions: ExchangeTransaction[] = [
        {
          id: 'base_1',
          symbol: 'ETH',
          side: 'buy',
          amount: 1.0,
          price: 3100,
          fee: 0.005, // Gas fees
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
          exchangeId: 'base'
        },
        {
          id: 'base_2',
          symbol: 'USDC',
          side: 'sell',
          amount: 1000,
          price: 1.0,
          fee: 0.002,
          timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
          exchangeId: 'base'
        }
      ];

      return simulatedTransactions;
    } catch (error) {
      console.error('Failed to fetch Base chain transactions:', error);
      throw new Error('Failed to fetch transactions from Base chain');
    }
  }

  async getBalances(walletAddress?: string): Promise<ExchangeBalance[]> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 900));

      // In a real implementation, this would query token balances on Base
      const simulatedBalances: ExchangeBalance[] = [
        {
          symbol: 'ETH',
          available: 1.0,
          locked: 0,
          total: 1.0
        },
        {
          symbol: 'USDC',
          available: 500.0,
          locked: 0,
          total: 500.0
        }
      ];

      return simulatedBalances;
    } catch (error) {
      console.error('Failed to fetch Base chain balances:', error);
      throw new Error('Failed to fetch balances from Base chain');
    }
  }
}

// Main exchange service
export class ExchangeService {
  private static instance: ExchangeService;

  static getInstance(): ExchangeService {
    if (!ExchangeService.instance) {
      ExchangeService.instance = new ExchangeService();
    }
    return ExchangeService.instance;
  }

  async fetchExchangeData(exchangeId: string, credentials: ExchangeCredentials): Promise<ExchangeData> {
    let api: CoinbaseProAPI | BaseChainAPI;
    
    switch (exchangeId) {
      case 'coinbase':
        api = new CoinbaseProAPI(credentials);
        break;
      case 'base':
        api = new BaseChainAPI(credentials);
        break;
      default:
        throw new Error(`Unsupported exchange: ${exchangeId}`);
    }

    // Validate credentials first
    const isValid = await api.validateCredentials();
    if (!isValid) {
      throw new Error('Invalid API credentials');
    }

    // Fetch data in parallel
    const [transactions, balances] = await Promise.all([
      api.getTransactions(),
      api.getBalances()
    ]);

    return {
      transactions,
      balances,
      lastUpdated: new Date().toISOString()
    };
  }

  async syncAllConnectedExchanges(): Promise<{[exchangeId: string]: ExchangeData}> {
    const connections = this.getStoredConnections();
    const results: {[exchangeId: string]: ExchangeData} = {};

    // Sync all connected exchanges in parallel
    const syncPromises = connections
      .filter(conn => conn.connected && conn.credentials)
      .map(async (conn) => {
        try {
          const data = await this.fetchExchangeData(conn.id, conn.credentials!);
          results[conn.id] = data;
          
          // Update last sync time
          this.updateConnectionSyncTime(conn.id);
        } catch (error) {
          console.error(`Failed to sync ${conn.id}:`, error);
          // Don't throw here, continue with other exchanges
        }
      });

    await Promise.allSettled(syncPromises);
    return results;
  }

  private getStoredConnections(): any[] {
    const stored = localStorage.getItem('exchange-connections');
    return stored ? JSON.parse(stored) : [];
  }

  private updateConnectionSyncTime(exchangeId: string) {
    const connections = this.getStoredConnections();
    const updatedConnections = connections.map(conn => 
      conn.id === exchangeId 
        ? { ...conn, lastSync: new Date().toISOString() }
        : conn
    );
    localStorage.setItem('exchange-connections', JSON.stringify(updatedConnections));
  }

  // Convert exchange transactions to the format expected by PnLTracker
  convertToPnLTransactions(exchangeData: {[exchangeId: string]: ExchangeData}) {
    const transactions: any[] = [];
    
    Object.values(exchangeData).forEach(data => {
      data.transactions.forEach(tx => {
        transactions.push({
          id: tx.id,
          tokenSymbol: tx.symbol,
          type: tx.side,
          amount: tx.amount,
          pricePerToken: tx.price,
          totalValue: tx.amount * tx.price,
          timestamp: new Date(tx.timestamp).getTime(),
          source: tx.exchangeId,
          fee: tx.fee
        });
      });
    });

    return transactions;
  }
}

export type { ExchangeCredentials, ExchangeTransaction, ExchangeBalance, ExchangeData };