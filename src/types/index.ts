export type Product = {
  id: string;
  name: string;
  price: string; // muestra formateada
  imageUrl: string;
};

export type Category = {
  id: string;
  name: string;
  imageUrl: string;
  href?: string;
};
