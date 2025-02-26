
import { Card } from "./ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StockPriceProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  logoUrl?: string;
  companyName?: string;
}

const StockPrice = ({ 
  symbol, 
  price = 0, 
  change = 0, 
  changePercent = 0, 
  logoUrl, 
  companyName 
}: StockPriceProps) => {
  const isPositive = change >= 0;
  const isLoading = price === 0 && change === 0 && changePercent === 0;

  // Safely handle potentially null values and loading state
  const formatNumber = (value: number | null) => {
    if (value === null || isNaN(value)) return "0.00";
    return value.toFixed(2);
  };

  return (
    <Card className="price-card animate-fade-up">
      <div className="flex items-center gap-3">
        {logoUrl && (
          <img src={logoUrl} alt={symbol} className="w-8 h-8 rounded" />
        )}
        <div>
          <h3 className="text-lg font-semibold">{symbol}</h3>
          {companyName && (
            <p className="text-sm text-muted-foreground">{companyName}</p>
          )}
        </div>
        {!isLoading && (
          isPositive ? (
            <TrendingUp className="w-5 h-5 text-success ml-auto" />
          ) : (
            <TrendingDown className="w-5 h-5 text-danger ml-auto" />
          )
        )}
      </div>
      <p className="text-3xl font-bold mt-2">
        ${isLoading ? "..." : formatNumber(price)}
      </p>
      {!isLoading && (
        <div className={isPositive ? "trend-positive" : "trend-negative"}>
          <span className="font-medium">
            {isPositive ? "+" : ""}
            {formatNumber(change)} ({formatNumber(changePercent)}%)
          </span>
        </div>
      )}
      {isLoading && (
        <div className="text-muted-foreground">
          Loading...
        </div>
      )}
    </Card>
  );
};

export default StockPrice;
