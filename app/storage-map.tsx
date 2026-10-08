"use client";
import {useState} from 'react';
import type {PantryItem} from '@/lib/model';
export function StorageMap({item,editing,onChoose,places}:{item:PantryItem;editing:boolean;places:string[];onChoose:(field:'storage_location'|'storage_location_alternate',id:string|null)=>void}){
 const [field,setField]=useState<'storage_location'|'storage_location_alternate'>('storage_location'),[text,setText]=useState('');
 return <div className="storage-location"><p>Usual place: {item.storage_location||'Not recorded'}</p><p>After opening / alternate: {item.storage_location_alternate||'Not recorded'}</p>{editing&&<><label>Location to edit<select value={field} onChange={e=>setField(e.target.value as typeof field)}><option value="storage_location">Usual place</option><option value="storage_location_alternate">After opening / alternate</option></select></label><div className="storage-section-picker">{places.map(place=><button key={place} onClick={()=>onChoose(field,place)}>{place}</button>)}</div><label>Location name<input aria-label="Location name" maxLength={200} value={text} onChange={e=>setText(e.target.value)}/></label><button className="primary-button" disabled={!text.trim()} onClick={()=>onChoose(field,text.trim())}>Set location</button><button className="text-button" onClick={()=>onChoose(field,null)}>Clear location</button></>}</div>;
}
