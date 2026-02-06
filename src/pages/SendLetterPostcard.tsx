import React, { useState } from "react";

const SendLetterPostcard: React.FC = () => {
  const [type, setType] = useState<"letter" | "postcard">("letter");
  const [toName, setToName] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");
    // TODO: Integrate with Lob API backend endpoint
    setTimeout(() => setStatus("Sent! (API integration pending)"), 1200);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Send Letter or Postcard
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => setType("letter")}
            className={`px-4 py-2 rounded ${type === "letter" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Letter
          </button>
          <button
            type="button"
            onClick={() => setType("postcard")}
            className={`px-4 py-2 rounded ${type === "postcard" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Postcard
          </button>
        </div>
        <div>
          <label className="block font-medium">To Name</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={toName}
            onChange={(e) => setToName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium">To Address</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium">From Name</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium">From Address</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium">Message</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
          />
        </div>
        {type === "postcard" && (
          <div>
            <label className="block font-medium">Upload Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Send {type === "letter" ? "Letter" : "Postcard"}
        </button>
        {status && (
          <div className="text-center mt-2 text-green-600">{status}</div>
        )}
      </form>
    </div>
  );
};

export default SendLetterPostcard;
