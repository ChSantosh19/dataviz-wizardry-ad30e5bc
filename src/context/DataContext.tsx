
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

  useEffect(() => {
    if (data.length > 0) {
      const firstRow = data[0];
      setColumns(Object.keys(firstRow));
    } else {
      setColumns([]);
    }
  }, [data]);

  useEffect(() => {
    if (dataSummary?.recommendedVisualizations) {
      const vizConfigs = dataSummary.recommendedVisualizations.map(rec => ({
        type: rec.type as VisualizationType,
        title: rec.title,
        xAxis: rec.xAxis,
        yAxis: rec.yAxis,
        valueField: rec.valueField,
        categoryField: rec.categoryField,
        strength: rec.strength,
        description: rec.description
      }));
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
  };

  const generateAllVisualizations = () => {
    // Add all recommended visualizations
    const allViz = [...recommendedVisualizations.slice(0, 10)]; // Limit to top 10 recommendations
    setVisualizations((prev) => [...prev, ...allViz]);
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
