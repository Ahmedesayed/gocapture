import { FormsProvider } from './../providers/forms/forms';
import { Injectable } from "@angular/core";
import { DocumentsService } from "./documents-service";
import { Form, IDocument, IDocumentSet } from "../model";
import { xorBy, intersectionBy, differenceBy } from 'lodash';
import { forkJoin } from "rxjs/observable/forkJoin";
import { Observable } from "rxjs";
import { Popup } from "../providers/popup/popup";

@Injectable()
export class DocumentsSyncClient {
  private _isSyncing: boolean = false;

  constructor(
    private documentsService: DocumentsService,
    private popup: Popup,
    private formsProvider: FormsProvider
  ) { }

  syncAll() {
    // don't call again if we are already syncing
    if (this._isSyncing) {
      return;
    }
    const documentSets = [];
    let currentDocuments = [];
    this.formsProvider.getForms().forEach((form) => {
      form.elements.forEach((el) => {
        if (el.type === 'documents' && el.documents_set) {
          documentSets.push({ id: el.documents_set.id, docs: el.documents_set.documents, formId: form.form_id })
          currentDocuments = [...currentDocuments, el.documents_set.documents.map((doc) => { return { ...doc, setId: el.documents_set.id }; })]
        }
      })
    })

    documentSets.forEach((set) => {
      this.checkDocs(set.formId, set.id, currentDocuments)
    })
  }

  checkDocs(formId, setId, currentDocuments) {
    this.documentsService.getDocumentsBySet(parseInt(setId))
      .subscribe((documents) => {

        this.handleDocs(documents, currentDocuments, formId);

      }, (error) => {

        console.log('Error while syncing by form');
        console.log(JSON.stringify(error));
        this._isSyncing = false;

      });
  }

  deleteDocs(docs, formId) {
    this.formsProvider.updateFormSyncStatus(formId, true)
    this.documentsService.removeDocuments(docs.map((doc) => doc.id))
      .subscribe(() => {
        this.formsProvider.updateFormSyncStatus(formId, false)

        console.log('deleting success');
      }, (error) => {
        this.formsProvider.updateFormSyncStatus(formId, false)

        console.log('deleting error');
        console.log(JSON.stringify(error)
        )
      });
  }

  insertDocs(docs, formId) {
    this.formsProvider.updateFormSyncStatus(formId, true)

    const documentObservables = docs
      .map((doc: IDocument) => {
        return this.documentsService.saveDocument(doc)
          .defaultIfEmpty({})
          .retry(3)
          .catch(() => Observable.of({}));
      });

    forkJoin(documentObservables)
      .subscribe(() => {
        // console.log('ALL DOCUMENTS SYNCED');
        this.formsProvider.updateFormSyncStatus(formId, false)
        this._isSyncing = false;
      }, (error) => {
        this.formsProvider.updateFormSyncStatus(formId, false)
        // console.log('DOCUMENTS COULDNT BE SYNCED');
        this._isSyncing = false;
      })
  }

  handleDocs(documents, currentDocuments, formId) {
    if (!documents) {
      this._isSyncing = false;
      return;
    }
    const currentSetDocuments = documents.map((doc) => doc);

    // check only a small portion of the documents
    const documentsToBeChecked = xorBy(currentSetDocuments, currentDocuments, 'id');
    // documents to be deleted
    const documentsToBeDeleted = intersectionBy(currentSetDocuments, documentsToBeChecked, 'id');
    // documents to be inserted
    const documentsToBeInserted = differenceBy(documentsToBeChecked, documentsToBeDeleted, 'id');


    if (documentsToBeDeleted.length) {
      this.deleteDocs(documentsToBeDeleted, formId);
    }

    if (documentsToBeInserted.length) {
      this.insertDocs(documentsToBeInserted, formId)
    }

    if (!documentsToBeInserted.length && !documentsToBeDeleted.length) {
      this._isSyncing = false;
    }
  }

  syncBySet(set: IDocumentSet) {
    const promises = set.documents.map((document) => {
      return new Promise((resolve, reject) => {
        this.documentsService.saveDocument(document)
          .subscribe((_) => {
            resolve();
            console.log(`Document synced`);
          }, (error) => {
            reject(error);
            console.log(`Couldn't sync by set. An error occurred`);
            console.log(JSON.stringify(error));
          })
      });
    });

    return Promise.all(promises);
  }

  public isSyncing(): boolean {
    return this._isSyncing;
  }

  public showSyncingToast() {
    this.popup.showToast(`Documents are still syncing. Please try again later.`);
  }

  private getDocumentsSetByForm(form: Form): IDocumentSet[] {
    return form.elements
      .filter((el) => el.type === 'documents')
      .map((el) => {
        return {
          ...el.documents_set,
          formId: parseInt(form.id)
        }
      });
  }
}
