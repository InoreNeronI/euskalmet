import { DOCUMENT, NgForOf, NgIf } from '@angular/common';
import { AfterViewInit, Component, Inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api';
import { ToastrService } from 'ngx-toastr';
import { LocalStorage } from './localStorage';
import { EditorCustomizationsComponent } from '../editor-customizations/editor-customizations.component';

@Component({
  selector: 'editor-scripts',
  standalone: true,
  imports: [EditorCustomizationsComponent, NgForOf, NgIf, TranslateModule],
  templateUrl: 'editor-scripts.component.html',
  styleUrl: 'editor-scripts.component.scss',
})
export class EditorScriptsComponent extends LocalStorage implements AfterViewInit {
  brandingImageElement: HTMLImageElement;
  loadingImageElement: HTMLImageElement;
  selectLanguageElement: any;
  // @see https://stackoverflow.com/a/69778692
  selectedFile: any = null;

  constructor(
    @Inject(DOCUMENT) protected override document: Document,
    protected override toaster: ToastrService,
  ) {
    super(document, toaster);
  }

  handleFileDelete(): void {
    this.deleteItem(this.selectedFile.id);
    this.handleFileSelectionReset();
  }

  handleFileDownload(): void {
    if (this.handleFileSelectionSave()) {
      // @see https://stackoverflow.com/a/30800715/16711967
      // @see https://stackoverflow.com/a/70518204/16711967
      const dlAnchorElem: HTMLElement = this.document.createElement('a');
      dlAnchorElem.setAttribute('href', 'data:' + this.selectedFile.type + ';charset=utf-8,' + encodeURIComponent(this.selectedFile.text));
      dlAnchorElem.setAttribute('download', this.selectedFile.name);
      dlAnchorElem.style.display = 'none';
      this.document.body.appendChild(dlAnchorElem);
      dlAnchorElem.click();
      this.document.body.removeChild(dlAnchorElem);
    }
  }

  handleFileSelection(id: number): void {
    for (let i: number = 0, file: any; (file = this.files[i]); i++) {
      if (file.id === id) {
        this.selectedFile = file;
        break;
      }
    }
    const model: editor.ITextModel = editor.getModels()[0];
    editor.setModelLanguage(model, this.selectedFile.type.replace('application/', ''));
    const extension = this.selectedFile.name.split('.').pop().toLowerCase();
    let language: string = model.getLanguageId();
    if (language === 'plaintext' && extension !== 'txt') {
      const languagesArray: Array<any> = Object.values(languages.getLanguages());
      for (let i: number = 0, lang: any; (lang = languagesArray[i]); i++) {
        if (lang.extensions && lang.extensions.includes('.' + extension)) {
          language = lang.id;
          break;
        }
      }
    }
    editor.setModelLanguage(model, language);
    this.selectLanguageElement.value = language;
    editor.getEditors()[0].setValue(this.selectedFile.text);
  }

  handleFileSelectionSave(): boolean {
    if (this.selectedFile === null) {
      this.toaster.error('Please select a file before save');
      return false;
    }
    this.selectedFile.date = Date.now();
    this.selectedFile.text = editor.getEditors()[0].getValue();
    this.updateItem(this.selectedFile);
    return true;
  }

  handleFileSelectionReset(): void {
    this.selectLanguageElement.value = 'plaintext';
    editor.getEditors()[0].setValue('');
    this.selectedFile = null;
  }

  handleFilesPurge(): void {
    if (this.dbGlobals.empty) {
      this.toaster.info("Database is empty, there's nothing to remove.");
    } else {
      this.deleteDB();
      this.handleFileSelectionReset();
      this.document.querySelector('#dropdownFilesButton + ul').classList.remove('show');
      this.openDB();
    }
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
      this.loadingImageElement = this.document.querySelector('#dropdownFilesButton img');
      this.selectLanguageElement = this.document.getElementById('language-select');
      this.handleStart();
      this.openDB();
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
