
import { DataRow } from '../context/DataContext';

export interface ColumnAnalysis {
  name: string;
  type: 'numeric' | 'categorical' | 'date' | 'unknown';
  count: number;
  uniqueValues: number;
  missingValues: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  mode?: any;
  correlations?: Record<string, number>;
}

export interface DataSummary {
  rowCount: number;
  columnCount: number;
  columns: ColumnAnalysis[];
  correlations: Record<string, Record<string, number>>;
  recommendedVisualizations: {
    type: string;
    title: string;
    xAxis?: string;
    yAxis?: string;
    valueField?: string;
    categoryField?: string;
    description: string;
    strength: number; // 0-1 score for recommendation strength
  }[];
}

// Determine if a value is numeric
const isNumeric = (value: any): boolean => {
  if (typeof value === 'number') return true;
  if (typeof value !== 'string') return false;
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
};

// Determine if a value might be a date
const isDate = (value: any): boolean => {
  if (value instanceof Date) return true;
  if (typeof value !== 'string') return false;
  
  // Check common date formats
  return !isNaN(Date.parse(value));
};

// Calculate correlation coefficient between two numeric arrays
const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;
  
  // Calculate means
  const xMean = x.reduce((sum, val) => sum + val, 0) / x.length;
  const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;
  
  // Calculate correlation coefficient
  let numerator = 0;
  let xDenominator = 0;
  let yDenominator = 0;
  
  for (let i = 0; i < x.length; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    numerator += xDiff * yDiff;
    xDenominator += xDiff * xDiff;
    yDenominator += yDiff * yDiff;
  }
  
  if (xDenominator === 0 || yDenominator === 0) return 0;
  return numerator / Math.sqrt(xDenominator * yDenominator);
};

// Get the mode (most frequent value) of an array
const getMode = (arr: any[]): any => {
  const counts = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let maxCount = 0;
  let mode: any = null;
  
  for (const [val, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      mode = val;
    }
  }
  
  return mode;
};

// Analyze each column to determine its type and statistics
const analyzeColumn = (name: string, values: any[]): ColumnAnalysis => {
  // Filter out undefined, null, empty strings
  const filteredValues = values.filter(v => v !== undefined && v !== null && v !== '');
  const missingValues = values.length - filteredValues.length;
  
  // Check if column is numeric
  const numericValues = filteredValues.filter(v => isNumeric(v)).map(v => Number(v));
  const isNumericColumn = numericValues.length >= filteredValues.length * 0.7; // 70% threshold
  
  // Check if column is a date
  const dateValues = filteredValues.filter(v => isDate(v));
  const isDateColumn = dateValues.length >= filteredValues.length * 0.7; // 70% threshold
  
  // Get unique values
  const uniqueValuesSet = new Set(filteredValues.map(v => String(v)));
  
  // Determine column type
  let type: 'numeric' | 'categorical' | 'date' | 'unknown' = 'unknown';
  
  if (isNumericColumn) {
    type = 'numeric';
  } else if (isDateColumn) {
    type = 'date';
  } else if (uniqueValuesSet.size <= values.length * 0.5) { // If less than 50% are unique, consider categorical
    type = 'categorical';
  }
  
  // Base analysis
  const analysis: ColumnAnalysis = {
    name,
    type,
    count: values.length,
    uniqueValues: uniqueValuesSet.size,
    missingValues,
  };
  
  // Add numeric statistics if applicable
  if (type === 'numeric' && numericValues.length > 0) {
    // Sort values for median calculation
    const sorted = [...numericValues].sort((a, b) => a - b);
    
    analysis.min = Math.min(...numericValues);
    analysis.max = Math.max(...numericValues);
    analysis.mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
    analysis.median = sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
  }
  
  // Add mode for categorical
  if (type === 'categorical' || type === 'date') {
    analysis.mode = getMode(filteredValues);
  }
  
  return analysis;
};

// Generate recommendations based on column analysis
const generateRecommendations = (
  columns: ColumnAnalysis[],
  correlations: Record<string, Record<string, number>>
) => {
  const recommendations = [];
  
  const numericColumns = columns.filter(col => col.type === 'numeric');
  const categoricalColumns = columns.filter(col => col.type === 'categorical' || col.type === 'date');
  
  // 1. Categorical vs Numeric (Bar charts)
  for (const catCol of categoricalColumns) {
    for (const numCol of numericColumns) {
      // Only recommend if categorical column doesn't have too many unique values
      if (catCol.uniqueValues <= 15) {
        recommendations.push({
          type: 'bar',
          title: `${numCol.name} by ${catCol.name}`,
          xAxis: catCol.name,
          yAxis: numCol.name,
          description: `Bar chart showing ${numCol.name} for each ${catCol.name}`,
          strength: 0.8
        });
      }
    }
  }
  
  // 2. Categorical vs Count (Pie charts)
  for (const catCol of categoricalColumns) {
    if (catCol.uniqueValues > 2 && catCol.uniqueValues <= 8) {
      recommendations.push({
        type: 'pie',
        title: `Distribution of ${catCol.name}`,
        categoryField: catCol.name,
        valueField: 'count',
        description: `Pie chart showing the distribution of ${catCol.name}`,
        strength: 0.7
      });
    }
  }
  
  // 3. Numeric vs Numeric (Scatter plots for high correlation)
  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const col1 = numericColumns[i];
      const col2 = numericColumns[j];
      const correlation = correlations[col1.name]?.[col2.name] || 0;
      
      // Only recommend scatter plots for columns with meaningful correlation
      if (Math.abs(correlation) > 0.3) {
        recommendations.push({
          type: 'line',
          title: `${col1.name} vs ${col2.name}`,
          xAxis: col1.name,
          yAxis: col2.name,
          description: `Line chart comparing ${col1.name} and ${col2.name}`,
          strength: Math.abs(correlation)
        });
      }
    }
  }
  
  // 4. Time series (if we have a date column)
  const dateColumns = columns.filter(col => col.type === 'date');
  for (const dateCol of dateColumns) {
    for (const numCol of numericColumns) {
      recommendations.push({
        type: 'line',
        title: `${numCol.name} over time`,
        xAxis: dateCol.name,
        yAxis: numCol.name,
        description: `Line chart showing ${numCol.name} changes over time`,
        strength: 0.9
      });
    }
  }
  
  // 5. Radar charts for multi-dimension numerical data
  if (numericColumns.length >= 3 && numericColumns.length <= 8) {
    recommendations.push({
      type: 'radar',
      title: `Multi-dimension Analysis`,
      categoryField: categoricalColumns.length > 0 ? categoricalColumns[0].name : null,
      valueField: numericColumns[0].name,
      description: `Radar chart comparing multiple dimensions`,
      strength: 0.6
    });
  }
  
  // Sort by recommendation strength
  return recommendations.sort((a, b) => b.strength - a.strength);
};

// Main function to analyze dataset
export const analyzeData = (data: DataRow[]): DataSummary => {
  if (!data.length) {
    return {
      rowCount: 0,
      columnCount: 0,
      columns: [],
      correlations: {},
      recommendedVisualizations: []
    };
  }
  
  const rowCount = data.length;
  const columns = Object.keys(data[0]);
  const columnCount = columns.length;
  
  // Extract values for each column
  const columnValues: Record<string, any[]> = {};
  columns.forEach(col => {
    columnValues[col] = data.map(row => row[col]);
  });
  
  // Analyze each column
  const columnAnalysis: ColumnAnalysis[] = columns.map(col => analyzeColumn(col, columnValues[col]));
  
  // Calculate correlations between numeric columns
  const correlations: Record<string, Record<string, number>> = {};
  const numericColumns = columnAnalysis.filter(col => col.type === 'numeric');
  
  numericColumns.forEach(col1 => {
    correlations[col1.name] = {};
    
    numericColumns.forEach(col2 => {
      if (col1.name === col2.name) {
        correlations[col1.name][col2.name] = 1; // Perfect correlation with itself
      } else {
        const values1 = data.map(row => Number(row[col1.name])).filter(v => !isNaN(v));
        const values2 = data.map(row => Number(row[col2.name])).filter(v => !isNaN(v));
        
        // Create pairs of values (removing rows where either value is missing)
        const pairs = [];
        for (let i = 0; i < Math.min(values1.length, values2.length); i++) {
          if (!isNaN(values1[i]) && !isNaN(values2[i])) {
            pairs.push([values1[i], values2[i]]);
          }
        }
        
        const x = pairs.map(p => p[0]);
        const y = pairs.map(p => p[1]);
        
        correlations[col1.name][col2.name] = calculateCorrelation(x, y);
      }
    });
  });
  
  // Generate visualization recommendations
  const recommendedVisualizations = generateRecommendations(columnAnalysis, correlations);
  
  return {
    rowCount,
    columnCount,
    columns: columnAnalysis,
    correlations,
    recommendedVisualizations
  };
};
