import {readCorpus} from '@/lib/corpus';
import {apiError} from '@/lib/storage-backend';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await readCorpus(),{headers:{'Cache-Control':'private, no-store'}});}catch(e){return apiError(e);}}
