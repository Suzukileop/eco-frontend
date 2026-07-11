'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { formatLocationLabel, requestDetectedLocation } from '@/lib/geolocation';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CreatorStudioProfileTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { AvailabilityHoursInput } from '@/components/ui/AvailabilityHoursInput';
import { CreatorReputationPanel } from '@/components/creator/studio/CreatorReputationPanel';
import { ProfileReadOnlyField } from '@/components/creator/studio/ProfileReadOnlyField';
import { ContactVisibilitySelect } from '@/components/creator/studio/ContactVisibilitySelect';
import {
  DEFAULT_CONTACT_VISIBILITY,
  parseContactVisibility,
  type ContactVisibilitySettings,
} from '@/lib/contact-visibility';
import { CREATOR_GENDER_VALUES, normalizeCreatorGender } from '@/lib/creator-gender';
import { CreatorProfileDto } from '@/types/ecosystem';
import { updateCreatorProfile } from '@/lib/creator-profile-api';
import {
  defaultSchedule,
  formatAvailabilityHours,
  parseAvailabilityHours,
  type AvailabilitySchedule,
} from '@/lib/availabilityHours';
import { ProfileMediaBlocksField } from '@/components/creator/studio/ProfileMediaBlocksField';
import { ProfileStrengthsField } from '@/components/creator/studio/ProfileStrengthsField';
import { ProfileLanguagesField } from '@/components/creator/studio/ProfileLanguagesField';
import { ProfileServicesField } from '@/components/creator/studio/ProfileServicesField';
import { ProfileFaqField } from '@/components/creator/studio/ProfileFaqField';
import { ProfileLinksField } from '@/components/creator/studio/ProfileLinksField';
import { ProfilePortfolioPicker } from '@/components/creator/studio/ProfilePortfolioPicker';
import {
  buildProfileLinksFromLegacy,
  parseFaqItems,
  parseExperienceBlocks,
  parseProfileBlocks,
  parseProfileServices,
  parseSpokenLanguages,
  parseStrengthsTools,
  profileSchema,
  serializeFaqItems,
  serializeProfileBlocks,
  serializeProfileLinks,
  serializeProfileServices,
  hasProfileFormChanges,
  type ProfileFormValues,
} from '@/components/creator/studio/profile-form-schema';
import { formatPhoneDisplay } from '@/lib/phone';
import { updateUserProfile } from '@/lib/user-profile-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import {
  getProfileSection,
  PROFILE_SECTION_GROUPS,
  ProfileSectionNavIcon,
  type ProfileSectionId,
} from '@/components/creator/studio/profile-section-nav';
import {
  profileFormInputClass,
  profileFormLabelClass,
  profileNavButtonActiveClass,
  profileNavButtonBaseClass,
  profileNavButtonInactiveClass,
  profileSectionBodyTextClass,
  profileSectionHeaderDescClass,
  profileSectionHeaderTitleClass,
  profileSectionMutedTextClass,
} from '@/components/creator/studio/profile-section-ui';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { PortfolioShareBanner } from '@/components/portfolio/PortfolioShareButton';
import { CreatorAvailabilityControl, CreatorAvailabilityBadge } from '@/components/creator/studio/CreatorAvailabilityControl';

function formatMemberSince(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

type CreatorStudioProfileTabProps = {
  onProfileUpdated?: () => void;
};

export function CreatorStudioProfileTab({ onProfileUpdated }: CreatorStudioProfileTabProps) {
  const { user, updateUser } = useAuth();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [reputation, setReputation] = useState<CreatorProfileDto['reputation']>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [responseTimeLabel, setResponseTimeLabel] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ProfileSectionId>('about');
  const [isEditing, setIsEditing] = useState(false);
  const [availabilitySchedule, setAvailabilitySchedule] = useState<AvailabilitySchedule>(defaultSchedule());
  const savedSnapshot = useRef<ProfileFormValues | null>(null);
  const savedContactVisibility = useRef<ContactVisibilitySettings>(DEFAULT_CONTACT_VISIBILITY);
  const [contactVisibility, setContactVisibility] = useState<ContactVisibilitySettings>(
    DEFAULT_CONTACT_VISIBILITY
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      bio: '',
      specialite: '',
      gender: '',
      spokenLanguages: [],
      locationCity: '',
      locationCountry: '',
      locationLat: null,
      locationLng: null,
      timezoneId: '',
      contactAddress: '',
      contactPhone: '',
      contactEmail: '',
      availabilityHours: '',
      isAvailable: true,
      profileLinks: [],
      serviceOffers: [],
      faqItems: [],
      whyMeBlocks: [],
      experienceBlocks: [],
      yearsOfExperience: null,
      strengthsTools: [],
    },
  });

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
    move: moveLink,
  } = useFieldArray({ control: form.control, name: 'profileLinks' });
  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
    move: moveService,
  } = useFieldArray({ control: form.control, name: 'serviceOffers' });
  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
    move: moveFaq,
  } = useFieldArray({ control: form.control, name: 'faqItems' });
  const {
    fields: whyMeFields,
    append: appendWhyMe,
    remove: removeWhyMe,
    move: moveWhyMe,
  } = useFieldArray({ control: form.control, name: 'whyMeBlocks' });
  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
    move: moveExperience,
  } = useFieldArray({ control: form.control, name: 'experienceBlocks' });

  const loadProfile = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setLoadingProfile(true);
      }
      setLoadError(null);
      const res = await api.get<CreatorProfileDto>('/api/creator/profile');
      const p = res.data;
      setReputation(p.reputation ?? null);
      setMemberSince(p.memberSince ?? null);
      setResponseTimeLabel(p.responseTimeLabel ?? null);

      const resetValues: ProfileFormValues = {
        fullName: p.fullName?.trim() || user?.fullName?.trim() || '',
        bio: p.bio ?? '',
        specialite: p.specialite ?? '',
        gender: normalizeCreatorGender(p.gender) ?? '',
        spokenLanguages: parseSpokenLanguages(p.spokenLanguages, p.languages),
        locationCity: p.locationCity ?? '',
        locationCountry: p.locationCountry ?? '',
        locationLat: p.locationLat ?? null,
        locationLng: p.locationLng ?? null,
        timezoneId: p.timezoneId ?? '',
        contactAddress: p.contactAddress ?? '',
        contactPhone: p.contactPhone ?? '',
        contactEmail: p.contactEmail?.trim() || user?.email || '',
        availabilityHours: p.availabilityHours ?? '',
        isAvailable: p.isAvailable ?? true,
        profileLinks: buildProfileLinksFromLegacy(p),
        serviceOffers: parseProfileServices(p.profileServices),
        faqItems: parseFaqItems(p.faqItems),
        whyMeBlocks: parseProfileBlocks(p.whyMeBlocks),
        experienceBlocks: parseExperienceBlocks(p.experienceBlocks),
        yearsOfExperience: p.yearsOfExperience ?? null,
        strengthsTools: parseStrengthsTools(p.strengthsToolsMastered),
      };
      form.reset(resetValues);
      savedSnapshot.current = resetValues;
      const visibility = parseContactVisibility(p.contactVisibility);
      setContactVisibility(visibility);
      savedContactVisibility.current = visibility;
      setAvailabilitySchedule(parseAvailabilityHours(p.availabilityHours));
      setIsEditing(false);
    } catch (e) {
      setLoadError(getApiErrorMessage(e, 'Unable to load profile.'));
    } finally {
      if (!options?.silent) {
        setLoadingProfile(false);
      }
    }
  }, [form, user?.email, user?.fullName]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const enableLocation = async () => {
    setLocationError(null);
    setDetectingLocation(true);
    try {
      const detected = await requestDetectedLocation();
      form.setValue('locationLat', detected.lat, { shouldValidate: true });
      form.setValue('locationLng', detected.lng, { shouldValidate: true });
      form.setValue('timezoneId', detected.timezoneId, { shouldValidate: true });
      form.setValue('locationCity', detected.city, { shouldValidate: true });
      form.setValue('locationCountry', detected.country, { shouldValidate: true });
    } catch (e) {
      setLocationError(e instanceof Error ? e.message : 'Unable to detect location.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const onSubmit = async (raw: ProfileFormValues) => {
    setSubmitError(null);
    const availabilityHoursForSave = formatAvailabilityHours(availabilitySchedule, raw.timezoneId);
    const saved = savedSnapshot.current;

    if (
      saved &&
      !hasProfileFormChanges(
        raw,
        saved,
        availabilityHoursForSave,
        saved.availabilityHours ?? '',
        contactVisibility,
        savedContactVisibility.current
      )
    ) {
      setIsEditing(false);
      pushFlashFeedback({
        variant: 'info',
        title: 'No changes to save',
        description: 'Update a field before saving your information.',
      });
      return;
    }

    setSaving(true);
    try {
      const merged = {
        ...raw,
        availabilityHours: availabilityHoursForSave,
        whyMeBlocks: raw.whyMeBlocks.filter((block) => block.text.trim().length > 0),
        experienceBlocks: raw.experienceBlocks.filter((block) => block.text.trim().length > 0),
        strengthsTools: raw.strengthsTools.filter((item) => item.value.trim().length > 0),
      };
      const parsed = profileSchema.parse(merged);
      const trimmedName = parsed.fullName.trim();
      const savedName = saved?.fullName?.trim() ?? '';
      if (trimmedName !== savedName) {
        const updated = await updateUserProfile({ fullName: trimmedName });
        updateUser({ fullName: updated.fullName, avatarUrl: updated.avatarUrl });
      }

      await updateCreatorProfile({
        bio: parsed.bio?.trim() ? parsed.bio.trim() : undefined,
        specialite: parsed.specialite?.trim() ? parsed.specialite.trim() : undefined,
        gender: parsed.gender?.trim() ? parsed.gender.trim() : undefined,
        spokenLanguages: parsed.spokenLanguages.map((item) => item.value.trim()).filter(Boolean),
        locationCity: parsed.locationCity?.trim() ? parsed.locationCity.trim() : undefined,
        locationCountry: parsed.locationCountry?.trim() ? parsed.locationCountry.trim() : undefined,
        locationLat: parsed.locationLat ?? undefined,
        locationLng: parsed.locationLng ?? undefined,
        timezoneId: parsed.timezoneId?.trim() ? parsed.timezoneId.trim() : undefined,
        contactAddress: parsed.contactAddress?.trim() ? parsed.contactAddress.trim() : undefined,
        contactPhone: parsed.contactPhone?.trim() ? parsed.contactPhone.trim() : undefined,
        contactEmail: parsed.contactEmail?.trim() ? parsed.contactEmail.trim() : undefined,
        availabilityHours: parsed.availabilityHours?.trim() ? parsed.availabilityHours.trim() : undefined,
        isAvailable: parsed.isAvailable,
        contactVisibility: JSON.stringify(contactVisibility),
        profileLinks: serializeProfileLinks(parsed.profileLinks),
        profileServices: serializeProfileServices(parsed.serviceOffers),
        faqItems: serializeFaqItems(parsed.faqItems),
        whyMeBlocks: serializeProfileBlocks(parsed.whyMeBlocks),
        experienceBlocks: serializeProfileBlocks(parsed.experienceBlocks),
        yearsOfExperience: parsed.yearsOfExperience,
        strengthsToolsMastered: parsed.strengthsTools.map((item) => item.value.trim()),
      });

      await loadProfile({ silent: true });
      onProfileUpdated?.();
      setIsEditing(false);
      const sectionLabel = getProfileSection(activeSection).label ?? 'Information';
      pushFlashFeedback({
        variant: 'success',
        title: 'Information saved',
        description: `Your "${sectionLabel}" changes were saved successfully.`,
      });
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Save failed.'));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const values = form.watch();
  const locationCity = values.locationCity;
  const locationCountry = values.locationCountry;
  const timezoneId = values.timezoneId;
  const hasLocation = Boolean(values.locationLat != null && values.locationLng != null && timezoneId);
  const currentSection = getProfileSection(activeSection);
  const isFormSection = activeSection !== 'reputation' && activeSection !== 'portfolio';
  const availabilityHoursForCompare = formatAvailabilityHours(availabilitySchedule, timezoneId);
  const hasUnsavedChanges =
    savedSnapshot.current != null &&
    hasProfileFormChanges(
      values,
      savedSnapshot.current,
      availabilityHoursForCompare,
      savedSnapshot.current.availabilityHours ?? '',
      contactVisibility,
      savedContactVisibility.current
    );

  const handleSectionChange = (sectionId: ProfileSectionId) => {
    if (isEditing && savedSnapshot.current) {
      form.reset(savedSnapshot.current);
      setAvailabilitySchedule(parseAvailabilityHours(savedSnapshot.current.availabilityHours));
      setContactVisibility(savedContactVisibility.current);
      setSubmitError(null);
    }
    setIsEditing(false);
    setActiveSection(sectionId);
  };

  const cancelEdit = () => {
    if (savedSnapshot.current) {
      form.reset(savedSnapshot.current);
      setAvailabilitySchedule(parseAvailabilityHours(savedSnapshot.current.availabilityHours));
      setContactVisibility(savedContactVisibility.current);
    }
    setSubmitError(null);
    setIsEditing(false);
  };

  const renderSectionNav = (layout: 'mobile' | 'desktop') => (
    <nav
      className={
        layout === 'mobile'
          ? 'flex gap-1 overflow-x-auto p-2'
          : 'flex flex-col gap-1 overflow-visible p-2 pt-3'
      }
      aria-label="Information sections"
    >
      {PROFILE_SECTION_GROUPS.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className={`flex shrink-0 gap-1 ${
            layout === 'desktop' ? 'w-full flex-col' : ''
          } ${
            groupIndex > 0
              ? layout === 'desktop'
                ? 'border-t border-neutral-200 pt-2 dark:border-neutral-800'
                : ''
              : ''
          }`}
        >
          {groupIndex > 0 && layout === 'mobile' ? (
            <div
              className="mx-0.5 w-px shrink-0 self-stretch bg-neutral-200 dark:bg-neutral-700"
              aria-hidden
            />
          ) : null}
          <div className={`flex gap-1 ${layout === 'desktop' ? 'w-full flex-col' : ''}`}>
            {group.map((sectionId) => {
              const section = getProfileSection(sectionId);
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handleSectionChange(section.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`${profileNavButtonBaseClass} ${
                    layout === 'desktop' ? 'mx-2 w-[calc(100%-1rem)]' : ''
                  } ${
                    active ? profileNavButtonActiveClass : profileNavButtonInactiveClass
                  }`}
                >
                  <ProfileSectionNavIcon sectionId={section.id} />
                  <span className="min-w-0 truncate">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const handleAvailabilityChange = (schedule: AvailabilitySchedule) => {
    setAvailabilitySchedule(schedule);
    form.setValue('availabilityHours', formatAvailabilityHours(schedule, timezoneId), { shouldDirty: true });
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'reputation':
        return <CreatorReputationPanel reputation={reputation} showHeader={false} />;
      case 'portfolio':
        return <ProfilePortfolioPicker readOnly={false} />;
      case 'about':
        if (!isEditing) {
          return (
            <div className="space-y-3">
              <ProfileReadOnlyField label="Name" value={values.fullName} />
              <ProfileReadOnlyField label="Bio" value={values.bio} />
              <div className="grid gap-3 sm:grid-cols-2">
                <ProfileReadOnlyField label="Spécialité" value={values.specialite} />
                <ProfileReadOnlyField label="Genre" value={values.gender} emptyLabel="Non renseigné" />
              </div>
              <div>
                <p className={`mb-2 ${profileSectionMutedTextClass} font-semibold text-neutral-700 dark:text-neutral-300`}>
                  Langues de travail
                </p>
                <ProfileLanguagesField
                  control={form.control}
                  setValue={form.setValue}
                  readOnly
                  values={values.spokenLanguages.map((item) => item.value).filter(Boolean)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className={profileSectionMutedTextClass}>Status:</span>
                <CreatorAvailabilityBadge isAvailable={values.isAvailable} />
              </div>
              <ProfileReadOnlyField
                label="Availability hours"
                value={
                  values.availabilityHours
                    ? formatAvailabilityHours(parseAvailabilityHours(values.availabilityHours), timezoneId)
                    : null
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <ProfileReadOnlyField
                  label="Member since"
                  value={formatMemberSince(memberSince)}
                  emptyLabel="Not available yet"
                />
                <ProfileReadOnlyField
                  label="Typical response time"
                  value={responseTimeLabel}
                  emptyLabel="Not enough data yet"
                />
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className={profileFormLabelClass}>
                Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="e.g. Algorithmic Flow"
                className={profileFormInputClass}
                {...form.register('fullName')}
              />
              {form.formState.errors.fullName ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.fullName.message}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="bio" className={profileFormLabelClass}>
                Bio
              </label>
              <textarea
                id="bio"
                rows={5}
                placeholder="e.g. Data insights and algorithm explainers to simplify the web."
                className={profileFormInputClass}
                {...form.register('bio')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="specialite" className={profileFormLabelClass}>
                  Spécialité
                </label>
                <input
                  id="specialite"
                  type="text"
                  placeholder="e.g. Technology, Code, Data Science"
                  className={profileFormInputClass}
                  {...form.register('specialite')}
                />
              </div>
              <div>
                <label htmlFor="gender" className={profileFormLabelClass}>
                  Genre
                </label>
                <select id="gender" className={profileFormInputClass} {...form.register('gender')}>
                  <option value="">Non renseigné</option>
                  {CREATOR_GENDER_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ProfileLanguagesField control={form.control} setValue={form.setValue} />
            <ContactVisibilitySelect
              id="visibility-spoken-languages"
              label="Visibilité des langues de travail (profil public)"
              value={contactVisibility.spokenLanguages}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, spokenLanguages: value }))}
            />
            <ContactVisibilitySelect
              id="visibility-gender"
              label="Visibilité du genre (profil public)"
              value={contactVisibility.gender}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, gender: value }))}
            />
            <CreatorAvailabilityControl
              isAvailable={values.isAvailable}
              onChange={(next) => form.setValue('isAvailable', next, { shouldDirty: true })}
            />
            <div>
              <label className={profileFormLabelClass}>Availability hours</label>
              <div className="mt-1">
                <AvailabilityHoursInput
                  value={availabilitySchedule}
                  onChange={handleAvailabilityChange}
                  timezoneId={timezoneId}
                />
              </div>
            </div>
            <ContactVisibilitySelect
              id="visibility-availability-about"
              label="Visibilité de la disponibilité (profil public)"
              value={contactVisibility.availability}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, availability: value }))}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileReadOnlyField
                label="Member since"
                value={formatMemberSince(memberSince)}
                emptyLabel="Calculated automatically"
              />
              <ProfileReadOnlyField
                label="Typical response time"
                value={responseTimeLabel}
                emptyLabel="Calculated from your activity"
              />
            </div>
            <ContactVisibilitySelect
              id="visibility-response-time"
              label="Visibilité du délai de réponse (profil public)"
              value={contactVisibility.responseTime}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, responseTime: value }))}
            />
          </div>
        );
      case 'whyMe':
        if (!isEditing) {
          return (
            <ProfileMediaBlocksField
              control={form.control}
              name="whyMeBlocks"
              fields={whyMeFields}
              append={appendWhyMe}
              remove={removeWhyMe}
              move={moveWhyMe}
              register={form.register}
              watch={form.watch}
              setValue={form.setValue}
              readOnly
            />
          );
        }
        return (
          <div className="space-y-4">
            <ProfileMediaBlocksField
              control={form.control}
              name="whyMeBlocks"
              fields={whyMeFields}
              append={appendWhyMe}
              remove={removeWhyMe}
              move={moveWhyMe}
              register={form.register}
              watch={form.watch}
              setValue={form.setValue}
            />
            <ContactVisibilitySelect
              id="visibility-why-me-edit"
              label="Public visibility (Why choose me)"
              value={contactVisibility.whyMe}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, whyMe: value }))}
            />
          </div>
        );
      case 'experience':
        if (!isEditing) {
          return (
            <div className="space-y-4">
              <ProfileReadOnlyField
                label="Years of experience"
                value={values.yearsOfExperience != null ? String(values.yearsOfExperience) : null}
                emptyLabel="Not specified"
              />
              <ProfileMediaBlocksField
                control={form.control}
                name="experienceBlocks"
                fields={experienceFields}
                append={appendExperience}
                remove={removeExperience}
                move={moveExperience}
                register={form.register}
                watch={form.watch}
                setValue={form.setValue}
                readOnly
              />
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="yearsOfExperience" className={profileFormLabelClass}>
                Years of experience
              </label>
              <input
                id="yearsOfExperience"
                type="number"
                min={0}
                max={80}
                placeholder="e.g. 8"
                className={`${profileFormInputClass} max-w-xs`}
                {...form.register('yearsOfExperience', {
                  setValueAs: (value) => {
                    if (value === '' || value == null) return null;
                    const parsed = Number(value);
                    return Number.isNaN(parsed) ? null : parsed;
                  },
                })}
              />
            </div>
            <ProfileMediaBlocksField
              control={form.control}
              name="experienceBlocks"
              fields={experienceFields}
              append={appendExperience}
              remove={removeExperience}
              move={moveExperience}
              register={form.register}
              watch={form.watch}
              setValue={form.setValue}
            />
            <ContactVisibilitySelect
              id="visibility-experience-edit"
              label="Public visibility (Experience)"
              value={contactVisibility.experience}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, experience: value }))}
            />
            <ContactVisibilitySelect
              id="visibility-years-edit"
              label="Public visibility (Years of experience)"
              value={contactVisibility.yearsOfExperience}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, yearsOfExperience: value }))}
            />
          </div>
        );
      case 'strengths':
        if (!isEditing) {
          return (
            <ProfileStrengthsField
              control={form.control}
              setValue={form.setValue}
              readOnly
              values={values.strengthsTools.map((item) => item.value).filter(Boolean)}
            />
          );
        }
        return (
          <div className="space-y-4">
            <ProfileStrengthsField control={form.control} setValue={form.setValue} />
            <ContactVisibilitySelect
              id="visibility-strengths-edit"
              label="Public visibility (Skills & tools)"
              value={contactVisibility.strengthsTools}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, strengthsTools: value }))}
            />
          </div>
        );
      case 'services':
        if (!isEditing) {
          return (
            <ProfileServicesField
              control={form.control}
              fields={serviceFields}
              append={appendService}
              remove={removeService}
              move={moveService}
              register={form.register}
              setValue={form.setValue}
              readOnly
              values={values.serviceOffers}
            />
          );
        }
        return (
          <div className="space-y-4">
            <ProfileServicesField
              control={form.control}
              fields={serviceFields}
              append={appendService}
              remove={removeService}
              move={moveService}
              register={form.register}
              setValue={form.setValue}
            />
            <ContactVisibilitySelect
              id="visibility-services"
              label="Visibilité des services (profil public)"
              value={contactVisibility.services}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, services: value }))}
            />
          </div>
        );
      case 'faq':
        if (!isEditing) {
          return (
            <ProfileFaqField
              control={form.control}
              fields={faqFields}
              append={appendFaq}
              remove={removeFaq}
              move={moveFaq}
              register={form.register}
              readOnly
              values={values.faqItems}
            />
          );
        }
        return (
          <div className="space-y-4">
            <ProfileFaqField
              control={form.control}
              fields={faqFields}
              append={appendFaq}
              remove={removeFaq}
              move={moveFaq}
              register={form.register}
            />
            <ContactVisibilitySelect
              id="visibility-faq"
              label="Visibilité de la FAQ (profil public)"
              value={contactVisibility.faq}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, faq: value }))}
            />
          </div>
        );
      case 'links':
        if (!isEditing) {
          return (
            <ProfileLinksField
              control={form.control}
              fields={linkFields}
              append={appendLink}
              remove={removeLink}
              move={moveLink}
              register={form.register}
              readOnly
              values={values.profileLinks}
            />
          );
        }
        return (
          <div className="space-y-4">
            <ProfileLinksField
              control={form.control}
              fields={linkFields}
              append={appendLink}
              remove={removeLink}
              move={moveLink}
              register={form.register}
            />
            <ContactVisibilitySelect
              id="visibility-links"
              label="Visibilité des liens (profil public)"
              value={contactVisibility.links}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, links: value }))}
            />
          </div>
        );
      case 'location':
        if (!isEditing) {
          return hasLocation ? (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950/50">
              <p className={`${profileSectionBodyTextClass} font-semibold text-neutral-900 dark:text-white`}>
                {formatLocationLabel(locationCity, locationCountry)}
              </p>
              <p className={`mt-1 ${profileSectionMutedTextClass}`}>Timezone: {timezoneId}</p>
            </div>
          ) : (
            <ProfileReadOnlyField label="Location" value={null} emptyLabel="Location not configured" />
          );
        }
        return (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => void enableLocation()}
              disabled={detectingLocation}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {detectingLocation && <LoadingSpinner size="sm" />}
              {hasLocation ? 'Refresh location' : 'Enable location (required)'}
            </button>
            {hasLocation ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                <p className="font-medium">{formatLocationLabel(locationCity, locationCountry)}</p>
                <p className="mt-1 text-emerald-800/80 dark:text-emerald-300/80">Timezone: {timezoneId}</p>
              </div>
            ) : (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                You must enable location before saving your information.
              </p>
            )}
            {form.formState.errors.timezoneId ? (
              <p className="text-sm text-red-600">{form.formState.errors.timezoneId.message}</p>
            ) : null}
          </div>
        );
      case 'contact':
        if (!isEditing) {
          return (
            <div className="space-y-3">
              <ProfileReadOnlyField label="Professional address" value={values.contactAddress} />
              <div className="grid gap-3 sm:grid-cols-2">
                <ProfileReadOnlyField label="Phone" value={formatPhoneDisplay(values.contactPhone)} />
                <ProfileReadOnlyField label="Contact email" value={values.contactEmail || user.email} />
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="contactAddress" className={profileFormLabelClass}>
                Professional address
              </label>
              <input
                id="contactAddress"
                type="text"
                placeholder="e.g. Paris, France or 12 Rue de l'Innovation, 75001 Paris"
                className={profileFormInputClass}
                {...form.register('contactAddress')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contactPhone" className={profileFormLabelClass}>
                  Phone
                </label>
                <div className="mt-1">
                  <PhoneInput
                    id="contactPhone"
                    value={values.contactPhone ?? ''}
                    onChange={(v) => form.setValue('contactPhone', v, { shouldDirty: true })}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contactEmail" className={profileFormLabelClass}>
                  Contact email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  placeholder={user?.email ?? 'contact@yourbrand.com'}
                  className={profileFormInputClass}
                  {...form.register('contactEmail')}
                />
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
              <p className={`${profileSectionBodyTextClass} font-semibold text-neutral-900 dark:text-white`}>
                Visibilité publique
              </p>
              <p className={`mt-1 ${profileSectionMutedTextClass}`}>
                Public = tout le monde · Membres connectés = utilisateurs connectés · Masqué = jamais affiché
              </p>
              <div className="mt-4 space-y-3">
                <ContactVisibilitySelect
                  id="visibility-address"
                  label="Adresse"
                  value={contactVisibility.address}
                  onChange={(value) => setContactVisibility((prev) => ({ ...prev, address: value }))}
                />
                <ContactVisibilitySelect
                  id="visibility-phone"
                  label="Téléphone"
                  value={contactVisibility.phone}
                  onChange={(value) => setContactVisibility((prev) => ({ ...prev, phone: value }))}
                />
                <ContactVisibilitySelect
                  id="visibility-email"
                  label="Email"
                  value={contactVisibility.email}
                  onChange={(value) => setContactVisibility((prev) => ({ ...prev, email: value }))}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      <PortfolioShareBanner creatorId={user.id} />
      {loadError ? <ErrorAlert message={loadError} /> : null}
      {locationError ? (
        <ErrorAlert message={locationError} onDismiss={() => setLocationError(null)} />
      ) : null}

      {loadingProfile ? (
        <CreatorStudioProfileTabSkeleton />
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="order-2 min-h-[480px] min-w-0 md:order-none md:col-start-1 md:row-start-1">
              <div className="flex min-h-[480px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex-1 p-5 sm:p-6">
                  <header className="mb-5 border-b border-neutral-100 pb-4 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                      <ProfileSectionNavIcon sectionId={activeSection} variant="header" />
                      <div className="min-w-0 flex-1">
                        <h2 className={profileSectionHeaderTitleClass}>{currentSection.label}</h2>
                        <p className={profileSectionHeaderDescClass}>{currentSection.description}</p>
                      </div>
                    </div>
                  </header>

                  {submitError && isFormSection ? (
                    <div className="mb-4">
                      <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />
                    </div>
                  ) : null}

                  {renderSectionContent()}
                </div>

                {isFormSection ? (
                  <div className="flex justify-end gap-3 border-t border-neutral-200 bg-neutral-50/50 px-5 py-4 dark:border-neutral-800 dark:bg-neutral-950/30 sm:px-6">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={saving}
                          className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving || !hasUnsavedChanges}
                          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                        >
                          {saving ? <LoadingSpinner size="sm" /> : null}
                          Save information
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAvailabilitySchedule(parseAvailabilityHours(values.availabilityHours));
                          setIsEditing(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            <aside className="order-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:hidden">
              {renderSectionNav('mobile')}
            </aside>

            <ProfileSectionStickyAside>{renderSectionNav('desktop')}</ProfileSectionStickyAside>
          </div>
        </form>
      )}
    </div>
  );
}
