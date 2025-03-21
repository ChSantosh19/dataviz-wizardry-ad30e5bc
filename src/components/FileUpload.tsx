
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { processFile } from '../utils/dataProcessor';
import { useData } from '../context/DataContext';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';

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
    <Card className="border-2 shadow-sm mb-4">
      <CardContent className="p-6">
        <div className="space-y-6 animate-fade-in">
          <div 
            {...getRootProps()} 
            className={`upload-area flex flex-col items-center justify-center cursor-pointer rounded-xl border-2 border-dashed p-12 transition-all ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border'
            } ${currentFile ? 'border-primary/50 bg-primary/5' : ''}`}
          >
            <input {...getInputProps()} />
            
            {currentFile ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-1">{currentFile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(currentFile.size / 1024 / 1024).toFixed(2)} MB · Ready to process
                  </p>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation();
                      removeFile(); 
                    }}
                    className="mt-2 p-1 rounded-full hover:bg-secondary/80 transition-colors text-sm text-muted-foreground flex items-center mx-auto"
                  >
                    <X className="h-3 w-3 mr-1" /> Remove file
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground/90 mb-2">
                  {isDragActive ? "Drop your file here" : "Drag & drop your data file"}
                </h3>
                <p className="text-base text-muted-foreground mb-3 max-w-md text-center">
                  Upload your Excel (.xlsx, .xls) or CSV file to analyze and visualize your data instantly
                </p>
                <Button variant="outline" className="mt-2">
                  Browse Files
                </Button>
              </>
            )}
          </div>

          {currentFile && (
            <Button 
              onClick={processDataFile}
              className="w-full py-6 text-lg transition-all animate-fade-in"
              disabled={processingFile}
              size="lg"
            >
              {processingFile ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Data...
                </>
              ) : (
                <>Analyze & Visualize Data</>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
