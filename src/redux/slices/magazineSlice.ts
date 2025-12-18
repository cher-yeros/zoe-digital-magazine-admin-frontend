import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Types
export interface User {
  id: string;
  email?: string;
  phone?: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  is_active: boolean;
  role: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface ArticleRevision {
  id: string;
  article_id: string;
  title: string;
  body: string;
  excerpt?: string;
  language: string;
  tags?: string[];
  categories?: string[];
  editor_notes?: string;
  status:
    | "draft"
    | "submitted"
    | "in_review"
    | "rejected"
    | "approved"
    | "scheduled"
    | "published";
  scheduled_for?: string;
  published_at?: string;
  created_at: string;
  created_by?: User;
}

export interface Article {
  id: string;
  slug: string;
  featured: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  author: User;
  issue?: {
    id: string;
    title: string;
    slug: string;
  };
  current_revision?: ArticleRevision;
  revisions?: ArticleRevision[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Issue {
  id: string;
  title: string;
  slug: string;
  published_at?: string;
  cover_image_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Comment {
  id: string;
  article_id: string;
  user_id?: string;
  parent_comment_id?: string;
  body: string;
  is_moderated: boolean;
  created_at: string;
  deleted_at?: string;
  user?: User;
  article?: {
    id: string;
    slug: string;
    current_revision?: {
      title: string;
    };
  };
}

export interface Media {
  id: string;
  uploader_id: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  metadata?: Record<string, any>;
  created_at: string;
  uploader?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, any>;
  read: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  email: string;
  subscribed_at: string;
  unsubscribed_at?: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  action: string;
  target_type: string;
  target_id: string;
  payload?: Record<string, any>;
  created_at: string;
  actor?: User;
}

export interface AnalyticsOverview {
  total_articles: number;
  total_published: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_subscribers: number;
}

interface MagazineState {
  // Articles
  articles: Article[];
  currentArticle: Article | null;
  submissions: Article[];
  articlesLoading: boolean;

  // Categories & Issues
  categories: Category[];
  issues: Issue[];
  currentIssue: Issue | null;

  // Comments
  comments: Comment[];
  commentsLoading: boolean;

  // Media
  media: Media[];
  mediaLoading: boolean;

  // Users (contributors, editors, reviewers)
  users: User[];
  usersLoading: boolean;

  // Notifications
  notifications: Notification[];
  unreadNotificationsCount: number;

  // Subscriptions
  subscriptions: Subscription[];
  subscriptionsLoading: boolean;

  // Audit Logs
  auditLogs: AuditLog[];
  auditLogsLoading: boolean;

  // Analytics
  analyticsOverview: AnalyticsOverview | null;
  analyticsLoading: boolean;

  // UI State
  selectedTab: string;
  filters: {
    status?: string;
    category?: string;
    author?: string;
    searchQuery?: string;
  };
}

const initialState: MagazineState = {
  articles: [],
  currentArticle: null,
  submissions: [],
  articlesLoading: false,

  categories: [],
  issues: [],
  currentIssue: null,

  comments: [],
  commentsLoading: false,

  media: [],
  mediaLoading: false,

  users: [],
  usersLoading: false,

  notifications: [],
  unreadNotificationsCount: 0,

  subscriptions: [],
  subscriptionsLoading: false,

  auditLogs: [],
  auditLogsLoading: false,

  analyticsOverview: null,
  analyticsLoading: false,

  selectedTab: "overview",
  filters: {},
};

const magazineSlice = createSlice({
  name: "magazine",
  initialState,
  reducers: {
    // Articles
    setArticles: (state, action: PayloadAction<Article[]>) => {
      state.articles = action.payload;
    },
    setCurrentArticle: (state, action: PayloadAction<Article | null>) => {
      state.currentArticle = action.payload;
    },
    setSubmissions: (state, action: PayloadAction<Article[]>) => {
      state.submissions = action.payload;
    },
    setArticlesLoading: (state, action: PayloadAction<boolean>) => {
      state.articlesLoading = action.payload;
    },
    addArticle: (state, action: PayloadAction<Article>) => {
      state.articles.unshift(action.payload);
    },
    updateArticle: (state, action: PayloadAction<Article>) => {
      const index = state.articles.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.articles[index] = action.payload;
      }
      if (state.currentArticle?.id === action.payload.id) {
        state.currentArticle = action.payload;
      }
    },
    removeArticle: (state, action: PayloadAction<string>) => {
      state.articles = state.articles.filter((a) => a.id !== action.payload);
      if (state.currentArticle?.id === action.payload) {
        state.currentArticle = null;
      }
    },

    // Categories
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(
        (c) => c.id !== action.payload
      );
    },

    // Issues
    setIssues: (state, action: PayloadAction<Issue[]>) => {
      state.issues = action.payload;
    },
    setCurrentIssue: (state, action: PayloadAction<Issue | null>) => {
      state.currentIssue = action.payload;
    },
    addIssue: (state, action: PayloadAction<Issue>) => {
      state.issues.unshift(action.payload);
    },
    updateIssue: (state, action: PayloadAction<Issue>) => {
      const index = state.issues.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.issues[index] = action.payload;
      }
    },
    removeIssue: (state, action: PayloadAction<string>) => {
      state.issues = state.issues.filter((i) => i.id !== action.payload);
    },

    // Comments
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload;
    },
    setCommentsLoading: (state, action: PayloadAction<boolean>) => {
      state.commentsLoading = action.payload;
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments.unshift(action.payload);
    },
    updateComment: (state, action: PayloadAction<Comment>) => {
      const index = state.comments.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.comments[index] = action.payload;
      }
    },

    // Media
    setMedia: (state, action: PayloadAction<Media[]>) => {
      state.media = action.payload;
    },
    setMediaLoading: (state, action: PayloadAction<boolean>) => {
      state.mediaLoading = action.payload;
    },
    addMedia: (state, action: PayloadAction<Media>) => {
      state.media.unshift(action.payload);
    },

    // Users
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setUsersLoading: (state, action: PayloadAction<boolean>) => {
      state.usersLoading = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },

    // Notifications
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadNotificationsCount = action.payload.filter(
        (n) => !n.read
      ).length;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadNotificationsCount += 1;
      }
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadNotificationsCount -= 1;
      }
    },

    // Subscriptions
    setSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.subscriptions = action.payload;
    },
    setSubscriptionsLoading: (state, action: PayloadAction<boolean>) => {
      state.subscriptionsLoading = action.payload;
    },

    // Audit Logs
    setAuditLogs: (state, action: PayloadAction<AuditLog[]>) => {
      state.auditLogs = action.payload;
    },
    setAuditLogsLoading: (state, action: PayloadAction<boolean>) => {
      state.auditLogsLoading = action.payload;
    },

    // Analytics
    setAnalyticsOverview: (state, action: PayloadAction<AnalyticsOverview>) => {
      state.analyticsOverview = action.payload;
    },
    setAnalyticsLoading: (state, action: PayloadAction<boolean>) => {
      state.analyticsLoading = action.payload;
    },

    // UI State
    setSelectedTab: (state, action: PayloadAction<string>) => {
      state.selectedTab = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<MagazineState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },

    // Reset
    resetMagazineState: () => initialState,
  },
});

export const {
  setArticles,
  setCurrentArticle,
  setSubmissions,
  setArticlesLoading,
  addArticle,
  updateArticle,
  removeArticle,

  setCategories,
  addCategory,
  updateCategory,
  removeCategory,

  setIssues,
  setCurrentIssue,
  addIssue,
  updateIssue,
  removeIssue,

  setComments,
  setCommentsLoading,
  addComment,
  updateComment,

  setMedia,
  setMediaLoading,
  addMedia,

  setUsers,
  setUsersLoading,
  addUser,
  updateUser,
  removeUser,

  setNotifications,
  addNotification,
  markNotificationRead,

  setSubscriptions,
  setSubscriptionsLoading,

  setAuditLogs,
  setAuditLogsLoading,

  setAnalyticsOverview,
  setAnalyticsLoading,

  setSelectedTab,
  setFilters,
  clearFilters,

  resetMagazineState,
} = magazineSlice.actions;

export default magazineSlice.reducer;
