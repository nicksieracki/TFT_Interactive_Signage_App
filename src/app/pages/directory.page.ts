import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

import { IconComponent } from '../components/icon.component';
import { SettingsService } from '../services/settings.service';

@Component({
    selector: 'directory-page',
    imports: [IconComponent],
    template: `
        <div class="relative h-full w-full bg-white">
            @if (directory_url()) {
                <iframe
                    [src]="safe_url()"
                    class="h-full w-full border-0"
                    title="Directory"
                    (load)="onLoad()"
                ></iframe>

                @if (navigated_away()) {
                    <button
                        class="back-btn"
                        aria-label="Back to directory listing"
                        (click)="reset()"
                    >
                        <icon>list_alt</icon>
                        Back to Directory
                    </button>
                }
            } @else {
                <div
                    class="flex h-full w-full items-center justify-center"
                >
                    <div
                        class="mx-4 flex max-w-md flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-700 shadow-sm"
                    >
                        <icon class="text-4xl text-[#038AED]">list_alt</icon>
                        <p class="text-base font-medium">Directory URL is not configured.</p>
                        <p class="text-sm text-gray-500">
                            Set directory_url in the wayfinder_app metadata.
                        </p>
                    </div>
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

            .back-btn {
                position: absolute;
                top: 20px;
                left: 50%;
                z-index: 10;
                transform: translateX(-50%);
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 28px;
                border-radius: 999px;
                border: 1px solid rgba(255, 255, 255, 0.18);
                background: rgba(3, 18, 30, 0.6);
                backdrop-filter: blur(28px) saturate(160%);
                -webkit-backdrop-filter: blur(28px) saturate(160%);
                color: rgba(255, 255, 255, 0.9);
                font-size: 0.95rem;
                font-weight: 500;
                cursor: pointer;
                box-shadow:
                    0 14px 44px rgba(0, 11, 19, 0.55),
                    inset 0 1.5px 0 rgba(255, 255, 255, 0.14),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
                animation: fade-in 220ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
                white-space: nowrap;
                transition:
                    transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 220ms ease,
                    background 220ms ease;
            }

            .back-btn:hover {
                background: rgba(10, 36, 56, 0.75);
                border-color: rgba(255, 255, 255, 0.28);
                color: #fff;
            }

            .back-btn:active {
                transform: translateX(-50%) scale(0.93);
                box-shadow:
                    0 4px 14px rgba(0, 11, 19, 0.65),
                    inset 0 1px 0 rgba(255, 255, 255, 0.07);
                transition-duration: 55ms;
            }

            @keyframes fade-in {
                from { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.96); }
                to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
            }
        `,
    ],
})
export class DirectoryPage {
    private readonly _settings = inject(SettingsService);
    private readonly _sanitizer = inject(DomSanitizer);
    private readonly _router = inject(Router);

    readonly directory_url = this._settings.signal<string>('directory_url', '');
    readonly safe_url = signal<SafeResourceUrl>(this._sanitize());
    readonly navigated_away = signal(false);

    private _resetting = false;
    private _skips = 2;

    constructor() {
        this._router.events
            .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
            .subscribe(() => this.reset());
    }

    onLoad(): void {
        if (this._skips > 0) { this._skips--; return; }
        if (this._resetting) { this._resetting = false; return; }
        this.navigated_away.set(true);
    }

    reset(): void {
        this._resetting = true;
        this._skips = 0;
        this.navigated_away.set(false);
        this.safe_url.set(this._sanitize());
    }

    private _sanitize(): SafeResourceUrl {
        return this._sanitizer.bypassSecurityTrustResourceUrl(
            this.directory_url()?.trim() ?? '',
        );
    }
}
