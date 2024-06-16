require("dotenv").config();
import express, { Request, Response } from "express";
const router = express.Router();
import mongoose from "mongoose";

import Auth from './auth/index';
import Settings from './settings/index';
import Menu from './menu/index';
import Orders from './orders/index';
import Accounting from './accounting/index';

router.use('/auth', Auth);
router.use('/settings', Settings);
router.use('/menu', Menu);
router.use('/orders', Orders);
router.use('/accounting', Accounting);

router.get('/', (req: Request, res: Response) => {
    res.send("Neon POS API v1.1");
})

export default router;