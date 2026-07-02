import { useState, useEffect } from 'react';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../services/product.service';
import { useToast } from '../components/shared/Toast/useToast';
import { formatPrice } from '../mappers';
import { PlusIcon, EditIcon, TrashIcon, XIcon } from '../components/shared/Icons';
import Button from '../components/shared/Button/Button';
import InputField from '../components/shared/InputField/InputField';
import type { Product } from '../types';
import styles from './Admin.module.css';

const CATEGORIES = ['Básicas', 'Estampadas', 'Polo', 'Esportivas', 'Roupas'];

interface ProductForm {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  stock: string;
}

const emptyForm = (): ProductForm => ({
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  category: 'Básicas',
  stock: '0',
});

export default function Admin() {
  const { success, error: toastError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await listProducts({ limit: 100 });
      setProducts(res.data);
    } catch {
      toastError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm());
    setEditingProduct(null);
    setModal('create');
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      imageUrl: p.imageUrl,
      category: p.category,
      stock: String(p.stock),
    });
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditingProduct(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toastError('Preencha nome, preço e categoria');
      return;
    }
    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      imageUrl: form.imageUrl || undefined,
      category: form.category,
      stock: parseInt(form.stock) || 0,
    };
    setSubmitting(true);
    try {
      if (modal === 'edit' && editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
        success('Produto atualizado!');
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
        success('Produto criado!');
      }
      closeModal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toastError(msg ?? 'Erro ao salvar produto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      success(`"${name}" excluído`);
    } catch {
      toastError('Erro ao excluir produto');
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Painel Admin</h1>
            <p className={styles.pageSubtitle}>{products.length} produtos cadastrados</p>
          </div>
          <Button onClick={openCreate}>
            <PlusIcon size={18} /> Novo Produto
          </Button>
        </div>

        {/* Search */}
        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            placeholder="Buscar por nome ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Produto</span>
              <span>Categoria</span>
              <span>Preço</span>
              <span>Estoque</span>
              <span>Ações</span>
            </div>
            {filtered.map((p) => (
              <div key={p.id} className={styles.tableRow}>
                <div className={styles.productCell}>
                  <img
                    src={p.imageUrl || 'https://placehold.co/40x40/141414/888?text=S'}
                    alt={p.name}
                    className={styles.productThumb}
                  />
                  <div>
                    <p className={styles.productName}>{p.name}</p>
                    <p className={styles.productId}>#{p.id}</p>
                  </div>
                </div>
                <span className={styles.categoryBadge}>{p.category}</span>
                <span className={styles.priceCell}>{formatPrice(p.price)}</span>
                <span className={`${styles.sizeTag} ${p.stock === 0 ? styles.sizeTagOut : ''}`}>
                  {p.stock} un.
                </span>
                <div className={styles.actions}>
                  <button className={styles.actionBtn} onClick={() => openEdit(p)} title="Editar">
                    <EditIcon size={16} />
                  </button>
                  <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => handleDelete(p.id, p.name)} title="Excluir">
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className={styles.empty}>Nenhum produto encontrado</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{modal === 'edit' ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}><XIcon size={20} /></button>
            </div>

            <form className={styles.modalForm} onSubmit={handleSubmit}>
              <InputField label="Nome *" placeholder="Nome do produto" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              <div className={styles.row}>
                <InputField label="Preço (R$) *" type="number" placeholder="0.00" step="0.01" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
                <InputField label="Estoque" type="number" placeholder="0" min="0" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
              </div>
              <div className={styles.selectWrapper}>
                <label className={styles.selectLabel}>Categoria *</label>
                <select className={styles.select} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <InputField label="URL da Imagem" placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />

              <div className={styles.modalActions}>
                <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button type="submit" loading={submitting}>
                  {modal === 'edit' ? 'Salvar Alterações' : 'Criar Produto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
