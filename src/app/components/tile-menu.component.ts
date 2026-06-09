import { Component, computed, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';

import { SystemService } from '../services/system.service';
import { IconComponent } from './icon.component';

@Component({
    selector: 'tile-menu',
    imports: [IconComponent],
    host: { '[class.closing]': 'closing()' },
    template: `
        <div class="backdrop" (click)="closeMenu()" aria-hidden="true"></div>

        <button class="close-btn" (click)="closeMenu()" aria-label="Close navigation">
            <icon>close</icon>
        </button>

        <div class="menu-content">
            <button type="button" (click)="navigateTo(directory_link())" class="tile tile--1">
                <icon class="tile-icon">list_alt</icon>
                <span class="tile-label">Directory</span>
                <span class="tile-sub">Find people &amp; spaces</span>
            </button>

            <button type="button" (click)="navigateTo(wayfinding_link())" class="tile tile--2">
                <icon class="tile-icon">explore</icon>
                <span class="tile-label">Wayfinding</span>
                <span class="tile-sub">Navigate the building</span>
            </button>

            <button type="button" (click)="navigateTo(events_link())" class="tile tile--3">
                <icon class="tile-icon">event</icon>
                <span class="tile-label">Events</span>
                <span class="tile-sub">What&apos;s happening</span>
            </button>

            <button type="button" (click)="navigateTo(instagram_link())" class="tile tile--4">
                <icon class="tile-icon">photo_camera</icon>
                <span class="tile-label">Instagram</span>
                <span class="tile-sub">Latest posts</span>
            </button>

            <button type="button" (click)="navigateTo(game_link())" class="tile tile--5">
                <icon class="tile-icon">sports_esports</icon>
                <span class="tile-label">Game</span>
                <span class="tile-sub">Take a break</span>
            </button>
        </div>
    `,
    styles: [
        `
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }

            .backdrop {
                position: absolute;
                inset: 0;
                background: rgba(0, 8, 16, 0.78);
                backdrop-filter: blur(14px) saturate(120%);
                -webkit-backdrop-filter: blur(14px) saturate(120%);
                animation: backdrop-in 280ms ease forwards;
            }

            .close-btn {
                position: absolute;
                top: 28px;
                right: 28px;
                z-index: 2;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: 1px solid rgba(255, 255, 255, 0.15);
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                color: rgba(255, 255, 255, 0.65);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                touch-action: manipulation;
                transition:
                    background 200ms ease,
                    color 200ms ease,
                    transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
                animation: backdrop-in 320ms ease backwards;
                animation-delay: 200ms;
            }

            .close-btn:hover {
                background: rgba(255, 255, 255, 0.16);
                color: #fff;
            }

            .close-btn:active {
                transform: scale(0.88);
                transition-duration: 60ms;
            }

            .menu-content {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                gap: 20px;
                padding: 56px 48px 72px;
                pointer-events: none;
            }

            .tile {
                flex: 1;
                pointer-events: all;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 16px;
                border-radius: 32px;
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: rgba(255, 255, 255, 0.82);
                user-select: none;
                cursor: pointer;
                outline: none;
                -webkit-tap-highlight-color: transparent;
                touch-action: manipulation;
                overflow: hidden;

                background: rgba(3, 18, 30, 0.62);
                box-shadow:
                    0 20px 60px rgba(0, 11, 19, 0.6),
                    inset 0 1.5px 0 rgba(255, 255, 255, 0.13),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.22);

                transition:
                    transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 220ms ease,
                    background-color 220ms ease;

                animation: tile-in 420ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
            }

            .tile::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: inherit;
                background: radial-gradient(
                    ellipse at 50% 0%,
                    rgba(255, 255, 255, 0.07) 0%,
                    transparent 65%
                );
                pointer-events: none;
            }

            .tile-icon {
                font-size: 5.5rem;
            }

            .tile-label {
                font-size: 2.25rem;
                font-weight: 600;
                letter-spacing: -0.01em;
                line-height: 1;
            }

            .tile-sub {
                font-size: 1.125rem;
                font-weight: 400;
                letter-spacing: 0.02em;
                color: rgba(255, 255, 255, 0.5);
            }

            .tile:hover {
                background: rgba(255, 255, 255, 0.07);
                border-color: rgba(255, 255, 255, 0.2);
                color: #fff;
            }

            .tile:hover .tile-sub {
                color: rgba(255, 255, 255, 0.65);
            }

            .tile:active {
                transform: scale(0.97);
                box-shadow:
                    0 8px 24px rgba(0, 11, 19, 0.7),
                    inset 0 1px 0 rgba(255, 255, 255, 0.06);
                transition-duration: 60ms;
            }

            .tile:focus-visible {
                outline: 3px solid #ffd100;
                outline-offset: 4px;
            }

            .tile--1 { animation-delay: 0ms; }
            .tile--2 { animation-delay: 70ms; }
            .tile--3 { animation-delay: 140ms; }
            .tile--4 { animation-delay: 210ms; }
            .tile--5 { animation-delay: 280ms; }

            /* ── Exit animations ───────────────────────────── */

            :host.closing .backdrop {
                animation: backdrop-out 260ms ease forwards;
            }

            :host.closing .close-btn {
                animation: backdrop-out 200ms ease forwards;
            }

            :host.closing .tile {
                animation: tile-out 260ms ease-in forwards;
            }

            :host.closing .tile--1 { animation-delay: 160ms; }
            :host.closing .tile--2 { animation-delay: 120ms; }
            :host.closing .tile--3 { animation-delay: 80ms; }
            :host.closing .tile--4 { animation-delay: 40ms; }
            :host.closing .tile--5 { animation-delay: 0ms; }

            /* ── Keyframes ─────────────────────────────────── */

            @keyframes backdrop-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes backdrop-out {
                from { opacity: 1; }
                to { opacity: 0; }
            }

            @keyframes tile-in {
                from {
                    opacity: 0;
                    transform: translateY(48px) scale(0.96);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            @keyframes tile-out {
                from {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translateY(36px) scale(0.96);
                }
            }
        `,
    ],
})
export class TileMenuComponent {
    private readonly _router = inject(Router);
    private readonly _system = inject(SystemService);

    readonly closed = output<void>();

    protected readonly closing = signal(false);

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

    protected navigateTo(link: (string | number)[]): void {
        this.closing.set(true);
        setTimeout(() => this._router.navigate(link), 300);
    }

    protected closeMenu(): void {
        this.closing.set(true);
        setTimeout(() => this.closed.emit(), 300);
    }
}
