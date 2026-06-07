'use client';

import { Suspense } from 'react';
import TasksView from '../../../components/Tasks/TasksView';

export default function TasksPage() {
    return (
        <Suspense>
            <TasksView />
        </Suspense>
    );
}