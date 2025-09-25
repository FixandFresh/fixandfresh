import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Eye, FileText, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Validation {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: string[];
  submitted_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  user_email?: string;
  user_name?: string;
}

const ValidationManager: React.FC = () => {
  const [validations, setValidations] = useState<Validation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  useEffect(() => {
    fetchValidations();
  }, []);

  const fetchValidations = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_validations')
        .select(`
          *,
          profiles!inner(email, full_name)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        status: item.status,
        documents: item.documents || [],
        submitted_at: item.submitted_at,
        reviewed_at: item.reviewed_at,
        reviewer_notes: item.reviewer_notes,
        user_email: item.profiles?.email,
        user_name: item.profiles?.full_name
      })) || [];

      setValidations(formattedData);
    } catch (error) {
      console.error('Error fetching validations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch validations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (validationId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('provider_validations')
        .update({
          status: approved ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewer_notes: approved ? 'Approved by admin' : 'Rejected by admin'
        })
        .eq('id', validationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Validation ${approved ? 'approved' : 'rejected'} successfully`
      });

      fetchValidations();
    } catch (error) {
      console.error('Error updating validation:', error);
      toast({
        title: "Error",
        description: "Failed to update validation",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredValidations = validations.filter(v => v.status === activeTab);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Validation Management
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-1">
          <TabsTrigger value="pending" className="rounded-lg">
            Pending ({validations.filter(v => v.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-lg">
            Approved ({validations.filter(v => v.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg">
            Rejected ({validations.filter(v => v.status === 'rejected').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {filteredValidations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No {activeTab} validations found</p>
                </CardContent>
              </Card>
            ) : (
              filteredValidations.map((validation) => (
                <Card key={validation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {validation.user_name || 'Unknown User'}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{validation.user_email}</p>
                      </div>
                      {getStatusBadge(validation.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Submitted:</span>
                          <p>{new Date(validation.submitted_at).toLocaleDateString()}</p>
                        </div>
                        {validation.reviewed_at && (
                          <div>
                            <span className="font-semibold">Reviewed:</span>
                            <p>{new Date(validation.reviewed_at).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="font-semibold text-sm">Documents:</span>
                        <p className="text-sm text-gray-600">
                          {validation.documents.length} document(s) submitted
                        </p>
                      </div>

                      {validation.reviewer_notes && (
                        <div>
                          <span className="font-semibold text-sm">Notes:</span>
                          <p className="text-sm text-gray-600">{validation.reviewer_notes}</p>
                        </div>
                      )}

                      {validation.status === 'pending' && (
                        <div className="flex gap-2 pt-4">
                          <Button
                            size="sm"
                            onClick={() => handleApproval(validation.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApproval(validation.id, false)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ValidationManager;