import React, { useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { api } from "./api";
import { useAuth } from "./AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LoginRegister() {
  const { user, login } = useAuth();
  const history = useHistory();
  const isRegister = useRouteMatch("/register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    try {
      const res = isRegister
        ? await api.register(username, email, password)
        : await api.login(email, password);
      login(res.user);
      history.push("/");
    } catch (err: any) {
      const errs = err.errors
        ? Object.entries(err.errors).map(([k, v]) => `${k} ${(v as string[]).join(", ")}`)
        : ["Something went wrong"];
      setErrors(errs);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar user={user} />
      <div className="auth-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">{isRegister ? "Sign up" : "Sign in"}</h1>
              <p className="text-xs-center">
                {isRegister ? (
                  <a href="/#/login">Have an account?</a>
                ) : (
                  <a href="/#/register">Need an account?</a>
                )}
              </p>

              {errors.length > 0 && (
                <ul className="error-messages">
                  {errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}

              <form onSubmit={handleSubmit}>
                {isRegister && (
                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="Your Name"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                    />
                  </fieldset>
                )}
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </fieldset>
                <button
                  className="btn btn-lg btn-primary pull-xs-right"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Loading..." : isRegister ? "Sign up" : "Sign in"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
