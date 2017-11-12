function terms_view_credit_app(page_events) {
    var that = this;
    //start all the event listeners
    this.start = function () {
       
       page_events.start_events();
    }
    
    this.stop = function () {
       page_events.stop_events();
    } 
    
}  