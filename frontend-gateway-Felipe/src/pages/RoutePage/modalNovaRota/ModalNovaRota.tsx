import { X } from "lucide-react";
import { useModalNovaRota } from "./ModalNovaRota";

interface Props {
    isOpen: boolean;
    routeToEdit: any;
    onSave: (data: any) => Promise<void>;
    onClose: () => void;
}

export function ModalNovaRota({
    isOpen,
    routeToEdit,
    onSave,
    onClose,
}: Props) {
    const {
        name,
        setName,
        method,
        setMethod,
        path,
        setPath,
        targetUrl,
        setTargetUrl,
        requiresAuth,
        setRequiresAuth,
        loading,
        handleSubmit,
    } = useModalNovaRota({
        routeToEdit,
        onSave,
        onClose,
    });

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">
                        {routeToEdit ? "Editar rota" : "Nova rota"}
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Nome
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-4 py-3"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Método
                            </label>

                            <select
                                value={method}
                                onChange={(event) => setMethod(event.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-4 py-3"
                            >
                                <option>GET</option>
                                <option>POST</option>
                                <option>PUT</option>
                                <option>DELETE</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Path
                            </label>

                            <input
                                type="text"
                                value={path}
                                onChange={(event) => setPath(event.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-4 py-3"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            URL destino
                        </label>

                        <input
                            type="text"
                            value={targetUrl}
                            onChange={(event) => setTargetUrl(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-4 py-3"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={requiresAuth}
                            onChange={(event) => setRequiresAuth(event.target.checked)}
                        />

                        <span className="text-sm text-slate-700">
                            Exigir autenticação
                        </span>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            {loading ? "Salvando..." : "Salvar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}