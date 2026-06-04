import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
    computed,
    inject,
    signal,
} from '@angular/core';
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
const OVERLAY_STORAGE_KEY = 'signage-wayfinder:control-overlay';
const OVERLAY_MARGIN = 12;

interface OverlayPosition {
    x: number;
    y: number;
}

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
            <signage-player
                [hide]="hide_signage()"
                class="absolute inset-0 block bg-gray-200"
            />
            <div class="absolute inset-0 z-10" [class.pointer-events-none]="!hide_signage()">
                <router-outlet />
            </div>

            <nav
                #controlOverlay
                class="absolute z-30 flex max-w-[calc(100vw-1.5rem)] touch-none select-none items-center gap-1 overflow-x-auto rounded-2xl border border-[#038AED]/30 bg-[#03121E]/95 p-1.5 text-white shadow-[0_18px_45px_rgba(0,11,19,0.45)] backdrop-blur-md"
                [class.cursor-grabbing]="is_dragging()"
                [style.left]="overlay_left()"
                [style.top]="overlay_top()"
                [style.bottom]="overlay_bottom()"
                [style.transform]="overlay_transform()"
                aria-label="Wayfinder controls"
            >
                @if (hide_signage()) {
                    <button
                        matRipple
                        [routerLink]="signage_link()"
                        class="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl p-1 text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD100] sm:h-15 sm:w-15"
                        aria-label="Back to signage"
                    >
                        <icon class="text-3xl">arrow_back</icon>
                    </button>
                }
                <button
                    matRipple
                    [routerLink]="directory_link()"
                    routerLinkActive="bg-[#038AED] text-white shadow-[0_8px_24px_rgba(3,138,237,0.35)]"
                    class="flex h-14 min-w-20 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD100] sm:h-15 sm:min-w-24 sm:px-3"
                    [attr.aria-current]="active_tab() === 'directory' ? 'page' : null"
                >
                    <icon class="text-3xl">list_alt</icon>
                    <span class="text-[0.7rem] font-medium sm:text-xs">Directory</span>
                </button>
                <button
                    matRipple
                    [routerLink]="wayfinding_link()"
                    routerLinkActive="bg-[#038AED] text-white shadow-[0_8px_24px_rgba(3,138,237,0.35)]"
                    class="flex h-14 min-w-20 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD100] sm:h-15 sm:min-w-24 sm:px-3"
                    [attr.aria-current]="active_tab() === 'wayfinding' ? 'page' : null"
                >
                    <icon class="text-3xl">explore</icon>
                    <span class="text-[0.7rem] font-medium sm:text-xs">Wayfinding</span>
                </button>
                <button
                    matRipple
                    [routerLink]="game_link()"
                    routerLinkActive="bg-[#038AED] text-white shadow-[0_8px_24px_rgba(3,138,237,0.35)]"
                    class="flex h-14 min-w-20 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD100] sm:h-15 sm:min-w-24 sm:px-3"
                    [attr.aria-current]="active_tab() === 'game' ? 'page' : null"
                >
                    <icon class="text-3xl">sports_esports</icon>
                    <span class="text-[0.7rem] font-medium sm:text-xs">Game</span>
                </button>
                <button
                    type="button"
                    class="flex h-14 w-10 shrink-0 cursor-grab items-center justify-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD100] sm:h-15"
                    aria-label="Move controls"
                    (pointerdown)="startOverlayDrag($event)"
                    (dblclick)="resetOverlayPosition($event)"
                >
                    <icon class="text-3xl">drag_indicator</icon>
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

    @ViewChild('controlOverlay', { read: ElementRef })
    private readonly _control_overlay?: ElementRef<HTMLElement>;

    private _drag_offset: OverlayPosition | null = null;

    protected readonly title = signal('signage-wayfinder');
    protected readonly ready = this._placeos.ready;
    protected readonly system = this._system.system;
    protected readonly overlay_position = signal<OverlayPosition | null>(
        this._storedOverlayPosition(),
    );
    protected readonly is_dragging = signal(false);

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
        ['directory', 'wayfinding', 'game'].includes(this.active_tab()),
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

    protected readonly game_link = computed(() => {
        const sys = this._system.system();
        return sys ? ['/', sys, 'game'] : ['/game'];
    });

    protected readonly overlay_left = computed(() => {
        const position = this.overlay_position();
        return position ? `${position.x}px` : '50%';
    });

    protected readonly overlay_top = computed(() => {
        const position = this.overlay_position();
        return position ? `${position.y}px` : null;
    });

    protected readonly overlay_bottom = computed(() =>
        this.overlay_position() ? null : `${OVERLAY_MARGIN}px`,
    );

    protected readonly overlay_transform = computed(() =>
        this.overlay_position() ? null : 'translateX(-50%)',
    );

    constructor() {
        this._initVirtualKeyboard();
    }

    async ngOnInit(): Promise<void> {
        this._system.init();
        await this._placeos.init();
        this._idle.start();
    }

    startOverlayDrag(event: PointerEvent): void {
        const overlay = this._control_overlay?.nativeElement;
        if (!overlay) return;
        event.preventDefault();
        event.stopPropagation();
        const rect = overlay.getBoundingClientRect();
        this._drag_offset = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
        this.is_dragging.set(true);
        this._setOverlayPosition(rect.left, rect.top);
    }

    resetOverlayPosition(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.overlay_position.set(null);
        this._drag_offset = null;
        this.is_dragging.set(false);
        this._storeOverlayPosition(null);
    }

    @HostListener('window:pointermove', ['$event'])
    protected onPointerMove(event: PointerEvent): void {
        if (!this._drag_offset) return;
        this._setOverlayPosition(
            event.clientX - this._drag_offset.x,
            event.clientY - this._drag_offset.y,
        );
    }

    @HostListener('window:pointerup')
    @HostListener('window:pointercancel')
    protected onPointerRelease(): void {
        if (!this._drag_offset) return;
        this._drag_offset = null;
        this.is_dragging.set(false);
        this._storeOverlayPosition(this.overlay_position());
    }

    @HostListener('window:resize')
    protected onWindowResize(): void {
        const position = this.overlay_position();
        if (!position) return;
        this._setOverlayPosition(position.x, position.y);
        this._storeOverlayPosition(this.overlay_position());
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

    private _setOverlayPosition(x: number, y: number): void {
        const overlay = this._control_overlay?.nativeElement;
        const width = overlay?.offsetWidth || 280;
        const height = overlay?.offsetHeight || 72;
        const max_x = Math.max(OVERLAY_MARGIN, window.innerWidth - width - OVERLAY_MARGIN);
        const max_y = Math.max(OVERLAY_MARGIN, window.innerHeight - height - OVERLAY_MARGIN);
        this.overlay_position.set({
            x: this._clamp(x, OVERLAY_MARGIN, max_x),
            y: this._clamp(y, OVERLAY_MARGIN, max_y),
        });
    }

    private _clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    private _storedOverlayPosition(): OverlayPosition | null {
        try {
            const raw = globalThis.localStorage?.getItem(OVERLAY_STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw) as Partial<OverlayPosition>;
            if (!Number.isFinite(parsed.x) || !Number.isFinite(parsed.y)) return null;
            return { x: parsed.x!, y: parsed.y! };
        } catch {
            return null;
        }
    }

    private _storeOverlayPosition(position: OverlayPosition | null): void {
        try {
            if (!position) {
                globalThis.localStorage?.removeItem(OVERLAY_STORAGE_KEY);
                return;
            }
            globalThis.localStorage?.setItem(OVERLAY_STORAGE_KEY, JSON.stringify(position));
        } catch {
            // Ignore storage failures, such as private browsing restrictions.
        }
    }
}
