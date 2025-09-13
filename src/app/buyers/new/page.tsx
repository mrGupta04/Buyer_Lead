// app/buyers/new/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import BuyerForm from '@/components/BuyerForm';
import { authOptions } from '@/lib/auth';

export default async function NewBuyerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Buyer Lead</h1>
        <BuyerForm />
      </div>
    </div>
  );
}