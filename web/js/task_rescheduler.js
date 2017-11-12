//"use strict";

var SN = SN || {};


SN.task_rescheduler = (
    function($, undefined) {
        var _TR = {},
            _$html,
            inputs = {},
            _$rows,
            _id,
            _$button;
        
        _TR.activate = function() {
            _$html = $('#dashboard-task_rescheduler');
            _$rows = $('.tasks-todo tbody tr');
            _$button = _$html.find('button.js-value');
            
            _$button.on('click',submit);
            
            setInputs();
            bindLinks();
        }
        
        _TR.deactivate = function() {
            unbindLinks();
            
            _$button.off();
            
            _$button = null;
            _$html = null;
            _$rows = null;
        }
       
        function bindLinks() {
            
            $.each ( _$rows, function (i,v) {
                $(v).on('click',loadTask); 
            });
            
            inputs['time_to_start'].datepicker({
                onClose: function(dateText) {
                    if ( dateText != "" ) {
                        var temp = dateText.split('/');
                        if ( typeof temp[0] != "undefined" && typeof temp[1] != "undefined" && typeof temp[2] != "undefined" ) {
                            $(this).val(temp[0]+'-'+temp[1]+'-'+temp[2]);
                        }
                    }
                }
            });
        }
        
        function unbindLinks() {
            $.each ( _$rows, function (i,v) {
                $(v).off(); 
            });
            
            inputs['time_to_start'].datepicker("destroy");
            inputs['time_to_start'].removeClass("hasDatepicker").removeAttr('id');
        }
        
        function setInputs() {
            inputs = [];
            $.each( _$html.find('.js-input'), function(i,v){
                inputs[$(v).data('name')] = $(v);
            });
        }
        
        function loadTask(e) {
            e.preventDefault();
            _id = $(this).data('id');
            
            $.get( "/php/ajax.php?ref=get_task_info&id="+_id, function( data ) {
                data = $.parseJSON(data);
                
                setValue('company_name',data.company_name);
                setValue('name',data.name);
                setValue('created',pretty_datetime(data.created));
                setValue('time_to_start',pretty_datetime(data.time_to_start,true));
            });
        }
        
        function setValue(name,value){
            var ele = inputs[name];
            
            if ( ele.length ) {
                if ( ele.is('input') ) {
                    ele.val(value);    
                } else if ( ele.is('p') ){
                    ele.html(value);
                }
                
            }
        }
        
        function getValues(){
            var values = {};
            $.each ( inputs, function(i,v){
                values[i] = v.val(); 
            });
            
            return values;
        }
        
        function submit() {
            _TR.deactivate();
            
            $.get( "/php/ajax.php?ref=set_time_to_start&id="+_id+"&date="+getTimeToStart(), function( data ) {
                $.prompt("Saved!");
                dashboard.get_account_info( $('#account_id').val(), true );
            });
        }
        
        function getTimeToStart(){
            return inputs['time_to_start'].val();
        }
        
        return _TR;
    }
)(jQuery);