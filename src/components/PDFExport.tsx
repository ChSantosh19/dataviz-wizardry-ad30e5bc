
import React from 'react';
import { useData } from '../context/DataContext';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
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
        description: "This may take a moment...",
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margins = 15;
      
      // Add title
      pdf.setFontSize(22);
      pdf.text(`${fileName} Visualization Report`, margins, margins + 5);
      
      // Add timestamp
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, margins, margins + 12);
      
      // Add separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margins, margins + 15, pdfWidth - margins, margins + 15);
      
      // Data summary
      pdf.setFontSize(14);
      pdf.text('Data Summary', margins, margins + 25);
      
      // Enhanced data summary section
      pdf.setFontSize(10);
      let summaryYOffset = margins + 32;
      
      // Basic stats
      pdf.text(`Total records: ${data.length}`, margins, summaryYOffset);
      summaryYOffset += 6;
      pdf.text(`Number of columns: ${dataSummary?.columnCount || 0}`, margins, summaryYOffset);
      summaryYOffset += 6;
      pdf.text(`Number of visualizations: ${visualizations.length}`, margins, summaryYOffset);
      summaryYOffset += 10;
      
      // Column information
      if (dataSummary?.columns && dataSummary.columns.length > 0) {
        pdf.setFontSize(12);
        pdf.text('Column Types:', margins, summaryYOffset);
        pdf.setFontSize(9);
        summaryYOffset += 6;
        
        // Create a simple table for column info
        const columnInfoTable = [];
        columnInfoTable.push(['Column Name', 'Type', 'Unique Values', 'Missing Values']);
        
        dataSummary.columns.slice(0, 15).forEach(col => {
          columnInfoTable.push([
            col.name.substring(0, 20) + (col.name.length > 20 ? '...' : ''),
            col.type,
            col.uniqueValues.toString(),
            col.missingValues.toString()
          ]);
        });
        
        const colWidths = [80, 40, 30, 30];
        const rowHeight = 7;
        
        // Header row
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margins, summaryYOffset, pdfWidth - margins * 2, rowHeight, 'F');
        
        let xOffset = margins;
        for (let i = 0; i < columnInfoTable[0].length; i++) {
          pdf.text(columnInfoTable[0][i], xOffset + 2, summaryYOffset + 5);
          xOffset += colWidths[i];
        }
        
        summaryYOffset += rowHeight;
        
        // Data rows
        for (let i = 1; i < columnInfoTable.length; i++) {
          if (i % 2 === 0) {
            pdf.setFillColor(250, 250, 250);
            pdf.rect(margins, summaryYOffset, pdfWidth - margins * 2, rowHeight, 'F');
          }
          
          xOffset = margins;
          for (let j = 0; j < columnInfoTable[i].length; j++) {
            pdf.text(columnInfoTable[i][j], xOffset + 2, summaryYOffset + 5);
            xOffset += colWidths[j];
          }
          
          summaryYOffset += rowHeight;
          
          // Check if we need a new page
          if (summaryYOffset > pdfHeight - margins * 2) {
            pdf.addPage();
            summaryYOffset = margins;
          }
        }
      }
      
      // Add a page for visualizations
      pdf.addPage();
      let yOffset = margins;
      
      // Title for visualizations
      pdf.setFontSize(16);
      pdf.text('Visualizations', margins, yOffset);
      yOffset += 10;
      
      // Capture each visualization chart with higher quality
      const chartContainers = containerRef.current.querySelectorAll('.chart-container');
      
      for (let i = 0; i < chartContainers.length; i++) {
        const chart = chartContainers[i] as HTMLElement;
        
        // Always start each chart on a new page for better visibility
        if (i > 0) {
          pdf.addPage();
          yOffset = margins;
        }
        
        // Get chart title
        const titleElement = chart.querySelector('.card-title');
        const title = titleElement ? (titleElement as HTMLElement).innerText : `Chart ${i + 1}`;
        
        // Add chart title
        pdf.setFontSize(14);
        pdf.text(title, margins, yOffset);
        yOffset += 7;
        
        // Get chart description if available
        const descriptionElement = chart.querySelector('.text-muted-foreground');
        if (descriptionElement) {
          pdf.setFontSize(10);
          pdf.text((descriptionElement as HTMLElement).innerText, margins, yOffset);
          yOffset += 10;
        }
        
        // Capture chart with improved settings for better visibility
        const canvas = await html2canvas(chart, {
          scale: 4, // Higher scale for better quality
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF', // Force white background
          onclone: (document, clone) => {
            // Find the chart in the cloned document and adjust its styling
            const cloneChart = clone.querySelector('.chart-container') as HTMLElement;
            if (cloneChart) {
              const svgElements = cloneChart.querySelectorAll('svg');
              svgElements.forEach(svg => {
                // Make SVG elements more visible
                svg.style.width = '100%';
                svg.style.height = '100%';
                
                // Enhance lines and text
                const paths = svg.querySelectorAll('path');
                paths.forEach(path => {
                  path.style.strokeWidth = '3px';
                });
                
                const texts = svg.querySelectorAll('text');
                texts.forEach(text => {
                  text.style.fontWeight = 'bold';
                  text.style.fontSize = '14px';
                });

                // Enhance dots in scatter plots
                const circles = svg.querySelectorAll('circle');
                circles.forEach(circle => {
                  circle.setAttribute('r', '6');
                });
              });
            }
          }
        });
        
        // Calculate dimensions to fit the page properly - make charts larger in the PDF
        const imgWidth = pdfWidth - (margins * 2);
        const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, 150); // Larger height for better visibility
        
        // Add the image to the PDF
        try {
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', margins, yOffset, imgWidth, imgHeight);
        } catch (e) {
          console.error("Error adding image to PDF:", e);
        }
      }
      
      // Add data sample section at the end
      pdf.addPage();
      yOffset = margins;
      
      pdf.setFontSize(16);
      pdf.text('Data Sample (First Rows)', margins, yOffset);
      yOffset += 10;
      
      // Add data sample (first 15 rows max)
      if (data.length > 0) {
        const columns = Object.keys(data[0]);
        const maxCols = Math.min(columns.length, 5); // Limit to 5 columns to fit on page
        const selectedColumns = columns.slice(0, maxCols);
        
        // Calculate column widths
        const colWidth = Math.min(30, (pdfWidth - margins * 2) / maxCols);
        
        // Table header
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margins, yOffset, colWidth * maxCols, 7, 'F');
        
        pdf.setFontSize(8);
        pdf.setTextColor(50, 50, 50);
        
        selectedColumns.forEach((col, colIndex) => {
          pdf.text(
            col.toString().substring(0, 12) + (col.length > 12 ? '...' : ''),
            margins + (colIndex * colWidth) + 2,
            yOffset + 5
          );
        });
        
        yOffset += 7;
        
        // Table rows (limit to 15)
        const maxRows = Math.min(data.length, 15);
        
        for (let i = 0; i < maxRows; i++) {
          // Alternate row colors
          if (i % 2 === 1) {
            pdf.setFillColor(250, 250, 250);
            pdf.rect(margins, yOffset, colWidth * maxCols, 7, 'F');
          }
          
          selectedColumns.forEach((col, colIndex) => {
            const value = data[i][col]?.toString() || '';
            pdf.text(
              value.substring(0, 14) + (value.length > 14 ? '...' : ''),
              margins + (colIndex * colWidth) + 2,
              yOffset + 5
            );
          });
          
          yOffset += 7;
        }
        
        // If there are more rows, indicate this with a message
        if (data.length > maxRows) {
          yOffset += 5;
          pdf.setTextColor(100, 100, 100);
          // Fix: setFontStyle doesn't exist in jsPDF v3, use setFont with style parameter instead
          pdf.setFont(undefined, 'italic');
          pdf.text(`(${data.length - maxRows} more rows not shown)`, margins, yOffset);
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
