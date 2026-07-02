import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/shared/Toast/useToast';
import InputField from '../components/shared/InputField/InputField';
import Button from '../components/shared/Button/Button';
import { MailIcon, EyeIcon, EyeOffIcon, LockIcon } from '../components/shared/Icons';
import styles from './Auth.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toastError(msg ?? 'E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link to="/" className={styles.logo}>ShirtStore</Link>
          <h1 className={styles.title}>Bem-vindo de volta</h1>
          <p className={styles.subtitle}>Entre na sua conta para continuar</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <InputField
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<MailIcon size={18} />}
            required
            autoFocus
          />
          <InputField
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<LockIcon size={18} />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex' }}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            }
            required
          />

          <Button type="submit" fullWidth loading={loading} size="lg">
            Entrar
          </Button>
        </form>

        <div className={styles.footer}>
          <p>Não tem conta? <Link to="/register" className={styles.link}>Cadastrar grátis</Link></p>
        </div>
      </div>
    </div>
  );
}
