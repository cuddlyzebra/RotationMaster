import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BoolSettingConfig, ColorSettingConfig, RangeSettingConfig, SettingTypeEnum } from '../../models';
import { RangeSetting } from '../range-setting/range-setting';
import { BoolSetting } from '../bool-setting/bool-setting';
import { ColorSetting } from '../color-setting/color-setting';

@Component({
  selector: 'rm-settings',
  imports: [RangeSetting, BoolSetting, ColorSetting],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings {
  @Input() version: string = '0.0.1';
  @Input() rangeSettings: RangeSettingConfig[] = [];
  @Input() boolSettings: BoolSettingConfig[] = [];
  @Input() colorSettings: ColorSettingConfig[] = [];

  @Output() updateSetting = new EventEmitter<{ name: string, value: any }>();
  @Output() setOverlayPosition = new EventEmitter();
}
