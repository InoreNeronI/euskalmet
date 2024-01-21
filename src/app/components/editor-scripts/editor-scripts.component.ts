import { DOCUMENT, NgForOf } from '@angular/common';
import { AfterViewInit, Component, Inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import { ToastrService } from 'ngx-toastr';
import { LocalStorage } from './localStorage';
import { EditorCustomizationsComponent } from '../editor-customizations/editor-customizations.component';

@Component({
  selector: 'editor-scripts',
  standalone: true,
  imports: [EditorCustomizationsComponent, TranslateModule, NgForOf],
  templateUrl: 'editor-scripts.component.html',
  styleUrl: 'editor-scripts.component.scss',
})
export class EditorScriptsComponent extends LocalStorage implements AfterViewInit {
  brandingImageElement: HTMLImageElement;
  loadingImageElement: HTMLImageElement;
  selectLanguageElement: any;
  // @see https://stackoverflow.com/a/69778692
  selectedFile: any = { id: 0 };

  constructor(
    @Inject(DOCUMENT) protected override document: Document,
    protected override toaster: ToastrService,
  ) {
    super(document, toaster);
  } /*

  handleFileDownload(): void {
    this.handleFileSave();
    // @see https://stackoverflow.com/a/30800715/16711967
    const dlAnchorElem: HTMLElement = document.getElementById('downloadScriptButton');
    dlAnchorElem.setAttribute('href', 'data:' + this.selectedFile.type + ';charset=utf-8,' + this.selectedFile.text);
    dlAnchorElem.setAttribute('download', this.selectedFile.name);
    dlAnchorElem.click();
  }*/

  handleFileSave(): void {}

  handleFileSelection(id: number): void {
    for (let i: number = 0, file: any; (file = this.files[i]); i++) {
      if (file.id === id) {
        this.selectedFile = file;
        break;
      }
    }
    const model: editor.ITextModel = editor.getModels()[0];
    editor.setModelLanguage(model, this.selectedFile.type.replace('application/', ''));
    editor.getEditors()[0].setValue(this.selectedFile.text);
    this.selectLanguageElement.value = model.getLanguageId();
  }

  handleFilesPurge(): void {
    this.deleteDB();
    this.selectLanguageElement.value = 'plaintext';
    editor.getEditors()[0].setValue('');
    this.document.querySelector('#dropdownScriptsButton + ul').classList.remove('show');
    this.openDB();
    this.populateDB();
  }

  handleStart(): void {
    this.brandingImageElement.parentElement.setAttribute('disabled', null);
    this.brandingImageElement.src = 'https://material-icons.github.io/material-icons/svg/pending_actions/baseline.svg';
    this.loadingImageElement.parentElement.setAttribute('disabled', null);
    this.loadingImageElement.src = 'https://material-icons.github.io/material-icons/svg/sync/baseline.svg';
    this.loadingImageElement.classList.add('loading-arrow');
  }

  handleStop(): void {
    this.brandingImageElement.src = 'https://material-icons.github.io/material-icons/svg/code/baseline.svg';
    this.brandingImageElement.parentElement.removeAttribute('disabled');
    this.loadingImageElement.classList.remove('loading-arrow');
    this.loadingImageElement.src = 'https://material-icons.github.io/material-icons/svg/code/baseline.svg';
    this.loadingImageElement.parentElement.removeAttribute('disabled');
  }

  ngAfterViewInit(): void {
    if (this.requiredFeaturesSupported()) {
      this.brandingImageElement = this.document.querySelector('.navbar-brand img');
      this.loadingImageElement = this.document.querySelector('#dropdownScriptsButton img');
      this.selectLanguageElement = this.document.getElementById('language-select');
      this.handleStart();
      this.openDB();
      this.populateDB();
      this.showData(5000, this.handleStop.bind(this));
      // Add an event listener for the file <input> element so the user can select some files to store in the database:
      this.document.getElementById('fileSelector').addEventListener('change', this.uploadAndShowData.bind(this), false);
    } else {
      this.document.querySelector('footer').style.display = 'none';
    }
  }

  showData(timeout: number, cb: Function): void {
    setTimeout(this.displayDB.bind(this), timeout / 10);
    setTimeout(cb, timeout);
  }

  uploadAndShowData(evt: Event | any): void {
    this.handleStart();
    this.handleFileUploadSelection(evt).then((): void => this.showData(500, this.handleStop.bind(this)));
  }
}
