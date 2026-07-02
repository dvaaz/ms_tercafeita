import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth.service";

export function useLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Informe o e-mail e a senha.");
            return;
        }

        try {
            setLoading(true);

            const response = await login({
                email,
                password,
            });

            localStorage.setItem("gateway_token", response.accessToken);
            localStorage.setItem("gateway_refresh_token", response.refreshToken);

            navigate("/");
        } catch {
            setError("E-mail ou senha inválidos.");
        } finally {
            setLoading(false);
        }
    }

    return {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        error,
        handleSubmit,
    };
}