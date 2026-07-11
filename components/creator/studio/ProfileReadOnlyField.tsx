import {
  profileSectionEmptyClass,
  profileSectionFieldClass,
  profileSectionLabelClass,
  profileSectionValueClass,
} from '@/components/creator/studio/profile-section-ui';

type ProfileReadOnlyFieldProps = {
  label: string;
  value?: string | null;
  emptyLabel?: string;
  href?: string;
};

export function ProfileReadOnlyField({
  label,
  value,
  emptyLabel = 'Not set',
  href,
}: ProfileReadOnlyFieldProps) {
  const display = value?.trim();

  return (
    <div className={profileSectionFieldClass}>
      <p className={profileSectionLabelClass}>{label}</p>
      {display ? (
        href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${profileSectionValueClass} block text-orange-600 hover:underline dark:text-orange-400`}
          >
            {display}
          </a>
        ) : (
          <p className={`${profileSectionValueClass} whitespace-pre-wrap`}>{display}</p>
        )
      ) : (
        <p className={profileSectionEmptyClass}>{emptyLabel}</p>
      )}
    </div>
  );
}
