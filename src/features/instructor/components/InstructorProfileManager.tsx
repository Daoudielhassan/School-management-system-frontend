'use client';

import { UserCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProfileForm } from './ProfileForm';
import { ChangePasswordForm } from './ChangePasswordForm';

export function InstructorProfileManager() {
  return (
    <div className="space-y-6">
      <PageHeader icon={UserCircle} title="Mon profil" description="Informations personnelles et sécurité" />

      <div className="max-w-2xl space-y-6">
        <ProfileForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
