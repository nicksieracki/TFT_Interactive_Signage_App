import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';

import { TileMenuComponent } from './components/tile-menu.component';
import { TileNavComponent } from './components/tile-nav.component';
import { VirtualKeyboardComponent } from './components/virtual-keyboard.component';
import { IdleService } from './services/idle.service';
import { PlaceOSService } from './services/placeos.service';
import { SystemService } from './services/system.service';
import { SignagePlayer } from './signage-player';

const OSK_STORAGE_KEY = 'signage-wayfinder:osk';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, SignagePlayer, TileMenuComponent, TileNavComponent],
    template: `
        <div class="relative h-full w-full overflow-hidden bg-[var(--mat-sys-surface)]">
            <signage-player [hide]="hide_signage()" class="absolute inset-0 block bg-gray-200" />

            <div
                class="absolute inset-0 z-10"
                [class.pointer-events-none]="!hide_signage()"
            >
                <router-outlet />
            </div>

            @if (!hide_signage() && !menu_open()) {
                <div
                    class="absolute inset-0 z-20"
                    role="button"
                    aria-label="Open navigation"
                    (click)="menu_open.set(true)"
                ></div>
            }

            @if (!hide_signage() && menu_open()) {
                <tile-menu
                    class="absolute inset-0 z-30"
                    (closed)="menu_open.set(false)"
                />
            }

            @if (hide_signage()) {
                <tile-nav class="absolute inset-x-0 bottom-0 z-30" />
            }
        </div>
    `,
    styles: [
        `
            :host {
                display: block;
                height: 100%;
                width: 100%;
            }
        `,
    ],
})
export class App implements OnInit {
    private readonly _placeos = inject(PlaceOSService);
    private readonly _router = inject(Router);
    private readonly _idle = inject(IdleService);
    private readonly _system = inject(SystemService);

    protected readonly menu_open = signal(false);

    private readonly _active_tab = toSignal(
        this._router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            map((e) => {
                const path = e.urlAfterRedirects.split('?')[0].replace(/^\//, '');
                const segments = path.split('/').filter(Boolean);
                return segments[segments.length - 1] ?? '';
            }),
            startWith(''),
        ),
        { initialValue: '' },
    );

    protected readonly hide_signage = computed(() =>
        ['directory', 'wayfinding', 'game'].includes(this._active_tab()),
    );

    constructor() {
        this._initVirtualKeyboard();
        // Close menu when idle returns to signage so user must tap again
        effect(() => {
            if (!this.hide_signage()) this.menu_open.set(false);
        });
    }

    async ngOnInit(): Promise<void> {
        this._system.init();
        await this._placeos.init();
        this._idle.start();
    }

    private _initVirtualKeyboard(): void {
        const enabled_by_url = this._hasEnabledOskParam();
        const enabled_by_storage = this._storedOskEnabled();
        VirtualKeyboardComponent.enabled = enabled_by_url || enabled_by_storage;
        if (enabled_by_url) this._storeOskEnabled();
    }

    private _hasEnabledOskParam(): boolean {
        const query = this._queryString();
        if (!query) return false;
        return new URLSearchParams(query).get('osk') === 'true';
    }

    private _queryString(): string {
        const location = globalThis.location;
        const hash_query = location?.hash?.split('?')[1]?.split('#')[0] ?? '';
        return hash_query || location?.search?.slice(1) || '';
    }

    private _storedOskEnabled(): boolean {
        try {
            return globalThis.localStorage?.getItem(OSK_STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    }

    private _storeOskEnabled(): void {
        try {
            globalThis.localStorage?.setItem(OSK_STORAGE_KEY, 'true');
        } catch {
            // Ignore storage failures, such as private browsing restrictions.
        }
    }
}
