'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shell } from '../../components/Shell';
import { ProjectTabs } from '../../components/ProjectTabs';
import { getProject, listVersions, type Project, type Version } from '../../../lib/api';

const STATUS_COLOR: Record<string, string> = {
  draft: '#64748b',
  testing: '#d97706',
  awaiting_approval: '#2563eb',
  approved: '#16a34a',
  deployed: '#16a34a',
};

export default function ProjectOverview({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    getProject(projectId).then(setProject).catch(() => undefined);
    listVersions(projectId).then(setVersions).catch(() => undefined);
  }, [projectId]);

  const steps = [
    ['Mappings', 'Generate & review AI field mappings.', `/projects/${projectId}/mappings`],
    ['Validations & transforms', 'AI-suggested rules and value transforms.', `/projects/${projectId}/validations`],
    ['Test', 'Run sample data; download CSV or deliver via API.', `/projects/${projectId}/test`],
    ['Schedule', 'Save as a pipeline and run on a cron.', `/projects/${projectId}/schedule`],
    ['Migration', 'Sequence entities by dependency.', `/projects/${projectId}/migration`],
    ['Versions', 'Submit, approve, deploy, document.', `/projects/${projectId}/versions`],
  ];

  return (
    <Shell title={project?.name ?? 'Project'} subtitle={project ? `${project.type} project` : undefined}>
      <ProjectTabs projectId={projectId} />

      {versions.length > 0 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <h3 style={{ marginTop: 0 }}>Versions</h3>
          {versions.map((v) => (
            <span key={v.id} style={{ marginRight: 10 }}>
              <span className="badge" style={{ background: `${STATUS_COLOR[v.status] ?? '#64748b'}22`, color: STATUS_COLOR[v.status] ?? '#64748b' }}>
                v{v.versionNumber} · {v.status}
              </span>
            </span>
          ))}
        </div>
      )}

      <div className="grid">
        {steps.map(([title, desc, href]) => (
          <Link className="card" key={title} href={href} style={{ display: 'block' }}>
            <h3 style={{ margin: '0 0 4px' }}>{title}</h3>
            <p className="subtle" style={{ margin: 0, fontSize: 13 }}>{desc}</p>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
