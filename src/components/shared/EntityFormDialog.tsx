'use client';

/**
 * Generic, schema-driven form dialog (React Hook Form + Zod).
 *
 * Instead of hand-writing register/Controller/error markup for every entity,
 * a feature declares a `fields` config + a Zod `schema`, and this component
 * renders + validates the form. It eliminates the near-identical boilerplate
 * previously duplicated across the student / user / class form dialogs.
 *
 * Layout: fields render in a 2-column grid; `colSpan: 2` (the default) makes a
 * field span the full width, `colSpan: 1` pairs it with a neighbour.
 */
import { useEffect } from 'react';
import {
  useForm,
  Controller,
  type FieldValues,
  type Path,
  type DefaultValues,
  type SubmitHandler,
  type Resolver,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldConfig<T extends FieldValues> {
  name: Path<T>;
  label: string;
  /** Defaults to 'text'. */
  type?: 'text' | 'email' | 'password' | 'date' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  /** Grid width: 2 = full row (default), 1 = half row. */
  colSpan?: 1 | 2;
  /** Options for `type: 'select'`. */
  options?: SelectOption[];
  /** Coerce the (string) select value to a number on change. */
  valueAsNumber?: boolean;
  /** Rows for `type: 'textarea'`. */
  rows?: number;
}

export interface EntityFormDialogProps<T extends FieldValues> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  fields: FieldConfig<T>[];
  /** Zod schema whose parsed output matches `T` (T is inferred from the props). */
  schema: z.ZodTypeAny;
  defaultValues: DefaultValues<T>;
  serverError?: string | null;
  isSubmitting?: boolean;
  onSubmit: SubmitHandler<T>;
}

export function EntityFormDialog<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  fields,
  schema,
  defaultValues,
  serverError,
  isSubmitting = false,
  onSubmit,
}: EntityFormDialogProps<T>) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<T>({
    resolver: zodResolver(schema) as unknown as Resolver<T>,
    defaultValues,
  });

  useEffect(() => {
    if (open) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultValues]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => {
              const error = (errors as Record<string, { message?: string }>)[field.name]
                ?.message;
              return (
                <div
                  key={field.name}
                  className={cn('space-y-1', (field.colSpan ?? 2) === 2 && 'sm:col-span-2')}
                >
                  <Label>
                    {field.label}{' '}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>

                  {field.type === 'textarea' ? (
                    <Textarea
                      rows={field.rows ?? 3}
                      placeholder={field.placeholder}
                      {...register(field.name)}
                    />
                  ) : field.type === 'select' ? (
                    <Controller
                      control={control}
                      name={field.name}
                      render={({ field: rhf }) => (
                        <Select
                          value={rhf.value != null ? String(rhf.value) : ''}
                          onValueChange={(v) =>
                            rhf.onChange(field.valueAsNumber ? Number(v) : v)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={field.placeholder ?? 'Select…'} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : (
                    <Input
                      type={field.type ?? 'text'}
                      placeholder={field.placeholder}
                      {...register(
                        field.name,
                        field.type === 'number' ? { valueAsNumber: true } : undefined
                      )}
                    />
                  )}

                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
