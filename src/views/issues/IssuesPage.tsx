import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconBook,
  IconCalendar,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  GET_ISSUES,
  CREATE_ISSUE,
  UPDATE_ISSUE,
  DELETE_ISSUE,
} from '../../graphql/magazine-operations';
import { setIssues, addIssue, updateIssue, removeIssue } from '../../redux/slices/magazineSlice';
import { RootState } from '../../redux/store';
import { toast } from 'sonner';
import LoadingPage from '../../components/ui/loading-page';

const IssuesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { issues } = useSelector((state: RootState) => state.magazine);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<any>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  // GraphQL Queries
  const { data, loading, refetch } = useQuery(GET_ISSUES, {
    fetchPolicy: 'cache-and-network',
  });

  // Mutations
  const [createIssueMutation] = useMutation(CREATE_ISSUE);
  const [updateIssueMutation] = useMutation(UPDATE_ISSUE);
  const [deleteIssueMutation] = useMutation(DELETE_ISSUE);

  useEffect(() => {
    if (data?.issues?.data) {
      dispatch(setIssues(data.issues.data));
    }
  }, [data, dispatch]);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !editingIssue) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generatedSlug);
    }
  }, [title, editingIssue]);

  const openDialog = (issue?: any) => {
    if (issue) {
      setEditingIssue(issue);
      setTitle(issue.title);
      setSlug(issue.slug);
      setPublishedAt(issue.published_at || '');
      setCoverImageUrl(issue.cover_image_url || '');
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingIssue(null);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setPublishedAt('');
    setCoverImageUrl('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Issue title is required');
      return;
    }

    if (!slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    try {
      if (editingIssue) {
        const { data } = await updateIssueMutation({
          variables: {
            id: editingIssue.id,
            input: {
              title,
              slug,
              published_at: publishedAt || undefined,
              cover_image_url: coverImageUrl || undefined,
            },
          },
        });
        dispatch(updateIssue(data.updateIssue));
        toast.success('Issue updated successfully');
      } else {
        const { data } = await createIssueMutation({
          variables: {
            input: {
              title,
              slug,
              published_at: publishedAt || undefined,
              cover_image_url: coverImageUrl || undefined,
            },
          },
        });
        dispatch(addIssue(data.createIssue));
        toast.success('Issue created successfully');
      }
      closeDialog();
      refetch();
    } catch (error) {
      toast.error('Failed to save issue');
      console.error('Save error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this issue?')) {
      try {
        await deleteIssueMutation({ variables: { id } });
        dispatch(removeIssue(id));
        toast.success('Issue deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete issue');
        console.error('Delete error:', error);
      }
    }
  };

  if (loading && issues.length === 0) {
    return <LoadingPage />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Magazine Issues</h1>
          <p className="text-muted-foreground">
            Manage your magazine editions
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Issue
        </Button>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <IconBook className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No issues yet. Create your first magazine issue!
              </p>
            </CardContent>
          </Card>
        ) : (
          issues.map((issue) => (
            <Card
              key={issue.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/admin/issues/${issue.id}`)}
            >
              {issue.cover_image_url && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={issue.cover_image_url}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{issue.title}</h3>
                    <p className="text-sm text-muted-foreground">/{issue.slug}</p>
                    {issue.published_at && (
                      <div className="flex items-center gap-1 mt-2">
                        <IconCalendar className="h-3 w-3" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(issue.published_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDialog(issue)}
                    >
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(issue.id)}
                    >
                      <IconTrash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Issue Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIssue ? 'Edit Issue' : 'Add New Issue'}
            </DialogTitle>
            <DialogDescription>
              {editingIssue
                ? 'Update magazine issue information'
                : 'Create a new magazine edition'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., January 2025 Edition"
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="january-2025"
                disabled={!!editingIssue}
              />
            </div>

            <div>
              <Label htmlFor="publishedAt">Published Date</Label>
              <Input
                id="publishedAt"
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="coverImageUrl">Cover Image URL</Label>
              <Input
                id="coverImageUrl"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingIssue ? 'Update' : 'Create'} Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IssuesPage;

