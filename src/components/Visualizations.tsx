
import React, { useState } from 'react';
import { useData, VisualizationType, VisualizationConfig } from '../context/DataContext';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  AreaChart, Area, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlusCircle, BarChart as BarChartIcon, PieChart as PieChartIcon, 
  LineChart as LineChartIcon, Layers, Plus, Trash2, Download,
  ScatterChart as ScatterChartIcon
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

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
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
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
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
              barSize={30}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    if (type === 'line' && xAxis && yAxis) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
              strokeWidth={2}
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
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
              strokeWidth={2}
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
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
            <ZAxis range={[60, 60]} />
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
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius={90} data={sortedData}>
            <PolarGrid stroke="#888" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
            <Radar 
              name={valueField} 
              dataKey="value" 
              stroke="#3B82F6" 
              fill="#3B82F680" 
              fillOpacity={0.6}
              strokeWidth={2}
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
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={histogramData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
              width={80}
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
                const size = Math.max(20, Math.min(50, 20 + normalizedValue * 30));
                
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
              range={[20, 60]}
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
      <CardContent className="p-4">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

const ChartCreator: React.FC = () => {
  const { columns, addVisualization } = useData();
  const [chartType, setChartType] = useState<VisualizationType>('bar');
  const [title, setTitle] = useState<string>('New Chart');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [categoryField, setCategoryField] = useState<string>('');
  const [valueField, setValueField] = useState<string>('');

  const handleCreateChart = () => {
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please provide a title for your chart",
        variant: "destructive",
      });
      return;
    }

    if (chartType === 'pie' || chartType === 'radar') {
      if (!categoryField || !valueField) {
        toast({
          title: "Missing fields",
          description: "Please select both category and value fields",
          variant: "destructive",
        });
        return;
      }

      addVisualization({
        type: chartType,
        title,
        categoryField,
        valueField,
      });
    } else if (chartType === 'histogram') {
      if (!xAxis) {
        toast({
          title: "Missing axis",
          description: "Please select a numeric field for the histogram",
          variant: "destructive",
        });
        return;
      }

      addVisualization({
        type: chartType,
        title,
        xAxis,
      });
    } else {
      if (!xAxis || (chartType !== 'histogram' && !yAxis)) {
        toast({
          title: "Missing axes",
          description: "Please select both X and Y axes",
          variant: "destructive",
        });
        return;
      }

      addVisualization({
        type: chartType,
        title,
        xAxis,
        yAxis,
      });
    }

    // Reset form
    setTitle('New Chart');
    setXAxis('');
    setYAxis('');
    setCategoryField('');
    setValueField('');

    toast({
      title: "Chart created",
      description: "Your visualization has been added",
    });
  };

  return (
    <Card className="border border-border/20 shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-medium">Create Visualization</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Chart Type</label>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            <Button
              variant={chartType === 'bar' ? "default" : "outline"}
              className="flex flex-col items-center justify-center h-20 py-1"
              onClick={() => setChartType('bar')}
            >
              <BarChartIcon className="h-6 w-6 mb-1" />
              <span className="text-xs">Bar</span>
            </Button>
            <Button
              variant={chartType === 'line' ? "default" : "outline"}
              className="flex flex-col items-center justify-center h-20 py-1"
              onClick={() => setChartType('line')}
            >
              <LineChartIcon className="h-6 w-6 mb-1" />
              <span className="text-xs">Line</span>
            </Button>
            <Button
              variant={chartType === 'pie' ? "default" : "outline"}
              className="flex flex-col items-center justify-center h-20 py-1"
              onClick={() => setChartType('pie')}
            >
              <PieChartIcon className="h-6 w-6 mb-1" />
              <span className="text-xs">Pie</span>
            </Button>
            <Button
              variant={chartType === 'area' ? "default" : "outline"}
              className="flex flex-col items-center justify-center h-20 py-1"
              onClick={() => setChartType('area')}
            >
              <Layers className="h-6 w-6 mb-1" />
              <span className="text-xs">Area</span>
            </Button>
            <Button
              variant={chartType === 'scatter' ? "default" : "outline"}
              className="flex flex-col items-center justify-center h-20 py-1"
              onClick={() => setChartType('scatter')}
            >
              <ScatterChartIcon className="h-6 w-6 mb-1" />
              <span className="text-xs">Scatter</span>
            </Button>
            <Button
              variant={chartType === 'histogram' ? "default" : "outline"}
              className="flex flex-col items-center justify-center h-20 py-1"
              onClick={() => setChartType('histogram')}
            >
              <BarChartIcon className="h-6 w-6 mb-1" />
              <span className="text-xs">Histogram</span>
            </Button>
            <Button
              variant={chartType === 'heatmap' ? "default" : "outline"}
              className="flex flex-col items-center justify-center h-20 py-1"
              onClick={() => setChartType('heatmap')}
            >
              <div className="grid grid-cols-2 gap-0.5 h-6 w-6 mb-1">
                <div className="bg-blue-300 rounded-sm"></div>
                <div className="bg-blue-500 rounded-sm"></div>
                <div className="bg-blue-600 rounded-sm"></div>
                <div className="bg-blue-800 rounded-sm"></div>
              </div>
              <span className="text-xs">Heatmap</span>
            </Button>
            <Button
              variant={chartType === 'radar' ? "default" : "outline"}
              className="flex flex-col items-center justify-center h-20 py-1"
              onClick={() => setChartType('radar')}
            >
              <div className="relative h-6 w-6 mb-1">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-current opacity-70 rounded-full"></div>
                  <div className="absolute h-1 w-1 bg-current rounded-full"></div>
                </div>
              </div>
              <span className="text-xs">Radar</span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Chart Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter chart title"
          />
        </div>

        {(chartType === 'pie' || chartType === 'radar') ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Field</label>
              <Select value={categoryField} onValueChange={setCategoryField}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category field" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Value Field</label>
              <Select value={valueField} onValueChange={setValueField}>
                <SelectTrigger>
                  <SelectValue placeholder="Select value field" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : chartType === 'histogram' ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">Numeric Field</label>
            <Select value={xAxis} onValueChange={setXAxis}>
              <SelectTrigger>
                <SelectValue placeholder="Select numeric field" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">X Axis</label>
              <Select value={xAxis} onValueChange={setXAxis}>
                <SelectTrigger>
                  <SelectValue placeholder="Select X axis" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Y Axis</label>
              <Select value={yAxis} onValueChange={setYAxis}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Y axis" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Button 
          className="w-full mt-4 flex items-center space-x-2" 
          onClick={handleCreateChart}
        >
          <Plus className="h-4 w-4" />
          <span>Create Visualization</span>
        </Button>
      </CardContent>
    </Card>
  );
};

const Visualizations: React.FC = () => {
  const { data, visualizations, removeVisualization } = useData();

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-secondary/30 rounded-lg">
        <p className="text-muted-foreground">No data available for visualization</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ChartCreator />
      
      {visualizations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {visualizations.map((config, index) => (
            <ChartContainer
              key={index}
              config={config}
              index={index}
              onRemove={removeVisualization}
            />
          ))}
        </div>
      )}
      
      {visualizations.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-lg bg-background">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <PlusCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No visualizations yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Create your first chart by selecting the chart type and configuring the data fields above.
          </p>
        </div>
      )}
    </div>
  );
};

export default Visualizations;
