import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand}>ShirtStore</Link>
      <div className={styles.links}>
        <Link to="/">Produtos</Link>
        <Link to="/cart">
          Carrinho {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
        </Link>
        {user ? (
          <>
            <Link to="/orders">Meus Pedidos</Link>
            <span className={styles.userName}>{user.name}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>Sair</button>
          </>
        ) : (
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/register" className={styles.registerBtn}>Cadastrar</Link>
          </>
        )}
      </div>
    </nav>
  );
}
