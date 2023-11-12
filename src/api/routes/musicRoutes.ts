import getAllMusic from "@/controllers/music/getAllMusic";
import { Router } from "express";
import authenticateToken from "../middlewares/authenticateToken";

export default function (app: Router) {
    app.get("/music", authenticateToken(true, 'user', 'admin'), getAllMusic)
}