import React, { useState, useEffect } from 'react';
import { useData, VisualizationType, VisualizationConfig } from '../context/DataContext';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  AreaChart, Area, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Cell, 
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Layers, Trash2, Download, BarChart as BarChartIcon,
  PieChart as PieChartIcon, LineChart as LineChartIcon,
  ScatterChart as ScatterChartIcon, Activity,
  FileBarChart2, Grid3X3, Radar as RadarIcon
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import html2canvas from 'html2canvas';

const COLORS = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899', '#06B6D4', '#16A34A', '#EF4444'];

interface ChartContainerProps {
  config: VisualizationConfig;
  index: number;
  onRemove: (index: number) => void;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ config, index, onRemove }) => {
  const { data } = useData();
  
  const downloadChart = async () => {
    try {
      const chartElement = document.getElementById(`chart-${index}`);
      if (!chartElement) return;
      
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        backgroundColor: '#FFFFFF'
      });
      
      const link = document.createElement('a');
      link.download = `${config.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: "Chart downloaded",
        description: "Chart image has been saved",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading the chart",
        variant: "destructive",
      });
    }
  };
  
  const renderChart = () => {
    if (!data.length) return null;

    const { type, xAxis, yAxis, valueField, categoryField } = config;
    
    // Larger chart height and no grid
    const chartHeight = 650;
    const chartMargin = { top: 40, right: 40, left: 50, bottom: 80 };
    
    if (type === 'pie' && valueField && categoryField) {
      // Process data for pie chart
      const processedData = data.reduce((acc, row) => {
        const category = String(row[categoryField]);
        const existingCategory = acc.find(item => item.name === category);
        
        if (existingCategory) {
          existingCategory.value += Number(row[valueField]) || 0;
        } else {
          acc.push({
            name: category,
            value: Number(row[valueField]) || 0
          });
        }
        
        return acc;
      }, [] as { name: string; value: number }[]);
      
      // Sort and limit to top 8 categories for better visualization
      const sortedData = [...processedData]
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
      
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={240}
              fill="#8884d8"
              dataKey="value"
              animationDuration={800}
              animationBegin={100}
              animationEasing="ease-out"
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}`, valueField]} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    
    if (type === 'bar' && xAxis && yAxis) {
      // Group and limit data if needed
      let chartData = [...data];
      if (chartData.length > 20) {
        // If too many rows, group by xAxis
        const groupedData = {} as Record<string, any>;
        data.forEach(row => {
          const key = String(row[xAxis]);
          if (!groupedData[key]) {
            groupedData[key] = { ...row };
          } else {
            groupedData[key][yAxis] = (Number(groupedData[key][yAxis]) || 0) + (Number(row[yAxis]) || 0);
          }
        });
        chartData = Object.values(groupedData).slice(0, 20);
      }
      
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            margin={chartMargin}
          >
            <XAxis 
              dataKey={xAxis} 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey={yAxis} 
              fill="#3B82F6" 
              animationDuration={800}
              animationBegin={100}
              animationEasing="ease-out"
              barSize={50}
              radius={[6, 6, 0, 0]}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    if (type === 'line' && xAxis && yAxis) {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart
            data={data}
            margin={chartMargin}
          >
            <XAxis 
              dataKey={xAxis} 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={yAxis} 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8 }}
              animationDuration={800}
              animationBegin={100}
              animationEasing="ease-out" 
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    
    if (type === 'area' && xAxis && yAxis) {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart
            data={data}
            margin={chartMargin}
          >
            <XAxis 
              dataKey={xAxis} 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={yAxis} 
              stroke="#3B82F6"
              fill="#3B82F680" 
              strokeWidth={3}
              animationDuration={800}
              animationBegin={100}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    
    if (type === 'scatter' && xAxis && yAxis) {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ScatterChart
            margin={chartMargin}
          >
            <XAxis 
              dataKey={xAxis} 
              name={xAxis} 
              type="number"
              label={{ value: xAxis, position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis 
              dataKey={yAxis} 
              name={yAxis} 
              type="number"
              label={{ value: yAxis, angle: -90, position: 'insideLeft' }}
            />
            <ZAxis range={[80, 200]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter 
              name={`${xAxis} vs ${yAxis}`} 
              data={data} 
              fill="#8884d8"
              shape="circle"
              animationDuration={800}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Scatter>
            {/* Add a regression line if correlation is significant */}
            {config.strength && config.strength > 0.5 && (
              <ReferenceLine 
                stroke="red"
                strokeDasharray="3 3"
                segment={[
                  { x: Math.min(...data.map(d => Number(d[xAxis]))), y: Math.min(...data.map(d => Number(d[yAxis]))) },
                  { x: Math.max(...data.map(d => Number(d[xAxis]))), y: Math.max(...data.map(d => Number(d[yAxis]))) }
                ]}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      );
    }
    
    if (type === 'radar' && categoryField && valueField) {
      // Process data for radar chart
      const processedData = data.reduce((acc, row) => {
        const category = String(row[categoryField]);
        const existingCategory = acc.find(item => item.subject === category);
        
        if (existingCategory) {
          existingCategory.value += Number(row[valueField]) || 0;
        } else {
          acc.push({
            subject: category,
            value: Number(row[valueField]) || 0
          });
        }
        
        return acc;
      }, [] as { subject: string; value: number }[]);
      
      // Limit to top 8 categories for better visualization
      const sortedData = [...processedData]
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
      
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <RadarChart cx="50%" cy="50%" outerRadius={240} data={sortedData}>
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
            <Radar 
              name={valueField} 
              dataKey="value" 
              stroke="#3B82F6" 
              fill="#3B82F680" 
              fillOpacity={0.6}
              strokeWidth={3}
              animationDuration={800}
              animationBegin={100}
              animationEasing="ease-out" 
            />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      );
    }
    
    if (type === 'histogram' && xAxis) {
      // Create histogram data
      const values = data.map(row => Number(row[xAxis])).filter(v => !isNaN(v));
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
      const binWidth = range / binCount;
      
      const histogramData = Array(binCount).fill(0).map((_, i) => {
        const binStart = min + i * binWidth;
        const binEnd = binStart + binWidth;
        const count = values.filter(v => v >= binStart && v < binEnd).length;
        return {
          bin: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
          count,
          binStart,
          binEnd
        };
      });
      
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={histogramData}
            margin={chartMargin}
          >
            <XAxis 
              dataKey="bin" 
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value, name) => [`${value} items`, `Frequency`]}
              labelFormatter={(label) => `Range: ${label}`}
            />
            <Bar 
              dataKey="count" 
              fill="#3B82F6" 
              animationDuration={800}
              animationBegin={100}
              animationEasing="ease-out"
              radius={[4, 4, 0, 0]}
            >
              {histogramData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    if (type === 'heatmap' && xAxis && yAxis) {
      // Process data for heatmap
      const uniqueXValues = [...new Set(data.map(d => String(d[xAxis])))];
      const uniqueYValues = [...new Set(data.map(d => String(d[yAxis])))];
      
      const heatmapData = [];
      for (const xValue of uniqueXValues.slice(0, 10)) {
        for (const yValue of uniqueYValues.slice(0, 10)) {
          const filteredData = data.filter(
            d => String(d[xAxis]) === xValue && String(d[yAxis]) === yValue
          );
          
          if (filteredData.length > 0) {
            // If valueField is provided, use it; otherwise, count occurrences
            const value = valueField 
              ? filteredData.reduce((sum, row) => sum + Number(row[valueField]), 0) / filteredData.length
              : filteredData.length;
            
            heatmapData.push({
              x: xValue,
              y: yValue,
              value
            });
          }
        }
      }
      
      // Custom heatmap using ScatterChart
      // (Recharts doesn't have a true heatmap so we approximate with scatter)
      const minValue = Math.min(...heatmapData.map(d => d.value));
      const maxValue = Math.max(...heatmapData.map(d => d.value));
      const valueRange = maxValue - minValue;
      
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ScatterChart
            margin={chartMargin}
          >
            <XAxis 
              dataKey="x" 
              type="category"
              name={xAxis}
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis 
              dataKey="y" 
              type="category"
              name={yAxis}
              width={100}
            />
            <Tooltip 
              cursor={false}
              formatter={(value) => [`${value}`, valueField || 'Count']}
            />
            <Scatter 
              data={heatmapData} 
              shape="square"
            >
              {heatmapData.map((entry, index) => {
                // Calculate color based on value (from blue to red)
                const normalizedValue = valueRange > 0 
                  ? (entry.value - minValue) / valueRange 
                  : 0.5;
                
                // Blue to red color scale
                const r = Math.floor(normalizedValue * 255);
                const b = Math.floor((1 - normalizedValue) * 255);
                const g = Math.floor(Math.min(r, b) / 2);
                
                const color = `rgb(${r}, ${g}, ${b})`;
                
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={color} 
                    stroke="#fff"
                  />
                );
              })}
            </Scatter>
            <ZAxis 
              dataKey="value" 
              range={[80, 200]}
              name={valueField || 'Count'}
            />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-64 bg-secondary/30 rounded-lg">
        <p className="text-muted-foreground">Invalid chart configuration</p>
      </div>
    );
  };

  const getChartIcon = () => {
    switch (config.type) {
      case 'bar': return <BarChartIcon className="h-5 w-5 text-primary" />;
      case 'line': return <LineChartIcon className="h-5 w-5 text-primary" />;
      case 'pie': return <PieChartIcon className="h-5 w-5 text-primary" />;
      case 'scatter': return <ScatterChartIcon className="h-5 w-5 text-primary" />;
      case 'area': return <Activity className="h-5 w-5 text-primary" />;
      case 'heatmap': return <Grid3X3 className="h-5 w-5 text-primary" />;
      case 'histogram': return <FileBarChart2 className="h-5 w-5 text-primary" />;
      case 'radar': return <RadarIcon className="h-5 w-5 text-primary" />;
      default: return <BarChartIcon className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="chart-container animate-scale shadow-md border border-border/30 bg-gradient-to-br from-card to-card/90" id={`chart-${index}`}>
      <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between space-y-0 border-b bg-card/60">
        <div className="flex items-center gap-2">
          {getChartIcon()}
          <CardTitle className="text-xl font-medium">{config.title}</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs font-medium px-2 py-1 bg-primary/10">{config.type}</Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={downloadChart}
            className="h-8 w-8 rounded-full"
            title="Download chart as image"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="h-8 w-8 rounded-full"
            title="Remove chart"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-6">
        {config.description && (
          <p className="text-muted-foreground text-sm mb-4">{config.description}</p>
        )}
        {renderChart()}
      </CardContent>
    </Card>
  );
};

const Visualizations: React.FC = () => {
  const { data, visualizations, removeVisualization, recommendedVisualizations, generateAllVisualizations, chartTypeSelection } = useData();
  const [autoGenerated, setAutoGenerated] = useState(false);

  useEffect(() => {
    // Reset the auto-generated flag whenever data changes
    setAutoGenerated(false);
  }, [data]);

  // Debug logging to understand what's happening
  useEffect(() => {
    console.log("Visualizations component renders");
    console.log("- Data length:", data.length);
    console.log("- Visualizations:", visualizations);
    console.log("- Chart types selected:", chartTypeSelection);
    console.log("- Recommended visualizations:", recommendedVisualizations);
  }, [data, visualizations, chartTypeSelection, recommendedVisualizations]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-secondary/30 rounded-lg">
        <p className="text-muted-foreground">No data available for visualization</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {visualizations.length > 0 ? (
        <div className="grid grid-cols-1 gap-10 mt-8">
          {visualizations.map((config, index) => (
            <ChartContainer
              key={index}
              config={config}
              index={index}
              onRemove={removeVisualization}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-lg bg-background">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 animate-pulse-slow">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No visualizations yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            {recommendedVisualizations.length > 0 
              ? "Select chart types to generate visualizations based on your data."
              : "Upload data first to generate visualizations automatically."}
          </p>
          {recommendedVisualizations.length > 0 && (
            <Button 
              onClick={() => {
                console.log("Generate button clicked");
                generateAllVisualizations();
                setAutoGenerated(true);
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
              size="lg"
            >
              <Layers className="h-5 w-5 mr-2" />
              Generate Visualizations
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Visualizations;
