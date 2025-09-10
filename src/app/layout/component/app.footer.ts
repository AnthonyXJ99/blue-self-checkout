import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        by
        <a href="#" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Bartech</a>
    </div>`
})
export class AppFooter {}
