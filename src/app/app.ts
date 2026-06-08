import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatRippleModule } from '@angular/material/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';

import { IconComponent } from './components/icon.component';
import { VirtualKeyboardComponent } from './components/virtual-keyboard.component';
import { IdleService } from './services/idle.service';
import { PlaceOSService } from './services/placeos.service';
import { SystemService } from './services/system.service';
import { SignagePlayer } from './signage-player';

const OSK_STORAGE_KEY = 'signage-wayfinder:osk';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        SignagePlayer,
        IconComponent,
        MatRippleModule,
    ],
    template: `
        <div class="relative h-full w-full overflow-hidden bg-[var(--mat-sys-surface)]">
            <signage-player [hide]="hide_signage()" class="absolute inset-0 block bg-gray-200" />
            <div class="absolute inset-0 z-10" [class.pointer-events-none]="!hide_signage()">
                <router-outlet />
            </div>

            <nav
                class="absolute bottom-3 left-1/2 z-30 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-lg border border-[#038AED]/30 bg-[#03121E]/95 p-1.5 text-white shadow-[0_18px_45px_rgba(0,11,19,0.45)] backdrop-blur-md select-none"
                aria-label="Wayfinder controls"
            >
                @if (hide_signage()) {
                    <button
                        matRipple
                        [routerLink]="signage_link()"
                        class="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md p-1 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#FFD100] focus-visible:outline-none sm:h-15 sm:w-15"
                        aria-label="Back to signage"
                    >
                        <icon class="text-3xl">arrow_back</icon>
                    </button>
                }
                <button
                    matRipple
                    [routerLink]="directory_link()"
                    routerLinkActive="bg-[#038AED] text-white shadow-[0_8px_24px_rgba(3,138,237,0.35)]"
                    class="flex h-14 min-w-[4.75rem] flex-col items-center justify-center gap-0.5 rounded-md px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#FFD100] focus-visible:outline-none sm:h-15 sm:min-w-24 sm:px-3"
                    [attr.aria-current]="active_tab() === 'directory' ? 'page' : null"
                >
                    <icon class="text-3xl">list_alt</icon>
                    <span class="text-[0.7rem] font-medium sm:text-xs">Directory</span>
                </button>
                <button
                    matRipple
                    [routerLink]="wayfinding_link()"
                    routerLinkActive="bg-[#038AED] text-white shadow-[0_8px_24px_rgba(3,138,237,0.35)]"
                    class="flex h-14 min-w-[4.75rem] flex-col items-center justify-center gap-0.5 rounded-md px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#FFD100] focus-visible:outline-none sm:h-15 sm:min-w-24 sm:px-3"
                    [attr.aria-current]="active_tab() === 'wayfinding' ? 'page' : null"
                >
                    <icon class="text-3xl">explore</icon>
                    <span class="text-[0.7rem] font-medium sm:text-xs">Wayfinding</span>
                </button>
                <button
                    matRipple
                    [routerLink]="events_link()"
                    routerLinkActive="bg-[#038AED] text-white shadow-[0_8px_24px_rgba(3,138,237,0.35)]"
                    class="flex h-14 min-w-[4.75rem] flex-col items-center justify-center gap-0.5 rounded-md px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#FFD100] focus-visible:outline-none sm:h-15 sm:min-w-24 sm:px-3"
                    [attr.aria-current]="active_tab() === 'events' ? 'page' : null"
                >
                    <icon class="text-3xl">event</icon>
                    <span class="text-[0.7rem] font-medium sm:text-xs">Events</span>
                </button>
                <button
                    matRipple
                    [routerLink]="instagram_link()"
                    routerLinkActive="bg-[#038AED] text-white shadow-[0_8px_24px_rgba(3,138,237,0.35)]"
                    class="flex h-14 min-w-[4.75rem] flex-col items-center justify-center gap-0.5 rounded-md px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#FFD100] focus-visible:outline-none sm:h-15 sm:min-w-24 sm:px-3"
                    [attr.aria-current]="active_tab() === 'instagram' ? 'page' : null"
                >
                    <icon class="text-3xl">photo_camera</icon>
                    <span class="text-[0.7rem] font-medium sm:text-xs">Instagram</span>
                </button>
                <button
                    matRipple
                    [routerLink]="game_link()"
                    routerLinkActive="bg-[#038AED] text-white shadow-[0_8px_24px_rgba(3,138,237,0.35)]"
                    class="flex h-14 min-w-[4.75rem] flex-col items-center justify-center gap-0.5 rounded-md px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#FFD100] focus-visible:outline-none sm:h-15 sm:min-w-24 sm:px-3"
                    [attr.aria-current]="active_tab() === 'game' ? 'page' : null"
                >
                    <icon class="text-3xl">sports_esports</icon>
                    <span class="text-[0.7rem] font-medium sm:text-xs">Game</span>
                </button>
            </nav>
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

    protected readonly title = signal('signage-wayfinder');
    protected readonly ready = this._placeos.ready;
    protected readonly system = this._system.system;

    protected readonly active_tab = toSignal(
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
        ['directory', 'wayfinding', 'events', 'instagram', 'game'].includes(this.active_tab()),
    );

    protected readonly signage_link = computed(() => {
        const sys = this._system.system();
        return sys ? ['/', sys] : ['/'];
    });

    protected readonly directory_link = computed(() => {
        const sys = this._system.system();
        return sys ? ['/', sys, 'directory'] : ['/directory'];
    });

    protected readonly wayfinding_link = computed(() => {
        const sys = this._system.system();
        return sys ? ['/', sys, 'wayfinding'] : ['/wayfinding'];
    });

    protected readonly events_link = computed(() => {
        const sys = this._system.system();
        return sys ? ['/', sys, 'events'] : ['/events'];
    });

    protected readonly instagram_link = computed(() => {
        const sys = this._system.system();
        return sys ? ['/', sys, 'instagram'] : ['/instagram'];
    });

    protected readonly game_link = computed(() => {
        const sys = this._system.system();
        return sys ? ['/', sys, 'game'] : ['/game'];
    });

    constructor() {
        this._initVirtualKeyboard();
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
