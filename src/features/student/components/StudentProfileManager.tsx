'use client';

import { ProfileForm } from './ProfileForm';
import { ChangePasswordForm } from './ChangePasswordForm';

export function StudentProfileManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Mon profil</h1>
        <p className="text-slate-500 mt-1">Gérez vos informations personnelles et votre sécurité</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-2xl">
        <ProfileForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
