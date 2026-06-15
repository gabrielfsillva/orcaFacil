import type { Category } from "./Category";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
}