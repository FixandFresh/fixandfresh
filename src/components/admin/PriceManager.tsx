import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, DollarSign, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ServiceRow { id:string; name:string; category:string|null; base_price:number; market_price:number|null; active:boolean; }

const PriceManager:React.FC=()=>{
  const {toast}=useToast();
  const [services,setServices]=useState<ServiceRow[]>([]);
  const [editing,setEditing]=useState<ServiceRow|null>(null);
  const [price,setPrice]=useState('');
  const [market,setMarket]=useState('');

  const load=async()=>{const {data,error}=await supabase.from('services').select('id,name,category,base_price,market_price,active').order('name'); if(error) toast({title:'Pricing error',description:error.message,variant:'destructive'}); else setServices((data??[]) as ServiceRow[]);};
  useEffect(()=>{void load();},[]);

  const save=async()=>{if(!editing)return; const {error}=await supabase.from('services').update({base_price:Math.max(0,Number(price)||0),market_price:market?Math.max(0,Number(market)):null}).eq('id',editing.id); if(error){toast({title:'Update failed',description:error.message,variant:'destructive'});return;} toast({title:'Price updated',description:editing.name}); setEditing(null); await load();};

  return <Card><CardHeader><CardTitle className='flex items-center gap-2'><DollarSign className='h-5 w-5'/>Service Pricing</CardTitle></CardHeader><CardContent><div className='rounded-md border overflow-x-auto'><Table><TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Market</TableHead><TableHead>Status</TableHead><TableHead/></TableRow></TableHeader><TableBody>{services.map(service=><TableRow key={service.id}><TableCell className='font-medium'>{service.name}</TableCell><TableCell>{service.category||'—'}</TableCell><TableCell>${Number(service.base_price).toFixed(2)}</TableCell><TableCell>{service.market_price==null?'—':'$'+Number(service.market_price).toFixed(2)}</TableCell><TableCell><Badge variant={service.active?'default':'secondary'}>{service.active?'Active':'Inactive'}</Badge></TableCell><TableCell><Button size='sm' variant='outline' onClick={()=>{setEditing(service);setPrice(String(service.base_price));setMarket(service.market_price==null?'':String(service.market_price));}}><Edit className='h-4 w-4 mr-1'/>Edit</Button></TableCell></TableRow>)}</TableBody></Table></div></CardContent>
    <Dialog open={!!editing} onOpenChange={(open)=>{if(!open)setEditing(null)}}><DialogContent><DialogHeader><DialogTitle>Edit {editing?.name}</DialogTitle></DialogHeader><div className='space-y-4'><div><label className='text-sm font-medium'>Base price</label><Input type='number' min='0' step='0.01' value={price} onChange={e=>setPrice(e.target.value)}/></div><div><label className='text-sm font-medium'>Market price</label><Input type='number' min='0' step='0.01' value={market} onChange={e=>setMarket(e.target.value)}/></div><Button onClick={()=>void save()}><Save className='h-4 w-4 mr-1'/>Save</Button></div></DialogContent></Dialog>
  </Card>;
};

export default PriceManager;