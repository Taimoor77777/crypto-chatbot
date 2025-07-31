import { useState } from "react";

export default function CryptoChatbot() {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    setMessages(prev => [...prev, { sender: "user", type: "text", text: userInput }]);
    setUserInput("");

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
      });

      const data = await res.json();

      if (data.type === "table") {
        setMessages(prev => [...prev, { sender: "bot", type: "table", title: data.title, table: data.data }]);
      } else {
        setMessages(prev => [...prev, { sender: "bot", type: "text", text: data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: "bot", type: "text", text: "❌ Network error" }]);
    }

    // const newMessages = [...messages, { sender: "user", text: userInput }];
    // setMessages(newMessages);
    // setUserInput("");

    // try {
    //   const res = await fetch("http://localhost:5000/chat", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ message: userInput })
    //   });
    //   const data = await res.json();
    //   setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    // } catch (error) {
    //   setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Server error" }]);
    // }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded-xl shadow-xl">
      <h1 className="text-2xl font-bold mb-4">💬 Crypto Chatbot</h1>
      <div className="h-96 overflow-y-scroll border p-2 mb-4 bg-gray-50 text-sm">
  {messages.map((msg, idx) => (
    <div key={idx} className="mb-4">
      {msg.type === "text" ? (
        <div className={`text-${msg.sender === "user" ? "right" : "left"}`}>
          <span className={`inline-block px-3 py-2 rounded-xl ${msg.sender === "user" ? "bg-blue-200" : "bg-green-200"}`}>
            {msg.text}
          </span>
        </div>
      ) : (
        <div className="bg-green-100 p-3 rounded-xl">
    <h2 className="font-bold mb-2">{msg.title}</h2>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b">
          <th className="px-2 py-1">Name</th>
          <th className="px-2 py-1">Price</th>
          <th className="px-2 py-1">
            {msg.table[0]?.change !== undefined ? "% Change" : "Market Cap"}
          </th>
        </tr>
      </thead>
      <tbody>
        {msg.table.map((coin, i) => (
          <tr key={i} className="border-b">
            <td className="px-2 py-1">{coin.name}</td>
            <td className="px-2 py-1">${coin.price.toLocaleString()}</td>
            <td className={`px-2 py-1 ${
              coin.change !== undefined
                ? coin.change > 0
                  ? "text-green-600"
                  : "text-red-500"
                : "text-gray-700"
            }`}>
              {coin.change !== undefined
                ? `${coin.change.toFixed(2)}%`
                : `$${(coin.mcap / 1_000_000).toFixed(1)}M`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
        // <div className="bg-green-100 p-3 rounded-xl">
        //   <h2 className="font-bold mb-2">{msg.title}</h2>
        //   <table className="w-full text-left border-collapse">
        //     <thead>
        //       <tr className="border-b">
        //         <th className="px-2 py-1">Name</th>
        //         <th className="px-2 py-1">Price</th>
        //         <th className="px-2 py-1">% Change</th>
        //       </tr>
        //     </thead>
        //     <tbody>
        //       {msg.table.map((coin, i) => (
        //         <tr key={i} className="border-b">
        //           <td className="px-2 py-1">{coin.name}</td>
        //           <td className="px-2 py-1">${coin.price.toLocaleString()}</td>
        //           <td className={`px-2 py-1 ${coin.change > 0 ? "text-green-600" : "text-red-500"}`}>
        //             {coin.change.toFixed(2)}%
        //           </td>
        //         </tr>
        //       ))}
        //     </tbody>
        //   </table>
        // </div>
      )}
    </div>
  ))}
  <div className="flex gap-2">
  <input
    type="text"
    className="flex-1 p-2 border rounded"
    placeholder="Ask me anything about crypto..."
    value={userInput}
    onChange={(e) => setUserInput(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
  />
  <button
    onClick={sendMessage}
    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
  >
    Send
  </button>
</div>


</div>


      {/* <div className="h-96 overflow-y-scroll border p-2 mb-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
            <span
              className={`inline-block px-3 py-2 rounded-xl ${msg.sender === "user" ? "bg-blue-200" : "bg-green-200"}`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          placeholder="Ask about BTC, ETH, Solana..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div> */}
    </div>
  );
}
