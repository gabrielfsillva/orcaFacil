import type { BudgetItem } from "../types/BudgetItem";

export function generateWhatsappMessage(
  customerName: string,
  phone: string,
  deliveryDate: string,
  deliveryTime: string,
  notes: string,
  items: BudgetItem[],
  total: number,
  deposit: number,
  remaining: number
) {
  const productLines = items
    .map(
      (item) =>
        `${item.quantity}x ${item.product.name} - ${item.subtotal.toLocaleString(
          "pt-BR",
          {
            style: "currency",
            currency: "BRL",
          }
        )}`
    )
    .join("\n");

  return `Olá ${customerName || "Cliente"}!

Segue seu orçamento:

${productLines}

📞 Telefone: ${phone || "Não informado"}

📅 Data de entrega: ${deliveryDate || "Não informada"}

🕒 Horário: ${deliveryTime || "Não informado"}

📝 Observações:
${notes || "Nenhuma"}

💰 Total: ${total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}

💵 Entrada (50%): ${deposit.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}

💳 Saldo na retirada: ${remaining.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}

Doce Baguete agradece a preferência.`;
}