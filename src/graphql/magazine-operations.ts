import { gql } from "@apollo/client";

// ============================================
// FRAGMENTS
// ============================================

// User & Role Fragments
export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    email
    phone
    display_name
    bio
    avatar_url
    is_active
    created_at
    updated_at
    role {
      id
      name
      description
    }
  }
`;

export const ROLE_FRAGMENT = gql`
  fragment RoleFragment on Role {
    id
    name
    description
    created_at
  }
`;

// Article Fragments
export const ARTICLE_SUMMARY_FRAGMENT = gql`
  fragment ArticleSummaryFragment on Article {
    id
    slug
    featured
    created_at
    updated_at
    author {
      id
      display_name
      avatar_url
    }
    issue {
      id
      title
      slug
    }
    current_revision {
      id
      title
      excerpt
      status
      published_at
    }
  }
`;

export const ARTICLE_DETAIL_FRAGMENT = gql`
  fragment ArticleDetailFragment on Article {
    id
    slug
    featured
    metadata
    created_at
    updated_at
    deleted_at
    author {
      id
      display_name
      email
      avatar_url
    }
    issue {
      id
      title
      slug
      cover_image_url
    }
    current_revision {
      id
      title
      body
      excerpt
      language
      tags
      categories
      status
      scheduled_for
      published_at
      editor_notes
      created_at
      created_by {
        id
        display_name
      }
    }
  }
`;

// Article Revision Fragment
export const REVISION_FRAGMENT = gql`
  fragment RevisionFragment on ArticleRevision {
    id
    article_id
    title
    body
    excerpt
    language
    tags
    categories
    editor_notes
    status
    scheduled_for
    published_at
    created_at
    created_by {
      id
      display_name
      avatar_url
    }
  }
`;

// Category Fragment
export const CATEGORY_FRAGMENT = gql`
  fragment CategoryFragment on Category {
    id
    name
    slug
    description
    created_at
  }
`;

// Issue Fragment
export const ISSUE_FRAGMENT = gql`
  fragment IssueFragment on Issue {
    id
    title
    slug
    published_at
    cover_image_url
    metadata
    created_at
  }
`;

// Comment Fragment
export const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on Comment {
    id
    article_id
    user_id
    parent_comment_id
    body
    is_moderated
    created_at
    deleted_at
    user {
      id
      display_name
      avatar_url
    }
    article {
      id
      slug
      current_revision {
        title
      }
    }
  }
`;

// Review Comment Fragment
export const REVIEW_COMMENT_FRAGMENT = gql`
  fragment ReviewCommentFragment on ReviewComment {
    id
    revision_id
    reviewer_id
    content
    resolved
    created_at
    reviewer {
      id
      display_name
      avatar_url
    }
  }
`;

// Media Fragment
export const MEDIA_FRAGMENT = gql`
  fragment MediaFragment on Media {
    id
    uploader_id
    url
    mime_type
    size_bytes
    metadata
    created_at
    uploader {
      id
      display_name
    }
  }
`;

// Notification Fragment
export const NOTIFICATION_FRAGMENT = gql`
  fragment NotificationFragment on Notification {
    id
    user_id
    type
    payload
    read
    created_at
  }
`;

// Subscription Fragment
export const SUBSCRIPTION_FRAGMENT = gql`
  fragment SubscriptionFragment on Subscription {
    id
    email
    subscribed_at
    unsubscribed_at
  }
`;

// Audit Log Fragment
export const AUDIT_LOG_FRAGMENT = gql`
  fragment AuditLogFragment on AuditLog {
    id
    actor_id
    action
    target_type
    target_id
    payload
    created_at
    actor {
      id
      display_name
    }
  }
`;

// Analytics Event Fragment
export const ANALYTICS_EVENT_FRAGMENT = gql`
  fragment AnalyticsEventFragment on AnalyticsEvent {
    id
    user_id
    event_type
    target_type
    target_id
    props
    created_at
  }
`;

// ============================================
// AUTHENTICATION
// ============================================

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      access_token
      refresh_token
      expires_in
      user {
        ...UserFragment
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      access_token
      refresh_token
      expires_in
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout($input: LogoutInput!) {
    logout(input: $input) {
      success
    }
  }
`;

export const INVITE_USER = gql`
  mutation InviteUser($input: InviteUserInput!) {
    inviteUser(input: $input) {
      invite_token
      email
    }
  }
`;

// ============================================
// USERS & ROLES
// ============================================

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USERS = gql`
  query GetUsers($filter: UserFilterInput, $pagination: PaginationInput) {
    users(filter: $filter, pagination: $pagination) {
      data {
        ...UserFragment
      }
      paging {
        next_cursor
        limit
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
    }
  }
`;

export const GET_ROLES = gql`
  query GetRoles {
    roles {
      ...RoleFragment
    }
  }
  ${ROLE_FRAGMENT}
`;

// ============================================
// ARTICLES & REVISIONS
// ============================================

export const GET_ARTICLES = gql`
  query GetArticles($filter: ArticleFilterInput, $pagination: PaginationInput) {
    articles(filter: $filter, pagination: $pagination) {
      data {
        ...ArticleSummaryFragment
      }
      paging {
        next_cursor
        limit
      }
    }
  }
  ${ARTICLE_SUMMARY_FRAGMENT}
`;

export const GET_ARTICLE = gql`
  query GetArticle($id: ID!) {
    article(id: $id) {
      ...ArticleDetailFragment
      revisions {
        ...RevisionFragment
      }
    }
  }
  ${ARTICLE_DETAIL_FRAGMENT}
  ${REVISION_FRAGMENT}
`;

export const GET_ARTICLE_BY_SLUG = gql`
  query GetArticleBySlug($slug: String!) {
    articleBySlug(slug: $slug) {
      ...ArticleDetailFragment
    }
  }
  ${ARTICLE_DETAIL_FRAGMENT}
`;

export const CREATE_ARTICLE = gql`
  mutation CreateArticle($input: CreateArticleInput!) {
    createArticle(input: $input) {
      article {
        ...ArticleDetailFragment
      }
      revision {
        ...RevisionFragment
      }
    }
  }
  ${ARTICLE_DETAIL_FRAGMENT}
  ${REVISION_FRAGMENT}
`;

export const UPDATE_ARTICLE = gql`
  mutation UpdateArticle($id: ID!, $input: UpdateArticleInput!) {
    updateArticle(id: $id, input: $input) {
      ...ArticleDetailFragment
    }
  }
  ${ARTICLE_DETAIL_FRAGMENT}
`;

export const DELETE_ARTICLE = gql`
  mutation DeleteArticle($id: ID!) {
    deleteArticle(id: $id) {
      success
    }
  }
`;

// Revision Operations
export const CREATE_REVISION = gql`
  mutation CreateRevision($input: CreateRevisionInput!) {
    createRevision(input: $input) {
      ...RevisionFragment
    }
  }
  ${REVISION_FRAGMENT}
`;

export const UPDATE_REVISION = gql`
  mutation UpdateRevision($id: ID!, $input: UpdateRevisionInput!) {
    updateRevision(id: $id, input: $input) {
      ...RevisionFragment
    }
  }
  ${REVISION_FRAGMENT}
`;

export const DELETE_REVISION = gql`
  mutation DeleteRevision($id: ID!) {
    deleteRevision(id: $id) {
      success
    }
  }
`;

export const REVIEW_REVISION = gql`
  mutation ReviewRevision($id: ID!, $input: ReviewRevisionInput!) {
    reviewRevision(id: $id, input: $input) {
      revision {
        ...RevisionFragment
      }
      review_comments {
        ...ReviewCommentFragment
      }
    }
  }
  ${REVISION_FRAGMENT}
  ${REVIEW_COMMENT_FRAGMENT}
`;

export const PUBLISH_REVISION = gql`
  mutation PublishRevision($id: ID!, $input: PublishRevisionInput!) {
    publishRevision(id: $id, input: $input) {
      ...RevisionFragment
    }
  }
  ${REVISION_FRAGMENT}
`;

export const SCHEDULE_REVISION = gql`
  mutation ScheduleRevision($id: ID!, $input: ScheduleRevisionInput!) {
    scheduleRevision(id: $id, input: $input) {
      ...RevisionFragment
    }
  }
  ${REVISION_FRAGMENT}
`;

export const GET_SUBMISSIONS = gql`
  query GetSubmissions($status: String, $pagination: PaginationInput) {
    submissions(status: $status, pagination: $pagination) {
      data {
        ...ArticleSummaryFragment
      }
      paging {
        next_cursor
        limit
      }
    }
  }
  ${ARTICLE_SUMMARY_FRAGMENT}
`;

export const GET_ARTICLE_ACTIVITY = gql`
  query GetArticleActivity($id: ID!) {
    articleActivity(id: $id) {
      revisions {
        ...RevisionFragment
      }
      review_comments {
        ...ReviewCommentFragment
      }
      audit_logs {
        ...AuditLogFragment
      }
    }
  }
  ${REVISION_FRAGMENT}
  ${REVIEW_COMMENT_FRAGMENT}
  ${AUDIT_LOG_FRAGMENT}
`;

// ============================================
// CATEGORIES & ISSUES
// ============================================

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      ...CategoryFragment
    }
  }
  ${CATEGORY_FRAGMENT}
`;

export const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      ...CategoryFragment
    }
  }
  ${CATEGORY_FRAGMENT}
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      ...CategoryFragment
    }
  }
  ${CATEGORY_FRAGMENT}
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      ...CategoryFragment
    }
  }
  ${CATEGORY_FRAGMENT}
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      success
    }
  }
`;

export const GET_ISSUES = gql`
  query GetIssues($pagination: PaginationInput) {
    issues(pagination: $pagination) {
      data {
        ...IssueFragment
      }
      paging {
        next_cursor
        limit
      }
    }
  }
  ${ISSUE_FRAGMENT}
`;

export const GET_ISSUE = gql`
  query GetIssue($id: ID!) {
    issue(id: $id) {
      ...IssueFragment
      articles {
        ...ArticleSummaryFragment
      }
    }
  }
  ${ISSUE_FRAGMENT}
  ${ARTICLE_SUMMARY_FRAGMENT}
`;

export const CREATE_ISSUE = gql`
  mutation CreateIssue($input: CreateIssueInput!) {
    createIssue(input: $input) {
      ...IssueFragment
    }
  }
  ${ISSUE_FRAGMENT}
`;

export const UPDATE_ISSUE = gql`
  mutation UpdateIssue($id: ID!, $input: UpdateIssueInput!) {
    updateIssue(id: $id, input: $input) {
      ...IssueFragment
    }
  }
  ${ISSUE_FRAGMENT}
`;

export const DELETE_ISSUE = gql`
  mutation DeleteIssue($id: ID!) {
    deleteIssue(id: $id) {
      success
    }
  }
`;

// ============================================
// COMMENTS & MODERATION
// ============================================

export const GET_COMMENTS = gql`
  query GetComments($filter: CommentFilterInput, $pagination: PaginationInput) {
    comments(filter: $filter, pagination: $pagination) {
      data {
        ...CommentFragment
      }
      paging {
        next_cursor
        limit
      }
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const GET_ARTICLE_COMMENTS = gql`
  query GetArticleComments($articleSlug: String!, $pagination: PaginationInput) {
    articleComments(articleSlug: $articleSlug, pagination: $pagination) {
      data {
        ...CommentFragment
      }
      paging {
        next_cursor
        limit
      }
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const MODERATE_COMMENT = gql`
  mutation ModerateComment($id: ID!, $input: ModerateCommentInput!) {
    moderateComment(id: $id, input: $input) {
      success
      comment {
        ...CommentFragment
      }
    }
  }
  ${COMMENT_FRAGMENT}
`;

// ============================================
// MEDIA
// ============================================

export const GET_MEDIA_SIGN_URL = gql`
  mutation GetMediaSignUrl($input: MediaSignInput!) {
    getMediaSignUrl(input: $input) {
      upload_url
      key
      expires_in
    }
  }
`;

export const CONFIRM_MEDIA_UPLOAD = gql`
  mutation ConfirmMediaUpload($input: ConfirmMediaInput!) {
    confirmMediaUpload(input: $input) {
      ...MediaFragment
    }
  }
  ${MEDIA_FRAGMENT}
`;

export const GET_MEDIA = gql`
  query GetMedia($pagination: PaginationInput) {
    media(pagination: $pagination) {
      data {
        ...MediaFragment
      }
      paging {
        next_cursor
        limit
      }
    }
  }
  ${MEDIA_FRAGMENT}
`;

export const GET_MEDIA_ITEM = gql`
  query GetMediaItem($id: ID!) {
    mediaItem(id: $id) {
      ...MediaFragment
    }
  }
  ${MEDIA_FRAGMENT}
`;

// ============================================
// SUBSCRIPTIONS & NEWSLETTERS
// ============================================

export const GET_SUBSCRIPTIONS = gql`
  query GetSubscriptions($pagination: PaginationInput) {
    subscriptions(pagination: $pagination) {
      data {
        ...SubscriptionFragment
      }
      paging {
        next_cursor
        limit
      }
    }
  }
  ${SUBSCRIPTION_FRAGMENT}
`;

export const SEND_NEWSLETTER = gql`
  mutation SendNewsletter($input: SendNewsletterInput!) {
    sendNewsletter(input: $input) {
      success
      job_id
    }
  }
`;

// ============================================
// NOTIFICATIONS
// ============================================

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($pagination: PaginationInput) {
    notifications(pagination: $pagination) {
      data {
        ...NotificationFragment
      }
      paging {
        next_cursor
        limit
      }
    }
  }
  ${NOTIFICATION_FRAGMENT}
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      ...NotificationFragment
    }
  }
  ${NOTIFICATION_FRAGMENT}
`;

// ============================================
// ANALYTICS
// ============================================

export const GET_ANALYTICS_OVERVIEW = gql`
  query GetAnalyticsOverview($since: String, $until: String) {
    analyticsOverview(since: $since, until: $until) {
      total_articles
      total_published
      total_views
      total_likes
      total_comments
      total_subscribers
    }
  }
`;

export const GET_TOP_ARTICLES = gql`
  query GetTopArticles($since: String, $metric: String, $limit: Int) {
    topArticles(since: $since, metric: $metric, limit: $limit) {
      article {
        ...ArticleSummaryFragment
      }
      views
      likes
      comments
      shares
    }
  }
  ${ARTICLE_SUMMARY_FRAGMENT}
`;

export const GET_CONTRIBUTOR_STATS = gql`
  query GetContributorStats($since: String) {
    contributorStats(since: $since) {
      user {
        ...UserFragment
      }
      total_articles
      total_published
      total_views
      total_likes
    }
  }
  ${USER_FRAGMENT}
`;

// ============================================
// AUDIT LOGS
// ============================================

export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($filter: AuditLogFilterInput, $pagination: PaginationInput) {
    auditLogs(filter: $filter, pagination: $pagination) {
      data {
        ...AuditLogFragment
      }
      paging {
        next_cursor
        limit
      }
    }
  }
  ${AUDIT_LOG_FRAGMENT}
`;

// ============================================
// SEARCH
// ============================================

export const SEARCH = gql`
  query Search($query: String!, $type: String, $pagination: PaginationInput) {
    search(query: $query, type: $type, pagination: $pagination) {
      data {
        id
        type
        score
        highlight
        item {
          ... on Article {
            ...ArticleSummaryFragment
          }
          ... on User {
            ...UserFragment
          }
          ... on Issue {
            ...IssueFragment
          }
        }
      }
      paging {
        next_cursor
        limit
      }
    }
  }
  ${ARTICLE_SUMMARY_FRAGMENT}
  ${USER_FRAGMENT}
  ${ISSUE_FRAGMENT}
`;

