import Book from './book';
import {emptyCorpus} from '@/lib/model';
export const dynamic='force-dynamic';
export default function Home(){return <Book initial={emptyCorpus()}/>;}
