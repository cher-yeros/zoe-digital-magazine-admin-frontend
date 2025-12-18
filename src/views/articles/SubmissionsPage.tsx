import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconEye,
  IconCheck,
  IconX,
  IconMessageCircle,
  IconClock,
  IconFilter,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { GET_SUBMISSIONS, REVIEW_REVISION } from '../../graphql/magazine-operations';
import { setSubmissions, setArticlesLoading } from '../../redux/slices/magazineSlice';
import { RootState } from '../../redux/store';
import { toast } from 'sonner';
import LoadingPage from '../../components/ui/loading-page';

const SubmissionsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { submissions, articlesLoading } = useSelector((state: RootState) => state.magazine);
  
  const [activeTab, setActiveTab] = useState('submitted');

  // GraphQL Query
  const { data, loading, refetch } = useQuery(GET_SUBMISSIONS, {
    variables: {
      status: activeTab === 'all' ? undefined : activeTab,
      pagination: {
        limit: 50,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  // Review Mutation
  const [reviewRevisionMutation] = useMutation(REVIEW_REVISION);

  useEffect(() => {
    if (data?.submissions?.data) {
      dispatch(setSubmissions(data.submissions.data));
      dispatch(setArticlesLoading(false));
    }
  }, [data, dispatch]);

  useEffect(() => {
    dispatch(setArticlesLoading(loading));
  }, [loading, dispatch]);

  useEffect(() => {
    refetch();
  }, [activeTab, refetch]);

  const handleReview = (articleId: string, revisionId: string) => {
    navigate(`/admin/articles/${articleId}/review/${revisionId}`);
  };

  const handleQuickApprove = async (revisionId: string) => {
    if (confirm('Are you sure you want to approve this submission?')) {
      try {
        await reviewRevisionMutation({
          variables: {
            id: revisionId,
            input: {
              action: 'approve',
              comments: [],
            },
          },
        });
        toast.success('Submission approved successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to approve submission');
        console.error('Approve error:', error);
      }
    }
  };

  const handleQuickReject = async (revisionId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await reviewRevisionMutation({
          variables: {
            id: revisionId,
            input: {
              action: 'reject',
              comments: [
                {
                  content: reason,
                },
              ],
            },
          },
        });
        toast.success('Submission rejected');
        refetch();
      } catch (error) {
        toast.error('Failed to reject submission');
        console.error('Reject error:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      submitted: 'bg-blue-500',
      in_review: 'bg-yellow-500',
      rejected: 'bg-red-500',
      approved: 'bg-green-500',
    };

    return (
      <Badge className={`${statusColors[status] || 'bg-gray-500'} text-white`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading && submissions.length === 0) {
    return <LoadingPage />;
  }

  const renderSubmissionsList = () => {
    if (submissions.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <IconClock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No submissions in this category
            </p>
          </CardContent>
        </Card>
      );
    }

    return submissions.map((article) => (
      <Card key={article.id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold">
                  {article.current_revision?.title || 'Untitled'}
                </h3>
                {getStatusBadge(article.current_revision?.status || 'submitted')}
              </div>
              
              <p className="text-muted-foreground mb-3 line-clamp-2">
                {article.current_revision?.excerpt || 'No excerpt available'}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>By {article.author?.display_name}</span>
                <span>•</span>
                <span>
                  Submitted {new Date(article.created_at).toLocaleDateString()}
                </span>
                {article.current_revision?.categories && article.current_revision.categories.length > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {article.current_revision.categories.join(', ')}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReview(article.id, article.current_revision?.id || '')}
              >
                <IconEye className="mr-2 h-4 w-4" />
                Review
              </Button>
              
              {article.current_revision?.status === 'submitted' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => handleQuickApprove(article.current_revision?.id || '')}
                  >
                    <IconCheck className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleQuickReject(article.current_revision?.id || '')}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Submissions</h1>
        <p className="text-muted-foreground">
          Review and manage article submissions
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="submitted">
            Submitted
            {submissions.filter(s => s.current_revision?.status === 'submitted').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {submissions.filter(s => s.current_revision?.status === 'submitted').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in_review">
            In Review
            {submissions.filter(s => s.current_revision?.status === 'in_review').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {submissions.filter(s => s.current_revision?.status === 'in_review').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {renderSubmissionsList()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubmissionsPage;

