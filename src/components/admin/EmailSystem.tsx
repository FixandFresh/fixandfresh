import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Mail, Send, Reply, Tag, Clock, User, Plus } from 'lucide-react';

interface EmailTicket {
  id: string;
  subject: string;
  sender_email: string;
  sender_name: string;
  message: string;
  category: string;
  status: string;
  priority: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  replies?: EmailReply[];
}

interface EmailReply {
  id: string;
  ticket_id: string;
  sender: string;
  message: string;
  created_at: string;
}

const EmailSystem: React.FC = () => {
  const [tickets, setTickets] = useState<EmailTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<EmailTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    sender_email: '',
    sender_name: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const mockTickets: EmailTicket[] = [
        {
          id: '1',
          subject: 'New Service Application - Cleaning',
          sender_email: 'client@example.com',
          sender_name: 'John Doe',
          message: 'I would like to apply for cleaning services.',
          category: 'new_application',
          status: 'open',
          priority: 'high',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          subject: 'Document Upload - Provider Verification',
          sender_email: 'provider@example.com',
          sender_name: 'Jane Smith',
          message: 'Please find attached my verification documents.',
          category: 'document_upload',
          status: 'in_progress',
          priority: 'medium',
          assigned_to: 'Admin',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      setTickets(mockTickets);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch email tickets',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: newStatus, updated_at: new Date().toISOString() }
          : ticket
      ));
      
      toast({
        title: 'Status Updated',
        description: `Ticket status changed to ${newStatus}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update ticket status',
        variant: 'destructive'
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'new_application': return 'bg-blue-100 text-blue-800';
      case 'document_upload': return 'bg-green-100 text-green-800';
      case 'support_request': return 'bg-yellow-100 text-yellow-800';
      case 'complaint': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
    return matchesStatus && matchesCategory;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Loading email system...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Fix & Fresh Email System
              </CardTitle>
              <CardDescription>
                Centralized email management and ticketing system
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="new_application">New Application</SelectItem>
                <SelectItem value="document_upload">Document Upload</SelectItem>
                <SelectItem value="support_request">Support Request</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="font-medium">{ticket.subject}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{ticket.sender_name}</div>
                          <div className="text-sm text-gray-500">{ticket.sender_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(ticket.category)}>
                        {ticket.category.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ticket.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ticket.status}
                        onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No tickets found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSystem;