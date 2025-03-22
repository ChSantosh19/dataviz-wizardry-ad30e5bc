
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, FileSpreadsheet, BarChart, PieChart, LineChart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { processFile } from '../utils/dataProcessor';
import { useData, VisualizationType } from '../context/DataContext';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { calculateMathStats } from '../utils/dataProcessor';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

const FileUpload: React.FC = () => {
  const { 
    setData, 
    setIsLoading, 
    setFileName, 
    setDataSummary, 
    setChartTypeSelection, 
    allVizTypes, 
    setMathStats,

    generateAllVisualizations 
  } = useData();
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [processingFile, setProcessingFile] = useState(false);
  const [showChartDialog, setShowChartDialog] = useState(false);
  const [processedData, setProcessedData] = useState<any>(null);
  
  const form = useForm({
    defaultValues: {
      chartTypes: [] as VisualizationType[],
    },
  });

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
      
      // Calculate mathematical statistics
      const mathStats = calculateMathStats(processedData);
      setMathStats(mathStats);
      
      // Store processed data temporarily instead of setting it right away
      setProcessedData({ data: processedData, summary });
      
      // Show chart type selection dialog
      setShowChartDialog(true);
    } catch (error) {
      toast({
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      setIsLoading(false);
      setProcessingFile(false);
    }
  };
  
  const finalizeDataProcessing = (selectedChartTypes: VisualizationType[]) => {
    if (!processedData) return;
    
    setData(processedData.data);
    setDataSummary(processedData.summary);
    setChartTypeSelection(selectedChartTypes);
    
    // Close dialog and reset processing state
    setShowChartDialog(false);
    setProcessingFile(false);
    setIsLoading(false);
    
    toast({
      title: "File processed successfully",
      description: `Loaded ${processedData.data.length} rows of data with ${processedData.summary.columnCount} columns`,
    });
    
    // Automatically generate visualizations after a short delay
    setTimeout(() => {
      generateAllVisualizations();
    }, 500);
  };

  const getChartTypeIcon = (type: VisualizationType) => {
    switch (type) {
      case 'bar': return <BarChart className="h-5 w-5" />;
      case 'line': return <LineChart className="h-5 w-5" />;
      case 'pie': return <PieChart className="h-5 w-5" />;
      default: return <BarChart className="h-5 w-5" />;
    }
  };

  const removeFile = () => {
    setCurrentFile(null);
  };

  return (
    <>
      <Card className="border border-border/50 shadow-sm mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">Upload Your Data File</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6 animate-fade-in">
            <div 
              {...getRootProps()} 
              className={`upload-area flex flex-col items-center justify-center cursor-pointer rounded-xl border-2 border-dashed p-12 transition-all ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border'
              } ${currentFile ? 'border-primary/50 bg-primary/5' : ''} hover:border-primary/70 hover:bg-primary/5`}
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
                      Remove and choose another file
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Upload className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-3">
                    {isDragActive ? "Drop your file here" : "Drag & drop your data file"}
                  </h3>
                  <p className="text-base text-muted-foreground mb-4 max-w-md text-center">
                    Upload your Excel (.xlsx, .xls) or CSV file to analyze and visualize your data instantly.
                    We'll automatically generate beautiful visualizations based on your preferences.
                  </p>
                  <Button variant="outline" size="lg" className="mt-2">
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
      
      {/* Chart Type Selection Dialog */}
      <Dialog open={showChartDialog} onOpenChange={setShowChartDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl mb-4">Choose Visualization Types</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <div className="space-y-5 py-2">
              <p className="text-sm text-muted-foreground mb-4">
                Select which types of charts you'd like to generate from your data:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {allVizTypes.map((type) => (
                  <div key={type} className="flex items-start space-x-2">
                    <Checkbox 
                      id={`chart-type-${type}`}
                      onCheckedChange={(checked) => {
                        const currentTypes = form.getValues().chartTypes;
                        if (checked) {
                          if (!currentTypes.includes(type)) {
                            form.setValue('chartTypes', [...currentTypes, type]);
                          }
                        } else {
                          form.setValue('chartTypes', currentTypes.filter(t => t !== type));
                        }
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label 
                        htmlFor={`chart-type-${type}`}
                        className="flex items-center gap-2 font-medium cursor-pointer"
                      >
                        {getChartTypeIcon(type)}
                        {type.charAt(0).toUpperCase() + type.slice(1)} Charts
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Form>
          
          <DialogFooter className="mt-4">
            <Button 
              type="submit" 
              onClick={() => finalizeDataProcessing(form.getValues().chartTypes)}
              className="w-full"
            >
              Generate Visualizations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileUpload;
