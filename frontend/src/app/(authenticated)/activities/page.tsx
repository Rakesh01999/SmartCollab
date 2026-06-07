'use client';

import { Suspense } from 'react';
import ActivityLogView from '../../../components/ActivityLog/ActivityLogView';

export default function ActivitiesPage() {
    return (
        <Suspense>
            <ActivityLogView />
        </Suspense>
    );
}