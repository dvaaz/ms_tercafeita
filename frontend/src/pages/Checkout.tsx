import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createOrder } from '../services/order.service';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/shared/Toast/useToast';
import { formatPrice } from '../mappers';
import { MapPinIcon, PlusIcon, CheckIcon } from '../components/shared/Icons';
import InputField from '../components/shared/InputField/InputField';
import Button from '../components/shared/Button/Button';
import { useAuth } from '../contexts/AuthContext';
import type { SavedAddress, PaymentMethodId } from '../types';
import styles from './Checkout.module.css';

const FREE_SHIPPING_THRESHOLD = 299;
const SHIPPING_COST = 15;

function storageKey(userId?: string | null): string {
  return `shirtstore:addresses:${userId ?? 'guest'}`;
}

const PAYMENT_METHODS: { id: PaymentMethodId; label: string; icon: string; description: string }[] = [
  { id: 2, label: 'PIX', icon: '⚡', description: 'Aprovação instantânea' },
  { id: 4, label: 'Cartão de Crédito', icon: '💳', description: 'Até 12×' },
  { id: 3, label: 'Boleto', icon: '📄', description: 'Vencimento em 3 dias úteis' },
];

function formatCardNumber(value: string): string {
  return value.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').substring(0, 4);
  if (digits.length >= 3) return digits.substring(0, 2) + '/' + digits.substring(2);
  return digits;
}

function loadAddresses(key: string): SavedAddress[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as SavedAddress[];
  } catch {
    return [];
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethodId>(2);
  const [installments, setInstallments] = useState(1);

  const [card, setCard] = useState({ number: '', holder: '', expiry: '', cvv: '' });

  const [addrForm, setAddrForm] = useState({
    label: '', street: '', number: '', complement: '',
    city: '', state: '', zipCode: '', country: 'Brasil',
  });

  useEffect(() => {
    const key = storageKey(user?.id);
    const addresses = loadAddresses(key);
    setSavedAddresses(addresses);
    setSelectedId(null);
    if (addresses.length === 0) setShowForm(true);
    else { setShowForm(false); setSelectedId(addresses[0].id); }
  }, [user?.id]);

  const setAddr = (field: keyof typeof addrForm) => (e: ChangeEvent<HTMLInputElement>) =>
    setAddrForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setCardField = (field: keyof typeof card) => (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (field === 'number') val = formatCardNumber(val);
    if (field === 'expiry') val = formatExpiry(val);
    if (field === 'cvv') val = val.replace(/\D/g, '').substring(0, 4);
    setCard((prev) => ({ ...prev, [field]: val }));
  };

  const handleCepBlur = async () => {
    const cep = addrForm.zipCode.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json() as { logradouro?: string; localidade?: string; uf?: string; erro?: boolean };
      if (!data.erro) {
        setAddrForm((prev) => ({
          ...prev,
          street: data.logradouro ?? prev.street,
          city: data.localidade ?? prev.city,
          state: data.uf ?? prev.state,
        }));
      }
    } catch { /* ignore */ } finally {
      setCepLoading(false);
    }
  };

  const handleSaveAddress = () => {
    if (!addrForm.street || !addrForm.city || !addrForm.state || !addrForm.zipCode) {
      toastError('Preencha todos os campos obrigatórios');
      return;
    }
    const newAddr: SavedAddress = { ...addrForm, id: crypto.randomUUID() };
    const updated = [...savedAddresses, newAddr];
    setSavedAddresses(updated);
    localStorage.setItem(storageKey(user?.id), JSON.stringify(updated));
    setSelectedId(newAddr.id);
    setShowForm(false);
    setAddrForm({ label: '', street: '', number: '', complement: '', city: '', state: '', zipCode: '', country: 'Brasil' });
    success('Endereço salvo!');
  };

  const validateCard = (): boolean => {
    if (card.number.replace(/\s/g, '').length < 16) { toastError('Número do cartão inválido'); return false; }
    if (!card.holder.trim()) { toastError('Informe o nome do titular'); return false; }
    if (card.expiry.length < 5) { toastError('Data de validade inválida'); return false; }
    if (card.cvv.length < 3) { toastError('CVV inválido'); return false; }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId) { toastError('Selecione ou cadastre um endereço de entrega'); return; }
    if (paymentMethodId === 4 && !validateCard()) return;

    const addr = savedAddresses.find((a) => a.id === selectedId);
    if (!addr) return;

    const last4 = card.number.replace(/\s/g, '').slice(-4);
    const paymentCode = paymentMethodId === 4 ? `CARD-****-${last4}` : undefined;

    setLoading(true);
    try {
      await createOrder(
        {
          street: `${addr.street}${addr.number ? ', ' + addr.number : ''}`,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zipCode,
          country: addr.country,
        },
        {
          methodId: paymentMethodId,
          installments: paymentMethodId === 4 ? installments : 1,
          code: paymentCode,
        },
      );
      await fetchCart();
      success('Pedido realizado com sucesso!');
      navigate('/orders');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toastError(msg ?? 'Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Seu carrinho está vazio.</p>
        <Link to="/cart" className={styles.backLink}>Voltar ao Carrinho</Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const installmentValue = paymentMethodId === 4 && installments > 1 ? total / installments : total;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Finalizar Compra</h1>

        <form onSubmit={handleSubmit} className={styles.layout}>
          <div className={styles.main}>
            {/* Endereço */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <MapPinIcon size={20} />
                <h2 className={styles.sectionTitle}>Endereço de Entrega</h2>
              </div>

              {savedAddresses.length > 0 && (
                <div className={styles.addresses}>
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      className={`${styles.addrCard} ${selectedId === addr.id ? styles.addrCardSelected : ''}`}
                      onClick={() => { setSelectedId(addr.id); setShowForm(false); }}
                    >
                      {selectedId === addr.id && (
                        <span className={styles.addrCheck}><CheckIcon size={14} /></span>
                      )}
                      <p className={styles.addrLabel}>{addr.label || 'Endereço'}</p>
                      <p className={styles.addrLine}>{addr.street}{addr.number ? `, ${addr.number}` : ''}</p>
                      <p className={styles.addrLine}>{addr.city} — {addr.state}, {addr.zipCode}</p>
                    </button>
                  ))}
                </div>
              )}

              <button type="button" className={styles.addAddrBtn} onClick={() => setShowForm((v) => !v)}>
                <PlusIcon size={16} /> Novo Endereço
              </button>

              {showForm && (
                <div className={styles.addrForm}>
                  <InputField label="Apelido (ex: Casa, Trabalho)" placeholder="Casa" value={addrForm.label} onChange={setAddr('label')} />
                  <InputField label="CEP *" placeholder="00000-000" value={addrForm.zipCode} onChange={setAddr('zipCode')} onBlur={handleCepBlur} disabled={cepLoading} />
                  <div className={styles.row}>
                    <InputField label="Rua / Logradouro *" placeholder="Rua das Flores" value={addrForm.street} onChange={setAddr('street')} />
                    <InputField label="Número" placeholder="123" value={addrForm.number} onChange={setAddr('number')} style={{ maxWidth: 120 }} />
                  </div>
                  <InputField label="Complemento" placeholder="Apto 42" value={addrForm.complement} onChange={setAddr('complement')} />
                  <div className={styles.row}>
                    <InputField label="Cidade *" placeholder="São Paulo" value={addrForm.city} onChange={setAddr('city')} />
                    <InputField label="Estado *" placeholder="SP" value={addrForm.state} onChange={setAddr('state')} maxLength={2} style={{ maxWidth: 80 }} />
                  </div>
                  <Button type="button" variant="secondary" onClick={handleSaveAddress}>
                    Salvar Endereço
                  </Button>
                </div>
              )}
            </div>

            {/* Pagamento */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.paymentIcon}>💳</span>
                <h2 className={styles.sectionTitle}>Forma de Pagamento</h2>
              </div>

              <div className={styles.paymentMethods}>
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`${styles.paymentCard} ${paymentMethodId === m.id ? styles.paymentCardSelected : ''}`}
                    onClick={() => { setPaymentMethodId(m.id); setInstallments(1); }}
                  >
                    {paymentMethodId === m.id && (
                      <span className={styles.paymentCheck}><CheckIcon size={14} /></span>
                    )}
                    <span className={styles.paymentMethodIcon}>{m.icon}</span>
                    <span className={styles.paymentMethodLabel}>{m.label}</span>
                    <span className={styles.paymentMethodDesc}>{m.description}</span>
                  </button>
                ))}
              </div>

              {/* Formulário do cartão */}
              {paymentMethodId === 4 && (
                <div className={styles.cardForm}>
                  <div className={styles.cardPreview}>
                    <div className={styles.cardChip}>▮▮</div>
                    <p className={styles.cardNumber}>
                      {card.number || '•••• •••• •••• ••••'}
                    </p>
                    <div className={styles.cardBottom}>
                      <div>
                        <p className={styles.cardFieldLabel}>Titular</p>
                        <p className={styles.cardFieldValue}>{card.holder || '••••••••••••'}</p>
                      </div>
                      <div>
                        <p className={styles.cardFieldLabel}>Validade</p>
                        <p className={styles.cardFieldValue}>{card.expiry || 'MM/AA'}</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFields}>
                    <InputField
                      label="Número do Cartão *"
                      placeholder="0000 0000 0000 0000"
                      value={card.number}
                      onChange={setCardField('number')}
                      maxLength={19}
                    />
                    <InputField
                      label="Nome do Titular *"
                      placeholder="NOME COMO NO CARTÃO"
                      value={card.holder}
                      onChange={setCardField('holder')}
                    />
                    <div className={styles.row}>
                      <InputField
                        label="Validade *"
                        placeholder="MM/AA"
                        value={card.expiry}
                        onChange={setCardField('expiry')}
                        maxLength={5}
                      />
                      <InputField
                        label="CVV *"
                        placeholder="123"
                        value={card.cvv}
                        onChange={setCardField('cvv')}
                        maxLength={4}
                        style={{ maxWidth: 100 }}
                      />
                    </div>
                  </div>

                  {/* Parcelas */}
                  <div className={styles.installments}>
                    <p className={styles.installmentsLabel}>Parcelas</p>
                    <div className={styles.installmentsGrid}>
                      {[1, 2, 3, 6, 12].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={`${styles.installmentBtn} ${installments === n ? styles.installmentBtnSelected : ''}`}
                          onClick={() => setInstallments(n)}
                        >
                          <span className={styles.installmentN}>{n}×</span>
                          <span className={styles.installmentV}>{formatPrice(total / n)}</span>
                          {n === 1 && <span className={styles.installmentTag}>sem juros</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Preview resumido (PIX e Boleto) */}
              {paymentMethodId !== 4 && (
                <div className={styles.paymentPreview}>
                  {paymentMethodId === 2 && (
                    <p className={styles.paymentPreviewText}>
                      ⚡ Pague <strong>{formatPrice(total)}</strong> via PIX. Aprovação instantânea.
                    </p>
                  )}
                  {paymentMethodId === 3 && (
                    <p className={styles.paymentPreviewText}>
                      📄 Boleto de <strong>{formatPrice(total)}</strong> gerado após confirmação.
                    </p>
                  )}
                </div>
              )}

              {paymentMethodId === 4 && installments > 1 && (
                <div className={styles.paymentPreview} style={{ marginTop: 12 }}>
                  <p className={styles.paymentPreviewText}>
                    💳 {installments}× de <strong>{formatPrice(installmentValue)}</strong> = {formatPrice(total)} no total
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Resumo */}
          <div className={styles.sidebar}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Resumo</h2>
              <div className={styles.summaryItems}>
                {cart.items.map((item) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <span className={styles.summaryItemName}>
                      #{item.productId.substring(0, 6).toUpperCase()} · {item.size} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.priceAtAdd * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.divider} />
              <div className={styles.summaryRow}>
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Frete</span>
                <span className={shipping === 0 ? styles.free : ''}>{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span>
              </div>
              <div className={styles.divider} />
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <strong>Total</strong><strong className={styles.totalValue}>{formatPrice(total)}</strong>
              </div>
              {paymentMethodId === 4 && installments > 1 && (
                <p className={styles.installmentHint}>{installments}× de {formatPrice(installmentValue)}</p>
              )}
              <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: 20 }}>
                {loading ? 'Processando...' : 'Confirmar Pedido'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
