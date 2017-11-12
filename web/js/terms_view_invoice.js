function terms_view_invoice(page_events) {
    var that = this;

    this.click_company_name = function() {
        var state = {a:"terms",page:"view_credit_app",id:$(this).data('id')};
        $.bbq.pushState(state,2);
    }
    
    this.delete_invoice = function() {
        if ( double_click_check() ) { return false; }
        
        $.prompt("Are you sure you want to delete this?", {
            buttons: { "Yes, Delete": true, "No": false },
            overlayspeed: "fast",
            submit: function(e,v,m,f){
                // use e.preventDefault() to prevent closing when needed or return false. 
                // e.preventDefault(); 
                if ( v === true ) {
                    var state = $.bbq.getState();
                    
                    $.prompt("Deleting...", {
                        //No buttons so it'll autoclose.. I hope.'
                        buttons: {  },
                        submit: function(e,v,m,f){
                            e.preventDefault();
                        }
                    });
                    
                    $.ajax({
                        url: "/php/ajax.php?ref=terms_delete_invoice&id="+state.id+"&customer_id="+$('#customer_id').val(),
                        type: 'GET',
                        success: function ( data ) {
                            that.stop();
                            $.bbq.pushState({a:"terms"},2);
                            terms.reload_view();
                            $.prompt.close();
                        },
                        error: function ( data ) {
                            $.prompt.close();
                            $.prompt( data );
                        },
                        complete: function () {
                            dc_prevent = false;
                        }
                    });
                } else {
                    dc_prevent = false;
                }
            }
        });
    }
    
    //start all the event listeners
    this.start = function () {
       page_events.add_event('on','click',$('#terms_view_invoice > div > p.link'),that.click_company_name);
       page_events.add_event('on','click',$('#terms_delete_invoice_button'),that.delete_invoice);
       
       page_events.start_events();
    }
    
    this.stop = function () {
       page_events.stop_events();
    } 
    
}  