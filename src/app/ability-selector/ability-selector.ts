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
    this.abilitySelectionChange.emit(this.abilitySelection);
  }

  onNotesTextChange(text: string) {
    this.abilitySelection.Notes = this.isHeading ? (HEADING_PREFIX + text) : (text || null);
    this.abilitySelectionChange.emit(this.abilitySelection);
  }

  isBlankSpacer = isBlankSpacer;
}
