import { Copy, Edit, Eye, EyeOff, KeyRound, RefreshCw, Save, ShieldCheck, Trash2, X, } from "lucide-react";
import { useJwtSecrets } from "./JwtSecrets";

export function JwtSecrets() {
  const {
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
  } = useJwtSecrets();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">JWT Secrets</h1>

          <p className="mt-2 text-slate-600">
            Gerencie as chaves JWT usadas pelo Gateway para validar tokens das
            APIs.
          </p>
        </div>

        <button
          onClick={loadJwtSecrets}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {editingJwtSecret ? "Editar JWT Secret" : "Nova JWT Secret"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Chave ativa atual:{" "}
              {activeJwtSecret ? activeJwtSecret.name : "nenhuma"}
            </p>
          </div>

          <KeyRound className="text-blue-600" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da secret"
            className="rounded-lg border border-slate-300 px-4 py-3"
          />

          {editingJwtSecret && (
            <select
              value={isActive ? "true" : "false"}
              onChange={(e) => setIsActive(e.target.value === "true")}
              className="rounded-lg border border-slate-300 px-4 py-3"
            >
              <option value="true">Ativa</option>
              <option value="false">Inativa</option>
            </select>
          )}

          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-70"
            >
              <Save size={18} />
              {saving
                ? "Salvando..."
                : editingJwtSecret
                  ? "Salvar alterações"
                  : "Cadastrar JWT Secret"}
            </button>

            {editingJwtSecret && (
              <button
                type="button"
                onClick={clearForm}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700"
              >
                <X size={18} />
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">
            JWT Secrets cadastradas
          </h2>

          <div className="flex gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="rounded-lg border border-slate-300 px-4 py-2"
            />

            <button
              onClick={() => setShowSecrets(!showSecrets)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              {showSecrets ? <EyeOff size={16} /> : <Eye size={16} />}
              {showSecrets ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-600">Carregando JWT Secrets...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-3">Nome</th>
                <th className="py-3">Secret</th>
                <th className="py-3">Status</th>
                <th className="py-3">Criada em</th>
                <th className="py-3">Expira em</th>
                <th className="py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredJwtSecrets.map((jwtSecret) => (
                <tr key={jwtSecret.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{jwtSecret.name}</td>

                  <td className="max-w-[350px] truncate py-3 font-mono text-xs">
                    {maskSecret(jwtSecret.secret)}
                  </td>

                  <td className="py-3">
                    {jwtSecret.isActive ? (
                      <span className="rounded-lg bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Ativa
                      </span>
                    ) : (
                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        Inativa
                      </span>
                    )}
                  </td>

                  <td className="py-3">{formatDate(jwtSecret.createdAt)}</td>

                  <td className="py-3">{formatDate(jwtSecret.expiresAt)}</td>

                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => copySecret(jwtSecret.secret)}
                        className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600"
                      >
                        <Copy size={16} />
                      </button>

                      {!jwtSecret.isActive && (
                        <button
                          onClick={() => handleActivate(jwtSecret)}
                          className="rounded-lg bg-green-50 px-3 py-2 text-green-600"
                        >
                          <ShieldCheck size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => handleEdit(jwtSecret)}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-blue-600"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(jwtSecret.id)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredJwtSecrets.length === 0 && (
          <p className="py-8 text-center text-slate-500">
            Nenhuma JWT Secret encontrada.
          </p>
        )}
      </div>
    </div>
  );
}