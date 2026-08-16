import React, { useEffect, useState } from "react";
import { useParams, useRouteMatch } from "react-router-dom";
import { api } from "./api";
import { useAuth } from "./AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { avatarUrl, onAvatarError } from "./placeholder";

interface ProfileData {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

interface Article {
  slug: string;
  title: string;
  description: string;
  author: { username: string; image: string };
  createdAt: string;
  favoritesCount: number;
  favorited: boolean;
  tagList: string[];
}

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const isFavorites = useRouteMatch("/profile/:username/favorites");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProfile(username),
      isFavorites
        ? api.getFavoritedArticles(username)
        : api.getArticlesByAuthor(username),
    ]).then(([profileRes, articlesRes]: any[]) => {
      setProfile(profileRes.profile);
      setArticles(articlesRes.articles);
      setLoading(false);
    });
  }, [username, isFavorites]);

  async function handleFollow() {
    if (!user || !profile) { window.location.hash = "/login"; return; }
    const res = profile.following
      ? await api.unfollowUser(profile.username)
      : await api.followUser(profile.username);
    setProfile(res.profile);
  }

  async function handleFavorite(article: Article) {
    if (!user) { window.location.hash = "/login"; return; }
    const res = article.favorited
      ? await api.unfavoriteArticle(article.slug)
      : await api.favoriteArticle(article.slug);
    setArticles(prev => prev.map(a => a.slug === article.slug ? res.article : a));
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  if (loading) return <><Navbar user={user} /><div className="container page">Loading...</div><Footer /></>;
  if (!profile) return <><Navbar user={user} /><div className="container page">Profile not found.</div><Footer /></>;

  return (
    <>
      <Navbar user={user} />
      <div className="profile-page">
        <div className="user-info">
          <div className="container">
            <div className="row">
              <div className="col-xs-12 col-md-10 offset-md-1">
                <img src={avatarUrl(profile.image)} className="user-img" alt={profile.username} onError={onAvatarError} />
                <h4>{profile.username}</h4>
                <p>{profile.bio}</p>
                {user?.username !== profile.username && (
                  <button className="btn btn-sm btn-outline-secondary action-btn" onClick={handleFollow}>
                    <i className="ion-plus-round" />
                    &nbsp; {profile.following ? "Unfollow" : "Follow"} {profile.username}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <div className="articles-toggle">
                <ul className="nav nav-pills outline-active">
                  <li className="nav-item">
                    <a
                      className={`nav-link ${!isFavorites ? "active" : ""}`}
                      href={`/#/profile/${username}`}
                    >My Articles</a>
                  </li>
                  <li className="nav-item">
                    <a
                      className={`nav-link ${isFavorites ? "active" : ""}`}
                      href={`/#/profile/${username}/favorites`}
                    >Favorited Articles</a>
                  </li>
                </ul>
              </div>

              {articles.length === 0 && (
                <div className="article-preview">No articles here... yet.</div>
              )}

              {articles.map(article => (
                <div className="article-preview" key={article.slug}>
                  <div className="article-meta">
                    <a href={`/#/profile/${article.author.username}`}>
                      <img src={avatarUrl(article.author.image)} alt={article.author.username} onError={onAvatarError} />
                    </a>
                    <div className="info">
                      <a href={`/#/profile/${article.author.username}`} className="author">
                        {article.author.username}
                      </a>
                      <span className="date">{formatDate(article.createdAt)}</span>
                    </div>
                    <button
                      className={`btn btn-sm pull-xs-right ${article.favorited ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => handleFavorite(article)}
                    >
                      <i className="ion-heart" /> {article.favoritesCount}
                    </button>
                  </div>
                  <a href={`/#/${article.slug}`} className="preview-link">
                    <h1>{article.title}</h1>
                    <p>{article.description}</p>
                    <span>Read more...</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
