import { useMutation, useQuery } from "@apollo/client/react";
import {
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import LoadingPage from "../../components/ui/loading-page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  DELETE_ARTICLE,
  GET_ARTICLES,
} from "../../graphql/magazine-operations";
import {
  removeArticle,
  setArticles,
  setArticlesLoading,
  setFilters,
} from "../../redux/slices/magazineSlice";
import { useAppSelector } from "../../redux/hooks";

const ArticlesListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { articles, filters } = useAppSelector((state) => state.magazine);

  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || "");
  const [statusFilter, setStatusFilter] = useState(filters.status || "all");
  const [categoryFilter, setCategoryFilter] = useState(
    filters.category || "all"
  );

  // GraphQL Query
  const { data, loading, refetch } = useQuery(GET_ARTICLES, {
    variables: {
      filter: {
        status: statusFilter !== "all" ? statusFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        search: searchQuery || undefined,
      },
      pagination: {
        limit: 50,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  // Delete Mutation
  const [deleteArticleMutation] = useMutation(DELETE_ARTICLE);

  useEffect(() => {
    if (data?.articles?.data) {
      dispatch(setArticles(data.articles.data));
      dispatch(setArticlesLoading(false));
    }
  }, [data, dispatch]);

  useEffect(() => {
    dispatch(setArticlesLoading(loading));
  }, [loading, dispatch]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    dispatch(setFilters({ searchQuery: value }));
    refetch();
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    dispatch(setFilters({ status: value }));
    refetch();
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    dispatch(setFilters({ category: value }));
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      try {
        await deleteArticleMutation({ variables: { id } });
        dispatch(removeArticle(id));
        toast.success("Article deleted successfully");
      } catch (error) {
        toast.error("Failed to delete article");
        console.error("Delete error:", error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: "bg-gray-500",
      submitted: "bg-blue-500",
      in_review: "bg-yellow-500",
      rejected: "bg-red-500",
      approved: "bg-green-500",
      scheduled: "bg-purple-500",
      published: "bg-emerald-500",
    };

    return (
      <Badge className={`${statusColors[status] || "bg-gray-500"} text-white`}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  if (loading && articles.length === 0) {
    return <LoadingPage />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-muted-foreground">Manage your magazine articles</p>
        </div>
        <Button onClick={() => navigate("/admin/articles/new")}>
          <IconPlus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="faith">Faith</SelectItem>
                <SelectItem value="youth">Youth Life</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="testimonies">Testimonies</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <div className="grid gap-4">
        {articles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No articles found. Create your first article!
              </p>
            </CardContent>
          </Card>
        ) : (
          articles.map((article) => (
            <Card
              key={article.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">
                        {article.current_revision?.title || "Untitled"}
                      </h3>
                      {getStatusBadge(
                        article.current_revision?.status || "draft"
                      )}
                      {article.featured && (
                        <Badge variant="outline" className="bg-yellow-100">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {article.current_revision?.excerpt ||
                        "No excerpt available"}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>By {article.author?.display_name}</span>
                      <span>•</span>
                      <span>
                        Created{" "}
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                      {article.current_revision?.published_at && (
                        <>
                          <span>•</span>
                          <span>
                            Published{" "}
                            {new Date(
                              article.current_revision.published_at
                            ).toLocaleDateString()}
                          </span>
                        </>
                      )}
                      {article.issue && (
                        <>
                          <span>•</span>
                          <span>Issue: {article.issue.title}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/admin/articles/${article.id}/preview`)
                      }
                    >
                      <IconEye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/admin/articles/${article.id}/edit`)
                      }
                    >
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(article.id)}
                    >
                      <IconTrash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ArticlesListPage;
