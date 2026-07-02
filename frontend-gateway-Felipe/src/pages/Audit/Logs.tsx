import { Eye, RefreshCw, Search, X } from "lucide-react";
import { useLogs } from "./Logs";

export function Logs() {
  const {
    loading,
    search,
    setSearch,
    selectedLog,
    setSelectedLog,
    filteredLogs,
    loadLogs,
    formatDate,
    getStatusClass,
    getMethodClass,
  } = useLogs();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Logs</h1>
          <p className="mt-2 text-slate-600">
            Histórico das requisições processadas pelo Gateway.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-slate-300 px-4 py-3">
          <Search size={18} className="text-slate-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por método, URL, status ou IP..."
            className="w-full outline-none"
          />
        </div>

        {loading ? (
          <p className="text-slate-600">Carregando logs...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">Data</th>
                  <th className="py-3">Método</th>
                  <th className="py-3">URL original</th>
                  <th className="py-3">Destino</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Duração</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="whitespace-nowrap py-3 text-slate-700">
                      {formatDate(log.createdAt)}
                    </td>

                    <td className="py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${getMethodClass(
                          log.method
                        )}`}
                      >
                        {log.method}
                      </span>
                    </td>

                    <td className="max-w-[260px] truncate py-3 text-slate-700">
                      {log.originalUrl}
                    </td>

                    <td className="max-w-[260px] truncate py-3 text-slate-700">
                      {log.targetUrl || "-"}
                    </td>

                    <td className="py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${getStatusClass(
                          log.statusCode
                        )}`}
                      >
                        {log.statusCode || "-"}
                      </span>
                    </td>

                    <td className="py-3 text-slate-700">
                      {log.durationMs ? `${log.durationMs} ms` : "-"}
                    </td>

                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100"
                      >
                        <Eye size={16} />
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLogs.length === 0 && (
              <p className="py-8 text-center text-slate-500">
                Nenhum log encontrado.
              </p>
            )}
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Detalhes do log
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Informações completas da requisição.
                </p>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Info label="Método" value={selectedLog.method} />
                <Info label="Status" value={selectedLog.statusCode ?? "-"} />
                <Info label="URL original" value={selectedLog.originalUrl} />
                <Info label="URL destino" value={selectedLog.targetUrl || "-"} />
                <Info label="IP" value={selectedLog.ip || "-"} />
                <Info
                  label="Duração"
                  value={
                    selectedLog.durationMs
                      ? `${selectedLog.durationMs} ms`
                      : "-"
                  }
                />
                <Info label="Tipo da rota" value={selectedLog.routeType || "-"} />
                <Info label="Data" value={formatDate(selectedLog.createdAt)} />
              </div>

              <InfoBlock label="User Agent" value={selectedLog.userAgent} />
              <InfoBlock label="Request Body" value={selectedLog.requestBody} />
              <InfoBlock label="Response Body" value={selectedLog.responseBody} />
              <InfoBlock label="Erro" value={selectedLog.errorMessage} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface InfoProps {
  label: string;
  value: string | number;
}

function Info({ label, value }: InfoProps) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm text-slate-800">{value}</p>
    </div>
  );
}

interface InfoBlockProps {
  label: string;
  value?: string | null;
}

function InfoBlock({ label, value }: InfoBlockProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700">{label}</p>

      <pre className="max-h-64 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
        {value || "-"}
      </pre>
    </div>
  );
}