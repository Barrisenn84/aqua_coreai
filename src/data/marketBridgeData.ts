import { MarketBridgeListing, MarketBuyerBid } from '../types/aquacore';

// No buyer offers or listings were present in the imported Meu Pescado account.
// Keep the market bridge empty until a verified offer is entered by the operator;
// fabricated counterparties and prices are unsafe for financial decisions.
export const initialBuyerBids: MarketBuyerBid[] = [];
export const initialMarketListings: MarketBridgeListing[] = [];
