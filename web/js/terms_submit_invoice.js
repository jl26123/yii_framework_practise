function terms_submit_invoice(page_events) {
    var that = this;
    that.invoice_id = "";
    that.last_invoice_id = "";
    that.checking_invoice = false;
    
    //start all the event listeners
    this.start = function () {
       page_events.add_event('on','focus',$("#terms_search_all_invoices_autocomplete"),that.first_focus_for_autocomplete);
       page_events.add_event('autocomplete',false,$("#terms_search_all_invoices_autocomplete"),that.autocomplete_settings );
       page_events.add_event('on','blur',$("#terms_search_all_invoices_autocomplete"),that.invoice_number_blur);
       page_events.add_event('on','click',$("#terms_submit_submit_invoice"), that.add_invoice);
       page_events.add_event('on','change',$('#terms_submit_invoice_credit_app'),that.credit_app_select_change);
       
       page_events.start_events();
    }
    
    this.stop = function () {
       page_events.stop_events();
    }    

    this.set_view = function(){
        var state = $.bbq.getState();
        
        if ( state.credit_app_id > 0 ){
            $('#terms_submit_invoice_credit_app option[data-id="'+state.credit_app_id+'"]').prop('selected',true);
            
            if ( !$('#terms_submit_invoice_credit_app option[data-id="'+state.credit_app_id+'"]').length ) {
                delete state.credit_app_id;
                $.bbq.pushState(state,2);
            }
        } else {
            $('#terms_submit_invoice_credit_app option:first-child').prop('selected',true);
        }
        
        that.invoice_number_check();
    }

    this.credit_app_select_change = function() {
        var state = $.bbq.getState();
        state.credit_app_id = $('#terms_submit_invoice_credit_app option:selected').data("id");
        $.bbq.pushState(state,2);
    }

    //This is added because autocomplete doesn't do anything when you just click in the box
    //for the first time.
    this.first_focus_for_autocomplete = function(){
       if ( $('#terms_search_all_invoices_autocomplete').val() == "" ){
           $("#terms_search_all_invoices_autocomplete").autocomplete("search","");   
       }
    }

    this.autocomplete_settings = 
            {
                delay:      150,
                autoFocus:  true,
                source:     '/php/ajax.php?ref=get_invoices_search_all&customer_id='+$('#customer_id').val(), minLength:0,
                select:     function(e,ui) {
                    var state = $.bbq.getState();
                    state.invoice_id = ui.item.value;
                    $.bbq.pushState(state,2);                    
                }
            };
            

    this.add_invoice = function(){
       if ( double_click_check() ) { return false; }
       if ( !$("#terms_search_all_invoices_autocomplete").val() ) { 
            $.prompt("Please select an invoice number.");
            dc_prevent = false;
            return false;
       }
       if ( !$('#terms_submit_invoice_credit_app option:selected').data("id") ){
            $.prompt("Customer does not have a credit application.");
            dc_prevent = false;
            return false;
       }
       
       
        $.prompt("Saving...", {
            //No buttons so it'll autoclose.. I hope.'
            buttons: {  },
            submit: function(e,v,m,f){
                e.preventDefault();
            }
        });
       
       $.get(
            "/php/ajax.php?ref=terms_add_invoice&customer_id="+$('#customer_id').val()
                +"&invoice_id="+$("#terms_search_all_invoices_autocomplete").val()
                +"&credit_app_id="+$('#terms_submit_invoice_credit_app option:selected').data("id"), 
                function( data ) {   
                   data = $.parseJSON(data);
                   $.prompt.close();
                   if ( data['status'] == "error" ){
                       $.prompt(data['message']);
                   } else {
                       var state = {a:"terms"};
                       $.bbq.pushState(state,2);
                       terms.reload_view();
                   }
                   dc_prevent = false;
                }
        );
    }
    
    this.invoice_number_blur = function(){
        var state = $.bbq.getState();
        state.invoice_id = $("#terms_search_all_invoices_autocomplete").val();
        $.bbq.pushState(state,2);
    }
    
    this.invoice_number_check = function() {        
        var state = $.bbq.getState();
        
        if ( that.checking_invoice === true ){
            return true;
        }
        
        if ( state.invoice_id === that.last_invoice_id ) {
            return true;
        }
        
        if ( typeof state.invoice_id == "undefined" ){
            $("#terms_search_all_invoices_autocomplete").val("");
            $("#terms_submit_invoice_preview").attr('src','');
            return true;
        } 
        that.checking_invoice = true;
        $.get(
            "/php/ajax.php?ref=terms_validate_invoice&customer_id="+$('#customer_id').val()+"&invoice_id="+state.invoice_id, 
                function( data ) {   
                    var state = $.bbq.getState();
                                   
                    if ( data == "false" ){
                        $.prompt('This invoice is not valid.');
                        delete state.invoice_id;
                        
                        $.bbq.pushState(state,2);
                    } else if ( data == "true" ){
                        if ( state.invoice_id > 0 ){
                            $("#terms_search_all_invoices_autocomplete").val(state.invoice_id);
                            $("#terms_submit_invoice_preview").attr('src','/php/preview_email_attachment.php?type=invoice&invoice_id='+state.invoice_id);
                        } else {
                            $("#terms_search_all_invoices_autocomplete").val("");
                            $("#terms_submit_invoice_preview").attr('src','');
                        }
                    }
                    
                    that.checking_invoice = false;                 
                }
        );
        that.last_invoice_id = state.invoice_id;
    }
}
    