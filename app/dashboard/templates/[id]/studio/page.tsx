'use client';

import { useParams } from 'next/navigation';
import { StudioEditorWorkspace } from '@/components/editor/StudioEditorWorkspace';

export default function StudioEditorPage() {
  const params = useParams();
  const analysisId = typeof params.id === 'string' ? params.id : '';

  return <StudioEditorWorkspace analysisId={analysisId} />;
}
