import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SvgRegistryService {
  private registeredIcons: Set<string> = new Set();

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {}

  /**
   * Registers an SVG icon only if it hasn't been registered before
   * @param imageName Name of the SVG icon
   */
  registerSvgIcon(imageName: string): void {
    // Check if the icon is already registered
    if (!this.registeredIcons.has(imageName)) {
      this.matIconRegistry.addSvgIcon(
        imageName,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/svg/${imageName}.svg`)
      );
      
      // Mark the icon as registered
      this.registeredIcons.add(imageName);
    }
  }

  registerSvgExploreIcons(imageName: string): void {
    // Check if the icon is already registered
    if (!this.registeredIcons.has(imageName)) {
      this.matIconRegistry.addSvgIcon(
        imageName,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/svg/explore-logos/${imageName}.svg`)
      );
      
      // Mark the icon as registered
      this.registeredIcons.add(imageName);
    }
  }
}