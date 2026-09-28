import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, UserCheck, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type ProviderStatus = 'pending' | 'approved' | 'suspended' | 'rejected';
interface ProfileRow {
  id: string;
  full_name: string;
  phone: string | null;
  role: 'customer' | 'provider' | 'admin';
  created_at: string;
  provider_status: ProviderStatus | null;
}

const UsersManager: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id,full_name,phone,role,created_at,providers(status)')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Users error', description: error.message, variant: 'destructive' });
    } else {
      setUsers((data ?? []).map((row: any) => ({
        id: row.id,
        full_name: row.full_name,
        phone: row.phone,
        role: row.role,
        created_at: row.created_at,
        provider_status: Array.isArray(row.providers) ? (row.providers[0]?.status ?? null) : (row.providers?.status ?? null)
      })) as ProfileRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const changeRole = async (userId: string, role: ProfileRow['role']) => {
    setActionId(userId);
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) {
      toast({ title: 'Role update failed', description: error.message, variant: 'destructive' });
      setActionId(null);
      return;
    }

    if (role === 'provider') {
      const { error: providerError } = await supabase.from('providers').upsert({ id: userId, status: 'pending' });
      if (providerError) {
        toast({ title: 'Provider setup failed', description: providerError.message, variant: 'destructive' });
      }
    } else if (role === 'customer') {
      await supabase.from('providers').update({ status: 'suspended' }).eq('id', userId);
    }

    toast({ title: 'Role updated', description: 'The user role was updated successfully.' });
    await load();
    setActionId(null);
  };

  const updateProviderStatus = async (user: ProfileRow, status: ProviderStatus) => {
    if (!user.provider_status && user.role !== 'provider') {
      toast({ title: 'Not a provider application', description: 'Only provider accounts can be approved here.', variant: 'destructive' });
      return;
    }

    setActionId(user.id);
    const { error: providerError } = await supabase
      .from('providers')
      .upsert({ id: user.id, status });

    if (providerError) {
      toast({ title: 'Provider approval failed', description: providerError.message, variant: 'destructive' });
      setActionId(null);
      return;
    }

    if (status === 'approved') {
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'provider' })
        .eq('id', user.id);

      if (roleError) {
        await supabase.from('providers').update({ status: 'pending' }).eq('id', user.id);
        toast({ title: 'Provider approval failed', description: roleError.message, variant: 'destructive' });
        setActionId(null);
        return;
      }
    }

    toast({
      title: status === 'approved' ? 'Provider approved' : 'Provider status updated',
      description: `${user.full_name || user.id} → ${status}`
    });
    await load();
    setActionId(null);
  };

  const filtered = users.filter(user =>
    (user.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (user.phone ?? '').toLowerCase().includes(search.toLowerCase()) ||
    user.id.includes(search)
  );

  if (loading) return <div className='p-6'>Loading users…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex flex-wrap items-center justify-between gap-2'>
          <span>Users & Provider Applications</span>
          <span className='text-sm font-normal text-slate-500'>{users.length} profiles</span>
        </CardTitle>
        <p className='text-sm text-slate-500'>Customer accounts are active after registration. Provider accounts require admin approval before they can accept jobs.</p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='relative'>
          <Search className='absolute left-3 top-3 h-4 w-4 text-slate-400'/>
          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search name, phone, or user ID' className='pl-10'/>
        </div>

        <div className='rounded-md border overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Provider Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(user => (
                <TableRow key={user.id}>
                  <TableCell className='font-medium'>{user.full_name || 'Unnamed user'}</TableCell>
                  <TableCell>{user.phone || '—'}</TableCell>
                  <TableCell><Badge>{user.role}</Badge></TableCell>
                  <TableCell>
                    {user.provider_status ? <Badge variant={user.provider_status === 'approved' ? 'default' : user.provider_status === 'rejected' ? 'destructive' : 'secondary'}>{user.provider_status}</Badge> : <span className='text-slate-400'>—</span>}
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Select value={user.role} onValueChange={value=>void changeRole(user.id,value as ProfileRow['role'])} disabled={actionId===user.id}>
                        <SelectTrigger className='w-36'><SelectValue/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value='customer'>Customer</SelectItem>
                          <SelectItem value='provider'>Provider</SelectItem>
                          <SelectItem value='admin'>Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      {(user.provider_status === 'pending' || (user.role === 'provider' && user.provider_status !== 'approved')) && (
                        <Button size='sm' onClick={()=>void updateProviderStatus(user,'approved')} disabled={actionId===user.id}>
                          <UserCheck className='h-4 w-4 mr-1'/>
                          {actionId===user.id ? 'Saving…' : 'Approve'}
                        </Button>
                      )}

                      {user.provider_status === 'approved' && (
                        <Button size='sm' variant='outline' onClick={()=>void updateProviderStatus(user,'suspended')} disabled={actionId===user.id}>
                          <UserX className='h-4 w-4 mr-1'/>
                          Suspend
                        </Button>
                      )}

                      <Button size='icon' variant='outline' onClick={()=>void load()} title='Refresh' disabled={actionId===user.id}>
                        <RefreshCw className='h-4 w-4'/>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filtered.length === 0 && <p className='text-center py-8 text-slate-500'>No users found.</p>}
      </CardContent>
    </Card>
  );
};

export default UsersManager;
