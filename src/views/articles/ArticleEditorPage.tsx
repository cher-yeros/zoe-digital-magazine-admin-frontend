import type { ApolloError } from "@apollo/client";
import { IconArrowLeft, IconDeviceFloppy, IconSend } from "@tabler/icons-react";
import { GraphQLError } from "graphql";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import RichTextEditor from "./RichTextEditor";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import LoadingPage from "../../components/ui/loading-page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import {
  CREATE_ARTICLE,
  CREATE_REVISION,
  GET_ARTICLE,
  GET_CATEGORIES,
  GET_ISSUES,
  UPDATE_ARTICLE,
} from "../../graphql/magazine-operations";
import { addArticle, updateArticle } from "../../redux/slices/magazineSlice";
import { useMutation, useQuery } from "@apollo/client/react";

const ArticleEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;

  const getErrorMessage = (error: unknown) => {
    if (error instanceof GraphQLError) {
      const gqlMessage = error.extensions?.code;
      if (gqlMessage) return gqlMessage;
    }
    if (error instanceof Error) return error.message;
    return "Failed to save article";
  };

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIssue, setSelectedIssue] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("draft");
  const [editorNotes, setEditorNotes] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [language, setLanguage] = useState("en");
  const [tagInput, setTagInput] = useState("");

  // GraphQL Queries
  const { data: articleData, loading: articleLoading } = useQuery(GET_ARTICLE, {
    variables: { id },
    skip: !isEditMode,
  });

  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const { data: issuesData } = useQuery(GET_ISSUES);

  // Mutations
  const [createArticleMutation, { loading: creating }] =
    useMutation(CREATE_ARTICLE);
  const [updateArticleMutation, { loading: updating }] =
    useMutation(UPDATE_ARTICLE);
  const [createRevisionMutation, { loading: creatingRevision }] =
    useMutation(CREATE_REVISION);

  // Load article data in edit mode
  useEffect(() => {
    if (articleData?.article) {
      const article = articleData.article;
      const revision = article.current_revision;

      setTitle(revision?.title || "");
      setSlug(article.slug || "");
      setBody(revision?.body || "");
      setExcerpt(revision?.excerpt || "");
      setTags(revision?.tags || []);
      setSelectedCategories(revision?.categories || []);
      setSelectedIssue(article.issue?.id || "");
      setFeatured(article.featured || false);
      setStatus(revision?.status || "draft");
      setEditorNotes(revision?.editor_notes || "");
      setScheduledFor(revision?.scheduled_for || "");
      setLanguage(revision?.language || "en");
    }
  }, [articleData]);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !isEditMode) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setSlug(generatedSlug);
    }
  }, [title, isEditMode]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async (saveStatus: string = "draft") => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    try {
      const baseRevisionInput = {
        title,
        body,
        excerpt,
        tags,
        categories: selectedCategories,
        language,
        status: saveStatus,
        editor_notes: editorNotes,
        scheduled_for: scheduledFor || undefined,
      };

      // Backend createArticle requires revision.article_id even though the resolver ignores it.
      const revisionInput = isEditMode
        ? baseRevisionInput
        : { ...baseRevisionInput, article_id: "temp-article-id" };

      if (isEditMode) {
        // Create new revision for existing article
        const { data } = await createRevisionMutation({
          variables: {
            input: {
              article_id: id,
              ...revisionInput,
            },
          },
        });

        dispatch(updateArticle(data.createRevision));
        toast.success("Article revision created successfully");
      } else {
        // Create new article with initial revision
        const { data } = await createArticleMutation({
          variables: {
            input: {
              slug,
              featured,
              issue_id: selectedIssue || undefined,
              revision: revisionInput,
            },
          },
        });

        dispatch(addArticle(data.createArticle.article));
        toast.success("Article created successfully");
        navigate(`/admin/articles/${data.createArticle.article.id}/edit`);
      }
    } catch (error) {
      console.log("Save error:", error);
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  const handleSubmit = () => handleSave("submitted");
  const handleDraft = () => handleSave("draft");

  if (articleLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/articles")}
          >
            <IconArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Edit Article" : "New Article"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? "Create a new revision" : "Create your article"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDraft}
            disabled={creating || updating}
          >
            <IconDeviceFloppy className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button onClick={handleSubmit} disabled={creating || updating}>
            <IconSend className="mr-2 h-4 w-4" />
            Submit for Review
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Article Content</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter article title"
                  className="text-lg font-semibold"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="article-slug"
                  disabled={isEditMode}
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary of the article"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="body">Body *</Label>
                <RichTextEditor 
                  value={body} 
                  onChange={setBody}
                  onSave={handleDraft}
                />
              </div>

              <div>
                <Label htmlFor="editorNotes">Editor Notes</Label>
                <Textarea
                  id="editorNotes"
                  value={editorNotes}
                  onChange={(e) => setEditorNotes(e.target.value)}
                  placeholder="Internal notes for editors and reviewers"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Metadata</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="am">Amharic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured Article</Label>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>

              {status === "scheduled" && (
                <div>
                  <Label htmlFor="scheduledFor">Schedule For</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Categories</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categoriesData?.categories?.map((category: any) => (
                  <label key={category.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([
                            ...selectedCategories,
                            category.id,
                          ]);
                        } else {
                          setSelectedCategories(
                            selectedCategories.filter(
                              (id) => id !== category.id
                            )
                          );
                        }
                      }}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Issue */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Issue</h3>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedIssue || "none"}
                onValueChange={(value) =>
                  setSelectedIssue(value === "none" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an issue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {issuesData?.issues?.data?.map((issue: any) => (
                    <SelectItem key={issue.id} value={issue.id}>
                      {issue.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Tags</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="Type tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)}>×</button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditorPage;
