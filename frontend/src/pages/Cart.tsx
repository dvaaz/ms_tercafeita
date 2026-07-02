import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/shared/Toast/useToast';
import { formatPrice } from '../mappers';
import { TrashIcon, CartIcon, TruckIcon } from '../components/shared/Icons';
import styles from './Cart.module.css';

const FREE_SHIPPING_THRESHOLD = 299;
const SHIPPING_COST = 15;

export default function Cart() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const handleUpdateItem = async (itemId: string, qty: number) => {
    try {
      await updateItem(itemId, qty);
    } catch {
      toastError('Erro ao atualizar quantidade');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
      success('Item removido do carrinho');
    } catch {
      toastError('Erro ao remover item');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
        <p>Carregando carrinho...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className={styles.emptyPage}>
        <div className={styles.emptyIcon}><CartIcon size={64} /></div>
        <h2>Seu carrinho está vazio</h2>
        <p>Adicione produtos para continuar</p>
        <Link to="/" className={styles.continueBtn}>Ver Produtos</Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>
          Carrinho <span className={styles.itemCount}>{cart.items.length} {cart.items.length === 1 ? 'item' : 'itens'}</span>
        </h1>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.items}>
            {cart.items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImage}>
                  <img
                    src={`https://placehold.co/80x80/141414/888?text=${item.size}`}
                    alt=""
                  />
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemId}>#{item.productId.substring(0, 8).toUpperCase()}</p>
                  <p className={styles.itemSize}>Tamanho: <strong>{item.size}</strong></p>
                  <p className={styles.itemPrice}>{formatPrice(item.priceAtAdd)} cada</p>
                </div>
                <div className={styles.qtyControl}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => handleUpdateItem(item.id, Math.max(1, item.quantity - 1))}
                    disabled={item.quantity <= 1}
                  >−</button>
                  <span className={styles.qty}>{item.quantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => handleUpdateItem(item.id, item.quantity + 1)}
                  >+</button>
                </div>
                <div className={styles.itemTotal}>
                  {formatPrice(item.priceAtAdd * item.quantity)}
                </div>
                <button className={styles.removeBtn} onClick={() => handleRemoveItem(item.id)}>
                  <TrashIcon size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Resumo do Pedido</h3>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.shippingLabel}>
                  <TruckIcon size={16} /> Frete
                </span>
                <span className={shipping === 0 ? styles.freeShipping : ''}>
                  {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className={styles.shippingHint}>
                  Frete grátis para compras acima de {formatPrice(FREE_SHIPPING_THRESHOLD)}
                </p>
              )}
              <div className={styles.divider} />
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>

            {user ? (
              <button className={styles.checkoutBtn} onClick={() => navigate('/checkout')}>
                Finalizar Compra
              </button>
            ) : (
              <>
                <p className={styles.loginHint}>Faça login para finalizar sua compra</p>
                <Link to="/login" className={styles.checkoutBtn}>
                  Entrar para Comprar
                </Link>
              </>
            )}

            <Link to="/" className={styles.continueShopping}>
              ← Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
