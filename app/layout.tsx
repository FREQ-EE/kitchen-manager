import type {Metadata,Viewport} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Kitchen Manager',description:'Recipes, pantry inventory and shopping.',robots:{index:false,follow:false},manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg'},appleWebApp:{capable:true,statusBarStyle:'black-translucent',title:'Recipes'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#151715'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-GB" className="dark"><body>{children}</body></html>;}
