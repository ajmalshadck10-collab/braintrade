
export enum OrderSide {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export enum TradeType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP = 'STOP'
}

export interface TradeEntry {
  id: string;
  date: string;
  symbol: string;
  positionSize: number;
  lotSize: number;
  side: OrderSide;
  type: TradeType;
  strategy: string;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  profit: number;
  reason: string;
  assumptions: string;
  isDisciplined: boolean;
  followedRules: boolean;
  rating: number;
  timestamp: number;
}

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | '3month' | '6month' | 'year';
