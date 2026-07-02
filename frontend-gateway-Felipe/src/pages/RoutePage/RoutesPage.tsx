import { Edit, Plus, RefreshCw, Trash2 } from "lucide-react";
import { ModalNovaRota } from "./modalNovaRota/ModalNovaRota.tsx";
import { useRoutesPage } from "./RoutesPage";

export function RoutesPage() {
    const {
        routes,
        loading,
        isModalOpen,
        routeToEdit,
        loadRoutes,
        handleOpenCreateModal,
        handleOpenEditModal,
        handleCloseModal,
        handleSaveRoute,
        handleDelete,
    } = useRoutesPage();

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Rotas</h1>

                    <p className="mt-2 text-slate-600">
                        Cadastro e gerenciamento das rotas do Gateway.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={loadRoutes}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <RefreshCw size={16} />
                        Atualizar
                    </button>

                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        Nova rota
                    </button>
                </div>
            </div>

            <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
                {loading ? (
                    <p className="text-slate-600">Carregando rotas...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b text-slate-500">
                                    <th className="py-3">Nome</th>
                                    <th className="py-3">Método</th>
                                    <th className="py-3">Path</th>
                                    <th className="py-3">Destino</th>
                                    <th className="py-3">Auth</th>
                                    <th className="py-3 text-right">Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {routes.map((route) => (
                                    <tr key={route.id} className="border-b last:border-0">
                                        <td className="py-3 font-medium text-slate-800">
                                            {route.name}
                                        </td>

                                        <td className="py-3">
                                            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                                                {route.method}
                                            </span>
                                        </td>

                                        <td className="py-3">{route.path}</td>

                                        <td className="py-3">{route.targetUrl}</td>

                                        <td className="py-3">
                                            {route.requiresAuth ? "Sim" : "Não"}
                                        </td>

                                        <td className="py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEditModal(route)}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100"
                                                >
                                                    <Edit size={16} />
                                                    Editar
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(route.id)}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
                                                >
                                                    <Trash2 size={16} />
                                                    Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {routes.length === 0 && (
                            <p className="py-8 text-center text-slate-500">
                                Nenhuma rota cadastrada.
                            </p>
                        )}
                    </div>
                )}
            </div>

            <ModalNovaRota
                isOpen={isModalOpen}
                routeToEdit={routeToEdit}
                onClose={handleCloseModal}
                onSave={handleSaveRoute}
            />
        </div>
    );
}