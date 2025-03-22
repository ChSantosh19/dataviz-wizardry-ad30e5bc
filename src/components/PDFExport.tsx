
import React from 'react';
import { useData } from '../context/DataContext';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from '@/components/ui/use-toast';

const PDFExport: React.FC<{ containerRef: React.RefObject<HTMLDivElement> }> = ({ containerRef }) => {
  const { data, visualizations, fileName, dataSummary, mathStats } = useData();
  
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
      
      // Add title with improved styling
      pdf.setFillColor(240, 240, 250);
      pdf.rect(0, 0, pdfWidth, 30, 'F');
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(40, 40, 80);
      pdf.text(`${fileName} Visualization Report`, margins, 20);
      
      // Add subtitle with timestamp
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, margins, 30);
      
      // Data summary section
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(40, 40, 80);
      pdf.text('Data Summary', margins, 45);
      
      // Section divider
      pdf.setDrawColor(200, 200, 220);
      pdf.setLineWidth(0.5);
      pdf.line(margins, 48, pdfWidth - margins, 48);
      
      // Basic stats
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(60, 60, 60);
      let summaryYOffset = 55;
      
      pdf.text(`Total records: ${data.length}`, margins, summaryYOffset);
      summaryYOffset += 7;
      pdf.text(`Number of columns: ${dataSummary?.columnCount || 0}`, margins, summaryYOffset);
      summaryYOffset += 10;
      
      // Mathematical Analysis Section
      if (mathStats && mathStats.numericColumns.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(40, 40, 80);
        pdf.text('Statistical Analysis', margins, summaryYOffset);
        summaryYOffset += 8;
        
        pdf.setLineWidth(0.3);
        pdf.line(margins, summaryYOffset, pdfWidth - margins, summaryYOffset);
        summaryYOffset += 8;
        
        // Create a table for numeric column stats
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(60, 60, 60);
        pdf.text('Numeric Column Statistics:', margins, summaryYOffset);
        summaryYOffset += 8;
        
        // Table headers
        pdf.setFillColor(230, 230, 240);
        pdf.rect(margins, summaryYOffset - 5, pdfWidth - margins * 2, 8, 'F');
        
        const statHeaders = ['Column', 'Min', 'Max', 'Mean', 'Median', 'Std Dev'];
        const colWidths = [(pdfWidth - margins * 2) * 0.3, 
                           (pdfWidth - margins * 2) * 0.14,
                           (pdfWidth - margins * 2) * 0.14,
                           (pdfWidth - margins * 2) * 0.14,
                           (pdfWidth - margins * 2) * 0.14,
                           (pdfWidth - margins * 2) * 0.14];
        
        let xOffset = margins;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        
        statHeaders.forEach((header, i) => {
          pdf.text(header, xOffset + 2, summaryYOffset);
          xOffset += colWidths[i];
        });
        
        summaryYOffset += 8;
        
        // Table rows
        pdf.setFont("helvetica", "normal");
        
        mathStats.numericColumns.forEach((col, idx) => {
          if (idx % 2 === 0) {
            pdf.setFillColor(245, 245, 250);
            pdf.rect(margins, summaryYOffset - 5, pdfWidth - margins * 2, 8, 'F');
          }
          
          xOffset = margins;
          
          // Format values to 2 decimal places
          const values = [
            col.name.substring(0, 15) + (col.name.length > 15 ? '...' : ''),
            col.min.toFixed(2),
            col.max.toFixed(2),
            col.mean.toFixed(2),
            col.median.toFixed(2),
            col.standardDeviation.toFixed(2)
          ];
          
          values.forEach((value, i) => {
            pdf.text(value, xOffset + 2, summaryYOffset);
            xOffset += colWidths[i];
          });
          
          summaryYOffset += 8;
          
          // Check if we need a page break
          if (summaryYOffset > pdfHeight - 30) {
            pdf.addPage();
            summaryYOffset = margins + 10;
          }
        });
        
        // Add correlation information if available
        if (mathStats.correlations.length > 0) {
          summaryYOffset += 5;
          
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.text('Significant Correlations:', margins, summaryYOffset);
          summaryYOffset += 8;
          
          // Sort correlations by absolute value, highest first
          const sortedCorrelations = [...mathStats.correlations]
            .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
            .slice(0, 5); // Show only top 5
          
          // Format correlation table
          pdf.setFillColor(230, 230, 240);
          pdf.rect(margins, summaryYOffset - 5, pdfWidth - margins * 2, 8, 'F');
          
          const corrHeaders = ['Column 1', 'Column 2', 'Correlation Value', 'Strength'];
          const corrWidths = [(pdfWidth - margins * 2) * 0.3, 
                             (pdfWidth - margins * 2) * 0.3,
                             (pdfWidth - margins * 2) * 0.2,
                             (pdfWidth - margins * 2) * 0.2];
          
          xOffset = margins;
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          
          corrHeaders.forEach((header, i) => {
            pdf.text(header, xOffset + 2, summaryYOffset);
            xOffset += corrWidths[i];
          });
          
          summaryYOffset += 8;
          pdf.setFont("helvetica", "normal");
          
          sortedCorrelations.forEach((corr, idx) => {
            if (idx % 2 === 0) {
              pdf.setFillColor(245, 245, 250);
              pdf.rect(margins, summaryYOffset - 5, pdfWidth - margins * 2, 8, 'F');
            }
            
            xOffset = margins;
            
            // Determine correlation strength text
            let strengthText = "Weak";
            let strengthColor = [100, 100, 100];
            
            const absValue = Math.abs(corr.value);
            if (absValue > 0.7) {
              strengthText = "Strong";
              strengthColor = corr.value > 0 ? [0, 100, 0] : [180, 0, 0];
            } else if (absValue > 0.4) {
              strengthText = "Moderate";
              strengthColor = corr.value > 0 ? [0, 150, 0] : [150, 50, 50];
            }
            
            // Format correlation values
            const values = [
              corr.column1.substring(0, 15) + (corr.column1.length > 15 ? '...' : ''),
              corr.column2.substring(0, 15) + (corr.column2.length > 15 ? '...' : ''),
              corr.value.toFixed(3),
              strengthText
            ];
            
            values.forEach((value, i) => {
              // Use color for the strength text
              if (i === 3) {
                pdf.setTextColor(strengthColor[0], strengthColor[1], strengthColor[2]);
                pdf.text(value, xOffset + 2, summaryYOffset);
                pdf.setTextColor(60, 60, 60); // Reset color
              } else {
                pdf.text(value, xOffset + 2, summaryYOffset);
              }
              xOffset += corrWidths[i];
            });
            
            summaryYOffset += 8;
          });
        }
      }
      
      // Visualizations section - start on a new page
      pdf.addPage();
      
      // Add header for visualizations page
      pdf.setFillColor(240, 240, 250);
      pdf.rect(0, 0, pdfWidth, 30, 'F');
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(40, 40, 80);
      pdf.text(`${fileName} - Visualizations`, margins, 20);
      
      let yOffset = 40;
      
      // Extract SVG content from each visualization
      const chartContainers = containerRef.current.querySelectorAll('.chart-container');
      
      for (let i = 0; i < chartContainers.length; i++) {
        const chart = chartContainers[i] as HTMLElement;
        
        // Get the SVG element inside the chart
        const svgElement = chart.querySelector('svg');
        
        if (!svgElement) {
          console.warn(`No SVG found in chart ${i}`);
          continue;
        }
        
        // Always start a new page for each chart except the first one
        if (i > 0) {
          pdf.addPage();
          yOffset = 40;
        }
        
        // Get chart title
        const titleElement = chart.querySelector('.card-title');
        const title = titleElement ? (titleElement as HTMLElement).innerText : `Chart ${i + 1}`;
        
        // Add chart title with styling
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(40, 40, 80);
        pdf.text(title, margins, yOffset);
        yOffset += 7;
        
        // Add light gray line under title
        pdf.setDrawColor(200, 200, 220);
        pdf.setLineWidth(0.3);
        pdf.line(margins, yOffset, pdfWidth - margins, yOffset);
        yOffset += 7;
        
        // Get chart description if available
        const descriptionElement = chart.querySelector('.text-muted-foreground');
        if (descriptionElement) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text((descriptionElement as HTMLElement).innerText, margins, yOffset);
          yOffset += 10;
        }
        
        // Copy the SVG element and prepare it for rendering
        const svgClone = svgElement.cloneNode(true) as SVGElement;
        
        // Clean up the SVG for better rendering
        const gridLines = svgClone.querySelectorAll('.recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line');
        gridLines.forEach(line => {
          (line as SVGElement).setAttribute('stroke', '#eaeaea');
          (line as SVGElement).setAttribute('stroke-width', '0.5');
        });
        
        // Make text elements more visible
        const textElements = svgClone.querySelectorAll('text');
        textElements.forEach(text => {
          (text as SVGElement).setAttribute('font-size', '12');
          (text as SVGElement).setAttribute('font-weight', 'normal');
        });
        
        // Make bars and other visual elements more vibrant
        const visualElements = svgClone.querySelectorAll('path, rect, circle');
        visualElements.forEach(el => {
          const currentFill = (el as SVGElement).getAttribute('fill');
          if (currentFill && currentFill !== 'none') {
            // Make fill colors more vivid
            (el as SVGElement).setAttribute('fill-opacity', '0.85');
          }
          
          const currentStroke = (el as SVGElement).getAttribute('stroke');
          if (currentStroke && currentStroke !== 'none') {
            (el as SVGElement).setAttribute('stroke-width', '2');
          }
        });
        
        // Convert SVG to string
        const svgString = new XMLSerializer().serializeToString(svgClone);
        const svgBase64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        
        try {
          // Create an image to hold the SVG
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = svgBase64;
          });
          
          // Calculate image dimensions (larger for better quality)
          const imgWidth = pdfWidth - (margins * 2);
          const imgHeight = 140; // Fixed height for consistency
          
          // Add the image to the PDF
          pdf.addImage(img.src, 'SVG', margins, yOffset, imgWidth, imgHeight);
        } catch (e) {
          console.error("Error adding SVG to PDF:", e);
          // Fallback to adding a placeholder message
          pdf.setFont("helvetica", "italic");
          pdf.setTextColor(150, 150, 150);
          pdf.text("Chart rendering failed - please try exporting again", margins, yOffset + 40);
        }
      }
      
      // Add data sample on the last page
      pdf.addPage();
      
      // Add header for data sample page
      pdf.setFillColor(240, 240, 250);
      pdf.rect(0, 0, pdfWidth, 30, 'F');
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(40, 40, 80);
      pdf.text(`${fileName} - Data Sample`, margins, 20);
      
      yOffset = 40;
      
      // Add data sample (first 10 rows max)
      if (data.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(40, 40, 80);
        pdf.text('Data Sample (First Rows)', margins, yOffset);
        yOffset += 10;
        
        const columns = Object.keys(data[0]);
        const maxCols = Math.min(columns.length, 5); // Limit to 5 columns to fit on page
        const selectedColumns = columns.slice(0, maxCols);
        
        // Calculate column widths
        const colWidth = (pdfWidth - margins * 2) / maxCols;
        
        // Table header with styling
        pdf.setFillColor(230, 230, 240);
        pdf.rect(margins, yOffset - 5, colWidth * maxCols, 8, 'F');
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        
        let xOffset = margins;
        selectedColumns.forEach(col => {
          pdf.text(
            col.toString().substring(0, 15) + (col.length > 15 ? '...' : ''),
            xOffset + 3,
            yOffset + 2
          );
          xOffset += colWidth;
        });
        
        yOffset += 8;
        
        // Table rows (limit to 10)
        const maxRows = Math.min(data.length, 10);
        pdf.setFont("helvetica", "normal");
        
        for (let i = 0; i < maxRows; i++) {
          // Alternate row colors
          if (i % 2 === 1) {
            pdf.setFillColor(245, 245, 250);
            pdf.rect(margins, yOffset - 5, colWidth * maxCols, 8, 'F');
          }
          
          xOffset = margins;
          selectedColumns.forEach(col => {
            const value = data[i][col]?.toString() || '';
            pdf.text(
              value.substring(0, 18) + (value.length > 18 ? '...' : ''),
              xOffset + 3,
              yOffset + 2
            );
            xOffset += colWidth;
          });
          
          yOffset += 8;
        }
        
        // If there are more rows, indicate this with a message
        if (data.length > maxRows) {
          yOffset += 5;
          pdf.setFont("helvetica", "italic");
          pdf.setTextColor(100, 100, 100);
          pdf.text(`(${data.length - maxRows} more rows not shown)`, margins, yOffset);
        }
      }
      
      // Add footer with page numbers
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${pageCount}`, 
          pdfWidth / 2, 
          pdfHeight - 10, 
          { align: "center" }
        );
      }
      
      // Save the PDF
      pdf.save(`${fileName}-visualization-report.pdf`);
      
      toast({
        title: "PDF exported successfully",
        description: `${fileName}-visualization-report.pdf has been downloaded`,
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
