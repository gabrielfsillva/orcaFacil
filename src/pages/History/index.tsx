import { useEffect, useState } from "react";
import { formatCurrency } from "../../utils/currency";
import { useNavigate } from "react-router-dom";
import { generateWhatsappMessage } from "../../utils/whatsappMessage";

interface SavedBudget {
  id: number;
  customerName: string;
  phone: string;
  deliveryDate: string;
  deliveryTime: string;
  notes: string;
  total: number;
  createdAt: string;
  status?: string;
  items: any[];
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString)
    .toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", "");
};

function History() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<SavedBudget[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("budgets");

    if (saved) {
      setBudgets(JSON.parse(saved));
    }
  }, []);

  const deleteBudget = (id: number) => {
    const confirmDelete = window.confirm(
      "Deseja realmente excluir este orçamento?",
    );

    if (!confirmDelete) return;

    const updated = budgets.filter((budget) => budget.id !== id);

    setBudgets(updated);

    localStorage.setItem("budgets", JSON.stringify(updated));
  };

  const sendToWhatsapp = (budget: SavedBudget) => {
    const total = budget.total;
    const deposit = total * 0.5;
    const remaining = total - deposit;

    const message = generateWhatsappMessage(
      budget.customerName,
      budget.phone,
      budget.deliveryDate,
      budget.deliveryTime,
      budget.notes,
      budget.items,
      total,
      deposit,
      remaining,
    );

    const encodedMessage = encodeURIComponent(message);

    const cleanPhone = budget.phone.replace(/\D/g, "");

    window.open(
      `https://wa.me/55${cleanPhone}?text=${encodedMessage}`,
      "_blank",
    );
  };

  const editBudget = (budget: SavedBudget) => {
    localStorage.setItem("editingBudget", JSON.stringify(budget));

    navigate("/");
  };

  const statusPriority: Record<string, number> = {
    Pendente: 1,
    "Em Produção": 2,
    Entregue: 3,
    Cancelado: 4,
  };

  const filteredBudgets = budgets
    .filter((budget) =>
      budget.customerName.toLowerCase().includes(search.toLowerCase()),
    )
    .sort(
      (a, b) =>
        (statusPriority[a.status || "Pendente"] || 99) -
        (statusPriority[b.status || "Pendente"] || 99),
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Entregue":
        return "bg-green-100 text-green-700";

      case "Em Produção":
        return "bg-blue-100 text-blue-700";

      case "Cancelado":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case "Entregue":
        return "border-l-4 border-green-500";

      case "Em Produção":
        return "border-l-4 border-blue-500";

      case "Cancelado":
        return "border-l-4 border-red-500";

      default:
        return "border-l-4 border-yellow-500";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold mb-6">Histórico de Orçamentos</h1>
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
          >
            Novo Orçamento
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar cliente..."
          className="w-full border rounded-lg p-3 mb-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredBudgets.length === 0 && (
          <p className="text-gray-500">Nenhum orçamento encontrado.</p>
        )}

        <div className="space-y-4">
          {filteredBudgets.map((budget) => (
            <div
              key={budget.id}
              className={`rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all ${getStatusBorder(
                budget.status || "Pendente",
              )}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{budget.customerName}</h2>

                  <p>📞 {budget.phone}</p>

                  <p>📅 {budget.deliveryDate}</p>

                  <p>🕒 {budget.deliveryTime}</p>

                  <p className="font-semibold text-green-700 mt-2">
                    Total: {formatCurrency(budget.total)}
                  </p>

                  <div className="mt-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        budget.status || "Pendente",
                      )}`}
                    >
                      {budget.status || "Pendente"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">
                    Criado em: {formatDateTime(budget.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  <button
                    onClick={() => editBudget(budget)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => sendToWhatsapp(budget)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    WhatsApp
                  </button>

                  <div className="flex flex-col gap-2">
                    <select
                      value={budget.status || "Pendente"}
                      onChange={(e) => {
                        const updated = budgets.map((b) =>
                          b.id === budget.id
                            ? { ...b, status: e.target.value }
                            : b,
                        );

                        setBudgets(updated);

                        localStorage.setItem(
                          "budgets",
                          JSON.stringify(updated),
                        );
                      }}
                      className="border rounded-lg p-2"
                    >
                      <option>Pendente</option>
                      <option>Em Produção</option>
                      <option>Entregue</option>
                      <option>Cancelado</option>
                    </select>

                    <button
                      onClick={() => deleteBudget(budget.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold mb-2">Itens do Pedido</h3>

                {budget.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between py-1">
                    <span>
                      {item.quantity}x {item.product.name}
                    </span>

                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default History;
