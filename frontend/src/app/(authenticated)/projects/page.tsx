'use client';

import { Suspense } from 'react';
import ProjectsView from '../../../components/Projects/ProjectsView';

export default function ProjectsPage() {
    return (
        <Suspense>
            <ProjectsView />
        </Suspense>
    );
}