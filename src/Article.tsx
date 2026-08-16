import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "./api";
import { useAuth } from "./AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { avatarUrl, onAvatarError } from "./placeholder";

interface ArticleData {
  slug: string;
  title: string;
  body: string;
  description: string;
  tagList: string[];
  createdAt: string;
  favoritesCount: number;
  favorited: boolean;
  author: {
    username: string;
    image: string;
    bio: string;
    following: boolean;
  };
}

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getArticle(slug).then((d: any) => {
      setArticle(d.article);
      setLoading(false);
    });
  }, [slug]);

  async function handleFavorite() {
    if (!user || !article) { window.location.hash = "/login"; return; }
    const res = article.favorited
      ? await api.unfavoriteArticle(article.slug)
      : await api.favoriteArticle(article.slug);
    setArticle(res.article);
  }

  async function handleFollow() {
    if (!user || !article) { window.location.hash = "/login"; return; }
    const res = article.author.following
      ? await api.unfollowUser(article.author.username)
      : await api.followUser(article.author.username);
    setArticle(prev => prev ? { ...prev, author: res.profile } : prev);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  if (loading) return <><Navbar user={user} /><div className="container page">Loading...</div><Footer /></>;
  if (!article) return <><Navbar user={user} /><div className="container page">Article not found.</div><Footer /></>;

  const ArticleMeta = () => (
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
      <button className="btn btn-sm btn-outline-secondary" onClick={handleFollow}>
        <i className="ion-plus-round" />
        &nbsp; {article.author.following ? "Unfollow" : "Follow"} {article.author.username}
      </button>
      &nbsp;&nbsp;
      <button
        className={`btn btn-sm ${article.favorited ? "btn-primary" : "btn-outline-primary"}`}
        onClick={handleFavorite}
      >
        <i className="ion-heart" />
        &nbsp; {article.favorited ? "Unfavorite" : "Favorite"} Article{" "}
        <span className="counter">({article.favoritesCount})</span>
      </button>
    </div>
  );

  return (
    <>
      <Navbar user={user} />
      <div className="article-page">
        <div className="banner">
          <div className="container">
            <h1>{article.title}</h1>
            <ArticleMeta />
          </div>
        </div>

        <div className="container page">
          <div className="row article-content">
            <div className="col-md-12">
              <p>{article.body}</p>
              <ul className="tag-list">
                {article.tagList.map(tag => (
                  <li key={tag} className="tag-default tag-pill tag-outline">{tag}</li>
                ))}
              </ul>
            </div>
          </div>

          <hr />

          <div className="article-actions">
            <ArticleMeta />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
