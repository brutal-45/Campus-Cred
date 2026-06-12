'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { AvailableTasks } from '@/components/dashboard/AvailableTasks';

export default function TasksRoute() {
  return (
    <div className="animate-fade-in">
      <AvailableTasks />
    </div>
  );
}
