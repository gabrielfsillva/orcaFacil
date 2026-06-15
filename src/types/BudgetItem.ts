import type { Product } from "./Product";

export interface BudgetItem {
  product: Product;
  quantity: number;
  subtotal: number;
}