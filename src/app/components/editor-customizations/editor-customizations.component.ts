import { NgForOf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api';
import themes from 'monaco-themes/themes/themelist.json';

@Component({
  selector: 'editor-customizations',
  standalone: true,
  imports: [NgForOf, TranslateModule],
  templateUrl: './editor-customizations.component.html',
})
export class EditorCustomizationsComponent {
  protected codeEditorLanguages: Array<any>;
  protected codeEditorThemes: Array<any>;
  protected editor = editor;

  constructor(private http: HttpClient) {
    this.codeEditorLanguages = languages.getLanguages();
    for (const [key, value] of Object.entries(themes)) {
      this.http.get(`/assets/monaco/themes/${value}.json`).subscribe((data: any): void => this.editor.defineTheme(key, data));
    }
    // @see https://stackoverflow.com/a/40242405/16711967
    this.codeEditorThemes = Object.entries(themes).map((e: [string, string]): { name: string; value: string } => ({ name: e[1], value: e[0] }));
    this.codeEditorThemes.push(
      ...[
        { name: 'High Contrast', value: 'hc-light' },
        { name: 'High Contrast Dark', value: 'hc-black' },
        { name: 'Visual Studio', value: 'light' },
        { name: 'Visual Studio Dark', value: 'dark' },
      ],
    );
    // @see https://stackoverflow.com/a/61033232/16711967
    this.codeEditorThemes.sort((a, b) => a.name.localeCompare(b.name));
  }
}
