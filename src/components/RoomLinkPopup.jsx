

export default function RoomLinkPopup({roomId,setShowPopup}) {

  // Generate a room link dynamically with uuid
  const roomLink = `${window.location.origin}/?roomId=${roomId}`;

  // Copy room link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomLink);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-center min-h-screen">
   
   
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-80 p-6 rounded-lg shadow-lg relative">
            {/* Close button */}
            <button
              onClick={()=>setShowPopup(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              &times;
            </button>

            {/* Heading */}
            <h2 className="text-xl font-semibold text-center mb-4">
              Share Your Room Link
            </h2>

            {/* Link Display */}
            <p className="text-center text-blue-600 font-medium mb-4 break-words">
              {roomLink}
            </p>

            {/* Copy Link Button */}
            <button
              onClick={copyToClipboard}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
            >
              Copy Link
            </button>
          </div>
        </div>

    </div>
  );
}
