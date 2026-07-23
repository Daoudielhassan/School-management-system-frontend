'use client';

/**
 * Create / edit user form over the shared `EntityFormDialog`. Password is shown
 * only in create mode; the schema is chosen per mode.
 */
import { useMemo } from 'react';
import { EntityFormDialog, type FieldConfig } from '@/components/shared/EntityFormDialog';
import { buildUserSchema, type UserFormValues } from '../validations';
import { USER_ROLES, formatRole } from '../constants';

export interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  defaultValues: UserFormValues;
  serverError?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: UserFormValues) => void | Promise<void>;
}

export function UserFormDialog({ mode, ...props }: UserFormDialogProps) {
  const fields = useMemo<FieldConfig<UserFormValues>[]>(() => {
    const list: FieldConfig<UserFormValues>[] = [
      { name: 'firstname', label: 'Prénom', colSpan: 1 },
      { name: 'lastname', label: 'Nom', colSpan: 1 },
      { name: 'username', label: "Nom d'utilisateur", required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
    ];
    if (mode === 'create') {
      list.push({ name: 'password', label: 'Mot de passe', type: 'password', required: true });
    }
    list.push({
      name: 'role',
      label: 'Rôle',
      type: 'select',
      required: true,
      options: USER_ROLES.map((r) => ({ value: r, label: formatRole(r) })),
    });
    return list;
  }, [mode]);

  return (
    <EntityFormDialog<UserFormValues>
      {...props}
      title={mode === 'create' ? 'Ajouter un utilisateur' : "Modifier l'utilisateur"}
      submitLabel={mode === 'create' ? 'Créer' : 'Enregistrer'}
      schema={buildUserSchema(mode)}
      fields={fields}
    />
  );
}
