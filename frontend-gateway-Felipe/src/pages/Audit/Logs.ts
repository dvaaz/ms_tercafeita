import { useEffect, useMemo, useState } from "react";
import type { RequestLog } from "../../types/request-logs";
import { getRequestLogs } from "../../services/logs.service";

export function useLogs() {
    const [logs, setLogs] = useState<RequestLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);

    async function loadLogs() {
        try {
            setLoading(true);

            const data = await getRequestLogs();

            setLogs(data);
        } catch (error) {
            console.error("Erro ao buscar logs", error);
            alert("Erro ao buscar logs.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadLogs();
    }, []);

    const filteredLogs = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) return logs;

        return logs.filter((log) => {
            return (
                log.method?.toLowerCase().includes(value) ||
                log.originalUrl?.toLowerCase().includes(value) ||
                log.targetUrl?.toLowerCase().includes(value) ||
                log.statusCode?.toString().includes(value) ||
                log.ip?.toLowerCase().includes(value)
            );
        });
    }, [logs, search]);

    function formatDate(date: string) {
        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "medium",
        }).format(new Date(date));
    }

    function getStatusClass(statusCode?: number | null) {
        if (!statusCode) {
            return "bg-slate-100 text-slate-700";
        }

        if (statusCode >= 200 && statusCode < 300) {
            return "bg-green-100 text-green-700";
        }

        if (statusCode >= 400 && statusCode < 500) {
            return "bg-yellow-100 text-yellow-700";
        }

        if (statusCode >= 500) {
            return "bg-red-100 text-red-700";
        }

        return "bg-slate-100 text-slate-700";
    }

    function getMethodClass(method: string) {
        switch (method.toUpperCase()) {
            case "GET":
                return "bg-blue-100 text-blue-700";
            case "POST":
                return "bg-green-100 text-green-700";
            case "PUT":
                return "bg-orange-100 text-orange-700";
            case "PATCH":
                return "bg-purple-100 text-purple-700";
            case "DELETE":
                return "bg-red-100 text-red-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    }

    return {
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
    };
}