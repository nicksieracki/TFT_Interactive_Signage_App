import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import { SystemService } from '../services/system.service';
import { IconComponent } from './icon.component';

@Component({
    selector: 'tile-nav',
    imports: [RouterLink, RouterLinkActive, IconComponent],
    template: `
        <svg class="filters" aria-hidden="true">
            <defs>
                <filter id="tile-squish" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence
                        type="turbulence"
                        baseFrequency="0.03"
                        numOctaves="1"
                        seed="4"
                        result="noise"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="0.5"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </defs>
        </svg>

        <nav class="tile-row" aria-label="Main navigation">
            @if (hide_signage()) {
                <a
                    [routerLink]="signage_link()"
                    class="tile tile--back"
                    aria-label="Back to signage"
                >
                    <icon class="text-4xl">arrow_back</icon>
                    <span>Back</span>
                </a>
            }
            <a
                [routerLink]="directory_link()"
                routerLinkActive="tile--active"
                class="tile"
                [attr.aria-current]="active_tab() === 'directory' ? 'page' : null"
            >
                <icon class="text-4xl">list_alt</icon>
                <span>Directory</span>
            </a>
            <a
                [routerLink]="wayfinding_link()"
                routerLinkActive="tile--active"
                class="tile"
                [attr.aria-current]="active_tab() === 'wayfinding' ? 'page' : null"
            >
                <icon class="text-4xl">explore</icon>
                <span>Wayfinding</span>
            </a>
            <a
                [routerLink]="events_link()"
                routerLinkActive="tile--active"
                class="tile"
                [attr.aria-current]="active_tab() === 'events' ? 'page' : null"
            >
                <icon class="text-4xl">event</icon>
                <span>Events</span>
            </a>
            <a
                [routerLink]="instagram_link()"
                routerLinkActive="tile--active"
                class="tile"
                [attr.aria-current]="active_tab() === 'instagram' ? 'page' : null"
            >
                <icon class="text-4xl">photo_camera</icon>
                <span>Instagram</span>
            </a>
            <a
                [routerLink]="game_link()"
                routerLinkActive="tile--active"
                class="tile"
                [attr.aria-current]="active_tab() === 'game' ? 'page' : null"
            >
                <icon class="text-4xl">sports_esports</icon>
                <span>Game</span>
            </a>
        </nav>
    `,
    styles: [
        `
            :host {
                display: flex;
                justify-content: center;
            }

            .filters {
                position: absolute;
                width: 0;
                height: 0;
                overflow: hidden;
                pointer-events: none;
            }

            .tile-row {
                display: flex;
                align-items: flex-end;
                justify-content: center;
                gap: 14px;
                padding: 0 20px 24px;
            }

            .tile {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 164px;
                height: 164px;
                touch-action: manipulation;
                border-radius: 28px;
                text-decoration: none;
                color: rgba(255, 255, 255, 0.78);
                user-select: none;
                cursor: pointer;
                outline: none;
                -webkit-tap-highlight-color: transparent;

                background: rgba(3, 18, 30, 0.45);
                backdrop-filter: blur(48px) saturate(200%);
                -webkit-backdrop-filter: blur(48px) saturate(200%);
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow:
                    0 14px 44px rgba(0, 11, 19, 0.55),
                    inset 0 1.5px 0 rgba(255, 255, 255, 0.28),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.25);

                transition:
                    transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 220ms ease,
                    background-color 220ms ease,
                    border-color 220ms ease;
            }

            .tile span {
                font-size: 0.78rem;
                font-weight: 500;
                letter-spacing: 0.025em;
            }

            .tile:hover {
                background: rgba(10, 36, 56, 0.88);
                border-color: rgba(255, 255, 255, 0.22);
                color: #fff;
            }

            .tile:focus-visible {
                outline: 2.5px solid #ffd100;
                outline-offset: 4px;
            }

            .tile:active {
                transform: scale(0.91);
                filter: url(#tile-squish);
                box-shadow:
                    0 4px 14px rgba(0, 11, 19, 0.65),
                    inset 0 1px 0 rgba(255, 255, 255, 0.07);
                transition-duration: 55ms;
                transition-timing-function: ease-in;
            }

            .tile--active {
                background: rgba(39, 116, 174, 0.55);
                border-color: rgba(39, 116, 174, 0.8);
                box-shadow:
                    0 8px 30px rgba(39, 116, 174, 0.4),
                    inset 0 1.5px 0 rgba(255, 255, 255, 0.18),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
                color: #fff;
            }

            .tile--back {
                width: 100px;
                border-color: rgba(255, 255, 255, 0.28);
                box-shadow: none;
            }

            .tile--back:hover {
                border-color: rgba(255, 255, 255, 0.45);
            }
        `,
    ],
})
export class TileNavComponent {
    private readonly _router = inject(Router);
    private readonly _system = inject(SystemService);

    private _tabFromUrl(url: string): string {
        const path = url.split('?')[0].replace(/^\//, '');
        const segments = path.split('/').filter(Boolean);
        return segments[segments.length - 1] ?? '';
    }

    protected readonly active_tab = toSignal(
        this._router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            map((e) => this._tabFromUrl(e.urlAfterRedirects)),
        ),
        { initialValue: this._tabFromUrl(this._router.url) },
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
}
