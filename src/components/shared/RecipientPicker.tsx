'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
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

export interface RecipientOption {
  /** The identity-service user id — what gets passed to `onChange`, never a domain entity id. */
  id: string;
  name: string;
  subtitle?: string;
}

export interface RecipientPickerProps {
  recipients: RecipientOption[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Searchable name-based recipient picker — replaces raw-id text inputs for
 * "who is this message going to". Every list of recipients passed in must
 * already carry the identity-service user id (not a domain entity id) since
 * that's what the messaging API's `receiverId` expects.
 */
export function RecipientPicker({
  recipients,
  value,
  onChange,
  disabled,
  placeholder = 'Sélectionner un destinataire',
}: RecipientPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = recipients.find((r) => r.id === value);
  const filtered = recipients.filter((r) => {
    const q = query.toLowerCase();
    return r.name.toLowerCase().includes(q) || (r.subtitle ?? '').toLowerCase().includes(q);
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
            {selected ? selected.name : placeholder}
          </span>
          <Search className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>Aucun résultat</CommandEmpty>
            <CommandGroup>
              {filtered.map((r) => (
                <CommandItem
                  key={r.id}
                  value={r.id}
                  onSelect={() => {
                    onChange(r.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-blue-50 text-blue-600">
                        {initialsOf(r.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{r.name}</p>
                      {r.subtitle && <p className="text-xs text-slate-500 truncate">{r.subtitle}</p>}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
