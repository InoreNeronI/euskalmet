import { DOCUMENT, NgForOf, NgIf } from '@angular/common';
import { AfterViewInit, Component, Inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
    private translate: TranslateService,
  ) {
    super(document, toaster);
  }

  handleFileDelete(id: number, name: string): void {
    if (confirm(this.translate.instant('DELETE_FILE_ALERT', { name }))) {
      this.deleteItem(id);
      if (this.selectedFile && this.selectedFile.id === id) {
        this.handleFileSelectionReset();
      }
    }
  }

  handleFileDownload(): void {
    if (this.selectedFileTextChanged() && confirm(this.translate.instant('SAVE_BEFORE_DOWNLOAD', { name: this.selectedFile.name }))) {
      this.handleFileSelectionSave();
    }
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

  handleFileSelection(id: number): void {
    if (!this.selectedFile || this.selectedFile.id !== id) {
      if (this.selectedFileTextChanged() && confirm(this.translate.instant('SAVE_BEFORE_EXIT', { name: this.selectedFile.name }))) {
        this.handleFileSelectionSave();
      }
      for (let i: number = 0, file: any; (file = this.files[i]); i++) {
        if (file.id === id) {
          this.selectedFile = file;
          break;
        }
      }
      const model: editor.ITextModel = editor.getModels()[0];
      editor.setModelLanguage(model, this.selectedFile.type.replace('application/', ''));
      const extension: string = this.selectedFile.name.split('.').pop().toLowerCase();
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
      setTimeout((): void => {
        const selectedFileElement: HTMLElement = this.document.querySelector('#dropdownFilesButton + .dropdown-menu .active');
        selectedFileElement.addEventListener('mouseover', (evt: Event | any) => this.handleFileSelectionMouseover(evt), false);
        selectedFileElement.addEventListener('mouseout', (evt: Event | any) => this.handleFileSelectionMouseout(evt), false);
        selectedFileElement.dispatchEvent(new Event('mouseover'));
      }, 500);
    }
  }

  handleFileSelectionMouseover(evt: Event | any): void {
    evt.target.setAttribute(
      'title',
      this.translate.instant('MODIFIED_AT', {
        date: new Date(this.selectedFile.date).toLocaleString(this.translate.currentLang),
      }),
    );
  }

  handleFileSelectionMouseout(evt: Event | any): void {
    evt.target.removeAttribute('title');
  }

  handleFileSelectionSave(): boolean {
    if (!this.selectedFileTextChanged()) {
      this.toaster.error('Please edit a file before save');
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

  handleFilesExport(): void {
    if (this.files.length > 0) {
      const dlAnchorElem: HTMLElement = this.document.createElement('a');
      dlAnchorElem.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.files)));
      dlAnchorElem.setAttribute('download', 'monaco.' + Date.now().toString() + '.json');
      dlAnchorElem.style.display = 'none';
      this.document.body.appendChild(dlAnchorElem);
      dlAnchorElem.click();
      this.document.body.removeChild(dlAnchorElem);
    } else {
      this.toaster.info("Database is empty, there's nothing to export");
    }
  }

  handleFilesPurge(): void {
    if (this.dbGlobals.empty) {
      this.toaster.info("Database is empty, there's nothing to remove");
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
    this.loadingImageElement.src = 'https://icons.getbootstrap.com/assets/icons/code-slash.svg';
    this.loadingImageElement.parentElement.removeAttribute('disabled');
  }

  ngAfterViewInit(): void {
    if (this.requiredFeaturesSupported()) {
      this.brandingImageElement = this.document.querySelector('.navbar-brand img');
      this.loadingImageElement = this.document.querySelector('#dropdownFilesButton img');
      this.selectLanguageElement = this.document.getElementById('language-select');
      this.handleStart();
      this.openDB();
      this.showData(2000, this.handleStop.bind(this));
      // Add an event listener for the file <input> element so the user can select some files to store in the database:
      this.document.getElementById('filesImport').addEventListener('change', this.uploadAndShowDataImported.bind(this), false);
      this.document.getElementById('filesSelector').addEventListener('change', this.uploadAndShowData.bind(this), false);
    } else {
      this.document.querySelector('footer').style.display = 'none';
    }
  }

  selectedFileTextChanged(): boolean {
    return this.selectedFile && this.selectedFile.text !== editor.getEditors()[0].getValue();
  }

  showData(timeout: number, cb: Function): void {
    setTimeout(this.displayDB.bind(this), timeout / 10);
    setTimeout(cb, timeout);
  }

  uploadAndShowData(evt: Event | any): void {
    this.handleStart();
    this.handleFilesUploadSelection(evt, this.handleFilesUpload.bind(this)).then((): void => this.showData(500, this.handleStop.bind(this)));
  }

  uploadAndShowDataImported(evt: Event | any): void {
    this.handleStart();
    this.handleFilesUploadSelection(evt, this.handleFilesUploadImport.bind(this)).then((): void => this.showData(500, this.handleStop.bind(this)));
  }
}
