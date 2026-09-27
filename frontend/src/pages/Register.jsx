import { useState } from "react";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/register`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Registration successful!");

        setName("");
        setEmail("");
        setPassword("");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Unable to connect to the server.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>CareerAI</h1>
        <p>Create your account</p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
}

export default Register;

