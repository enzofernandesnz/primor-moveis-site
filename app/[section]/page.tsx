import Site from '../site';import {notFound} from 'next/navigation';
const titles:Record<string,string>={projetos:'Projetos de móveis planejados',sobre:'Nossa história',contato:'Contato e orçamento',privacidade:'Privacidade'};
export async function generateMetadata({params}:{params:Promise<{section:string}>}){const {section}=await params;return {title:titles[section]||'Página não encontrada'}}
export default async function Page({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!titles[section])notFound();return <Site page={section}/>}