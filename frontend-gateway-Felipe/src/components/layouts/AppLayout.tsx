import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Route, KeyRound, ScrollText, Users, LogOut } from "lucide-react";
import { logout } from "../../services/auth.service";

const menuItems = [
    {
        label: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
    },
    {
        label: "Rotas",
        path: "/rotas",
        icon: Route,
    },
    {
        label: "JWT Secrets",
        path: "/jwt-secrets",
        icon: KeyRound,
    },
    {
        label: "Logs",
        path: "/logs",
        icon: ScrollText,
    },
    {
        label: "Usuários",
        path: "/usuarios",
        icon: Users,
    },
];

export function AppLayout() {
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="flex min-h-screen bg-slate-100">
            <aside className="w-72 bg-slate-950 text-white">
                <div className="px-6 py-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold">API Gateway</h1>
                    <p className="text-sm text-slate-400">Painel administrativo</p>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/"}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={18} />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-72 p-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-red-600 hover:text-white"
                    >
                        <LogOut size={18} />
                        Sair
                    </button>
                </div>
            </aside>

            <main className="flex-1">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    <div>
                        <h2 className="font-semibold text-slate-800">Gateway Admin</h2>
                        <p className="text-xs text-slate-500">
                            Monitoramento, rotas e segurança
                        </p>
                    </div>
                </header>

                <section className="p-8">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}