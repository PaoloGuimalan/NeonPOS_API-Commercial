require("dotenv").config();
import express, { Request, Response } from "express";
const router = express.Router();
import mongoose from "mongoose";

import Auth from './auth/index';

router.use('/auth', Auth);

router.get('/', (req: Request, res: Response) => {
    res.send("Neon POS API v1.1");
})

export default router;