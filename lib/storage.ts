import type {PantryItem} from './model';
export const locationLabel=(id:string|null|undefined)=>id||'Not recorded';
export function itemPlaces(p:PantryItem){return {primary:p.storage_location??null,alternate:p.storage_location_alternate??null};}
