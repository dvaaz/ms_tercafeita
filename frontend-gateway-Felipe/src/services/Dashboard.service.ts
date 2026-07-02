import { api } from "../api/axios";

export async function getDashboardData() {
  // const [users, routes, logs, jwtSecrets] = await Promise.all([
  //   api.get("/users/buscar-todos"),
  //   api.get("/route-configs"),
  //   api.get("/request-logs"),
  //   api.get("/jwt-secrets"),
  // ]);

  const [users, routes, logs] = await Promise.all([
    api.get("/users/buscar-todos"),
    api.get("/route-configs"),
    api.get("/request-logs"),    
  ]);

  return {
    usersCount: users.data.length,
    routesCount: routes.data.length,
    logsCount: logs.data.length,
    // jwtSecretsCount: jwtSecrets.data.length,
    recentLogs: logs.data.slice(0, 5),
  };
}