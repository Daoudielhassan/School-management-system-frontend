/**
 * Zod schemas + payload mappers for the user create/edit form.
 *
 * Password is required on create and absent on edit, so the resolver schema is
 * chosen per mode via `buildUserSchema`. The form value type stays uniform.
 */
import { z } from 'zod';
import { USER_ROLES } from './constants';
import type { CreateUserPayload, UpdateUserPayload } from './types';

const baseUserFields = {
  username: z.string().trim().min(1, 'Username is required'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  firstname: z.string().trim(),
  lastname: z.string().trim(),
  role: z.enum(USER_ROLES),
};

export const createUserSchema = z.object({
  ...baseUserFields,
  password: z.string().min(1, 'Password is required'),
});

export const editUserSchema = z.object({
  ...baseUserFields,
  password: z.string(),
});

export type UserFormValues = z.infer<typeof createUserSchema>;

/** Pick the schema matching the form mode. */
export function buildUserSchema(
  mode: 'create' | 'edit'
): z.ZodType<UserFormValues, z.ZodTypeDef, UserFormValues> {
  return mode === 'create' ? createUserSchema : editUserSchema;
}

export const emptyUserForm: UserFormValues = {
  username: '',
  email: '',
  firstname: '',
  lastname: '',
  role: 'STUDENT',
  password: '',
};

export function toCreateUserPayload(values: UserFormValues): CreateUserPayload {
  return {
    username: values.username,
    email: values.email,
    password: values.password,
    firstname: values.firstname || null,
    lastname: values.lastname || null,
    role: values.role,
  };
}

export function toUpdateUserPayload(values: UserFormValues): UpdateUserPayload {
  return {
    username: values.username,
    email: values.email,
    firstname: values.firstname || null,
    lastname: values.lastname || null,
    role: values.role,
  };
}
