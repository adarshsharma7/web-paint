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
import { drawShape } from "@/components/drawshape";
import Toolbar from "@/components/toolbar";
import SplashScreen from "@/components/SplashScreen";


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
  let peerConnection = useRef(null);
  let callTimer = useRef(null);


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

  const [showNotification, setShowNotification] = useState({ notification: false, isFrndMsg: false });
  const [notificationMessage, setNotificationMessage] = useState("");

  // 
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const [drawingMode, setDrawingMode] = useState("freehand");
  const [startX, setStartX] = useState(0); // Starting X for shape
  const [startY, setStartY] = useState(0); // Starting Y for shap

  const [windowWidth, setWindowWidth] = useState(null);

  const [showCallPopup, setShowCallPopup] = useState(true);
  const [callerSocketId, setCallerSocketId] = useState(null);
  const [receivedOffer, setReceivedOffer] = useState(null);  // Store offer
  const [friendSocketId, setFriendSocketId] = useState(null); // for the friend’s socket ID

  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [showCallActivePopup, setShowCallActivePopup] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callActive, setCallActive] = useState(false); // Track active call state

  const [isLoading, setIsLoading] = useState(true);
  const [msgInput, setMsgInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(true);


  //  const { data: session } = useSession();
  //  const user = session?.user;
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await axios.get("/api/users/checkUser", {
          withCredentials: true,
        });
        // console.log("User verified:", response.data);

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
    socket.on("draw", ({ color, brushSize, x, y, isDrawing, saveHistory, frndDrawingMode }) => {

      if (canvasRef2.current && saveHistory) {

        saveToHistory(true)
      }
      drawOnCanvas(x, y, color, brushSize, isDrawing, true, frndDrawingMode);
    });

    socket.on("drawShape", ({ startX, startY, x, y, drawingMode, color, brushSize }) => {
      let ctx;
      if (canvasRef2.current) {
        ctx = canvasRef2.current.getContext("2d");
      } else {
        ctx = canvasRef.current.getContext("2d");
      }

      drawShape(ctx, startX, startY, x, y, drawingMode, color, brushSize);
    })


    socket.on("frndName", (data) => {
      setFrndName(data || "Unknown");
    })

    return () => {
      socket.disconnect();
    };
  }, [])


  useEffect(() => {
    socket.emit("userName", { roomId, name: user?.fullName })

    socket.on("newUserJoined", ({ frndSocketId }) => {
      setFriendSocketId(frndSocketId)
      setShowCallPopup(true)
      socket.emit("userName", { roomId, name: user.fullName })
    })
    socket.on("frndCursorXY", (data) => {
      const { x, y } = data;
      setFrndcursorXY({ x, y })
    })

    socket.emit("setIsTwoCanvas", { roomId, isTwoCanvas })

    socket.on("recieveMsg", ({ msgInput, socketId }) => {

      if (socketId != socket.id) {
        // Automatically hide notification after 3 seconds
        setNotificationMessage(`${frndName} : ${msgInput}`);
        setShowNotification({ notification: true, isFrndMsg: true });

        setTimeout(() => {
          setShowNotification({ notification: false, isFrndMsg: false });
        }, 4000)

      }


    })

    socket.on("isTwoCanvas", ({ isTwoCanvas, socketId }) => {
      if (socketId != socket.id) {
        setIsTwoCanvas(isTwoCanvas)

        setNotificationMessage(`${frndName} has ${isTwoCanvas ? "split" : "merged"} the screen`);
        setShowNotification({ notification: true, isFrndMsg: false });

        // Automatically hide notification after 3 seconds

        setTimeout(() => {
          setShowNotification({ notification: false, isFrndMsg: false });
        }, 4000)
      }



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
      if (touchCanvasRef.current && touchCanvasRef.current.contains(event.target)) {
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




  // Setup call listeners
  useEffect(() => {
    // Listen for incoming call
    socket.on("receiveCall", ({ offer, from }) => {
      setCallerSocketId(from);
      setReceivedOffer(offer);
      setShowIncomingCall(true);
    });

    // Handle when the call is answered
    socket.on("callAnswered", async ({ answer }) => {

      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        setShowCallActivePopup(true);
        socket.emit("callDurationOn")
      }
    });
    socket.on("callDurationON", () => {
      startCallTimer();
    })

    // Handle ICE candidates
    socket.on("receiveIceCandidate", async ({ candidate }) => {
      console.log("Received ICE candidate:", candidate);
      if (peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ice candidate:", err);
        }
      }
    });

    // Handle when the call ends
    socket.on("callEnded", ({ socketId }) => {
      setCallActive(false)
      setShowCallPopup(true)
      setShowIncomingCall(false)
      endCallCleanup();
      if (socketId != socket.id) {
        setNotificationMessage(`${frndName} ended the call`);
        setShowNotification({ notification: true, isFrndMsg: false });
        // Automatically hide notification after 3 seconds
        {
          setTimeout(() => {
            setShowNotification({ notification: false, isFrndMsg: false });
          }, 4000)
        }
      }

    });


    socket.on("callDeclined", () => {
      endCallCleanup();
      setShowIncomingCall(false);
    });

    return () => {
      socket.off("receiveCall");
      socket.off("callAnswered");
      socket.off("receiveIceCandidate");
      socket.off("callEnded");
      socket.off("callDeclined");

    };
  }, []);


  const startCallTimer = () => {

    setCallDuration(0); // Reset duration before starting
    callTimer.current = setInterval(() => {
      setCallDuration((prevDuration) => prevDuration + 1);
    }, 1000);
  };

  const cleanupMediaStream = () => {
    const audio = document.getElementById("remoteAudio");
    if (audio && audio.srcObject) {
      audio.srcObject.getTracks().forEach(track => track.stop());
      audio.srcObject = null;
    }
  };

  const endCallCleanup = () => {
    cleanupMediaStream();
    if (callTimer.current) {
      clearInterval(callTimer.current); // Clear the timer
    }
    setCallDuration(0); // Reset duration
    setCallActive(false); // Set call status to false
    setShowCallPopup(true)
    if (peerConnection.current) {
      peerConnection.current.close(); // Close the connection
      peerConnection.current = null; // Nullify the peer connection
    }
  };

  // initiateCall function
  const initiateCall = async () => {
    // const configuration = {
    //   iceServers: [
    //     { urls: 'stun:stun.l.google.com:19302' },
    //   ]
    // };
    const iceConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          // Metered free TURN server
          urls: [
            'turn:a.relay.metered.ca:80',
            'turn:a.relay.metered.ca:80?transport=tcp',
            'turn:a.relay.metered.ca:443',
            'turn:a.relay.metered.ca:443?transport=tcp'
          ],
          username: "55ab14519b53962340a4cb0a",
          credential: "VbZcen6RUTYJgnoY"
        }
      ],
      iceCandidatePoolSize: 10
    };


    if (!peerConnection.current) peerConnection.current = new RTCPeerConnection(iceConfiguration);
    const audioConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };
    const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
    stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", { candidate: event.candidate, to: friendSocketId });
      }
    };

    peerConnection.current.ontrack = (event) => {
      const audio = document.getElementById("remoteAudio");
      audio.srcObject = event.streams[0];
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("callUser", { roomId, offer });
    setCallActive(true); // Mark call as active
    setShowCallPopup(false)
  };


  // Accept or Decline Call functions
  const acceptCall = async () => {
    setShowIncomingCall(false);
    setCallActive(true)
    setShowCallPopup(false)

    // const configuration = {
    //   iceServers: [
    //     { urls: 'stun:stun.l.google.com:19302' },

    //   ]
    // };
    const iceConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          // Metered free TURN server
          urls: [
            'turn:a.relay.metered.ca:80',
            'turn:a.relay.metered.ca:80?transport=tcp',
            'turn:a.relay.metered.ca:443',
            'turn:a.relay.metered.ca:443?transport=tcp'
          ],
          username: "55ab14519b53962340a4cb0a",
          credential: "VbZcen6RUTYJgnoY"
        }
      ],
      iceCandidatePoolSize: 10
    };

    peerConnection.current = new RTCPeerConnection(iceConfiguration);

    // Add media tracks (audio in this case)
    const audioConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };
    const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
    stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", { candidate: event.candidate, to: callerSocketId });
      }
    };

    peerConnection.current.ontrack = (event) => {
      const audio = document.getElementById("remoteAudio");
      audio.srcObject = event.streams[0];
    };

    // Ensure the offer is set first
    if (receivedOffer && peerConnection.current.signalingState === "stable") {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(receivedOffer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answerCall", { roomId, answer, to: callerSocketId });
    }
  };

  const declineCall = () => {
    setShowIncomingCall(false);

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null; // Reset peer connection for future calls
    }

    setCallActive(false);
    setShowCallPopup(true)
    socket.emit("declineCall", { roomId, to: callerSocketId });
  };


  // End the call manually
  const endCall = () => {
    endCallCleanup();
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    clearInterval(callTimer.current); // Stop the call timer
    setCallDuration(0); // Reset duration

    socket.emit("endCall", { roomId, to: callerSocketId }); // Notify the other user
  };


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

  // Drawing function with modes
  const drawOnCanvas = (x, y, color, brushSize, isDrawing, isFrnd, frndDrawingMode) => {
    const canvas = (canvasRef2.current && isFrnd) ? canvasRef2.current : canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";

    // Ensure we start a new path each time for freehand drawing
    if (drawingMode === "freehand" || frndDrawingMode === "freehand") {
      if (isDrawing) {
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    } else if (drawingMode === "circle" || drawingMode === "rectangle" || drawingMode === "line" || drawingMode === "arrow") {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing the shape preview
      restoreFromHistory(ctx); // Restore previous drawings
      ctx.beginPath(); // Start a new path for each shape to avoid extra lines
      drawShape(ctx, startX, startY, x, y, drawingMode, color, brushSize);
    }
  };


  // Freehand or shape drawing function
  const draw = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    socket.emit("frndCursor", { roomId, x, y });

    if (!isDrawing) return;

    if (drawingMode === "freehand") {
      socket.emit("drawing", { roomId, color, brushSize, x, y, isDrawing: true });
      drawOnCanvas(x, y, color, brushSize, true, false);
    }
  };


  // const draw = (e) => {
  //   const x = e.nativeEvent.offsetX;
  //   const y = e.nativeEvent.offsetY;
  //   socket.emit("frndCursor", { roomId, x, y });
  //   if (!isDrawing) return;

  //   // Emit the new point with isDrawing set to true
  //   socket.emit("drawing", { roomId, color, brushSize, x, y, isDrawing: true });

  //   // Draw on the local canvas
  //   drawOnCanvas(x, y, color, brushSize, true, false);
  // };


  // Starting a new drawing, initializing shape coordinates


  const startDrawing = (e) => {

    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath()
    saveToHistory(); // Save the current canvas state before new drawing
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    setStartX(x); // Set start coordinates for shapes
    setStartY(y);
    setIsDrawing(true);

    if (drawingMode === "freehand") {
      drawOnCanvas(x, y, color, brushSize, false, false);
      socket.emit("drawing", { roomId, color, brushSize, x, y, isDrawing: false, saveHistory: true });
    }
  };


  // Stopping the drawing and finalizing shapes


  const stopDrawing = (e) => {
    if (!isDrawing) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    setIsDrawing(false);

    const ctx = canvasRef.current.getContext("2d");

    if (drawingMode === "freehand") {
      socket.emit("drawing", { roomId, color, brushSize, x, y, isDrawing: false });

    } else {
      socket.emit("drawshape", { roomId, startX, startY, x, y, drawingMode, color, brushSize });
      drawShape(ctx, startX, startY, x, y, drawingMode, color, brushSize);

    }
    ctx.beginPath();
  };


  // Restore canvas from history for previewing shapes without permanent drawing
  const restoreFromHistory = (ctx) => {
    if (history.length === 0) return;

    const img = new Image();
    img.src = history[history.length - 1];
    img.onload = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear canvas before restoring
      ctx.drawImage(img, 0, 0);
    };
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
    e.preventDefault(); // Prevent default touch behavior
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();

    if (e.touches && e.touches.length > 0) {
      saveToHistory();
      const canvasRect = e.target.getBoundingClientRect();
      const x = e.touches[0].clientX - canvasRect.left;
      const y = e.touches[0].clientY - canvasRect.top;
      setStartX(x);
      setStartY(y);
      setIsDrawing(true);

      if (drawingMode === "freehand") {
        drawOnCanvas(x, y, color, brushSize, false, false);
        socket.emit("drawing", { roomId, color, brushSize, x, y, isDrawing: false, saveHistory: true });
      } else {
        // Emit start of shape drawing for collaborative sessions
        socket.emit("drawshape", { roomId, startX: x, startY: y, x, y, drawingMode, color, brushSize });
      }
    }
  };



  const drawTouch = (e) => {
    if (e.touches && e.touches.length > 0) {
      const canvasRect = e.target.getBoundingClientRect();
      const x = e.touches[0].clientX - canvasRect.left;
      const y = e.touches[0].clientY - canvasRect.top;
      socket.emit("frndCursor", { roomId, x, y });

      if (!isDrawing) return;

      if (drawingMode === "freehand") {
        socket.emit("drawing", { roomId, color, brushSize, x, y, isDrawing: true });
        drawOnCanvas(x, y, color, brushSize, true, false);
      } else {
        // Clear canvas and redraw for shape preview on touch
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        restoreFromHistory(ctx);
        drawShape(ctx, startX, startY, x, y, drawingMode, color, brushSize);
      }
    }
  };



  const stopDrawingTouch = (e) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      const canvasRect = e.target.getBoundingClientRect();
      const x = e.changedTouches[0].clientX - canvasRect.left;
      const y = e.changedTouches[0].clientY - canvasRect.top;
      setIsDrawing(false);

      const ctx = canvasRef.current.getContext("2d");

      if (drawingMode === "freehand") {
        socket.emit("drawing", { roomId, color, brushSize, x, y, isDrawing: false });
      } else {
        socket.emit("drawshape", { roomId, startX, startY, x, y, drawingMode, color, brushSize });
        drawShape(ctx, startX, startY, x, y, drawingMode, color, brushSize);
      }
      ctx.beginPath();
    }
  };

  // Callback to finish loading after splash screen disappears
  const finishLoading = () => setIsLoading(false);

  const sendMsg = () => {
    setMsgInput("")
    socket.emit("msg", { msgInput, roomId })
  }

  return (

    <>
      {isLoading ? (
        <SplashScreen finishLoading={finishLoading} />
      ) : (
        <div className="flex flex-col p-4 min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-gray-50 text-gray-800 fade-in">

          <div className={`fixed top-2 md:left-1/2 md:transform md:-translate-x-1/2 sm:right-2 w-full flex justify-end md:justify-center  left-1/2 transform -translate-x-1/2 max-w-sm  mt-2 z-50`}>
            {isMinimized ? (
              // Minimized View: Chat and Call buttons side by side
              <div className="fixed top-2 md:left-1/2 md:transform md:-translate-x-1/2 flex space-x-2">

                {/* Chat Button */}
                <div
                  className="bg-blue-600 text-white rounded-full cursor-pointer shadow-md p-1 px-3 transition-all duration-300 ease-out hover:bg-blue-700 flex items-center"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  <span className="text-sm font-medium">Chat</span>
                  <span className="ml-1 transform rotate-180">▼</span>
                </div>

                {/* Call Button */}
                <div
                  className={`rounded-full cursor-pointer shadow-md p-1 px-3 transition-all duration-300 ease-out flex items-center ${showCallPopup && user && frndName ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  onClick={showCallPopup && user && frndName ? initiateCall : null} // Prevent click when showCallPopup is false
                >
                  <span className="text-sm font-medium">Call</span>
                </div>

              </div>

            ) : (
              // Expanded View: Show the full input field and send button
              <div
                className={`shadow-md rounded-lg px-4 py-2 flex items-center space-x-3 transition-transform duration-300 ease-out fade-in`}
                style={{ transition: 'transform 0.3s ease-out', transform: 'translateY(0)' }}
              >
                {/* Chat header with dropdown icon */}
                <div className="flex justify-between w-full items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Enter something..."
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    className={`w-full p-2 text-sm rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200`}
                  />

                  {/* Button Container for spacing and alignment */}
                  <div className="flex space-x-2">
                    {/* Send Button */}
                    <button
                      type="submit"
                      onClick={frndName && user ? sendMsg  : null}
                      className={` ${frndName && user ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" : 'bg-gray-400 text-gray-200 cursor-not-allowed'} px-4 py-2 text-white font-semibold rounded-md transition-all duration-200 shadow-sm`}
                    >
                      Send
                    </button>

                    {/* Call Button */}
                    <button
                      onClick={showCallPopup && user && frndName ? initiateCall : null}
                      className={`px-4 py-2 text-white font-semibold rounded-md focus:outline-none focus:ring-2transition-all duration-200 shadow-sm ${showCallPopup && user && frndName ? " bg-green-500 hover:bg-green-600  focus:ring-green-500 " : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                    >
                      Call
                    </button>
                  </div>

                  {/* Arrow to collapse the input field */}
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="ml-2 p-1 text-gray-500 hover:text-blue-600 transition duration-300 ease-out"
                  >
                    ▲
                  </button>
                </div>

              </div>
            )}
          </div>
          {
             frndName && !user && (
          <div className="absolute top-4 md:left-1/3 md:transform md:-translate-x-1/2 sm:right-2 w-full flex justify-end md:justify-center  left-1/2 mt-2 items-center text-sm font-semibold">
            <span>Login to Chat and Call</span>

          </div>
          )
          }
         

          <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <Toolbar
              undo={undo}
              clearCanvas={clearCanvas}
              color={color}
              setColor={setColor}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              drawingMode={drawingMode}
              setDrawingMode={setDrawingMode}
            />

            {/* Right Section with Friend Info, Buttons, and Avatar */}
            <div className="flex gap-4 items-center justify-center flex-wrap mt-4 sm:mt-0">
              {/* Friend Connection Message */}
              {frndName && (
                <div className="flex items-center text-sm font-semibold">
                  <span>You are connected with </span>
                  <span className="text-blue-700 font-serif ml-1 text-lg">{frndName}</span>
                </div>
              )}

              {/* Paint with Friend or Login Button */}
              {!invitedFrnd && (
                user ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      createRoom();
                      setShowPopup(true); // Show popup on button click
                    }}
                    className="px-3 py-1 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 transition duration-300 text-sm"
                  >
                    Paint with Your Friend
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/sign-in");
                    }}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 transition duration-300 text-sm"
                  >
                    {checkingUser ? "Checking..." : "Login to Draw with Friends"}
                  </button>
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


            {/* Active Call Popup */}
            {callActive && (
              <div className="top-4 right-4 p-4 bg-blue-600 text-white rounded-md shadow-lg z-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">Call in progress...</p>
                    <p className="text-sm">Duration: {callDuration}s</p>
                  </div>
                  <button
                    onClick={endCall}
                    className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                  >
                    End Call
                  </button>
                </div>
              </div>
            )}

            {/* Incoming Call Popup */}
            {showIncomingCall && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
                  <h3 className="text-xl font-semibold mb-4 text-gray-700">Incoming Call</h3>
                  <div className="flex justify-between">
                    <button
                      onClick={acceptCall}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                    >
                      Accept
                    </button>
                    <button
                      onClick={declineCall}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Element for Remote Call */}
            <audio id="remoteAudio" autoPlay className="hidden" />

            {/* Optional Styling for Call Duration Popup */}
            {/* {callActive && (
          <div className="fixed bottom-4 left-4 p-4 bg-blue-500 text-white rounded-md shadow-md z-50">
            <span className="text-sm font-semibold">Call Duration: {callDuration}s</span>
          </div>
        )} */}

          </header>

          {showPopup && <RoomLinkPopup roomId={createdId} setShowPopup={setShowPopup} />}

          <main className={` flex items-center ${isTwoCanvas ? "justify-between" : "justify-center"} ${windowWidth < 1092 && "flex-wrap"}`}>


            <div className="flex flex-col items-center w-full">

              {/* Left (Original) Canvas */}
              <div ref={touchCanvasRef} className="relative w-full max-w-4xl border-2 border-gray-300 rounded-lg overflow-hidden shadow-md bg-white">
                <canvas
                  ref={canvasRef}
                  width={windowWidth > 768 && isTwoCanvas ? 720 : windowWidth} // Adjust width dynamically based on screen size
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
                    width={windowWidth > 768 ? 720 : windowWidth}
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

          {showNotification.notification && (
            <div
              className={`fixed transition-all duration-1000 ease-out transform bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg 
                ${showNotification.isFrndMsg != true && "bottom-2"} left-[45%] -translate-x-1/2`}
              style={{
                zIndex: 1000,
                animation: showNotification.isFrndMsg
                  ? "slideFromInput 0.5s forwards, fadeOut 0.5s 3s forwards"
                  : "",
              }}
            >
              {notificationMessage}
            </div>
          )}




        </div>
      )}
    </>


  );



}