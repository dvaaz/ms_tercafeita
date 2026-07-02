import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/shared/Toast/useToast';
import InputField from '../components/shared/InputField/InputField';
import Button from '../components/shared/Button/Button';
import { UserIcon, MailIcon, EyeIcon, EyeOffIcon, LockIcon } from '../components/shared/Icons';
import styles from './Auth.module.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toastError('As senhas não coincidem');
      return;
    }
    if (password.length < 8) {
      toastError('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      success('Conta criada com sucesso! Bem-vindo(a)!');
      navigate('/');
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
      const msg = Array.isArray(data?.message)
        ? data.message.join('; ')
        : (data?.message ?? 'Erro ao criar conta');
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link to="/" className={styles.logo}>ShirtStore</Link>
          <h1 className={styles.title}>Criar conta</h1>
          <p className={styles.subtitle}>Junte-se à ShirtStore hoje mesmo</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <InputField
            label="Nome completo"
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<UserIcon size={18} />}
            required
            minLength={2}
            autoFocus
          />
          <InputField
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<MailIcon size={18} />}
            required
          />
          <InputField
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
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
          <InputField
            label="Confirmar senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Repita sua senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            icon={<LockIcon size={18} />}
            error={confirm && confirm !== password ? 'As senhas não coincidem' : undefined}
            required
          />

          <Button type="submit" fullWidth loading={loading} size="lg">
            Criar Conta
          </Button>
        </form>

        <div className={styles.footer}>
          <p>Já tem conta? <Link to="/login" className={styles.link}>Entrar</Link></p>
        </div>
      </div>
    </div>
  );
}
