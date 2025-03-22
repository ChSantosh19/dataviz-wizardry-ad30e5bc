
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';

const ManualInput: React.FC = () => {
  const { setData, setFileName } = useData();
  const [columns, setColumns] = useState<string[]>(['Column 1', 'Column 2']);
  const [rows, setRows] = useState<Record<string, string>[]>([{ 'Column 1': '', 'Column 2': '' }]);
  const [tableName, setTableName] = useState<string>('My Data');

  const addColumn = () => {
    const newColumnName = `Column ${columns.length + 1}`;
    setColumns([...columns, newColumnName]);
    
    // Update all rows with the new column
    setRows(rows.map(row => ({
      ...row,
      [newColumnName]: ''
    })));
  };

  const removeColumn = (columnIndex: number) => {
    if (columns.length <= 2) {
      toast({
        title: "Cannot remove column",
        description: "You need at least 2 columns",
        variant: "destructive",
      });
      return;
    }
    
    const columnToRemove = columns[columnIndex];
    const newColumns = columns.filter((_, index) => index !== columnIndex);
    
    // Remove column from all rows
    setRows(rows.map(row => {
      const newRow = { ...row };
      delete newRow[columnToRemove];
      return newRow;
    }));
    
    setColumns(newColumns);
  };

  const addRow = () => {
    const newRow: Record<string, string> = {};
    columns.forEach(column => {
      newRow[column] = '';
    });
    setRows([...rows, newRow]);
  };

  const removeRow = (rowIndex: number) => {
    if (rows.length <= 1) {
      toast({
        title: "Cannot remove row",
        description: "You need at least 1 row",
        variant: "destructive",
      });
      return;
    }
    setRows(rows.filter((_, index) => index !== rowIndex));
  };

  const handleCellChange = (rowIndex: number, columnName: string, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][columnName] = value;
    setRows(newRows);
  };

  const handleColumnNameChange = (index: number, newName: string) => {
    if (!newName.trim()) return;
    
    const oldName = columns[index];
    const newColumns = [...columns];
    newColumns[index] = newName;
    
    // Update column name in all rows
    const newRows = rows.map(row => {
      const newRow: Record<string, string> = {};
      Object.keys(row).forEach(key => {
        if (key === oldName) {
          newRow[newName] = row[key];
        } else {
          newRow[key] = row[key];
        }
      });
      return newRow;
    });
    
    setColumns(newColumns);
    setRows(newRows);
  };

  const saveData = () => {
    // Validate data
    const hasEmptyCell = rows.some(row => 
      Object.values(row).some(value => value.trim() === '')
    );
    
    if (hasEmptyCell) {
      toast({
        title: "Empty cells detected",
        description: "Please fill all cells before saving",
        variant: "destructive",
      });
      return;
    }
    
    // Process rows to ensure numeric values are converted to numbers
    const processedRows = rows.map(row => {
      const processedRow: Record<string, string | number> = {};
      Object.entries(row).forEach(([key, value]) => {
        const numValue = Number(value);
        processedRow[key] = !isNaN(numValue) ? numValue : value;
      });
      return processedRow;
    });
    
    setData(processedRows);
    setFileName(tableName);
    
    toast({
      title: "Data saved successfully",
      description: `${rows.length} rows of data ready for visualization`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3">
        <Input 
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          className="max-w-[300px] font-medium"
          placeholder="Enter table name"
        />
      </div>
      
      <Card className="overflow-hidden shadow-sm border border-border/20">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-secondary/50">
              <tr>
                {columns.map((column, columnIndex) => (
                  <th key={columnIndex} className="p-3 border-b border-border/20">
                    <div className="flex items-center justify-between space-x-2">
                      <Input 
                        value={column}
                        onChange={(e) => handleColumnNameChange(columnIndex, e.target.value)}
                        className="h-8 text-sm font-medium"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => removeColumn(columnIndex)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </th>
                ))}
                <th className="p-2 w-12">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={addColumn}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border/10 hover:bg-secondary/30 transition-colors">
                  {columns.map((column, columnIndex) => (
                    <td key={`${rowIndex}-${columnIndex}`} className="p-2">
                      <Input 
                        value={row[column] || ''}
                        onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                        className="h-8 text-sm"
                      />
                    </td>
                  ))}
                  <td className="p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => removeRow(rowIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={addRow}
          className="px-4 py-2 transition-colors flex items-center space-x-2"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Row
        </Button>
        
        <Button 
          onClick={saveData}
          className="px-4 py-2 transition-colors flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Data
        </Button>
      </div>
    </div>
  );
};

export default ManualInput;
