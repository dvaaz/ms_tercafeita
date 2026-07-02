import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listOrders } from '../services/order.service';
import { formatPrice, formatDate } from '../mappers';
import CollapsibleCard from '../components/shared/CollapsibleCard/CollapsibleCard';
import { PackageIcon } from '../components/shared/Icons';
import type { Order } from '../types';
import styles from './Orders.module.css';

const STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const STATUS_COLOR: Record<Order['status'], string> = {
  pending: styles.statusPending,
  confirmed: styles.statusConfirmed,
  shipped: styles.statusShipped,
  delivered: styles.statusDelivered,
  cancelled: styles.statusCancelled,
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Meus Pedidos</h1>
          <Link to="/" className={styles.shopLink}>Continuar Comprando →</Link>
        </div>

        {orders.length === 0 ? (
          <div className={styles.empty}>
            <PackageIcon size={64} />
            <h2>Nenhum pedido ainda</h2>
            <p>Seus pedidos aparecerão aqui após a compra.</p>
            <Link to="/" className={styles.startBtn}>Ver Produtos</Link>
          </div>
        ) : (
          <div className={styles.orders}>
            {orders.map((order) => (
              <CollapsibleCard
                key={order.id}
                defaultOpen={false}
                title={
                  <span className={styles.orderId}>
                    Pedido #{order.id.substring(0, 8).toUpperCase()}
                  </span>
                }
                subtitle={formatDate(order.createdAt)}
                badge={
                  <span className={`${styles.status} ${STATUS_COLOR[order.status]}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                }
              >
                <div className={styles.orderBody}>
                  {/* Items */}
                  <div className={styles.itemsTable}>
                    <div className={styles.tableHeader}>
                      <span>Produto</span>
                      <span>Tamanho</span>
                      <span>Qtd</span>
                      <span>Valor</span>
                    </div>
                    {order.items.map((item) => (
                      <div key={item.id} className={styles.tableRow}>
                        <span className={styles.productName}>{item.productName}</span>
                        <span className={styles.size}>{item.size}</span>
                        <span className={styles.qty}>× {item.quantity}</span>
                        <span className={styles.value}>{formatPrice(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className={styles.orderFooter}>
                    <div className={styles.addressInfo}>
                      <p className={styles.addressLabel}>Endereço de entrega</p>
                      <p className={styles.addressText}>
                        {order.shippingAddress.street}, {order.shippingAddress.city} — {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                    </div>
                    {order.payment && (
                      <div className={styles.paymentInfo}>
                        <p className={styles.addressLabel}>Pagamento</p>
                        <p className={styles.addressText}>
                          {order.payment.methodLabel}
                          {order.payment.installments > 1 && ` · ${order.payment.installments}× de ${formatPrice(order.payment.installmentValue)}`}
                          <span className={styles.paymentStatus}> · {order.payment.status}</span>
                        </p>
                      </div>
                    )}
                    <div className={styles.orderTotal}>
                      <span>Total</span>
                      <strong className={styles.totalValue}>{formatPrice(order.totalAmount)}</strong>
                    </div>
                  </div>
                </div>
              </CollapsibleCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
