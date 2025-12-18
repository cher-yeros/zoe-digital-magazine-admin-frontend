import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconArticle,
  IconEye,
  IconHeart,
  IconMessage,
  IconUsers,
  IconMail,
  IconTrendingUp,
  IconCalendar,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  GET_ANALYTICS_OVERVIEW,
  GET_TOP_ARTICLES,
  GET_SUBMISSIONS,
  GET_CONTRIBUTOR_STATS,
} from '../../graphql/magazine-operations';
import { setAnalyticsOverview, setAnalyticsLoading, setSubmissions } from '../../redux/slices/magazineSlice';
import { RootState } from '../../redux/store';
import LoadingPage from '../../components/ui/loading-page';

const MagazineDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { analyticsOverview, analyticsLoading, submissions } = useSelector(
    (state: RootState) => state.magazine
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // GraphQL Queries
  const { data: analyticsData, loading: analyticsQueryLoading } = useQuery(
    GET_ANALYTICS_OVERVIEW,
    {
      variables: {
        since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const { data: topArticlesData } = useQuery(GET_TOP_ARTICLES, {
    variables: {
      since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      metric: 'views',
      limit: 5,
    },
  });

  const { data: submissionsData } = useQuery(GET_SUBMISSIONS, {
    variables: {
      status: 'submitted',
      pagination: { limit: 5 },
    },
    skip: user?.role?.name === 'contributor',
  });

  const { data: contributorStatsData } = useQuery(GET_CONTRIBUTOR_STATS, {
    variables: {
      since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    skip: user?.role?.name === 'contributor',
  });

  useEffect(() => {
    if (analyticsData?.analyticsOverview) {
      dispatch(setAnalyticsOverview(analyticsData.analyticsOverview));
      dispatch(setAnalyticsLoading(false));
    }
  }, [analyticsData, dispatch]);

  useEffect(() => {
    if (submissionsData?.submissions?.data) {
      dispatch(setSubmissions(submissionsData.submissions.data));
    }
  }, [submissionsData, dispatch]);

  useEffect(() => {
    dispatch(setAnalyticsLoading(analyticsQueryLoading));
  }, [analyticsQueryLoading, dispatch]);

  if (analyticsQueryLoading && !analyticsOverview) {
    return <LoadingPage />;
  }

  const stats = analyticsOverview || {
    total_articles: 0,
    total_published: 0,
    total_views: 0,
    total_likes: 0,
    total_comments: 0,
    total_subscribers: 0,
  };

  const statCards = [
    {
      title: 'Total Articles',
      value: stats.total_articles,
      icon: IconArticle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Published',
      value: stats.total_published,
      icon: IconCalendar,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Views',
      value: stats.total_views.toLocaleString(),
      icon: IconEye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Likes',
      value: stats.total_likes.toLocaleString(),
      icon: IconHeart,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Comments',
      value: stats.total_comments.toLocaleString(),
      icon: IconMessage,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Subscribers',
      value: stats.total_subscribers.toLocaleString(),
      icon: IconMail,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.display_name || 'User'}! Here's your magazine overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Submissions */}
        {user?.role?.name !== 'contributor' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Pending Submissions</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/submissions')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending submissions
                </p>
              ) : (
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((article) => (
                    <div
                      key={article.id}
                      className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-1">
                          {article.current_revision?.title || 'Untitled'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          By {article.author?.display_name}
                        </p>
                      </div>
                      <Badge className="bg-blue-500 text-white">New</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Top Articles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Top Articles (7 days)</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/analytics')}
              >
                View Analytics
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!topArticlesData?.topArticles || topArticlesData.topArticles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No data available
              </p>
            ) : (
              <div className="space-y-4">
                {topArticlesData.topArticles.map((item: any, index: number) => (
                  <div
                    key={item.article.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/admin/articles/${item.article.id}/edit`)}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-1">
                        {item.article.current_revision?.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <IconEye className="h-3 w-3" />
                          {item.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconHeart className="h-3 w-3" />
                          {item.likes.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconMessage className="h-3 w-3" />
                          {item.comments.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <IconTrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Contributors */}
        {user?.role?.name !== 'contributor' && contributorStatsData?.contributorStats && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Top Contributors (30 days)</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contributorStatsData.contributorStats.slice(0, 5).map((stat: any) => (
                  <div
                    key={stat.user.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {stat.user.avatar_url ? (
                          <img
                            src={stat.user.avatar_url}
                            alt={stat.user.display_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="font-semibold">
                            {stat.user.display_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{stat.user.display_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {stat.total_published} published
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold">{stat.total_views.toLocaleString()} views</p>
                      <p className="text-muted-foreground">
                        {stat.total_likes.toLocaleString()} likes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/articles/new')}
              >
                <IconArticle className="mr-2 h-4 w-4" />
                Create New Article
              </Button>
              {user?.role?.name !== 'contributor' && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/admin/submissions')}
                  >
                    <IconEye className="mr-2 h-4 w-4" />
                    Review Submissions
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/admin/users')}
                  >
                    <IconUsers className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/categories')}
              >
                <IconCalendar className="mr-2 h-4 w-4" />
                Manage Categories
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MagazineDashboard;

