import { products } from "../../data/products";
import type { BudgetItem } from "../../types/BudgetItem";
import { formatCurrency } from "../../utils/currency";
import { generateWhatsappMessage } from "../../utils/whatsappMessage";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { IMaskInput } from "react-imask";
import {
  User,
  Phone,
  CalendarDays,
  Clock,
  FileText,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";

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

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        <header className="bg-white rounded-xl shadow-md border mb-8">
          <div className="px-8 py-6 border-b">
            <h1 className="text-3xl font-bold text-slate-800">NexOrder</h1>

            <p className="text-gray-500 mt-1">Gestão Inteligente de Pedidos</p>
          </div>

          <div className="flex gap-2 p-4">
            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-slate-100 transition"
            >
              <ClipboardList size={20} />
              Pedidos
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-slate-100 transition"
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>
          </div>
        </header>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <User size={22} />
              Informações do Pedido
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Informe os dados para contato e entrega.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <User size={16} />
                Nome Completo
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Digite o nome do cliente"
                className="w-full rounded-xl border border-slate-300 px-4 py-3
        focus:outline-none focus:ring-2 focus:ring-blue-500
        focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Phone size={16} />
                WhatsApp
              </label>

              <IMaskInput
                mask="(00) 00000-0000"
                value={phone}
                onAccept={(value) => setPhone(String(value))}
                placeholder="(82) 99999-9999"
                className="w-full rounded-xl border border-slate-300 px-4 py-3
        focus:outline-none focus:ring-2 focus:ring-blue-500
        focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <CalendarDays size={16} />
                Data de Entrega
              </label>

              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3
        focus:outline-none focus:ring-2 focus:ring-blue-500
        focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Clock size={16} />
                Horário
              </label>

              <input
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3
        focus:outline-none focus:ring-2 focus:ring-blue-500
        focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <FileText size={16} />
              Observações
            </label>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: retirar às 16h, sem cebola, entregar na recepção..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3
      resize-none
      focus:outline-none focus:ring-2 focus:ring-blue-500
      focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              Itens do Pedido
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Adicione os produtos que farão parte do orçamento.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-6">
            {/* Categoria */}
            <div className="col-span-12 md:col-span-3">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Categoria
              </label>

              <select
                className="w-full rounded-xl border border-slate-300 px-4 py-3
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Produto */}
            <div className="col-span-12 md:col-span-5 relative">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Produto
              </label>

              <input
                type="text"
                placeholder="Pesquisar produto..."
                value={searchProduct}
                onChange={(e) => {
                  setSearchProduct(e.target.value);
                  setShowSuggestions(true);
                }}
                className="w-full rounded-xl border border-slate-300 px-4 py-3
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />

              {showSuggestions && searchProduct && (
                <div className="absolute z-20 mt-2 w-full rounded-xl bg-white border shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(product.id);
                        setSearchProduct(product.name);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b last:border-none"
                    >
                      <div className="font-medium text-slate-800">
                        {product.name}
                      </div>

                      <div className="text-sm text-blue-600 font-semibold">
                        {formatCurrency(product.price)}
                      </div>
                    </button>
                  ))}

                  {filteredProducts.length === 0 && (
                    <div className="px-4 py-4 text-slate-500">
                      Nenhum produto encontrado.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quantidade */}
            <div className="col-span-6 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Quantidade
              </label>

              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-300 px-4 py-3
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Botão */}
            <div className="col-span-6 md:col-span-2 flex items-end">
              <button
                onClick={addItem}
                className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Lista */}

          {items.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 py-12 text-center">
              <h3 className="font-semibold text-slate-700">
                Nenhum produto adicionado
              </h3>

              <p className="text-slate-500 mt-2">
                Utilize o formulário acima para adicionar produtos ao pedido.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-12 bg-slate-100 px-4 py-3 font-semibold text-slate-700">
                <div className="col-span-6">Produto</div>
                <div className="col-span-2 text-center">Qtd</div>
                <div className="col-span-3 text-right">Subtotal</div>
                <div className="col-span-1"></div>
              </div>

              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 items-center px-4 py-4 border-t hover:bg-slate-50 transition"
                >
                  <div className="col-span-6">
                    <p className="font-medium text-slate-800">
                      {item.product.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      {formatCurrency(item.product.price)} cada
                    </p>
                  </div>

                  <div className="col-span-2 text-center font-semibold">
                    {item.quantity}
                  </div>

                  <div className="col-span-3 text-right font-bold text-blue-700">
                    {formatCurrency(item.subtotal)}
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      onClick={() =>
                        setItems(items.filter((_, i) => i !== index))
                      }
                      className="text-red-500 hover:text-red-700 text-xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                Resumo Financeiro
              </h2>

              <p className="text-sm text-slate-500">
                Confira os valores antes de finalizar o pedido.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-5">
              <p className="text-sm text-slate-500">Valor Total</p>

              <h3 className="text-3xl font-bold text-blue-700 mt-2">
                {formatCurrency(total)}
              </h3>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-100 p-5">
              <p className="text-sm text-slate-500">Entrada (50%)</p>

              <h3 className="text-3xl font-bold text-amber-600 mt-2">
                {formatCurrency(deposit)}
              </h3>
            </div>

            <div className="rounded-xl bg-green-50 border border-green-100 p-5">
              <p className="text-sm text-slate-500">Saldo Restante</p>

              <h3 className="text-3xl font-bold text-green-700 mt-2">
                {formatCurrency(remaining)}
              </h3>
            </div>
          </div>

          <div className="border-t mt-8 pt-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={saveBudget}
                className="flex-1 min-w-[220px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 font-semibold transition"
              >
                {editingId ? "Atualizar Pedido" : "Salvar Pedido"}
              </button>

              <button
                onClick={sendToWhatsapp}
                className="flex-1 min-w-[220px] bg-green-600 hover:bg-green-700 text-white rounded-xl py-4 font-semibold transition"
              >
                Enviar para WhatsApp
              </button>

              <button
                onClick={resetForm}
                className="min-w-[170px] bg-slate-200 hover:bg-slate-300 rounded-xl py-4 font-semibold text-slate-700 transition"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewBudget;
