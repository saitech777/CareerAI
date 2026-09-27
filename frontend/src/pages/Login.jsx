import { useState } from "react";
import "./Login.css";

function Login({ onRegister, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login successful!");

        onLoginSuccess();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to the server.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>CareerAI</h1>
        <p>Login to your account</p>

        <form onSubmit={handleLogin}>
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

          <button type="submit">Login</button>
        </form>

        <p className="register-link">
          Don't have an account?{" "}
          <button type="button" onClick={onRegister}>
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;

