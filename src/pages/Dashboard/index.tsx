import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();

  const [totalBudgets, setTotalBudgets] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [todayDeliveries, setTodayDeliveries] = useState(0);

  const [pendingCount, setPendingCount] = useState(0);
  const [productionCount, setProductionCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);

  const [chartData, setChartData] = useState<any[]>([]);

  const [topProducts, setTopProducts] = useState<
    { name: string; quantity: number }[]
  >([]);

  useEffect(() => {
    const saved = localStorage.getItem("budgets");

    if (!saved) return;

    const budgets = JSON.parse(saved);

    setTotalBudgets(budgets.length);

    const revenue = budgets.reduce(
      (sum: number, budget: any) => sum + budget.total,
      0
    );

    setTotalRevenue(revenue);

    const today = new Date().toISOString().split("T")[0];

    const deliveries = budgets.filter(
      (budget: any) => budget.deliveryDate === today
    );

    setTodayDeliveries(deliveries.length);

    setPendingCount(
      budgets.filter(
        (b: any) => (b.status || "Pendente") === "Pendente"
      ).length
    );

    setProductionCount(
      budgets.filter(
        (b: any) => b.status === "Em Produção"
      ).length
    );

    setDeliveredCount(
      budgets.filter(
        (b: any) => b.status === "Entregue"
      ).length
    );

    setCancelledCount(
      budgets.filter(
        (b: any) => b.status === "Cancelado"
      ).length
    );

    const monthlyData: Record<string, number> = {};

    budgets.forEach((budget: any) => {
      const date = new Date(budget.createdAt);

      const month = date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      });

      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }

      monthlyData[month] += budget.total;
    });

    const formattedData = Object.entries(monthlyData).map(
      ([month, total]) => ({
        month,
        total,
      })
    );

    setChartData(formattedData);

    const productsSold: Record<string, number> = {};

    budgets.forEach((budget: any) => {
      budget.items.forEach((item: any) => {
        const productName = item.product.name;

        if (!productsSold[productName]) {
          productsSold[productName] = 0;
        }

        productsSold[productName] += item.quantity;
      });
    });

    const ranking = Object.entries(productsSold)
      .map(([name, quantity]) => ({
        name,
        quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    setTopProducts(ranking);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          <button
            onClick={() => navigate("/")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Novo Orçamento
          </button>
        </div>

        {/* Status dos Pedidos */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">

          <div className="bg-yellow-100 rounded-xl p-4 text-center">
            <h3 className="font-semibold">
              Pendentes
            </h3>

            <p className="text-3xl font-bold">
              {pendingCount}
            </p>
          </div>

          <div className="bg-blue-100 rounded-xl p-4 text-center">
            <h3 className="font-semibold">
              Em Produção
            </h3>

            <p className="text-3xl font-bold">
              {productionCount}
            </p>
          </div>

          <div className="bg-green-100 rounded-xl p-4 text-center">
            <h3 className="font-semibold">
              Entregues
            </h3>

            <p className="text-3xl font-bold">
              {deliveredCount}
            </p>
          </div>

          <div className="bg-red-100 rounded-xl p-4 text-center">
            <h3 className="font-semibold">
              Cancelados
            </h3>

            <p className="text-3xl font-bold">
              {cancelledCount}
            </p>
          </div>

        </div>

        {/* Cards Principais */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-gray-500 mb-2">
              📋 Total de Orçamentos
            </h2>

            <p className="text-5xl font-bold">
              {totalBudgets}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-gray-500 mb-2">
              💰 Valor Total
            </h2>

            <p className="text-4xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-gray-500 mb-2">
              🚚 Entregas Hoje
            </h2>

            <p className="text-4xl font-bold text-blue-600">
              {todayDeliveries}
            </p>
          </div>

        </div>

        {/* Gráfico */}
        <div className="bg-white rounded-xl shadow p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">
            Faturamento por Período
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />

              <Bar
                dataKey="total"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ranking */}
        <div className="bg-white rounded-xl shadow p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">
            Produtos Mais Vendidos
          </h2>

          {topProducts.length === 0 ? (
            <p className="text-gray-500">
              Nenhum produto vendido ainda.
            </p>
          ) : (
            <div className="space-y-3">

              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex justify-between border-b pb-2"
                >
                  <span>
                    {index === 0 && "🥇 "}
                    {index === 1 && "🥈 "}
                    {index === 2 && "🥉 "}
                    {index > 2 && `${index + 1}º `}
                    {product.name}
                  </span>

                  <span className="font-bold">
                    {product.quantity} un.
                  </span>
                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
