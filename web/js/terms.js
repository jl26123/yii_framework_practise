function terms(page_events) {
	var that = this;
	var page_events = page_events;
	var previous_state = "";
	var current_state = "";
	var page_loaded = false;
		
    this.close_terms = function() {
       if ( typeof that.current_state.page != "undefined" && that.current_state.page != "" ) {
            eval("terms_"+that.current_state.page+".stop()");
       }
       $.bbq.pushState({}, 2);
    }

    this.open_terms = function(){
       var state = $.bbq.getState(); 
       state.a = 'terms';
       delete state.b;
       $.bbq.pushState(state, 2);
    }

    this.reload_view = function () {
        page_loaded = false;
        $('#full-terms_container .content').html("<h3>Loading...</h3>" );
        $('#mini-terms_container .content').html("<h3>Loading...</h3>" );
        $.ajax({
            url: "/php/ajax.php?ref=terms_reload&customer_id="+$('#customer_id').val(),
            type: 'GET',
            dataType: 'JSON',
            success: function ( data ) {
                that.stop();           
                $('#full-terms_container').html(data['full']);
                $('#mini-terms_container').html(data['mini']);
                that.start();
                page_loaded = true;
                that.set_window_view();
            },
            error: function ( data ) {
                $('#full-terms_container .content').html("Could not connect to Terms Portal, please reload page to try again.&nbsp;&nbsp<button class='terms_view_reload' style='display: block; height: 25px;'>Reload</button>" );
                $('#mini-terms_container .content').html("Could not connect to Terms Portal, please reload page to try again.<br/><button class='terms_view_reload'>Reload</button>" );
                that.start();
                page_loaded = true;
                that.set_window_view();
            }
        });
    }
	
    this.set_window_view = function(){
        //Make sure page is actually loaded before trying to set views
        if ( page_loaded === false ){return "reject";}
       
        var state = $.bbq.getState();
 
        that.previous_state = that.current_state;
        that.current_state = state;
        var callback = function() {};
        
        if ( state.page == "submit_invoice" ){
            callback = terms_submit_invoice.set_view;
        }

        if ( !state.page ) {
            $('#terms_right_view').html("");
            return false;
        }
        
        if ( that.current_state != that.previous_state ){
            //stop previous pages events.
            if ( typeof that.previous_state.page != "undefined" && that.current_state.page != that.previous_state.page ){
                eval("terms_"+that.previous_state.page+".stop()");
            }
            
            if ( that.current_state.page != that.previous_state.page || that.current_state.id != that.previous_state.id ){
                //for pages that need the id from the data-id field!
                if ( that.current_state.id ) {
                    var url = "/php/ajax.php?ref=terms_load_page&customer_id="+$('#customer_id').val()+"&page="+that.current_state.page+"&id="+that.current_state.id;
                } else {
                    var url = "/php/ajax.php?ref=terms_load_page&customer_id="+$('#customer_id').val()+"&page="+that.current_state.page;    
                }
                
                
                $.get(
                    url, 
                        function( data ) {                  
                            try {
                                data = $.parseJSON(data);
                                if ( data['status'] == "error" ){
                                    $.prompt(data['message']);
                                    var state = {a:"terms"};
                                    $.bbq.pushState(state,2);
                                }
                            } catch (err){
                                //If it comes here, it couldn't parse because it's a valid page
                                //and not a json return value, so just do nothing and have the rest
                                //of the code work!
                            }
                            
                            
                            $('#terms_right_view').html(data);
                            //start new events
                            if ( that.current_state.page != that.previous_state.page ){
                                eval("terms_"+that.current_state.page+".start()");
                            }
                            
                            callback();
                        }
                );
            } else {
                callback();   
            }
         }
    }
	
	//start all the event listeners
	this.start = function () {
	   //variables
	   that.previous_state = "";
       that.current_state = "";
	    
	   page_events.add_event('on','click',$("#terms_view_submit_invoice"),that.terms_view_submit_invoice);
	   page_events.add_event('on','click',$("#terms_view_submit_credit_memo"),that.terms_view_submit_credit_memo);
	   page_events.add_event('on','click',$("#terms_view_new_credit_app"),that.terms_view_new_credit_app);
	   page_events.add_event('on','click',$("#open_terms"),that.open_terms);
       page_events.add_event('on','click',$("#close_terms"),that.close_terms); 
	   page_events.add_event('on','click',$('#full-terms .content .pending .items > div'),that.terms_view_invoice);
	   page_events.add_event('on','click',$('#full-terms .content .past .items > div'),that.terms_view_invoice);
	   page_events.add_event('on','click',$('#full-terms .content .credit_app .items > div'),that.terms_view_credit_app);
	   page_events.add_event('on','click',$(".terms_view_reload"),that.reload_view);
	   
	   page_events.start_events();
	   
	}
    
    this.stop = function () {
       page_events.stop_events();
    }

    this.terms_view_credit_app = function() {
       var state = {a:"terms",page:"view_credit_app",id:$(this).data('id')};
       $.bbq.pushState(state,2);
    }
    
    this.terms_view_invoice = function () {
        if ( $(this).data('type') == "invoice" ){
            var state = {a:"terms",page:"view_invoice",id: $(this).data('id')};    
        } else if ( $(this).data('type') == "credit" ){
            var state = {a:"terms",page:"view_credit_memo",id: $(this).data('id')};    
        }
        
        $.bbq.pushState(state,2);
    }
    
    this.terms_view_new_credit_app = function() {
       var state = {a:"terms",page:"submit_credit_app"};
       $.bbq.pushState(state,2);
    }
    
    this.terms_view_submit_credit_memo = function() {
       var state = {a:"terms",page:"submit_credit_memo"};
       $.bbq.pushState(state,2);
    }
    
    this.terms_view_submit_invoice = function() {
       var state = {a:"terms",page:"submit_invoice"};
       $.bbq.pushState(state,2);
    }
}