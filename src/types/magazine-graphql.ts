// Result types for magazine GraphQL operations (used for useQuery/useMutation generics)

export interface MagazineLoginResult {
  login: {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    user: {
      id: string;
      email?: string;
      display_name?: string;
      avatar_url?: string | null;
      role?: { name: string } | null;
      is_active?: boolean;
      phone?: string;
      member?: unknown;
    };
  };
}

export interface GetArticleResult {
  article?: {
    id: string;
    slug?: string;
    featured?: boolean;
    issue?: { id: string } | null;
    current_revision?: {
      title?: string;
      body?: string;
      excerpt?: string;
      tags?: string[];
      categories?: string[];
      status?: string;
      scheduled_for?: string;
      editor_notes?: string;
      language?: string;
    } | null;
  } | null;
}

export interface GetArticlesResult {
  articles?: {
    data: unknown[];
    paging?: { next_cursor?: string; limit?: number };
  };
}

export interface GetCategoriesResult {
  categories?: Array<{ id: string; name: string }>;
}

export interface GetIssuesResult {
  issues?: { data?: Array<{ id: string; title?: string }> };
}

export interface GetSubmissionsResult {
  submissions?: {
    data: unknown[];
    paging?: { next_cursor?: string; limit?: number };
  };
}

export interface GetAuditLogsResult {
  auditLogs?: { data?: unknown[] };
}

export interface GetCommentsResult {
  comments?: { data?: unknown[] };
}

export interface GetUsersResult {
  users?: {
    data: unknown[];
    paging?: { next_cursor?: string; limit?: number };
  };
}

export interface CreateRevisionResult {
  createRevision?: unknown;
}

export interface CreateArticleResult {
  createArticle?: {
    article?: { id: string };
  };
}

export interface GetSubscriptionsResult {
  subscriptions?: { data?: unknown[] };
}

export interface GetRolesResult {
  roles?: Array<{ id: string; name: string; description?: string }>;
}

export interface MagazineAnalyticsResult {
  analyticsOverview?: {
    totalArticles?: number;
    totalSubmissions?: number;
    publishedThisMonth?: number;
  };
  submissions?: { data: unknown[] };
  topArticles?: unknown[];
  contributorStats?: unknown[];
}
