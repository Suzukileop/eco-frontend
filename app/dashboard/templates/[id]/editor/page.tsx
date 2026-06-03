import { redirect } from 'next/navigation';

type EditorRedirectPageProps = {
  params: { id: string };
};

/** Ancienne route éditeur classique → éditeur Pro (studio). */
export default function EditorRedirectPage({ params }: EditorRedirectPageProps) {
  redirect(`/dashboard/templates/${params.id}/studio`);
}
