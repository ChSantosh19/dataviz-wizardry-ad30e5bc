
import React, { useState, useEffect } from 'react';
import { useData, VisualizationType, VisualizationConfig } from '../context/DataContext';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  AreaChart, Area, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Layers, Trash2, Download, PlusCircle, BarChart as BarChartIcon
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
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
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
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 30, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xAxis} 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
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
              barSize={40}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    if (type === 'line' && xAxis && yAxis) {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 30, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xAxis} 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={yAxis} 
              stroke="#3B82F6" 
              strokeWidth={3}
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
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 30, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xAxis} 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
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
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart
            margin={{ top: 20, right: 30, left: 30, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
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
            <ZAxis range={[80, 80]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter 
              name={`${xAxis} vs ${yAxis}`} 
              data={data} 
              fill="#8884d8"
              shape="circle"
              animationDuration={800}
            />
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
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius={120} data={sortedData}>
            <PolarGrid stroke="#888" />
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
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={histogramData}
            margin={{ top: 20, right: 30, left: 30, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="bin" 
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
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
    
    // Heatmap for correlations between numeric columns
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
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart
            margin={{ top: 20, right: 30, left: 30, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="x" 
              type="category"
              name={xAxis}
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              dataKey="y" 
              type="category"
              name={yAxis}
              width={100}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
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
              range={[30, 80]}
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

  return (
    <Card className="chart-container animate-scale" id={`chart-${index}`}>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-medium card-title">{config.title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{config.type}</Badge>
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
      <CardContent className="p-6">
        {config.description && (
          <p className="text-muted-foreground text-sm mb-4">{config.description}</p>
        )}
        {renderChart()}
      </CardContent>
    </Card>
  );
};

const Visualizations: React.FC = () => {
  const { data, visualizations, removeVisualization, recommendedVisualizations, generateAllVisualizations } = useData();
  const [autoGenerated, setAutoGenerated] = useState(false);

  useEffect(() => {
    // Reset the auto-generated flag whenever data changes
    setAutoGenerated(false);
  }, [data]);

  // Auto-generate visualizations when data is available
  const handleAutoGenerate = () => {
    if (!autoGenerated && recommendedVisualizations.length > 0) {
      generateAllVisualizations();
      setAutoGenerated(true);
      
      toast({
        title: "Visualizations generated",
        description: `Created ${recommendedVisualizations.length} visualizations based on your data`,
      });
    }
  };

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-secondary/30 rounded-lg">
        <p className="text-muted-foreground">No data available for visualization</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {recommendedVisualizations.length > 0 && !autoGenerated && (
        <Card className="border border-border/20 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg font-medium">Data Visualization</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="mb-4 text-muted-foreground">
              We've analyzed your data and found {recommendedVisualizations.length} potential visualizations.
              Click the button below to generate all of them automatically.
            </p>
            <Button 
              className="w-full mt-2 flex items-center space-x-2" 
              onClick={handleAutoGenerate}
              size="lg"
            >
              <BarChartIcon className="h-5 w-5 mr-2" />
              Generate All Visualizations
            </Button>
          </CardContent>
        </Card>
      )}
      
      {visualizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
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
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <PlusCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No visualizations yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            {recommendedVisualizations.length > 0 
              ? "Click the 'Generate All Visualizations' button above to automatically create charts based on your data."
              : "Upload data first to generate visualizations automatically."}
          </p>
          {recommendedVisualizations.length > 0 && (
            <Button 
              onClick={handleAutoGenerate}
              className="flex items-center space-x-2"
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
