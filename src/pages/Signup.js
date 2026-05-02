import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

function Signup() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    adminCode: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/signup", data);
      alert("Signup successful");

      navigate("/"); // go to login
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>

      <input
        placeholder="Name"
        onChange={(e) => setData({ ...data, name: e.target.value })} 
      /><br /><br />

      <input
        placeholder="Email"
        onChange={(e) => setData({ ...data, email: e.target.value })}
      /><br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setData({ ...data, password: e.target.value })}
      /><br /><br />

      <input
        placeholder="Admin Code (optional)"
        onChange={(e) => setData({ ...data, adminCode: e.target.value })}
      /><br /><br />

      <button>Signup</button>

      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </form>
  );
}

export default Signup;
