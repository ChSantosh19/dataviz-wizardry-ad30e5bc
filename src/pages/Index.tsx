
import React, { useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/Navbar';
import FileUpload from '@/components/FileUpload';
import ManualInput from '@/components/ManualInput';
import Visualizations from '@/components/Visualizations';
import DataSummary from '@/components/DataSummary';
import PDFExport from '@/components/PDFExport';
import { DataProvider, useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileUpIcon, PencilRuler, BarChart, RefreshCw, ListFilter } from 'lucide-react';

const DataControls = () => {
  const { data, clearData } = useData();
  const [activeTab, setActiveTab] = useState<string>("summary");
  const visualizationRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="container mx-auto px-4 max-w-6xl">
      {data.length > 0 ? (
        <div className="animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 mt-2 space-y-4 md:space-y-0">
            <h2 className="text-2xl font-semibold">
              Your Data
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({data.length} rows of data)
              </span>
            </h2>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={clearData}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset Data</span>
              </Button>
              <PDFExport containerRef={visualizationRef} />
            </div>
          </div>
          
          <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="summary" className="flex items-center space-x-2 py-3">
                <ListFilter className="h-4 w-4" />
                <span>Data Summary</span>
              </TabsTrigger>
              <TabsTrigger value="visualizations" className="flex items-center space-x-2 py-3">
                <BarChart className="h-4 w-4" />
                <span>Visualizations</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <DataSummary />
              <div className="flex justify-end mt-6">
                <Button onClick={() => setActiveTab("visualizations")} className="flex items-center">
                  Go to Visualizations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="visualizations">
              <div ref={visualizationRef}>
                <Visualizations />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="mt-2">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="upload" className="flex items-center space-x-2 py-3">
                <FileUpIcon className="h-4 w-4" />
                <span>Upload File</span>
              </TabsTrigger>
              <TabsTrigger value="input" className="flex items-center space-x-2 py-3">
                <PencilRuler className="h-4 w-4" />
                <span>Manual Input</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-0">
              <FileUpload />
            </TabsContent>
            <TabsContent value="input" className="mt-0">
              <ManualInput />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

const Hero = () => {
  return (
    <div className="relative overflow-hidden py-24">
      {/* Enhanced animated background elements */}
      <div className="absolute top-0 left-0 right-0 h-[600px] opacity-90 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 animate-float" style={{ animationDelay: "0s" }}></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-blue-400/10 animate-float-delayed" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-56 h-56 rounded-full bg-purple-400/10 animate-float-delayed-more" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full bg-green-400/10 animate-float" style={{ animationDelay: "3s" }}></div>
      </div>
      
      <div className="container relative z-20 mx-auto px-4 max-w-5xl text-center space-y-8">
        <div className="animate-slide-down">
          <div className="inline-block mb-3 px-3 py-1 bg-primary/10 rounded-full backdrop-blur-sm">
            <span className="text-xs font-medium text-primary">Interactive Data Visualization</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Transform Your Data into 
            <span className="text-primary"> Visual Insights</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your data or input it manually, then create beautiful interactive visualizations in seconds.
          </p>
        </div>
        
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in">
          <Button
            size="lg"
            className="group px-6 py-7 text-lg rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
            onClick={() => document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
        
        <div className="flex justify-center mt-12 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-card/30 backdrop-blur-sm p-6 rounded-xl border border-border/20 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-card/40">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                <FileUpIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Excel Upload</h3>
              <p className="text-muted-foreground">
                Upload your Excel files and instantly transform raw data into visual insights.
              </p>
            </div>
            
            <div className="bg-card/30 backdrop-blur-sm p-6 rounded-xl border border-border/20 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-card/40">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                <PencilRuler className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Manual Input</h3>
              <p className="text-muted-foreground">
                Don't have a file? Manually enter your data with our intuitive spreadsheet-like interface.
              </p>
            </div>
            
            <div className="bg-card/30 backdrop-blur-sm p-6 rounded-xl border border-border/20 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-card/40">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">PDF Export</h3>
              <p className="text-muted-foreground">
                Export your visualizations as professional PDF reports for easy sharing and presentation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="pt-16">
          <Hero />
          <div id="get-started" className="py-16">
            <DataControls />
          </div>
        </div>
      </div>
    </DataProvider>
  );
};

export default Index;
