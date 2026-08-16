import React, { useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { avatarUrl, onAvatarError } from "./placeholder";

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

export default function ArticleList() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tab, setTab] = useState<"global" | "feed">("global");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTags().then((d: any) => setTags(d.tags));
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetch = tab === "feed" && user
      ? api.getFeed(page)
      : api.getArticles(page, selectedTag || undefined);

    fetch.then((d: any) => {
      setArticles(d.articles);
      setTotal(d.articlesCount);
    }).finally(() => setLoading(false));
  }, [tab, page, selectedTag, user]);

  async function handleFavorite(article: Article) {
    if (!user) { window.location.hash = "/login"; return; }
    const updated = article.favorited
      ? await api.unfavoriteArticle(article.slug)
      : await api.favoriteArticle(article.slug);
    setArticles(prev => prev.map(a => a.slug === article.slug ? updated.article : a));
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  const pages = Math.ceil(total / 10);

  return (
    <>
      <Navbar user={user} />
      <div className="home-page">
        <div className="banner">
          <div className="container">
            <h1 className="logo-font">conduit</h1>
            <p>A place to share your knowledge.</p>
          </div>
        </div>

        <div className="container page">
          <div className="row">
            <div className="col-md-9">
              <div className="feed-toggle">
                <ul className="nav nav-pills outline-active">
                  {user && (
                    <li className="nav-item">
                      <a
                        className={`nav-link ${tab === "feed" ? "active" : ""}`}
                        href=""
                        onClick={e => { e.preventDefault(); setTab("feed"); setSelectedTag(null); setPage(0); }}
                      >Your Feed</a>
                    </li>
                  )}
                  <li className="nav-item">
                    <a
                      className={`nav-link ${tab === "global" && !selectedTag ? "active" : ""}`}
                      href=""
                      onClick={e => { e.preventDefault(); setTab("global"); setSelectedTag(null); setPage(0); }}
                    >Global Feed</a>
                  </li>
                  {selectedTag && (
                    <li className="nav-item">
                      <a className="nav-link active" href=""># {selectedTag}</a>
                    </li>
                  )}
                </ul>
              </div>

              {loading && <div className="article-preview">Loading articles...</div>}

              {!loading && articles.map(article => (
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
                    {article.tagList.length > 0 && (
                      <ul className="tag-list">
                        {article.tagList.map(tag => (
                          <li key={tag} className="tag-default tag-pill tag-outline">{tag}</li>
                        ))}
                      </ul>
                    )}
                  </a>
                </div>
              ))}

              {!loading && articles.length === 0 && (
                <div className="article-preview">No articles are here... yet.</div>
              )}

              {pages > 1 && (
                <ul className="pagination">
                  {Array.from({ length: pages }, (_, i) => (
                    <li key={i} className={`page-item ${i === page ? "active" : ""}`}>
                      <a className="page-link" href="" onClick={e => { e.preventDefault(); setPage(i); }}>
                        {i + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="col-md-3">
              <div className="sidebar">
                <p>Popular Tags</p>
                <div className="tag-list">
                  {tags.map(tag => (
                    <a
                      key={tag}
                      href=""
                      className="tag-pill tag-default"
                      onClick={e => { e.preventDefault(); setSelectedTag(tag); setTab("global"); setPage(0); }}
                    >
                      {tag}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
