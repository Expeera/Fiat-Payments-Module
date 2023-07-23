import Types "types";
import Config "config";
import Utils "utils";
import Http "http";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Nat8 "mo:base/Nat8";
import Float "mo:base/Float";
import Cycles "mo:base/ExperimentalCycles";
import serdeJson "mo:serde/JSON";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Base64 "lib/Base64";

module {

    let ic : Types.IC = actor ("aaaaa-aa");


    public module Stripe {

        private let base_url = "https://api.stripe.com/v1/";
        private let secret_key = "sk_test_51NBY4OJqHgeFtVGPrrtNb505mCmzGyqOKaqJqvywC0L8xUVeyILcs26tORro3E30Nap9fW5cCoiebQMqUNLNlErQ00iykNQPk0";

        public type CreateSession = {
            id: Text;
            url: Text;
        };

        public type RetrieveSession = {
            payment_status: Text;
        };

        public type ErrorResponse = {
            error: {
                code                : Text;
                doc_url             : Text;
                message             : Text;
                param               : Text;
                request_log_url     : Text;
            };
        };

        public func create_session(invoiceNo:Nat, invoice : Types.Request.CreateInvoiceBody) : async Result.Result<?CreateSession, ?ErrorResponse>  {
            // Set the request headers
            let request_headers = [
                {   name = "Content-Type";     value = "application/x-www-form-urlencoded" },
                {   name = "Authorization";    value = "Bearer " # secret_key }
            ];

            // Construct the request body string
            let request_body_str: Text = "cancel_url="# Config.get_stripe_cancel_url(invoiceNo) #"&" # 
                "success_url="# Config.get_stripe_success_url(invoiceNo) #"&mode=payment&payment_method_types[0]=card&"#
                "line_items[0][price_data][currency]="# invoice.currency #"&line_items[0][price_data][product_data][name]=token&line_items[0][price_data][unit_amount]="# Int.toText(Float.toInt(invoice.amount * 100)) #"&"#
                "line_items[0][quantity]=1";

            // Encode the request body as Blob
            let request_body_as_Blob: Blob = Text.encodeUtf8(request_body_str); 

            // Create the HTTP request object
            let http_request : Http.IcHttp.HttpRequest = {
                url = base_url # "checkout/sessions";
                headers = request_headers;
                body = ?request_body_as_Blob; 
                method = #post;
            };

            // Minimum cycles needed to pass the CI tests. Cycles needed will vary on many things, such as the size of the HTTP response and subnet.
            Cycles.add(220_131_200_000); 

            // Send the HTTP request and await the response
            let http_response : Http.IcHttp.HttpResponse = await ic.http_request(http_request);

            // Decode the response body text
            let decoded_text: Text = switch (Text.decodeUtf8(http_response.body)) {
                case (null) { "{\"error\": {\"code\" : \"\", \"message\" : \"No value returned\", \"doc_url\" : \"\", \"param\" : \"\", \"request_log_url\" : \"\"}}" };
                case (?y) { y };
            };

            Debug.print(decoded_text);

            // Convert the decoded text to Blob
            let blob = serdeJson.fromText(decoded_text);

            // Deserialize the blob to CreateSession type
            let session : ?CreateSession = from_candid(blob);

            return switch(session){
                case(null) {
                    let errResponse : ?ErrorResponse = from_candid(blob);
                    return #err(errResponse);
                };
                case(_session) {
                    return #ok(_session);
                };
            };
        };

        public func retrieve_session(session_id:Text) : async Result.Result<?RetrieveSession, ?ErrorResponse>  {

             // Set the request headers
            let request_headers = [
                {   name = "Content-Type";     value = "application/x-www-form-urlencoded" },
                {   name = "Authorization";    value = "Bearer " # secret_key }
            ];

            // Create the HTTP request object
            let http_request : Http.IcHttp.HttpRequest = {
                url = base_url # "checkout/sessions/" # session_id;
                headers = request_headers;
                body = null; 
                method = #get;
            };

            // Minimum cycles needed to pass the CI tests. Cycles needed will vary on many things, such as the size of the HTTP response and subnet.
            Cycles.add(220_131_200_000); 

            // Send the HTTP request and await the response
            let http_response : Http.IcHttp.HttpResponse = await ic.http_request(http_request);

            // Decode the response body text
            let decoded_text: Text = switch (Text.decodeUtf8(http_response.body)) {
                case (null) { "{\"error\": {\"code\" : \"\", \"message\" : \"No value returned\", \"doc_url\" : \"\", \"param\" : \"\", \"request_log_url\" : \"\"}}" };
                case (?y) { y };
            };

            Debug.print(decoded_text);

            // Convert the decoded text to Blob
            let blob = serdeJson.fromText(decoded_text);

            // Deserialize the blob to RetrieveSession type
            let session : ?RetrieveSession = from_candid(blob);

            return switch(session){
                case(null) {
                    let errResponse : ?ErrorResponse = from_candid(blob);
                    return #err(errResponse);
                };
                case(_session) {
                    return #ok(_session);
                };
            };
        };
    };

    public module Paypal {
        private let base_url = "https://api-m.sandbox.paypal.com/";
        private let client_id:Text = "AZUPT0s8SzC8SkFaBNRzOnVPIr4cZ6XcgiIaXtWFtTMlp2ePzJlfHvoZp0IaxOvlI9nk8aljvlcaihxR";
        private let client_secret:Text = "EFx8zu_5VtYja8nXx6Xs8BPJOepsALxXHvCIjWlKKOAx8UKIXlXwfWx-8Ai6DaUq4zt9hKsk33keit1x";       

        public type ErrorResponse = {
            error                : Text;
            error_description    : Text;
        };

        public type Oauth2Token = {
            access_token: Text;
        };

        private type CreateSessionApi = {
            id: Text;
            links: [
                {
                    href: Text;
                    rel: Text;
                    method: Text;
                }
            ];
        };

        public type CreateSession = {
            id: Text;
            url: Text;
        };

        public type RetrieveSession = {
            status: Text;
        };

        public func create_session(invoiceNo:Nat, invoice : Types.Request.CreateInvoiceBody): async Result.Result<?CreateSession, ?ErrorResponse> {
            
           let sessionResult:Result.Result<?Oauth2Token, ?ErrorResponse> = await generate_access_token();
            switch (sessionResult) {
                case (#err err) { 
                      switch(err) {
                        case(null) {
                            return #err(?{
                                error= "";
                                error_description = "";
                            });
                        };
                        case(?_err) {
                            return #err(err);
                        };
                    };
                };
                case (#ok session) { 
                    switch(session) {
                        case(null){
                            return #err(?{
                                error= "";
                                error_description = "";
                            });
                        };
                        case(?_session) {

                            let request_headers = [
                                { name= "Content-Type"; value = "application/json" },
                                { name= "Authorization"; value = "Bearer " # _session.access_token }
                            ];

                            let request_body_str: Text = "{\"intent\":\"CAPTURE\",\"purchase_units\":[{\"amount\":{\"currency_code\":\""# invoice.currency #"\",\"value\":\""# Int.toText(Float.toInt(invoice.amount)) #"\"}}],\"application_context\":{\"return_url\":\""# Config.get_paypal_success_url(invoiceNo) #"\",\"cancel_url\":\""# Config.get_paypal_cancel_url(invoiceNo) #"\"}}";
                            let request_body_as_Blob: Blob = Text.encodeUtf8(request_body_str);

                            Debug.print(request_body_str);
                            let http_request : Http.IcHttp.HttpRequest = {
                                url = base_url # "v2/checkout/orders";
                                headers = request_headers;
                                body = ?request_body_as_Blob; 
                                method = #post;
                           };

                            Cycles.add(220_131_200_000); 

                            // Send the HTTP request and await the response
                            let http_response : Http.IcHttp.HttpResponse = await ic.http_request(http_request);

                            // Decode the response body text
                            let decoded_text: Text = switch (Text.decodeUtf8(http_response.body)) {
                                case (null) { "{\"error\" : \"\", \"error_description\" : \"No value returned\"}" };
                                case (?y) { y };
                            };

                            Debug.print("Response");
                            Debug.print(decoded_text);

                            let blob = serdeJson.fromText(decoded_text);

                            // Deserialize the blob to CreateSession type
                            let checkout : ?CreateSessionApi = from_candid(blob);

                             return switch(checkout) {
                                case(null) {
                                    let errResponse : ?ErrorResponse = from_candid(blob);
                                    #err(errResponse);
                                };
                                case(?_checkout) {
                                    return #ok(?{
                                        id= _checkout.id;
                                        url= _checkout.links[1].href;
                                    });
                                };
                            };

                            //  return #ok(session);
                        };
                   };
                };
            };
        };   

        private func generate_access_token() : async Result.Result<?Oauth2Token, ?ErrorResponse> {
            let text2Nat8:[Nat8] = Utils.text2Nat8Array(client_id # ":" # client_secret);

            let request_headers = [
                {   name = "Content-Type";     value = "application/x-www-form-urlencoded" },
                {   name = "Authorization";    value = "Basic " # Base64.StdEncoding.encode(text2Nat8) }
            ];

            let request_body_str: Text = "grant_type=client_credentials&ignoreCache=true";

            let request_body_as_Blob: Blob = Text.encodeUtf8(request_body_str); 

            // Create the HTTP request object
            let http_request : Http.IcHttp.HttpRequest = {
                url = base_url # "v1/oauth2/token";
                headers = request_headers;
                body = ?request_body_as_Blob; 
                method = #post;
            };

            // Minimum cycles needed to pass the CI tests. Cycles needed will vary on many things, such as the size of the HTTP response and subnet.
            Cycles.add(220_131_200_000); 

            // Send the HTTP request and await the response
            let http_response : Http.IcHttp.HttpResponse = await ic.http_request(http_request);

            // Decode the response body text
            let decoded_text: Text = switch (Text.decodeUtf8(http_response.body)) {
                case (null) { "{\"error\" : \"\", \"error_description\" : \"No value returned\"}" };
                case (?y) { y };
            };
            Debug.print(decoded_text);

            let blob = serdeJson.fromText(decoded_text);

            // Deserialize the blob to CreateSession type
            let token : ?Oauth2Token = from_candid(blob);

            return switch(token) {
                case(null) {
                    let errResponse : ?ErrorResponse = from_candid(blob);
                    #err(errResponse);
                };
                case(_token) {
                    // access_token := _token.access_token;
                    // expires_time := Time.now() + (_token.expires_in * 10 ** 9);
                    return #ok(_token);
                };
            };
        };

        public func retrieve_session(order_id:Text) : async Result.Result<?RetrieveSession, ?ErrorResponse>  {

            let sessionResult:Result.Result<?Oauth2Token, ?ErrorResponse> = await generate_access_token();
            switch (sessionResult) {
                case (#err err) { 
                      switch(err) {
                        case(null) {
                            return #err(?{
                                error= "";
                                error_description = "";
                            });
                        };
                        case(?_err) {
                            return #err(err);
                        };
                    };
                };
                case (#ok session) { 
                    switch(session) {
                        case(null){
                            return #err(?{
                                error= "";
                                error_description = "";
                            });
                        };
                        case(?_session) {

                            // Set the request headers
                            let request_headers = [
                                { name= "Content-Type"; value = "application/json" },
                                { name= "Authorization"; value = "Bearer " # _session.access_token }
                            ];

                            // Create the HTTP request object
                            let http_request : Http.IcHttp.HttpRequest = {
                                url = base_url # "v2/checkout/orders/" # order_id;
                                headers = request_headers;
                                body = null; 
                                method = #get;
                            };

                            // Minimum cycles needed to pass the CI tests. Cycles needed will vary on many things, such as the size of the HTTP response and subnet.
                            Cycles.add(220_131_200_000); 

                            // Send the HTTP request and await the response
                            let http_response : Http.IcHttp.HttpResponse = await ic.http_request(http_request);

                            // Decode the response body text
                            let decoded_text: Text = switch (Text.decodeUtf8(http_response.body)) {
                                case (null) { "{\"error\" : \"\", \"error_description\" : \"No value returned\"}" };
                                case (?y) { y };
                            };

                            Debug.print(decoded_text);

                            // Convert the decoded text to Blob
                            let blob = serdeJson.fromText(decoded_text);

                            // Deserialize the blob to RetrieveSession type
                            let session : ?RetrieveSession = from_candid(blob);

                            return switch(session){
                                case(null) {
                                    let errResponse : ?ErrorResponse = from_candid(blob);
                                    return #err(errResponse);
                                };
                                case(_session) {
                                    return #ok(_session);
                                };
                            };

                        };
                   };
                };
            };
        };
    };
}