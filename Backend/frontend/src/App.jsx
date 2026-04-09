import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  const testBackend = async () => {
    try {
      console.log("🔥 Calling backend...");

      const res = await fetch("http://127.0.0.1:5000/");
      const data = await res.text();

      console.log("✅ Got response:", data);
      setMessage(data);

    } catch (error) {
      console.log("❌ Error:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Lost & Found System 🚀</h1>

      <button onClick={testBackend}>
        Test Backend Connection
      </button>

      <p>{message}</p>
    </div>
  );
}

export default App;