"use client";

import { io } from "socket.io-client";

export const socket = io("https://webpaintwebsocketserver-production.up.railway.app");