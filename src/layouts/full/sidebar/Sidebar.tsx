import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Inbox,
  FolderOpen,
  BookOpen,
  MessageSquare,
  Image,
  BarChart3,
  Mail,
  FileCheck,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/redux/useAuth";

// Define navigation items with role restrictions for Magazine Platform
const administratorNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Articles", href: "/admin/articles", icon: FileText },
  { name: "Submissions", href: "/admin/submissions", icon: Inbox },
  { name: "Categories", href: "/admin/categories", icon: FolderOpen },
  { name: "Issues", href: "/admin/issues", icon: BookOpen },
  { name: "Comments", href: "/admin/comments", icon: MessageSquare },
  { name: "Media", href: "/admin/media", icon: Image },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: Mail },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: FileCheck },
];

const editorNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Articles", href: "/admin/articles", icon: FileText },
  { name: "Submissions", href: "/admin/submissions", icon: Inbox },
  { name: "Categories", href: "/admin/categories", icon: FolderOpen },
  { name: "Issues", href: "/admin/issues", icon: BookOpen },
  { name: "Comments", href: "/admin/comments", icon: MessageSquare },
  { name: "Media", href: "/admin/media", icon: Image },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

const reviewerNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Submissions", href: "/admin/submissions", icon: Inbox },
  { name: "My Reviews", href: "/admin/articles?filter=reviewed", icon: FileCheck },
];

const contributorNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "My Articles", href: "/admin/articles", icon: FileText },
  { name: "New Article", href: "/admin/articles/new", icon: FileText },
  { name: "Categories", href: "/admin/categories", icon: FolderOpen },
  { name: "Media", href: "/admin/media", icon: Image },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Determine which navigation items to show based on user role
  const getRoleNavigation = () => {
    const roleName = user?.role?.name?.toLowerCase();
    switch (roleName) {
      case "administrator":
        return administratorNavigation;
      case "editor":
        return editorNavigation;
      case "reviewer":
        return reviewerNavigation;
      case "contributor":
        return contributorNavigation;
      default:
        return contributorNavigation;
    }
  };

  const navigation = getRoleNavigation();

  return (
    <>
      {/* Mobile menu button */}
      <div
        className={cn(
          "lg:hidden fixed top-4 z-50 transition-all duration-300 ease-in-out",
          isOpen ? "left-72" : "left-4"
        )}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white shadow-md"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-brand-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GY</span>
              </div>
              <span className="text-xl font-bold text-brand-gradient">
                Zoe Magazine
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-gradient text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="text-xs text-gray-500 text-center">
              Zoe Digital Magazine Admin
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
