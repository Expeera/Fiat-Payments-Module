import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface ConfirmInvoiceAdminBody {
  'paymentMethod' : string,
  'isCompleted' : boolean,
  'invoiceNo' : bigint,
}
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
  { 'success' : Array<Invoice> };
export type ResponseStatus_1 = { 'err' : {} } |
  { 'success' : CreateInvoiceBody__1 };
export type ResponseStatus_2 = { 'err' : {} } |
  { 'success' : boolean };
export type ResponseStatus_3 = { 'err' : {} } |
  { 'success' : ConfirmInvoiceBody__1 };
export interface Response_1 {
  'status' : boolean,
  'body' : ResponseStatus_1,
  'message' : string,
  'status_code' : StatusCode,
}
export interface Response_2 {
  'status' : boolean,
  'body' : ResponseStatus_2,
  'message' : string,
  'status_code' : StatusCode,
}
export interface Response_3 {
  'status' : boolean,
  'body' : ResponseStatus_3,
  'message' : string,
  'status_code' : StatusCode,
}
export type StatusCode = bigint;
export interface _SERVICE {
  'change_invoice_status' : ActorMethod<[ConfirmInvoiceBody], Response_3>,
  'change_invoice_status_to_admin' : ActorMethod<
    [ConfirmInvoiceAdminBody],
    Response_2
  >,
  'create_invoice' : ActorMethod<[CreateInvoiceBody], Response_1>,
  'getOwner' : ActorMethod<[], string>,
  'get_actor_id_as_text' : ActorMethod<[], string>,
  'get_all_invoices_to_admin' : ActorMethod<[], Response>,
  'get_my_invoices' : ActorMethod<[], Array<Invoice>>,
  'invoiceCount' : ActorMethod<[], bigint>,
  'isOwner' : ActorMethod<[], boolean>,
}
