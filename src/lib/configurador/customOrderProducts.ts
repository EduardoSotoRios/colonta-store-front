import type { ProductId } from './products';

// UUIDs FIJOS — deben coincidir EXACTO con la migración del backend:
// colonta-api-main/src/database/migrations/1700000000013-SeedConfiguratorProductModels.ts
export const CUSTOM_ORDER_PRODUCT_MODEL_IDS: Record<ProductId, string> = {
  mochila_normal:  '43c90824-b3d9-44b4-a317-02f7e43ad79e',
  mochila_ligera:  'ea0651ce-a0b5-4f23-8668-facbb83f6e95',
  banano:          '261928b3-82bf-4c29-8d10-de584ff957ab',
  billetera:       '8bc82c92-fdc4-4b5c-b9df-d9a8577db62c',
  bolso:           '35dc2c4d-1d11-4d62-9891-6a365b2a841d',
  tabaquera:       '4c65dc05-d344-4084-a2d7-e5c6f8862002',
  banano_simple:   '7546cdbe-ea5d-45ea-82f5-53f4db7e9987',
  banano_muslera:  '4c35185f-5465-448e-8672-154a1b3faaec',
  porta_matt:      'b98424d1-6a02-4825-b5da-2cb7f5ffe7dd',
};

// SOLO para mostrar el precio en el carrito antes del pago — el precio real
// cobrado SIEMPRE lo recalcula el backend desde product_models.base_price
// (ver OrderService.createOrder). Mantener sincronizado a mano con la
// migración de arriba si cambian los precios.
export const CUSTOM_ORDER_PRICES: Record<ProductId, number> = {
  mochila_normal: 45000,
  mochila_ligera: 42000,
  banano: 25000,
  billetera: 18000,
  bolso: 30000,
  tabaquera: 22000,
  banano_simple: 20000,
  banano_muslera: 23000,
  porta_matt: 28000,
};

export const CUSTOM_ORDER_PRODUCT_NAMES: Record<ProductId, string> = {
  mochila_normal: 'Mochila Normal (Personalizada)',
  mochila_ligera: 'Mochila Ligera (Personalizada)',
  banano: 'Banano (Personalizado)',
  billetera: 'Billetera (Personalizada)',
  bolso: 'Bolso Tote (Personalizado)',
  tabaquera: 'Tabaquera (Personalizada)',
  banano_simple: 'Banano Simple (Personalizado)',
  banano_muslera: 'Banano Muslera (Personalizado)',
  porta_matt: 'Porta Matt (Personalizado)',
};
