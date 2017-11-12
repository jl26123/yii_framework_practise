function terms_view_credit_memo(page_events) {
    var that = this;

    this.click_company_name = function() {
        var state = {a:"terms",page:"view_credit_app",id:$(this).data('id')};
        $.bbq.pushState(state,2);
    }
    
    this.click_parent_invoice = function() {
        var state = {a:"terms",page:"view_invoice",id:$(this).data('id')};
        $.bbq.pushState(state,2);
    }
    
    this.delete_credit_memo = function() {
        if ( double_click_check() ) { return false; }
        
        $.prompt("Are you sure you want to delete this?", {
            buttons: { "Yes, Delete": true, "No": false },
            overlayspeed: "fast",
            submit: function(e,v,m,f){
                // use e.preventDefault() to prevent closing when needed or return false. 
                // e.preventDefault(); 
                if ( v === true ) {
                    var state = $.bbq.getState();
                    $.ajax({
                        url: "/php/ajax.php?ref=terms_delete_credit_memo&id="+state.id+"&customer_id="+$('#customer_id').val(),
                        type: 'GET',
                        success: function ( data ) {
                            that.stop();
                            $.bbq.pushState({a:"terms"},2);
                            terms.reload_view();
                        },
                        error: function ( data ) {
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
       page_events.add_event('on','click',$('#terms_view_credit_memo > div > p.view_credit_app'),that.click_company_name);
       page_events.add_event('on','click',$('#terms_view_credit_memo > div > p.view_invoice'),that.click_parent_invoice);
       page_events.add_event('on','click',$('#terms_delete_credit_memo_button'),that.delete_credit_memo);
       
       page_events.start_events();
    }
    
    this.stop = function () {
       page_events.stop_events();
    } 
    
}  