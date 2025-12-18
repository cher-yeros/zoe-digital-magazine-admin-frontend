import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconUserPlus,
  IconMail,
} from '@tabler/icons-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import {
  GET_USERS,
  GET_ROLES,
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  INVITE_USER,
} from '../../graphql/magazine-operations';
import { setUsers, setUsersLoading, addUser, updateUser, removeUser } from '../../redux/slices/magazineSlice';
import { RootState } from '../../redux/store';
import { toast } from 'sonner';
import LoadingPage from '../../components/ui/loading-page';

const UsersManagementPage = () => {
  const dispatch = useDispatch();
  const { users, usersLoading } = useSelector((state: RootState) => state.magazine);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');

  // GraphQL Queries
  const { data, loading, refetch } = useQuery(GET_USERS, {
    variables: {
      filter: {
        role: roleFilter !== 'all' ? roleFilter : undefined,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const { data: rolesData } = useQuery(GET_ROLES);

  // Mutations
  const [createUserMutation] = useMutation(CREATE_USER);
  const [updateUserMutation] = useMutation(UPDATE_USER);
  const [deleteUserMutation] = useMutation(DELETE_USER);
  const [inviteUserMutation] = useMutation(INVITE_USER);

  useEffect(() => {
    if (data?.users?.data) {
      dispatch(setUsers(data.users.data));
      dispatch(setUsersLoading(false));
    }
  }, [data, dispatch]);

  useEffect(() => {
    dispatch(setUsersLoading(loading));
  }, [loading, dispatch]);

  const filteredUsers = users.filter(user =>
    user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDisplayName(user.display_name);
      setBio(user.bio || '');
      setSelectedRole(user.role.id);
      setIsActive(user.is_active);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    resetForm();
  };

  const resetForm = () => {
    setEmail('');
    setPhone('');
    setDisplayName('');
    setBio('');
    setSelectedRole('');
    setIsActive(true);
  };

  const handleSubmit = async () => {
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    if (!email && !phone) {
      toast.error('Email or phone is required');
      return;
    }

    if (!selectedRole) {
      toast.error('Role is required');
      return;
    }

    try {
      if (editingUser) {
        const { data } = await updateUserMutation({
          variables: {
            id: editingUser.id,
            input: {
              email: email || undefined,
              phone: phone || undefined,
              display_name: displayName,
              bio: bio || undefined,
              role_id: selectedRole,
              is_active: isActive,
            },
          },
        });
        dispatch(updateUser(data.updateUser));
        toast.success('User updated successfully');
      } else {
        const { data } = await createUserMutation({
          variables: {
            input: {
              email: email || undefined,
              phone: phone || undefined,
              display_name: displayName,
              bio: bio || undefined,
              role_id: selectedRole,
              is_active: isActive,
            },
          },
        });
        dispatch(addUser(data.createUser));
        toast.success('User created successfully');
      }
      closeDialog();
      refetch();
    } catch (error) {
      toast.error('Failed to save user');
      console.error('Save error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUserMutation({ variables: { id } });
        dispatch(removeUser(id));
        toast.success('User deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete user');
        console.error('Delete error:', error);
      }
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      const { data } = await inviteUserMutation({
        variables: {
          input: {
            email: inviteEmail,
          },
        },
      });
      toast.success('Invitation sent successfully!');
      setIsInviteDialogOpen(false);
      setInviteEmail('');
    } catch (error) {
      toast.error('Failed to send invitation');
      console.error('Invite error:', error);
    }
  };

  const getRoleBadge = (roleName: string) => {
    const roleColors: Record<string, string> = {
      administrator: 'bg-red-500',
      editor: 'bg-purple-500',
      reviewer: 'bg-blue-500',
      contributor: 'bg-green-500',
      reader: 'bg-gray-500',
    };

    return (
      <Badge className={`${roleColors[roleName.toLowerCase()] || 'bg-gray-500'} text-white`}>
        {roleName}
      </Badge>
    );
  };

  if (loading && users.length === 0) {
    return <LoadingPage />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">
            Manage contributors, editors, and reviewers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsInviteDialogOpen(true)}>
            <IconMail className="mr-2 h-4 w-4" />
            Invite User
          </Button>
          <Button onClick={() => openDialog()}>
            <IconPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {rolesData?.roles?.map((role: any) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-semibold">User</th>
                  <th className="text-left p-4 font-semibold">Contact</th>
                  <th className="text-left p-4 font-semibold">Role</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Joined</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.display_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-semibold">
                                {user.display_name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{user.display_name}</p>
                            {user.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {user.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {user.email && <p>{user.email}</p>}
                          {user.phone && <p className="text-muted-foreground">{user.phone}</p>}
                        </div>
                      </td>
                      <td className="p-4">{getRoleBadge(user.role.name)}</td>
                      <td className="p-4">
                        {user.is_active ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(user)}
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(user.id)}
                          >
                            <IconTrash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Update user information and permissions'
                : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief description"
              />
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {rolesData?.roles?.map((role: any) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active User</Label>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingUser ? 'Update' : 'Create'} User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation email to a new contributor
            </DialogDescription>
          </DialogHeader>
          
          <div>
            <Label htmlFor="inviteEmail">Email Address *</Label>
            <Input
              id="inviteEmail"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="contributor@example.com"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite}>
              <IconMail className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagementPage;

