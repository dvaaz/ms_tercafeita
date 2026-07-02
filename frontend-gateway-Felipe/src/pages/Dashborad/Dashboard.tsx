import { KeyRound, Route, ScrollText, Users } from "lucide-react";
import { useDashboard } from "./Dashboard";

export function Dashboard() {
    const { data, loading } = useDashboard();

    if (loading) {
        return <p className="text-slate-600">Carregando dashboard...</p>;
    }

    if (!data) {
        return (
            <p className="text-red-600">
                Erro ao carregar dashboard. Verifique a API.
            </p>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

            <p className="mt-2 text-slate-600">
                Visão geral do API Gateway.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <Card title="Usuários" value={data.usersCount} icon={<Users />} />
                <Card title="Rotas" value={data.routesCount} icon={<Route />} />
                <Card title="JWT Secrets" value={data.jwtSecretsCount} icon={<KeyRound />} />
                <Card title="Logs" value={data.logsCount} icon={<ScrollText />} />
            </div>

            <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                    Últimas requisições
                </h2>

                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b text-slate-500">
                                <th className="py-3">Método</th>
                                <th className="py-3">URL</th>
                                <th className="py-3">Status</th>
                                <th className="py-3">Duração</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.recentLogs.map((log: any) => (
                                <tr key={log.id} className="border-b last:border-0">
                                    <td className="py-3 font-medium">{log.method}</td>
                                    <td className="py-3">{log.originalUrl}</td>
                                    <td className="py-3">{log.statusCode}</td>
                                    <td className="py-3">{log.durationMs}ms</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {data.recentLogs.length === 0 && (
                        <p className="py-6 text-center text-slate-500">
                            Nenhum log encontrado.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function Card({
    title,
    value,
    icon,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">{title}</p>

                    <strong className="mt-2 block text-3xl text-slate-900">
                        {value}
                    </strong>
                </div>

                <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                    {icon}
                </div>
            </div>
        </div>
    );
}