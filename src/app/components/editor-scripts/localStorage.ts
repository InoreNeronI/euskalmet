// @see https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/samples/hh779017(v=vs.85)
import { ToastrService } from 'ngx-toastr';

export class LocalStorage {
  protected data: any = {};
  private dbGlobals: any = {}; // Store all indexedDB related objects in a global object called 'dbGlobals'.
  protected document: Document;
  protected files: Array<any> = [];
  protected toaster: ToastrService;
  private window: Window;

  constructor(document: Document, toaster: ToastrService) {
    this.document = document;
    this.toaster = toaster;
    // @see https://stackoverflow.com/a/52620181/16711967
    this.window = this.document.defaultView;
    // The database object will eventually be stored here.
    this.dbGlobals.db = null;
    // The description of the database.
    this.dbGlobals.description = 'This database is used to store files locally.';
    // The name of the database.
    this.dbGlobals.name = 'localFileStorage';
    // Must be >= 1. Be aware that a database of a given name may only have one version at a time, on the client machine.
    this.dbGlobals.version = 1;
    // The name of the database's object store. Each object in the object store is a file object.
    this.dbGlobals.storeName = 'fileObjects';
    // Indicates whether or not there's one or more records in the database object store. The object store is initially empty, so set this to true.
    this.dbGlobals.empty = true;
  }

  // ---------------------------------------------------------------------------------------------------

  requiredFeaturesSupported(): boolean {
    // To work, IndexedDB pages must be served via the http or https protocol (or, for apps in the new Windows UI, the ms-wwa or ms-wwa-web protocols).
    switch (this.window.location.protocol) {
      case 'http:':
        break;
      case 'https:':
        break;
      // For apps in the new Windows UI, IndexedDB works in local content loaded in the web context.
      case 'ms-wwa-web:':
        break;
      // For apps in the new Windows UI, IndexedDB works in the local context.
      case 'ms-wwa:':
        break;
      default:
        this.toaster.error('IndexedDB pages must be served via the http:// or https:// protocol - resolve this issue and try again.');
        return false;
    } // switch

    // @ts-ignore
    if (!this.document.getElementById('fileSelector').files) {
      this.toaster.error('File API is not fully supported - upgrade your browser to the latest version.');
      return false;
    }

    return true;
  } // requiredFeaturesSupported

  // ---------------------------------------------------------------------------------------------------

  openDB(): void {
    console.log('openDB(): Open database has been queued...');

    if (!this.window.indexedDB.open) {
      this.toaster.info('window.indexedDB.open is null in openDB()');
      return;
    } // if

    try {
      // Also passing an optional version number for this database.
      const openRequest: IDBOpenDBRequest = this.window.indexedDB.open(this.dbGlobals.name, this.dbGlobals.version);
      // Some browsers may only support the errorCode property.
      openRequest.onerror = (evt: Event | any): void => {
        this.toaster.error('openRequest.onerror fired in openDB() - error: ' + (evt.target.error ? evt.target.error : evt.target.errorCode));
      };
      // Called if the database is opened via another process, or similar.
      openRequest.onblocked = this.openDB_onblocked.bind(this);
      // Called if the database doesn't exist or the database version values don't match.
      openRequest.onupgradeneeded = this.openDB_onupgradeneeded.bind(this);
      // Attempts to open an existing database (that has a correctly matching version value).
      openRequest.onsuccess = this.openDB_onsuccess.bind(this);
    } catch (ex: any) {
      this.toaster.error('window.indexedDB.open exception in openDB() - ' + ex.message);
    }
  } // openDB

  // ---------------------------------------------------------------------------------------------------

  openDB_onblocked(evt: Event | any): void {
    console.log('openDB_onblocked()');

    this.toaster.error(
      'The database is blocked - error code: ' +
        (evt.target.error ? evt.target.error : evt.target.errorCode) +
        '. If this page is open in other browser windows, close these windows.',
    );
  }

  // ---------------------------------------------------------------------------------------------------

  openDB_onupgradeneeded(evt: Event | any): void {
    console.log('openDB_onupgradeneeded(): Open database onupgradeneeded has been queued...');
    // A successfully opened database results in a database object, which we place in our global IndexedDB variable.
    const db = (this.dbGlobals.db = evt.target.result);

    if (!db) {
      this.toaster.error('Database is null in openDB_onupgradeneeded()');
      return;
    } // if

    try {
      // Create the object store such that each object in the store will be given an 'ID' property that is auto-incremented monotonically.
      // Thus, files of the same name can be stored in the database.
      db.createObjectStore(this.dbGlobals.storeName, { keyPath: 'ID', autoIncrement: true });
    } catch (ex: any) {
      this.toaster.error('Exception in openDB_onupgradeneeded() - ' + ex.message);
      return;
    }
    this.toaster.success('The database has been created.');
  } // openDB_onupgradeneeded

  // ---------------------------------------------------------------------------------------------------

  openDB_onsuccess(evt: Event | any): void {
    console.log('openDB_onsuccess(): Open database onsuccess has been queued...');
    // A successfully opened database results in a database object, which we place in our global IndexedDB variable.
    const db = (this.dbGlobals.db = evt.target.result);

    if (!db) {
      this.toaster.error('Database is null in openDB_onsuccess()');
      return;
    } // if

    this.toaster.success('The database has been opened.');
  } // openDBsuccess

  // ---------------------------------------------------------------------------------------------------

  async handleFileUpload(file: File, text: string): Promise<void> {
    const db = this.dbGlobals.db;
    let transaction;
    if (!db) {
      this.toaster.error('Database is null in handleFileUpload()');
      return;
    } // if

    try {
      // This is either successful or it throws an exception. Note that the ternary operator is for browsers that only support the READ_WRITE value.
      // @ts-ignore
      transaction = db.transaction(this.dbGlobals.storeName, IDBTransaction.READ_WRITE ? IDBTransaction.READ_WRITE : 'readwrite');
    } catch (ex: any) {
      // try
      this.toaster.error('db.transaction exception in handleFileUpload() - ' + ex.message);
      return;
    } // catch

    transaction.onerror = (evt: Event | any): void => {
      this.toaster.error('transaction.onerror fired in handleFileUpload() - error code: ' + (evt.target.error ? evt.target.error : evt.target.errorCode));
    };
    transaction.onabort = (): void => {
      this.toaster.error('transaction.onabort fired in handleFileUpload()');
    };
    transaction.oncomplete = (): void => {
      this.toaster.info('transaction.oncomplete fired in handleFileUpload()');
    };

    try {
      // Note that multiple put()'s can occur per transaction.
      const objectStore = transaction.objectStore(this.dbGlobals.storeName);
      // The put() method will update an existing record, whereas the add() method won't.
      // @see https://stackoverflow.com/a/30590069/16711967
      const addRequest = objectStore.add({
        name: file.name,
        type: file.type,
        date: file.lastModified,
        size: file.size,
        text: text,
      });
      // There's at least one object in the database's object store. This info (i.e., this.dbGlobals.empty) is used in displayDB().
      addRequest.onsuccess = (): void => {
        this.dbGlobals.empty = false;
        this.toaster.info('addRequest.onsuccess fired in handleFileUpload()');
      };
      addRequest.onerror = (evt: Event | any): void => {
        this.toaster.error('addRequest.onerror fired in handleFileUpload() - error code: ' + (evt.target.error ? evt.target.error : evt.target.errorCode));
      };
    } catch (ex: any) {
      // try
      this.toaster.error('Transaction and/or put() exception in handleFileUpload() - ' + ex.message);
      return;
    } // catch
  } // handleFileUpload

  // ---------------------------------------------------------------------------------------------------

  async handleFileUploadSelection(evt: Event | any): Promise<void> {
    console.log('handleFileUploadSelection()');
    // The files selected by the user (as a FileList object).
    const files = evt.target.files;
    if (!files) {
      this.toaster.error('At least one selected file is invalid - do not select any folders. Please reselect and try again.');
      return;
    }
    const controller: AbortController = new AbortController();
    const signal: AbortSignal = controller.signal;

    for (let i: number = 0, file: File; (file = files[i]); i++) {
      const formData: FormData = new FormData();
      formData.append('file', file);
      try {
        const response: Response = await fetch('https://api.beltza.eus/monaco.php', {
          body: formData,
          method: 'POST',
          signal,
        });
        if (response.ok) {
          await this.handleFileUpload(file, await response.text());
        } else {
          // network error in the 4xx–5xx range
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        // use response here if we didn't throw above
      } catch (ex: any) {
        this.toaster.error('Exception in handleFileUploadSelection() - ' + ex.message);
      }
    } // for
  } // handleFileUploadSelection

  // ---------------------------------------------------------------------------------------------------

  displayDB(): void {
    console.log('displayDB()');

    const db: IDBDatabase = this.dbGlobals.db;
    let transaction: IDBTransaction;

    if (!db) {
      this.toaster.error('Database is null in displayDB()');
      return;
    } // if

    try {
      // This is either successful or it throws an exception. Note that the ternary operator is for browsers that only support the READ_ONLY value.
      // @ts-ignore
      transaction = db.transaction(this.dbGlobals.storeName, IDBTransaction.READ_ONLY ? IDBTransaction.READ_ONLY : 'readonly');
    } catch (ex: any) {
      // try
      this.toaster.error('Database transaction exception in displayDB() - ' + ex.message);
      return;
    } // catch

    try {
      const objectStore: IDBObjectStore = transaction.objectStore(this.dbGlobals.storeName);

      try {
        const keyRange: IDBKeyRange = IDBKeyRange.lowerBound(0);
        const cursorRequest: IDBRequest<IDBCursorWithValue> = objectStore.openCursor(keyRange);

        cursorRequest.onerror = (evt: Event | any): void => {
          this.toaster.error('cursorRequest.onerror fired in displayDB() - error code: ' + (evt.target.error ? evt.target.error : evt.target.errorCode));
        };
        // Be aware that if the database is empty, this variable never gets used.

        cursorRequest.onsuccess = (evt: Event | any): void => {
          // Get an object from the object store.
          const cursor = evt.target.result;

          if (cursor) {
            // If we're here, there's at least one object in the database's object store (i.e., the database is not empty).
            this.dbGlobals.empty = false;
            this.data = {
              ...this.data,
              ...{
                [cursor.value.ID]: {
                  id: cursor.value.ID,
                  date: cursor.value.date,
                  name: cursor.value.name,
                  size: cursor.value.size,
                  text: cursor.value.text,
                  type: cursor.value.type,
                },
              },
            };
            this.toaster.info('Item "' + cursor.value.name + '" requested from database.');
            // Move to the next object in the object store.
            cursor.continue();
          } else {
            this.files = Object.values(this.data);
            this.toaster.success('Finished reading for items, total: ' + this.files.length);
          }

          if (this.dbGlobals.empty) {
            this.toaster.info("The database is empty, there's nothing to display.");
          }
        }; // cursorRequest.onsuccess
      } catch (innerException: any) {
        // inner try
        this.toaster.error('Inner try exception in displayDB() - ' + innerException.message);
      } // inner catch
    } catch (outerException: any) {
      // outer try
      this.toaster.error('Outer try exception in displayDB() - ' + outerException.message);
    } // outer catch
  } // displayDB

  // ---------------------------------------------------------------------------------------------------

  deleteDB(): void {
    console.log('deletedDB(): Delete database has been queued...');

    try {
      if (this.dbGlobals.db) {
        // If the database is open, you must first close the database connection before deleting it.
        // Otherwise, the delete request waits (possibly forever) for the required close request to occur.
        this.dbGlobals.db.close();
      }
      // Note that we already checked for the availability of the deleteDatabase() method in the above feature detection code.
      const deleteRequest: IDBOpenDBRequest = this.window.indexedDB.deleteDatabase(this.dbGlobals.name);

      deleteRequest.onerror = (evt: Event | any): void => {
        this.toaster.error('deleteRequest.onerror fired in deleteDB() - ' + (evt.target.error ? evt.target.error : evt.target.errorCode));
      };
      deleteRequest.onsuccess = (): void => {
        this.dbGlobals.db = null;
        this.dbGlobals.empty = true;
        this.toaster.success('The database has been deleted.');
        this.data = {};
        this.files = [];
      }; // deleteRequest.onsuccess
    } catch (ex: any) {
      // try
      this.toaster.error('Exception in deleteDB() - ' + ex.message);
    } // catch
  } // deleteDB

  // ---------------------------------------------------------------------------------------------------

  updateDB(file: any): void {
    console.log('updateDB(): Update database has been queued...');

    const db: IDBDatabase = this.dbGlobals.db;
    let transaction: IDBTransaction;

    if (!db) {
      this.toaster.error('Database is null in updateDB()');
      return;
    } // if

    try {
      // This is either successful or it throws an exception. Note that the ternary operator is for browsers that only support the READ_ONLY value.
      // @ts-ignore
      transaction = db.transaction(this.dbGlobals.storeName, IDBTransaction.READ_WRITE ? IDBTransaction.READ_WRITE : 'readwrite');
    } catch (ex: any) {
      // try
      this.toaster.error('Database transaction exception in updateDB() - ' + ex.message);
      return;
    } // catch

    try {
      const objectStore: IDBObjectStore = transaction.objectStore(this.dbGlobals.storeName);
      const updateRequest: IDBRequest = objectStore.put({
        ID: file.id,
        date: file.date,
        name: file.name,
        size: file.size,
        text: file.text,
        type: file.type,
      });

      updateRequest.onerror = (evt: Event | any): void => {
        this.toaster.error('updateRequest.onerror fired in updateDB() - ' + (evt.target.error ? evt.target.error : evt.target.errorCode));
      };
      updateRequest.onsuccess = (evt: Event | any): void => {
        this.toaster.success('Database updated successfully');
      };
    } catch (ex: any) {
      // try
      this.toaster.error('Exception in updateDB() - ' + ex.message);
    } // catch
  } // deleteDB
}
