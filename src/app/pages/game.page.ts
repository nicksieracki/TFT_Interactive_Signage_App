import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'game-page',
    template: `
        <div class="flex h-full w-full items-center justify-center bg-[#faf8ef]">
            <iframe
                [src]="safe_url()"
                class="h-full w-full border-0"
                title="2048 game"
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
export class GamePage {
    private readonly _sanitizer = inject(DomSanitizer);

    readonly safe_url = computed<SafeResourceUrl>(() =>
        this._sanitizer.bypassSecurityTrustResourceUrl('./games/2048/index.html'),
    );
}
