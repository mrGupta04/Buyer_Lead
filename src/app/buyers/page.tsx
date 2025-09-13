// app/buyers/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import BuyersList from '@/components/BuyersList';
import { authOptions } from '@/lib/auth';

export default async function BuyersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <BuyersList />
    </div>
  );
}