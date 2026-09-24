import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Ability, AbilitySelection } from '../../models';
import { SearchDropdown } from '../search-dropdown/search-dropdown';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { isBlankSpacer } from '../../abilitiesLookup';

// Kept in sync with the same constant in rotation-preview.ts -- a Notes value
// starting with "## " renders as a bold section heading instead of a small
// per-ability caption.
const HEADING_PREFIX = '## ';

const MIN_ROW_BREAK_GAP = 1;
const MAX_ROW_BREAK_GAP = 5;

// Kept in sync with the "Heading Text Size" range setting's bounds
// (blankSettings.ts) -- a per-row override should stay within the same
// range as the global default it's overriding.
const MIN_HEADING_SIZE = 10;
const MAX_HEADING_SIZE = 40;

// Starting point for a per-row colour override the first time it's enabled --
// matches the default "Heading Text Color" setting, so switching the toggle
// on doesn't visibly change anything until the swatch is actually edited.
const DEFAULT_HEADING_COLOR = '#ffcb05';

@Component({
    selector: 'rm-ability-selector',
    templateUrl: './ability-selector.html',
    styleUrls: ['./ability-selector.scss'],
    imports: [SearchDropdown, FormsModule, NgIf],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbilitySelector {
  @Input() abilitySelection: AbilitySelection = new AbilitySelection();
  @Input() abilities: Ability[] = [];
  @Input() isFirst: boolean = false;
  @Input() isOnly: boolean = false;

  @Output() abilitySelectionChange = new EventEmitter<AbilitySelection>();
  @Output() delete = new EventEmitter();
  @Output() copyAbility = new EventEmitter<string>();

  copyMenuVisible = false;

  constructor(private cdr: ChangeDetectorRef) {}

  // The "row break" case is now handled by its own toggle + gap number input
  // (see isRowBreak / rowBreakGap below) rather than living in this list --
  // a connector picked here is irrelevant once a row break is active, since
  // the preview discards it anyway.
  separators: string[] = ['→', '+', '/', 's', 'r', 'tc', ''];

  onAbilityChange(event: Ability) {
    this.abilitySelection.SelectedAbility = event;
    this.abilitySelectionChange.emit(this.abilitySelection);
    this.cdr.markForCheck();
  }

  onSeparatorChange(event: string) {
    this.abilitySelection.Separator = event;
    this.abilitySelectionChange.emit(this.abilitySelection);
  }

  // --- Row break (start a new row here), with an optional extra-gap count ---

  get isRowBreak(): boolean {
    return !!this.abilitySelection.Separator && this.abilitySelection.Separator.includes('↵');
  }

  get rowBreakGap(): number {
    const matches = this.abilitySelection.Separator?.match(/↵/g);
    return matches ? matches.length : MIN_ROW_BREAK_GAP;
  }

  onRowBreakToggle(checked: boolean) {
    this.abilitySelection.Separator = checked ? '↵' : '→';
    this.abilitySelectionChange.emit(this.abilitySelection);
  }

  onRowBreakGapChange(value: number) {
    const gap = Math.max(MIN_ROW_BREAK_GAP, Math.min(MAX_ROW_BREAK_GAP, Math.round(value) || MIN_ROW_BREAK_GAP));
    this.abilitySelection.Separator = '↵'.repeat(gap);
    this.abilitySelectionChange.emit(this.abilitySelection);
  }

  // --- Section heading (Notes starting with "## ") ---

  get isHeading(): boolean {
    return !!this.abilitySelection.Notes && this.abilitySelection.Notes.startsWith(HEADING_PREFIX);
  }

  // What the Notes text box shows/edits -- the heading prefix is applied via
  // the checkbox, not typed by hand, so it's stripped out of the visible text.
  get notesText(): string {
    const notes = this.abilitySelection.Notes || '';
    return this.isHeading ? notes.slice(HEADING_PREFIX.length) : notes;
  }

  onHeadingToggle(checked: boolean) {
    const text = this.notesText;
    this.abilitySelection.Notes = checked ? (HEADING_PREFIX + text) : (text || null);
    if (!checked) {
      // No longer a heading -- drop any per-row overrides so they don't
      // silently resurface if this row is ever turned back into a heading.
      this.abilitySelection.HeadingSize = null;
      this.abilitySelection.HeadingColor = null;
    }
    this.abilitySelectionChange.emit(this.abilitySelection);
  }

  onNotesTextChange(text: string) {
    this.abilitySelection.Notes = this.isHeading ? (HEADING_PREFIX + text) : (text || null);
    this.abilitySelectionChange.emit(this.abilitySelection);
  }

  // Per-row heading size override -- null/blank means "use the global
  // Heading Text Size setting", which is the common case, so this only
  // shows once a row is actually a heading.
  get headingSize(): number | null {
    return this.abilitySelection.HeadingSize ?? null;
  }

  onHeadingSizeChange(value: number | string | null) {
    if (value === '' || value === null || value === undefined) {
      this.abilitySelection.HeadingSize = null;
    } else {
      const parsed = Math.round(Number(value));
      this.abilitySelection.HeadingSize = Number.isFinite(parsed)
        ? Math.max(MIN_HEADING_SIZE, Math.min(MAX_HEADING_SIZE, parsed))
        : null;
    }
    this.abilitySelectionChange.emit(this.abilitySelection);
  }

  // Per-row heading colour override -- off by default (uses the global
  // "Heading Text Color" setting). Toggling it on seeds the swatch with
  // that same default so nothing visibly jumps until it's actually changed.
  get isCustomHeadingColor(): boolean {
    return this.abilitySelection.HeadingColor !== null && this.abilitySelection.HeadingColor !== undefined;
  }

  get headingColorValue(): string {
    return this.abilitySelection.HeadingColor ?? DEFAULT_HEADING_COLOR;
  }

  onHeadingColorToggle(checked: boolean) {
    this.abilitySelection.HeadingColor = checked ? (this.abilitySelection.HeadingColor ?? DEFAULT_HEADING_COLOR) : null;
    this.abilitySelectionChange.emit(this.abilitySelection);
  }

  onHeadingColorChange(value: string) {
    this.abilitySelection.HeadingColor = value;
    this.abilitySelectionChange.emit(this.abilitySelection);
  }

  isBlankSpacer = isBlankSpacer;
}
