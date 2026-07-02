import { useEffect, useState } from "react";
import type { CreateRouteConfigRequest, RouteConfig } from "../../../types/route";

interface Props {
    routeToEdit: RouteConfig | null;
    onSave: (data: CreateRouteConfigRequest) => Promise<void>;
    onClose: () => void;
}

export function useModalNovaRota({
    routeToEdit,
    onSave,
    onClose,
}: Props) {
    const [name, setName] = useState("");
    const [method, setMethod] = useState("GET");
    const [path, setPath] = useState("");
    const [targetUrl, setTargetUrl] = useState("");
    const [requiresAuth, setRequiresAuth] = useState(true);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (routeToEdit) {
            setName(routeToEdit.name);
            setMethod(routeToEdit.method);
            setPath(routeToEdit.path);
            setTargetUrl(routeToEdit.targetUrl);
            setRequiresAuth(routeToEdit.requiresAuth);
        }
    }, [routeToEdit]);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        try {
            setLoading(true);

            await onSave({
                name,
                method,
                path,
                targetUrl,
                requiresAuth,
            });

            onClose();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar rota.");
        } finally {
            setLoading(false);
        }
    }

    return {
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
    };
}