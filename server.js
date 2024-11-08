import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit("newUserJoined");
      console.log(`Client ${socket.id} joined room ${roomId}`);
    });

    socket.on("drawing", (data) => {
      const { roomId, color, brushSize, x, y, isDrawing,saveHistory,frndDrawingMode } = data;
   
      if(saveHistory){
        socket.to(roomId).emit("draw", { color, brushSize, x, y, isDrawing, saveHistory,frndDrawingMode});
      }else{
        socket.to(roomId).emit("draw", { color, brushSize, x, y, isDrawing,frndDrawingMode });
      }
    
    });

    socket.on("drawshape", (data) => {
      const { roomId,startX, startY, x, y, drawingMode,color,brushSize } = data;
   
        socket.to(roomId).emit("drawShape", { startX, startY, x, y, drawingMode,color,brushSize });
    });

    socket.on("userName", (data) => {
      const { roomId, name } = data;
      socket.to(roomId).emit("frndName", name);
    });

    socket.on("frndCursor", (data) => {
      const { roomId, x, y } = data;
      socket.to(roomId).emit("frndCursorXY", { x, y });
    });

    socket.on("setIsTwoCanvas", (data) => {
    
      const { roomId, isTwoCanvas } = data;
      socket.to(roomId).emit("isTwoCanvas", isTwoCanvas);
    });
   
    socket.on("Undo", (roomId) => {
    
      socket.to(roomId).emit("undo");
    });

    socket.on("Clear", (roomId) => {
     
      socket.to(roomId).emit("clear");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});