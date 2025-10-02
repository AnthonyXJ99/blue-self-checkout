# 📘 API Blue Self Checkout - Guía Completa para Desarrolladores Web

**Versión:** 1.0.0
**Última actualización:** 2025-10-01
**Base URL:** `https://api.example.com`

---

## 📚 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [Productos](#productos)
   - [Listar Productos](#listar-productos)
   - [Crear Producto](#crear-producto)
   - [Actualizar Producto](#actualizar-producto)
   - [Eliminar Producto](#eliminar-producto)
4. [Variantes de Productos](#-variantes-de-productos)
   - [Listar Variantes](#listar-variantes)
   - [Crear Variante](#crear-variante)
   - [Crear Variantes en Bulk](#crear-variantes-en-bulk)
   - [Actualizar Variante](#actualizar-variante)
   - [Eliminar Variante](#eliminar-variante)
5. [Combos](#combos)
   - [Listar Combos](#listar-combos)
   - [Crear Combo](#crear-combo)
   - [Gestionar Opciones](#gestionar-opciones)
6. [Referencia de DTOs](#-referencia-de-dtos)
   - [DTOs de Combos](#dtos-de-combos)
   - [DTOs de Variantes](#dtos-de-variantes)
   - [DTOs de Productos](#dtos-de-productos)
   - [Tabla Resumen](#tabla-resumen-de-dtos-por-endpoint)
7. [Workflows](#workflows)
8. [Modelos de Datos](#modelos-de-datos)
9. [Manejo de Errores](#manejo-de-errores)
10. [Best Practices](#best-practices)

---

## 🎯 Introducción

Esta API RESTful permite gestionar productos y combos para el sistema Blue Self Checkout. Los combos son productos especiales que permiten al cliente seleccionar opciones configurables (bebidas, tamaños, extras, etc.) con diferencias de precio.

### Características principales:
- ✅ CRUD completo de productos simples
- ✅ Gestión de combos con opciones múltiples
- ✅ Soporte para variantes de productos
- ✅ Imágenes con URLs dinámicas
- ✅ Paginación y búsqueda
- ✅ Validaciones robustas

---

## 🔐 Autenticación

> ⚠️ **Pendiente:** Configurar según el método de autenticación implementado (JWT, API Key, OAuth, etc.)

```http
Authorization: Bearer {token}
```

---

## 🛍️ Productos

Los productos son los items básicos del catálogo. Pueden ser simples, variables (con variantes) o combos.

### 📋 Listar Productos

#### 1. Obtener todos los productos (sin paginación)

```http
GET /api/Products/all
```

**Respuesta:** `200 OK`

```json
[
  {
    "itemCode": "PROD001",
    "eanCode": "1234567890123",
    "itemName": "Hamburguesa Clásica",
    "frgnName": "Classic Burger",
    "price": 45.00,
    "discount": 10,
    "imageUrl": "https://api.example.com/images/hamburguesa.jpg",
    "description": "Deliciosa hamburguesa con queso",
    "frgnDescription": "Delicious cheeseburger",
    "sellItem": "Y",
    "available": "Y",
    "enabled": "Y",
    "groupItemCode": "GRP001",
    "categoryItemCode": "CAT001",
    "waitingTime": "15 min",
    "rating": 4.5,
    "isCombo": "N",
    "material": []
  }
]
```

---

#### 2. Obtener productos con paginación

```http
GET /api/Products?pageNumber=1&pageSize=10&search=hamburguesa
```

**Parámetros de Query:**

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `pageNumber` | integer | No | 1 | Número de página (≥1) |
| `pageSize` | integer | No | 10 | Items por página (1-100) |
| `search` | string | No | - | Busca en ItemName, EANCode, ItemCode, FrgnName |

**Respuesta:** `200 OK`

```json
{
  "data": [...],
  "page": 1,
  "pageSize": 10,
  "totalRecords": 50,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPreviousPage": false,
  "filter": "hamburguesa"
}
```

---

#### 3. Obtener producto por código

```http
GET /api/Products/{productCode}
```

**Ejemplo:**

```http
GET /api/Products/PROD001
```

**Respuesta:** `200 OK`

```json
{
  "itemCode": "PROD001",
  "itemName": "Hamburguesa Clásica",
  "price": 45.00,
  "imageUrl": "https://api.example.com/images/hamburguesa.jpg"
}
```

**Errores:**
- `404 Not Found` - Producto no existe

---

#### 4. Obtener productos disponibles

```http
GET /api/Products/available
```

> 💡 **Uso recomendado:** Este endpoint es ideal para mostrar el catálogo público en la web/app. Solo devuelve productos con `Available='Y'`, `Enabled='Y'` y `SellItem='Y'`.

---

#### 5. Filtrar por categoría o grupo

```http
GET /api/Products/Categories/{categoryCode}
GET /api/Products/Groups/{groupCode}
```

**Ejemplos:**

```http
GET /api/Products/Categories/CAT001
GET /api/Products/Groups/BURGERS
```

---

### ➕ Crear Producto

```http
POST /api/Products
Content-Type: application/json
```

**Body:**

```json
{
  "itemCode": "BURGER001",
  "eanCode": "7501234567890",
  "itemName": "Hamburguesa Doble Queso",
  "frgnName": "Double Cheese Burger",
  "price": 85.50,
  "discount": 10,
  "imageUrl": "/images/burger-doble.jpg",
  "description": "Hamburguesa con doble carne y queso cheddar",
  "frgnDescription": "Burger with double meat and cheddar cheese",
  "sellItem": "Y",
  "available": "Y",
  "enabled": "Y",
  "groupItemCode": "BURGERS",
  "categoryItemCode": "FOOD",
  "waitingTime": "15-20 min",
  "rating": 4.7,
  "u_ProductType": "S",
  "u_HasVariants": "N",
  "u_IsVariant": "N",
  "u_ParentItem": null
}
```

**Campos requeridos:**

| Campo | Tipo | Validación | Descripción |
|-------|------|------------|-------------|
| `itemCode` | string(50) | Requerido, único | Código único del producto |
| `eanCode` | string(50) | Requerido | Código de barras EAN |
| `itemName` | string(150) | Requerido | Nombre del producto |
| `price` | decimal | Requerido, ≥0 | Precio del producto |
| `sellItem` | string(1) | Y/N | Disponible para venta |
| `available` | string(1) | Y/N | Disponible |
| `enabled` | string(1) | Y/N | Habilitado |

**Campos opcionales:**

| Campo | Tipo | Validación | Default | Descripción |
|-------|------|------------|---------|-------------|
| `frgnName` | string(150) | - | null | Nombre en idioma extranjero |
| `discount` | decimal | 0-100 | null | Descuento en % |
| `imageUrl` | string(255) | - | null | URL de imagen |
| `description` | string(255) | - | null | Descripción |
| `frgnDescription` | string(255) | - | null | Descripción extranjera |
| `groupItemCode` | string(50) | - | null | Código de grupo |
| `categoryItemCode` | string(50) | - | null | Código de categoría |
| `waitingTime` | string(50) | - | null | Tiempo de preparación |
| `rating` | decimal | 0-5 | null | Calificación |
| `u_ProductType` | string(1) | S/V/C | S | Tipo: Simple/Variable/Combo |
| `u_HasVariants` | string(1) | Y/N | N | Tiene variantes |
| `u_IsVariant` | string(1) | Y/N | N | Es variante |
| `u_ParentItem` | string(50) | - | null | Producto padre (si es variante) |

**Respuesta:** `201 Created`

```json
{
  "itemCode": "BURGER001",
  "itemName": "Hamburguesa Doble Queso",
  "price": 85.50,
  "imageUrl": "https://api.example.com/images/burger-doble.jpg"
}
```

**Headers:**

```http
Location: /api/Products/BURGER001
```

**Errores:**

- `400 Bad Request` - Validación fallida
  ```json
  {
    "message": "Validation failed",
    "errors": {
      "ItemName": ["El nombre del artículo es requerido."],
      "Price": ["El precio debe ser un valor positivo."]
    }
  }
  ```

- `409 Conflict` - Código duplicado
  ```json
  {
    "message": "Ya existe un producto con el ItemCode: BURGER001."
  }
  ```

---

### ✏️ Actualizar Producto

```http
PUT /api/Products/{productCode}
Content-Type: application/json
```

**Ejemplo:**

```http
PUT /api/Products/BURGER001
```

**Body:** (misma estructura que POST)

```json
{
  "itemCode": "BURGER001",
  "eanCode": "7501234567890",
  "itemName": "Hamburguesa Doble Queso Premium",
  "price": 95.00,
  "discount": 15,
  "available": "Y",
  "enabled": "Y",
  "sellItem": "Y"
}
```

**Respuesta:** `200 OK`

**Errores:**
- `400 Bad Request` - El código en URL no coincide con el body
- `404 Not Found` - Producto no existe

---

### 🗑️ Eliminar Producto

```http
DELETE /api/Products/{productCode}
```

**Respuesta:** `204 No Content`

**Errores:**
- `404 Not Found` - Producto no existe

---

## 🎁 Combos

Los combos son productos especiales que permiten al cliente elegir entre múltiples opciones (bebidas, tamaños, extras, etc.) con precios variables.

### Conceptos clave:

- **Combo:** Producto con `IsCombo='Y'` que tiene opciones configurables
- **Opción:** Cada producto seleccionable dentro del combo
- **GroupCode:** Agrupa opciones relacionadas (ej: todas las bebidas)
- **PriceDiff:** Diferencia de precio respecto al precio base
- **FinalPrice:** Precio calculado automáticamente (precioBase + priceDiff)
- **ComponentLineNum:** Relaciona la opción con un componente de la receta

---

### 📋 Listar Combos

#### 1. Obtener todos los combos

```http
GET /api/Combos
```

**Respuesta:** `200 OK`

```json
[
  {
    "itemCode": "COMBO001",
    "itemName": "Combo Hamburguesa",
    "frgnName": "Burger Combo",
    "price": 120.00,
    "discount": 5,
    "imageUrl": "https://api.example.com/images/combo-burger.jpg",
    "description": "Hamburguesa + Papas + Bebida",
    "isCombo": "Y",
    "available": "Y",
    "enabled": "Y",
    "sellItem": "Y",
    "options": [
      {
        "optionCode": 1,
        "comboItemCode": "COMBO001",
        "componentLineNum": 1,
        "groupCode": "BEBIDAS",
        "itemCode": "COCA350",
        "itemName": null,
        "sizeCode": "MED",
        "optionItemName": "Coca Cola 350ml",
        "optionPrice": 25.00,
        "priceDiff": 0,
        "finalPrice": 120.00,
        "isDefault": "Y",
        "upLevel": 0,
        "upLabel": null,
        "lineNum": 1,
        "displayOrder": 1,
        "available": "Y",
        "imageUrl": "https://api.example.com/images/coca350.jpg",
        "description": "Refresco Coca Cola 350ml"
      },
      {
        "optionCode": 2,
        "comboItemCode": "COMBO001",
        "componentLineNum": 1,
        "groupCode": "BEBIDAS",
        "itemCode": "COCA500",
        "itemName": "Coca Grande",
        "sizeCode": "LRG",
        "optionItemName": "Coca Cola 500ml",
        "optionPrice": 30.00,
        "priceDiff": 5.00,
        "finalPrice": 125.00,
        "isDefault": "N",
        "upLevel": 1,
        "upLabel": "Agrandar bebida",
        "lineNum": 2,
        "displayOrder": 2,
        "available": "Y",
        "imageUrl": "https://api.example.com/images/coca500.jpg",
        "description": "Refresco Coca Cola 500ml"
      }
    ]
  }
]
```

---

#### 2. Obtener combo específico

```http
GET /api/Combos/{comboCode}
```

**Ejemplo:**

```http
GET /api/Combos/COMBO001
```

**Respuesta:** `200 OK` (misma estructura que el array anterior)

**Errores:**
- `404 Not Found` - Combo no existe
- `400 Bad Request` - El producto existe pero no es un combo

---

## 🎨 Variantes de Productos

Las variantes permiten definir diferentes presentaciones de un mismo producto base (tamaños, colores, marcas, etc.). Cada variante tiene un ajuste de precio respecto al producto base.

### 🔍 Workflow de Variantes

1. **Crear producto base** en OITM con `U_HasVariants='Y'`
2. **Definir variantes** seleccionando tamaños/colores de las tablas maestras
3. **Usar variantes** en ventas individuales o como opciones en combos

---

### Listar Variantes

Obtiene todas las variantes de un producto.

```http
GET /api/Products/{productCode}/Variants
```

**Ejemplo:**

```http
GET /api/Products/GASEOSA/Variants
```

**Respuesta:** `200 OK`

```json
[
  {
    "variantID": 1,
    "itemCode": "GASEOSA",
    "variantName": "Coca Cola 500ml",
    "brandName": "Coca Cola",
    "sizeCode": "500ML",
    "colorCode": null,
    "priceAdjustment": 5.00,
    "available": "Y",
    "sizeName": "500 Mililitros",
    "colorName": null,
    "basePrice": 25.00,
    "finalPrice": 30.00
  },
  {
    "variantID": 2,
    "itemCode": "GASEOSA",
    "variantName": "Pepsi 750ml",
    "brandName": "Pepsi",
    "sizeCode": "750ML",
    "colorCode": null,
    "priceAdjustment": 8.00,
    "available": "Y",
    "sizeName": "750 Mililitros",
    "colorName": null,
    "basePrice": 25.00,
    "finalPrice": 33.00
  }
]
```

**Campos calculados:**
- `finalPrice` = `basePrice` + `priceAdjustment`
- `sizeName` y `colorName` se obtienen de las tablas maestras OSZC y Colors

**Errores:**
- `404 Not Found` - Producto no existe

---

### Crear Variante

Crea una nueva variante para un producto.

```http
POST /api/Products/{productCode}/Variants
Content-Type: application/json
```

**Body:**

```json
{
  "variantName": "Coca Cola 500ml",
  "brandName": "Coca Cola",
  "sizeCode": "500ML",
  "colorCode": null,
  "priceAdjustment": 5.00,
  "available": "Y"
}
```

**Respuesta:** `201 Created`

```json
{
  "variantID": 1,
  "itemCode": "GASEOSA",
  "variantName": "Coca Cola 500ml",
  "brandName": "Coca Cola",
  "sizeCode": "500ML",
  "colorCode": null,
  "priceAdjustment": 5.00,
  "available": "Y",
  "sizeName": "500 Mililitros",
  "colorName": null,
  "basePrice": 25.00,
  "finalPrice": 30.00
}
```

**Validaciones:**
- El producto debe existir
- El producto debe tener `U_HasVariants='Y'`
- El `sizeCode` debe existir en la tabla OSZC (si se proporciona)
- El `colorCode` debe existir en la tabla Colors (si se proporciona)
- No puede existir otra variante con la misma combinación de `sizeCode` y `colorCode`

**Errores:**
- `404 Not Found` - Producto no existe
- `400 Bad Request` - Producto no tiene variantes habilitadas
- `400 Bad Request` - Tamaño o color no existe
- `409 Conflict` - Ya existe una variante con la misma combinación

---

### Crear Variantes en Bulk

Crea múltiples variantes en una sola operación. Ideal para cuando seleccionas varios tamaños de la tabla OSZC.

```http
POST /api/Products/{productCode}/Variants/bulk
Content-Type: application/json
```

**Body:**

```json
{
  "variants": [
    {
      "variantName": "Coca Cola 500ml",
      "brandName": "Coca Cola",
      "sizeCode": "500ML",
      "colorCode": null,
      "priceAdjustment": 5.00,
      "available": "Y"
    },
    {
      "variantName": "Coca Cola 750ml",
      "brandName": "Coca Cola",
      "sizeCode": "750ML",
      "colorCode": null,
      "priceAdjustment": 8.00,
      "available": "Y"
    },
    {
      "variantName": "Pepsi 500ml",
      "brandName": "Pepsi",
      "sizeCode": "500ML",
      "colorCode": null,
      "priceAdjustment": 4.50,
      "available": "Y"
    }
  ]
}
```

**Respuesta:** `200 OK`

```json
{
  "totalRequested": 3,
  "successfullyCreated": 3,
  "failed": 0,
  "createdVariants": [
    {
      "variantID": 1,
      "itemCode": "GASEOSA",
      "variantName": "Coca Cola 500ml",
      "brandName": "Coca Cola",
      "sizeCode": "500ML",
      "colorCode": null,
      "priceAdjustment": 5.00,
      "available": "Y",
      "sizeName": "500 Mililitros",
      "colorName": null,
      "basePrice": 25.00,
      "finalPrice": 30.00
    },
    {
      "variantID": 2,
      "itemCode": "GASEOSA",
      "variantName": "Coca Cola 750ml",
      "brandName": "Coca Cola",
      "sizeCode": "750ML",
      "colorCode": null,
      "priceAdjustment": 8.00,
      "available": "Y",
      "sizeName": "750 Mililitros",
      "colorName": null,
      "basePrice": 25.00,
      "finalPrice": 33.00
    },
    {
      "variantID": 3,
      "itemCode": "GASEOSA",
      "variantName": "Pepsi 500ml",
      "brandName": "Pepsi",
      "sizeCode": "500ML",
      "colorCode": null,
      "priceAdjustment": 4.50,
      "available": "Y",
      "sizeName": "500 Mililitros",
      "colorName": null,
      "basePrice": 25.00,
      "finalPrice": 29.50
    }
  ],
  "errors": []
}
```

**Comportamiento:**
- Intenta crear todas las variantes
- Si alguna falla, continúa con las demás
- Retorna resumen de éxitos y errores

**Ejemplo de respuesta con errores:**

```json
{
  "totalRequested": 3,
  "successfullyCreated": 2,
  "failed": 1,
  "createdVariants": [
    {
      "variantID": 1,
      "itemCode": "GASEOSA",
      "variantName": "Coca Cola 500ml",
      ...
    }
  ],
  "errors": [
    "Tamaño '999ML': no existe.",
    "Variante 'Pepsi 500ml': ya existe con la misma combinación."
  ]
}
```

---

### Actualizar Variante

Actualiza una variante existente.

```http
PUT /api/Products/{productCode}/Variants/{variantId}
Content-Type: application/json
```

**Body:**

```json
{
  "variantName": "Coca Cola 500ml - Edición Especial",
  "brandName": "Coca Cola",
  "sizeCode": "500ML",
  "colorCode": null,
  "priceAdjustment": 6.00,
  "available": "Y"
}
```

**Respuesta:** `200 OK`

```json
{
  "variantID": 1,
  "itemCode": "GASEOSA",
  "variantName": "Coca Cola 500ml - Edición Especial",
  "brandName": "Coca Cola",
  "sizeCode": "500ML",
  "colorCode": null,
  "priceAdjustment": 6.00,
  "available": "Y",
  "sizeName": "500 Mililitros",
  "colorName": null,
  "basePrice": 25.00,
  "finalPrice": 31.00
}
```

> ⚠️ **No se puede cambiar:** `ItemCode`, `VariantID`

**Validaciones:**
- La variante debe existir
- No puede crear duplicados con otra variante existente

**Errores:**
- `404 Not Found` - Producto o variante no existe
- `400 Bad Request` - Tamaño o color no existe
- `409 Conflict` - Conflicto con otra variante

---

### Eliminar Variante

Elimina una variante de un producto.

```http
DELETE /api/Products/{productCode}/Variants/{variantId}
```

**Respuesta:** `204 No Content`

**Validaciones:**
- No se puede eliminar si la variante está siendo usada en opciones de combos (OCBO)

**Errores:**
- `404 Not Found` - Producto o variante no existe
- `400 Bad Request` - Variante en uso en combos

---

### ➕ Crear Combo

Este es el endpoint principal para crear combos completos con todas sus opciones en una sola operación.

```http
POST /api/Combos
Content-Type: application/json
```

**Body completo:**

```json
{
  "itemCode": "COMBO_FAMILIAR",
  "itemName": "Combo Familiar",
  "frgnName": "Family Combo",
  "price": 350.00,
  "discount": 10,
  "imageUrl": "/images/combo-familiar.jpg",
  "description": "4 Hamburguesas + 2 Papas Grandes + 4 Bebidas",
  "frgnDescription": "4 Burgers + 2 Large Fries + 4 Drinks",
  "groupItemCode": "COMBOS",
  "categoryItemCode": "FOOD",
  "waitingTime": "25-30 min",
  "rating": 4.8,
  "eanCode": "7501234567999",
  "options": [
    {
      "componentLineNum": 1,
      "groupCode": "BEBIDAS",
      "itemCode": "COCA350",
      "itemName": null,
      "sizeCode": "MED",
      "isDefault": "Y",
      "priceDiff": 0,
      "upLevel": 0,
      "upLabel": null,
      "lineNum": 1,
      "displayOrder": 1,
      "available": "Y"
    },
    {
      "componentLineNum": 1,
      "groupCode": "BEBIDAS",
      "itemCode": "COCA500",
      "itemName": "Coca Grande",
      "sizeCode": "LRG",
      "isDefault": "N",
      "priceDiff": 5.00,
      "upLevel": 1,
      "upLabel": "Agrandar bebida",
      "lineNum": 2,
      "displayOrder": 2,
      "available": "Y"
    },
    {
      "componentLineNum": 1,
      "groupCode": "BEBIDAS",
      "itemCode": "SPRITE350",
      "itemName": null,
      "sizeCode": "MED",
      "isDefault": "N",
      "priceDiff": 0,
      "upLevel": 0,
      "upLabel": null,
      "lineNum": 3,
      "displayOrder": 3,
      "available": "Y"
    },
    {
      "componentLineNum": 2,
      "groupCode": "PAPAS",
      "itemCode": "FRIES_MED",
      "itemName": null,
      "sizeCode": "MED",
      "isDefault": "Y",
      "priceDiff": 0,
      "upLevel": 0,
      "upLabel": null,
      "lineNum": 1,
      "displayOrder": 1,
      "available": "Y"
    },
    {
      "componentLineNum": 2,
      "groupCode": "PAPAS",
      "itemCode": "FRIES_LRG",
      "itemName": "Papas Grandes",
      "sizeCode": "LRG",
      "isDefault": "N",
      "priceDiff": 10.00,
      "upLevel": 1,
      "upLabel": "Agrandar papas",
      "lineNum": 2,
      "displayOrder": 2,
      "available": "Y"
    }
  ]
}
```

**Estructura de una Opción:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `componentLineNum` | integer | ✅ | Número de línea del componente (relacionado con receta) |
| `groupCode` | string(50) | ✅ | Código del grupo (BEBIDAS, PAPAS, SALSAS, etc.) |
| `itemCode` | string(50) | ✅ | Código del producto que es opción |
| `itemName` | string(150) | ❌ | Nombre personalizado (opcional, usa el del producto si no se especifica) |
| `sizeCode` | string(50) | ❌ | Código del tamaño (MED, LRG, etc.) |
| `isDefault` | string(1) | ✅ | Y/N - Opción por defecto del grupo |
| `priceDiff` | decimal | ❌ | Diferencia de precio (puede ser negativa) - Default: 0 |
| `upLevel` | integer | ❌ | Nivel de mejora (0=normal, 1+=upgrade) - Default: 0 |
| `upLabel` | string(100) | ❌ | Etiqueta de mejora ("Agrandar", "Premium", etc.) |
| `lineNum` | integer | ❌ | Número de línea - Default: 0 |
| `displayOrder` | integer | ❌ | Orden de visualización - Default: 0 |
| `available` | string(1) | ❌ | Y/N - Disponibilidad - Default: Y |

**Respuesta:** `201 Created`

```json
{
  "itemCode": "COMBO_FAMILIAR",
  "itemName": "Combo Familiar",
  "price": 350.00,
  "options": [...]
}
```

**Headers:**

```http
Location: /api/Combos/COMBO_FAMILIAR
```

**Errores:**

- `400 Bad Request` - Producto opción no existe
  ```json
  {
    "message": "El producto opción con código COCA350 no existe."
  }
  ```

- `409 Conflict` - Combo ya existe
  ```json
  {
    "message": "Ya existe un producto con el código: COMBO_FAMILIAR"
  }
  ```

---

### ✏️ Actualizar Combo

Actualiza solo los datos principales del combo (NO las opciones).

```http
PUT /api/Combos/{comboCode}
Content-Type: application/json
```

**Body:**

```json
{
  "itemName": "Combo Familiar Premium",
  "frgnName": "Premium Family Combo",
  "price": 380.00,
  "discount": 15,
  "imageUrl": "/images/combo-familiar-premium.jpg",
  "description": "4 Hamburguesas Premium + 2 Papas + 4 Bebidas",
  "available": "Y",
  "enabled": "Y"
}
```

> 💡 **Nota:** Para agregar/modificar/eliminar opciones, usar los endpoints de opciones.

**Respuesta:** `200 OK`

---

### 🗑️ Eliminar Combo

Elimina el combo y **TODAS** sus opciones.

```http
DELETE /api/Combos/{comboCode}
```

**Respuesta:** `204 No Content`

> ⚠️ **Advertencia:** Esta operación es irreversible y elimina todas las opciones asociadas.

---

### 🔧 Gestionar Opciones

#### 1. Listar opciones de un combo

```http
GET /api/Combos/{comboCode}/options
```

**Ejemplo:**

```http
GET /api/Combos/COMBO001/options
```

**Respuesta:** `200 OK`

```json
[
  {
    "optionCode": 1,
    "comboItemCode": "COMBO001",
    "componentLineNum": 1,
    "groupCode": "BEBIDAS",
    "itemCode": "COCA350",
    "optionItemName": "Coca Cola 350ml",
    "priceDiff": 0,
    "finalPrice": 120.00,
    "isDefault": "Y"
  }
]
```

---

#### 2. Agregar opción a combo existente

```http
POST /api/Combos/{comboCode}/options
Content-Type: application/json
```

**Body:**

```json
{
  "componentLineNum": 1,
  "groupCode": "BEBIDAS",
  "itemCode": "FANTA350",
  "itemName": null,
  "sizeCode": "MED",
  "isDefault": "N",
  "priceDiff": 0,
  "upLevel": 0,
  "upLabel": null,
  "lineNum": 4,
  "displayOrder": 4,
  "available": "Y"
}
```

**Respuesta:** `201 Created`

```json
{
  "optionCode": 5,
  "comboItemCode": "COMBO001",
  "groupCode": "BEBIDAS",
  "itemCode": "FANTA350",
  "optionItemName": "Fanta Naranja 350ml",
  "priceDiff": 0,
  "finalPrice": 120.00
}
```

**Errores:**
- `404 Not Found` - Combo o producto opción no existe
- `409 Conflict` - La opción ya existe

---

#### 3. Actualizar opción

```http
PUT /api/Combos/{comboCode}/options/{optionCode}
Content-Type: application/json
```

**Ejemplo:**

```http
PUT /api/Combos/COMBO001/options/5
```

**Body (ComboOptionUpdateDto):**

> ⚠️ **Importante:** Este endpoint NO permite cambiar `ComboItemCode`, `ComponentLineNum`, `GroupCode` ni `ItemCode`. Solo campos modificables.

```json
{
  "itemName": "Fanta Naranja",
  "sizeCode": "MED",
  "isDefault": "N",
  "priceDiff": 2.00,
  "upLevel": 0,
  "upLabel": null,
  "lineNum": 4,
  "displayOrder": 4,
  "available": "Y"
}
```

**Campos modificables:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `itemName` | string(150) | Nombre personalizado de la opción |
| `sizeCode` | string(50) | Código del tamaño |
| `isDefault` | string(1) | Y/N - Opción por defecto |
| `priceDiff` | decimal | Diferencia de precio |
| `upLevel` | integer | Nivel de upgrade |
| `upLabel` | string(100) | Etiqueta de upgrade |
| `lineNum` | integer | Número de línea |
| `displayOrder` | integer | Orden de visualización |
| `available` | string(1) | Y/N - Disponibilidad |

**Respuesta:** `200 OK`

```json
{
  "optionCode": 5,
  "comboItemCode": "COMBO001",
  "itemName": "Fanta Naranja",
  "priceDiff": 2.00,
  "finalPrice": 122.00
}
```

---

#### 4. Eliminar opción

```http
DELETE /api/Combos/{comboCode}/options/{optionCode}
```

**Respuesta:** `204 No Content`

---

---

## 📦 Referencia de DTOs

Esta sección detalla todos los DTOs (Data Transfer Objects) disponibles en la API.

### DTOs de Combos

#### ComboCreateDto (Input - Crear)

Usado en: `POST /api/Combos`

```json
{
  "itemCode": "string(50)",          // Requerido
  "itemName": "string(150)",         // Requerido
  "frgnName": "string(150)",         // Opcional
  "price": "decimal",                // Requerido
  "discount": "decimal(0-100)",      // Opcional
  "imageUrl": "string(255)",         // Opcional
  "description": "string(255)",      // Opcional
  "frgnDescription": "string(255)",  // Opcional
  "groupItemCode": "string(50)",     // Opcional
  "categoryItemCode": "string(50)",  // Opcional
  "waitingTime": "string(50)",       // Opcional
  "rating": "decimal(0-5)",          // Opcional
  "eanCode": "string(50)",           // Opcional
  "options": [                       // Opcional - Array de ComboOptionItemDto
    {
      "componentLineNum": "integer", // Requerido
      "groupCode": "string(50)",     // Requerido
      "itemCode": "string(50)",      // Requerido
      "itemName": "string(150)",     // Opcional
      "sizeCode": "string(50)",      // Opcional
      "isDefault": "Y/N",            // Requerido - Default: N
      "priceDiff": "decimal",        // Opcional - Default: 0
      "upLevel": "integer",          // Opcional - Default: 0
      "upLabel": "string(100)",      // Opcional
      "lineNum": "integer",          // Opcional - Default: 0
      "displayOrder": "integer",     // Opcional - Default: 0
      "available": "Y/N"             // Opcional - Default: Y
    }
  ]
}
```

---

#### ComboUpdateDto (Input - Actualizar)

Usado en: `PUT /api/Combos/{comboCode}`

> ⚠️ **No permite cambiar:** `ItemCode`, `IsCombo`

```json
{
  "itemName": "string(150)",         // Requerido
  "frgnName": "string(150)",         // Opcional
  "price": "decimal",                // Requerido
  "discount": "decimal(0-100)",      // Opcional
  "imageUrl": "string(255)",         // Opcional
  "description": "string(255)",      // Opcional
  "frgnDescription": "string(255)",  // Opcional
  "groupItemCode": "string(50)",     // Opcional
  "categoryItemCode": "string(50)",  // Opcional
  "waitingTime": "string(50)",       // Opcional
  "rating": "decimal(0-5)",          // Opcional
  "available": "Y/N",                // Requerido - Default: Y
  "enabled": "Y/N"                   // Requerido - Default: Y
}
```

---

#### ComboOptionItemDto (Input - Crear Opción)

Usado en:
- Array `options` de `ComboCreateDto`
- `POST /api/Combos/{comboCode}/options`

```json
{
  "componentLineNum": "integer",     // Requerido - Línea del componente
  "groupCode": "string(50)",         // Requerido - Ej: BEBIDAS, PAPAS
  "itemCode": "string(50)",          // Requerido - Código del producto opción
  "itemName": "string(150)",         // Opcional - Nombre personalizado
  "sizeCode": "string(50)",          // Opcional - Ej: MED, LRG
  "isDefault": "Y/N",                // Requerido - Default: N
  "priceDiff": "decimal",            // Opcional - Default: 0
  "upLevel": "integer",              // Opcional - Default: 0
  "upLabel": "string(100)",          // Opcional - Ej: "Agrandar"
  "lineNum": "integer",              // Opcional - Default: 0
  "displayOrder": "integer",         // Opcional - Default: 0
  "available": "Y/N"                 // Opcional - Default: Y
}
```

---

#### ComboOptionUpdateDto (Input - Actualizar Opción)

Usado en: `PUT /api/Combos/{comboCode}/options/{optionCode}`

> ⚠️ **No permite cambiar:** `ComboItemCode`, `ComponentLineNum`, `GroupCode`, `ItemCode`

```json
{
  "itemName": "string(150)",         // Opcional - Nombre personalizado
  "sizeCode": "string(50)",          // Opcional
  "isDefault": "Y/N",                // Requerido - Default: N
  "priceDiff": "decimal",            // Opcional - Default: 0
  "upLevel": "integer",              // Opcional - Default: 0
  "upLabel": "string(100)",          // Opcional
  "lineNum": "integer",              // Opcional - Default: 0
  "displayOrder": "integer",         // Opcional - Default: 0
  "available": "Y/N"                 // Opcional - Default: Y
}
```

---

#### ComboResponseDto (Output)

Usado en: Respuestas de todos los endpoints GET de combos

```json
{
  "itemCode": "string",
  "itemName": "string",
  "frgnName": "string",
  "price": "decimal",
  "discount": "decimal",
  "imageUrl": "string",              // URL completa procesada
  "description": "string",
  "frgnDescription": "string",
  "groupItemCode": "string",
  "categoryItemCode": "string",
  "waitingTime": "string",
  "rating": "decimal",
  "isCombo": "Y",                    // Siempre Y para combos
  "available": "Y/N",
  "enabled": "Y/N",
  "sellItem": "Y/N",
  "options": [                       // Array de ComboOptionResponseDto
    {
      "optionCode": "integer",
      "comboItemCode": "string",
      "componentLineNum": "integer",
      "groupCode": "string",
      "itemCode": "string",
      "itemName": "string",
      "sizeCode": "string",
      "optionItemName": "string",    // Nombre del producto desde OITM
      "optionPrice": "decimal",      // Precio base del producto
      "priceDiff": "decimal",        // Diferencia de precio
      "finalPrice": "decimal",       // Calculado: basePrice + priceDiff
      "isDefault": "Y/N",
      "upLevel": "integer",
      "upLabel": "string",
      "lineNum": "integer",
      "displayOrder": "integer",
      "available": "Y/N",
      "imageUrl": "string",          // URL de imagen del producto opción
      "description": "string"        // Descripción del producto opción
    }
  ]
}
```

---

#### ComboOptionResponseDto (Output)

Usado en: Respuestas de endpoints de opciones

```json
{
  "optionCode": "integer",           // ID único de la opción
  "comboItemCode": "string",         // Código del combo
  "componentLineNum": "integer",
  "groupCode": "string",
  "itemCode": "string",              // Código del producto opción
  "itemName": "string",              // Nombre personalizado (si existe)
  "sizeCode": "string",
  "optionItemName": "string",        // Nombre del producto desde OITM
  "optionPrice": "decimal",          // Precio base del producto opción
  "priceDiff": "decimal",            // Diferencia de precio
  "finalPrice": "decimal",           // Calculado automáticamente
  "isDefault": "Y/N",
  "upLevel": "integer",
  "upLabel": "string",
  "lineNum": "integer",
  "displayOrder": "integer",
  "available": "Y/N",
  "imageUrl": "string",              // URL completa procesada
  "description": "string"
}
```

---

### DTOs de Variantes

#### VariantCreateDto (Input - Crear)

Usado en:
- `POST /api/Products/{productCode}/Variants`
- Array `variants` de `VariantBulkCreateDto`

```json
{
  "variantName": "string(150)",      // Requerido - Ej: "Coca Cola 500ml"
  "brandName": "string(100)",        // Opcional - Ej: "Coca Cola"
  "sizeCode": "string(50)",          // Opcional - Debe existir en OSZC
  "colorCode": "string(50)",         // Opcional - Debe existir en Colors
  "priceAdjustment": "decimal",      // Opcional - Default: 0
  "available": "Y/N"                 // Opcional - Default: Y
}
```

**Ejemplo:**

```json
{
  "variantName": "Coca Cola 500ml",
  "brandName": "Coca Cola",
  "sizeCode": "500ML",
  "colorCode": null,
  "priceAdjustment": 5.00,
  "available": "Y"
}
```

---

#### VariantBulkCreateDto (Input - Crear Múltiples)

Usado en: `POST /api/Products/{productCode}/Variants/bulk`

```json
{
  "variants": [
    // Array de VariantCreateDto
  ]
}
```

**Ejemplo:**

```json
{
  "variants": [
    {
      "variantName": "Coca Cola 500ml",
      "brandName": "Coca Cola",
      "sizeCode": "500ML",
      "priceAdjustment": 5.00,
      "available": "Y"
    },
    {
      "variantName": "Pepsi 750ml",
      "brandName": "Pepsi",
      "sizeCode": "750ML",
      "priceAdjustment": 8.00,
      "available": "Y"
    }
  ]
}
```

---

#### VariantUpdateDto (Input - Actualizar)

Usado en: `PUT /api/Products/{productCode}/Variants/{variantId}`

> ⚠️ **No permite cambiar:** `ItemCode`, `VariantID`

```json
{
  "variantName": "string(150)",      // Requerido
  "brandName": "string(100)",        // Opcional
  "sizeCode": "string(50)",          // Opcional
  "colorCode": "string(50)",         // Opcional
  "priceAdjustment": "decimal",      // Opcional - Default: 0
  "available": "Y/N"                 // Opcional - Default: Y
}
```

---

#### VariantResponseDto (Output)

Usado en: Respuestas de todos los endpoints GET de variantes

```json
{
  "variantID": "integer",            // ID único de la variante
  "itemCode": "string",              // Código del producto base
  "variantName": "string",
  "brandName": "string",
  "sizeCode": "string",
  "colorCode": "string",
  "priceAdjustment": "decimal",
  "available": "Y/N",
  "sizeName": "string",              // Desde OSZC (calculado)
  "colorName": "string",             // Desde Colors (calculado)
  "basePrice": "decimal",            // Precio del producto base (calculado)
  "finalPrice": "decimal"            // basePrice + priceAdjustment (calculado)
}
```

**Ejemplo:**

```json
{
  "variantID": 1,
  "itemCode": "GASEOSA",
  "variantName": "Coca Cola 500ml",
  "brandName": "Coca Cola",
  "sizeCode": "500ML",
  "colorCode": null,
  "priceAdjustment": 5.00,
  "available": "Y",
  "sizeName": "500 Mililitros",
  "colorName": null,
  "basePrice": 25.00,
  "finalPrice": 30.00
}
```

---

#### VariantBulkResponseDto (Output)

Usado en: `POST /api/Products/{productCode}/Variants/bulk`

```json
{
  "totalRequested": "integer",       // Total de variantes solicitadas
  "successfullyCreated": "integer",  // Creadas exitosamente
  "failed": "integer",               // Fallidas
  "createdVariants": [               // Array de VariantResponseDto
    {
      "variantID": 1,
      "itemCode": "GASEOSA",
      ...
    }
  ],
  "errors": [                        // Array de mensajes de error
    "Tamaño '999ML': no existe.",
    "Variante 'Pepsi 500ml': ya existe."
  ]
}
```

---

### DTOs de Productos

#### ProductCreateDto (Input - Crear)

Usado en: `POST /api/Products`

```json
{
  "itemCode": "string(50)",          // Requerido
  "eanCode": "string(50)",           // Requerido
  "itemName": "string(150)",         // Requerido
  "frgnName": "string(150)",         // Opcional
  "price": "decimal",                // Requerido
  "discount": "decimal(0-100)",      // Opcional
  "imageUrl": "string(255)",         // Opcional
  "description": "string(255)",      // Opcional
  "frgnDescription": "string(255)",  // Opcional
  "sellItem": "Y/N",                 // Requerido - Default: Y
  "available": "Y/N",                // Requerido - Default: Y
  "enabled": "Y/N",                  // Requerido - Default: Y
  "groupItemCode": "string(50)",     // Opcional
  "categoryItemCode": "string(50)",  // Opcional
  "waitingTime": "string(50)",       // Opcional
  "rating": "decimal(0-5)",          // Opcional
  "u_ProductType": "S/V/C",          // Opcional - Default: S
  "u_HasVariants": "Y/N",            // Opcional - Default: N
  "u_IsVariant": "Y/N",              // Opcional - Default: N
  "u_ParentItem": "string(50)"       // Opcional
}
```

---

#### ProductUpdateDto (Input - Actualizar)

Usado en: `PUT /api/Products/{productCode}`

Misma estructura que `ProductCreateDto`.

---

### Tabla Resumen de DTOs por Endpoint

| Endpoint | Método | DTO Input | DTO Output |
|----------|--------|-----------|------------|
| `/api/Combos` | GET | - | `ComboResponseDto[]` |
| `/api/Combos` | POST | `ComboCreateDto` | `ComboResponseDto` |
| `/api/Combos/{code}` | GET | - | `ComboResponseDto` |
| `/api/Combos/{code}` | PUT | `ComboUpdateDto` | `ComboResponseDto` |
| `/api/Combos/{code}` | DELETE | - | - |
| `/api/Combos/{code}/options` | GET | - | `ComboOptionResponseDto[]` |
| `/api/Combos/{code}/options` | POST | `ComboOptionItemDto` | `ComboOptionResponseDto` |
| `/api/Combos/{code}/options/{id}` | PUT | `ComboOptionUpdateDto` | `ComboOptionResponseDto` |
| `/api/Combos/{code}/options/{id}` | DELETE | - | - |
| `/api/Products/{code}/Variants` | GET | - | `VariantResponseDto[]` |
| `/api/Products/{code}/Variants` | POST | `VariantCreateDto` | `VariantResponseDto` |
| `/api/Products/{code}/Variants/bulk` | POST | `VariantBulkCreateDto` | `VariantBulkResponseDto` |
| `/api/Products/{code}/Variants/{id}` | GET | - | `VariantResponseDto` |
| `/api/Products/{code}/Variants/{id}` | PUT | `VariantUpdateDto` | `VariantResponseDto` |
| `/api/Products/{code}/Variants/{id}` | DELETE | - | - |
| `/api/Products` | POST | `ProductCreateDto` | `ProductDto` |
| `/api/Products/{code}` | PUT | `ProductUpdateDto` | `ProductDto` |

---

## 🔄 Workflows

### Workflow 1: Crear Producto Simple

**Paso 1:** Preparar datos del producto

```json
{
  "itemCode": "TACO001",
  "eanCode": "7501111222333",
  "itemName": "Taco de Asada",
  "price": 25.00,
  "u_ProductType": "S",
  "sellItem": "Y",
  "available": "Y",
  "enabled": "Y"
}
```

**Paso 2:** Enviar request

```http
POST /api/Products
```

**Paso 3:** Verificar respuesta `201 Created`

El producto aparecerá inmediatamente en `GET /api/Products/available`

---

### Workflow 2: Crear Combo Completo

Este es el flujo recomendado para crear combos desde la web.

**Paso 1:** Asegurarse que los productos opciones existen

Antes de crear el combo, todos los productos que serán opciones deben existir.

```http
GET /api/Products/COCA350
GET /api/Products/COCA500
GET /api/Products/FRIES_MED
GET /api/Products/FRIES_LRG
```

**Paso 2:** Preparar estructura del combo

```json
{
  "itemCode": "COMBO_MEGA",
  "itemName": "Mega Combo",
  "price": 150.00,
  "groupItemCode": "COMBOS",
  "categoryItemCode": "FOOD",
  "options": [
    {
      "componentLineNum": 1,
      "groupCode": "BEBIDAS",
      "itemCode": "COCA350",
      "isDefault": "Y",
      "priceDiff": 0,
      "displayOrder": 1
    },
    {
      "componentLineNum": 1,
      "groupCode": "BEBIDAS",
      "itemCode": "COCA500",
      "isDefault": "N",
      "priceDiff": 5.00,
      "upLevel": 1,
      "upLabel": "Agrandar",
      "displayOrder": 2
    }
  ]
}
```

**Paso 3:** Enviar POST

```http
POST /api/Combos
```

**Paso 4:** Verificar respuesta `201 Created`

El combo y todas sus opciones se crean en una sola transacción.

**Paso 5:** Obtener combo creado

```http
GET /api/Combos/COMBO_MEGA
```

Verificar que todas las opciones se crearon correctamente.

---

### Workflow 3: Agregar Opción a Combo Existente

**Paso 1:** Verificar que el combo existe

```http
GET /api/Combos/COMBO_MEGA
```

**Paso 2:** Verificar que el producto opción existe

```http
GET /api/Products/SPRITE350
```

**Paso 3:** Agregar la nueva opción

```http
POST /api/Combos/COMBO_MEGA/options
```

```json
{
  "componentLineNum": 1,
  "groupCode": "BEBIDAS",
  "itemCode": "SPRITE350",
  "isDefault": "N",
  "priceDiff": 0,
  "displayOrder": 3
}
```

---

### Workflow 4: Mostrar Combos en la Web

#### Paso 1: Obtener combos

```http
GET /api/Combos
```

#### Paso 2: Agrupar opciones por GroupCode (JavaScript)

```javascript
function groupComboOptions(combo) {
  const grouped = {};

  combo.options.forEach(option => {
    const group = option.groupCode;
    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push(option);
  });

  return grouped;
}

// Uso:
const groupedOptions = groupComboOptions(combo);
// Resultado:
// {
//   "BEBIDAS": [...],
//   "PAPAS": [...],
//   "SALSAS": [...]
// }
```

#### Paso 3: Renderizar UI

```html
<div class="combo">
  <h2>Mega Combo - $150.00</h2>

  <!-- Grupo de Bebidas -->
  <div class="option-group">
    <h3>Elige tu bebida:</h3>
    <div class="options">
      <label>
        <input type="radio" name="bebida" value="COCA350" checked>
        Coca Cola 350ml (Incluido)
      </label>
      <label>
        <input type="radio" name="bebida" value="COCA500">
        Coca Cola 500ml (+$5.00 - Agrandar)
      </label>
    </div>
  </div>

  <!-- Grupo de Papas -->
  <div class="option-group">
    <h3>Elige tus papas:</h3>
    <div class="options">
      <label>
        <input type="radio" name="papas" value="FRIES_MED" checked>
        Papas Medianas (Incluido)
      </label>
      <label>
        <input type="radio" name="papas" value="FRIES_LRG">
        Papas Grandes (+$10.00 - Agrandar)
      </label>
    </div>
  </div>
</div>
```

#### Paso 4: Calcular precio total

```javascript
function calculateComboPrice(combo, selectedOptions) {
  let total = combo.price;

  selectedOptions.forEach(optionCode => {
    const option = combo.options.find(o => o.optionCode === optionCode);
    if (option) {
      total += option.priceDiff;
    }
  });

  return total;
}

// Ejemplo:
const selectedOptions = [2, 5]; // COCA500 + FRIES_LRG
const finalPrice = calculateComboPrice(combo, selectedOptions);
// finalPrice = 150.00 + 5.00 + 10.00 = 165.00
```

---

## 📊 Modelos de Datos

### Tipos de Producto (U_ProductType)

| Valor | Descripción |
|-------|-------------|
| `S` | **Simple** - Producto estándar sin variantes ni opciones |
| `V` | **Variable** - Producto con variantes (ej: tallas, colores) |
| `C` | **Combo** - Producto con opciones configurables |

---

### Campos Y/N (boolean-like)

Estos campos usan `"Y"` o `"N"` en lugar de `true`/`false`:

- `SellItem` - Disponible para venta
- `Available` - Disponible
- `Enabled` - Habilitado
- `IsDefault` - Opción por defecto
- `IsCombo` - Es combo
- `U_HasVariants` - Tiene variantes
- `U_IsVariant` - Es variante

---

### Conceptos de Combos

| Concepto | Descripción |
|----------|-------------|
| **ComponentLineNum** | Relaciona la opción con un componente del ProductTree (receta). Ejemplo: 1=bebida, 2=papas, 3=hamburguesa |
| **GroupCode** | Agrupa opciones relacionadas. Todas las bebidas tienen el mismo GroupCode (ej: "BEBIDAS") |
| **PriceDiff** | Diferencia de precio respecto al precio base del combo. Puede ser negativa (descuento) |
| **FinalPrice** | Calculado automáticamente: `precioBaseCombo + priceDiff` |
| **UpLevel** | Nivel de mejora: 0=normal, 1+=upgrade |
| **UpLabel** | Texto para mostrar mejora (ej: "Agrandar bebida", "Premium") |
| **DisplayOrder** | Orden de visualización. Menor número aparece primero |
| **IsDefault** | Opción pre-seleccionada en la UI. Debe haber una por grupo |

---

## ⚠️ Manejo de Errores

### 400 Bad Request

**Descripción:** Datos de entrada inválidos

**Causas comunes:**
- Campos requeridos faltantes
- Formato incorrecto (ej: precio negativo)
- Valores fuera de rango
- Expresiones regulares no coinciden (ej: Available debe ser Y o N)

**Ejemplo:**

```json
{
  "message": "Validation failed",
  "errors": {
    "ItemName": ["El nombre del artículo es requerido."],
    "Price": ["El precio debe ser un valor positivo."],
    "Available": ["Available solo puede ser 'Y' o 'N'."]
  }
}
```

**Solución:** Revisar el error detallado y corregir los datos.

---

### 404 Not Found

**Descripción:** Recurso no encontrado

**Causas comunes:**
- Código de producto/combo no existe
- Producto opción no existe al crear combo
- OptionCode inválido

**Ejemplo:**

```json
{
  "message": "No se encontró ningún producto con el código: PROD999."
}
```

**Solución:** Verificar que el código existe antes de hacer la operación.

---

### 409 Conflict

**Descripción:** Conflicto - el recurso ya existe

**Causas comunes:**
- ItemCode duplicado al crear producto
- Opción duplicada en combo (mismo GroupCode + ItemCode + ComponentLineNum)

**Ejemplo:**

```json
{
  "message": "Ya existe un producto con el ItemCode: COMBO001"
}
```

**Solución:** Usar códigos únicos o actualizar el recurso existente con PUT.

---

### 500 Internal Server Error

**Descripción:** Error interno del servidor

**Causas comunes:**
- Error de base de datos
- Relaciones de FK inválidas
- Campos NULL cuando son requeridos

**Ejemplo:**

```json
{
  "message": "Error al obtener combos",
  "error": "SqlNullValueException: Data is Null",
  "stackTrace": "..."
}
```

**Solución:** Revisar logs del servidor, verificar que FKs existan, contactar soporte.

---

## 🎯 Best Practices

### Para Aplicaciones Web

#### 1. Cachear productos y combos

Los productos cambian poco, considerar cache de 5-10 minutos.

```javascript
// Ejemplo con localStorage
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

async function getCachedProducts() {
  const cached = localStorage.getItem('products');
  const cacheTime = localStorage.getItem('products_time');

  if (cached && cacheTime) {
    const age = Date.now() - parseInt(cacheTime);
    if (age < CACHE_DURATION) {
      return JSON.parse(cached);
    }
  }

  // Cache expirado o no existe
  const response = await fetch('/api/Products/available');
  const products = await response.json();

  localStorage.setItem('products', JSON.stringify(products));
  localStorage.setItem('products_time', Date.now().toString());

  return products;
}
```

**Recomendación:** Usar `GET /api/Products/available` para catálogo público.

---

#### 2. Validar existencia antes de crear

Antes de crear combos, verificar que productos opciones existen.

```javascript
async function validateProductsExist(itemCodes) {
  const promises = itemCodes.map(code =>
    fetch(`/api/Products/${code}`)
      .then(r => ({ code, exists: r.ok }))
  );

  const results = await Promise.all(promises);
  const missing = results.filter(r => !r.exists);

  if (missing.length > 0) {
    throw new Error(`Productos no encontrados: ${missing.map(r => r.code).join(', ')}`);
  }
}

// Uso antes de crear combo:
await validateProductsExist(['COCA350', 'COCA500', 'FRIES_MED']);
```

---

#### 3. Manejar imágenes correctamente

La API retorna URLs completas, usar directamente en `<img src>`.

```html
<!-- ✅ CORRECTO -->
<img src="{{product.imageUrl}}" alt="{{product.itemName}}">

<!-- ❌ INCORRECTO - No concatenar base URL -->
<img src="https://api.example.com{{product.imageUrl}}">
```

---

#### 4. Agrupar opciones de combo en UI

```javascript
function renderComboGroups(combo) {
  const grouped = groupComboOptions(combo);

  return Object.entries(grouped).map(([groupCode, options]) => `
    <div class="option-group">
      <h3>Elige tu ${groupCode.toLowerCase()}:</h3>
      ${options.map(option => `
        <label>
          <input type="radio"
                 name="${groupCode}"
                 value="${option.itemCode}"
                 ${option.isDefault === 'Y' ? 'checked' : ''}>
          ${option.optionItemName}
          ${option.priceDiff > 0 ? `(+$${option.priceDiff.toFixed(2)} - ${option.upLabel || 'Upgrade'})` : '(Incluido)'}
        </label>
      `).join('')}
    </div>
  `).join('');
}
```

---

#### 5. Mostrar precios finales

```javascript
function formatOptionPrice(option, basePrice) {
  if (option.priceDiff === 0) {
    return '(Incluido)';
  } else if (option.priceDiff > 0) {
    const label = option.upLabel || 'Upgrade';
    return `(+$${option.priceDiff.toFixed(2)} - ${label})`;
  } else {
    return `(-$${Math.abs(option.priceDiff).toFixed(2)})`;
  }
}
```

---

#### 6. Respetar DisplayOrder

Ordenar opciones correctamente:

```javascript
function sortComboOptions(options) {
  return options.sort((a, b) => {
    // 1. Por GroupCode
    if (a.groupCode !== b.groupCode) {
      return a.groupCode.localeCompare(b.groupCode);
    }
    // 2. Por DisplayOrder
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    // 3. Por LineNum
    return a.lineNum - b.lineNum;
  });
}
```

---

#### 7. Indicar opción por defecto

Pre-seleccionar opciones donde `IsDefault='Y'`:

```javascript
function getDefaultOptions(combo) {
  const defaults = {};
  combo.options.forEach(option => {
    if (option.isDefault === 'Y') {
      defaults[option.groupCode] = option.itemCode;
    }
  });
  return defaults;
}
```

---

### Tips de Performance

1. **Usar paginación** en listados grandes
   ```http
   GET /api/Products?pageSize=20
   ```

2. **Filtrar por categoría/grupo** para reducir resultados
   ```http
   GET /api/Products/Categories/FOOD
   ```

3. **Comprimir imágenes** antes de subirlas (la API solo almacena URLs)

4. **Usar GET /api/Combos solo cuando sea necesario** (incluye todas las opciones, puede ser pesado)

---

### Recomendaciones de Seguridad

1. ✅ Validar entradas en frontend antes de enviar
2. ✅ No exponer códigos internos sensibles al público
3. ✅ Implementar rate limiting en producción
4. ✅ Sanitizar inputs para prevenir XSS/SQL injection
5. ✅ Usar HTTPS en producción
6. ✅ Implementar autenticación/autorización según necesidad

---

## 📞 Soporte

- **Email:** support@example.com
- **Documentación:** https://docs.example.com
- **API Status:** https://status.example.com

---

## 📝 Changelog

### Versión 1.0.0 (2025-10-01)

- ✅ Documentación inicial de API
- ✅ Endpoints de productos y combos
- ✅ Workflows y best practices
- ✅ Ejemplos completos de integración

---

## 📄 Licencia

© 2025 Blue Self Checkout. Todos los derechos reservados.
