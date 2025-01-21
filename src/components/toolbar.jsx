import { useState } from 'react';
import { IoTriangleOutline, IoRemoveOutline, IoEllipseOutline } from "react-icons/io5";
import { FaLongArrowAltRight, FaRegCircle } from "react-icons/fa";
import { RiRectangleLine } from "react-icons/ri";
import { CiStar } from "react-icons/ci";
import { MdDraw, MdClear } from "react-icons/md";
import { SlActionUndo } from "react-icons/sl";

function Toolbar({ undo, clearCanvas, color, setColor, brushSize, setBrushSize, drawingMode, setDrawingMode ,initiateCall}) {
  return (
    <div className="text-center sm:text-left">
      <div className='flex gap-1'>
      <img src='/sync-draw-logo.ico' alt="Sync Draw Logo" className="h-12 w-auto" />
      <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 ">Sync Draw</h1>
      </div>
    
      <div className="flex flex-wrap items-center space-x-2 mt-4 justify-center sm:justify-start">
        {/* Undo and Clear buttons */}
        <button
          onClick={undo}
          className="p-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-blue-100 transition duration-300 flex items-center"
        >
          <SlActionUndo className="mr-2" /> Undo
        </button>
        <button
          onClick={clearCanvas}
          className="p-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-red-100 transition duration-300 flex items-center"
        >
          <MdClear className="mr-2" /> Clear
        </button>

        {/* Color Picker */}
        <input
          title='color'
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="p-2 rounded-full border border-gray-300 w-10 h-10 cursor-pointer "
        />

        {/* Brush Size Selector */}
        <div className="flex items-center">
           
          <select
            title='brush size'
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

        {/* Tool Icons */}
        <div className="flex space-x-2 mt-4 ">
            {/* <h1 className=' font-semibold font-serif '>Shapes</h1> */}
          <button
            onClick={() => setDrawingMode("freehand")}
            className={`p-2 border rounded-lg shadow-sm transition duration-300 ${
              drawingMode === "freehand" ? "bg-blue-200 border-blue-500" : "bg-white border-gray-300"
            }`}
            title="Freehand"
          >
            <MdDraw size={20} />
          </button>
          <button
            onClick={() => setDrawingMode("circle")}
            className={`p-2 border rounded-lg shadow-sm transition duration-300 ${
              drawingMode === "circle" ? "bg-blue-200 border-blue-500" : "bg-white border-gray-300"
            }`}
            title="Circle"
          >
            <FaRegCircle size={20} />
          </button>
          <button
            onClick={() => setDrawingMode("rectangle")}
            className={`p-2 border rounded-lg shadow-sm transition duration-300 ${
              drawingMode === "rectangle" ? "bg-blue-200 border-blue-500" : "bg-white border-gray-300"
            }`}
            title="Rectangle"
          >
            <RiRectangleLine size={20} />
          </button>
          <button
            onClick={() => setDrawingMode("line")}
            className={`p-2 border rounded-lg shadow-sm transition duration-300 ${
              drawingMode === "line" ? "bg-blue-200 border-blue-500" : "bg-white border-gray-300"
            }`}
            title="Line"
          >
            <IoRemoveOutline size={20} />
          </button>
          <button
            onClick={() => setDrawingMode("arrow")}
            className={`p-2 border rounded-lg shadow-sm transition duration-300 ${
              drawingMode === "arrow" ? "bg-blue-200 border-blue-500" : "bg-white border-gray-300"
            }`}
            title="Arrow"
          >
            <FaLongArrowAltRight size={20} />
          </button>
          <button
            onClick={() => setDrawingMode("ellipse")}
            className={`p-2 border rounded-lg shadow-sm transition duration-300 ${
              drawingMode === "ellipse" ? "bg-blue-200 border-blue-500" : "bg-white border-gray-300"
            }`}
            title="Ellipse"
          >
            <IoEllipseOutline size={20} />
          </button>
          <button
            onClick={() => setDrawingMode("triangle")}
            className={`p-2 border rounded-lg shadow-sm transition duration-300 ${
              drawingMode === "triangle" ? "bg-blue-200 border-blue-500" : "bg-white border-gray-300"
            }`}
            title="Triangle"
          >
            <IoTriangleOutline size={20} />
          </button>
          <button
            onClick={() => setDrawingMode("star")}
            className={`p-2 border rounded-lg shadow-sm transition duration-300 ${
              drawingMode === "star" ? "bg-blue-200 border-blue-500" : "bg-white border-gray-300"
            }`}
            title="Star"
          >
            <CiStar size={20} />
          </button>
        </div>
      </div>
       {/* Call Button */}
       {/* <button
        onClick={initiateCall}
        className="p-2 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-green-100 transition duration-300"
        title="Start Audio Call"
      >
        Start Call
      </button> */}
    </div>
  );
}

export default Toolbar;
