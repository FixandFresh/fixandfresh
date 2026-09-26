import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ProfileRow { id:string; full_name:string; phone:string|null; role:'customer'|'provider'|'admin'; created_at:string; }

const UsersManager: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('id,full_name,phone,role,created_at').order('created_at',{ascending:false});
    if (error) toast({title:'Users error',description:error.message,variant:'destructive'});
    else setUsers((data ?? []) as ProfileRow[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const changeRole = async (userId:string, role:ProfileRow['role']) => {
    const { error } = await supabase.from('profiles').update({role}).eq('id',userId);
    if (error) { toast({title:'Role update failed',description:error.message,variant:'destructive'}); return; }
    if (role === 'provider') {
      const { error: providerError } = await supabase.from('providers').upsert({id:userId,status:'pending'});
      if (providerError) toast({title:'Provider setup failed',description:providerError.message,variant:'destructive'});
    } else if (role === 'customer') {
      await supabase.from('providers').update({status:'suspended'}).eq('id',userId);
    }
    toast({title:'Role updated',description:'The user role was updated successfully.'});
    await load();
  };

  const filtered = users.filter(user => (user.full_name ?? '').toLowerCase().includes(search.toLowerCase()) || (user.phone ?? '').toLowerCase().includes(search.toLowerCase()) || user.id.includes(search));

  if (loading) return <div className='p-6'>Loading users…</div>;

  return <Card><CardHeader><CardTitle className='flex items-center justify-between'><span>Users</span><span className='text-sm font-normal text-slate-500'>{users.length} profiles</span></CardTitle></CardHeader><CardContent className='space-y-4'>
    <div className='relative'><Search className='absolute left-3 top-3 h-4 w-4 text-slate-400'/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search name, phone, or user ID' className='pl-10'/></div>
    <div className='rounded-md border overflow-x-auto'><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead>Action</TableHead></TableRow></TableHeader><TableBody>
      {filtered.map(user => <TableRow key={user.id}><TableCell className='font-medium'>{user.full_name || 'Unnamed user'}</TableCell><TableCell>{user.phone || '—'}</TableCell><TableCell><Badge>{user.role}</Badge></TableCell><TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell><TableCell><div className='flex items-center gap-2'><Select value={user.role} onValueChange={value=>void changeRole(user.id,value as ProfileRow['role'])}><SelectTrigger className='w-36'><SelectValue/></SelectTrigger><SelectContent><SelectItem value='customer'>Customer</SelectItem><SelectItem value='provider'>Provider</SelectItem><SelectItem value='admin'>Admin</SelectItem></SelectContent></Select><Button size='icon' variant='outline' onClick={()=>void load()} title='Refresh'><Save className='h-4 w-4'/></Button></div></TableCell></TableRow>)}
    </TableBody></Table></div>
    {filtered.length === 0 && <p className='text-center py-8 text-slate-500'>No users found.</p>}
  </CardContent></Card>;
};

export default UsersManager;