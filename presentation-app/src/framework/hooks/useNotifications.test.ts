// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from './useNotifications';

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with empty notifications', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications).toEqual([]);
  });

  it('adds a notification via showNotification', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.showNotification('success', 'Saved!');
    });
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].type).toBe('success');
    expect(result.current.notifications[0].message).toBe('Saved!');
  });

  it('auto-removes notification after duration', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.showNotification('info', 'Hello', 1000);
    });
    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1001);
    });
    expect(result.current.notifications).toHaveLength(0);
  });

  it('convenience methods set correct types', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.showSuccess('ok');
      result.current.showError('fail');
      result.current.showWarning('warn');
      result.current.showInfo('fyi');
    });
    const types = result.current.notifications.map(n => n.type);
    expect(types).toEqual(['success', 'error', 'warning', 'info']);
  });

  it('assigns unique IDs to each notification', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.showSuccess('a');
      result.current.showSuccess('b');
    });
    const ids = result.current.notifications.map(n => n.id);
    expect(new Set(ids).size).toBe(2);
  });
});
