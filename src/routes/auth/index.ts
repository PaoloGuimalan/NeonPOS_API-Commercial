require("dotenv").config();
import express, { Request, Response } from "express";
const router = express.Router();
import mongoose from "mongoose";

router.get('/', (req: Request, res: Response) => {
    res.send("Neon POS Auth API");
});

router.post('/login', (req: Request, res: Response) => {
    res.send("Neon POS Auth API");
});

export default router;