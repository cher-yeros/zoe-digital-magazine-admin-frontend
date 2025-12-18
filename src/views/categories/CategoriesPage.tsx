import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconFolderOpen,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  GET_CATEGORIES,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
} from '../../graphql/magazine-operations';
import { setCategories, addCategory, updateCategory, removeCategory } from '../../redux/slices/magazineSlice';
import { RootState } from '../../redux/store';
import { toast } from 'sonner';
import LoadingPage from '../../components/ui/loading-page';

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state: RootState) => state.magazine);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  // GraphQL Queries
  const { data, loading, refetch } = useQuery(GET_CATEGORIES, {
    fetchPolicy: 'cache-and-network',
  });

  // Mutations
  const [createCategoryMutation] = useMutation(CREATE_CATEGORY);
  const [updateCategoryMutation] = useMutation(UPDATE_CATEGORY);
  const [deleteCategoryMutation] = useMutation(DELETE_CATEGORY);

  useEffect(() => {
    if (data?.categories) {
      dispatch(setCategories(data.categories));
    }
  }, [data, dispatch]);

  // Auto-generate slug from name
  useEffect(() => {
    if (name && !editingCategory) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generatedSlug);
    }
  }, [name, editingCategory]);

  const openDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || '');
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    try {
      if (editingCategory) {
        const { data } = await updateCategoryMutation({
          variables: {
            id: editingCategory.id,
            input: {
              name,
              slug,
              description: description || undefined,
            },
          },
        });
        dispatch(updateCategory(data.updateCategory));
        toast.success('Category updated successfully');
      } else {
        const { data } = await createCategoryMutation({
          variables: {
            input: {
              name,
              slug,
              description: description || undefined,
            },
          },
        });
        dispatch(addCategory(data.createCategory));
        toast.success('Category created successfully');
      }
      closeDialog();
      refetch();
    } catch (error) {
      toast.error('Failed to save category');
      console.error('Save error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategoryMutation({ variables: { id } });
        dispatch(removeCategory(id));
        toast.success('Category deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete category');
        console.error('Delete error:', error);
      }
    }
  };

  if (loading && categories.length === 0) {
    return <LoadingPage />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Organize your articles with categories
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <IconFolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No categories yet. Create your first category!
              </p>
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconFolderOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">/{category.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDialog(category)}
                    >
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(category.id)}
                    >
                      <IconTrash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {category.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update category information'
                : 'Create a new category for organizing articles'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Faith, Youth Life, Leadership"
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="category-slug"
                disabled={!!editingCategory}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingCategory ? 'Update' : 'Create'} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesPage;

