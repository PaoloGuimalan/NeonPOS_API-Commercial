import express from "express";
import mysql from "mysql";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import path from "path";
import socketIO from "socket.io";

const PORT = process.env.PORT || 3001;
const app = express();

import MongooseConnection from "./connections/index";

import API from './routes/index';

const connectMongo = async () => {
    return mongoose.connect(MongooseConnection.url);
}

app.use(bodyParser.urlencoded({
    limit: "200mb",
    extended: false
}));
app.use(bodyParser.json({
    limit: "200mb"
}));
app.use(express.json());
app.use(cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use('/api', API);

app.listen(PORT, () => {
    console.log(`Server Running: ${PORT}`);
    connectMongo().then(() => {
        console.log(`Connected to MongoDB`);
    }).catch((err) => {
        console.log(err);
    });
});