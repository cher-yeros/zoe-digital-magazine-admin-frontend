import { useQuery } from "@apollo/client/react";
import { IconFileCheck, IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "../../components/ui/badge";
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
import { GET_AUDIT_LOGS } from "../../graphql/magazine-operations";
import {
  setAuditLogs,
  setAuditLogsLoading,
} from "../../redux/slices/magazineSlice";
import type { RootState } from "../../redux/store";
const AuditLogsPage = () => {
  const dispatch = useDispatch();
  const { auditLogs, auditLogsLoading } = useSelector(
    (state: RootState) => state.magazine
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");

  // GraphQL Query
  const { data, loading } = useQuery(GET_AUDIT_LOGS, {
    variables: {
      filter: {
        action: actionFilter !== "all" ? actionFilter : undefined,
        target_type: targetTypeFilter !== "all" ? targetTypeFilter : undefined,
      },
      pagination: {
        limit: 100,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (data?.auditLogs?.data) {
      dispatch(setAuditLogs(data.auditLogs.data));
      dispatch(setAuditLogsLoading(false));
    }
  }, [data, dispatch]);

  useEffect(() => {
    dispatch(setAuditLogsLoading(loading));
  }, [loading, dispatch]);

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      create: "bg-green-500",
      update: "bg-blue-500",
      delete: "bg-red-500",
      publish: "bg-purple-500",
      approve: "bg-emerald-500",
      reject: "bg-orange-500",
    };

    const actionType = action.split(".")[0];
    return (
      <Badge
        className={`${actionColors[actionType] || "bg-gray-500"} text-white`}
      >
        {action}
      </Badge>
    );
  };

  if (loading && auditLogs.length === 0) {
    return <LoadingPage />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all system activities and changes
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="publish">Publish</SelectItem>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={targetTypeFilter}
              onValueChange={setTargetTypeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="revision">Revisions</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="category">Categories</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-semibold">Action</th>
                  <th className="text-left p-4 font-semibold">Actor</th>
                  <th className="text-left p-4 font-semibold">Target</th>
                  <th className="text-left p-4 font-semibold">Details</th>
                  <th className="text-left p-4 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <IconFileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No audit logs found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-t hover:bg-muted/50">
                      <td className="p-4">{getActionBadge(log.action)}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold">
                            {log.actor?.display_name || "System"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <Badge variant="outline">{log.target_type}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            ID: {log.target_id.substring(0, 8)}...
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        {log.payload && (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-primary">
                              View details
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-w-md">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </details>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
