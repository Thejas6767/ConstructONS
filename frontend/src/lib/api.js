import axios from "axios";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");
export const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: true,
});

// Scrub stale localStorage token if present
try {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("cons_admin_token");
  }
} catch (_) {}

// Redirect 401s on admin pages only
const ADMIN_PATH_RE = /^\/(admin|leads$|quiz-submissions|media\/upload|ai\/rewrite|ai\/generate-image|packages\/[^/]+\/versions|custom-quotes|quote-templates|exports|interior-library)/;
api.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    if (status === 401 && ADMIN_PATH_RE.test(url) && typeof window !== "undefined") {
      const isAdminPage = window.location.pathname.startsWith("/admin");
      const onLoginPage = window.location.pathname.startsWith("/admin/login");
      if (isAdminPage && !onLoginPage) {
        window.location.replace("/admin/login");
      }
    }
    return Promise.reject(error);
  }
);

export const publicApi = {
  bootstrap: () => api.get("/bootstrap").then((r) => r.data),
  getHomes: () => api.get("/homes").then((r) => r.data),
  getHome: (idOrSlug) => api.get(`/homes/${idOrSlug}`).then((r) => r.data),
  getPackages: () => api.get("/packages").then((r) => r.data),
  getPackage: (idOrSlug) => api.get(`/packages/${idOrSlug}`).then((r) => r.data),
  comparePackages: () => api.get("/packages-compare").then((r) => r.data),
  brochureUrl: (slug) => `${API_BASE}/packages/${slug}/brochure.pdf`,
  personalizedBrochure: (slug, payload) =>
    api.post(`/packages/${slug}/brochure`, payload, { responseType: "blob" }).then((r) => ({
      blob: r.data,
      quoteRef: r.headers["x-quote-ref"] || r.headers["X-Quote-Ref"],
      filename:
        (r.headers["content-disposition"] || "").split("filename=")[1]?.replace(/"/g, "") ||
        `ConstructONS-${slug}.pdf`,
    })),
  recommendPackage: (payload) => api.post("/recommend", payload).then((r) => r.data),
  getBlogs: () => api.get("/blogs").then((r) => r.data),
  getBlog: (idOrSlug) => api.get(`/blogs/${idOrSlug}`).then((r) => r.data),
  getFaqs: () => api.get("/faqs").then((r) => r.data),
  getTeam: () => api.get("/team").then((r) => r.data),
  getSiteSettings: () => api.get("/site-settings").then((r) => r.data),
  submitLead: (payload) => api.post("/leads", payload).then((r) => r.data),
};

export const customerApi = {
  uploadImage: (file, category = "site-onboarding", onProgress) => {
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);
    return api
      .post("/media/upload", form, {
        // DO NOT set "Content-Type": "multipart/form-data" manually!
        // Axios/Browser automatically generates boundary headers when Content-Type is omitted.
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      })
      .then((r) => {
        const rawUrl = r.data.url || "";
        const isAbsolute = rawUrl.startsWith("http://") || rawUrl.startsWith("https://");
        const fullUrl = isAbsolute ? rawUrl : `${BACKEND_URL}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
        return {
          ...r.data,
          url: fullUrl,
          absoluteUrl: fullUrl,
        };
      });
  },
};

export const adminApi = {
  login: (email, password) => api.post("/admin/login", { email, password }).then((r) => r.data),
  logout: () => api.post("/admin/logout").then((r) => r.data).catch(() => ({ success: true })),
  me: () => api.get("/admin/me").then((r) => r.data),
  list: (path) => api.get(`/${path}`).then((r) => r.data),
  get: (path, id) => api.get(`/${path}/${id}`).then((r) => r.data),
  create: (path, body) => api.post(`/${path}`, body).then((r) => r.data),
  update: (path, id, body) => api.put(`/${path}/${id}`, body).then((r) => r.data),
  remove: (path, id) => api.delete(`/${path}/${id}`).then((r) => r.data),
  listLeads: (status) =>
    api.get(`/leads${status ? `?status=${status}` : ""}`).then((r) => r.data),
  updateLead: (id, body) => api.put(`/leads/${id}`, body).then((r) => r.data),
  removeLead: (id) => api.delete(`/leads/${id}`).then((r) => r.data),
  updateSiteSettings: (body) => api.put("/site-settings", body).then((r) => r.data),
  listQuizSubmissions: (status) =>
    api.get(`/quiz-submissions${status ? `?status=${status}` : ""}`).then((r) => r.data),
  getQuizSubmission: (id) => api.get(`/quiz-submissions/${id}`).then((r) => r.data),
  updateQuizSubmission: (id, body) => api.put(`/quiz-submissions/${id}`, body).then((r) => r.data),
  removeQuizSubmission: (id) => api.delete(`/quiz-submissions/${id}`).then((r) => r.data),

  uploadImage: (file, category = "general", onProgress) => {
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);
    return api
      .post("/media/upload", form, {
        // DO NOT set "Content-Type": "multipart/form-data" manually!
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      })
      .then((r) => {
        const rawUrl = r.data.url || "";
        const isAbsolute = rawUrl.startsWith("http://") || rawUrl.startsWith("https://");
        const fullUrl = isAbsolute ? rawUrl : `${BACKEND_URL}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
        return {
          ...r.data,
          url: fullUrl,
          absoluteUrl: fullUrl,
        };
      });
  },
  listMedia: (category) =>
    api.get(`/media${category ? `?category=${category}` : ""}`).then((r) => r.data),

  listPackageVersions: (packageId) =>
    api.get(`/packages/${packageId}/versions`).then((r) => r.data),
  getPackageVersion: (packageId, versionId) =>
    api.get(`/packages/${packageId}/versions/${versionId}`).then((r) => r.data),
  restorePackageVersion: (packageId, versionId) =>
    api.post(`/packages/${packageId}/versions/${versionId}/restore`).then((r) => r.data),

  rewriteCopy: (text, purpose = "copy", tone = "on-brand") =>
    api.post("/ai/rewrite", { text, purpose, tone }).then((r) => r.data),

  generateImage: (prompt, category = "quote-visuals") =>
    api.post("/ai/generate-image", { prompt, category }, { timeout: 120000 }).then((r) => r.data),

  interiorLibrary: {
    list: (params = {}) => {
      const qs = new URLSearchParams();
      if (params.category) qs.set("category", params.category);
      if (params.q) qs.set("q", params.q);
      return api.get(`/interior-library${qs.toString() ? `?${qs}` : ""}`).then((r) => r.data);
    },
    categories: () => api.get("/interior-library/categories").then((r) => r.data),
    create: (body) => api.post("/interior-library", body).then((r) => r.data),
    remove: (id) => api.delete(`/interior-library/${id}`).then((r) => r.data),
  },

  customQuotes: {
    list: (status) =>
      api.get(`/custom-quotes${status ? `?status=${status}` : ""}`).then((r) => r.data),
    get: (id) => api.get(`/custom-quotes/${id}`).then((r) => r.data),
    create: (body) => api.post("/custom-quotes", body).then((r) => r.data),
    update: (id, body) => api.put(`/custom-quotes/${id}`, body).then((r) => r.data),
    remove: (id) => api.delete(`/custom-quotes/${id}`).then((r) => r.data),
    aiSuggest: (payload) =>
      api.post("/custom-quotes/ai-suggest", payload).then((r) => r.data),
    aiSuggestStatus: (jobId) =>
      api.get(`/custom-quotes/ai-suggest/${jobId}`).then((r) => r.data),
    pdfUrl: (id) => `${API_BASE}/custom-quotes/${id}/pdf`,
    previewPdf: (body) =>
      api.post("/custom-quotes/preview", body, { responseType: "blob", timeout: 60000 }).then((r) => r.data),
    getPublicLink: (id) => api.post(`/custom-quotes/${id}/public-link`).then((r) => r.data),
    saveAsTemplate: (id, body) =>
      api.post(`/custom-quotes/${id}/save-as-template`, body).then((r) => r.data),
    fromTemplate: (body) =>
      api.post("/custom-quotes/from-template", body).then((r) => r.data),
  },

  quoteTemplates: {
    list: () => api.get("/quote-templates").then((r) => r.data),
    get: (id) => api.get(`/quote-templates/${id}`).then((r) => r.data),
    create: (body) => api.post("/quote-templates", body).then((r) => r.data),
    update: (id, body) => api.put(`/quote-templates/${id}`, body).then((r) => r.data),
    remove: (id) => api.delete(`/quote-templates/${id}`).then((r) => r.data),
  },

  exports: {
    leadsUrl: (status) =>
      `${API_BASE}/exports/leads.csv${status ? `?status=${status}` : ""}`,
    quizUrl: (status) =>
      `${API_BASE}/exports/quiz-submissions.csv${status ? `?status=${status}` : ""}`,
  },
};

export const publicQuoteApi = {
  get: (token) =>
    axios.get(`${API_BASE}/public/quote/${token}`, { withCredentials: false }).then((r) => r.data),
  pdfUrl: (token) => `${API_BASE}/public/quote/${token}/pdf`,
  comment: (token, body) =>
    axios.post(`${API_BASE}/public/quote/${token}/comment`, body, { withCredentials: false }).then((r) => r.data),
  action: (token, body) =>
    axios.post(`${API_BASE}/public/quote/${token}/action`, body, { withCredentials: false }).then((r) => r.data),
};

export default api;