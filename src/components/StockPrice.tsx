
import { Card } from "./ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StockPriceProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const StockPrice = ({ symbol, price, change, changePercent }: StockPriceProps) => {
  const isPositive = change >= 0;

  return (
    <Card className="price-card animate-fade-up">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{symbol}</h3>
        {isPositive ? (
          <TrendingUp className="w-5 h-5 text-success" />
        ) : (
          <TrendingDown className="w-5 h-5 text-danger" />
        )}
      </div>
      <p className="text-3xl font-bold">${price.toFixed(2)}</p>
      <div className={isPositive ? "trend-positive" : "trend-negative"}>
        <span className="font-medium">
          {isPositive ? "+" : ""}
          {change.toFixed(2)} ({changePercent.toFixed(2)}%)
        </span>
      </div>
    </Card>
  );
};

export default StockPrice;
