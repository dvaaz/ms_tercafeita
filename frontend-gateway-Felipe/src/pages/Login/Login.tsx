import { ShieldCheck } from "lucide-react";
import { useLogin } from "./Login";

export function Login() {
    const {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        error,
        handleSubmit,
    } = useLogin();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white">
                        <ShieldCheck size={30} />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        API Gateway Admin
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Acesse o painel administrativo do Gateway
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            E-mail
                        </label>

                        <input
                            type="email"
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                            placeholder="admin@gateway.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Senha
                        </label>

                        <input
                            type="password"
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}