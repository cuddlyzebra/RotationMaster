import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, TrackByFunction } from '@angular/core';
import { Ability, AbilitySelection } from '../../models';
import { isBlankSpacer } from '../../abilitiesLookup';

interface IndexedSelection {
  selection: AbilitySelection;
  abilityIndex: number; // -1 for blank spacers / non-real entries, otherwise position among real abilities
  originalIndex: number; // index into the source AbilitySelections array — stable even when the selection object is copied for display (e.g. line-break entries)
}

interface PreviewRow {
  selections: IndexedSelection[];
  fromLineBreak: boolean;
}

const DUPLICATE_COLOR_PALETTE: string[] = [
  '#ff5555', '#55ff99', '#55aaff', '#ffcc33',
  '#ff66cc', '#66ffff', '#ff9933', '#cc99ff'
];

@Component({
    selector: 'rm-rotation-preview',
    templateUrl: './rotation-preview.html',
    styleUrls: ['./rotation-preview.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RotationPreview implements OnChanges {
  @Input() AbilitySelections: AbilitySelection[] = [];
  @Input() abilitiesPerRow: number = 10;
  @Input() lineBreakSpacing: number = 0;
  @Input() index: number = 0;
  @Input() revision: number = 0;
  /** How many real abilities have been "used" so far in this rotation. -1 = none used yet. */
  @Input() currentAbilityIndex: number = -1;

  abilityRows: PreviewRow[] = [];
  hasPreview = false;
  private duplicateColors = new Map<number, string>();

  get lineBreakExtraGap(): string {
    const t = Math.min(100, Math.max(0, Number(this.lineBreakSpacing) || 0)) / 100;
    return `calc((2rem - 8px) * ${t})`;
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.computeDuplicateColors();
    this.abilityRows = this.calculateAbilityRows();
    this.hasPreview = this.abilityRows.some(row => row.selections.some(item => !!item.selection.SelectedAbility));
  }

  private abilityKey(selection: AbilitySelection): string | null {
    const ability = selection.SelectedAbility;
    if (!ability || this.isBlankSpacer(ability)) {
      return null;
    }
    return ability.Emoji || ability.Src || ability.Title;
  }

  private computeDuplicateColors(): void {
    // First pass: count occurrences per ability key
    const counts = new Map<string, number>();
    for (const sel of this.AbilitySelections) {
      const key = this.abilityKey(sel);
      if (!key) { continue; }
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    // Second pass: assign each individual occurrence of a duplicated
    // ability its own colour from the palette, cycling per-key.
    // Keyed by original array index (not the selection object itself) —
    // line-break entries get shallow-copied for display in
    // calculateAbilityRows, which would break an object-identity lookup.
    const occurrenceIndex = new Map<string, number>();
    const newMap = new Map<number, string>();

    this.AbilitySelections.forEach((sel, originalIndex) => {
      const key = this.abilityKey(sel);
      if (!key) { return; }

      const total = counts.get(key) || 0;
      if (total > 1) {
        const idx = occurrenceIndex.get(key) || 0;
        newMap.set(originalIndex, DUPLICATE_COLOR_PALETTE[idx % DUPLICATE_COLOR_PALETTE.length]);
        occurrenceIndex.set(key, idx + 1);
      }
    });

    this.duplicateColors = newMap;
  }

  getDuplicateColor(item: IndexedSelection): string | null {
    return this.duplicateColors.get(item.originalIndex) ?? null;
  }

  private calculateAbilityRows(): PreviewRow[] {
    const abilityRows: PreviewRow[] = [{ selections: [], fromLineBreak: false }];
    let currentRow = 0;
    let itemsInCurrentRow = 0;
    let abilityIndex = 0;

    const pushSelection = (selection: AbilitySelection, originalIndex: number) => {
      const isReal = !!selection.SelectedAbility && !this.isBlankSpacer(selection.SelectedAbility);
      const indexed: IndexedSelection = {
        selection,
        abilityIndex: isReal ? abilityIndex : -1,
        originalIndex
      };
      if (isReal) { abilityIndex++; }
      abilityRows[currentRow].selections.push(indexed);
    };

    for (let i = 0; i < this.AbilitySelections.length; i++) {
      const selection = this.AbilitySelections[i];

      if (selection.Separator?.includes('↵')) {
        if (itemsInCurrentRow > 0) {
          abilityRows.push({ selections: [], fromLineBreak: true });
          currentRow++;
          itemsInCurrentRow = 0;
        } else {
          abilityRows[currentRow].fromLineBreak = currentRow > 0;
        }
        const displaySelection = { ...selection };
        displaySelection.Separator = '';
        pushSelection(displaySelection, i);
        itemsInCurrentRow++;
      }
      else if (itemsInCurrentRow >= this.abilitiesPerRow && itemsInCurrentRow > 0) {
        abilityRows.push({ selections: [], fromLineBreak: false });
        currentRow++;
        itemsInCurrentRow = 0;
        pushSelection(selection, i);
        itemsInCurrentRow++;
      }
      else {
        pushSelection(selection, i);
        itemsInCurrentRow++;
      }
    }

    return abilityRows.filter(row => row.selections.length > 0);
  }

  trackByRowIndex: TrackByFunction<PreviewRow> = (index: number, _row: PreviewRow) => {
    return index;
  };

  trackByAbilitySelection: TrackByFunction<IndexedSelection> = (_index: number, item: IndexedSelection) => {
    const selection = item.selection;
    return selection.Id || (selection.SelectedAbility?.Title + '_' + selection.Separator + '_' + selection.Notes);
  };

  onImageError(event: Event, ability: Ability): void {
    console.error('Image failed to load:', {
      src: ability.Src,
      title: ability.Title,
      event
    });
    const img = event.target as HTMLImageElement;
    img.style.backgroundColor = '#ff0000';
    img.alt = `Failed to load: ${ability.Title}`;
  }

  onImageLoad(_event: Event, _ability: Ability): void {
  }

  isBlankSpacer = isBlankSpacer;
}