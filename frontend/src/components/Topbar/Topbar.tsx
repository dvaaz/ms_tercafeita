import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import {
  CartIcon, UserIcon, SearchIcon, LogOutIcon,
  PackageIcon, SettingsIcon, MenuIcon, XIcon,
} from '../shared/Icons';
import styles from './Topbar.module.css';

export default function Topbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          ShirtStore
        </Link>

        {/* Desktop Links */}
        <div className={styles.desktopLinks}>
          <Link to="/" className={styles.navLink}>Produtos</Link>
          <Link to="/?category=basicas" className={styles.navLink}>Básicas</Link>
          <Link to="/?category=estampadas" className={styles.navLink}>Estampadas</Link>
          <Link to="/?category=polo" className={styles.navLink}>Polo</Link>
          <Link to="/?category=esportivas" className={styles.navLink}>Esportivas</Link>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Search */}
          {searchOpen ? (
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <input
                ref={searchRef}
                className={styles.searchInput}
                placeholder="Buscar camisetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="button" className={styles.iconBtn} onClick={() => setSearchOpen(false)}>
                <XIcon size={18} />
              </button>
            </form>
          ) : (
            <button className={styles.iconBtn} onClick={() => setSearchOpen(true)} aria-label="Buscar">
              <SearchIcon />
            </button>
          )}

          {/* Cart */}
          <Link to="/cart" className={styles.cartBtn} aria-label="Carrinho">
            <CartIcon />
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </Link>

          {/* User */}
          {user ? (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button
                className={`${styles.iconBtn} ${userOpen ? styles.active : ''}`}
                onClick={() => setUserOpen((o) => !o)}
                aria-label="Menu do usuário"
              >
                <UserIcon />
              </button>
              {userOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownName}>{user.name}</div>
                    <div className={styles.dropdownEmail}>{user.email}</div>
                    {isAdmin && <span className={styles.adminBadge}>Admin</span>}
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link to="/perfil" className={styles.dropdownItem} onClick={() => setUserOpen(false)}>
                    <UserIcon size={16} /> Meu Perfil
                  </Link>
                  <Link to="/orders" className={styles.dropdownItem} onClick={() => setUserOpen(false)}>
                    <PackageIcon size={16} /> Meus Pedidos
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className={styles.dropdownItem} onClick={() => setUserOpen(false)}>
                      <SettingsIcon size={16} /> Painel Admin
                    </Link>
                  )}
                  <div className={styles.dropdownDivider} />
                  <button className={`${styles.dropdownItem} ${styles.dropdownLogout}`} onClick={handleLogout}>
                    <LogOutIcon size={16} /> Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.loginLink}>Entrar</Link>
              <Link to="/register" className={styles.registerBtn}>Cadastrar</Link>
            </div>
          )}

          {/* Mobile menu */}
          <button className={styles.mobileMenuBtn} onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Produtos</Link>
          <Link to="/?category=basicas" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Básicas</Link>
          <Link to="/?category=estampadas" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Estampadas</Link>
          <Link to="/?category=polo" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Polo</Link>
          <Link to="/?category=esportivas" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Esportivas</Link>
          <div className={styles.mobileDivider} />
          {user ? (
            <>
              <Link to="/perfil" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Meu Perfil</Link>
              <Link to="/orders" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Meus Pedidos</Link>
              {isAdmin && <Link to="/admin" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Painel Admin</Link>}
              <button className={`${styles.mobileLink} ${styles.mobileLogout}`} onClick={() => { handleLogout(); setMobileOpen(false); }}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Entrar</Link>
              <Link to="/register" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Cadastrar</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
