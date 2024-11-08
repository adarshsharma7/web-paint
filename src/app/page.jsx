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
import { GoArrowSwitch } from "react-icons/go";


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
  const canvasRef2 = useRef(null);
  const profileOptions = useRef(null);
  const touchCanvasRef = useRef(null);


  const { toast } = useToast();
  const router = useRouter();


  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [history, setHistory] = useState([]); // Array to store canvas history for undo
  const [history2, setHistory2] = useState([]); // Array to store canvas history for undo
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
  const [isTwoCanvas, setIsTwoCanvas] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // 
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");


  const [windowWidth, setWindowWidth] = useState(null);

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
      } finally {
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
    socket.on("draw", ({ color, brushSize, x, y, isDrawing, saveHistory }) => {

      if (canvasRef2.current && saveHistory) {

        saveToHistory(true)
      }
      drawOnCanvas(x, y, color, brushSize, isDrawing, true);
    });


    socket.on("frndName", (data) => {
      setFrndName(data);
    })

    return () => {
      socket.disconnect();
    };
  }, [])


  useEffect(() => {
    socket.emit("userName", { roomId, name: user?.fullName })

    socket.on("newUserJoined", () => {
      socket.emit("userName", { roomId, name: user.fullName })
    })
    socket.on("frndCursorXY", (data) => {
      const { x, y } = data;
      setFrndcursorXY({ x, y })
    })

    socket.emit("setIsTwoCanvas", { roomId, isTwoCanvas })

    socket.on("isTwoCanvas", (data) => {
      setIsTwoCanvas(data)

      setNotificationMessage(`${frndName} has ${data ? "split" : "merged"} the screen`);
      setShowNotification(true);


      // Automatically hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 4000);
      return () => {
        socket.off("isTwoCanvas");
      };

    })


  }, [roomId, user, isTwoCanvas])


  useEffect(() => {
    // Listen for undo event from other clients
    socket.on("undo", () => {
      const canvas = (canvasRef2.current) ? canvasRef2.current : canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (canvasRef2.current) {
        setHistory2((prevHistory) => {
          const newHistory = prevHistory.slice(0, -1); // Latest history update
          const lastImage = newHistory[newHistory.length - 1]; // Get last image from updated history

          if (lastImage) {
            console.log("hiii mister");
            const img = new Image();
            img.src = lastImage;
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              ctx.beginPath(); // Reset path to prevent reappearing drawings
            };
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
          }

          return newHistory; // Return updated history
        });
      } else {
        setHistory((prevHistory) => {
          const newHistory = prevHistory.slice(0, -1); // Latest history update
          const lastImage = newHistory[newHistory.length - 1]; // Get last image from updated history

          if (lastImage) {
            console.log("hiii mister");
            const img = new Image();
            img.src = lastImage;
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              ctx.beginPath();
            };
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
          }

          return newHistory; // Return updated history
        });
      }
    });


    // Listen for clear event from other clients
    socket.on("clear", () => {
      const canvas = canvasRef2.current ? canvasRef2.current : canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath(); // Reset path after clear
    });
  }, []);


  useEffect(() => {
    // Update window width on resize
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
    }
    const handleResize = () => setWindowWidth(window.innerWidth);
    const handleTouchMove = (e) => {
      if(touchCanvasRef.current && touchCanvasRef.current.contains(event.target)){
        e.preventDefault(); // Prevent default behavior (scrolling, zooming)
      }
     
    };

    const handleClickOutside = (event) => {
      if (profileOptions.current && !profileOptions.current.contains(event.target)) {
        setShowUserPopup(false)
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener('click', handleClickOutside, true);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });


    // Cleanup on unmount
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener('click', handleClickOutside, true);
    }
  }, []);





  function saveToHistory(isFrnd) {
    const canvas = (canvasRef2.current && isFrnd) ? canvasRef2.current : canvasRef.current;

    if (canvas) {
      // Save the current canvas image data
      const imageData = canvas.toDataURL();
      if (canvasRef2.current && isFrnd) {

        setHistory2((prevHistory) => [...prevHistory, imageData]);
      } else {

        setHistory((prevHistory) => [...prevHistory, imageData]);
      }

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

  const drawOnCanvas = (x, y, color, brushSize, isDrawing, isFrnd) => {

    const canvas = (canvasRef2.current && isFrnd) ? canvasRef2.current : canvasRef.current;

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
    drawOnCanvas(x, y, color, brushSize, true, false);
  };

  const startDrawing = (e) => {
    saveToHistory(); // Save the current canvas state before starting a new drawing
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    setIsDrawing(true);

    // Start a new path and draw on the local canvas
    drawOnCanvas(x, y, color, brushSize, false, false);

    // Emit the initial point with isDrawing set to true
    socket.emit("drawing", { roomId, color, brushSize, x, y, isDrawing: false, saveHistory: true });
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
    socket.emit("Undo", roomId);


  };


  const clearCanvas = () => {

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory(); // Save the cleared canvas to history
    ctx.beginPath(); // Reset path to prevent reappearing drawings


    socket.emit("Clear", roomId);

  }

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






  // Touch Event Handlers for Mobile
  const startDrawingTouch = (e) => {
    e.preventDefault(); // Prevent default touch behavior (scrolling, zooming)

    if (e.touches && e.touches.length > 0) {
      saveToHistory()
      const canvasRect = e.target.getBoundingClientRect();
      const x = e.touches[0].clientX - canvasRect.left;
      const y = e.touches[0].clientY - canvasRect.top;
      setIsDrawing(true);
      drawOnCanvas(x, y, color, brushSize, false, false);
      socket.emit("drawing", { roomId, color, brushSize, x, y, isDrawing: true });
    }
  };

  const drawTouch = (e) => {
    if (e.touches && e.touches.length > 0) {
      const canvasRect = e.target.getBoundingClientRect();
      const x = e.touches[0].clientX - canvasRect.left;
      const y = e.touches[0].clientY - canvasRect.top;
      socket.emit("frndCursor", { roomId, x, y });
      if (!isDrawing) return;
      socket.emit("drawing", { roomId, color, brushSize, x, y, isDrawing: true });
      drawOnCanvas(x, y, color, brushSize, true, false);
    }
  };

  const stopDrawingTouch = (e) => {
    if (e.touches && e.touches.length > 0) {
      const canvasRect = e.target.getBoundingClientRect();
      const x = e.touches[0].clientX - canvasRect.left;
      const y = e.touches[0].clientY - canvasRect.top;
      setIsDrawing(false);
      socket.emit("drawing", { roomId, color, brushSize, x, y, isDrawing: false });
      const ctx = canvasRef.current.getContext("2d");
      ctx.beginPath(); // Reset path after drawing
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
                <div ref={profileOptions} className="z-50 absolute top-12 right-0 bg-white p-2 rounded-lg shadow-md">
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

      <main className={` flex items-center ${isTwoCanvas ? "justify-between" : "justify-center"} ${windowWidth < 1092 && "flex-wrap"}`}>
        <div ref={touchCanvasRef} className="flex flex-col items-center w-full">

          {/* Left (Original) Canvas */}
          <div className="relative w-full max-w-4xl border-2 border-gray-300 rounded-lg overflow-hidden shadow-md bg-white">
            <canvas
              ref={canvasRef}
              width={windowWidth > 768 && isTwoCanvas ? 500 : windowWidth} // Adjust width dynamically based on screen size
              height="515"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawingTouch}
              onTouchMove={drawTouch}
              onTouchEnd={stopDrawingTouch}
            />
            {/* Friend's Cursor */}
            {!isTwoCanvas && frndCursorXY.x !== null && frndCursorXY.y !== null && (
              <div
                className="absolute"
                style={{
                  left: `${frndCursorXY.x}px`,
                  top: `${frndCursorXY.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <HiCursorClick className="text-blue-500 text-2xl" />
              </div>
            )}
          </div>

          {/* Color Selection Row */}
          <div className="flex mt-6 space-x-2 flex-wrap justify-center">
            {["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FFA500", "#800080", "#FFFFFF"].map((clr) => (
              <button
                key={clr}
                onClick={() => setColor(clr)}
                className="w-10 h-10 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: clr }}
              />
            ))}
          </div>
        </div>

        {/* Toggle Button */}
        {frndName !== "" && (
          <div
            className=" relative group mx-4 cursor-pointer"
            onClick={() => setIsTwoCanvas(!isTwoCanvas)}
          >
            <GoArrowSwitch />
            {/* Tooltip */}
            <div
              className="z-50 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          bg-gray-700 text-white text-xs px-3 py-1 rounded shadow-lg
          group-hover:block hidden"
            >
              {isTwoCanvas ? "Merge Canvas" : "Split Canvas"}
            </div>
          </div>
        )}

        {/* Right Canvas */}
        {isTwoCanvas && (
          <div className="flex flex-col items-center w-full">
            <div className="relative w-full max-w-4xl border-2 border-gray-300 rounded-lg overflow-hidden shadow-md bg-white">
              <canvas
                ref={canvasRef2}
                width={windowWidth > 768 ? 500 : windowWidth}
                height="515"
              />
              {/* Friend's Cursor on Right Canvas */}
              {frndCursorXY.x !== null && frndCursorXY.y !== null && (
                <div
                  className="absolute"
                  style={{
                    left: `${frndCursorXY.x}px`,
                    top: `${frndCursorXY.y}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <HiCursorClick className="text-blue-500 text-2xl" />
                </div>
              )}
            </div>

            {/* Friend's Name */}
            <div className="flex mt-[37.5px] space-x-2 flex-wrap justify-center">
              <h1 className="text-center">{frndName}</h1>
              <h3 className="text-center font-serif text-blue-800">canvas</h3>
            </div>
          </div>
        )}
      </main>


      {/* Notification */}
      {showNotification && (
        <div
          className={`fixed ${showNotification ? "translate-y-0" : "-translate-y-full"} 
          transition-transform duration-500 ease-out bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg
          ${isTwoCanvas ? "top-4" : "bottom-4"} left-1/2 transform -translate-x-1/2`}
          style={{ zIndex: 1000 }}
        >
          {notificationMessage}
        </div>
      )}

    </div>
  );



}