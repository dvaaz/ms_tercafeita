import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../services/product.service';
import { listProductReviews, createReview, deleteReview, curtirReview, descurtirReview, createResposta } from '../services/review.service';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/shared/Toast/useToast';
import { formatPrice, formatDate } from '../mappers';
import { StarIcon, CartIcon, TrashIcon, ThumbsUpIcon } from '../components/shared/Icons';
import Button from '../components/shared/Button/Button';
import type { Product, Review } from '../types';
import styles from './ProductDetail.module.css';

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.starBtn} ${n <= (hover || value) ? styles.starFilled : ''}`}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange?.(n)}
          disabled={!onChange}
        >
          <StarIcon size={20} filled={n <= (hover || value)} />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { success, error: toastError, warning } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const [nota, setNota] = useState(5);
  const [titulo, setTitulo] = useState('');
  const [comentario, setComentario] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [respostaText, setRespostaText] = useState<Record<number, string>>({});
  const [showRespostaForm, setShowRespostaForm] = useState<number | null>(null);

  const userHasReviewed = reviews.some((r) => r.userId === user?.id);

  useEffect(() => {
    if (!id) return;
    setLoadingProduct(true);
    getProduct(id)
      .then((p) => {
        setProduct(p);
        const firstWithStock = p.sizes.find((s) => s.stock > 0);
        if (firstWithStock) setSelectedSize(firstWithStock.size);
      })
      .finally(() => setLoadingProduct(false));

    listProductReviews(id).then(setReviews).catch(() => {});
  }, [id]);

  const handleAddToCart = async () => {
    if (product!.sizes.length > 0 && !selectedSize) { warning('Selecione um tamanho'); return; }
    setAdding(true);
    try {
      await addItem(product!.id, selectedSize, quantity);
      const label = selectedSize ? `${product!.name} (${selectedSize})` : product!.name;
      success(`${label} adicionado ao carrinho!`);
    } catch {
      toastError('Erro ao adicionar ao carrinho');
    } finally {
      setAdding(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const review = await createReview(Number(id), nota, { titulo: titulo.trim() || undefined, comentario: comentario.trim() || undefined });
      setReviews((prev) => [review, ...prev]);
      setComentario('');
      setTitulo('');
      setNota(5);
      success('Avaliação publicada!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toastError(msg ?? 'Erro ao publicar avaliação');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      success('Avaliação removida');
    } catch {
      toastError('Erro ao remover avaliação');
    }
  };

  const handleCurtir = async (r: Review) => {
    if (!user) { warning('Entre para curtir avaliações'); return; }
    try {
      await curtirReview(r.id);
      setReviews((prev) => prev.map((rv) => rv.id === r.id ? { ...rv, curtidas: rv.curtidas + 1 } : rv));
    } catch {
      // já curtiu — tenta descurtir
      try {
        await descurtirReview(r.id);
        setReviews((prev) => prev.map((rv) => rv.id === r.id ? { ...rv, curtidas: Math.max(0, rv.curtidas - 1) } : rv));
      } catch { /* ignore */ }
    }
  };

  const handleSubmitResposta = async (reviewId: number) => {
    const text = respostaText[reviewId]?.trim();
    if (!text) return;
    try {
      const resp = await createResposta(reviewId, text);
      setReviews((prev) => prev.map((rv) => rv.id === reviewId
        ? { ...rv, respostas: [...rv.respostas, resp] }
        : rv
      ));
      setRespostaText((prev) => ({ ...prev, [reviewId]: '' }));
      setShowRespostaForm(null);
      success('Resposta publicada!');
    } catch {
      toastError('Erro ao publicar resposta');
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.nota, 0) / reviews.length)
    : null;

  if (loadingProduct) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h2>Produto não encontrado</h2>
        <Link to="/" className={styles.backLink}>Voltar para a Home</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">Produtos</Link>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        {/* Main */}
        <div className={styles.main}>
          <div className={styles.imageSection}>
            <img
              src={product.imageUrl || 'https://placehold.co/600x700/141414/888?text=Camiseta'}
              alt={product.name}
              className={styles.image}
            />
          </div>

          <div className={styles.info}>
            <span className={styles.category}>{product.category}</span>
            <h1 className={styles.name}>{product.name}</h1>

            {avgRating !== null && (
              <div className={styles.ratingRow}>
                <StarRating value={Math.round(avgRating)} />
                <span className={styles.ratingNum}>{avgRating.toFixed(1)}</span>
                <span className={styles.ratingCount}>({reviews.length} avaliações)</span>
              </div>
            )}

            <div className={styles.priceBlock}>
              <span className={styles.price}>{formatPrice(product.price)}</span>
              <span className={styles.installment}>3× de {formatPrice(product.price / 3)} sem juros</span>
            </div>

            <p className={styles.description}>{product.description}</p>

            {/* Sizes */}
            {product.sizes.length > 0 && <div className={styles.sizesSection}>
              <p className={styles.sizeLabel}>Tamanho</p>
              <div className={styles.sizeGrid}>
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    disabled={s.stock === 0}
                    onClick={() => setSelectedSize(s.size)}
                    className={`${styles.sizeBtn} ${selectedSize === s.size ? styles.sizeBtnSelected : ''} ${s.stock === 0 ? styles.sizeBtnOut : ''}`}
                    title={s.stock === 0 ? 'Esgotado' : `${s.stock} disponíveis`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className={styles.stockHint}>
                  {product.sizes.find((s) => s.size === selectedSize)?.stock ?? 0} unidades disponíveis
                </p>
              )}
            </div>}

            {/* Quantity */}
            <div className={styles.quantitySection}>
              <p className={styles.sizeLabel}>Quantidade</p>
              <div className={styles.qtyControl}>
                <button className={styles.qtyBtn} onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span className={styles.qty}>{quantity}</span>
                <button className={styles.qtyBtn} onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              loading={adding}
              onClick={handleAddToCart}
              disabled={product.sizes.length > 0 && !selectedSize}
            >
              <CartIcon size={18} /> Adicionar ao Carrinho
            </Button>
          </div>
        </div>

        {/* Reviews */}
        <section className={styles.reviews}>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.reviewsTitle}>
              Avaliações
              {avgRating !== null && (
                <span className={styles.avgBadge}>★ {avgRating.toFixed(1)}</span>
              )}
            </h2>
          </div>

          {/* Write review */}
          {user && !userHasReviewed && (
            <form className={styles.reviewForm} onSubmit={handleSubmitReview}>
              <h3 className={styles.reviewFormTitle}>Sua Avaliação</h3>
              <StarRating value={nota} onChange={setNota} />
              <input
                className={styles.tituloInput}
                placeholder="Título (opcional)"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={100}
              />
              <textarea
                className={styles.commentInput}
                placeholder="Escreva seu comentário (opcional)..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={3}
              />
              <Button type="submit" loading={submittingReview} size="sm">
                Publicar Avaliação
              </Button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className={styles.noReviews}>
              Nenhuma avaliação ainda.{' '}
              {user ? 'Seja o primeiro!' : <Link to="/login" className={styles.loginLink}>Entre para avaliar</Link>}
            </p>
          ) : (
            <div className={styles.reviewList}>
              {reviews.map((r) => (
                <div key={r.id} className={styles.review}>
                  <div className={styles.reviewTop}>
                    <div>
                      <span className={styles.reviewUser}>{r.user?.name ?? 'Usuário'}</span>
                      <StarRating value={r.nota} />
                    </div>
                    <div className={styles.reviewRight}>
                      <span className={styles.reviewDate}>{formatDate(r.createdAt)}</span>
                      {(user?.id === r.userId || user?.role === 'admin') && (
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteReview(r.id)}
                          title="Excluir avaliação"
                        >
                          <TrashIcon size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {r.titulo && <p className={styles.reviewTitulo}>{r.titulo}</p>}
                  {(r.comment ?? r.comentario) && (
                    <p className={styles.reviewComment}>{r.comment ?? r.comentario}</p>
                  )}

                  {/* Curtidas e Respostas */}
                  <div className={styles.reviewActions}>
                    <button
                      className={styles.curtidaBtn}
                      onClick={() => handleCurtir(r)}
                      title={user ? 'Curtir / descurtir' : 'Entre para curtir'}
                    >
                      <ThumbsUpIcon size={14} />
                      <span>{r.curtidas}</span>
                    </button>
                    {user && (
                      <button
                        className={styles.respostaToggle}
                        onClick={() => setShowRespostaForm(showRespostaForm === r.id ? null : r.id)}
                      >
                        {showRespostaForm === r.id ? 'Cancelar' : `Responder${r.respostas.length > 0 ? ` (${r.respostas.length})` : ''}`}
                      </button>
                    )}
                    {!user && r.respostas.length > 0 && (
                      <span className={styles.respostaCount}>{r.respostas.length} resposta{r.respostas.length > 1 ? 's' : ''}</span>
                    )}
                  </div>

                  {/* Respostas */}
                  {r.respostas.length > 0 && (
                    <div className={styles.respostaList}>
                      {r.respostas.map((resp) => (
                        <div key={resp.id} className={styles.respostaItem}>
                          <p className={styles.respostaText}>{resp.comentario}</p>
                          <span className={styles.respostaDate}>{formatDate(resp.criadoEm)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resposta form */}
                  {showRespostaForm === r.id && (
                    <div className={styles.respostaForm}>
                      <textarea
                        className={styles.commentInput}
                        placeholder="Escreva sua resposta..."
                        value={respostaText[r.id] ?? ''}
                        onChange={(e) => setRespostaText((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        rows={2}
                        maxLength={255}
                      />
                      <Button size="sm" onClick={() => handleSubmitResposta(r.id)}>
                        Enviar Resposta
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
