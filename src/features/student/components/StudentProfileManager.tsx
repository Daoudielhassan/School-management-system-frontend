'use client';

import { UserCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProfileForm } from './ProfileForm';
import { ChangePasswordForm } from './ChangePasswordForm';

export function StudentProfileManager() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserCircle}
        title="Mon profil"
        description="Gérez vos informations personnelles et votre sécurité"
      />

      <div className="grid grid-cols-1 gap-6 max-w-2xl">
        <ProfileForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
