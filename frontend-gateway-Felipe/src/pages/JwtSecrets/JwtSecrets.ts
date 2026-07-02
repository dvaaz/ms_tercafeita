import { useEffect, useMemo, useState } from "react";
import { createJwtSecret, deleteJwtSecret, getJwtSecrets, updateJwtSecret, } from "../../services/Jwt-secrets.service";
import type { CreateJwtSecretRequest, JwtSecret, UpdateJwtSecretRequest, } from "../../types/Jwt-Secret";

export function useJwtSecrets() {
  const [jwtSecrets, setJwtSecrets] = useState<JwtSecret[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingJwtSecret, setEditingJwtSecret] = useState<JwtSecret | null>(
    null
  );

  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [search, setSearch] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);

  async function loadJwtSecrets() {
    try {
      setLoading(true);
      const data = await getJwtSecrets();
      setJwtSecrets(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar JWT Secrets.");
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setEditingJwtSecret(null);
    setName("");
    setIsActive(true);
  }

  function handleEdit(jwtSecret: JwtSecret) {
    setEditingJwtSecret(jwtSecret);
    setName(jwtSecret.name);
    setIsActive(jwtSecret.isActive);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      setSaving(true);

      if (editingJwtSecret) {
        const payload: UpdateJwtSecretRequest = {
          name: name.trim(),
          isActive,
        };

        await updateJwtSecret(editingJwtSecret.id, payload);
      } else {
        const payload: CreateJwtSecretRequest = {
          name: name.trim(),
        };

        await createJwtSecret(payload);
      }

      clearForm();
      await loadJwtSecrets();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar JWT Secret.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = confirm("Deseja realmente excluir esta JWT Secret?");

    if (!confirmed) return;

    try {
      await deleteJwtSecret(id);
      await loadJwtSecrets();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir JWT Secret.");
    }
  }

  async function handleActivate(jwtSecret: JwtSecret) {
    try {
      const payload: UpdateJwtSecretRequest = {
        isActive: true,
      };

      await updateJwtSecret(jwtSecret.id, payload);
      await loadJwtSecrets();
    } catch (error) {
      console.error(error);
      alert("Erro ao ativar JWT Secret.");
    }
  }

  async function copySecret(value: string) {
    await navigator.clipboard.writeText(value);
    alert("Secret copiada.");
  }

  function formatDate(value: string) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function maskSecret(value: string) {
    if (!value) return "-";

    if (showSecrets) return value;

    if (value.length <= 12) {
      return "••••••••";
    }

    return `${value.substring(0, 6)}••••••••${value.substring(
      value.length - 6
    )}`;
  }

  const filteredJwtSecrets = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return jwtSecrets;

    return jwtSecrets.filter((jwtSecret) => {
      return (
        jwtSecret.name.toLowerCase().includes(value) ||
        jwtSecret.secret.toLowerCase().includes(value) ||
        (jwtSecret.isActive ? "ativo" : "inativo").includes(value)
      );
    });
  }, [jwtSecrets, search]);

  const activeJwtSecret = jwtSecrets.find((jwtSecret) => jwtSecret.isActive);

  useEffect(() => {
    loadJwtSecrets();
  }, []);

  return {
    jwtSecrets,
    filteredJwtSecrets,
    activeJwtSecret,
    loading,
    saving,
    editingJwtSecret,
    name,
    setName,
    isActive,
    setIsActive,
    search,
    setSearch,
    showSecrets,
    setShowSecrets,
    loadJwtSecrets,
    clearForm,
    handleEdit,
    handleSubmit,
    handleDelete,
    handleActivate,
    copySecret,
    formatDate,
    maskSecret,
  };
}