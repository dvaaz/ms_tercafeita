import { useEffect, useState } from "react";
import { getDashboardData } from "../../services/Dashboard.service";

export function useDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    async function loadDashboard() {
        try {
            setLoading(true);

            const result = await getDashboardData();

            setData(result);
        } catch (error) {
            console.error("Erro ao carregar dashboard", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    return {
        data,
        loading,
    };
}