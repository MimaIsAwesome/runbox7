// --------- BEGIN RUNBOX LICENSE ---------
// Copyright (C) 2016-2018 Runbox Solutions AS (runbox.com).
// 
// This file is part of Runbox 7.
// 
// Runbox 7 is free software: You can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
// 
// Runbox 7 is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Runbox 7. If not, see <https://www.gnu.org/licenses/>.
// ---------- END RUNBOX LICENSE ----------

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuModule } from '../menu/menu.module';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ContactsAppComponent } from './contacts-app.component';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { ContactsSettingsComponent } from './contacts-settings.component';
import { ContactsWelcomeComponent } from './contacts-welcome.component';
import { FormArrayEditorComponent } from './contact-details/formarray-editor.component';
import { ContactsService } from './contacts.service';
import { RMMAuthGuardService } from '../rmmapi/rmmauthguard.service';
import { HeaderToolbarComponent } from '../menu/headertoolbar.component';
import { VcfImportDialogComponent } from './vcf-import-dialog.component';

@NgModule({
  declarations: [
    ContactsAppComponent,
    ContactDetailsComponent,
    ContactsSettingsComponent,
    ContactsWelcomeComponent,
    FormArrayEditorComponent,
    VcfImportDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
    MenuModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: 'contacts',
        canActivateChild: [RMMAuthGuardService],
        children: [
          {
            path: '', outlet: 'headertoolbar',
            component: HeaderToolbarComponent
          },
          {
            path: '',
            component: ContactsAppComponent,
            children: [
              {
                  path: '',
                  component: ContactsWelcomeComponent,
              },
              {
                  path: 'settings',
                  component: ContactsSettingsComponent,
              },
              {
                  path: ':id',
                  component: ContactDetailsComponent,
              }
            ]
          }
        ]
      }
    ])
  ],
  entryComponents: [
    VcfImportDialogComponent,
  ],
  providers: [
    ContactsService,
  ],
  bootstrap: [ContactsAppComponent]
})
export class ContactsAppModule { }
