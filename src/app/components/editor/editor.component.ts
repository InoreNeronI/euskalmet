import { NgForOf } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

@Component({
  selector: 'editor',
  template: '<div style="height: 99.99%; width: 100%" #editorContainer></div>',
  standalone: true,
  imports: [NgForOf, TranslateModule],
})
export class EditorComponent implements OnInit {
  // @see https://stackoverflow.com/a/75413982/16711967
  @ViewChild('editorContainer', { static: true }) _editorContainer!: ElementRef;
  codeEditorInstance!: editor.IStandaloneCodeEditor;

  ngOnInit(): void {
    this.codeEditorInstance = editor.create(this._editorContainer.nativeElement, {
      automaticLayout: true,
      // @see https://github.com/microsoft/monaco-editor/issues/2880#issuecomment-1328250386
      scrollBeyondLastLine: false,
      unusualLineTerminators: 'auto',
      wordWrap: 'on',
      wrappingIndent: 'indent',
    });
    document.getElementById('language-select').addEventListener('change', (ev: Event | any): void => {
      editor.setModelLanguage(this.codeEditorInstance.getModel(), ev.target.value);
    });
    document.getElementById('theme-select').addEventListener('change', (ev: Event | any): void => {
      const theme = ev.target.value;
      if (theme === 'dark') {
        this.codeEditorInstance.updateOptions({ theme: 'vs-dark' });
      } else if (theme === 'light') {
        this.codeEditorInstance.updateOptions({ theme: 'vs' });
      } else {
        this.codeEditorInstance.updateOptions({ theme: theme });
      }
    });
  }
}
