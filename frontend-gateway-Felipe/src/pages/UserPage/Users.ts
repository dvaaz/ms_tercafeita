import { useEffect, useState } from "react";
import { createUser, deleteUser, getUsers, updateUser } from "../../services/Users.service";
import type { CreateUserRequest, UpdateUserRequest, User } from "../../types/User";

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("ADMIN");

    async function loadUsers() {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
            alert("Erro ao buscar usuários.");
        } finally {
            setLoading(false);
        }
    }

    function clearForm() {
        setEditingUser(null);
        setName("");
        setEmail("");
        setPassword("");
        setRole("ADMIN");
    }

    function handleEdit(user: User) {
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email);
        setPassword("");
        setRole(user.role);
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!name || !email || (!editingUser && !password)) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        if (editingUser) {
            const payload: UpdateUserRequest = {
                name,
                email,
                role,
            };

            if (password) {
                payload.password = password;
            }

            await updateUser(editingUser.id, payload);
        } else {
            const payload: CreateUserRequest = {
                name,
                email,
                password,
                role,
            };

            await createUser(payload);
        }

        clearForm();
        await loadUsers();
    }

    async function handleDelete(id: string) {
        const confirmed = confirm("Deseja realmente excluir este usuário?");

        if (!confirmed) return;

        await deleteUser(id);
        await loadUsers();
    }

    useEffect(() => {
        loadUsers();
    }, []);

    return {
        users,
        loading,
        editingUser,

        name,
        setName,
        email,
        setEmail,
        password,
        setPassword,
        role,
        setRole,

        loadUsers,
        clearForm,
        handleEdit,
        handleSubmit,
        handleDelete,
    };
}