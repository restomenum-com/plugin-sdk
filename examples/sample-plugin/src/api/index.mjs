// Callback API kullanım örnekleri — her uç için bir fonksiyon (bir @restomenum/plugin-sdk RestomenumClient
// örneğiyle çağrılır). Kaynak-bazlı gruplanmış (SDK client yapısını aynalar). Örnek:
//   import { api } from './api/index.mjs';
//   const client = new RestomenumClient({ apiKey, baseUrl });
//   const packet = await api.packets.getPacket(client, packetId);
import { listOpenPackets } from './packets/listOpenPackets.mjs';
import { getPacket } from './packets/getPacket.mjs';
import { createPacket } from './packets/createPacket.mjs';
import { updatePacket } from './packets/updatePacket.mjs';
import { updatePacketOrders } from './packets/updatePacketOrders.mjs';
import { updatePacketPayments } from './packets/updatePacketPayments.mjs';

import { listOpenTables } from './tables/listOpenTables.mjs';
import { getTable } from './tables/getTable.mjs';
import { getTableLayout } from './tables/getTableLayout.mjs';
import { updateTableOrders } from './tables/updateTableOrders.mjs';
import { updateTablePayments } from './tables/updateTablePayments.mjs';

import { listProducts } from './products/listProducts.mjs';
import { getProduct } from './products/getProduct.mjs';
import { createProduct } from './products/createProduct.mjs';
import { updateProduct } from './products/updateProduct.mjs';
import { deleteProduct } from './products/deleteProduct.mjs';

import { listCategories } from './categories/listCategories.mjs';
import { getCategory } from './categories/getCategory.mjs';
import { createCategory } from './categories/createCategory.mjs';
import { updateCategory } from './categories/updateCategory.mjs';
import { deleteCategory } from './categories/deleteCategory.mjs';

import { listPaymentMethods } from './paymentMethods/listPaymentMethods.mjs';
import { createPaymentMethod } from './paymentMethods/createPaymentMethod.mjs';
import { updatePaymentMethod } from './paymentMethods/updatePaymentMethod.mjs';
import { deletePaymentMethod } from './paymentMethods/deletePaymentMethod.mjs';

import { listIngredients } from './ingredients/listIngredients.mjs';
import { createIngredient } from './ingredients/createIngredient.mjs';
import { updateIngredient } from './ingredients/updateIngredient.mjs';
import { deleteIngredient } from './ingredients/deleteIngredient.mjs';

import { listCustomers } from './customers/listCustomers.mjs';
import { getCustomer } from './customers/getCustomer.mjs';

import { getUsers } from './users/getUsers.mjs';

import { createPurchase } from './purchases/createPurchase.mjs';
import { getPurchase } from './purchases/getPurchase.mjs';
import { listPurchases } from './purchases/listPurchases.mjs';

export const api = {
  packets: { listOpenPackets, getPacket, createPacket, updatePacket, updatePacketOrders, updatePacketPayments },
  tables: { listOpenTables, getTable, getTableLayout, updateTableOrders, updateTablePayments },
  products: { listProducts, getProduct, createProduct, updateProduct, deleteProduct },
  categories: { listCategories, getCategory, createCategory, updateCategory, deleteCategory },
  paymentMethods: { listPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod },
  ingredients: { listIngredients, createIngredient, updateIngredient, deleteIngredient },
  customers: { listCustomers, getCustomer },
  users: { getUsers },
  purchases: { createPurchase, getPurchase, listPurchases },
};
