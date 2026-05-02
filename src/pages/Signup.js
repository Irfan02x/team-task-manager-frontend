import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Signup() {
  const [data, setData] = useState({
    name: "", email: "", password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/auth/signup", data);
    alert("Signup successful");
  };

  return (
    
    <form onSubmit={handleSubmit}>
        <div>
         <h2>Signup</h2> </div>
      <input placeholder="Name"
        onChange={e => setData({...data, name: e.target.value})} /> <br/> <br/>
      <input placeholder="Email"
        onChange={e => setData({...data, email: e.target.value})} /><br/> <br/>
      <input type="password" placeholder="Password"
        onChange={e => setData({...data, password: e.target.value})} /><br/> <br/>
      <input placeholder="Admin Code (optional)"
        onChange={e => setData({...data, adminCode: e.target.value})} /><br/> <br/>
      <button>Signup</button>

      <p>
  Already have an account? <Link to="/">Login</Link>
</p>
    </form>

  );
}

export default Signup;