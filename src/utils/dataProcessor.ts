
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { DataRow } from '../context/DataContext';
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

export const prepareDataForPDF = (
  data: DataRow[],
  visualizations: any[],
  summary: DataSummary
) => {
  // Enhanced PDF data preparation
  return {
    data,
    visualizations,
    summary,
    timestamp: new Date().toISOString(),
  };
};
