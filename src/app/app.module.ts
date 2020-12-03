import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent, AppDialogComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatSliderModule} from '@angular/material/slider';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import { MatTableExporterModule } from 'mat-table-exporter';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    AppDialogComponent
  ],
  imports: [
    MatDialogModule,
    MatTooltipModule,
    MatTableModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatButtonModule,
    BrowserModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    FormsModule,
    MatSliderModule,
    MatIconModule,
    MatTableExporterModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
