function page_events() {
    var that = this;
    var page_events = [];
    
    var services = {
        add_event : add_event,
        start_events : start_events,
        stop_events : stop_events,
    }
    
    return services;
    
    function add_event(type,event,element,callback){
        page_events.push(
            {
                "type" : type,
                "event" : event,
                "element" : element,
                "callback" : callback,
            }
        );
    }
    
    function start_events(){
        $.each( page_events, function(key,value){
            if ( value['type'] == "autocomplete" ) {
                value['element'][value['type']](value['callback']);
            } else {
                value['element'][value['type']](value['event'],value['callback']);
            }
        });
    }
    
    function stop_events(click_event){
        $.each( page_events, function(key,value){
           if ( value['type'] == "autocomplete" ){
                value['element'].autocomplete("destroy");
                value['element'].removeData('autocomplete');
           } else {
                value['element'].off();   
           }
        });
        page_events = [];
    }  




}