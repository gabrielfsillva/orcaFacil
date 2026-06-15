import jsPDF from "jspdf";
import type { BudgetItem } from "../types/BudgetItem";

export const generatePdf = (
  customerName: string,
  phone: string,
  deliveryDate: string,
  deliveryTime: string,
  notes: string,
  items: BudgetItem[],
  total: number,
) => {
  const pdf = new jsPDF();

  let y = 20;

  pdf.setFontSize(18);
  pdf.text("ORÇAMENTO", 20, y);

  y += 15;

  pdf.setFontSize(12);

  pdf.text(`Cliente: ${customerName}`, 20, y);
  y += 8;

  pdf.text(`Telefone: ${phone}`, 20, y);
  y += 8;

  pdf.text(`Entrega: ${deliveryDate}`, 20, y);
  y += 8;

  pdf.text(`Hora: ${deliveryTime}`, 20, y);
  y += 15;

  pdf.text("Itens:", 20, y);

  y += 10;

  items.forEach((item) => {
    pdf.text(
      `${item.quantity}x ${item.product.name} - R$ ${item.subtotal.toFixed(2)}`,
      20,
      y
    );

    y += 8;
  });

  y += 10;

  pdf.setFontSize(14);

  pdf.text(
    `TOTAL: R$ ${total.toFixed(2)}`,
    20,
    y
  );

  y += 15;

  if (notes) {
    pdf.setFontSize(12);

    pdf.text("Observações:", 20, y);

    y += 8;

    pdf.text(notes, 20, y);
  }

  pdf.save(`orcamento-${customerName}.pdf`);
};