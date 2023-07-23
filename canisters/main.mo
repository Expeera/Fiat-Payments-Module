
import Trie "mo:base/Trie";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import List "mo:base/List";
import Time "mo:base/Time";
import Principal "mo:base/Principal";

import Http "http";
import Types "types";
import Validation "validation";
import Messages "messages";
import Utils "utils";
import Base64 "lib/Base64";
import Service "service";
import Util "mo:xtended-numbers/Util";


actor Fiat {

    type Invoice = Types.Invoice;

    // Variable to track the invoice number
    private stable var noInvoice : Nat = 1000;

    // Trie to store invoices
    private stable var invoicesTrie : Trie.Trie<Nat, Invoice> = Trie.empty();

    // Trie to store owner's invoices
    private stable var ownerInvoicesTrie : Trie.Trie<Principal, List.List<Nat>> = Trie.empty();

    // Owner's identifier
    private var owner:Text = "ce3oe-5x3qd-tjgui-rteiu-qmodi-auwyb-ktn4d-t2yaw-6s56p-tbwuw-3ae";

    // Owner's identifier
    public func getOwner() : async Text {
        return owner
    };

    // Check if the caller is the owner
    public shared query (msg) func isOwner() : async Bool {
        return (owner == Principal.toText(msg.caller))
    };

    // Return the number of invoices in the trie
    public func invoiceCount() : async Nat {
        Trie.size(invoicesTrie)
    };

    public shared ({ caller }) func create_invoice(invoice : Types.Request.CreateInvoiceBody) : async Http.Response<Http.ResponseStatus<Types.Response.CreateInvoiceBody, {}>> {
        // Check if the caller is anonymous
        if (Validation.isAnonymous(caller)) {
            // return Utils.generalResponse(false, Messages.not_authorized, #err({}), Http.Status.UnprocessableEntity);
        }
        // Check if the payment method is empty
        else if (Validation.isEmpty(invoice.paymentMethod)) {
            return Utils.generalResponse(false, Messages.payment_method_is_required, #err({}), Http.Status.UnprocessableEntity)
        }
        // Check if the payment method is valid
        else if (Validation.checkIfThePaymentMethodIsFound(invoice.paymentMethod)) {
            return Utils.generalResponse(false, Messages.payment_method_invalid_value, #err({}), Http.Status.UnprocessableEntity)
        }
        // Check if the currency is empty
        else if (Validation.isEmpty(invoice.currency)) {
            return Utils.generalResponse(false, Messages.currency_is_required, #err({}), Http.Status.UnprocessableEntity)
        }
        // Check if the currency is valid
        else if (Validation.checkIfTheCurrencyIsFound(invoice.currency)) {
            return Utils.generalResponse(false, Messages.currency_invalid_value, #err({}), Http.Status.UnprocessableEntity)
        }
        // Check if the invoice amount is greater than zero
        else if (not(Validation.isGreaterThanZero(invoice.amount))) {
            return Utils.generalResponse(false, Messages.invoice_amount_must_be_greater_than_zero, #err({}), Http.Status.UnprocessableEntity)
        };

        if (Validation.isEqual(invoice.paymentMethod , "Stripe")) {
            let sessionResult: Result.Result<?Service.Stripe.CreateSession, ?Service.Stripe.ErrorResponse> = await Service.Stripe.create_session(noInvoice + 1, invoice);
            return await _stripe_invoice(caller, invoice, sessionResult);
        } else {
            let sessionResult: Result.Result<?Service.Paypal.CreateSession, ?Service.Paypal.ErrorResponse> = await Service.Paypal.create_session(noInvoice + 1, invoice);
            return await _paypal_invoice(caller, invoice, sessionResult);
        };

    };

    private func _stripe_invoice(caller: Principal,invoice: Types.Request.CreateInvoiceBody, sessionResult: Result.Result<?Service.Stripe.CreateSession, ?Service.Stripe.ErrorResponse>): async Http.Response<Http.ResponseStatus<Types.Response.CreateInvoiceBody, {}>> {
        return switch (sessionResult) {
            case (#err err) { 
                switch(err){
                    case(null) {
                        return Utils.generalResponse(false, Messages.created_invoice_failed, #err({}), Http.Status.InternalServerError);
                    };
                    case(?_err) {
                        return Utils.generalResponse(false, _err.error.message, #err({}), Http.Status.InternalServerError);
                    };
                };
            };
            case (#ok session) { 
                switch(session){
                    case(null) {
                        return Utils.generalResponse(false, Messages.created_invoice_failed, #err({}), Http.Status.InternalServerError);
                    };
                    case(?_session) {
                        return await _create_invoice(caller, invoice, _session, "Stripe");
                    };
                };
            };                        
        };
    };

    private func _paypal_invoice(caller: Principal,invoice: Types.Request.CreateInvoiceBody, sessionResult: Result.Result<?Service.Paypal.CreateSession, ?Service.Paypal.ErrorResponse>): async Http.Response<Http.ResponseStatus<Types.Response.CreateInvoiceBody, {}>> {
        return switch (sessionResult) {
            case (#err err) { 
                switch(err){
                    case(null) {
                        return Utils.generalResponse(false, Messages.created_invoice_failed, #err({}), Http.Status.InternalServerError);
                    };
                    case(?_err) {
                        return Utils.generalResponse(false, _err.error_description, #err({}), Http.Status.InternalServerError);
                    };
                };
            };
            case (#ok session) { 
                switch(session){
                    case(null) {
                        return Utils.generalResponse(false, Messages.created_invoice_failed, #err({}), Http.Status.InternalServerError);
                    };
                    case(?_session) {
                       return await _create_invoice(caller, invoice, _session, "PayPal");
                    };
                };
            };                        
        };
    };

    private func _create_invoice (caller: Principal, invoice: Types.Request.CreateInvoiceBody, _session: Types.CreateSession, payment: Text): async Http.Response<Http.ResponseStatus<Types.Response.CreateInvoiceBody, {}>> {

        // Increment the invoice number
        noInvoice += 1;

        // Store the invoice details in the trie
        invoicesTrie := Trie.put(
            invoicesTrie,
            Utils.keyNat(noInvoice),
            Nat.equal,
            {
                id = noInvoice;
                owner = caller;
                amount = invoice.amount;
                status = Types.InvoiceStatus.Pending;
                items = invoice.items;
                transactionId = _session.id;
                paymentLink = _session.url;
                paymentMethod = payment;
                currency = invoice.currency;
                createdAt = Time.now();
            },
        ).0;

        // Retrieve the list of invoices for the owner
        var ownerInvoicesList : List.List<Nat> = switch (Trie.get(ownerInvoicesTrie, Utils.keyPrincipal(caller), Principal.equal)) {
            case null List.nil<Nat>();
            case (?result) result;
        };

        // Add the new invoice to the owner's list of invoices
        ownerInvoicesList := List.push(noInvoice, ownerInvoicesList);

        // Update the owner's invoices in the trie
        ownerInvoicesTrie := Trie.replace(
            ownerInvoicesTrie,
            Utils.keyPrincipal(caller),
            Principal.equal, 
            ?ownerInvoicesList,
        ).0;

        return Utils.generalResponse(true, Messages.created_invoice_successfully, #success({ 
            id = noInvoice; 
            payment = {
                transactionId = _session.id;
                redirectUrl   = _session.url;
            } 
        }), Http.Status.OK)

    };

    ///////////////////////// Admin Fucntion /////////////////////////

    public shared({caller}) func get_all_invoices_to_admin() : async [Invoice] {
        // Convert the invoice trie into an array of invoices
        Iter.toArray(
            Iter.map(
                Trie.iter(invoicesTrie),
                func((invoiceNo : Nat, invoice : Invoice)) : Invoice = invoice,
            ),
        );
    };

    ///////////////////////// Admin Fucntion /////////////////////////

    public query({caller}) func get_my_invoices() : async [Invoice] {
        // Retrieve the list of invoice numbers belonging to the caller
        var invoiceNumberList : List.List<Nat> = switch (Trie.find(ownerInvoicesTrie, Utils.keyPrincipal(caller),Principal.equal)) {
            case null List.nil<Nat>();
            case (?result) result;
        };

        // Convert the list of invoice numbers into an array of invoices
        List.toArray(List.map<Nat, Invoice>(invoiceNumberList, func (invoiceNo: Nat): Invoice { 
            // Retrieve the invoice value using the invoice number
            let invoiceVal = Trie.find(invoicesTrie, Utils.keyNat(invoiceNo), Nat.equal);
            return switch(invoiceVal) {
                case (?invoice) invoice;
            };
        }));
    };

    public shared({caller}) func change_invoice_status (invoiceReq: Types.Request.ConfirmInvoiceBody) : async Http.Response<Http.ResponseStatus<Types.Response.ConfirmInvoiceBody, {}>> {
        // Check if the caller is anonymous
        if (Validation.isAnonymous(caller)) {
            return Utils.generalResponse(false, Messages.not_authorized, #err({}), Http.Status.UnprocessableEntity);
        }
        // Check if the payment method is empty
        else if (Validation.isEmpty(invoiceReq.paymentMethod)) {
            return Utils.generalResponse(false, Messages.payment_method_is_required, #err({}), Http.Status.UnprocessableEntity);
        }
        // Check if the payment method is valid
        else if (Validation.checkIfThePaymentMethodIsFound(invoiceReq.paymentMethod)) {
            return Utils.generalResponse(false, Messages.payment_method_invalid_value, #err({}), Http.Status.UnprocessableEntity);
        };

        // Retrieve the invoice value using the invoice number
        let invoiceVal = Trie.find(invoicesTrie, Utils.keyNat(invoiceReq.invoiceNo), Nat.equal);

        switch(invoiceVal) {
            case (null) {
                return Utils.generalResponse(true, Messages.invoice_not_found, #err({}), Http.Status.InternalServerError);
            };
            case (?invoiceFind) {
                // Check if the caller is the owner of the invoice
                if(not(Text.equal(Principal.toText(caller), Principal.toText(invoiceFind.owner)))) {
                    return Utils.generalResponse(false, Messages.invoice_not_found, #err({}), Http.Status.UnprocessableEntity);
                }
                // Check if the payment method matches the invoice
                else if(not(Validation.isEqual(invoiceFind.paymentMethod, invoiceReq.paymentMethod))) {
                    return Utils.generalResponse(false, Messages.invoice_not_found, #err({}), Http.Status.UnprocessableEntity);
                }
                // Check if the invoice is in the pending status
                else if(not(Validation.isEqual(invoiceFind.status, Types.InvoiceStatus.Pending))) {
                    return Utils.generalResponse(false, Messages.invoice_not_pending, #err({}), Http.Status.UnprocessableEntity);
                };
                
                // Retrieve the invoice result using the transaction ID
                if (Validation.isEqual(invoiceFind.paymentMethod , "Stripe")) {
                    let invoiceResult:Result.Result<?Service.Stripe.RetrieveSession, ?Service.Stripe.ErrorResponse> = await Service.Stripe.retrieve_session(invoiceFind.transactionId);
                    return await _change_invoice_status_stripe(invoiceFind, invoiceReq, invoiceResult);
                } else {
                    let invoiceResult: Result.Result<?Service.Paypal.RetrieveSession, ?Service.Paypal.ErrorResponse> = await Service.Paypal.retrieve_session(invoiceFind.transactionId);
                    return await _change_invoice_status_paypal(invoiceFind,  invoiceReq, invoiceResult);
                };
                
            };  
        };   
    };

    private func _change_invoice_status_stripe (invoiceFind:Invoice, invoiceReq: Types.Request.ConfirmInvoiceBody, invoiceResult:Result.Result<?Service.Stripe.RetrieveSession, ?Service.Stripe.ErrorResponse>) : async Http.Response<Http.ResponseStatus<Types.Response.ConfirmInvoiceBody, {}>> {
        switch (invoiceResult) {
            case (#err err) { 
                switch(err){
                    case(null) {
                        return Utils.generalResponse(false, Messages.confirmed_invoice_failed, #err({}), Http.Status.InternalServerError);
                    };
                    case(?_err) {
                        return Utils.generalResponse(false, _err.error.message, #err({}), Http.Status.InternalServerError);
                    };
                };
            };
            case (#ok invoiceRes) { 
                switch(invoiceRes) {
                    case(null) {
                        return Utils.generalResponse(false, Messages.confirmed_invoice_failed, #err({}), Http.Status.InternalServerError);
                    };
                    case(?_invoiceRes) {
                        
                            // If the invoice request is successful and the payment status is "unpaid"
                        if (invoiceReq.isSuccess and Text.equal(_invoiceRes.payment_status, "unpaid")) {
                            return Utils.generalResponse(false, Messages.unpaid_error_message, #err({}), Http.Status.UnprocessableEntity);
                        } 
                        // If the invoice request is not successful and the payment status is "paid"
                        else if (not(invoiceReq.isSuccess) and Text.equal(_invoiceRes.payment_status, "paid")) {
                            return Utils.generalResponse(false, Messages.payment_failed_error_message, #err({}), Http.Status.UnprocessableEntity);
                        };

                        return await _update_invoice_status(invoiceFind, invoiceReq);

                    };
                };        
            };
        };
    };

    private func _change_invoice_status_paypal (invoiceFind:Invoice, invoiceReq: Types.Request.ConfirmInvoiceBody, invoiceResult:Result.Result<?Service.Paypal.RetrieveSession, ?Service.Paypal.ErrorResponse>) : async Http.Response<Http.ResponseStatus<Types.Response.ConfirmInvoiceBody, {}>> {
        switch (invoiceResult) {
            case (#err err) { 
                switch(err){
                    case(null) {
                        return Utils.generalResponse(false, Messages.confirmed_invoice_failed, #err({}), Http.Status.InternalServerError);
                    };
                    case(?_err) {
                        return Utils.generalResponse(false, _err.error_description, #err({}), Http.Status.InternalServerError);
                    };
                };
            };
            case (#ok invoiceRes) { 
                switch(invoiceRes) {
                    case(null) {
                        return Utils.generalResponse(false, Messages.confirmed_invoice_failed, #err({}), Http.Status.InternalServerError);
                    };
                    case(?_invoiceRes) {
                        
                            // If the invoice request is successful and the payment status is "unpaid"
                        if (invoiceReq.isSuccess and Text.equal(_invoiceRes.status, "CREATED")) {
                            return Utils.generalResponse(false, Messages.unpaid_error_message, #err({}), Http.Status.UnprocessableEntity);
                        } 
                        // If the invoice request is not successful and the payment status is "paid"
                        else if (not(invoiceReq.isSuccess) and (Text.equal(_invoiceRes.status, "APPROVED") or Text.equal(_invoiceRes.status, "COMPLETED"))) {
                            return Utils.generalResponse(false, Messages.payment_failed_error_message, #err({}), Http.Status.UnprocessableEntity);
                        };

                        return await _update_invoice_status(invoiceFind, invoiceReq);

                    };
                };        
            };
        };
    };


    private func _update_invoice_status (invoiceFind:Invoice, invoiceReq: Types.Request.ConfirmInvoiceBody) : async Http.Response<Http.ResponseStatus<Types.Response.ConfirmInvoiceBody, {}>> {
        // Create a new invoice with updated status
        let newInvoice = {
            id = invoiceFind.id;
            owner = invoiceFind.owner;
            amount = invoiceFind.amount;
            status = switch(invoiceReq.isSuccess){
                case(true)  Types.InvoiceStatus.Completed;
                case(false) Types.InvoiceStatus.Cancelled;
            };
            items = invoiceFind.items;
            transactionId = invoiceFind.transactionId;
            paymentLink = invoiceFind.paymentLink;
            paymentMethod = invoiceFind.paymentMethod;
            currency = invoiceFind.currency;
            createdAt = invoiceFind.createdAt;
        };

        // Replace the old invoice with the new invoice in the trie
        invoicesTrie := Trie.replace(
            invoicesTrie,
            Utils.keyNat(invoiceReq.invoiceNo),
            Nat.equal, 
            ?newInvoice,
        ).0;

        return Utils.generalResponse(true, 
            switch(invoiceReq.isSuccess) {
                case(true)  Messages.confirmed_invoice_successfully;
                case(false) Messages.cancelled_invoice_successfully;
            },
            #success({ 
                invoiceNo = invoiceReq.invoiceNo; 
                transactionId = invoiceFind.transactionId; 
                paymentMethod = invoiceFind.paymentMethod; 
                status = newInvoice.status; 
            }), 
            Http.Status.OK);
    };

    public query func get_actor_id_as_text() : async Text {
        // Convert the actor ID to text
        Principal.toText(Principal.fromActor(Fiat));
    };

    // public  func create() : async Result.Result<?Service.Paypal.CreateSession, ?Service.Paypal.ErrorResponse>{
    //     await Service.Paypal.create_session(100 , {
    //         amount  = 100;
    //         paymentMethod = "paypal";
    //         currency ="usd";
    //     });
    // };
    

    public func test1(txt:Text) : async Text {
        let text2Nat8:[Nat8] = Utils.text2Nat8Array(txt);
        // text2Nat8
        Base64.StdEncoding.encode(text2Nat8);
    };
}
