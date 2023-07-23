import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface ConfirmInvoiceBody {
  'paymentMethod' : string,
  'invoiceNo' : bigint,
  'isSuccess' : boolean,
}
export interface ConfirmInvoiceBody__1 {
  'status' : string,
  'paymentMethod' : string,
  'invoiceNo' : bigint,
  'transactionId' : string,
}
export interface CreateInvoiceBody {
  'paymentMethod' : string,
  'currency' : string,
  'items' : Array<Item>,
  'amount' : number,
}
export interface CreateInvoiceBody__1 {
  'id' : bigint,
  'payment' : { 'redirectUrl' : string, 'transactionId' : string },
}
export interface Invoice {
  'id' : bigint,
  'status' : string,
  'paymentMethod' : string,
  'owner' : Principal,
  'createdAt' : bigint,
  'currency' : string,
  'paymentLink' : string,
  'items' : Array<Item>,
  'amount' : number,
  'transactionId' : string,
}
export interface Item { 'id' : bigint, 'name' : string, 'price' : number }
export interface Response {
  'status' : boolean,
  'body' : ResponseStatus,
  'message' : string,
  'status_code' : StatusCode,
}
export type ResponseStatus = { 'err' : {} } |
  { 'success' : CreateInvoiceBody__1 };
export type ResponseStatus_1 = { 'err' : {} } |
  { 'success' : ConfirmInvoiceBody__1 };
export interface Response_1 {
  'status' : boolean,
  'body' : ResponseStatus_1,
  'message' : string,
  'status_code' : StatusCode,
}
export type StatusCode = bigint;
export interface _SERVICE {
  'change_invoice_status' : ActorMethod<[ConfirmInvoiceBody], Response_1>,
  'create_invoice' : ActorMethod<[CreateInvoiceBody], Response>,
  'getOwner' : ActorMethod<[], string>,
  'get_actor_id_as_text' : ActorMethod<[], string>,
  'get_all_invoices_to_admin' : ActorMethod<[], Array<Invoice>>,
  'get_my_invoices' : ActorMethod<[], Array<Invoice>>,
  'invoiceCount' : ActorMethod<[], bigint>,
  'isOwner' : ActorMethod<[], boolean>,
  'test1' : ActorMethod<[string], string>,
}
