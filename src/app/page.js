"use client"
import { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useSearchParams } from 'next/navigation';
import { socket } from '../socket'
import RoomLinkPopup from "@/components/RoomLinkPopup"
//  import { useSession } from 'next-auth/react';
// import { useAuth } from "@/authenticationuser/useAuth";
import axios from "axios";
import { HiCursorClick } from "react-icons/hi";
import { Suspense } from 'react';
import { useToast } from "@/hooks/use-toast";


export default function Paint(request) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaintContent request={request} />
    </Suspense>

  );

}

function PaintContent(request) {
  const searchParams = useSearchParams();
  const canvasRef = useRef(null);
  const profileOptions = useRef(null);
  const { toast } = useToast();
  const router = useRouter();


  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [history, setHistory] = useState([]); // Array to store canvas history for undo
  const [redoHistory, setRedoHistory] = useState([]); // Optional: Redo functionality
  const [roomId, setRoomId] = useState("");
  const [invitedFrnd, setInvitedFrnd] = useState(false);
  const [createdId, setCreatedId] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [frndName, setFrndName] = useState("");
  const [user, setUser] = useState("");
  const [frndCursorXY, setFrndcursorXY] = useState({ x: null, y: null });
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  // 
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  

  //  const { data: session } = useSession();
  //  const user = session?.user;
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await axios.get("/api/users/checkUser", {
          withCredentials: true,
        });
        console.log("User verified:", response.data);

        if (response.data.success) {
          setUser(response.data.userData);
          console.log("User verified:", response.data);
        } else {
          console.log("Verification failed.");
        }
      } catch (error) {
        console.log("Error verifying user:", error);
        if (error.response && error.response.status === 401) {
          console.log("Unauthorized, please log in again.");
        } else {
          console.log("Unexpected error occurred.");
        }
      }finally{
        setCheckingUser(false)
      }

    };

    checkUser();
  }, []);



  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);
  // 
  useEffect(() => {
    const idFromUrl = searchParams.get("roomId");

    if (idFromUrl) {
      setRoomId(idFromUrl);
      setInvitedFrnd(true)
      socket.emit("joinRoom", idFromUrl);
    }
    socket.on("draw", ({ color, brushSize, x, y, isDrawing }) => {
      drawOnCanvas(x, y, color, brushSize, isDrawing);
    });


    socket.on("frndName", (data) => {
      setFrndName(data);
    })

    return () => {
      socket.disconnect();
    };
  }, [searchParams])

  useEffect(() => {
    socket.emit("userName", { roomId, name: user?.fullName })

    socket.on("newUserJoined", () => {
      socket.emit("userName", { roomId, name: user.fullName })
    })
    socket.on("frndCursorXY", (data) => {
      const { x, y } = data;
      setFrndcursorXY({ x, y })
    })
    
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };

  }, [roomId, user])


  const handleClickOutside = (event) => {
    if (profileOptions.current && !profileOptions.current.contains(event.target)) {
      setShowUserPopup(false)
    }
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Save the current canvas image data
      const imageData = canvas.toDataURL();
      setHistory((prevHistory) => [...prevHistory, imageData]);
      setRedoHistory([]); // Clear redo history when a new action is taken
    }
  };


  const createRoom = async () => {
    const newRoomId = uuidv4();
    setCreatedId(newRoomId)
    setRoomId(newRoomId);
    socket.emit("joinRoom", newRoomId);
    setFrndName("")
  }

  const drawOnCanvas = (x, y, color, brushSize, isDrawing) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";

    if (isDrawing) {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath(); // Start a new path to prevent joining with previous strokes
      ctx.moveTo(x, y);
    }
  };

  const draw = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    socket.emit("frndCursor", { roomId, x, y });
    if (!isDrawing) return;

    // Emit the new point with isDrawing set to true
    socket.emit("drawing", { roomId, color, brushSize, x, y, isDrawing: true });

    // Draw on the local canvas
    drawOnCanvas(x, y, color, brushSize, true);
  };

  const startDrawing = (e) => {
    saveToHistory(); // Save the current canvas state before starting a new drawing
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    setIsDrawing(true);

    // Start a new path and draw on the local canvas
    drawOnCanvas(x, y, color, brushSize, false);

    // Emit the initial point with isDrawing set to true
    socket.emit("drawing", { roomId, color, brushSize, x, y, isDrawing: false });
  };


  const stopDrawing = (e) => {
    setIsDrawing(false);
    socket.emit("drawing", { roomId, color, brushSize, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, isDrawing: false });
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath(); // Reset path after drawing
  };



  const undo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Remove the last action from history and add it to redo history (optional)
    const previousState = history[history.length - 1];
    setRedoHistory((prevRedoHistory) => [...prevRedoHistory, previousState]);
    setHistory((prevHistory) => prevHistory.slice(0, -1));

    const lastImage = history[history.length - 1]; // Get the second-to-last image
    if (lastImage) {
      const img = new Image();
      img.src = lastImage;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        ctx.beginPath(); // Reset path to prevent reappearing drawings
      };
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath(); // Reset path after clear
    }

    // Emit undo event to other clients
    socket.emit("undo", roomId);
  };

  // Listen for undo event from other clients
  socket.on("undo", () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const lastImage = history[history.length - 2]; // Get the second-to-last image
    if (lastImage) {
      const img = new Image();
      img.src = lastImage;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        ctx.beginPath(); // Reset path to prevent reappearing drawings
      };
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath(); // Reset path after clear
    }
  });


  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory(); // Save the cleared canvas to history
    ctx.beginPath(); // Reset path to prevent reappearing drawings

    // Emit clear event to other clients
    socket.emit("clear", roomId);
  };

  // Listen for clear event from other clients
  socket.on("clear", () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); // Reset path after clear
  });


  const handleLogout = async () => {
    try {
      // Call the logout API route to clear the cookies on the server
      const response = await axios.get('/api/users/logout');
  
      // Optionally, handle additional logout-related actions here, such as redirecting the user
      if (response.status === 200) {
        toast({
          title: 'Logged Out',
          description: 'Cockies Cleared Successfully',
        });
       setUser("")
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex flex-col p-4 min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-gray-50 text-gray-800">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-extrabold text-blue-700">Web Paint</h1>
          <div className="flex flex-wrap items-center space-x-2 mt-4 justify-center sm:justify-start">
            <button onClick={undo} className="p-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-blue-100 transition duration-300">
              Undo
            </button>
            <button onClick={clearCanvas} className="p-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-red-100 transition duration-300">
              Clear
            </button>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="p-2 rounded-full border border-gray-300 w-10 h-10"
            />
            <div className="flex items-center">
              <select
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:border-blue-500 transition duration-300"
              >
                {[5, 10, 15, 20].map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <span className="ml-2 font-semibold text-sm text-gray-700">Brush Size</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {frndName !== "" && (
            <div className="flex items-center">
              <h1>You are connected with</h1>
              <h1 className="text-blue-700 font-bold font-serif ml-1 text-lg">{frndName}</h1>
            </div>
          )}
          {!invitedFrnd && (
            user ? (
              <div className="flex items-center mt-4 sm:mt-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    createRoom();
                    setShowPopup(true); // Show popup on button click
                  }}
                  className="p-1 px-3 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 transition duration-300"
                >
                  Paint with Your Friend
                </button>
              </div>
            ) : (
              <div className="flex items-center mt-4 sm:mt-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/sign-in")
                  }}
                  className="p-2 px-4 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 transition duration-300"
                >
                 {checkingUser ? "checking..." : "Login To Draw With Friends"}
                </button>
              </div>
            )
          )}

          {/* User Avatar and Logout Popup */}
          {user && (

            <div className="relative">
              <img
                src={user.avatar}
                alt="User Avatar"
                className="w-10 h-10 rounded-full cursor-pointer"
                onClick={() => setShowUserPopup(!showUserPopup)}
              />
              {showUserPopup && (
                <div ref={profileOptions} className="absolute top-12 right-0 bg-white p-2 rounded-lg shadow-md">
                  <button
                    onClick={handleLogout}
                    className="text-gray-800 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </header>

      {showPopup && <RoomLinkPopup roomId={createdId} setShowPopup={setShowPopup} />}

      <main className="flex flex-col items-center">
        <div className="relative w-full max-w-4xl border-2 border-gray-300 rounded-lg overflow-hidden shadow-md bg-white">
          <canvas
            ref={canvasRef}
            width="1000"
            height="515"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}

            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {/* Friend's Cursor */}
          {frndCursorXY.x !== null && frndCursorXY.y !== null && (
            <div
              className="absolute"
              style={{
                left: `${frndCursorXY.x}px`,
                top: `${frndCursorXY.y}px`,
              }}
            >
              <HiCursorClick
                className="text-blue-500"
                style={{
                  transform: "translate(-50%, -50%)",
                  fontSize: "24px",
                }}
              />
            </div>
          )}
        </div>

        {/* Color Selection Row - No Scroll */}
        <div className="flex mt-6 space-x-2 flex-wrap justify-center">
          {["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FFA500", "#800080", "#FFFFFF"].map((clr) => (
            <button
              key={clr}
              onClick={() => setColor(clr)}
              className="w-10 h-10 rounded-full border border-gray-300 shadow-sm"
              style={{ backgroundColor: clr }}
            ></button>
          ))}
        </div>
      </main>
    </div>
  );



}