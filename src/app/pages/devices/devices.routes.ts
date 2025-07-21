import { Routes } from "@angular/router";
import { OposComponent } from "./opos/opos.component";
import { DevicesComponent } from "./device/devices.component";

export default [
    { path: 'devices', data: { breadcrumb: 'Devices' }, component: DevicesComponent },
    { path: 'opos', data: { breadcrumb: 'OPOS' }, component: OposComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;    