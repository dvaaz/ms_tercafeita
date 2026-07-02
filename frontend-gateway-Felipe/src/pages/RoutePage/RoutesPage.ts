import { useEffect, useState } from "react";
import { createRoute, deleteRoute, getRoutes, updateRoute } from "../../services/routes.service";
import type { CreateRouteConfigRequest, RouteConfig } from "../../types/route";

export function useRoutesPage() {
    const [routes, setRoutes] = useState<RouteConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [routeToEdit, setRouteToEdit] = useState<RouteConfig | null>(null);

    async function loadRoutes() {
        try {
            setLoading(true);
            const data = await getRoutes();
            setRoutes(data);
        } catch (error) {
            console.error("Erro ao buscar rotas", error);
            alert("Erro ao buscar rotas.");
        } finally {
            setLoading(false);
        }
    }

    function handleOpenCreateModal() {
        setRouteToEdit(null);
        setIsModalOpen(true);
    }

    function handleOpenEditModal(route: RouteConfig) {
        setRouteToEdit(route);
        setIsModalOpen(true);
    }

    function handleCloseModal() {
        setIsModalOpen(false);
        setRouteToEdit(null);
    }

    async function handleSaveRoute(data: CreateRouteConfigRequest) {
        if (routeToEdit) {
            await updateRoute(routeToEdit.id, data);
        } else {
            await createRoute(data);
        }

        await loadRoutes();
    }

    async function handleDelete(id: string) {
        const confirmDelete = window.confirm("Deseja realmente excluir esta rota?");

        if (!confirmDelete) return;

        try {
            await deleteRoute(id);
            await loadRoutes();
        } catch (error) {
            console.error("Erro ao excluir rota", error);
            alert("Erro ao excluir rota.");
        }
    }

    useEffect(() => {
        loadRoutes();
    }, []);

    return {
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
    };
}