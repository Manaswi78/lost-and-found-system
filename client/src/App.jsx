import { useState } from "react";
import bg from "./assets/img4.avif"; // background image

function App() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const [lostItem, setLostItem] = useState({ item_name: "", description: "", location: "" });
  const [foundItem, setFoundItem] = useState({ item_name: "", description: "", location: "" });
  const [matches, setMatches] = useState([]);
  const [showLostForm, setShowLostForm] = useState(false);
  const [showFoundForm, setShowFoundForm] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleLostChange = (e) => setLostItem({ ...lostItem, [e.target.name]: e.target.value });
  const handleFoundChange = (e) => setFoundItem({ ...foundItem, [e.target.name]: e.target.value });

  // REGISTER
  const handleRegister = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.text();
      setMessage(data);
    } catch {
      setMessage("Register error");
    }
  };

  // LOGIN
  const handleLogin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setMessage("");
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch {
      setMessage("Login error");
    }
  };

  // REPORT LOST ITEM
  const handleReportLost = async () => {
    try {
      const date_lost = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const res = await fetch("http://127.0.0.1:5000/api/items/lost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lostItem, user_id: user.id, date_lost })
      });
      const data = await res.json();
      setMessage(data.message);
      setShowLostForm(false);
      setLostItem({ item_name: "", description: "", location: "" });
    } catch (err) {
      setMessage("Error reporting lost item");
    }
  };

  // REPORT FOUND ITEM
  const handleReportFound = async () => {
    try {
      const date_found = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const res = await fetch("http://127.0.0.1:5000/api/items/found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...foundItem, user_id: user.id, date_found })
      });
      const data = await res.text();
      setMessage(data);
      setShowFoundForm(false);
      setFoundItem({ item_name: "", description: "", location: "" });
    } catch (err) {
      setMessage("Error reporting found item");
    }
  };

  // VIEW MATCHES
  const handleViewMatches = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/items/matches/${user.id}`);
      const data = await res.json();
      setMatches(data);
      setMessage(data.length === 0 ? "No matches found yet 😔" : `Found ${data.length} matches 🔥`);
    } catch {
      setMessage("Error fetching matches");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    setUser(null);
    setMatches([]);
    setMessage("Logged out successfully");
  };

  // ================= UI =================

  if (user) {
    return (
      <div style={styles.dashboard}>
        <h1>🎉 Welcome {user.name} 🎉</h1>

        <div style={styles.cardContainer}>
          <button style={styles.card} onClick={handleViewMatches}>🔍 View Matches</button>
          <button style={styles.card} onClick={() => setShowLostForm(!showLostForm)}>📦 Report Lost Item</button>
          <button style={styles.card} onClick={() => setShowFoundForm(!showFoundForm)}>🧭 Report Found Item</button>
          <button style={styles.card} onClick={handleLogout}>🚪 Logout</button>
        </div>

        {showLostForm && (
          <div style={styles.form}>
            <h3 style={{color: "#0d0707"}}><b>Report Lost Item</b></h3>
            <input name="item_name" placeholder="What have you lost?" value={lostItem.item_name} onChange={handleLostChange} style={styles.input} />
            <input name="description" placeholder="Tell us more about the item..." value={lostItem.description} onChange={handleLostChange} style={styles.input} />
            <input name="location" placeholder="where did you lose it?" value={lostItem.location} onChange={handleLostChange} style={styles.input} />
            <button style={styles.btn} onClick={handleReportLost}>Submit search request </button>
          </div>
        )}

        {showFoundForm && (
          <div style={styles.form}>
            <h3 style={{color: "#0d0707"}}><b>Report Found Item</b></h3>
            <input name="item_name" placeholder="What have you found?" value={foundItem.item_name} onChange={handleFoundChange} style={styles.input} />
            <input name="description" placeholder="Tell us more about the item..." value={foundItem.description} onChange={handleFoundChange} style={styles.input} />
            <input name="location" placeholder="Where did you find it?" value={foundItem.location} onChange={handleFoundChange} style={styles.input} />
            <button style={styles.btn} onClick={handleReportFound}>Submit Found Item</button>
          </div>
        )}

        {matches.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Lost Item</th>
                <th>Date Lost</th>
                <th>Found Item</th>
                <th>Date Found</th>
                <th>Found Location</th>
                <th>Found By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.id}>
                  <td>{m.lost_item_name}</td>
                  <td>{m.date_lost}</td>
                  <td>{m.found_item_name}</td>
                  <td>{m.date_found}</td>
                  <td>{m.found_location}</td>
                  <td>{m.found_by}</td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p style={{ marginTop: "10px", color: "#fff", fontWeight: "bold" }}>{message}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lost and Found System</h1>

      <div style={styles.toggle}>
        <button onClick={() => setIsLogin(true)} style={styles.toggleBtn}>Login</button>
        <button onClick={() => setIsLogin(false)} style={styles.toggleBtn}>Register</button>
      </div>

      <div style={styles.form}>
        {!isLogin && <input name="name" placeholder="Name" onChange={handleChange} style={styles.input} />}
        <input name="email" placeholder="Email" onChange={handleChange} style={styles.input} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} style={styles.input} />

        {isLogin ? (
          <button style={styles.btn} onClick={handleLogin}>Login 🚀</button>
        ) : (
          <button style={styles.btn} onClick={handleRegister}>Register ✨</button>
        )}

        <p style={{ marginTop: "10px", color: "#fff", fontWeight: "bold" }}>{message}</p>
      </div>
    </div>
  );
}

// 🎨 STYLES
const styles = {
  container: {
    textAlign: "center",
    padding: "50px",
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "100vh",
    color: "#0d0707",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textShadow: "1px 1px 4px #d7b5b5"
  },
  title: {
    fontSize: "4.5rem",
    marginBottom: "50px",
    color: "#130d0d",
    textShadow: "2px 2px 5px #7a5e5e",
    fontFamily: "'Comic Sans MS', cursive, sans-serif"
  },
  toggle: { marginBottom: "20px" },
  toggleBtn: { margin: "5px", padding: "10px 20px", borderRadius: "20px", border: "none", background: "#f4e9e9", cursor: "pointer", fontWeight: "bold" },
  form: { background: "#ddd2d280", padding: "30px", borderRadius: "20px", display: "inline-block", color: "#fff", marginTop: "20px" },
  input: { display: "block", margin: "10px auto", padding: "10px", borderRadius: "10px", border: "1px solid #fff", width: "200px", background: "#ffffff33", color: "#fff" },
  btn: { marginTop: "10px", padding: "10px 20px", border: "none", borderRadius: "20px", background: "#ad8088", color: "white", cursor: "pointer", fontWeight: "bold" },
  dashboard: { textAlign: "center", padding: "50px", background: "linear-gradient(135deg, #a18cd1, #fbc2eb)", minHeight: "100vh" },
  cardContainer: { marginTop: "30px" },
  card: { display: "block", margin: "15px auto", padding: "15px 30px", fontSize: "18px", borderRadius: "20px", border: "none", background: "#fff", cursor: "pointer" },
  table: { margin: "20px auto", borderCollapse: "collapse", width: "90%", background: "#fff", color: "#000" }
};

export default App;