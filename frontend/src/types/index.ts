export interface User {
  id: string;
  email: string;
  name: string;
  nome?: string;
  role: 'admin' | 'user' | 'customer';
  createdAt: string;
}

export interface ProductSize {
  id: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sizes: ProductSize[];
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product?: Product;
  size: string;
  quantity: number;
  priceAtAdd: number;
}

export interface Cart {
  id: string;
  userId: string | null;
  items: CartItem[];
  total: number;
}

export interface Address {
  street: string;
  number?: string;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface SavedAddress extends Address {
  id: string;
  label: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentMethodId = 2 | 3 | 4; // 2=PIX, 3=BOLETO, 4=CARTAO_CREDITO

export interface PaymentInfo {
  methodId: PaymentMethodId;
  installments?: number;
  code?: string;
}

export interface OrderPayment {
  id: string;
  methodLabel: string;
  installments: number;
  installmentValue: number;
  code: string;
  status: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  payment: OrderPayment | null;
  createdAt: string;
  updatedAt: string;
}

export interface Resposta {
  id: number;
  id_avaliacao?: number;
  comentario: string;
  criadoEm: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: string;
  user?: { name: string };
  nota: number;
  rating: number;
  titulo?: string | null;
  comentario?: string | null;
  comment?: string | null;
  curtidas: number;
  respostas: Resposta[];
  createdAt: string;
  criadoEm?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
