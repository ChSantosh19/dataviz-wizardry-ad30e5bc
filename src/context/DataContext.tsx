
import React, { createContext, useContext, useState, useEffect } from "react";
import { DataSummary } from "../utils/dataAnalyzer";

export interface DataRow {
  [key: string]: string | number;
}

export type VisualizationType = "bar" | "line" | "pie" | "area" | "radar" | "scatter" | "heatmap" | "histogram";

export interface VisualizationConfig {
  type: VisualizationType;
  title: string;
  xAxis?: string;
  yAxis?: string;
  valueField?: string;
  categoryField?: string;
  strength?: number;
  description?: string;
}

interface DataContextProps {
  data: DataRow[];
  columns: string[];
  setData: (data: DataRow[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  visualizations: VisualizationConfig[];
  addVisualization: (config: VisualizationConfig) => void;
  removeVisualization: (index: number) => void;
  clearData: () => void;
  fileName: string;
  setFileName: (name: string) => void;
  dataSummary: DataSummary | null;
  setDataSummary: (summary: DataSummary | null) => void;
  recommendedVisualizations: VisualizationConfig[];
  generateAllVisualizations: () => void;
  selectedVizTypes: VisualizationType[];
  setSelectedVizTypes: (types: VisualizationType[]) => void;
  allVizTypes: VisualizationType[];
  chartTypeSelection: VisualizationType[];
  setChartTypeSelection: (types: VisualizationType[]) => void;
  mathStats: MathStats | null;
  setMathStats: (stats: MathStats | null) => void;
}

export interface MathStats {
  numericColumns: {
    name: string;
    min: number;
    max: number;
    mean: number;
    median: number;
    standardDeviation: number;
  }[];
  correlations: {
    column1: string;
    column2: string;
    value: number;
  }[];
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visualizations, setVisualizations] = useState<VisualizationConfig[]>([]);
  const [fileName, setFileName] = useState<string>("data");
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [recommendedVisualizations, setRecommendedVisualizations] = useState<VisualizationConfig[]>([]);
  const [selectedVizTypes, setSelectedVizTypes] = useState<VisualizationType[]>([
    "bar", "line", "pie", "scatter", "area", "radar", "heatmap", "histogram"
  ]);
  const [chartTypeSelection, setChartTypeSelection] = useState<VisualizationType[]>([]);
  const [mathStats, setMathStats] = useState<MathStats | null>(null);
  
  const allVizTypes: VisualizationType[] = [
    "bar", "line", "pie", "scatter", "area", "radar", "heatmap", "histogram"
  ];

  // Update columns when data changes
  useEffect(() => {
    if (data.length > 0) {
      const firstRow = data[0];
      setColumns(Object.keys(firstRow));
    } else {
      setColumns([]);
    }
  }, [data]);

  // Update recommended visualizations when data summary changes
  useEffect(() => {
    if (dataSummary) {
      const vizConfigs = dataSummary.recommendedVisualizations?.map(rec => ({
        type: rec.type as VisualizationType,
        title: rec.title,
        xAxis: rec.xAxis,
        yAxis: rec.yAxis,
        valueField: rec.valueField,
        categoryField: rec.categoryField,
        strength: rec.strength,
        description: rec.description
      })) || [];
      
      setRecommendedVisualizations(vizConfigs);
    } else {
      setRecommendedVisualizations([]);
    }
  }, [dataSummary]);

  const addVisualization = (config: VisualizationConfig) => {
    setVisualizations((prev) => [...prev, config]);
  };

  const removeVisualization = (index: number) => {
    setVisualizations((prev) => prev.filter((_, i) => i !== index));
  };

  const clearData = () => {
    setData([]);
    setVisualizations([]);
    setFileName("data");
    setDataSummary(null);
    setRecommendedVisualizations([]);
    setChartTypeSelection([]);
    setMathStats(null);
  };

  const generateAllVisualizations = () => {
    try {
      console.log("Generating visualizations with chart types:", chartTypeSelection);
      console.log("Recommended visualizations:", recommendedVisualizations);
      
      if (!chartTypeSelection || chartTypeSelection.length === 0) {
        // If no specific chart types selected, use the selected types from the filter
        const filteredViz = recommendedVisualizations.filter(viz => 
          selectedVizTypes.includes(viz.type)
        );
        console.log("Using selected viz types filter:", selectedVizTypes);
        console.log("Filtered visualizations:", filteredViz);
        setVisualizations(filteredViz.slice(0, 20));
      } else {
        // Use only the chart types that the user specifically selected
        const filteredViz = recommendedVisualizations.filter(viz => 
          chartTypeSelection.includes(viz.type)
        );
        console.log("Using chart type selection:", chartTypeSelection);
        console.log("Filtered visualizations:", filteredViz);
        setVisualizations(filteredViz.slice(0, 20));
      }
    } catch (error) {
      console.error("Error generating visualizations:", error);
    }
  };

  return (
    <DataContext.Provider
      value={{
        data,
        columns,
        setData,
        isLoading,
        setIsLoading,
        visualizations,
        addVisualization,
        removeVisualization,
        clearData,
        fileName,
        setFileName,
        dataSummary,
        setDataSummary,
        recommendedVisualizations,
        generateAllVisualizations,
        selectedVizTypes,
        setSelectedVizTypes,
        allVizTypes,
        chartTypeSelection,
        setChartTypeSelection,
        mathStats,
        setMathStats
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextProps => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
