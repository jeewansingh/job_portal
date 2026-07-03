import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="auth-page">

      <form className="auth-form">

        <h2>Create Account</h2>

        <input
          placeholder="Full Name"
        />

        <input
          type="email"
          placeholder="Email"
        />

        <input
          type="password"
          placeholder="Password"
        />

        <button>Create Account</button>

        <p>
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>

      </form>

    </div>
  );
}