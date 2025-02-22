
import { Card } from "./ui/card";
import { CircleDot } from "lucide-react";

interface NewsItem {
  title: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral";
  time: string;
}

interface NewsCardProps {
  news: NewsItem[];
}

const NewsCard = ({ news }: NewsCardProps) => {
  const getSentimentColor = (sentiment: NewsItem["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-danger";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="glass-card p-4 animate-fade-up">
      <h3 className="text-lg font-semibold mb-4">Latest News</h3>
      <div className="space-y-4">
        {news.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <CircleDot className={`w-4 h-4 mt-1 ${getSentimentColor(item.sentiment)}`} />
            <div>
              <p className="font-medium">{item.title}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{item.source}</span>
                <span>•</span>
                <span>{item.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default NewsCard;
