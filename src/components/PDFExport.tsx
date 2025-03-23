
import React from 'react';
import { useData } from '../context/DataContext';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from '@/components/ui/use-toast';

const PDFExport: React.FC<{ containerRef: React.RefObject<HTMLDivElement> }> = ({ containerRef }) => {
  const { data, visualizations, fileName, dataSummary } = useData();
  
  const exportToPDF = async () => {
    if (!containerRef.current || !visualizations.length) {
      toast({
        title: "Nothing to export",
        description: "Create at least one visualization before exporting",
        variant: "destructive",
      });
      return;
    }
    
    try {
      toast({
        title: "Preparing PDF",
        description: "Creating a symmetric document layout...",
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margins = 15;
      
      // Create a symmetric, visually pleasing document
      
      // Cover Page
      pdf.setFillColor(240, 240, 255);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      
      // Title with styling
      pdf.setFontSize(28);
      pdf.setTextColor(50, 50, 120);
      const title = `${fileName} Report`;
      const titleWidth = pdf.getStringUnitWidth(title) * 28 / pdf.internal.scaleFactor;
      const titleX = (pdfWidth - titleWidth) / 2;
      pdf.text(title, titleX, 70);
      
      // Subtitle
      pdf.setFontSize(14);
      pdf.setTextColor(90, 90, 120);
      const subtitle = "Data Visualization Analysis";
      const subtitleWidth = pdf.getStringUnitWidth(subtitle) * 14 / pdf.internal.scaleFactor;
      const subtitleX = (pdfWidth - subtitleWidth) / 2;
      pdf.text(subtitle, subtitleX, 80);
      
      // Date
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 120);
      const date = `Generated on: ${new Date().toLocaleDateString()}`;
      const dateWidth = pdf.getStringUnitWidth(date) * 12 / pdf.internal.scaleFactor;
      const dateX = (pdfWidth - dateWidth) / 2;
      pdf.text(date, dateX, 90);
      
      // Add horizontal separator
      pdf.setDrawColor(150, 150, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margins + 20, 100, pdfWidth - margins - 20, 100);
      
      // Summary counts
      pdf.setFontSize(12);
      pdf.setTextColor(70, 70, 100);
      const summaryText = [
        `Total Records: ${data.length}`,
        `Number of Columns: ${dataSummary?.columnCount || 0}`,
        `Visualizations: ${visualizations.length}`
      ];
      
      const summaryY = 115;
      summaryText.forEach((text, i) => {
        const textWidth = pdf.getStringUnitWidth(text) * 12 / pdf.internal.scaleFactor;
        const textX = (pdfWidth - textWidth) / 2;
        pdf.text(text, textX, summaryY + (i * 8));
      });
      
      // Table of Contents
      pdf.addPage();
      
      pdf.setFontSize(18);
      pdf.setTextColor(50, 50, 120);
      pdf.text("Table of Contents", margins, margins + 10);
      
      pdf.setDrawColor(200, 200, 230);
      pdf.setLineWidth(0.5);
      pdf.line(margins, margins + 15, pdfWidth - margins, margins + 15);
      
      pdf.setFontSize(12);
      pdf.setTextColor(70, 70, 100);
      
      let tocY = margins + 25;
      
      // Add TOC entries
      pdf.text("1. Data Summary", margins, tocY);
      tocY += 8;
      pdf.text("2. Column Analysis", margins, tocY);
      tocY += 8;
      pdf.text("3. Visualizations", margins, tocY);
      tocY += 8;
      
      // List each visualization in TOC
      visualizations.forEach((viz, i) => {
        pdf.text(`   3.${i+1}. ${viz.title}`, margins, tocY);
        tocY += 8;
        
        // Add new page if TOC gets too long
        if (tocY > pdfHeight - margins) {
          pdf.addPage();
          tocY = margins + 10;
        }
      });
      
      pdf.text("4. Data Sample", margins, tocY);
      
      // Data Summary Page
      pdf.addPage();
      
      // Page header
      pdf.setFillColor(240, 240, 255);
      pdf.rect(0, 0, pdfWidth, 20, 'F');
      
      pdf.setFontSize(16);
      pdf.setTextColor(50, 50, 120);
      pdf.text("1. Data Summary", margins, 15);
      
      let summaryPageY = 30;
      
      // Summary content
      pdf.setFontSize(14);
      pdf.setTextColor(70, 70, 100);
      pdf.text("Overview", margins, summaryPageY);
      summaryPageY += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 80);
      pdf.text(`File Name: ${fileName}`, margins, summaryPageY);
      summaryPageY += 7;
      pdf.text(`Total Records: ${data.length}`, margins, summaryPageY);
      summaryPageY += 7;
      pdf.text(`Number of Columns: ${dataSummary?.columnCount || 0}`, margins, summaryPageY);
      summaryPageY += 7;
      
      if (dataSummary?.dataQualityScore) {
        pdf.text(`Data Quality Score: ${dataSummary.dataQualityScore.toFixed(1)}/10`, margins, summaryPageY);
        summaryPageY += 7;
      }
      
      // Column Analysis Page
      pdf.addPage();
      
      // Page header
      pdf.setFillColor(240, 240, 255);
      pdf.rect(0, 0, pdfWidth, 20, 'F');
      
      pdf.setFontSize(16);
      pdf.setTextColor(50, 50, 120);
      pdf.text("2. Column Analysis", margins, 15);
      
      let colY = 30;
      
      // Create a table for column info
      if (dataSummary?.columns && dataSummary.columns.length > 0) {
        pdf.setFontSize(11);
        pdf.setTextColor(60, 60, 80);
        
        // Table header
        pdf.setFillColor(230, 230, 250);
        pdf.rect(margins, colY, pdfWidth - margins * 2, 10, 'F');
        
        const colWidths = [50, 30, 35, 35];
        const headerLabels = ["Column Name", "Type", "Unique Values", "Missing Values"];
        
        pdf.setTextColor(50, 50, 120);
        headerLabels.forEach((label, i) => {
          let xOffset = margins;
          for (let j = 0; j < i; j++) {
            xOffset += colWidths[j];
          }
          pdf.text(label, xOffset + 3, colY + 7);
        });
        
        colY += 15;
        
        // Table rows
        pdf.setTextColor(60, 60, 80);
        dataSummary.columns.slice(0, 20).forEach((col, i) => {
          // Zebra striping
          if (i % 2 === 0) {
            pdf.setFillColor(248, 248, 255);
            pdf.rect(margins, colY - 5, pdfWidth - margins * 2, 10, 'F');
          }
          
          let xOffset = margins;
          
          // Column name
          pdf.text(
            col.name.substring(0, 20) + (col.name.length > 20 ? '...' : ''), 
            xOffset + 3, 
            colY
          );
          xOffset += colWidths[0];
          
          // Type
          pdf.text(col.type, xOffset + 3, colY);
          xOffset += colWidths[1];
          
          // Unique values
          pdf.text(col.uniqueValues.toString(), xOffset + 3, colY);
          xOffset += colWidths[2];
          
          // Missing values
          pdf.text(col.missingValues.toString(), xOffset + 3, colY);
          
          colY += 10;
          
          // Add new page if table gets too long
          if (colY > pdfHeight - margins && i < dataSummary.columns.length - 1) {
            pdf.addPage();
            
            // Page header
            pdf.setFillColor(240, 240, 255);
            pdf.rect(0, 0, pdfWidth, 20, 'F');
            
            pdf.setFontSize(16);
            pdf.setTextColor(50, 50, 120);
            pdf.text("2. Column Analysis (continued)", margins, 15);
            
            colY = 30;
            
            // Repeat table header
            pdf.setFillColor(230, 230, 250);
            pdf.rect(margins, colY, pdfWidth - margins * 2, 10, 'F');
            
            pdf.setTextColor(50, 50, 120);
            pdf.setFontSize(11);
            headerLabels.forEach((label, i) => {
              let xOffset = margins;
              for (let j = 0; j < i; j++) {
                xOffset += colWidths[j];
              }
              pdf.text(label, xOffset + 3, colY + 7);
            });
            
            colY += 15;
            pdf.setTextColor(60, 60, 80);
          }
        });
      }
      
      // Visualizations - Text-based descriptions (no screenshots)
      pdf.addPage();
      
      // Page header
      pdf.setFillColor(240, 240, 255);
      pdf.rect(0, 0, pdfWidth, 20, 'F');
      
      pdf.setFontSize(16);
      pdf.setTextColor(50, 50, 120);
      pdf.text("3. Visualizations", margins, 15);
      
      let vizY = 30;
      
      // For each visualization, create a descriptive page
      visualizations.forEach((viz, vizIndex) => {
        if (vizIndex > 0) {
          pdf.addPage();
          
          // Page header
          pdf.setFillColor(240, 240, 255);
          pdf.rect(0, 0, pdfWidth, 20, 'F');
          
          const sectionTitle = `3.${vizIndex+1}. Visualization`;
          pdf.setFontSize(16);
          pdf.setTextColor(50, 50, 120);
          pdf.text(sectionTitle, margins, 15);
          
          vizY = 30;
        }
        
        // Visualization title
        pdf.setFontSize(14);
        pdf.setTextColor(70, 70, 100);
        pdf.text(viz.title, margins, vizY);
        vizY += 10;
        
        // Visualization info box
        pdf.setFillColor(245, 245, 255);
        pdf.rect(margins, vizY, pdfWidth - margins * 2, 50, 'F');
        
        // Chart type
        pdf.setFontSize(11);
        pdf.setTextColor(60, 60, 80);
        pdf.text(`Chart Type: ${viz.type.charAt(0).toUpperCase() + viz.type.slice(1)}`, margins + 5, vizY + 10);
        
        // Description
        if (viz.description) {
          pdf.text(`Description: ${viz.description}`, margins + 5, vizY + 20);
        }
        
        // Data fields
        const fields = [];
        if (viz.xAxis) fields.push(`X-Axis: ${viz.xAxis}`);
        if (viz.yAxis) fields.push(`Y-Axis: ${viz.yAxis}`);
        if (viz.categoryField) fields.push(`Category: ${viz.categoryField}`);
        if (viz.valueField) fields.push(`Value: ${viz.valueField}`);
        
        fields.forEach((field, i) => {
          pdf.text(field, margins + 5, vizY + 30 + (i * 7));
        });
        
        // Draw insight box
        vizY += 60;
        pdf.setFillColor(240, 248, 255);
        pdf.rect(margins, vizY, pdfWidth - margins * 2, 30, 'F');
        
        pdf.setFontSize(12);
        pdf.setTextColor(50, 100, 150);
        pdf.text("Potential Insights:", margins + 5, vizY + 10);
        
        // Generate simple insight based on chart type
        let insight = "This visualization shows the relationship between data variables.";
        switch (viz.type) {
          case "bar":
            insight = `Compares ${viz.categoryField || "categories"} by their ${viz.valueField || "values"}.`;
            break;
          case "line":
            insight = `Shows trends in ${viz.yAxis || "values"} over ${viz.xAxis || "time"}.`;
            break;
          case "pie":
            insight = `Shows the proportion of each ${viz.categoryField || "category"} to the whole.`;
            break;
          case "scatter":
            insight = `Reveals correlation between ${viz.xAxis || "x-values"} and ${viz.yAxis || "y-values"}.`;
            break;
          default:
            break;
        }
        
        pdf.setFontSize(11);
        pdf.setTextColor(60, 80, 120);
        pdf.text(insight, margins + 5, vizY + 20);
      });
      
      // Data Sample
      pdf.addPage();
      
      // Page header
      pdf.setFillColor(240, 240, 255);
      pdf.rect(0, 0, pdfWidth, 20, 'F');
      
      pdf.setFontSize(16);
      pdf.setTextColor(50, 50, 120);
      pdf.text("4. Data Sample", margins, 15);
      
      let dataY = 30;
      
      // Add data sample (first 10 rows max)
      if (data.length > 0) {
        const columns = Object.keys(data[0]);
        const maxCols = Math.min(columns.length, 5); // Limit to 5 columns to fit on page
        const selectedColumns = columns.slice(0, maxCols);
        
        // Calculate column widths
        const colWidth = Math.min(30, (pdfWidth - margins * 2) / maxCols);
        
        // Table header
        pdf.setFillColor(230, 230, 250);
        pdf.rect(margins, dataY, colWidth * maxCols, 10, 'F');
        
        pdf.setFontSize(11);
        pdf.setTextColor(50, 50, 120);
        
        selectedColumns.forEach((col, colIndex) => {
          pdf.text(
            col.toString().substring(0, 12) + (col.length > 12 ? '...' : ''),
            margins + (colIndex * colWidth) + 2,
            dataY + 7
          );
        });
        
        dataY += 15;
        
        // Table rows (limit to 10)
        const maxRows = Math.min(data.length, 10);
        
        for (let i = 0; i < maxRows; i++) {
          // Alternate row colors
          if (i % 2 === 0) {
            pdf.setFillColor(248, 248, 255);
            pdf.rect(margins, dataY - 5, colWidth * maxCols, 10, 'F');
          }
          
          selectedColumns.forEach((col, colIndex) => {
            const value = data[i][col]?.toString() || '';
            pdf.text(
              value.substring(0, 14) + (value.length > 14 ? '...' : ''),
              margins + (colIndex * colWidth) + 2,
              dataY
            );
          });
          
          dataY += 10;
        }
        
        // If there are more rows, indicate this with a message
        if (data.length > maxRows) {
          dataY += 5;
          pdf.setTextColor(100, 100, 100);
          pdf.setFont(undefined, 'italic');
          pdf.text(`(${data.length - maxRows} more rows not shown)`, margins, dataY);
        }
      }
      
      // Save the PDF
      pdf.save(`${fileName}-report.pdf`);
      
      toast({
        title: "PDF exported successfully",
        description: `${fileName}-report.pdf has been downloaded`,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={exportToPDF}
      disabled={!visualizations.length}
      className="flex items-center space-x-2"
      size="lg"
    >
      <Download className="h-4 w-4 mr-2" />
      Export as PDF
    </Button>
  );
};

export default PDFExport;
