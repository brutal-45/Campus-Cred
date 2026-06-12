'use client';

import dynamic from 'next/dynamic';
const TaskPage = dynamic(() => import('@/components/task/TaskPage').then(m => ({ default: m.TaskPage })), { ssr: false });
export default function TaskDetailRoute() { return <TaskPage />; }
