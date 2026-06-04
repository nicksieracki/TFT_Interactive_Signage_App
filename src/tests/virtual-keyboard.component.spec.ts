import { Overlay } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
    VirtualKeyboardComponent,
    VirtualKeyboardDirective,
} from '../app/components/virtual-keyboard.component';

@Component({
    template: `<input keyboard />`,
    imports: [VirtualKeyboardDirective],
})
class KeyboardHostComponent {}

function mockOverlay() {
    const keyboard = { target: null, refocus: vi.fn() };
    const overlay_ref = {
        attach: vi.fn(() => ({ instance: keyboard })),
        dispose: vi.fn(),
    };
    const position_strategy = {
        global: () => ({
            bottom: () => ({
                centerHorizontally: () => ({}),
            }),
        }),
    };
    const overlay = {
        create: vi.fn(() => overlay_ref),
        position: vi.fn(() => position_strategy),
    };
    return { keyboard, overlay, overlay_ref };
}

describe('VirtualKeyboardDirective', () => {
    let overlay: ReturnType<typeof mockOverlay>;

    beforeEach(async () => {
        VirtualKeyboardComponent.enabled = false;
        overlay = mockOverlay();
        await TestBed.configureTestingModule({
            imports: [KeyboardHostComponent],
            providers: [{ provide: Overlay, useValue: overlay.overlay }],
        }).compileComponents();
    });

    afterEach(() => {
        VirtualKeyboardComponent.enabled = false;
    });

    it('leaves native keyboard behaviour alone when the app keyboard is disabled', () => {
        const fixture = TestBed.createComponent(KeyboardHostComponent);
        fixture.detectChanges();

        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        expect(input.readOnly).toBe(false);
        expect(input.getAttribute('readonly')).toBeNull();
    });

    it('suppresses the native keyboard when the app keyboard is enabled before init', () => {
        VirtualKeyboardComponent.enabled = true;
        const fixture = TestBed.createComponent(KeyboardHostComponent);
        fixture.detectChanges();

        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        expect(input.readOnly).toBe(true);
        expect(input.getAttribute('readonly')).toBe('');
        expect(input.getAttribute('inputmode')).toBe('none');
        expect(input.getAttribute('autocomplete')).toBe('off');
        expect(input.getAttribute('autocapitalize')).toBe('off');
        expect(input.getAttribute('spellcheck')).toBe('false');
    });

    it('suppresses the native keyboard on pointerdown before focus opens the overlay', () => {
        const fixture = TestBed.createComponent(KeyboardHostComponent);
        fixture.detectChanges();
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        VirtualKeyboardComponent.enabled = true;
        input.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        input.dispatchEvent(new Event('focus', { bubbles: false }));

        expect(input.readOnly).toBe(true);
        expect(overlay.overlay.create).toHaveBeenCalled();
        expect(overlay.keyboard.target).toBe(input);
    });
});

describe('VirtualKeyboardComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VirtualKeyboardComponent],
        }).compileComponents();
    });

    it('can write key presses into readonly targets', () => {
        const fixture = TestBed.createComponent(VirtualKeyboardComponent);
        const component = fixture.componentInstance;
        const input = document.createElement('input');
        const onInput = vi.fn();

        input.readOnly = true;
        input.value = 'ab';
        input.selectionStart = 2;
        input.selectionEnd = 2;
        input.addEventListener('input', onInput);
        component.target = input;

        component.handleKeyPress('c');

        expect(input.value).toBe('abc');
        expect(onInput).toHaveBeenCalledTimes(1);
    });
});
