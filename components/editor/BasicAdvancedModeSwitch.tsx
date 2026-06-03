'use client';

export type PanelBasicAdvancedMode = 'basic' | 'advanced';

interface BasicAdvancedModeSwitchProps {
  mode: PanelBasicAdvancedMode;
  onChange: (mode: PanelBasicAdvancedMode) => void;
  disabled?: boolean;
  ariaLabel: string;
}

/** Onglets Basic / Avancée — même espacement que le panneau texte (sans barre de fond). */
export function BasicAdvancedModeSwitch({
  mode,
  onChange,
  disabled = false,
  ariaLabel,
}: BasicAdvancedModeSwitchProps) {
  const btn = (id: PanelBasicAdvancedMode, label: string) => (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={mode === id}
      onClick={() => onChange(id)}
      className={`flex-1 rounded-xl py-2.5 text-[14px] font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        mode === id
          ? 'bg-[#252525] text-neutral-100 shadow-sm ring-1 ring-cyan-500/35'
          : 'bg-[#141414] text-neutral-500 hover:bg-[#1c1c1c] hover:text-neutral-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="mx-3 mb-1 mt-3 flex shrink-0 gap-2"
      role="tablist"
      aria-label={ariaLabel}
    >
      {btn('basic', 'Basic')}
      {btn('advanced', 'Avancée')}
    </div>
  );
}
