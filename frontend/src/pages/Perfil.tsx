import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/shared/Toast/useToast';
import InputField from '../components/shared/InputField/InputField';
import Button from '../components/shared/Button/Button';
import CollapsibleCard from '../components/shared/CollapsibleCard/CollapsibleCard';
import { MapPinIcon, LockIcon, EyeIcon, EyeOffIcon, PlusIcon, TrashIcon, EditIcon, PackageIcon, SettingsIcon, LogOutIcon } from '../components/shared/Icons';
import type { SavedAddress } from '../types';
import styles from './Perfil.module.css';

function storageKey(userId?: string | null): string {
  return `shirtstore:addresses:${userId ?? 'guest'}`;
}

function loadAddresses(key: string): SavedAddress[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as SavedAddress[];
  } catch {
    return [];
  }
}

export default function Perfil() {
  const { user, logout, isAdmin, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  const [addrForm, setAddrForm] = useState({
    label: '', street: '', number: '', complement: '', city: '', state: '', zipCode: '', country: 'Brasil',
  });

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    setAddresses(loadAddresses(storageKey(user?.id)));
  }, [user?.id]);

  const resetAddrForm = () => setAddrForm({ label: '', street: '', number: '', complement: '', city: '', state: '', zipCode: '', country: 'Brasil' });

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
      toastError('Preencha os campos obrigatórios: rua, cidade, estado e CEP');
      return;
    }
    let updated: SavedAddress[];
    if (editingId) {
      updated = addresses.map((a) => a.id === editingId ? { ...addrForm, id: editingId } : a);
      success('Endereço atualizado!');
    } else {
      const newAddr: SavedAddress = { ...addrForm, id: crypto.randomUUID() };
      updated = [...addresses, newAddr];
      success('Endereço adicionado!');
    }
    setAddresses(updated);
    localStorage.setItem(storageKey(user?.id), JSON.stringify(updated));
    resetAddrForm();
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleEditAddress = (addr: SavedAddress) => {
    setAddrForm({ label: addr.label, street: addr.street, number: addr.number ?? '', complement: addr.complement ?? '', city: addr.city, state: addr.state, zipCode: addr.zipCode, country: addr.country });
    setEditingId(addr.id);
    setShowAddForm(true);
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    localStorage.setItem(storageKey(user?.id), JSON.stringify(updated));
    success('Endereço removido');
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { toastError('As novas senhas não coincidem'); return; }
    if (pwForm.next.length < 8) { toastError('A nova senha deve ter pelo menos 8 caracteres'); return; }
    setPwLoading(true);
    try {
      await updatePassword(pwForm.current, pwForm.next);
      setPwForm({ current: '', next: '', confirm: '' });
      success('Senha alterada com sucesso!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toastError(msg ?? 'Erro ao alterar senha. Verifique a senha atual.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.avatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className={styles.userName}>{user.name}</h2>
              <p className={styles.userEmail}>{user.email}</p>
              {isAdmin && <span className={styles.adminBadge}>Administrador</span>}
            </div>

            <nav className={styles.sideNav}>
              <Link to="/orders" className={styles.navItem}>
                <PackageIcon size={18} /> Meus Pedidos
              </Link>
              {isAdmin && (
                <Link to="/admin" className={styles.navItem}>
                  <SettingsIcon size={18} /> Painel Admin
                </Link>
              )}
              <button className={`${styles.navItem} ${styles.logoutItem}`} onClick={handleLogout}>
                <LogOutIcon size={18} /> Sair da Conta
              </button>
            </nav>
          </aside>

          {/* Main content */}
          <div className={styles.main}>
            {/* Addresses */}
            <CollapsibleCard
              defaultOpen
              title="Endereços Salvos"
              subtitle={`${addresses.length} endereço${addresses.length !== 1 ? 's' : ''}`}
              badge={<MapPinIcon size={16} />}
            >
              <div className={styles.addrList}>
                {addresses.length === 0 && (
                  <p className={styles.emptyMsg}>Nenhum endereço cadastrado ainda.</p>
                )}
                {addresses.map((addr) => (
                  <div key={addr.id} className={styles.addrItem}>
                    <div className={styles.addrInfo}>
                      <p className={styles.addrLabel}>{addr.label || 'Endereço'}</p>
                      <p className={styles.addrLine}>{addr.street}{addr.number ? `, ${addr.number}` : ''}</p>
                      {addr.complement && <p className={styles.addrLine}>{addr.complement}</p>}
                      <p className={styles.addrLine}>{addr.city} — {addr.state}, {addr.zipCode}</p>
                    </div>
                    <div className={styles.addrActions}>
                      <button className={styles.addrBtn} onClick={() => handleEditAddress(addr)}>
                        <EditIcon size={16} />
                      </button>
                      <button className={`${styles.addrBtn} ${styles.addrBtnDanger}`} onClick={() => handleDeleteAddress(addr.id)}>
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  className={styles.addAddrBtn}
                  onClick={() => { resetAddrForm(); setEditingId(null); setShowAddForm((v) => !v); }}
                >
                  <PlusIcon size={16} /> {showAddForm && !editingId ? 'Cancelar' : 'Novo Endereço'}
                </button>

                {showAddForm && (
                  <div className={styles.addrForm}>
                    <InputField label="Apelido (ex: Casa, Trabalho)" placeholder="Casa" value={addrForm.label} onChange={(e) => setAddrForm((p) => ({ ...p, label: e.target.value }))} />
                    <InputField label="CEP *" placeholder="00000-000" value={addrForm.zipCode} onChange={(e) => setAddrForm((p) => ({ ...p, zipCode: e.target.value }))} onBlur={handleCepBlur} disabled={cepLoading} />
                    <div className={styles.row}>
                      <InputField label="Rua *" placeholder="Rua das Flores" value={addrForm.street} onChange={(e) => setAddrForm((p) => ({ ...p, street: e.target.value }))} />
                      <InputField label="Número" placeholder="123" value={addrForm.number} onChange={(e) => setAddrForm((p) => ({ ...p, number: e.target.value }))} style={{ maxWidth: 100 }} />
                    </div>
                    <InputField label="Complemento" placeholder="Apto 42" value={addrForm.complement} onChange={(e) => setAddrForm((p) => ({ ...p, complement: e.target.value }))} />
                    <div className={styles.row}>
                      <InputField label="Cidade *" placeholder="São Paulo" value={addrForm.city} onChange={(e) => setAddrForm((p) => ({ ...p, city: e.target.value }))} />
                      <InputField label="Estado *" placeholder="SP" value={addrForm.state} onChange={(e) => setAddrForm((p) => ({ ...p, state: e.target.value }))} maxLength={2} style={{ maxWidth: 80 }} />
                    </div>
                    <Button variant="secondary" onClick={handleSaveAddress}>
                      {editingId ? 'Salvar Alterações' : 'Salvar Endereço'}
                    </Button>
                  </div>
                )}
              </div>
            </CollapsibleCard>

            {/* Change Password */}
            <CollapsibleCard
              title="Alterar Senha"
              badge={<LockIcon size={16} />}
            >
              <form className={styles.pwForm} onSubmit={handleChangePassword}>
                <InputField
                  label="Senha Atual"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Sua senha atual"
                  value={pwForm.current}
                  onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                  icon={<LockIcon size={18} />}
                  rightElement={
                    <button type="button" onClick={() => setShowPw((v) => !v)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex' }}>
                      {showPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  }
                  required
                />
                <InputField
                  label="Nova Senha"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={pwForm.next}
                  onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                  icon={<LockIcon size={18} />}
                  required
                />
                <InputField
                  label="Confirmar Nova Senha"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                  icon={<LockIcon size={18} />}
                  error={pwForm.confirm && pwForm.confirm !== pwForm.next ? 'As senhas não coincidem' : undefined}
                  required
                />
                <Button type="submit" variant="secondary" loading={pwLoading}>
                  Alterar Senha
                </Button>
              </form>
            </CollapsibleCard>
          </div>
        </div>
      </div>
    </div>
  );
}
