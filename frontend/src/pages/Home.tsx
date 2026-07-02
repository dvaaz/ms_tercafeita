import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listProducts } from '../services/product.service';
import { listProductReviews } from '../services/review.service';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/shared/Toast/useToast';
import { formatPrice } from '../mappers';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, CartIcon, TruckIcon, ShieldIcon, RefreshIcon } from '../components/shared/Icons';
import type { Product } from '../types';
import styles from './Home.module.css';

interface RatingSummary { average: number; count: number; }

function StarRating({ average, count }: RatingSummary) {
  if (count === 0) return <span className={styles.noRating}>Sem avaliações</span>;
  return (
    <div className={styles.starRow}>
      <span className={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = average >= n - 0.25 ? 'Full' : average >= n - 0.75 ? 'Half' : 'Empty';
          return (
            <span key={n} className={styles[`star${filled}`]}>★</span>
          );
        })}
      </span>
      <span className={styles.ratingAvg}>{average.toFixed(1)}</span>
      <span className={styles.ratingCount}>({count})</span>
    </div>
  );
}

const CATEGORIES = [
  { key: '', label: 'Todas' },
  { key: 'basicas', label: 'Básicas' },
  { key: 'estampadas', label: 'Estampadas' },
  { key: 'polo', label: 'Polo' },
  { key: 'esportivas', label: 'Esportivas' },
];

const HERO_SLIDES = [
  {
    title: 'Nova Coleção Verão',
    subtitle: 'Camisetas premium para todos os estilos. Qualidade que você sente.',
    cta: 'Ver Coleção',
    category: '',
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a0a 100%)',
  },
  {
    title: 'Estampadas Exclusivas',
    subtitle: 'Designs únicos criados por artistas locais. Edições limitadas.',
    cta: 'Ver Estampadas',
    category: 'estampadas',
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #0a0a1a 100%)',
  },
  {
    title: 'Linha Esportiva',
    subtitle: 'Performance e conforto para seus treinos e atividades ao ar livre.',
    cta: 'Ver Esportivas',
    category: 'esportivas',
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #001a0a 100%)',
  },
];

const BENEFITS = [
  { icon: <TruckIcon size={28} />, title: 'Frete Grátis', desc: 'Em compras acima de R$299' },
  { icon: <RefreshIcon size={28} />, title: 'Troca Fácil', desc: 'Devolução em até 30 dias' },
  { icon: <ShieldIcon size={28} />, title: 'Compra Segura', desc: 'Pagamento 100% protegido' },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [newsletter, setNewsletter] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [ratings, setRatings] = useState<Record<string, RatingSummary>>({});
  const heroTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { addItem } = useCart();
  const { success, error: toastError, warning } = useToast();
  const limit = 12;

  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listProducts({ page, limit, search, category });
      setProducts(res.data);
      setTotal(res.total);
      // Busca ratings em paralelo sem bloquear a exibição
      res.data.forEach((p) => {
        listProductReviews(p.id)
          .then((reviews) => {
            if (reviews.length === 0) {
              setRatings((prev) => ({ ...prev, [p.id]: { average: 0, count: 0 } }));
            } else {
              const avg = reviews.reduce((sum, r) => sum + (r.nota ?? 0), 0) / reviews.length;
              setRatings((prev) => ({ ...prev, [p.id]: { average: avg, count: reviews.length } }));
            }
          })
          .catch(() => {});
      });
    } catch {
      toastError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    heroTimer.current = setInterval(() => {
      setHeroSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => { if (heroTimer.current) clearInterval(heroTimer.current); };
  }, []);

  const setCategory = (c: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (c) params.set('category', c); else params.delete('category');
    setSearchParams(params);
  };

  const setSearch = (s: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (s) params.set('search', s); else params.delete('search');
    setSearchParams(params);
  };

  const handleAddToCart = async (product: Product) => {
    const size = selectedSizes[product.id];
    if (product.sizes.length > 0 && !size) {
      warning('Selecione um tamanho antes de adicionar ao carrinho');
      return;
    }
    try {
      await addItem(product.id, size ?? '', 1);
      const label = size ? `${product.name} (${size})` : product.name;
      success(`${label} adicionado ao carrinho!`);
    } catch {
      toastError('Erro ao adicionar ao carrinho');
    }
  };

  const totalPages = Math.ceil(total / limit);
  const slide = HERO_SLIDES[heroSlide];

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero} style={{ background: slide.bg }}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <p className={styles.heroTag}>ShirtStore — Nova Coleção</p>
            <h1 className={styles.heroTitle}>{slide.title}</h1>
            <p className={styles.heroSubtitle}>{slide.subtitle}</p>
            <div className={styles.heroCtas}>
              <button
                className={styles.heroBtn}
                onClick={() => setCategory(slide.category)}
              >
                {slide.cta}
              </button>
              <Link to="/register" className={styles.heroBtnOutline}>Criar Conta</Link>
            </div>
          </div>
          <div className={styles.heroAccent}>
            <span>S</span>
          </div>
        </div>

        {/* Dots */}
        <div className={styles.heroDots}>
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.heroDot} ${i === heroSlide ? styles.heroDotActive : ''}`}
              onClick={() => setHeroSlide(i)}
            />
          ))}
        </div>

        {/* Arrows */}
        <button
          className={`${styles.heroArrow} ${styles.heroArrowLeft}`}
          onClick={() => setHeroSlide((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        >
          <ChevronLeftIcon size={24} />
        </button>
        <button
          className={`${styles.heroArrow} ${styles.heroArrowRight}`}
          onClick={() => setHeroSlide((s) => (s + 1) % HERO_SLIDES.length)}
        >
          <ChevronRightIcon size={24} />
        </button>
      </section>

      {/* Benefits */}
      <section className={styles.benefits}>
        {BENEFITS.map((b) => (
          <div key={b.title} className={styles.benefit}>
            <span className={styles.benefitIcon}>{b.icon}</span>
            <div>
              <div className={styles.benefitTitle}>{b.title}</div>
              <div className={styles.benefitDesc}>{b.desc}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Products */}
      <section className={styles.productsSection}>
        <div className={styles.productsHeader}>
          <h2 className={styles.sectionTitle}>
            {category ? CATEGORIES.find((c) => c.key === category)?.label ?? 'Produtos' : 'Todos os Produtos'}
            {total > 0 && <span className={styles.totalBadge}>{total}</span>}
          </h2>

          {/* Search */}
          <div className={styles.searchBox}>
            <SearchIcon size={16} />
            <input
              className={styles.searchInput}
              placeholder="Buscar camisetas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category filters */}
        <div className={styles.categories}>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`${styles.catBtn} ${category === c.key ? styles.catBtnActive : ''}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className={styles.loading}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <p>Nenhum produto encontrado</p>
            <button onClick={() => { setCategory(''); setSearch(''); }} className={styles.clearBtn}>
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((p) => (
              <div key={p.id} className={styles.card}>
                <Link to={`/products/${p.id}`} className={styles.cardImage}>
                  <img
                    src={p.imageUrl || 'https://placehold.co/400x500/141414/888?text=Camiseta'}
                    alt={p.name}
                  />
                  <div className={styles.cardOverlay}>
                    <span>Ver detalhes</span>
                  </div>
                </Link>
                <div className={styles.cardBody}>
                  <span className={styles.cardCategory}>{p.category}</span>
                  <h3 className={styles.cardName}>
                    <Link to={`/products/${p.id}`}>{p.name}</Link>
                  </h3>
                  {ratings[p.id] !== undefined && (
                    <StarRating average={ratings[p.id].average} count={ratings[p.id].count} />
                  )}
                  <div className={styles.cardPrice}>
                    <span className={styles.price}>{formatPrice(p.price)}</span>
                    <span className={styles.installment}>3x de {formatPrice(p.price / 3)} sem juros</span>
                  </div>

                  {/* Size selector */}
                  {p.sizes.length > 0 && (
                    <div className={styles.sizeRow}>
                      {p.sizes.filter((s) => s.stock > 0).map((s) => (
                        <button
                          key={s.id}
                          className={`${styles.sizeBtn} ${selectedSizes[p.id] === s.size ? styles.sizeBtnActive : ''}`}
                          onClick={() => setSelectedSizes((prev) => ({ ...prev, [p.id]: s.size }))}
                        >
                          {s.size}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    className={styles.addBtn}
                    onClick={() => handleAddToCart(p)}
                  >
                    <CartIcon size={16} />
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeftIcon size={18} /> Anterior
            </button>
            <div className={styles.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`${styles.pageNum} ${n === page ? styles.pageNumActive : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              className={styles.pageBtn}
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima <ChevronRightIcon size={18} />
            </button>
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <h2 className={styles.newsletterTitle}>Receba as novidades</h2>
          <p className={styles.newsletterSub}>Ofertas exclusivas e lançamentos direto no seu e-mail.</p>
          {newsletterSent ? (
            <p className={styles.newsletterSuccess}>Obrigado! Você está na lista.</p>
          ) : (
            <form
              className={styles.newsletterForm}
              onSubmit={(e) => { e.preventDefault(); setNewsletterSent(true); success('Inscrição realizada com sucesso!'); }}
            >
              <input
                className={styles.newsletterInput}
                type="email"
                placeholder="Seu melhor e-mail"
                value={newsletter}
                onChange={(e) => setNewsletter(e.target.value)}
                required
              />
              <button type="submit" className={styles.newsletterBtn}>Inscrever</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
