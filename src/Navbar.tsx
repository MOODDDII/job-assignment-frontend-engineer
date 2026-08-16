import React from "react";
import { avatarUrl, onAvatarError } from "./placeholder";

interface NavbarProps {
  user: { username: string; image: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <a className="navbar-brand" href="/#">conduit</a>
        <ul className="nav navbar-nav pull-xs-right">
          <li className="nav-item">
            <a className="nav-link" href="/#">Home</a>
          </li>
          {user ? (
            <>
              <li className="nav-item">
                <a className="nav-link" href="/#/editor">
                  <i className="ion-compose" />&nbsp;New Article
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#/settings">
                  <i className="ion-gear-a" />&nbsp;Settings
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href={`/#/profile/${user.username}`}>
                  <img src={avatarUrl(user.image)} className="user-pic" alt={user.username} onError={onAvatarError} />
                  &nbsp;{user.username}
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#/logout">Sign out</a>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <a className="nav-link" href="/#/login">Sign in</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#/register">Sign up</a>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
