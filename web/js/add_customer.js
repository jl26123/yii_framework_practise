//"use strict";

var SN = SN || {};


SN.customer = (
    function($, undefined) {
        var _customer = {},
            _$form,
            _$inputs,
            _$button;
        
        _customer.activate = function() {
            _$form = $('.js-addCustomer');
            _$inputs = _$form.find('.js-value');
            _$button = _$form.find('.js-submit');
            
            _$button.on('click',tryToSubmit);
        }
        
        _customer.deactivate = function() {
            console.log("kill your engines!");
        }
        
        _customer.validate = function() {
            var isValid = {
                isValid :  true,
                message : ""
            }
            
            $.each( get_values(), function(i,v){
                if ( v.iname == "contact_email" && !validateEmail(v.value) ) {
                    isValid.isValid = false;
                    isValid.message = "The E-mail address you have entered is not valid.";
                    return false;
                }
                
                if ( v.iname != "customer_note" && v.iname != "website" && v.value == "" ) {
                    isValid.isValid = false;
                    isValid.message = v.name + " Requires Input";
                    return false;
                }
            });
            
            return isValid;
        }
        
        _customer.isValid = function() {
            return _customer.validate()['isValid'];
        }
        
        _customer.test = function() {
            console.log(get_values());
        }
        
        function tryToSubmit() {
            if ( !_customer.isValid() ) {
                $.prompt( _customer.validate()['message'] );
            } else {
                submit();
            }   
        }
        
        function submit(){
            //Uses current global stuff
            if ( double_click_check() ) { return false; }
            
            $.ajax({
                url        : '/php/ajax.php?ref=add_new_customer',
                dataType   : 'json',
                data       : get_values(),
                type       : 'POST',
                success   : function ( data ) {
                    if ( data.status == "error" ){
                        $.prompt('Server error, please try again.');
                    } else if ( data.status == "success" ){
                        document.location.href = window.location.protocol+"//"+window.location.hostname+"/customer_screen.php?cust_id="+data.customer_id;
                    } else {
                        $.prompt('Unknown Error');
                    }
                },
                error: function ( data ) {
                    $.prompt('Error, please try again.');
                },
                complete: function ( data ) {
                    dc_prevent = false;
                }
            });
        }
        
        //http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
        
        function get_values(){
            var values = {};
            var count = 0;
            $.each( _$inputs, function(i,v){
                var _v = $(v);
                if ( _v.is('input') || _v.is('textarea') ) {
                    values[count++] = {
                        iname : _v.data('name'),
                        name : _v.siblings('label').html(),
                        value : _v.val()
                    };
                }
            });

            return values;
        }
        
        return _customer;
    }
)(jQuery);
$(
    function() {
        SN.customer.activate();
    }
);