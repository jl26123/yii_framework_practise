function terms_submit_credit_app(page_events) {
    var that = this;
    
    //start all the event listeners
    this.start = function () {
        page_events.add_event('submit','click',$('#terms_submit_credit_app'),that.submit_credit_app);
        page_events.add_event('on','click',$('#terms_credit_app_add_pdf'),that.change_pdf);
        page_events.add_event('on','change',$('#terms_credit_app_pdf_holder'),that.upload_pdf);
        page_events.add_event('on','blur',$('#terms_company_fishbowl_id'),that.validate_fishbowl_id);

        page_events.start_events();
    }
    
    this.stop = function () {
       page_events.stop_events();
    }    

    this.change_pdf = function(e){
        e.preventDefault();
        $('#terms_credit_app_pdf_holder').click();
    }

    this.submit_credit_app = function(e) {
        if ( double_click_check() ) { return false; }
        
        e.preventDefault();
        var temp = $(this).serializeArray();
        var data = {};
        $.each( temp, function(i,v){
            data[v.name] = v.value;
        })
        data.app_pdf_path = $('#terms_credit_app_pdf_name').html();
        data.customer_id = $('#customer_id').val();
            
        var valid = that.validate_credit_app(data); 
        if ( !valid['is_valid'] ){
            $.prompt(valid['message']);
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
        
        $.ajax({
            url: '/php/ajax.php?ref=terms_add_credit_app',
            data: data,
            type: 'POST',
            dataType: 'json',
            success: function(data) {
                $.prompt.close();
                if ( data['status'] == "error" ) {
                    $.prompt( data['message']);
                } else {
                    var state = {a:"terms"};
                    $.bbq.pushState(state,2);
                    terms.reload_view();          
                }
                dc_prevent = false;
            },
            error: function() {
                $.prompt.close();
                $.prompt('Failed to submit, please try again.');
                dc_prevent = false;
            }
        });
    }
    
    this.upload_pdf = function(){
        var type = "northwest";
        var fishbowl_id = $("#fishbowl_id").val();
        var path = "credit_apps";
        var file_element_id = "terms_credit_app_pdf_holder";
        
        $('#terms_credit_app_pdf_name').removeClass('link');
        $('#terms_credit_app_pdf_name').removeClass('pdf_fancybox');
        $('#terms_credit_app_pdf_name').html('<b>Saving in progress, please wait...</b>');
                
        $.ajaxFileUpload ({
                url:'/php/ajax.php?ref=upload_files&type='+type
                +'&fishbowl_id='+fishbowl_id
                +'&path='+path,  
                secureuri:false,
                fileElementId: file_element_id,
                dataType: 'json',
                success: function (data)
                {
                    if ( data['status'] == "error" ) {
                        $.prompt( data['message']);
                        $('#terms_credit_app_pdf_name').html("");
                        $('#terms_credit_app_pdf_name').attr('href','');
                        $('#terms_credit_app_pdf_name').removeClass('link');
                        $('#terms_credit_app_pdf_name').removeClass('pdf_fancybox');
                    } else {
                        $('#terms_credit_app_pdf_name').html(data['filename']);
                        $('#terms_credit_app_pdf_name').attr('href','http://www.mrdirectint.com/northwest/files/test/'+data['filename']);
                        $('#terms_credit_app_pdf_name').addClass('link');
                        $('#terms_credit_app_pdf_name').addClass('pdf_fancybox');
                    }
                },
                error: function (data, status, e)
                {
                    $.prompt('Connection error to server, while saving. Please try again.');
                }
        });
        that.stop();
        that.start();
    }
    
    this.validate_credit_app = function(data) {
        var return_data = {};
        return_data.is_valid = true;
        
        if ( data.company_fishbowl_id == "" || data.company_fishbowl_id == null ){
            return_data.is_valid = false;
            return_data.message = "Please enter an Account Number";
            return return_data;
        } else if ( !$('#terms_credit_app_pdf_name').hasClass('link') ) {
            return_data.is_valid = false;
            return_data.message = "Please attach the credit application PDF.";
            return return_data;
        }
        
        return return_data;
    }
    
    this.validate_fishbowl_id = function(){
        $.get(
            "/php/ajax.php?ref=terms_validate_fishbowl_id&fishbowl_id="+$('#terms_company_fishbowl_id').val()+"&customer_id="+$('#customer_id').val(), 
                function( data ) {   
                    data = $.parseJSON(data);
                    if ( data['status'] == "error" ) {
                        $.prompt( data['message']);
                        $('#terms_company_fishbowl_id').val("");
                    } else {
                        //valid
                    }  
                }
        );
    }
}
    