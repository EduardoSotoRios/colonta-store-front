import type { CartItem, ProductModel } from './api';

// Precio unitario de un item del carrito. Los diseños personalizados del
// configurador no existen en el catálogo de Supabase (`products`), así que
// usan el precio guardado en el propio item en vez de `product.basePrice`.
export function getCartItemUnitPrice(item: CartItem, products: Record<string, ProductModel>): number {
  if (item.customDesignImageUrl) return item.unitPrice ?? 0;

  const product = products[item.productModelId];
  if (!product) return 0;

  let price = Number(product.basePrice);
  const productExtras = product.extras || [];
  item.extras.forEach(extraId => {
    const extra = productExtras.find(e => e.id === extraId);
    if (extra) price += Number(extra.price) || 0;
  });
  return price;
}
