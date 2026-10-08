import {readJSON,writeJSON,head,DataError,backend} from './storage-backend';
import {validateRecord} from './validation';
import {recipeFrom,type Corpus,type PantryItem,type Change,stockLabels,restockLabels,replenishmentLabels,shoppingZoneLabels} from './model';

export async function readCorpus():Promise<Corpus>{
 const ref=await head()||undefined;
 const read=async(path:string)=>{const file=await readJSON(path,ref);validateRecord(path,file.data);return file;};
 const manifest=await read('manifest-index.json');
 const [index,annotations,storage,shopping,collections]=await Promise.all([read('recipes/index.json'),read('recipes/annotations.json'),read('config/storage.json'),read('config/shopping.json'),Promise.all(manifest.data.collections.map(async(c:any)=>{const {data}=await read(c.path);return data.items.map((p:any)=>({...p,key:`${c.id}:${p.id}`,collection:c.id,path:c.path}) as PantryItem);}))]);
 const recipes=await Promise.all(index.data.recipes.map(async(row:any)=>{const {data}=await read(row.path);if(data.id!==row.id)throw new DataError('Recipe index ID does not match its record.');return recipeFrom(data);}));
 const keys=new Set(collections.flat().map((p:PantryItem)=>p.key));
 for(const r of recipes)for(const i of [...r.ingredients,...(r.variants??[]).flatMap((v:any)=>v.overrides)])if(i.ref&&!keys.has(i.ref))throw new DataError('A recipe has an unknown pantry reference. Run npm run validate.');
 return {recipes,pantry:collections.flat(),categories:index.data.categories,annotations:annotations.data.recipes,storagePlaces:storage.data.stores.flatMap((s:any)=>s.places.map((p:any)=>s.name+' / '+p.label)),shoppingRoutes:shopping.data.routes,syncedAt:new Date().toISOString(),revision:ref??'',mode:'live',writable:true,featuredId:index.data.featured_recipe,connectionMessage:backend()==='local'?'Local files are the data store.':'GitHub is the data store.'};
}
export function validateChange(c:Change){
 if(!c||!['pantry','annotation'].includes(c.kind)||typeof c.id!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.id)||['__proto__','constructor','prototype'].includes(c.id))throw new DataError('Invalid change.',400);
 if(c.kind==='pantry'){
  for(const [field,values] of [['stock_status',stockLabels],['restock_status',restockLabels],['replenishment_policy',replenishmentLabels],['shopping_zone',shoppingZoneLabels]] as const)if(c.field===field&&typeof c.value==='string'&&Object.hasOwn(values,c.value))return;
  if(['storage_location','storage_location_alternate'].includes(c.field)&&(c.value===null||typeof c.value==='string'&&c.value.length<=200))return;
 }else{if(c.field==='rating'&&(c.value===null||Number.isInteger(c.value)&&Number(c.value)>=1&&Number(c.value)<=5))return;if(c.field==='favourite'&&typeof c.value==='boolean')return;}
 throw new DataError('Unsupported field or value.',400);
}
export async function writeChange(change:Change){
 validateChange(change);
 for(let attempt=0;attempt<4;attempt++){
  let path:string;
  if(change.kind==='pantry'){const {data:manifest}=await readJSON('manifest-index.json');validateRecord('manifest-index.json',manifest);const entry=manifest.collections.find((c:any)=>c.id===change.collection);if(!entry)throw new DataError('Unknown pantry collection.',400);path=entry.path;}
  else{const {data:index}=await readJSON('recipes/index.json');validateRecord('recipes/index.json',index);if(!index.recipes.some((r:any)=>r.id===change.id))throw new DataError('Unknown recipe.',404);path='recipes/annotations.json';}
  const {data,sha}=await readJSON(path);validateRecord(path,data);
  const target=change.kind==='pantry'?data.items.find((p:any)=>p.id===change.id):(data.recipes[change.id]??={});if(!target)throw new DataError('Unknown ingredient.',404);
  const current=target[change.field]??(change.field==='favourite'?false:null);
  if(JSON.stringify(current)===JSON.stringify(change.value))return {unchanged:true,path};
  if(JSON.stringify(current)!==JSON.stringify(change.before))throw new DataError('This field changed elsewhere. Refresh, discard this draft and choose again.',409);
  target[change.field]=change.value;validateRecord(path,data);
  try{const result=await writeJSON(path,data,sha,`Kitchen Manager: ${change.id} ${change.field}`);return {path,commit:result.commit};}catch(e){if(!(e instanceof DataError)||e.status!==409||attempt===3)throw e;}
 }
 throw new DataError('The data store is busy. Saving will retry.');
}
