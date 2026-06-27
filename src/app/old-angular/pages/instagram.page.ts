import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { IconComponent } from '../components/icon.component';
import { SettingsService } from '../services/settings.service';

@Component({
    selector: 'instagram-page',
    imports: [IconComponent],
    template: `
        <div class="flex h-full w-full items-center justify-center bg-[#f7f8fa]">
            @if (safe_url(); as url) {
                <iframe [src]="url" class="h-full w-full border-0" title="Instagram"></iframe>
            } @else {
                <div
                    class="mx-4 flex max-w-md flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-700 shadow-sm"
                >
                    <icon class="text-4xl text-[#038AED]">photo_camera</icon>
                    <p class="text-base font-medium">Instagram URL is not configured.</p>
                    <p class="text-sm text-gray-500">
                        Set instagram_url to an embeddable feed URL.
                    </p>
                </div>
            }
        </div>
    `,
    styles: [
        `
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
        `,
    ],
})
export class InstagramPage {
    private readonly _settings = inject(SettingsService);
    private readonly _sanitizer = inject(DomSanitizer);

    private readonly _instagram_url = this._settings.signal<string>('instagram_url', '');

    readonly safe_url = computed<SafeResourceUrl | null>(() => {
        const url = this._instagram_url()?.trim();
        return url ? this._sanitizer.bypassSecurityTrustResourceUrl(url) : null;
    });
}
