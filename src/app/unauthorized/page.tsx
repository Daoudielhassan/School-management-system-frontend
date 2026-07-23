'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Unauthorized() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#f2f5fa] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl bg-red-50 ring-1 ring-inset ring-red-100">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Accès refusé</h1>
          <p className="text-sm text-slate-500 mt-2">
            Vous n&apos;avez pas la permission d&apos;accéder à cette page.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={() => router.back()}>Retour</Button>
          <Button variant="outline" onClick={logout}>
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}
