
import React from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  PieChart, 
  LineChart,
  AreaChart,
  ArrowRightCircle,
  Lightbulb,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const getIconForVisualization = (type: string) => {
  switch (type) {
    case 'bar':
      return <BarChart className="h-4 w-4" />;
    case 'pie':
      return <PieChart className="h-4 w-4" />;
    case 'line':
    case 'scatter':
      return <LineChart className="h-4 w-4" />;
    case 'area':
      return <AreaChart className="h-4 w-4" />;
    default:
      return <BarChart className="h-4 w-4" />;
  }
};

const DataSummary: React.FC = () => {
  const { 
    dataSummary, 
    addVisualization, 
    generateAllVisualizations,
    recommendedVisualizations
  } = useData();

  if (!dataSummary) {
    return null;
  }

  const { rowCount, columnCount, columns, correlations } = dataSummary;

  // Find columns with highest correlation
  let highestCorrelation = { col1: '', col2: '', value: 0 };
  
  Object.entries(correlations).forEach(([col1, corrs]) => {
    Object.entries(corrs).forEach(([col2, value]) => {
      if (col1 !== col2 && Math.abs(value) > Math.abs(highestCorrelation.value)) {
        highestCorrelation = { col1, col2, value: value };
      }
    });
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Dataset Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Rows:</dt>
                <dd className="font-medium">{rowCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Columns:</dt>
                <dd className="font-medium">{columnCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Numeric Columns:</dt>
                <dd className="font-medium">
                  {columns.filter(col => col.type === 'numeric').length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Categorical Columns:</dt>
                <dd className="font-medium">
                  {columns.filter(col => col.type === 'categorical').length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Date Columns:</dt>
                <dd className="font-medium">
                  {columns.filter(col => col.type === 'date').length}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Column Analysis</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <ScrollArea className="h-[160px] px-4">
              <ul className="space-y-2">
                {columns.map((col) => (
                  <li key={col.name} className="text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge 
                          variant={col.type === 'numeric' ? "default" : 
                                 col.type === 'categorical' ? "secondary" : 
                                 col.type === 'date' ? "outline" : "destructive"}
                          className="mr-2"
                        >
                          {col.type}
                        </Badge>
                        <span className="font-medium">{col.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {col.uniqueValues} unique
                      </span>
                    </div>
                    {col.type === 'numeric' && (
                      <div className="text-xs text-muted-foreground ml-10">
                        Range: {col.min?.toFixed(2)} - {col.max?.toFixed(2)}, 
                        Avg: {col.mean?.toFixed(2)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highestCorrelation.col1 && (
                <div className="text-sm">
                  <div className="font-medium">Strongest Relationship:</div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    {highestCorrelation.col1} 
                    <ArrowRightCircle className="h-3 w-3 mx-1" /> 
                    {highestCorrelation.col2}
                  </div>
                  <div className="text-xs">
                    Correlation: {Math.abs(highestCorrelation.value).toFixed(2)}
                    {highestCorrelation.value > 0 ? " (positive)" : " (negative)"}
                  </div>
                </div>
              )}
              
              {columns.filter(col => col.missingValues > 0).length > 0 && (
                <div className="text-sm">
                  <div className="font-medium">Missing Data:</div>
                  <div className="text-muted-foreground">
                    {columns.filter(col => col.missingValues > 0).length} columns have missing values
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {recommendedVisualizations.length > 0 && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg font-medium flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-amber-400" />
                Recommended Visualizations
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Based on your data, we recommend these visualizations
              </p>
            </div>
            
            <Button 
              onClick={generateAllVisualizations}
              className="whitespace-nowrap"
            >
              Generate All
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[220px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedVisualizations.slice(0, 9).map((viz, index) => (
                  <Card key={index} className="border border-border/50">
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-sm font-medium flex items-center">
                        {getIconForVisualization(viz.type)}
                        <span className="ml-2">{viz.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                      <p className="text-xs text-muted-foreground mb-3">
                        {viz.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {viz.type}
                        </Badge>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => addVisualization(viz)}
                        >
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataSummary;
