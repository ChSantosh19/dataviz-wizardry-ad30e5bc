
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { processFile } from '../utils/dataProcessor';
import { useData } from '../context/DataContext';
import { toast } from '@/components/ui/use-toast';

const FileUpload: React.FC = () => {
  const { setData, setIsLoading, setFileName, setDataSummary } = useData();
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [processingFile, setProcessingFile] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel or CSV file",
        variant: "destructive",
      });
      return;
    }

    setCurrentFile(file);
    setFileName(file.name.split('.')[0]);
  }, [setFileName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const processDataFile = async () => {
    if (!currentFile) return;
    
    setIsLoading(true);
    setProcessingFile(true);
    try {
      const { data: processedData, summary } = await processFile(currentFile);
      setData(processedData);
      setDataSummary(summary);
      toast({
        title: "File processed successfully",
        description: `Loaded ${processedData.length} rows of data with ${summary.columnCount} columns`,
      });
    } catch (error) {
      toast({
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProcessingFile(false);
    }
  };

  const removeFile = () => {
    setCurrentFile(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div 
        {...getRootProps()} 
        className={`upload-area flex flex-col items-center justify-center cursor-pointer rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border'
        } ${currentFile ? 'border-primary/50 bg-primary/5' : ''}`}
      >
        <input {...getInputProps()} />
        
        {currentFile ? (
          <div className="flex flex-col items-center space-y-2">
            <File className="h-12 w-12 text-primary/80" />
            <div className="flex items-center">
              <span className="text-sm text-foreground/80 max-w-[200px] truncate">
                {currentFile.name}
              </span>
              <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  removeFile(); 
                }}
                className="ml-2 p-1 rounded-full hover:bg-secondary/80 transition-colors"
              >
                <X className="h-4 w-4 text-foreground/70" />
              </button>
            </div>
            <span className="text-xs text-foreground/60">
              {(currentFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 text-foreground/60 mb-2" />
            <p className="text-lg font-medium text-foreground/80 mb-1">
              {isDragActive ? "Drop the file here" : "Drag & drop your Excel or CSV file"}
            </p>
            <p className="text-sm text-foreground/60 mb-3">
              or click to browse your files
            </p>
            <p className="text-xs text-foreground/50 max-w-xs text-center">
              Supports Excel (.xlsx, .xls) and CSV files
            </p>
          </>
        )}
      </div>

      {currentFile && (
        <Button 
          onClick={processDataFile}
          className="w-full py-6 transition-all duration-300 animate-fade-in"
          disabled={processingFile}
        >
          {processingFile ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing File...
            </>
          ) : (
            <>Process File</>
          )}
        </Button>
      )}
    </div>
  );
};

export default FileUpload;
