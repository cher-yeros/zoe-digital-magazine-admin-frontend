import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconSearch,
  IconMail,
  IconSend,
  IconDownload,
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
  GET_SUBSCRIPTIONS,
  SEND_NEWSLETTER,
} from '../../graphql/magazine-operations';
import { setSubscriptions, setSubscriptionsLoading } from '../../redux/slices/magazineSlice';
import { RootState } from '../../redux/store';
import { toast } from 'sonner';
import LoadingPage from '../../components/ui/loading-page';

const SubscriptionsPage = () => {
  const dispatch = useDispatch();
  const { subscriptions, subscriptionsLoading } = useSelector((state: RootState) => state.magazine);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewsletterDialogOpen, setIsNewsletterDialogOpen] = useState(false);
  
  // Newsletter form state
  const [subject, setSubject] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [segment, setSegment] = useState('all_subscribers');

  // GraphQL Query
  const { data, loading } = useQuery(GET_SUBSCRIPTIONS, {
    variables: {
      pagination: {
        limit: 100,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  // Send Newsletter Mutation
  const [sendNewsletterMutation, { loading: sending }] = useMutation(SEND_NEWSLETTER);

  useEffect(() => {
    if (data?.subscriptions?.data) {
      dispatch(setSubscriptions(data.subscriptions.data));
      dispatch(setSubscriptionsLoading(false));
    }
  }, [data, dispatch]);

  useEffect(() => {
    dispatch(setSubscriptionsLoading(loading));
  }, [loading, dispatch]);

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSubscriptions = subscriptions.filter(sub => !sub.unsubscribed_at);

  const handleSendNewsletter = async () => {
    if (!subject.trim()) {
      toast.error('Subject is required');
      return;
    }

    try {
      await sendNewsletterMutation({
        variables: {
          input: {
            subject,
            template_id: templateId || undefined,
            segment,
            dry_run: false,
          },
        },
      });
      toast.success('Newsletter sent successfully!');
      setIsNewsletterDialogOpen(false);
      setSubject('');
      setTemplateId('');
    } catch (error) {
      toast.error('Failed to send newsletter');
      console.error('Send error:', error);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Email', 'Subscribed At', 'Status'],
      ...subscriptions.map(sub => [
        sub.email,
        new Date(sub.subscribed_at).toISOString(),
        sub.unsubscribed_at ? 'Unsubscribed' : 'Active',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Subscriptions exported successfully');
  };

  if (loading && subscriptions.length === 0) {
    return <LoadingPage />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions & Newsletter</h1>
          <p className="text-muted-foreground">
            Manage your subscribers and send newsletters
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <IconDownload className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsNewsletterDialogOpen(true)}>
            <IconSend className="mr-2 h-4 w-4" />
            Send Newsletter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Subscribers</p>
                <p className="text-3xl font-bold">{subscriptions.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <IconMail className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Subscribers</p>
                <p className="text-3xl font-bold">{activeSubscriptions.length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <IconMail className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Unsubscribed</p>
                <p className="text-3xl font-bold">
                  {subscriptions.length - activeSubscriptions.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <IconMail className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search subscribers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">Subscribed</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-muted-foreground">
                      No subscribers found
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((subscription) => (
                    <tr key={subscription.id} className="border-t hover:bg-muted/50">
                      <td className="p-4 font-medium">{subscription.email}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(subscription.subscribed_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {subscription.unsubscribed_at ? (
                          <Badge variant="outline" className="bg-red-100 text-red-800">
                            Unsubscribed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Send Newsletter Dialog */}
      <Dialog open={isNewsletterDialogOpen} onOpenChange={setIsNewsletterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Newsletter</DialogTitle>
            <DialogDescription>
              Send a newsletter to your subscribers
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Weekly Digest"
              />
            </div>

            <div>
              <Label htmlFor="segment">Audience</Label>
              <select
                id="segment"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full border border-input rounded-md p-2"
              >
                <option value="all_subscribers">All Subscribers</option>
                <option value="active_only">Active Subscribers Only</option>
              </select>
            </div>

            <div>
              <Label htmlFor="templateId">Template ID (Optional)</Label>
              <Input
                id="templateId"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="Enter template UUID"
              />
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This will send to {activeSubscriptions.length} active subscribers.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewsletterDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNewsletter} disabled={sending}>
              <IconSend className="mr-2 h-4 w-4" />
              Send Newsletter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsPage;

