import login from "@/controllers/auth/login";
import { Application, Router } from "express";
import authenticateToken from "../middlewares/authenticateToken";
import whoami from "@/controllers/auth/whoami";

export default function (app: Router) {
    app.post("/login", login);
    app.get("/whoami", authenticateToken(null, 'admin', 'user'), whoami);
}