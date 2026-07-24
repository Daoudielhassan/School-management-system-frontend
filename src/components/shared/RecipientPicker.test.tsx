import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RecipientPicker, type RecipientOption } from './RecipientPicker';

/**
 * Regression test for the "no raw IDs in UI" rule: RecipientPicker replaced a
 * raw-id text input for message composition (see MessagesManager history).
 * The id must only ever be used internally (onChange payload) — the visible
 * trigger must always show a resolved name or the placeholder, never the id.
 */
describe('RecipientPicker', () => {
  const recipients: RecipientOption[] = [
    { id: 'a1b2c3d4-e5f6-4789-a012-3456789abcde', name: 'Amina Ziani' },
  ];

  it('shows the resolved name, never the raw id, when a recipient is selected', () => {
    render(<RecipientPicker recipients={recipients} value={recipients[0].id} onChange={vi.fn()} />);

    expect(screen.getByText('Amina Ziani')).toBeInTheDocument();
    expect(screen.queryByText(recipients[0].id)).not.toBeInTheDocument();
  });

  it('falls back to the placeholder, never the raw id, when the selected id has no match', () => {
    const unknownId = 'ffffffff-0000-4000-8000-unknownuserid';

    render(<RecipientPicker recipients={recipients} value={unknownId} onChange={vi.fn()} />);

    expect(screen.getByText('Sélectionner un destinataire')).toBeInTheDocument();
    expect(screen.queryByText(unknownId)).not.toBeInTheDocument();
  });
});
