/**
 * Zod schema + payload mappers for the manager create/edit form.
 *
 * One shared form shape covers both flows (mirroring the students feature):
 * the create-only fields (`departmentId`, `dateOfBirth`, `hireDate`) stay in
 * the schema so validation works uniformly, but the edit flow pre-fills them
 * from the existing manager and never renders inputs for them
 * (`ManagerFormDialog` hides those fields when `mode === 'edit'`) — and the
 * two payload mappers below only send what each real endpoint accepts.
 * `employeeNumber` is never part of the form — it's generated server-side.
 */
import { z } from 'zod';
import type { ManagerCreatePayload, ManagerUpdatePayload, ManagerLevel } from './types';

export const managerFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  departmentId: z.string().trim().min(1, 'Department is required'),
  dateOfBirth: z.string().trim().min(1, 'Date of birth is required'),
  hireDate: z.string().trim().min(1, 'Hire date is required'),
  phone: z.string().trim(),
  level: z.string().trim(),
  specialization: z.string().trim(),
  officeLocation: z.string().trim(),
  officePhone: z.string().trim(),
  bio: z.string().trim(),
});

export type ManagerFormValues = z.infer<typeof managerFormSchema>;

export const emptyManagerForm: ManagerFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  departmentId: '',
  dateOfBirth: '',
  hireDate: '',
  phone: '',
  level: '',
  specialization: '',
  officeLocation: '',
  officePhone: '',
  bio: '',
};

/** `POST /api/managers` body. */
export function toManagerCreatePayload(values: ManagerFormValues): ManagerCreatePayload {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    departmentId: values.departmentId,
    dateOfBirth: values.dateOfBirth,
    hireDate: values.hireDate,
    phone: values.phone || null,
    level: (values.level || undefined) as ManagerLevel | undefined,
    specialization: values.specialization || null,
    officeLocation: values.officeLocation || null,
    officePhone: values.officePhone || null,
    bio: values.bio || null,
  };
}

/** `PUT /api/managers/{id}` body — deliberately excludes the immutable fields. */
export function toManagerUpdatePayload(values: ManagerFormValues): ManagerUpdatePayload {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone || null,
    level: (values.level || undefined) as ManagerLevel | undefined,
    specialization: values.specialization || null,
    officeLocation: values.officeLocation || null,
    officePhone: values.officePhone || null,
    bio: values.bio || null,
  };
}
