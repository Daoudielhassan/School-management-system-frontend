'use client';

import { ProfileForm } from './ProfileForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { MyResponsibilitiesCard } from './MyResponsibilitiesCard';
import { MyActionsCard } from './MyActionsCard';

export function ManagerProfileManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Mon profil</h1>
        <p className="text-slate-500 mt-1">Informations personnelles, sécurité et responsabilités</p>
      </div>

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
