// src/components/professional/MailingSystem.tsx
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "../../lib/supabase";

const MailingSystem: React.FC = () => {
  const [recipient, setRecipient] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    propertyAddress: "",
  });

  const generateLOI = () => {
    const doc = new jsPDF();

    // Your LOI template from the document
    doc.setFontSize(12);
    doc.text("Melvin Lamont Evans", 20, 20);
    doc.text("14603 Gilmore street", 20, 27);
    doc.text("ph:(833)728-9278", 20, 34);

    doc.setFontSize(14);
    doc.text(`RE: ${recipient.propertyAddress}`, 20, 50);

    doc.setFontSize(12);
    doc.text(`Dear ${recipient.name}:`, 20, 65);

    // Add the three options from your LOI
    doc.text("Option 1: $745,000 Seller financing at 5% int./yr.", 20, 80);
    doc.text("Option 2: $735,000 15% down payment", 20, 90);
    doc.text("Option 3: $690,000 All Cash to Seller at closing", 20, 100);

    // Save or send
    doc.save("LOI.pdf");
  };

  const sendViaLob = async (documentType: string) => {
    const response = await fetch("/api/send-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: recipient,
        documentType, // 'loi', 'postcard', 'offer'
        template: documentType === "loi" ? "three-option-loi" : documentType,
      }),
    });

    return response.json();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        📮 Professional Mailing System
      </h1>

      {/* Document Templates */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-lg mb-3">📄 Letter of Intent (LOI)</h3>
          <p className="text-sm text-gray-600 mb-4">
            3-option seller financing template
          </p>
          <button
            onClick={generateLOI}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Generate LOI
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-lg mb-3">📬 Introduction Postcard</h3>
          <p className="text-sm text-gray-600 mb-4">
            "We Buy Houses" marketing postcard
          </p>
          <button
            onClick={() => sendViaLob("postcard")}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Send Postcard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-lg mb-3">💰 Cash Offer Letter</h3>
          <p className="text-sm text-gray-600 mb-4">
            Quick cash offer template
          </p>
          <button
            onClick={() => sendViaLob("offer")}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            Send Offer
          </button>
        </div>
      </div>

      {/* Recipient Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recipient Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Property Owner Name"
            className="px-3 py-2 border rounded-lg"
            value={recipient.name}
            onChange={(e) =>
              setRecipient({ ...recipient, name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Property Address"
            className="px-3 py-2 border rounded-lg"
            value={recipient.propertyAddress}
            onChange={(e) =>
              setRecipient({ ...recipient, propertyAddress: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default MailingSystem;
