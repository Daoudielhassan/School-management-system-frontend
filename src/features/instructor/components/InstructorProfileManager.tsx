'use client';

import { ProfileForm } from './ProfileForm';
import { ChangePasswordForm } from './ChangePasswordForm';

export function InstructorProfileManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Mon profil</h1>
        <p className="text-slate-500 mt-1">Informations personnelles et sécurité</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <ProfileForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
