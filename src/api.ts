const BASE_URL = "http://localhost:3000/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

function authHeaders(hasBody: boolean): HeadersInit {
  const token = getToken();
  const headers: Record<string, string> = {};
  // Only send Content-Type when we actually have a JSON body — sending it on
  // plain GETs turns them into "non-simple" requests and forces an extra
  // CORS preflight (OPTIONS) that this backend doesn't always handle cleanly.
  if (hasBody) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Token ${token}`;
  return headers;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: authHeaders(body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export const api = {
  getArticles: (page = 0, tag?: string) => {
    const offset = page * 10;
    const tagQuery = tag ? `&tag=${tag}` : "";
    return request<any>("GET", `/articles?limit=10&offset=${offset}${tagQuery}`);
  },
  getFeed: (page = 0) =>
    request<any>("GET", `/articles/feed?limit=10&offset=${page * 10}`),
  getArticle: (slug: string) =>
    request<any>("GET", `/articles/${slug}`),
  getTags: () =>
    request<any>("GET", "/tags"),
  getProfile: (username: string) =>
    request<any>("GET", `/profiles/${username}`),
  getArticlesByAuthor: (username: string) =>
    request<any>("GET", `/articles?author=${encodeURIComponent(username)}&limit=10`),
  getFavoritedArticles: (username: string) =>
    request<any>("GET", `/articles?favorited=${encodeURIComponent(username)}&limit=10`),
  login: (email: string, password: string) =>
    request<any>("POST", "/users/login", { user: { email, password } }),
  register: (username: string, email: string, password: string) =>
    request<any>("POST", "/users", { user: { username, email, password } }),
  favoriteArticle: (slug: string) =>
    request<any>("POST", `/articles/${slug}/favorite`),
  unfavoriteArticle: (slug: string) =>
    request<any>("DELETE", `/articles/${slug}/favorite`),
  followUser: (username: string) =>
    request<any>("POST", `/profiles/${username}/follow`),
  unfollowUser: (username: string) =>
    request<any>("DELETE", `/profiles/${username}/follow`),
  getCurrentUser: () =>
    request<any>("GET", "/user"),
  updateUser: (data: { image: string; username: string; bio: string; email: string; password?: string }) =>
    request<any>("PUT", "/user", { user: data }),
};
