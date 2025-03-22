
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { DataRow, MathStats } from '../context/DataContext';
import { analyzeData, DataSummary } from './dataAnalyzer';

export const processExcelFile = async (file: File): Promise<{ data: DataRow[], summary: DataSummary }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Get headers with proper casing
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
        const headers: string[] = [];
        
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
          headers[C] = cell?.v ? String(cell.v) : `Column${C + 1}`;
        }
        
        // Convert to JSON with proper header names
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: headers });
        
        // Analyze the data
        const processedData = jsonData as DataRow[];
        const summary = analyzeData(processedData);
        
        resolve({ data: processedData, summary });
      } catch (error) {
        reject(new Error('Failed to parse Excel file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsBinaryString(file);
  });
};

export const processCsvFile = async (file: File): Promise<{ data: DataRow[], summary: DataSummary }> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true, // Automatically convert to proper types
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processedData = results.data as DataRow[];
          const summary = analyzeData(processedData);
          resolve({ data: processedData, summary });
        } catch (error) {
          reject(new Error('Failed to process CSV data'));
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
};

export const processFile = async (file: File): Promise<{ data: DataRow[], summary: DataSummary }> => {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  if (fileType === 'csv') {
    return processCsvFile(file);
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    return processExcelFile(file);
  } else {
    throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
  }
};

export const validateDataForVisualization = (
  data: DataRow[],
  config: { xAxis?: string; yAxis?: string; valueField?: string; categoryField?: string }
): boolean => {
  if (data.length === 0) return false;
  
  const { xAxis, yAxis, valueField, categoryField } = config;
  
  if (xAxis && !data[0].hasOwnProperty(xAxis)) return false;
  if (yAxis && !data[0].hasOwnProperty(yAxis)) return false;
  if (valueField && !data[0].hasOwnProperty(valueField)) return false;
  if (categoryField && !data[0].hasOwnProperty(categoryField)) return false;
  
  return true;
};

export const generateSampleData = (): DataRow[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const categories = ['Product A', 'Product B', 'Product C'];
  
  const data: DataRow[] = [];
  
  months.forEach(month => {
    categories.forEach(category => {
      data.push({
        Month: month,
        Category: category,
        Sales: Math.floor(Math.random() * 1000) + 100,
        Profit: Math.floor(Math.random() * 500) + 50,
        Units: Math.floor(Math.random() * 100) + 10,
      });
    });
  });
  
  return data;
};

// Calculate mathematical statistics from the data
export const calculateMathStats = (data: DataRow[]): MathStats => {
  if (!data || data.length === 0) {
    return { 
      numericColumns: [],
      correlations: []
    };
  }
  
  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  
  // Identify numeric columns
  const numericColumns = columns.filter(col => {
    // Check if at least 80% of the values are numbers
    const numericCount = data.filter(row => {
      const val = row[col];
      return typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)));
    }).length;
    
    return numericCount / data.length > 0.8;
  });
  
  // Calculate stats for each numeric column
  const columnStats = numericColumns.map(col => {
    // Convert all values to numbers
    const values = data
      .map(row => {
        const val = row[col];
        return typeof val === 'number' ? val : typeof val === 'string' ? Number(val) : NaN;
      })
      .filter(val => !isNaN(val)); // Filter out NaN values
    
    // Calculate basic statistics
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / values.length;
    
    // Sort values for median calculation
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = values.length % 2 === 0
      ? (sortedValues[values.length / 2 - 1] + sortedValues[values.length / 2]) / 2
      : sortedValues[Math.floor(values.length / 2)];
    
    // Calculate standard deviation
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
    const standardDeviation = Math.sqrt(avgSquaredDiff);
    
    return {
      name: col,
      min,
      max,
      mean,
      median,
      standardDeviation
    };
  });
  
  // Calculate correlations between numeric columns
  const correlations = [];
  
  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const col1 = numericColumns[i];
      const col2 = numericColumns[j];
      
      // Get paired values (exclude rows where either value is missing or NaN)
      const paired = data
        .map(row => ({
          x: typeof row[col1] === 'number' ? row[col1] : Number(row[col1]),
          y: typeof row[col2] === 'number' ? row[col2] : Number(row[col2])
        }))
        .filter(pair => !isNaN(pair.x) && !isNaN(pair.y));
      
      if (paired.length > 5) { // Only calculate correlation if we have enough data points
        // Calculate means
        const meanX = paired.reduce((sum, pair) => sum + pair.x, 0) / paired.length;
        const meanY = paired.reduce((sum, pair) => sum + pair.y, 0) / paired.length;
        
        // Calculate correlation coefficient
        let numerator = 0;
        let denomX = 0;
        let denomY = 0;
        
        for (const pair of paired) {
          const diffX = pair.x - meanX;
          const diffY = pair.y - meanY;
          numerator += diffX * diffY;
          denomX += diffX * diffX;
          denomY += diffY * diffY;
        }
        
        const correlation = numerator / (Math.sqrt(denomX) * Math.sqrt(denomY));
        
        // Only add significant correlations
        if (!isNaN(correlation) && Math.abs(correlation) > 0.3) {
          correlations.push({
            column1: col1,
            column2: col2,
            value: correlation
          });
        }
      }
    }
  }
  
  return {
    numericColumns: columnStats,
    correlations
  };
};

export const prepareDataForPDF = (
  data: DataRow[],
  visualizations: any[],
  summary: DataSummary,
  mathStats: MathStats | null
) => {
  // Enhanced PDF data preparation
  return {
    data,
    visualizations,
    summary,
    mathStats,
    timestamp: new Date().toISOString(),
  };
};
