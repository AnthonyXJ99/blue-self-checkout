import { Product } from "../../product/model/product.model";

/**
 * Modelo para una opción de combo según combo_api_instructions.json
 */
export interface ComboOption {
  itemCode: string;                 // Código del combo principal
  groupItemCode: string;            // Código del grupo (DRINKS, FRIES, etc.)
  optionItemCode: string;           // Código del producto que es opción
  optionItemName: string;           // Nombre del producto opción (viene de la API)
  optionPrice: number;              // Precio base del producto opción
  priceDelta: number;               // Diferencia de precio (+/-)
  finalPrice: number;               // Precio final calculado
  isDefault: string;                // Y/N - Si es la opción por defecto
  upgradeLevel: number;             // 0=básico, 1=premium, 2=deluxe
  upgradeLabel: string;             // Etiqueta para mostrar al usuario
  imageUrl?: string;                // URL de imagen del producto opción
  description?: string;             // Descripción del producto opción
}

/**
 * Modelo completo de un combo con sus opciones (según API response)
 */
export interface ComboProduct extends Product {
  isCombo: 'Y';                     // Siempre debe ser 'Y' para combos
  comboOptions: ComboOption[];      // Array de opciones del combo
}

/**
 * Parámetros para crear una opción de combo (según API instructions)
 */
export interface ComboOptionCreateRequest {
  groupItemCode: string;            // Código del grupo
  optionItemCode: string;           // Código del producto opción
  isDefault: string;                // Y/N
  priceDelta: number;               // Diferencia de precio
  upgradeLevel: number;             // Nivel de upgrade
  upgradeLabel?: string;            // Etiqueta opcional
}

/**
 * Parámetros para actualizar una opción de combo (según API instructions)
 */
export interface ComboOptionUpdateRequest {
  isDefault?: string;               // Y/N
  priceDelta?: number;              // Diferencia de precio
  upgradeLevel?: number;            // Nivel de upgrade
  upgradeLabel?: string;            // Etiqueta opcional
}

/**
 * Slot para configurar nueva opción en el modal (UI helper)
 */
export interface ComboOptionSlot {
  groupItemCode: string;            // Grupo al que pertenece
  optionItemCode: string;           // Producto seleccionado
  isDefault: string;                // Y/N
  priceDelta: number;               // Diferencia de precio
  upgradeLevel: number;             // Nivel de upgrade (0, 1, 2...)
  upgradeLabel: string;             // Etiqueta descriptiva
}