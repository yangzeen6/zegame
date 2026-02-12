import { createWebSocketServer } from "@/adapters/index.js";
import { connectDatabase } from "@/database/index.js";
import { launch } from "./core/index.js";
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.URL as string;
const db_name = process.env.DB_NAME as string;

createWebSocketServer({host:process.env.HOST, port:+(process.env.PORT||3434)});
await connectDatabase(url, db_name);


await launch(process.env.ADMIN as string);