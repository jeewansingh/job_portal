import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="auth-page">

      <form className="auth-form">

        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
        />

        <input
          type="password"
          placeholder="Password"
        />

        <button>Login</button>

        <p>
          Don't have an account?
          <Link to="/register"> Register</Link>
        </p>

      </form>

    </div>
  );
}