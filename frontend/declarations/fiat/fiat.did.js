export const idlFactory = ({ IDL }) => {
  const ConfirmInvoiceBody = IDL.Record({
    'paymentMethod' : IDL.Text,
    'invoiceNo' : IDL.Nat,
    'isSuccess' : IDL.Bool,
  });
  const ConfirmInvoiceBody__1 = IDL.Record({
    'status' : IDL.Text,
    'paymentMethod' : IDL.Text,
    'invoiceNo' : IDL.Nat,
    'transactionId' : IDL.Text,
  });
  const ResponseStatus_3 = IDL.Variant({
    'err' : IDL.Record({}),
    'success' : ConfirmInvoiceBody__1,
  });
  const StatusCode = IDL.Nat;
  const Response_3 = IDL.Record({
    'status' : IDL.Bool,
    'body' : ResponseStatus_3,
    'message' : IDL.Text,
    'status_code' : StatusCode,
  });
  const ConfirmInvoiceAdminBody = IDL.Record({
    'paymentMethod' : IDL.Text,
    'isCompleted' : IDL.Bool,
    'invoiceNo' : IDL.Nat,
  });
  const ResponseStatus_2 = IDL.Variant({
    'err' : IDL.Record({}),
    'success' : IDL.Bool,
  });
  const Response_2 = IDL.Record({
    'status' : IDL.Bool,
    'body' : ResponseStatus_2,
    'message' : IDL.Text,
    'status_code' : StatusCode,
  });
  const Item = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'price' : IDL.Float64,
  });
  const CreateInvoiceBody = IDL.Record({
    'paymentMethod' : IDL.Text,
    'currency' : IDL.Text,
    'items' : IDL.Vec(Item),
    'amount' : IDL.Float64,
  });
  const CreateInvoiceBody__1 = IDL.Record({
    'id' : IDL.Nat,
    'payment' : IDL.Record({
      'redirectUrl' : IDL.Text,
      'transactionId' : IDL.Text,
    }),
  });
  const ResponseStatus_1 = IDL.Variant({
    'err' : IDL.Record({}),
    'success' : CreateInvoiceBody__1,
  });
  const Response_1 = IDL.Record({
    'status' : IDL.Bool,
    'body' : ResponseStatus_1,
    'message' : IDL.Text,
    'status_code' : StatusCode,
  });
  const Invoice = IDL.Record({
    'id' : IDL.Nat,
    'status' : IDL.Text,
    'paymentMethod' : IDL.Text,
    'owner' : IDL.Principal,
    'createdAt' : IDL.Int,
    'currency' : IDL.Text,
    'paymentLink' : IDL.Text,
    'items' : IDL.Vec(Item),
    'amount' : IDL.Float64,
    'transactionId' : IDL.Text,
  });
  const ResponseStatus = IDL.Variant({
    'err' : IDL.Record({}),
    'success' : IDL.Vec(Invoice),
  });
  const Response = IDL.Record({
    'status' : IDL.Bool,
    'body' : ResponseStatus,
    'message' : IDL.Text,
    'status_code' : StatusCode,
  });
  return IDL.Service({
    'change_invoice_status' : IDL.Func([ConfirmInvoiceBody], [Response_3], []),
    'change_invoice_status_to_admin' : IDL.Func(
        [ConfirmInvoiceAdminBody],
        [Response_2],
        [],
      ),
    'create_invoice' : IDL.Func([CreateInvoiceBody], [Response_1], []),
    'getOwner' : IDL.Func([], [IDL.Text], []),
    'get_actor_id_as_text' : IDL.Func([], [IDL.Text], ['query']),
    'get_all_invoices_to_admin' : IDL.Func([], [Response], []),
    'get_my_invoices' : IDL.Func([], [IDL.Vec(Invoice)], ['query']),
    'invoiceCount' : IDL.Func([], [IDL.Nat], []),
    'isOwner' : IDL.Func([], [IDL.Bool], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
