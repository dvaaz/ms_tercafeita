import { Edit, RefreshCw, Save, Trash2, X } from "lucide-react";
import { useUsers } from "./Users";

export function Users() {
  const {
    users,
    loading,
    editingUser,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    role,
    setRole,
    loadUsers,
    clearForm,
    handleEdit,
    handleSubmit,
    handleDelete,
  } = useUsers();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>

          <p className="mt-2 text-slate-600">
            Gerencie os usuários administrativos do Gateway.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          {editingUser ? "Editar usuário" : "Novo usuário"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome"
            className="rounded-lg border border-slate-300 px-4 py-3"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="rounded-lg border border-slate-300 px-4 py-3"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={editingUser ? "Nova senha opcional" : "Senha"}
            className="rounded-lg border border-slate-300 px-4 py-3"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-3"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </select>

          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
            >
              <Save size={18} />
              {editingUser ? "Salvar alterações" : "Cadastrar usuário"}
            </button>

            {editingUser && (
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
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Usuários cadastrados
        </h2>

        {loading ? (
          <p className="text-slate-600">Carregando usuários...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-3">Nome</th>
                <th className="py-3">E-mail</th>
                <th className="py-3">Perfil</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{user.name}</td>
                  <td className="py-3">{user.email}</td>
                  <td className="py-3">{user.role}</td>
                  <td className="py-3">{user.isActive ? "Ativo" : "Inativo"}</td>

                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-blue-600"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(user.id)}
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
      </div>
    </div>
  );
}