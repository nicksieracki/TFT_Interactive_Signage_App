import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

const DIRECTORY_URL = 'https://www.tft.ucla.edu/about/faculty/';

@Component({
    selector: 'directory-page',
    template: `
        <div class="h-full w-full bg-white">
            <iframe
                [src]="safe_url()"
                class="h-full w-full border-0"
                title="TFT faculty directory"
            ></iframe>
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
export class DirectoryPage {
    private readonly _sanitizer = inject(DomSanitizer);

    readonly safe_url = computed<SafeResourceUrl>(() =>
        this._sanitizer.bypassSecurityTrustResourceUrl(DIRECTORY_URL),
    );
}
