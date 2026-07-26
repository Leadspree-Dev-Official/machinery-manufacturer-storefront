/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  specifications: Record<string, string>;
  isTopSeller: boolean;
}

export interface CustomerInfo {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  gstin?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CustomMachineDetails {
  baseModelId: string;
  baseModelName: string;
  chassis: string;
  powerUnit: string;
  controlSystem: string;
  addedFeatures: string[];
  totalWeightKg: number;
  totalPrice: number;
  materialsBreakdown: { material: string; percentage: number }[];
}

export type OrderStatus = 'Received' | 'Preparing' | 'Quality Check' | 'Out for Delivery' | 'Completed';

export interface Order {
  id: string;
  visitorToken: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  customMachine: CustomMachineDetails | null;
  totalPrice: number;
  orderDate: string;
  status: OrderStatus;
  notes: string;
  paymentMethod: string;
  deliveryMethod: string;
}

export interface Specialist {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  contact: string;
}

export interface BusinessConfig {
  businessName: string;
  tagline: string;
  operatingHours: string;
  email: string;
  phone: string;
  address: string;
  accentColor: string;
}

export interface AppContent {
  products: Product[];
  specialists: Specialist[];
  config: BusinessConfig;
}
