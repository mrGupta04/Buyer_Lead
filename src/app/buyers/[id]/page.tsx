// app/buyers/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BuyerForm from '@/components/BuyerForm';
import BuyerHistory from '@/components/BuyerHistory';
import { authOptions } from '@/lib/auth';

interface PageProps {
  params: { id: string };
}

export default async function BuyerDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  const buyer = await prisma.buyer.findUnique({
    where: { id: params.id },
    include: {
      owner: {
        select: { name: true, email: true }
      }
    }
  });
  
  if (!buyer) {
    notFound();
  }
  
  // Check ownership (unless admin)
  if (buyer.ownerId !== session.user.id && session.user.role !== 'admin') {
    redirect('/buyers');
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Buyer</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <BuyerForm initialData={buyer} isEdit={true} />
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Change History</h2>
          <BuyerHistory buyerId={params.id} />
        </div>
      </div>
    </div>
  );
}