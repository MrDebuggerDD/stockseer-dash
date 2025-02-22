
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "./ui/card";

interface StockChartProps {
  data: {
    date: string;
    price: number;
  }[];
  isLoading?: boolean;
}

const StockChart = ({ data, isLoading }: StockChartProps) => {
  if (isLoading) {
    return (
      <Card className="stock-chart animate-pulse">
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="stock-chart animate-fade-up">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#37B24D" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#37B24D" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              color: '#f8fafc',
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#37B24D"
            fillOpacity={1}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default StockChart;
