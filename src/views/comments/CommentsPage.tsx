import { useMutation, useQuery } from "@apollo/client/react";
import {
  IconAlertCircle,
  IconCheck,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import LoadingPage from "../../components/ui/loading-page";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  GET_COMMENTS,
  MODERATE_COMMENT,
} from "../../graphql/magazine-operations";
import {
  setComments,
  setCommentsLoading,
  updateComment,
} from "../../redux/slices/magazineSlice";
import type { RootState } from "../../redux/store";

const CommentsPage = () => {
  const dispatch = useDispatch();
  const { comments } = useSelector((state: RootState) => state.magazine);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  // GraphQL Query
  const { data, loading, refetch } = useQuery(GET_COMMENTS, {
    variables: {
      filter: {
        is_moderated: activeTab === "moderated",
      },
      pagination: {
        limit: 50,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  // Moderate Mutation
  const [moderateCommentMutation] = useMutation(MODERATE_COMMENT);

  useEffect(() => {
    if (data?.comments?.data) {
      dispatch(setComments(data.comments.data));
      dispatch(setCommentsLoading(false));
    }
  }, [data, dispatch]);

  useEffect(() => {
    dispatch(setCommentsLoading(loading));
  }, [loading, dispatch]);

  useEffect(() => {
    refetch();
  }, [activeTab, refetch]);

  const filteredComments = comments.filter(
    (comment) =>
      comment.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.user?.display_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const handleModerate = async (
    id: string,
    action: "approve" | "hide" | "delete",
    reason?: string
  ) => {
    try {
      const { data } = await moderateCommentMutation({
        variables: {
          id,
          input: {
            action,
            reason: reason || undefined,
          },
        },
      });
      dispatch(updateComment(data.moderateComment.comment));
      toast.success(`Comment ${action}d successfully`);
      refetch();
    } catch (error) {
      toast.error(`Failed to ${action} comment`);
      console.error("Moderate error:", error);
    }
  };

  const handleApprove = (id: string) => handleModerate(id, "approve");

  const handleHide = (id: string) => {
    const reason = prompt("Enter reason for hiding:");
    if (reason) {
      handleModerate(id, "hide", reason);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this comment permanently?")) {
      const reason = prompt("Enter reason for deletion:");
      if (reason) {
        handleModerate(id, "delete", reason);
      }
    }
  };

  if (loading && comments.length === 0) {
    return <LoadingPage />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Comments Moderation</h1>
        <p className="text-muted-foreground">
          Review and moderate reader comments
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending Moderation
            {comments.filter((c) => !c.is_moderated).length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {comments.filter((c) => !c.is_moderated).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="moderated">Moderated</TabsTrigger>
          <TabsTrigger value="all">All Comments</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredComments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No comments found</p>
              </CardContent>
            </Card>
          ) : (
            filteredComments.map((comment) => (
              <Card
                key={comment.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {comment.user?.avatar_url ? (
                            <img
                              src={comment.user.avatar_url}
                              alt={comment.user.display_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="font-semibold">
                              {comment.user?.display_name
                                ?.charAt(0)
                                .toUpperCase() || "A"}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {comment.user?.display_name || "Anonymous"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            on "{comment.article?.current_revision?.title}"
                          </p>
                        </div>
                        {comment.is_moderated ? (
                          <Badge className="bg-green-500 text-white">
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-100">
                            Pending
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm mb-3 p-3 bg-muted rounded-lg">
                        {comment.body}
                      </p>

                      <div className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!comment.is_moderated && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(comment.id)}
                          >
                            <IconCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-yellow-600 hover:text-yellow-700"
                            onClick={() => handleHide(comment.id)}
                          >
                            <IconAlertCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(comment.id)}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommentsPage;
