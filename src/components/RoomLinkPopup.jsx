import { FaWhatsapp, FaEnvelope, FaSms } from 'react-icons/fa'; // Add other icons if needed

export default function RoomLinkPopup({ roomId, setShowPopup }) {
  const roomLink = `${window.location.origin}/?roomId=${roomId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomLink);
    alert('Link copied to clipboard!');
  };

  const shareMessage = `Hey! Join my drawing room here 👇\n${roomLink}`;

  // Share URLs
const whatsappURL = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
const emailURL = `mailto:?subject=Join my drawing room&body=${encodeURIComponent(shareMessage)}`;
const smsURL = `sms:?body=${encodeURIComponent(shareMessage)}`;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white w-80 p-6 rounded-lg shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={() => setShowPopup(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>

        {/* Heading */}
        <h2 className="text-xl font-semibold text-center mb-4">
          Share Your Room Link
        </h2>

        {/* Share Icons */}
        <div className="flex justify-center gap-4 mb-4">
          {/* WhatsApp */}
          <a href={whatsappURL} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition">
            <FaWhatsapp size={24} />
          </a>

          {/* Email */}
          <a href={emailURL} className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition">
            <FaEnvelope size={24} />
          </a>

          {/* SMS */}
          <a href={smsURL} className="bg-purple-500 text-white p-3 rounded-full hover:bg-purple-600 transition">
            <FaSms size={24} />
          </a>
        </div>

        {/* Link Display */}
        <p className="text-center text-blue-600 font-medium mb-4 break-words">
          {roomLink}
        </p>

        {/* Copy Button */}
        <button
          onClick={copyToClipboard}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
        >
          Copy Link
        </button>
      </div>
    </div>
  );
}
