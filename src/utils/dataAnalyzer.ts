
// Analyze and derive insights from uploaded or input data
import { DataRow, VisualizationType } from '../context/DataContext';

export interface ColumnSummary {
  name: string;
  type: 'numeric' | 'categorical' | 'date' | 'unknown';
  uniqueValues: number;
  missingValues: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  mostFrequent?: string | number;
  frequencies?: Record<string, number>;
}

export interface CorrelationResult {
  column1: string;
  column2: string;
  correlation: number;
  strength: 'strong' | 'moderate' | 'weak' | 'none';
}

export interface VisualizationRecommendation {
  type: VisualizationType;
  title: string;
  xAxis?: string;
  yAxis?: string;
  valueField?: string;
  categoryField?: string;
  strength?: number;
  description?: string;
}

export interface DataSummary {
  rowCount: number;
  columnCount: number;
  numericColumns: string[];
  categoricalColumns: string[];
  dateColumns: string[];
  columnSummaries: ColumnSummary[];
  correlations: CorrelationResult[];
  recommendedVisualizations: VisualizationRecommendation[];
}

// Main function to analyze data
export const analyzeData = (data: DataRow[]): DataSummary => {
  if (!data.length) {
    return {
      rowCount: 0,
      columnCount: 0,
      numericColumns: [],
      categoricalColumns: [],
      dateColumns: [],
      columnSummaries: [],
      correlations: [],
      recommendedVisualizations: [],
    };
  }

  const columnNames = Object.keys(data[0]);
  const columnTypes = detectColumnTypes(data, columnNames);
  const columnSummaries = generateColumnSummaries(data, columnNames, columnTypes);
  const correlations = findCorrelations(data, columnTypes.numericColumns);
  const recommendedVisualizations = generateVisualizationRecommendations(
    columnTypes,
    correlations,
    columnSummaries
  );

  return {
    rowCount: data.length,
    columnCount: columnNames.length,
    numericColumns: columnTypes.numericColumns,
    categoricalColumns: columnTypes.categoricalColumns,
    dateColumns: columnTypes.dateColumns,
    columnSummaries,
    correlations,
    recommendedVisualizations,
  };
};

// Detect types of columns in the data
const detectColumnTypes = (data: DataRow[], columnNames: string[]) => {
  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];
  const dateColumns: string[] = [];

  columnNames.forEach(column => {
    // Analyze a sample of data to determine type
    const sample = data.slice(0, Math.min(100, data.length));
    let numericCount = 0;
    let dateCount = 0;
    let nonEmptyCount = 0;

    sample.forEach(row => {
      const value = row[column];
      if (value !== null && value !== undefined && value !== '') {
        nonEmptyCount++;
        
        // Check if value is numeric
        if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
          numericCount++;
        }
        
        // Check if value is a date
        if (typeof value === 'string' && !isNaN(Date.parse(value))) {
          dateCount++;
        }
      }
    });

    // Determine the column type based on the counts
    if (nonEmptyCount === 0) {
      // Empty column, treat as categorical
      categoricalColumns.push(column);
    } else if (numericCount / nonEmptyCount > 0.7) {
      numericColumns.push(column);
    } else if (dateCount / nonEmptyCount > 0.7) {
      dateColumns.push(column);
    } else {
      categoricalColumns.push(column);
    }
  });

  return { numericColumns, categoricalColumns, dateColumns };
};

// Generate summaries for each column
const generateColumnSummaries = (
  data: DataRow[],
  columnNames: string[],
  columnTypes: { numericColumns: string[]; categoricalColumns: string[]; dateColumns: string[] }
): ColumnSummary[] => {
  return columnNames.map(column => {
    let type: 'numeric' | 'categorical' | 'date' | 'unknown' = 'unknown';
    if (columnTypes.numericColumns.includes(column)) {
      type = 'numeric';
    } else if (columnTypes.categoricalColumns.includes(column)) {
      type = 'categorical';
    } else if (columnTypes.dateColumns.includes(column)) {
      type = 'date';
    }

    // Count missing values
    const missingValues = data.filter(row => 
      row[column] === null || row[column] === undefined || row[column] === ''
    ).length;

    // Get unique values
    const uniqueValuesSet = new Set<string | number>();
    const frequencies: Record<string, number> = {};
    const numericValues: number[] = [];

    data.forEach(row => {
      const value = row[column];
      if (value !== null && value !== undefined && value !== '') {
        const strValue = String(value);
        uniqueValuesSet.add(strValue);
        
        frequencies[strValue] = (frequencies[strValue] || 0) + 1;
        
        if (type === 'numeric') {
          numericValues.push(Number(value));
        }
      }
    });

    // Find most frequent value
    let mostFrequent: string | number | undefined;
    let maxFrequency = 0;
    
    Object.entries(frequencies).forEach(([value, frequency]) => {
      if (frequency > maxFrequency) {
        maxFrequency = frequency;
        mostFrequent = type === 'numeric' ? Number(value) : value;
      }
    });

    // Calculate numeric statistics if applicable
    let min: number | undefined;
    let max: number | undefined;
    let mean: number | undefined;
    let median: number | undefined;
    
    if (type === 'numeric' && numericValues.length > 0) {
      min = Math.min(...numericValues);
      max = Math.max(...numericValues);
      mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
      
      // Calculate median
      const sorted = [...numericValues].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      
      if (sorted.length % 2 === 0) {
        median = (sorted[middle - 1] + sorted[middle]) / 2;
      } else {
        median = sorted[middle];
      }
    }

    return {
      name: column,
      type,
      uniqueValues: uniqueValuesSet.size,
      missingValues,
      min,
      max,
      mean,
      median,
      mostFrequent,
      frequencies,
    };
  });
};

// Calculate correlations between numeric columns
const findCorrelations = (data: DataRow[], numericColumns: string[]): CorrelationResult[] => {
  const correlations: CorrelationResult[] = [];

  // For each pair of numeric columns
  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const column1 = numericColumns[i];
      const column2 = numericColumns[j];
      
      // Extract paired values (ignoring missing values)
      const pairedValues: [number, number][] = [];
      
      data.forEach(row => {
        const val1 = Number(row[column1]);
        const val2 = Number(row[column2]);
        
        if (!isNaN(val1) && !isNaN(val2)) {
          pairedValues.push([val1, val2]);
        }
      });
      
      if (pairedValues.length > 5) { // Need at least a few points to calculate correlation
        const correlation = calculatePearsonCorrelation(pairedValues);
        
        let strength: 'strong' | 'moderate' | 'weak' | 'none';
        const absCorrelation = Math.abs(correlation);
        
        if (absCorrelation > 0.7) {
          strength = 'strong';
        } else if (absCorrelation > 0.4) {
          strength = 'moderate';
        } else if (absCorrelation > 0.2) {
          strength = 'weak';
        } else {
          strength = 'none';
        }
        
        correlations.push({
          column1,
          column2,
          correlation,
          strength,
        });
      }
    }
  }

  return correlations;
};

// Calculate Pearson correlation coefficient
const calculatePearsonCorrelation = (pairedValues: [number, number][]): number => {
  // Ensure we have data
  if (pairedValues.length < 2) return 0;
  
  // Extract x and y values
  const xValues = pairedValues.map(pair => pair[0]);
  const yValues = pairedValues.map(pair => pair[1]);
  
  // Calculate means
  const xMean = xValues.reduce((sum, val) => sum + val, 0) / xValues.length;
  const yMean = yValues.reduce((sum, val) => sum + val, 0) / yValues.length;
  
  // Calculate variances and covariance
  let ssXY = 0; // Covariance
  let ssXX = 0; // Variance of X
  let ssYY = 0; // Variance of Y
  
  pairedValues.forEach(([x, y]) => {
    const xDiff = x - xMean;
    const yDiff = y - yMean;
    
    ssXY += xDiff * yDiff;
    ssXX += xDiff * xDiff;
    ssYY += yDiff * yDiff;
  });
  
  // Handle division by zero
  if (ssXX === 0 || ssYY === 0) return 0;
  
  // Calculate correlation
  return ssXY / Math.sqrt(ssXX * ssYY);
};

// Generate visualization recommendations based on analysis
const generateVisualizationRecommendations = (
  columnTypes: { numericColumns: string[]; categoricalColumns: string[]; dateColumns: string[] },
  correlations: CorrelationResult[],
  columnSummaries: ColumnSummary[]
): VisualizationRecommendation[] => {
  const recommendations: VisualizationRecommendation[] = [];
  const { numericColumns, categoricalColumns, dateColumns } = columnTypes;

  // For categorical vs numeric columns (Bar or Pie charts)
  categoricalColumns.forEach(catColumn => {
    // Get number of unique values for this categorical column
    const catSummary = columnSummaries.find(summary => summary.name === catColumn);
    if (!catSummary || catSummary.uniqueValues > 20) return; // Skip if too many categories
    
    numericColumns.forEach(numColumn => {
      // Bar chart recommendation
      recommendations.push({
        type: 'bar',
        title: `${numColumn} by ${catColumn}`,
        xAxis: catColumn,
        yAxis: numColumn,
        description: `Compare ${numColumn} across different ${catColumn} categories`
      });
      
      // Pie chart for smaller category sets
      if (catSummary.uniqueValues <= 8) {
        recommendations.push({
          type: 'pie',
          title: `Distribution of ${numColumn} by ${catColumn}`,
          categoryField: catColumn,
          valueField: numColumn,
          description: `Show proportion of ${numColumn} across ${catColumn} categories`
        });
      }
    });
  });

  // For numeric vs numeric columns (Scatter plots)
  correlations.forEach(corr => {
    if (corr.strength !== 'none') {
      recommendations.push({
        type: 'scatter',
        title: `Correlation between ${corr.column1} and ${corr.column2}`,
        xAxis: corr.column1,
        yAxis: corr.column2,
        strength: corr.correlation,
        description: `${corr.strength} correlation (${corr.correlation.toFixed(2)}) between ${corr.column1} and ${corr.column2}`
      });
      
      // Line chart if there might be a trend
      if (corr.strength === 'strong' || corr.strength === 'moderate') {
        recommendations.push({
          type: 'line',
          title: `Trend of ${corr.column2} vs ${corr.column1}`,
          xAxis: corr.column1,
          yAxis: corr.column2,
          description: `Trend line showing relationship between ${corr.column1} and ${corr.column2}`
        });
      }
    }
  });

  // For time/date columns
  dateColumns.forEach(dateColumn => {
    numericColumns.forEach(numColumn => {
      recommendations.push({
        type: 'line',
        title: `${numColumn} over ${dateColumn}`,
        xAxis: dateColumn,
        yAxis: numColumn,
        description: `Track changes in ${numColumn} over time`
      });

      recommendations.push({
        type: 'area',
        title: `${numColumn} area chart over ${dateColumn}`,
        xAxis: dateColumn,
        yAxis: numColumn,
        description: `Visualize area under ${numColumn} curve over time`
      });
    });
  });

  // For all numeric columns - histograms
  numericColumns.forEach(numColumn => {
    recommendations.push({
      type: 'histogram',
      title: `Distribution of ${numColumn}`,
      xAxis: numColumn,
      description: `Histogram showing the distribution of values for ${numColumn}`
    });
  });

  // Heatmap recommendations for correlations
  if (numericColumns.length > 3) {
    recommendations.push({
      type: 'heatmap',
      title: 'Correlation Heatmap',
      xAxis: numericColumns[0],
      yAxis: numericColumns[1],
      valueField: numericColumns[2],
      description: 'Heatmap showing correlations between numeric variables'
    });
  }

  // For categorical columns - radar chart
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    const catColumn = categoricalColumns[0];
    const numColumn = numericColumns[0];
    
    recommendations.push({
      type: 'radar',
      title: `${numColumn} by ${catColumn} (Radar)`,
      categoryField: catColumn,
      valueField: numColumn,
      description: `Radar chart showing ${numColumn} across different ${catColumn} categories`
    });
  }

  return recommendations;
};
