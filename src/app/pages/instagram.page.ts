import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, inject } from '@angular/core';

import { SettingsService } from '../services/settings.service';

@Component({
    selector: 'instagram-page',
    template: `
        <div class="flex h-full w-full items-center justify-center overflow-auto bg-[#f7f8fa] p-8">
            <blockquote
                class="instagram-media"
                [attr.data-instgrm-permalink]="profile_url()"
                data-instgrm-version="14"
                style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin:1px; max-width:540px; min-width:326px; padding:0; width:calc(100% - 2px);"
            ></blockquote>
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
export class InstagramPage implements AfterViewInit {
    private readonly _settings = inject(SettingsService);
    private readonly _doc = inject(DOCUMENT);

    readonly profile_url = this._settings.signal<string>('instagram_url', '');

    ngAfterViewInit(): void {
        const win = this._doc.defaultView as Window & {
            instgrm?: { Embeds: { process(): void } };
        };
        if (win?.instgrm) {
            win.instgrm.Embeds.process();
        } else {
            const script = this._doc.createElement('script');
            script.src = '//www.instagram.com/embed.js';
            script.async = true;
            this._doc.body.appendChild(script);
        }
    }
}
