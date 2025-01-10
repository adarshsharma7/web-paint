"use client";

import { io } from "socket.io-client";

export const socket = io("https://webpaintwebsocketserver.onrender.com");
//now- "https://webpaint.up.railway.app"
//"https://webpaintwebsocketserver-production.up.railway.app"




{/* <main className={`flex items-center ${isTwoCanvas ? "justify-between" : "justify-center"}`}> */}
{/* <div className="flex items-center justify-center"> */}
{/*  */}
{/* <div className="flex flex-col items-center"> */}
 // Left (Original) Canvas
  {/* <div className="relative w-full max-w-4xl border-2 border-gray-300 rounded-lg overflow-hidden shadow-md bg-white"> */}
    {/* <canvas */}
    //   ref={canvasRef}
    //   width={windowWidth > 768 && isTwoCanvas ? 720 : windowWidth} // Adjust width dynamically based on screen size
    //   height="515"
    //   onMouseDown={startDrawing}
    //   onMouseMove={draw}
    //   onMouseUp={stopDrawing}
    //   onMouseLeave={stopDrawing}
    //   onTouchStart={startDrawingTouch}
    //   onTouchMove={drawTouch}
    //   onTouchEnd={stopDrawingTouch}
    // />
   // Friend's Cursor
    {/* {!isTwoCanvas && frndCursorXY.x !== null && frndCursorXY.y !== null && ( */}
    //   <div
        // className="absolute"
        // style={{
        //   left: `${frndCursorXY.x}px`,
        //   top: `${frndCursorXY.y}px`,
        //   transform: "translate(-50%, -50%)",
        // }}
    //   >
        {/* <HiCursorClick className="text-blue-500 text-2xl" /> */}
      {/* </div> */}
    // )}
  {/* </div> */}
{/*  */}
 // Color Selection Row
  {/* <div className="flex mt-6 space-x-2 flex-wrap justify-center"> */}
    {/* {["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FFA500", "#800080", "#FFFFFF"].map((clr) => ( */}
    //   <button
        // key={clr}
        // onClick={() => setColor(clr)}
        // className="w-10 h-10 rounded-full border border-gray-300 shadow-sm"
        // style={{ backgroundColor: clr }}
    //   />
    // ))}
  {/* </div> */}
{/* </div> */}
{/*  */}
{/*  */}
//Toggle Button
{/* {frndName !== "" && ( */}
//   <div
    // className="relative group mx-4 cursor-pointer"
    // onClick={() => setIsTwoCanvas(!isTwoCanvas)}
//   >
    {/* <GoArrowSwitch /> */}
   // Tooltip
    {/* <div */}
    //   className="z-50 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
    //   opacity-0 group-hover:opacity-100 transition-opacity duration-200
    //   bg-gray-700 text-white text-xs px-3 py-1 rounded shadow-lg
    //   group-hover:block hidden"
    // >
      {/* {isTwoCanvas ? "Merge Canvas" : "Split Canvas"} */}
    {/* </div> */}
  {/* </div> */}
// )}
{/*  */}
{/*  */}
{/*  */}
//Right Canvas
{/* {isTwoCanvas && ( */}
//   <div className="flex flex-col items-center ">
    {/* <div className="relative w-full max-w-4xl border-2 border-gray-300 rounded-lg overflow-hidden shadow-md bg-white"> */}
      {/* <canvas */}
        // ref={canvasRef2}
        // width={windowWidth > 768 ? 720 : windowWidth}
        // height="515"
    //   />
  //    Friend's Cursor on Right Canvas
      {/* {frndCursorXY.x !== null && frndCursorXY.y !== null && ( */}
        // <div
        //   className="absolute"
        //   style={{
            // left: `${frndCursorXY.x}px`,
            // top: `${frndCursorXY.y}px`,
            // transform: "translate(-50%, -50%)",
        //   }}
        // >
          {/* <HiCursorClick className="text-blue-500 text-2xl" /> */}
        {/* </div> */}
    //   )}
    {/* </div> */}
{/*  */}
  //  Friend's Name
    {/* <div className="flex mt-[37.5px] space-x-2 flex-wrap justify-center"> */}
      {/* <h1 className="text-center">{frndName}</h1> */}
      {/* <h3 className="text-center font-serif text-blue-800">canvas</h3> */}
    {/* </div> */}
  {/* </div> */}
// )}
{/* </div> */}
{/* </main> */}