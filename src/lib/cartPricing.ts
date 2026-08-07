import type { CartItem, ProductModel } from './api';

// Precio unitario de un item del carrito. Los diseños personalizados del
// configurador no existen en el catálogo de Supabase (`products`), así que
// usan el precio guardado en el propio item en vez de `product.basePrice`.
export function getCartItemUnitPrice(item: CartItem, products: Record<string, ProductModel>): number {
  // Diseños personalizados y productos agregados con precio de oferta usan unitPrice guardado.
  // Para items normales, unitPrice == basePrice (establecido en AddToCartButton), así que es seguro.
  const basePrice =
    item.unitPrice !== undefined && item.unitPrice !== null
      ? Number(item.unitPrice)
      : Number(products[item.productModelId]?.basePrice ?? 0);

  if (!products[item.productModelId]) return basePrice;

  const productExtras = products[item.productModelId].extras || [];
  let extrasTotal = 0;
  item.extras.forEach(extraId => {
    const extra = productExtras.find(e => e.id === extraId);
    if (extra) extrasTotal += Number(extra.price) || 0;
  });
  return basePrice + extrasTotal;
}
