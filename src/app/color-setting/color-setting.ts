import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColorSettingConfig } from '../../models';

@Component({
    selector: 'rm-color-setting',
    templateUrl: './color-setting.html',
    styleUrls: ['./color-setting.scss']
})
export class ColorSetting {
  @Input() setting!: ColorSettingConfig;

  @Output() onUpdate = new EventEmitter<string>();

  ngOnInit() {
    // Find the container div by id and apply any classes
    const container = document.getElementById("color-container");
    if (container && this.setting.classes) {
      this.setting.classes.forEach((className: string) => {
        container.classList.add(className);
      });
    }
  }

  valueChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.setting.value = value;
    this.onUpdate.emit(value);
  }
}
