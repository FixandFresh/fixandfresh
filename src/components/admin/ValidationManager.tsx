import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ProviderRow { id:string; status:'pending'|'approved'|'suspended'|'rejected'; bio:string|null; service_area:string|null; rating:number; completed_jobs:number; profile?:{full_name:string;phone:string|null}; }

const ValidationManager:React.FC=()=>{
  const {toast}=useToast(); const [providers,setProviders]=useState<ProviderRow[]>([]); const [loading,setLoading]=useState(true);
  const load=async()=>{setLoading(true); const {data,error}=await supabase.from('providers').select('id,status,bio,service_area,rating,completed_jobs,profiles(full_name,phone)').order('created_at',{ascending:false}); if(error)toast({title:'Validation error',description:error.message,variant:'destructive'}); else setProviders((data??[]) as ProviderRow[]); setLoading(false);};
  useEffect(()=>{void load();},[]);
  const decide=async(provider:ProviderRow,status:'approved'|'rejected'|'suspended')=>{const {error}=await supabase.from('providers').update({status}).eq('id',provider.id); if(error){toast({title:'Provider update failed',description:error.message,variant:'destructive'});return;} if(status==='approved'){const {error:roleError}=await supabase.from('profiles').update({role:'provider'}).eq('id',provider.id); if(roleError)toast({title:'Role update failed',description:roleError.message,variant:'destructive'});} toast({title:'Provider updated',description:(provider.profile?.full_name||provider.id)+' → '+status}); await load();};
  if(loading)return <div className='p-6'>Loading provider applications…</div>;
  return <Card><CardHeader><CardTitle>Provider Verification</CardTitle></CardHeader><CardContent><div className='rounded-md border overflow-x-auto'><Table><TableHeader><TableRow><TableHead>Provider</TableHead><TableHead>Area</TableHead><TableHead>Status</TableHead><TableHead>Rating</TableHead><TableHead>Jobs</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{providers.map(provider=><TableRow key={provider.id}><TableCell><div className='font-medium'>{provider.profile?.full_name||'Unknown'}</div><div className='text-xs text-slate-500'>{provider.profile?.phone||provider.id.slice(0,8)}</div></TableCell><TableCell>{provider.service_area||'—'}</TableCell><TableCell><Badge>{provider.status}</Badge></TableCell><TableCell>{Number(provider.rating).toFixed(2)}</TableCell><TableCell>{provider.completed_jobs}</TableCell><TableCell><div className='flex gap-2'><Button size='sm' onClick={()=>void decide(provider,'approved')} disabled={provider.status==='approved'}>Approve</Button><Button size='sm' variant='outline' onClick={()=>void decide(provider,'rejected')} disabled={provider.status==='rejected'}>Reject</Button><Button size='sm' variant='destructive' onClick={()=>void decide(provider,'suspended')} disabled={provider.status==='suspended'}>Suspend</Button></div></TableCell></TableRow>)}</TableBody></Table></div>{providers.length===0&&<p className='text-center py-8 text-slate-500'>No provider applications yet.</p>}</CardContent></Card>;
};

export default ValidationManager;