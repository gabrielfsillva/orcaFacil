import { products } from "../../data/products";
import type { BudgetItem } from "../../types/BudgetItem";
import { formatCurrency } from "../../utils/currency";
import { generateWhatsappMessage } from "../../utils/whatsappMessage";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { generatePdf } from "../../utils/generatePdf";
import InputMask from "react-input-mask";
import { toast } from "react-toastify";

function NewBudget() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [quantity, setQuantity] = useState("");

  const [items, setItems] = useState<BudgetItem[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const editingBudget = localStorage.getItem("editingBudget");

    if (!editingBudget) return;

    const budget = JSON.parse(editingBudget);

    setEditingId(budget.id);

    setCustomerName(budget.customerName);
    setPhone(budget.phone);

    setDeliveryDate(budget.deliveryDate);
    setDeliveryTime(budget.deliveryTime);

    setNotes(budget.notes);

    setItems(budget.items);

    localStorage.removeItem("editingBudget");
  }, []);

  const categories = ["Salgado", "Doce", "Tortelete"] as const;

  const addItem = () => {
    if (!selectedProductId || !quantity) return;

    const product = products.find((p) => p.id === selectedProductId);

    if (!product) return;

    const qty = Number(quantity);

    const newItem: BudgetItem = {
      product,
      quantity: qty,
      subtotal: qty * product.price,
    };

    setItems((prev) => [...prev, newItem]);

    setSelectedProductId("");
    setSearchProduct("");
    setQuantity("");
    setShowSuggestions(false);
  };

  const resetForm = () => {
    setCustomerName("");
    setPhone("");

    setDeliveryDate("");
    setDeliveryTime("");
    setNotes("");

    setSelectedCategory("");
    setSelectedProductId("");
    setSearchProduct("");
    setQuantity("");
    setItems([]);
    setEditingId(null);
  };

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const deposit = total * 0.5;
  const remaining = total - deposit;

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      !selectedCategory || product.category === selectedCategory;

    const searchMatch = product.name
      .toLowerCase()
      .includes(searchProduct.toLowerCase());

    return categoryMatch && searchMatch;
  });
  const saveBudget = () => {
    if (!customerName.trim()) {
      toast.warning("Informe o nome do cliente.");
      return;
    }

    if (!phone.trim()) {
      toast.warning("Informe o telefone.");
      return;
    }

    if (!deliveryDate) {
      toast.warning("Informe a data de entrega.");
      return;
    }

    if (!deliveryTime) {
      toast.warning("Informe o horário de entrega.");
      return;
    }

    if (items.length === 0) {
      toast.error("Adicione pelo menos um item.");
      return;
    }

    const saved = localStorage.getItem("budgets");
    const budgets = saved ? JSON.parse(saved) : [];

    if (editingId !== null) {
      const updatedBudgets = budgets.map((budget: any) =>
        budget.id === editingId
          ? {
              ...budget,
              customerName,
              phone,
              deliveryDate,
              deliveryTime,
              notes,
              items,
              total,
            }
          : budget,
      );

      localStorage.setItem("budgets", JSON.stringify(updatedBudgets));

      toast.success("Orçamento atualizado com sucesso!");

      setEditingId(null);
    } else {
      const budget = {
        id: editingId ?? Date.now(),
        customerName,
        phone,
        deliveryDate,
        deliveryTime,
        notes,
        items,
        total,
        status: "Pendente",
        createdAt: new Date().toISOString(),
      };

      budgets.unshift(budget);

      localStorage.setItem("budgets", JSON.stringify(budgets));

      toast.success("Orçamento salvo com sucesso!");
    }

    resetForm();
    navigate("/history");
  };
  const copyBudget = async () => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item.");
      return;
    }
    const message = generateWhatsappMessage(
      customerName,
      phone,
      deliveryDate,
      deliveryTime,
      notes,
      items,
      total,
      deposit,
      remaining,
    );
    await navigator.clipboard.writeText(message);
    const confirmed = window.confirm(
      "Orçamento copiado com sucesso!\n\nDeseja iniciar um novo orçamento?",
    );
    if (confirmed) {
      resetForm();
    }
  };
  const sendToWhatsapp = () => {
    if (items.length === 0) {
      alert("Adicione pelo menos um item.");
      return;
    }
    if (!phone) {
      toast.warning("Informe o telefone do cliente.");
      return;
    }
    const message = generateWhatsappMessage(
      customerName,
      phone,
      deliveryDate,
      deliveryTime,
      notes,
      items,
      total,
      deposit,
      remaining,
    );
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(
      `https://wa.me/55${cleanPhone}?text=${encodedMessage}`,
      "_blank",
    );
  };

  const exportPdf = () => {
    if (items.length === 0) {
      alert("Adicione pelo menos um item.");
      return;
    }

    generatePdf(
      customerName,
      phone,
      deliveryDate,
      deliveryTime,
      notes,
      items,
      total,
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold mb-6">
          {editingId ? "Editar Orçamento" : "Novo Orçamento"}
        </h1>
        <div className="mb-6">
          <button
            onClick={() => navigate("/history")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Ver Orçamentos Salvos
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 ml-2"
          >
            Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Nome do Cliente"
            className="border rounded p-3"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <InputMask
            mask="(99) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border rounded p-3"
            placeholder="Telefone"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <input
            type="date"
            className="border rounded p-3"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />

          <input
            type="time"
            className="border rounded p-3"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
          />
        </div>

        <textarea
          placeholder="Observações do pedido..."
          className="border rounded p-3 w-full mb-6"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <select
            className="border rounded p-3"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas Categorias</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar produto..."
              className="border rounded p-3 w-full"
              value={searchProduct}
              onChange={(e) => {
                setSearchProduct(e.target.value);
                setShowSuggestions(true);
              }}
            />

            {showSuggestions && searchProduct && (
              <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 hover:bg-slate-100 cursor-pointer"
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setSearchProduct(product.name);
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="font-medium">{product.name}</div>

                    <div className="text-sm text-gray-500">
                      {formatCurrency(product.price)}
                    </div>
                  </div>
                ))}

                {filteredProducts.length === 0 && (
                  <div className="p-3 text-gray-500">
                    Nenhum produto encontrado
                  </div>
                )}
              </div>
            )}
          </div>

          <input
            type="number"
            placeholder="Quantidade"
            className="border rounded p-3"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <button
            onClick={addItem}
            className="bg-blue-600 text-white rounded p-3 hover:bg-blue-700"
          >
            Adicionar
          </button>
        </div>

        <div className="border rounded-lg p-4 mb-6">
          <h2 className="font-bold text-lg mb-4">Itens do Orçamento</h2>

          {items.length === 0 && (
            <p className="text-gray-500">Nenhum item adicionado.</p>
          )}

          {items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 border-b"
            >
              <span>
                {item.quantity}x {item.product.name}
              </span>

              <div className="flex items-center gap-4">
                <span>{formatCurrency(item.subtotal)}</span>

                <button
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                  className="text-red-600 font-bold hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <h2 className="font-bold text-lg mb-4">Resumo</h2>

          <div className="space-y-2">
            <p>
              Total: <strong>{formatCurrency(total)}</strong>
            </p>

            <p>
              Entrada (50%): <strong>{formatCurrency(deposit)}</strong>
            </p>

            <p>
              Saldo: <strong>{formatCurrency(remaining)}</strong>
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={saveBudget}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
            >
              {editingId ? "Atualizar Orçamento" : "Salvar Orçamento"}
            </button>

            <button
              onClick={copyBudget}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              Copiar
            </button>

            <button
              onClick={exportPdf}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
            >
              PDF
            </button>

            <button
              onClick={sendToWhatsapp}
              className="flex-1 bg-emerald-700 text-white py-3 rounded-lg hover:bg-emerald-800"
            >
              WhatsApp
            </button>

            <button
              onClick={resetForm}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewBudget;
