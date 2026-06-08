import { Routes } from '@angular/router';

import { DirectoryPage } from './pages/directory.page';
import { EventsPage } from './pages/events.page';
import { GamePage } from './pages/game.page';
import { InstagramPage } from './pages/instagram.page';
import { SignagePage } from './pages/signage.page';
import { WayfindingPage } from './pages/wayfinding.page';

export const routes: Routes = [
    { path: '', component: SignagePage, pathMatch: 'full' },
    { path: 'directory', component: DirectoryPage },
    { path: 'wayfinding', component: WayfindingPage },
    { path: 'events', component: EventsPage },
    { path: 'instagram', component: InstagramPage },
    { path: 'game', component: GamePage },
    { path: ':system/directory', component: DirectoryPage },
    { path: ':system/wayfinding', component: WayfindingPage },
    { path: ':system/events', component: EventsPage },
    { path: ':system/instagram', component: InstagramPage },
    { path: ':system/game', component: GamePage },
    { path: ':system', component: SignagePage, pathMatch: 'full' },
];
