'use client';

import { UserCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProfileForm } from './ProfileForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { MyResponsibilitiesCard } from './MyResponsibilitiesCard';
import { MyActionsCard } from './MyActionsCard';

export function ManagerProfileManager() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserCircle}
        title="Mon profil"
        description="Informations personnelles, sécurité et responsabilités"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProfileForm />
          <ChangePasswordForm />
        </div>
        <div className="space-y-6">
          <MyResponsibilitiesCard />
          <MyActionsCard />
        </div>
      </div>
    </div>
  );
}
