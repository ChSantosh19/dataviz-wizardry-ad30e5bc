
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart, LineChart, PieChart, AreaChart, Radar, ScatterChart, Activity, Boxes } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const chartIcons = {
  bar: BarChart,
  line: LineChart,
  pie: PieChart,
  area: AreaChart,
  radar: Radar,
  scatter: ScatterChart,
  heatmap: Activity,
  histogram: Boxes,
};

const ChartSelectionDialog = () => {
  const { 
    recommendedVisualizations, 
    showChartSelectionDialog, 
    setShowChartSelectionDialog,
    setSelectedVisualizations,
    generateSelectedVisualizations
  } = useData();
  
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);

  // Group visualizations by type
  const groupedVisualizations = recommendedVisualizations.reduce((acc, viz) => {
    const key = `${viz.type}_${viz.xAxis || ''}_${viz.yAxis || ''}_${viz.categoryField || ''}_${viz.valueField || ''}`;
    acc[key] = viz;
    return acc;
  }, {} as Record<string, typeof recommendedVisualizations[0]>);

  const uniqueVisualizations = Object.values(groupedVisualizations);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    
    if (checked) {
      const newSelected: Record<string, boolean> = {};
      uniqueVisualizations.forEach((_, index) => {
        newSelected[index.toString()] = true;
      });
      setSelected(newSelected);
    } else {
      setSelected({});
    }
  };

  const handleSelect = (index: number, checked: boolean) => {
    setSelected(prev => ({
      ...prev,
      [index.toString()]: checked
    }));
    
    // Update selectAll state based on all items being selected
    const newSelected = { ...selected, [index.toString()]: checked };
    const allSelected = uniqueVisualizations.every((_, i) => newSelected[i.toString()]);
    setSelectAll(allSelected);
  };

  const handleGenerate = () => {
    const selectedVizs = Object.keys(selected)
      .filter(key => selected[key])
      .map(key => uniqueVisualizations[parseInt(key)]);
    
    if (selectedVizs.length === 0) {
      toast({
        title: "No visualizations selected",
        description: "Please select at least one visualization type",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedVisualizations(selectedVizs);
    generateSelectedVisualizations();
    setShowChartSelectionDialog(false);
    
    toast({
      title: "Generating visualizations",
      description: `Created ${selectedVizs.length} chart${selectedVizs.length > 1 ? 's' : ''}`
    });
  };

  return (
    <Dialog open={showChartSelectionDialog} onOpenChange={setShowChartSelectionDialog}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Select Visualizations to Generate</DialogTitle>
          <DialogDescription>
            Choose which chart types you'd like to generate based on your data
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center space-x-2 p-2 border-b mb-4">
            <Checkbox 
              id="selectAll" 
              checked={selectAll}
              onCheckedChange={checked => handleSelectAll(checked === true)}
            />
            <label htmlFor="selectAll" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Select All
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {uniqueVisualizations.map((viz, index) => {
              const IconComponent = chartIcons[viz.type] || BarChart;
              return (
                <div 
                  key={index} 
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    selected[index.toString()] ? 'border-primary/50 bg-primary/5' : 'border-border'
                  }`}
                >
                  <Checkbox 
                    id={`viz-${index}`}
                    checked={selected[index.toString()] || false}
                    onCheckedChange={checked => handleSelect(index, checked === true)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-primary/80" />
                      <label 
                        htmlFor={`viz-${index}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {viz.title}
                      </label>
                    </div>
                    {viz.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {viz.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {viz.xAxis && (
                        <div className="bg-secondary text-xs px-2 py-1 rounded">
                          X: {viz.xAxis}
                        </div>
                      )}
                      {viz.yAxis && (
                        <div className="bg-secondary text-xs px-2 py-1 rounded">
                          Y: {viz.yAxis}
                        </div>
                      )}
                      {viz.categoryField && (
                        <div className="bg-secondary text-xs px-2 py-1 rounded">
                          Category: {viz.categoryField}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowChartSelectionDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate}>
            Generate Charts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChartSelectionDialog;
