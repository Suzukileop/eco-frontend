'use client';

import { useRef } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  HeroPortrait,
  HeroProfileMeta,
} from '@/components/portfolio/portfolio-hero-shared';
import {
  HeroEditorialCopyBlock,
  heroCopyBandHasContent,
  isHeroCopyFreeMode,
} from '@/components/portfolio/portfolio-hero-editorial-copy';
import { resolveHeroVisualFreeCell } from '@/components/portfolio/portfolio-hero-settings';
import {
  motionProfileHeroEnterClass,
  motionProfileHeroImageEnterClass,
} from '@/components/portfolio/portfolio-motion-settings';
import {
  heroCopyPortraitSafeClass,
  resolvePortraitVerticalCell,
} from '@/components/portfolio/portfolio-hero-profile-settings';
import { resolveMetaVerticalCell } from '@/components/portfolio/portfolio-hero-meta-settings';
import { useHeroCopyPortraitSafeMaxWidth } from '@/components/portfolio/use-hero-copy-portrait-safe-max-width';
import {
  isHeroCopyOnEnd,
  isVerticalHeroDivision,
  resolveHeroLayoutDivision,
  resolveHeroVerticalFrameGapPx,
} from '@/components/portfolio/portfolio-hero-layout-division';
import {
  heroUltraWideColClass,
  heroUltraWideGridClass,
  resolveHeroUltraWideColumnLayout,
} from '@/components/portfolio/portfolio-hero-ultrawide-columns';
import {
  heroVerticalCellAlignClass,
  heroVerticalCellColumn,
  heroVerticalCellGridIndices,
  heroVerticalCellHalf,
} from '@/components/portfolio/portfolio-hero-vertical-cell-placement';
import { heroCopyPositionStyle } from '@/components/portfolio/portfolio-hero-copy-settings';

/**
 * Below xl: stacked flow — the desktop LEFT group stacks on top (copy first in
 * Copy | Visual, portrait & stats first in Visual | Copy).
 * Element alignment follows the mobile align settings (centered by default).
 * xl+ vertical: copy shrink-wraps to content, tunable px gap, then visual starts.
 * xl+ horizontal: copy in-flow; portrait/stats use section absolute layers.
 */
export function PortfolioHeroEditorial({ data }: { data: PortfolioHeroData }) {
  const { presentation } = data;
  const division = resolveHeroLayoutDivision(presentation);
  const vertical = isVerticalHeroDivision(division);
  const flipped = isHeroCopyOnEnd(division) && !vertical;
  const copyOnBottom = division === 'vertical-copy-bottom';
  const frameGapPx = resolveHeroVerticalFrameGapPx(presentation);
  const frameGapStyle = { gap: `${frameGapPx}px` } as const;
  const copyFree = isHeroCopyFreeMode(presentation.heroCopyPlacementMode);
  const profile = data.motionProfile ?? 'none';
  const enterClass = motionProfileHeroEnterClass(profile);
  const imageEnterClass = motionProfileHeroImageEnterClass(profile);
  const showPortrait = presentation.showPortrait;
  const ultraWide = resolveHeroUltraWideColumnLayout(presentation);
  const ultraWideActive = vertical && ultraWide.columns > 1;
  const copySafeClass = vertical
    ? 'w-full'
    : heroCopyPortraitSafeClass(presentation.portraitSize, {
        showPortrait,
        flipped,
      });
  const copyRef = useRef<HTMLDivElement>(null);
  const safeMaxWidth = useHeroCopyPortraitSafeMaxWidth(
    copyRef,
    showPortrait && !copyFree && !vertical,
    flipped
  );

  const metaCell = resolveMetaVerticalCell(presentation);
  const portraitCell = resolvePortraitVerticalCell(presentation);
  /** Free zone: copy elements moved into the visual frame, anchored by a 3×3 cell. */
  const freeCell = resolveHeroVisualFreeCell(presentation);
  const freeGrid = heroVerticalCellGridIndices(freeCell);
  const freeAlignClass = heroVerticalCellAlignClass(freeCell);
  const freeZoneHasContent = vertical && heroCopyBandHasContent(presentation, 'free-zone');
  const metaGrid = heroVerticalCellGridIndices(metaCell);
  const portraitGrid = heroVerticalCellGridIndices(portraitCell);
  const metaAlignClass = heroVerticalCellAlignClass(metaCell);
  const portraitAlignClass = heroVerticalCellAlignClass(portraitCell);
  const portraitHalf = heroVerticalCellHalf(portraitCell, metaCell);
  const statsHalf = heroVerticalCellHalf(metaCell, portraitCell);

  const visualCol = (slot: 'portrait' | 'stats') =>
    ultraWideActive
      ? heroUltraWideColClass(ultraWide.visualSlots[slot], ultraWide.columns)
      : '';

  /**
   * Copy units glued above/below stats — full width of the stats cell so each
   * element's own left/center/right alignment works. The stats chips row keeps
   * following the 3×3 cell column.
   */
  const statsColumn = heroVerticalCellColumn(metaCell);
  /** Tablet/mobile auto-centers the chips row; the cell column applies from xl. */
  const statsRowJustifyClass =
    statsColumn === 'left'
      ? 'justify-center xl:justify-start'
      : statsColumn === 'right'
        ? 'justify-center xl:justify-end'
        : 'justify-center';
  const statsWithOptionalCta = (
    <div className="flex w-full max-w-full flex-col gap-3" data-hero-stats-stack>
      {vertical ? (
        <HeroEditorialCopyBlock data={data} band="above-stats" tightStack className="!px-0" />
      ) : null}
      <div className={`flex w-full max-w-full ${statsRowJustifyClass}`}>
        <HeroProfileMeta
          editorial
          meta={presentation}
          yearsOfExperience={data.yearsOfExperience}
          workCount={data.workCount}
          locationLabel={data.locationLabel}
        />
      </div>
      {vertical ? (
        <HeroEditorialCopyBlock data={data} band="below-stats" tightStack className="!px-0" />
      ) : null}
    </div>
  );

  const copyInner = (
    <div
      className={`flex w-full min-w-0 flex-col justify-start gap-3 px-4 pb-1 pt-4 sm:gap-4 sm:px-6 sm:pt-5 ${
        flipped
          ? 'items-stretch xl:items-end xl:text-right'
          : vertical
            ? 'items-stretch'
            : 'items-stretch xl:items-start xl:text-left'
      }`}
      data-hero-copy-frame-inner
    >
      {copyFree && vertical ? (
        <div className="relative min-h-[12rem] w-full">
          <div
            className="pointer-events-auto absolute"
            style={heroCopyPositionStyle(presentation.heroCopyPosition)}
            data-hero-copy-in-frame
          >
            <HeroEditorialCopyBlock data={data} tightStack band="in-copy" />
          </div>
        </div>
      ) : (
        <HeroEditorialCopyBlock data={data} tightStack={vertical} band="in-copy" />
      )}
    </div>
  );

  /** Mobile / horizontal stacked copy (non-grid). */
  const copyBlockFlow = (
    <div
      ref={copyRef}
      className={`relative z-10 w-full min-w-0 ${copySafeClass} ${
        copyFree && !vertical ? 'xl:hidden' : ''
      } ${flipped ? 'xl:ml-auto' : ''} ${
        vertical ? 'xl:hidden' : flipped ? 'order-2 xl:order-none' : 'order-1 xl:order-none'
      }`.trim()}
      style={
        safeMaxWidth != null
          ? { maxWidth: safeMaxWidth, width: '100%' }
          : undefined
      }
    >
      <div
        className={`flex w-full min-w-0 flex-col justify-center gap-10 py-10 sm:gap-12 xl:gap-14 ${
          vertical ? 'min-h-0' : 'min-h-[400px]'
        } ${
          flipped
            ? 'items-stretch xl:items-end xl:text-right'
            : 'items-stretch xl:items-start xl:text-left'
        }`}
      >
        <HeroEditorialCopyBlock data={data} />
      </div>
    </div>
  );

  /**
   * Visual frame — vertical: equitable 50/50 left|right halves (portrait | stats).
   * Ultra-wide keeps its column slots; non-vertical keeps the 3×3 cell grid.
   */
  const portraitNode = showPortrait ? (
    <HeroPortrait
      fullName={data.fullName}
      avatarUrl={data.avatarUrl}
      specialite={data.specialite}
      className="aspect-[4/5] w-full max-w-md object-cover sm:max-w-lg"
      profile={presentation}
    />
  ) : null;

  /**
   * Free-zone layers:
   * - below xl the moved elements flow after the visual content (centered);
   * - from xl they sit in a 3×3 overlay spanning the whole visual frame, so
   *   they can occupy any empty cell (e.g. top-right next to the stats).
   */
  const freeZoneLayers = freeZoneHasContent ? (
    <>
      <div className="flex w-full justify-center xl:hidden" data-hero-free-zone="mobile">
        <div className="w-full max-w-md">
          <HeroEditorialCopyBlock data={data} band="free-zone" tightStack className="!px-0" />
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-40 hidden p-2 sm:p-3 xl:grid"
        style={{
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr',
        }}
        data-hero-free-zone-grid
      >
        <div
          className={`pointer-events-auto flex min-w-0 p-2 ${freeAlignClass}`.trim()}
          style={{ gridColumn: freeGrid.column, gridRow: freeGrid.row }}
          data-hero-free-zone-cell={freeCell}
        >
          <div className="w-full">
            <HeroEditorialCopyBlock data={data} band="free-zone" tightStack className="!px-0" />
          </div>
        </div>
      </div>
    </>
  ) : null;

  const visualContents = (
    <div
      className={`relative w-full p-2 sm:p-3 ${
        ultraWideActive
          ? `grid grid-cols-1 items-stretch gap-3 ${heroUltraWideGridClass(ultraWide.columns)}`
          : ''
      }`.trim()}
      data-hero-visual-frame-inner
    >
      {ultraWideActive ? (
        <>
          {showPortrait ? (
            <div
              className={`relative flex min-h-[min(40vh,24rem)] w-full min-w-0 ${visualCol('portrait')}`.trim()}
              data-hero-portrait-cell={portraitCell}
            >
              <div
                className={`pointer-events-auto flex min-h-[min(40vh,24rem)] w-full flex-1 p-2 ${portraitAlignClass}`.trim()}
              >
                <div className="max-w-md">{portraitNode}</div>
              </div>
            </div>
          ) : null}
          <div
            className={`relative flex min-h-[min(40vh,24rem)] w-full min-w-0 ${visualCol('stats')}`.trim()}
            data-hero-stats-cell={metaCell}
          >
            <div
              className={`pointer-events-auto flex min-h-[min(40vh,24rem)] w-full flex-1 p-2 ${metaAlignClass}`.trim()}
            >
              {statsWithOptionalCta}
            </div>
          </div>
        </>
      ) : vertical ? (
        showPortrait ? (
          <div
            className="grid h-full min-h-[min(48vh,28rem)] w-full grid-cols-1 items-stretch gap-3 sm:gap-4 xl:grid-cols-2"
            data-hero-visual-half-grid
          >
            <div
              className="pointer-events-auto z-20 flex min-h-0 min-w-0 flex-col p-2"
              data-hero-visual-half="left"
            >
              {portraitHalf === 1 ? (
                <div
                  className={`flex min-h-[min(48vh,28rem)] w-full flex-1 ${portraitAlignClass}`.trim()}
                  data-hero-portrait-cell={portraitCell}
                >
                  {portraitNode}
                </div>
              ) : null}
              {statsHalf === 1 ? (
                <div
                  className={`flex min-h-[min(48vh,28rem)] w-full flex-1 ${metaAlignClass}`.trim()}
                  data-hero-stats-cell={metaCell}
                >
                  {statsWithOptionalCta}
                </div>
              ) : null}
            </div>
            <div
              className="pointer-events-auto z-30 flex min-h-0 min-w-0 flex-col p-2"
              data-hero-visual-half="right"
            >
              {portraitHalf === 2 ? (
                <div
                  className={`flex min-h-[min(48vh,28rem)] w-full flex-1 ${portraitAlignClass}`.trim()}
                  data-hero-portrait-cell={portraitCell}
                >
                  {portraitNode}
                </div>
              ) : null}
              {statsHalf === 2 ? (
                <div
                  className={`flex min-h-[min(48vh,28rem)] w-full flex-1 ${metaAlignClass}`.trim()}
                  data-hero-stats-cell={metaCell}
                >
                  {statsWithOptionalCta}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div
            className={`pointer-events-auto flex min-h-[min(48vh,28rem)] w-full p-2 ${metaAlignClass}`.trim()}
            data-hero-stats-cell={metaCell}
          >
            {statsWithOptionalCta}
          </div>
        )
      ) : (
        <div
          className="grid h-full min-h-[min(48vh,28rem)] w-full"
          style={{
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateRows: '1fr 1fr 1fr',
          }}
          data-hero-visual-cell-grid
        >
          {showPortrait ? (
            <div
              className={`pointer-events-auto z-20 flex p-2 ${portraitAlignClass}`.trim()}
              style={{ gridColumn: portraitGrid.column, gridRow: portraitGrid.row }}
              data-hero-portrait-cell={portraitCell}
            >
              {portraitNode}
            </div>
          ) : null}
          <div
            className={`pointer-events-auto z-30 flex p-2 ${metaAlignClass}`.trim()}
            style={{ gridColumn: metaGrid.column, gridRow: metaGrid.row }}
            data-hero-stats-cell={metaCell}
          >
            {statsWithOptionalCta}
          </div>
        </div>
      )}
      {freeZoneLayers}
    </div>
  );

  /** Mobile visual stack (below xl) — content-sized. */
  const visualBlockMobile = (
    <div
      className={`${imageEnterClass} relative w-full xl:hidden ${
        copyOnBottom ? 'order-1' : 'order-2'
      }`.trim()}
      data-hero-visual-frame="mobile"
    >
      {visualContents}
    </div>
  );

  /** Horizontal-only mobile visual — the desktop LEFT side stacks first (visual first when flipped). */
  const visualBlockHorizontalMobile = !vertical ? (
    <div
      className={`${imageEnterClass} ${flipped ? 'order-1' : 'order-2'} flex w-full flex-col xl:hidden`.trim()}
    >
      {showPortrait ? (
        <div className="flex w-full justify-center pt-0">
          <HeroPortrait
            fullName={data.fullName}
            avatarUrl={data.avatarUrl}
            specialite={data.specialite}
            className="aspect-[4/5] w-full max-w-md object-cover sm:max-w-lg"
            profile={presentation}
          />
        </div>
      ) : null}
      <div
        className={`relative z-30 mt-auto flex w-full justify-center ${
          showPortrait ? 'pt-10' : 'pt-0'
        } pb-2`}
      >
        <HeroProfileMeta
          editorial
          meta={presentation}
          yearsOfExperience={data.yearsOfExperience}
          workCount={data.workCount}
          locationLabel={data.locationLabel}
        />
      </div>
    </div>
  ) : null;

  if (vertical) {
    return (
      <div className={`${enterClass} relative w-full`.trim()}>
        <div className="flex flex-col xl:hidden" style={frameGapStyle}>
          {copyOnBottom ? (
            <>
              {visualBlockMobile}
              <div
                className={`relative z-10 ${copySafeClass} order-2`.trim()}
                data-hero-copy-frame="mobile"
              >
                {copyInner}
              </div>
            </>
          ) : (
            <>
              <div
                className={`relative z-10 order-1 ${copySafeClass}`.trim()}
                data-hero-copy-frame="mobile"
              >
                {copyInner}
              </div>
              {visualBlockMobile}
            </>
          )}
        </div>
        <div
          className="hidden w-full xl:flex xl:flex-col"
          style={frameGapStyle}
          data-hero-division-grid="vertical"
        >
          <div
            className={`relative w-full ${copySafeClass}`.trim()}
            style={{ order: copyOnBottom ? 2 : 1 }}
            data-hero-copy-frame
          >
            {copyInner}
          </div>
          <div
            className={`relative w-full ${imageEnterClass}`.trim()}
            style={{ order: copyOnBottom ? 1 : 2 }}
            data-hero-visual-frame
          >
            {visualContents}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${enterClass} relative flex flex-col`.trim()}>
      <div className="flex flex-col gap-12 xl:block xl:gap-0">
        {copyBlockFlow}
        {visualBlockHorizontalMobile}
      </div>
    </div>
  );
}
