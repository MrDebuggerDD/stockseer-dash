
import { Card } from "./ui/card";
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

interface PredictionCardProps {
  predictionData: {
    direction: "up" | "down" | "neutral";
    confidence: number;
    nextTarget: number;
    timeframe: string;
  };
}

const PredictionCard = ({ predictionData }: PredictionCardProps) => {
  const { direction, confidence, nextTarget, timeframe } = predictionData;

  return (
    <Card className="prediction-card">
      <h3 className="text-lg font-semibold mb-2">AI Prediction</h3>
      <div className="flex items-center gap-2 mb-3">
        {direction === "up" ? (
          <TrendingUp className="w-5 h-5 text-success" />
        ) : direction === "down" ? (
          <TrendingDown className="w-5 h-5 text-danger" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
        )}
        <span className="font-medium">
          {direction === "up"
            ? "Bullish"
            : direction === "down"
            ? "Bearish"
            : "Neutral"}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Confidence:</span>
          <span className="font-medium">{(confidence * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Target Price:</span>
          <span className="font-medium">${nextTarget.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Timeframe:</span>
          <span className="font-medium">{timeframe}</span>
        </div>
      </div>
    </Card>
  );
};

export default PredictionCard;
