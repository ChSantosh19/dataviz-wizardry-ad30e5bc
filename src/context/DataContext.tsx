
import React, { createContext, useContext, useState, useEffect } from "react";

export interface DataRow {
  [key: string]: string | number;
}

export type VisualizationType = "bar" | "line" | "pie" | "area" | "radar";

export interface VisualizationConfig {
  type: VisualizationType;
  title: string;
  xAxis?: string;
  yAxis?: string;
  valueField?: string;
  categoryField?: string;
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

  useEffect(() => {
    if (data.length > 0) {
      const firstRow = data[0];
      setColumns(Object.keys(firstRow));
    } else {
      setColumns([]);
    }
  }, [data]);

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
