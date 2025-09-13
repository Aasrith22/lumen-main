import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UsageData {
  name: string;
  value: number;
  color: string;
}

interface UsageChartProps {
  data: UsageData[];
  totalUsage: number;
  totalQuota: number;
}

const UsageChart = ({ data, totalUsage, totalQuota }: UsageChartProps) => {
  const usagePercentage = Math.round((totalUsage / totalQuota) * 100);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-medium text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="text-deep-blue">Data Usage Overview</CardTitle>
        <CardDescription>
          Current usage: {totalUsage}GB of {totalQuota}GB ({usagePercentage}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                className="usage-chart"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}GB`, 'Usage']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-light-gray/50 rounded-lg p-3">
            <p className="text-dark-gray font-medium">Remaining</p>
            <p className="text-lg font-bold text-success">
              {totalQuota - totalUsage}GB
            </p>
          </div>
          <div className="bg-light-gray/50 rounded-lg p-3">
            <p className="text-dark-gray font-medium">Days Left</p>
            <p className="text-lg font-bold text-deep-blue">
              12 days
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageChart;