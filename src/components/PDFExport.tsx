
import React from 'react';
import { useData } from '../context/DataContext';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from '@/components/ui/use-toast';

const PDFExport: React.FC<{ containerRef: React.RefObject<HTMLDivElement> }> = ({ containerRef }) => {
  const { data, visualizations, fileName } = useData();
  
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
      
      pdf.setFontSize(10);
      pdf.text(`Total records: ${data.length}`, margins, margins + 32);
      pdf.text(`Number of visualizations: ${visualizations.length}`, margins, margins + 38);
      
      // Capture each visualization chart
      let yOffset = margins + 48;
      const chartHeight = 80; // height in mm for each chart
      
      // Iterate through all chart containers in the DOM
      const chartContainers = containerRef.current.querySelectorAll('.chart-container');
      
      for (let i = 0; i < chartContainers.length; i++) {
        const chart = chartContainers[i] as HTMLElement;
        
        // Check if we need a new page
        if (yOffset + chartHeight > pdfHeight - margins) {
          pdf.addPage();
          yOffset = margins;
        }
        
        // Get chart title
        const titleElement = chart.querySelector('.card-title');
        const title = titleElement ? (titleElement as HTMLElement).innerText : `Chart ${i + 1}`;
        
        // Add chart title
        pdf.setFontSize(12);
        pdf.text(title, margins, yOffset);
        
        // Capture and add chart image
        const canvas = await html2canvas(chart, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pdfWidth - (margins * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', margins, yOffset + 5, imgWidth, imgHeight);
        
        yOffset += imgHeight + 25; // Move to position for next chart with padding
      }
      
      // Add data table section if there's room, otherwise add a new page
      if (yOffset + 60 > pdfHeight - margins) {
        pdf.addPage();
        yOffset = margins;
      }
      
      // Add data table section title
      pdf.setFontSize(14);
      pdf.text('Data Table', margins, yOffset);
      yOffset += 8;
      
      // Add data table
      const columns = Object.keys(data[0]);
      const cellWidth = (pdfWidth - (margins * 2)) / columns.length;
      const cellHeight = 8;
      
      // Table header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margins, yOffset, pdfWidth - (margins * 2), cellHeight, 'F');
      
      pdf.setFontSize(8);
      pdf.setTextColor(50, 50, 50);
      
      columns.forEach((col, colIndex) => {
        pdf.text(
          col.toString().substring(0, 16) + (col.length > 16 ? '...' : ''),
          margins + (colIndex * cellWidth) + 2,
          yOffset + 5,
          { maxWidth: cellWidth - 4 }
        );
      });
      
      yOffset += cellHeight;
      
      // Table rows (limit to fit the page)
      const maxRowsFirstPage = Math.floor((pdfHeight - yOffset - margins) / cellHeight);
      let rowsAdded = 0;
      
      pdf.setTextColor(0, 0, 0);
      
      for (let i = 0; i < data.length; i++) {
        // Check if we need a new page
        if (rowsAdded >= maxRowsFirstPage && i < data.length) {
          pdf.addPage();
          yOffset = margins;
          rowsAdded = 0;
          
          // Add table header on new page
          pdf.setFillColor(240, 240, 240);
          pdf.rect(margins, yOffset, pdfWidth - (margins * 2), cellHeight, 'F');
          
          pdf.setFontSize(8);
          pdf.setTextColor(50, 50, 50);
          
          columns.forEach((col, colIndex) => {
            pdf.text(
              col.toString().substring(0, 16) + (col.length > 16 ? '...' : ''),
              margins + (colIndex * cellWidth) + 2,
              yOffset + 5,
              { maxWidth: cellWidth - 4 }
            );
          });
          
          yOffset += cellHeight;
          pdf.setTextColor(0, 0, 0);
        }
        
        // Alternate row colors
        if (i % 2 === 1) {
          pdf.setFillColor(252, 252, 252);
          pdf.rect(margins, yOffset, pdfWidth - (margins * 2), cellHeight, 'F');
        }
        
        // Add cell values
        columns.forEach((col, colIndex) => {
          const value = data[i][col]?.toString() || '';
          pdf.text(
            value.substring(0, 16) + (value.length > 16 ? '...' : ''),
            margins + (colIndex * cellWidth) + 2,
            yOffset + 5,
            { maxWidth: cellWidth - 4 }
          );
        });
        
        yOffset += cellHeight;
        rowsAdded++;
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
      <Download className="h-4 w-4" />
      <span>Export as PDF</span>
    </Button>
  );
};

export default PDFExport;
