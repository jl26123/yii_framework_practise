function terms_submit_credit_memo(page_events) {
    var that = this;
    that.invoice_id = "";
    that.last_invoice_id = "";
    that.checking_invoice = false;
    that.last_amount_value = "";
    that.last_number_value = "";
    
    //only contains strings for display
    that.valid_invoices = false;
    //has id to invoice_num relationships
    that.invoice_data = [];
    
    this.get_valid_invoice_ids = function() {
        
        if ( !that.valid_invoices ){
            that.valid_invoices = [];
            $.each( $('#full-terms .content .past .items > div'),function(){
                if ($(this).data('type') == "invoice" ) {
                    that.valid_invoices.push(""+$(this).data('invoice_id'));
                    that.invoice_data.push(
                        {
                            id: $(this).data('id'),
                            invoice_id: $(this).data('invoice_id')
                        }   
                    )   
                }
            })
        }        
        return that.valid_invoices;
    }
    
    this.get_invoice_data = function() {
        that.get_valid_invoice_ids();
        return that.invoice_data;
    }
    
    //start all the event listeners
    this.start = function () {
       page_events.add_event('on','focus',$("#terms_search_all_invoices_autocomplete"),that.first_focus_for_autocomplete);
       page_events.add_event('autocomplete',false,$("#terms_search_all_invoices_autocomplete"),that.autocomplete_settings() );
       page_events.add_event('on','blur',$("#terms_search_all_invoices_autocomplete"),that.invoice_number_check);
       page_events.add_event('on','click',$("#terms_submit_submit_credit_memo"), that.add_credit_memo);
       page_events.add_event('on','input',$("#terms_credit_memo_amount"),that.validate_amount);
       page_events.add_event('on','input',$("#terms_credit_memo_number"),that.validate_number);
       
       page_events.start_events();
    }
    
    this.stop = function () {
       page_events.stop_events();
    }    

    this.set_view = function(){        
        //that.invoice_number_check();
    }

    //This is added because autocomplete doesn't do anything when you just click in the box
    //for the first time.
    this.first_focus_for_autocomplete = function(){
       if ( $('#terms_search_all_invoices_autocomplete').val() == "" ){
           $("#terms_search_all_invoices_autocomplete").autocomplete("search","");   
       }
    }

    this.autocomplete_settings = function() {
      return {
                delay:      0,
                autoFocus:  true,
                source:     function(request, response) {
                    var results =  $.ui.autocomplete.filter(that.get_valid_invoice_ids(), request.term);
                    response(results.slice(0,10));   
                }, 
                minLength:0,
                select:     function(e,ui) {
                    //var state = $.bbq.getState();
                    //state.invoice_id = ui.item.value;
                    //$.bbq.pushState(state,2);                    
                }
             };
     }
            

    this.add_credit_memo = function(){
       if ( double_click_check() ) { return false; }
       var id = false;
       
       $.each ( that.get_invoice_data(), function(i,v){
           if ( v['invoice_id'] == $('#terms_search_all_invoices_autocomplete').val() ){
               id = v['id'];
           }
       })
       
       if ( !that.validate_add_credit_memo_data(id) ) { return false;}
       
        $.prompt("Saving...", {
            //No buttons so it'll autoclose.. I hope.'
            buttons: {  },
            submit: function(e,v,m,f){
                e.preventDefault();
            }
        });
       
       $.get(
            "/php/ajax.php?ref=terms_add_credit_memo&customer_id="+$('#customer_id').val()
                +"&id="+id
                +"&amount="+$('#terms_credit_memo_amount').val()
                +"&number="+$('#terms_credit_memo_number').val(),
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
    
    this.invoice_number_check = function() {        
        if ( $('#terms_search_all_invoices_autocomplete').val() != "" ) {
            if (  in_array($('#terms_search_all_invoices_autocomplete').val(),that.get_valid_invoice_ids())) {
                return true;
            } else {
                $.prompt("Invalid invoice number");
                $('#terms_search_all_invoices_autocomplete').val("")
                return false;
            }
        }
    }
    
    this.validate_add_credit_memo_data = function(id){
       if ( !$("#terms_search_all_invoices_autocomplete").val() 
                || !id 
                || !$('#terms_credit_memo_amount').val() 
                || !$('#terms_credit_memo_number').val()
                || that.invoice_number_check() === false 
                                                                ){
                                                                        
                    if (!$("#terms_search_all_invoices_autocomplete").val()) {
                        $.prompt("Please enter an invoice number");
                    } else if (!id) {
                        //Protection against insert a memo to an invoice_id that doesn't exist
                        // should never hit, but just incase!
                        $.prompt("SinkNet Error, cannot find Northwest portal's Invoice ID");
                    } else if (!$('#terms_credit_memo_amount').val()) {
                        $.prompt("Please enter a credit memo amount.");
                    } else if (!$('#terms_credit_memo_number').val()) {
                        $.prompt("Please enter a credit memo number");
                    } else if ( that.invoice_number_check() === false ) {
                        $.prompt("Invalid invoice number.");
                    }
                    
                    dc_prevent = false;
                    return false;
       }
       
       return true;
    }
    
    this.validate_amount = function() {
        var text_position = getInputPosition(document.getElementById('terms_credit_memo_amount'));
        
        if ( $(this).val().replace(/[^.]/g,'').length < 2 ) {
            $(this).val( $(this).val().replace(/[^0-9.]/g,''));
            if ( $(this).val() == that.last_amount_value ) {
                text_position--;
            }   
        } else {
            $(this).val( that.last_amount_value );
            text_position--;
        }
        
        setSelectionRange(document.getElementById('terms_credit_memo_amount'),text_position,text_position);
        that.last_amount_value = $(this).val();
    }
    
    this.validate_number = function() {
        var text_position = getInputPosition(document.getElementById('terms_credit_memo_number'));
        
        $(this).val( $(this).val().replace(/[^0-9]/g,''));
        if ( $(this).val() == that.last_number_value ) {
            text_position--;
        } 
        
        setSelectionRange(document.getElementById('terms_credit_memo_number'),text_position,text_position);
        that.last_number_value = $(this).val();
    }
}
    