import { Component, computed, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SystemService } from '../services/system.service';
import { IconComponent } from './icon.component';

@Component({
    selector: 'tile-menu',
    imports: [RouterLink, IconComponent],
    template: `
        <div class="backdrop" (click)="closed.emit()" aria-hidden="true"></div>

        <div class="menu-content">
            <p class="dismiss-hint">Tap outside to close</p>

            <a [routerLink]="directory_link()" class="tile tile--1">
                <icon class="tile-icon">list_alt</icon>
                <span class="tile-label">Directory</span>
                <span class="tile-sub">Find people &amp; spaces</span>
            </a>

            <a [routerLink]="wayfinding_link()" class="tile tile--2">
                <icon class="tile-icon">explore</icon>
                <span class="tile-label">Wayfinding</span>
                <span class="tile-sub">Navigate the building</span>
            </a>

            <a [routerLink]="game_link()" class="tile tile--3">
                <icon class="tile-icon">sports_esports</icon>
                <span class="tile-label">Game</span>
                <span class="tile-sub">Take a break</span>
            </a>
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

            .menu-content {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                gap: 20px;
                padding: 56px 48px 72px;
                pointer-events: none;
            }

            .dismiss-hint {
                margin: 0 0 8px;
                text-align: center;
                font-size: 0.875rem;
                font-weight: 400;
                letter-spacing: 0.04em;
                color: rgba(255, 255, 255, 0.35);
                flex: none;
            }

            .tile {
                flex: 1;
                pointer-events: all;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 14px;
                border-radius: 32px;
                text-decoration: none;
                color: rgba(255, 255, 255, 0.82);
                user-select: none;
                cursor: pointer;
                outline: none;
                -webkit-tap-highlight-color: transparent;
                overflow: hidden;

                background: rgba(3, 18, 30, 0.62);
                border: 1px solid rgba(255, 255, 255, 0.12);
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
                    rgba(255, 255, 255, 0.06) 0%,
                    transparent 65%
                );
                pointer-events: none;
            }

            .tile-icon {
                font-size: 5rem;
            }

            .tile-label {
                font-size: 2rem;
                font-weight: 600;
                letter-spacing: -0.01em;
                line-height: 1;
            }

            .tile-sub {
                font-size: 1rem;
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

            .tile--1 {
                animation-delay: 0ms;
            }
            .tile--2 {
                animation-delay: 90ms;
            }
            .tile--3 {
                animation-delay: 180ms;
            }

            @keyframes backdrop-in {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
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
        `,
    ],
})
export class TileMenuComponent {
    private readonly _system = inject(SystemService);

    readonly closed = output<void>();

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
}
