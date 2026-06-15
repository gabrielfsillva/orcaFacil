import { BrowserRouter, Routes, Route } from "react-router-dom";

import NewBudget from "./pages/NewBudget";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewBudget />} />
        <Route path="/history" element={<History />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;