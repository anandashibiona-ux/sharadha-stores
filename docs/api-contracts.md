# API Contracts — Sharadha Stores Cart & Checkout

Base URL: `http://localhost:3001/api`

---

## Products

### GET /products
Lists all active products.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `search` | string | Case-insensitive name/description search |
| `category` | string | Filter by exact category |
| `inStock` | `"true"` | Only return in-stock products |

**Response 200:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Homemade Mango Pickle",
      "slug": "homemade-mango-pickle",
      "description": "...",
      "shortDescription": "...",
      "price": "220.00",
      "imageUrl": "https://...",
      "category": "Pickles",
      "stockQuantity": 48,
      "lowStockThreshold": 8,
      "isActive": true,
      "stockStatus": "in_stock",
      "createdAt": "2024-06-19T..."
    }
  ],
  "categories": ["Pickles", "Snacks", "Sweets"]
}
```

---

### GET /products/:id
Single product by UUID or slug.

**Response 200:** Product object (with `stockStatus`)
**Response 404:** `{ "error": "Product not found" }`

---

## Cart

All cart routes use a `sessionId` (UUID stored in localStorage) to identify the guest cart.

### GET /cart/:sessionId
**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid",
      "quantity": 2,
      "product": { "id": "...", "name": "...", "price": 220, "imageUrl": "...", "stockQuantity": 46, "stockStatus": "in_stock" },
      "lineTotal": 440
    }
  ],
  "subtotal": 440,
  "deliveryFee": 50,
  "total": 490,
  "itemCount": 2
}
```

### POST /cart/:sessionId/items
```json
{ "productId": "uuid", "quantity": 1 }
```
**Response 200:** Updated cart object
**Response 404:** Product not found
**Response 409:** Insufficient stock

### PATCH /cart/:sessionId/items/:itemId
```json
{ "quantity": 3 }
```
**Response 200:** Updated cart object

### DELETE /cart/:sessionId/items/:itemId
**Response 200:** Updated cart object

### DELETE /cart/:sessionId
**Response 200:** `{ "message": "Cart cleared" }`

---

## Orders

### POST /orders
Place an order atomically (decrements stock + clears cart in one transaction).

```json
{
  "sessionId": "uuid",
  "customer": {
    "name": "Priya Sharma",
    "phone": "9876543210",
    "email": "priya@example.com",
    "addressLine1": "12, Gandhi Street",
    "addressLine2": "Near Temple",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600001",
    "deliveryNotes": "Ring the bell"
  },
  "deliveryOption": "standard"
}
```

**Response 201:** Full order object including `orderNumber` (e.g. `SS-20240619-A3F2`)
**Response 400:** Empty cart or validation error
**Response 409:** Insufficient stock for one or more items

### GET /orders/:orderNumber
Customer-facing order status lookup.

**Response 200:** Order with `customer`, `orderItems` (including product image snapshot)
**Response 404:** Order not found

---

## Admin (requires `x-admin-key` header)

### GET /admin/orders
**Query params:** `status`, `date` (YYYY-MM-DD), `page`, `limit`

**Response 200:**
```json
{
  "orders": [...],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

### PATCH /admin/orders/:id/status
```json
{ "status": "CONFIRMED" }
```
Valid statuses: `PENDING`, `CONFIRMED`, `DISPATCHED`, `DELIVERED`, `CANCELLED`
Note: Setting to `CANCELLED` automatically restores stock.

**Response 200:** Updated order

### GET /admin/stock
**Response 200:** `{ "products": [...with stockStatus] }`

### PATCH /admin/stock/:productId
```json
{ "quantity": 50 }
```
**Response 200:** Updated product

---

## Error Responses

All errors follow this shape:
```json
{ "error": "Human-readable message" }
```
Validation errors:
```json
{
  "error": "Validation failed",
  "details": [{ "field": "phone", "message": "Enter a valid 10-digit Indian mobile number" }]
}
```
