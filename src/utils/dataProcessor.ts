
import * as XLSX from 'xlsx';
import { DataRow } from '../context/DataContext';

export const processExcelFile = async (file: File): Promise<DataRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        resolve(jsonData as DataRow[]);
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
  visualizations: any[]
) => {
  // This function would prepare the data for PDF export
  // For now, we'll just return the raw data and visualizations
  return {
    data,
    visualizations,
    timestamp: new Date().toISOString(),
  };
};
