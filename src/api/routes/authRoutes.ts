import login from "@/controllers/auth/login";
import { Application, Router } from "express";

export default function (app: Router) {
    app.post("/login", login);
}