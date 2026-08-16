import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { api } from "./api";

export default function Settings() {
  const { user, login, logout } = useAuth();
  const history = useHistory();
  const [image, setImage] = useState(user?.image || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    try {
      const userData: { image: string; username: string; bio: string; email: string; password?: string } = {
        image, username, bio, email,
      };
      if (password) userData.password = password;

      const data = await api.updateUser(userData);
      login(data.user);
      history.push(`/profile/${data.user.username}`);
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
      <div className="settings-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">Your Settings</h1>

              {errors.length > 0 && (
                <ul className="error-messages">
                  {errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}

              <form onSubmit={handleSubmit}>
                <fieldset>
                  <fieldset className="form-group">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="URL of profile picture"
                      value={image}
                      onChange={e => setImage(e.target.value)}
                    />
                  </fieldset>
                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="Your Name"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                    />
                  </fieldset>
                  <fieldset className="form-group">
                    <textarea
                      className="form-control form-control-lg"
                      rows={8}
                      placeholder="Short bio about you"
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                    />
                  </fieldset>
                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </fieldset>
                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="password"
                      placeholder="New Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </fieldset>
                  <button
                    className="btn btn-lg btn-primary pull-xs-right"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Settings"}
                  </button>
                </fieldset>
              </form>
              <hr />
              <button
                className="btn btn-outline-danger"
                onClick={() => { logout(); history.push("/"); }}
              >
                Or click here to logout.
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
