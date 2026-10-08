import {writeChange} from '@/lib/corpus';
import {apiError,sameOrigin} from '@/lib/storage-backend';
export const dynamic='force-dynamic';
export async function POST(request:Request){if(!sameOrigin(request))return Response.json({error:'Invalid request origin.'},{status:403});try{const raw=await request.text();if(raw.length>4096)return Response.json({error:'Request too large.'},{status:413});return Response.json(await writeChange(JSON.parse(raw)),{headers:{'Cache-Control':'private, no-store'}});}catch(e){return apiError(e);}}
