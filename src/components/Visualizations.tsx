
import React, { useState } from 'react';
import { useData, VisualizationType, VisualizationConfig } from '../context/DataContext';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  AreaChart, Area, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, BarChart as BarChartIcon, PieChart as PieChartIcon, LineChart as LineChartIcon, Layers, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const COLORS = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899'];

interface ChartContainerProps {
  config: VisualizationConfig;
  index: number;
  onRemove: (index: number) => void;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ config, index, onRemove }) => {
  const { data } = useData();
  
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
      
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={processedData}
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
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    
    if (type === 'bar' && xAxis && yAxis) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey={yAxis} 
              fill="#3B82F6" 
              animationDuration={800}
              animationBegin={100}
              animationEasing="ease-out"
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
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={yAxis} 
              stroke="#3B82F6" 
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
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={yAxis} 
              stroke="#3B82F6"
              fill="#3B82F680" 
              animationDuration={800}
              animationBegin={100}
              animationEasing="ease-out"
            />
          </AreaChart>
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
      
      return (
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius={90} data={processedData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis />
            <Radar 
              name={valueField} 
              dataKey="value" 
              stroke="#3B82F6" 
              fill="#3B82F680" 
              fillOpacity={0.6}
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
    
    return (
      <div className="flex items-center justify-center h-64 bg-secondary/30 rounded-lg">
        <p className="text-muted-foreground">Invalid chart configuration</p>
      </div>
    );
  };

  return (
    <Card className="chart-container animate-scale">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-medium">{config.title}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="h-8 w-8 rounded-full"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
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
    } else {
      if (!xAxis || !yAxis) {
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
          <div className="grid grid-cols-5 gap-2">
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
