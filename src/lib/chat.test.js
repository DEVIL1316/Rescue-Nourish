import { describe, expect, test } from 'bun:test';
import { channelAllowsRole, uniqueChatRows } from './chat';

describe('two-way chat', () => {
  test('donors and NGOs can both reply in their shared channel', () => {
    expect(channelAllowsRole('donor-ngo', 'donor')).toBe(true);
    expect(channelAllowsRole('donor-ngo', 'ngo')).toBe(true);
    expect(channelAllowsRole('donor-ngo', 'orphanage_member')).toBe(false);
  });
  test('donors and orphanages can both reply in their shared channel', () => {
    expect(channelAllowsRole('donor-orphan', 'donor')).toBe(true);
    expect(channelAllowsRole('donor-orphan', 'orphanage_member')).toBe(true);
  });
  test('NGOs and orphanages can both reply in their shared channel', () => {
    expect(channelAllowsRole('ngo-orphan', 'ngo')).toBe(true);
    expect(channelAllowsRole('ngo-orphan', 'orphanage_member')).toBe(true);
  });
  test('keeps both sides and removes only fanout copies', () => {
    const sent = { id: '1', sender_id: 'donor', content: 'Food available', created_at: '2026-10-13T05:00:00Z' };
    const reply = { id: '3', sender_id: 'ngo', content: 'We can collect', created_at: '2026-10-13T05:01:00Z' };
    expect(uniqueChatRows([reply, sent, { ...sent, id: '2' }])).toEqual([sent, reply]);
  });
});