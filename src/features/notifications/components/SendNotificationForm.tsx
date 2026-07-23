'use client';

/**
 * Inline send-notification form (React Hook Form + Zod). Real backend is
 * per-user only (no broadcast) — the recipient is a searchable user picker.
 * Resets when `resetSignal` changes (the container bumps it after a send).
 */
import { useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Search } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  sendNotificationFormSchema,
  emptySendNotificationForm,
  type SendNotificationFormValues,
} from '../validations';
import { TYPE_OPTIONS, CHANNEL_OPTIONS } from '../constants';
import type { UserData } from '@/features/users';

export interface SendNotificationFormProps {
  users: UserData[];
  isSubmitting?: boolean;
  resetSignal?: number;
  onSubmit: (values: SendNotificationFormValues) => void | Promise<void>;
}

export function SendNotificationForm({
  users,
  isSubmitting = false,
  resetSignal,
  onSubmit,
}: SendNotificationFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SendNotificationFormValues>({
    resolver: zodResolver(sendNotificationFormSchema),
    defaultValues: emptySendNotificationForm,
  });

  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [userSearchValue, setUserSearchValue] = useState('');
  const userId = useWatch({ control, name: 'userId' });

  useEffect(() => {
    if (resetSignal !== undefined) reset(emptySendNotificationForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const selectedUserName = (() => {
    if (!userId) return 'Sélectionner un utilisateur...';
    const u = users.find((x) => x.id === userId);
    return u ? `${u.firstname ?? ''} ${u.lastname ?? ''} (${u.email})` : 'Sélectionner un utilisateur...';
  })();

  const filteredUsers = users.filter((u) => {
    const q = userSearchValue.toLowerCase();
    return (
      (u.firstname ?? '').toLowerCase().includes(q) ||
      (u.lastname ?? '').toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Destinataire</Label>
        <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" role="combobox" className="w-full justify-between">
              {selectedUserName}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Rechercher des utilisateurs..."
                value={userSearchValue}
                onValueChange={setUserSearchValue}
              />
              <CommandList>
                <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
                <CommandGroup>
                  {filteredUsers.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={(value) => {
                        setValue('userId', value, { shouldValidate: true });
                        setUserSearchOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {(user.firstname ?? '').charAt(0)}
                            {(user.lastname ?? '').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.firstname} {user.lastname}
                          </div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.userId && <p className="text-sm text-destructive">{errors.userId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Titre</Label>
        <Input placeholder="Maintenance du système" {...register('title')} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Message</Label>
        <Textarea placeholder="Le système sera indisponible pour maintenance..." {...register('message')} />
        {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Canal</Label>
          <Controller
            control={control}
            name="channel"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un canal" />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          'Envoi en cours...'
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" /> Envoyer la notification
          </>
        )}
      </Button>
    </form>
  );
}
