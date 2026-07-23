'use client';

/**
 * Compose-message dialog (React Hook Form + Zod). Recipient is a searchable
 * user picker — the real backend only supports 1:1 messages (no broadcast).
 */
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
import { Search, Send } from 'lucide-react';
import { composeFormSchema, emptyComposeForm, type ComposeFormValues } from '../validations';
import type { UserData } from '@/features/users';

export interface ComposeMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: UserData[];
  defaultValues?: ComposeFormValues;
  isSubmitting?: boolean;
  resetSignal?: number;
  onSubmit: (values: ComposeFormValues) => void | Promise<void>;
}

export function ComposeMessageDialog({
  open,
  onOpenChange,
  users,
  defaultValues,
  isSubmitting = false,
  resetSignal,
  onSubmit,
}: ComposeMessageDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ComposeFormValues>({
    resolver: zodResolver(composeFormSchema),
    defaultValues: defaultValues ?? emptyComposeForm,
  });

  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [userSearchValue, setUserSearchValue] = useState('');
  const receiverId = useWatch({ name: 'receiverId', defaultValue: defaultValues?.receiverId ?? '' });

  useEffect(() => {
    if (open) reset(defaultValues ?? emptyComposeForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resetSignal]);

  const selectedUserName = (() => {
    if (!receiverId) return 'Sélectionner un utilisateur...';
    const u = users.find((x) => x.id === receiverId);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/95 backdrop-blur-md border-blue-500/30 max-w-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-blue-700">Nouveau message</DialogTitle>
          <DialogDescription className="text-slate-600">
            Envoyer un message privé à un utilisateur
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="text-gray-700">Destinataire</Label>
            <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={userSearchOpen}
                  className="w-full justify-between bg-white border-gray-300 text-gray-900"
                >
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
                            setValue('receiverId', value, { shouldValidate: true });
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
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.receiverId && (
              <p className="text-sm text-destructive">{errors.receiverId.message}</p>
            )}
          </div>

          <div>
            <Label className="text-gray-700">Objet</Label>
            <Input
              placeholder="Objet du message (optionnel)"
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              {...register('subject')}
            />
          </div>

          <div>
            <Label className="text-gray-700">Message</Label>
            <Textarea
              placeholder="Écrivez votre message ici..."
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 min-h-32"
              {...register('content')}
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Envoi…' : 'Envoyer le message'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
