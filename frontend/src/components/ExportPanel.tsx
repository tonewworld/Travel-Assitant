import { Button, Space, message } from "antd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Itinerary } from "../types";
import { exportItineraryText } from "../api/api";

interface Props {
  itinerary?: Itinerary;
  printRef: React.RefObject<HTMLDivElement>;
}

export function ExportPanel({ itinerary, printRef }: Props) {
  const handleExportText = async () => {
    if (!itinerary) return;
    try {
      const text = await exportItineraryText(itinerary);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${itinerary.destination}-行程攻略.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      message.error("导出文本失败");
    }
  };

  const handleExportImage = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2
      });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "行程攻略.png";
      a.click();
    } catch (e) {
      console.error(e);
      message.error("导出图片失败");
    }
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = 10;
        pdf.addImage(imgData, "PNG", 10, position - (imgHeight - pageHeight + 10), imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("行程攻略.pdf");
    } catch (e) {
      console.error(e);
      message.error("导出 PDF 失败");
    }
  };

  return (
    <div className="export-container">
      <Space>
        <Button onClick={handleExportText} disabled={!itinerary}>
          导出为文本
        </Button>
        <Button onClick={handleExportImage} disabled={!itinerary}>
          导出为图片
        </Button>
        <Button onClick={handleExportPDF} disabled={!itinerary}>
          导出为 PDF
        </Button>
      </Space>
    </div>
  );
}