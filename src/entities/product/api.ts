import type { Product } from "./types";

export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch("/api/products", {
    cache: "no-store",
  });

  const result = (await response.json()) as {
    products?: Product[];
    message?: string;
  };

  if (!response.ok || !result.products) {
    throw new Error(result.message || "Не удалось загрузить товары");
  }

  return result.products;
};
