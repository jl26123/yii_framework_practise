function customer() {
    var that = this;
    
    this.cust_id        = $("input#customer_id").val();
    this.username       = $('#username').val();
    this.display_name   = $('#display_name').val();
    this.account_id     = $('#account_id').val();
    this.fishbowl_id    = $("input#fishbowl_id").val();
    
    this.on_add_contact     = false;
    this.customer_change    = false;
    this.contact_change     = false;
    this.detail_change      = false;
    this.touchscreen_change = false;
    
    this.flag_details_loaded = false;
    
    this.is_on_phone                    = false;
    this.is_on_phone_ping               = false;
    this.interval_on_phone_ping         = null;
    this.on_phone_call_id               = 0;
    this.is_phone_loading_first_ping    = false;
    
    this.flag_reload_communications = false;
    this.flag_reload_contact = false;
    this.flag_reload_details = false;
    
    this.flag_reload_contact_on_close = false;
    this.flag_reload_details_on_close = false;
    
    this.details_touchscreen_datepicker_settings = {
        onClose: function(dateText) {
            if ( dateText != "" ) {
                var temp = dateText.split('/');
                if ( typeof temp[0] != "undefined" && typeof temp[1] != "undefined" && typeof temp[2] != "undefined" ) {
                    $(this).val(temp[0]+'-'+temp[1]+'-'+temp[2]);
                }
            }
        }
    };
    
    this.start = function () {
        that.on_phone();
        that.reload_details();
    
        //TEMP DUP CHECK BUTTON
        $('button#temp_dup_check_button').on("click", function () {
            $.prompt('Dupe Check Activated!');
            $.get(
                "/php/ajax.php?ref=temp_dup_check_this&customer_id="+that.cust_id+"&account_id="+that.account_id,
                    function ( data ) {
                        //do nothing
                    }
            );
        });
        
        $('button#incoming_yes').on('click',function(){
            that.on_phone_toggle(false);
            that.switch_landing_display();
        });
        
        $('button#incoming_no').on('click',function(){
            that.switch_landing_display();
        });

        $('button#mdm_visited').on('click',function(){
            that.add_task(36);
            that.switch_landing_display();
        });
        $('button#mdm_called').on('click',function(){
            that.add_task(37);
            that.switch_landing_display();
        });
        $('button#mdm_no').on('click',function(){
            that.switch_landing_display();
        });

        that.binds_on();
        that.get_shipping_time();
        that.on_view();
    }
    
    this.add_task = function(type_id){
        $.get( "/php/ajax.php?ref=add_task&customer_id="+this.cust_id+"&account_id="+this.account_id+"&type_id="+type_id, function( data ) {
            tasks.reload(); 
        });
    }
    
    this.binds_on = function() {
        that.binds_on_communications();
        that.binds_on_contact();
        that.binds_on_details();
    }
    
    this.binds_on_communications = function() {
        $("#open_communications").on('click',function(){
            var state = $.bbq.getState();
            state.a = 'communications';
            delete state.b;
            
            $.bbq.pushState(state, 2);
        });
        
        $("#close_communcations").on('click',function(){
            var state = $.bbq.getState();
            delete state.a;
            delete state.b;
            
            $.bbq.pushState(state, 2);
        });
        
        $('#f_note_comment').autoResize();
        
        $('#f_note_submit_btn').on("click", function () {
            that.add_comm_note();
        });
        
        $('#full-communications .communications.priority').on("click",".star", function () {
            that.set_comm_priority( $(this).closest('.communication').find('.comm_note_id').val(), 
                                    $(this).closest('.communication'),0);

        });
        
        $('#full-communications .communications.default').on("click",".star", function () {
            that.set_comm_priority( $(this).closest('.communication').find('.comm_note_id').val(), 
                                    $(this).closest('.communication'),1);
        });
    }
    
    this.binds_on_contact = function() {
        that.customer_change = false;
        that.contact_change = false;
        that.flag_reload_contact_on_close = false;
        
        $("#open_contact").on('click',function(){
            var state = $.bbq.getState();
            state.a = 'contact';
            delete state.b;
            
            $.bbq.pushState(state, 2);
        });
        
        $("#close_contact").on('click',function(){
            var state = $.bbq.getState();
            delete state.a;
            delete state.b;
            delete state.id;
            
            $.bbq.pushState(state, 2);
        });
        
        $('#full-contact .recent_updates .expand').click(function () {
            var state = $.bbq.getState();
            state.b = 'recent_updates';
            $.bbq.pushState(state, 2);
        });
        
        //UPDATE CUSTOMER BUTTON
        $('button#f_company_update_btn').on("click", function () {
            that.set_customer();
        });
        
        //UPDATE CONTACT BUTTON
        $('button#f_contact_update_btn').on("click", function () {
            that.set_contact();
        });
        
        
        //TOGGLE ADD BUTTON
        $('button#f_contact_toggle_btn').on("click", function () {
            that.reset_contact();
            that.toggle_contact_display();
            that.on_add_contact = true;
        });
        
        //TOGGLE CANCEL BUTTON
        $('button#f_contact_cancel_btn').on("click", function () {
            that.toggle_contact_display();
            that.get_contact_info( $('.contacts .contact.selected').data('id') );
            that.on_add_contact = false;
        });
        
        //ADD CONTACT BUTTON
        $('button#f_contact_add_btn').on("click", function () {
            if (use_window_controller) {
                that.add_contact();
                that.toggle_contact_display();
            } else {
                that.add_contact();
                that.toggle_contact_display();
                that.on_add_contact = false;
            }
        });
        
        //DEL CONTACT BUTTON
        $('button#f_contact_del_btn').on("click", function () {
            that.del_contact();
        });
        
        
        //CLICKING A CONTACT EVENT
        $('#full-contact .contacts').on("click", '.contact .name', function () {
            var cid = $(this).closest('.contact').data('id');
            $.bbq.pushState({id: cid}, 0);
        });
        
        //SHIPPING LABEL SELECT
        $('select#f_addr_label_box').on("change", function () {
            that.get_address_info($(this).val());
        });
        
        //UPDATE ADDRESS
        $('#f_address_update_btn').on("click", function () {
            that.set_address();
        });
        
        //ADD ADDRESS TOGGLE
        $('#f_address_toggle_btn').on("click", function () {
            that.toggle_address_display();
        });
        
        //CANCEL ADDRESS ADD TOGGLE
        $('#f_address_cancel_btn').on("click", function () {
            that.toggle_address_display();
        });
        
        //ADD ADDRESS BTN
        $('#f_address_add_btn').on("click", function () {
            that.add_address();
        });
        
        //DELL ADDRESS BTN
        $('#f_address_del_btn').on('click', function () {
            that.del_address();
        });
        
        //REFRESH FISHBOWL BTN
        $('#last_sync_fishbowl_refresh').on('click', function () {
            that.sync_with_fishbowl();
        });
        
        //CHANGE DETECTION
        $('#full-contact .company :input').not('#f_addr_label_box').change(function () {
            that.customer_change = true;
        });
        
        $('button#mini_contact_email_btn').on('click',function (){
            $.bbq.pushState("email[email_type]=1", 0);
        });
        
        $('#full-contact .people :input').change(function () {
            that.contact_change = true;
        });
        
        //mini click to call button
        $('button#m_click_to_call').on("click",function(){
            that.ctc_prompt();
        });
        
        //onload action
        try {
            $('#f_contact_work')        .val( format_10_digit( $('#f_contact_work').val() ));
            $('#f_contact_mobile')      .val( format_10_digit( $('#f_contact_mobile').val() ));
            $('#f_contact_fax')         .val( format_10_digit( $('#f_contact_fax').val() ));
            $('#f_contact_main')        .val( format_10_digit( $('#f_contact_main').val() ));
        } catch(err) {
            //do nothing, values are not there per big customers with contacts disabled
        }
    }
    
    this.binds_on_details = function() {
        that.detail_change = false;
        that.touchscreen_change = false;
        that.flag_details_loaded = false;
        that.flag_reload_details_on_close = false;

        $("#open_details").on('click',function(){
            var state = $.bbq.getState();
            state.a = 'details';
            delete state.b;
            
            $.bbq.pushState(state, 2);
        });
        
        $("#close_details").on('click',function(){
            var state = $.bbq.getState();
            delete state.a;
            delete state.b;
            
            $.bbq.pushState(state, 2);
        });
        
        $('#full-details .recent_updates .expand').click(function () {
            var state = $.bbq.getState();
            state.b = 'recent_updates';
            $.bbq.pushState(state, 2);
        });
        
        $('#full-details .details textarea').autoResize({
            extraSpace: 28,
            onResize: function() {
                setTimeout(function() {
                    if (that.flag_details_loaded) {
                        var $container = $('#full-details .details');
                        $container.animate({scrollTop: '+=28px'}, 200);
                    }
                }, 200);
            }
        });
        
        setTimeout(function() {that.flag_details_loaded = true;}, 200);
        
        $('#full-details .details .groups_container .add').change(that.details_add_group);
        $('#full-details .details .groups_container .add').keydown(that.handle_select_keydown);
        $('#full-details .groups').on('click', '.group', that.details_remove_group);
        $('#f_details_update_btn').click(that.set_details);
        $('#f_details_screen_update_btn').click(that.set_screens);
        $('#f_details_screen_add_btn').click(that.get_touchscreen_form);
        $('#full-details .touchscreens .touchscreen .remove').click(that.del_touchscreen);
        
        $('#details_echeck_pdf_btn').click(function() {
            $('#details_echeck_file').unbind().val(null).change(function () {
                that.cust_ajax_file_upload('echeck');
            }).click();
        });

        $('#details_tax_exempt_pdf_btn').click(function () {
            $('#details_tax_exempt_file').unbind().val(null).change(function () {
                that.cust_ajax_file_upload('tax_exempt');
            }).click();
        });
        
        $('#full-details .details').on('change', ':input', function () {
            that.detail_change = true;
        });
        
        $('#full-details .showroom .touchscreens_container').on('change', ':input', function () {
            that.touchscreen_change = true;
        });
        
        $('#full-details .touchscreens .touchscreen:not(.prototype) .purchase_date').datepicker(that.details_touchscreen_datepicker_settings);
        
        $('#details_echeck_pdf_rm_btn').on('click',function () {
            if ( $('#details_echeck_pdf').attr('href').split("/").length == 6 ) {
                $('#details_echeck_pdf').attr('href',$('#details_echeck_pdf').attr('href').split("/").slice(0,-1).join("/"));
                $('#details_echeck_pdf').html("");
                that.detail_change = true;
            }
        });
        
        $('#details_tax_exempt_pdf_rm_btn').on('click',function () {
            if ( $('#details_tax_exempt_pdf').attr('href').split("/").length == 6 ) {
                $('#details_tax_exempt_pdf').attr('href',$('#details_tax_exempt_pdf').attr('href').split("/").slice(0,-1).join("/"));
                $('#details_tax_exempt_pdf').html("");
                that.detail_change = true;
            }
        });     
        
        //REQUEST CHANGE BUTTOn
        $('button#f_details_request_change_btn').on('click', function() {
            that.request_change();
        });
    }
    
    this.binds_off = function() {
        that.binds_off_communications();
        that.binds_off_contact();
        that.binds_off_details();
    }
    
    this.binds_off_communications = function() {
        $("#open_communications").off();
        $("#close_communcations").off();
        $('#f_note_submit_btn').off();
        $('.communications.priority').off();
        $('.communications.default').off();
    }
    
    this.binds_off_contact = function() {
        $("#open_contact").off();
        $("#close_contact").off();
        $('#full-contact .recent_updates .expand').off();
        $('button#f_company_update_btn').off();
        $('button#f_contact_update_btn').off();
        $('button#f_contact_toggle_btn').off();
        $('button#f_contact_cancel_btn').off();
        $('button#f_contact_add_btn').off();
        $('button#f_contact_del_btn').off();
        $('div.contacts').off();
        $('#full-contact .contacts').off();
        $('select#f_addr_label_box').off();
        $('#f_address_update_btn').off();
        $('#f_address_toggle_btn').off();
        $('#f_address_cancel_btn').off();
        $('#f_address_add_btn').off();
        $('#f_address_del_btn').off();
        $('#last_sync_fishbowl_refresh').off();
        $('div.full_split div.contact_left').off();
        $('div.full_split div.contact_right').off();
        $('button#mini_contact_email_btn').off();
        $('button#m_click_to_call').off();
    }
    
    this.binds_off_details = function() {
        $("#open_details").off();
        $("#close_details").off();
        $('button#f_details_request_change_btn').off();
        $('#full-details .recent_updates .expand').off();
        $('#f_details_update_btn').off();
        $('#full-details .details .groups_container .add').off();
        $('#full-details .groups').off();
        $('#f_details_screen_update_btn').off();
        $('#f_details_screen_add_btn').off();
        $('#full-details .touchscreens .touchscreen .remove').off();
        $('#full-details .details').off();
        $('#full-details .showroom .touchscreens_container').off();
        $('#details_echeck_pdf_btn').off();
        $('#details_echeck_file').off();
        $('#details_tax_exempt_pdf_btn').off();
        $('#details_tax_exempt_file').off();
    }
    
    this.ctc_prompt = function() {
        var phone_number = $('#m_contact_phone').html();
        //get information about phone call from database
        var $info = $.parseJSON(that.ctc(phone_number,"get_phone_number"));
        var task_state = $.bbq.getState().task_form;
        var dialog_states = {
            state0: {
                html:'Would you like to call '+phone_number+'?',
                buttons: { Reset: 2,Cancel: 0, Call: 1},
                focus: 2,
                submit: function(e,v,m,f){
                    if(v ==1){
                        e.preventDefault();
                        
                        $call_return = $.parseJSON(that.ctc(phone_number,'call'));
                        if ( $call_return.error != "" ) {
                            that.ctc_error_prompt($call_return);
                        } else if ( $info ) {
                            //means a task is open and they are calling for it!
                            if ( task_state != "" && typeof task_state != "undefined" ) {
                                tasks.add_phone_log('CTC '+phone_number,0);
                                tasks.reload_comm_log();
                            }
                            $.prompt.close();   
                        } else {
                            $.prompt.goToState('state1');
                        }
                    } else if ( v == 2 ) {
                        e.preventDefault();
                        that.ctc(phone_number,'reset',0,0);
                        $.prompt.close();
                        that.ctc_prompt();
                    } else {
                        $.prompt.close();
                    }
                }
            },
            state1: {
                html:'Calling as a long distance number, is this working?',
                buttons: { No: false, Yes: true },
                focus: 1,
                submit: function(e,v,m,f){
                    if(v){
                        that.ctc(phone_number,'update',0,0);
                        //means a task is open and they are calling for it!
                        if ( task_state != "" && typeof task_state != "undefined" ) {
                            tasks.add_phone_log('CTC '+phone_number,0);
                            tasks.reload_comm_log();
                        }
                        $.prompt.close();
                    } else {
                        e.preventDefault();
                        that.ctc(phone_number,'update',1,0);
                        $.prompt.goToState('state2');
                        return false;
                    }
                }
            },
            state2: {
                html:'Please hang up the phone, and click Call to try again as a local number.',
                buttons: { Call: true },
                focus: 0,
                submit: function(e,v,m,f){
                    if(v){
                        e.preventDefault();
                        $call_return = $.parseJSON(that.ctc(phone_number,'call'));
                        if ( $call_return.error != "" ) {
                            that.ctc_error_prompt($call_return);
                        } else {
                            $.prompt.goToState('state3');   
                        }
                    }
                }
            },
            state3: {
                html:'Calling as a local number, is this working?',
                buttons: { No: false, Yes: true },
                focus: 1,
                submit: function(e,v,m,f){
                    if(v){
                        //means a task is open and they are calling for it!
                        if ( task_state != "" && typeof task_state != "undefined" ) {
                            tasks.add_phone_log('CTC '+phone_number,0);
                            tasks.reload_comm_log();
                        }
                        $.prompt.close();
                    } else {
                        e.preventDefault();
                        that.ctc(phone_number,'update',1,1);
                        $.prompt.goToState('state4');
                    }
                }
            },
            state4: {
                html:'It appears this is a bad phone number.  Would you like to reset the dialing rules and try again?',
                buttons: { No: false, Yes: true },
                focus: 1,
                submit: function(e,v,m,f){
                    if(v){
                        e.preventDefault();
                        that.ctc(phone_number,'reset',0,0);
                        $.prompt.close();
                        that.ctc_prompt();
                    } else {
                        $.prompt.close();
                    }
                }
            },
        }
            
        if ( $info && $info['is_bad'] == 1 ) {
            $.prompt(dialog_states,{ initialState: 'state4' });
        } else {
            $.prompt(dialog_states);
        }

    }
    
    this.ctc_error_prompt = function(err){
        $.prompt(err.error, {
            buttons: { "Okay":true },
            submit: function(e,v,m,f){
                if(v){
                    e.preventDefault();
                    $.prompt.close();
                    $.prompt.close();
                }
            }
        });
    }
    
    // ACTIONS:  call, update, update_call,number_exists
    this.ctc = function(phone_number,action,is_local,is_bad){
        var setting             = {};
        setting.phone_number    = phone_number;
        setting.action          = action;
        setting.is_local        = is_local;
        setting.is_bad          = is_bad;
        return $.ajax({
            url         : '/php/ajax.php?ref=click_to_call',
            dataType    : 'text',
            data        : setting,
            type        : 'POST',
            async       : false
        }).responseText;
    }
    
    this.request_change = function () {
        this.request_change_click_fix = false;
        var phone_settings = {
            state0: {
                title: 'Customer Followup',
                html: '<label>Reason for no followup:</label><br><textarea name="tform_reason" id="tform_reason" value=""></textarea>',
                buttons: { Save:true, Cancel:false },
                submit: function (e,v,m,f) {                    
                    if ( v == true ) {
                        if ( !that.request_change_click_fix ) {
                            that.set_request_change(f.tform_reason);
                            that.request_change_click_fix   = true;
                        }
                    } else if ( v == false ) {
                        //do nothing
                    }
                }
            }
        };
        $.prompt(phone_settings);
    };
    
    this.set_request_change = function (reason) {
        var request = {};
        request.reason      = reason;
        request.customer_id = that.cust_id;
        $.ajax({
            url        : '/php/ajax.php?ref=customer_request_followup_change',
            dataType   : 'text',
            data       : request,
            type       : 'POST',
            success   : function () {
                tasks.reload();
            },
            error: function ( data ) {
                $.prompt('Error, please try again.');
            }
        });
    }
    
    this.set_comm_priority = function ( id, ele, priority ) {
        $.get(
            "/php/ajax.php?ref=set_comm_note_priority&id="+id+"&priority="+priority, 
            that.reload_communications
        );
    }
    
    this.select_contact = function(id) {
        that.get_contact_info( id );
        if ( that.on_add_contact == true ) {
            that.toggle_contact_display();
            that.on_add_contact = false;
        }
    }
    
    this.switch_landing_display = function(){
        $('#customer_screen').children('div.primary.landing').addClass('hide');
        $('#customer_screen').children('div.primary.data').removeClass('hide');
        window.history.replaceState(history.state, "SinkNet", document.location.search.replace("&landing=1",""));       
        orderhistory.build_sales_graph();
        
        //all buttons should then be off because the screen should never appear again!
        $('button#incoming_yes').off();
        $('button#incoming_no').off();
        $('button#mdm_visited').off();
        $('button#mdm_called').off();
        $('button#mdm_no').off();
    }
    
    this.toggle_contact_display = function () {
        $('div#f_normal_btns').toggle();
        $('div#f_add_btns').toggle();
    }
    
    this.toggle_address_display = function (id) {
        $('div#address_reg_buttons').toggle();
        $('div#address_add_buttons').toggle();
        if ( $('select#f_addr_label_box').prop('disabled') == true ) {
            $('select#f_addr_label_box').prop('disabled',false);
            if ( id ) {
                that.get_address_info(id);
            } else {
                if ( $('#f_addr_label_box').val() != null){
                    that.get_address_info($('#f_addr_label_box').val());
                }
            }
        } else {
            $('select#f_addr_label_box').prop('disabled',true);
            that.reset_address();
        }
    }
    
    this.add_comm_note = function () {
        if ( double_click_check() ) { return false; }
        var note = {};
        
        note.customer_id    = that.cust_id;
        note.username       = that.display_name;
        note.account_id     = that.account_id
        note.comment        = $('textarea#f_note_comment').val();
        note.is_priority    = that.set_checked_value('f_note_is_priority');
        
        $.ajax({
            url        : '/php/ajax.php?ref=add_comm_note',
            dataType   : 'text',
            data       : note,
            type       : 'POST',
            success   : function ( data ) {
                $.prompt(set_loading_screen('Added Note',true));
                that.reload_communications();
            },
            error: function ( data ) {
                setTimeout(function(){$.prompt.goToState('state2')},2000);
            },
            complete: function ( data ) {
                dc_prevent = false;
            }
        });
    }
    
    this.add_contact = function () {
        if ( double_click_check() ) { return false; }
        var contact = {};
        
        contact.company_name            = $('input#f_customer_name').val();
        contact.contact_name            = $('input#f_contact_name').val();
        contact.contact_email           = $('input#f_contact_email').val();
        contact.contact_title           = $('input#f_contact_title').val();
        contact.contact_work_number     = $('input#f_contact_work').val();
        contact.contact_work_ext        = $('input#f_contact_work_ext').val();
        contact.contact_mobile_number   = $('input#f_contact_mobile').val();
        contact.contact_mobile_ext      = $('input#f_contact_mobile_ext').val();
        contact.contact_fax_number      = $('input#f_contact_fax').val();
        contact.contact_main_number     = $('input#f_contact_main').val();
        contact.contact_main_ext        = $('input#f_contact_main_ext').val();
        contact.contact_mobile_number   = $('input#f_contact_mobile').val();
        contact.contact_mobile_ext      = $('input#f_contact_mobile_ext').val();
        contact.primary_contact         = $('#f_contact_primary').val();
        contact.send_invoice            = $('#f_contact_invoice').val();
        contact.customer_id             = that.cust_id;
        contact.display_name            = that.display_name;
        contact.account_id              = that.account_id;

        $.prompt(set_loading_screen('Contact Added'));
        $.ajax({
            url        : '/php/ajax.php?ref=add_contact',
            dataType   : 'text',
            data       : contact,
            type       : 'POST',
            success   : function ( data ) {
                data = JSON.parse(data);
                $('#f_contact_id').val(data['id']);
                
                var $contact = $('<tr class="contact"><td class="name"><span class="value"></span></td><td class="title"></td><td class="email_invoice"></td></tr>');
                $('#full-contact .contacts tbody').append($contact);
                
                $contact.attr('data-id', data['id']);
                $contact.find('.name .value').html(contact.contact_name);
                $contact.find('.title').html(contact.contact_title);
                if (contact.primary_contact == "1") {
                    $('#f_contact_primary').prop('disabled',true);
                    $('#full-contact .contacts .contact .star').remove();
                    $contact.find('.name').append('<img src="/images/star_selected.png" class="star" />');
                }
                if (contact.send_invoice == "1") {
                    $contact.find('.email_invoice').html('<img src="/images/check.png" />');
                }
                
                $.bbq.pushState({id: data['id']}, 0);
                
                recent_updates.get_recent_updates();
                that.on_add_contact = false;
                that.contact_change = false;
                
                that.flag_reload_contact_on_close = true;
                tasks.refresh_must_email_for_task();
                
                setTimeout(function(){$.prompt.goToState('state1')},1000);
            },
            error: function ( data ) {
                setTimeout(function(){$.prompt.goToState('state2')},1000);
            },
            complete: function ( data ) {
                dc_prevent = false;
            }
        }); 
    }   
    
    this.add_address = function () {
        if ( double_click_check() ) { return false; }
        var addr = {};
        
        addr.customer_id            = that.cust_id;
        addr.fishbowl_id            = that.fishbowl_id;
        addr.display_name           = that.display_name;
        addr.account_id             = that.account_id;
        addr.addr_label             = $('#f_addr_label').val();
        addr.addr_address           = $('#f_addr_address').val();
        addr.addr_city              = $('#f_addr_city').val();
        addr.addr_state             = $('#f_addr_state').val();
        addr.addr_zipcode           = $('#f_addr_zipcode').val();
        
        $.ajax({
            url        : '/php/ajax.php?ref=add_address',
            dataType   : 'text',
            data       : addr,
            type       : 'POST',
            success   : function ( data ) {
                $('#f_addr_label_box').append('<option value="'+data+'">'+addr.addr_label+'</option>');
                $('#f_addr_label_box').val(data);
                that.toggle_address_display(data);
            
                recent_updates.get_recent_updates();
                that.contact_change = false;
                that.flag_reload_contact_on_close = true;
                $.prompt(set_loading_screen('Address Added',true));
            },
            error: function ( data ) {
                setTimeout(function(){$.prompt.goToState('state2')},2000);
            },
            complete: function ( data ) {
                dc_prevent = false;
            }
        });
        
    }
        
    //universal function for adding groups/bus types from the select box
    this.add_value_from_select = function ($ele,is_old ) {
        if (!$ele.val()) {return;}
        if ( is_old ) { is_old = ""; } else { is_old = "new"; }
        $($ele).siblings('div').append("<button class='fixed "+is_old+"' type='button' value='"+$($ele).val()+"'>"+$($ele).children('option:selected').text()+"</button>")
        $($ele).children('option:selected').remove();
        that.detail_change = true;
    }
    
    this.del_value_to_select = function ($this) {
        $($this).parent('div').siblings('select').append("<option value='"+$($this).attr('value')+"'>"+$($this).html()+"</option>");
        $($this).remove();
        that.detail_change = true;
    }
    
    this.details_add_group = function() {
        var $add = $(this);
        var $option = $add.find('option:selected').last();
        var $groups_container = $add.closest('.groups_container');
        var $groups = $groups_container.find('.groups');
        
        var id = $option.data('id');
        var label = $option.data('label');
        var exclusive = $option.data('exclusive')
        
        if (!!exclusive) {
            $groups.find('.group').click();
            $add.prop('disabled', true);
        }
        
        var found = false;
        $groups.find('.group').each(function() {
            if ($(this).data('id') == id) {
                found = true;
                return false;
            }
        });
        
        if (!found) {
            var $group = $('<div class="group" title="Click to remove."></div>').html(label).attr({
                'data-id': id,
                'data-label': label,
                'data-exclusive': exclusive
            });
            $groups.append($group);
        }
        
        $option.remove();
        $add[0].selectedIndex = 0;
        
        that.details_change = true;
    }
    
    this.details_remove_group = function() {
        var $group = $(this);
        var $groups = $(this).closest('.groups');
        var $groups_container = $groups.closest('.groups_container');
        var $add = $groups_container.find('.add');
        
        var id = $group.data('id');
        var label = $group.data('label');
        var exclusive = $group.data('exclusive');
        
        if (!!exclusive) {
            $add.prop('disabled', false);
        }
        
        var $option = $('<option />').html(label).attr({
            'data-id': id,
            'data-label': label,
            'data-exclusive': exclusive,
            'value': id
        });
        
        $add.append($option);
        $group.remove();
        
        that.details_change = true;
    }
    
    this.del_contact = function () {
        var contact_id = $('#f_contact_id').val();
        
        //HOTFIX, rendering some of the code in this $.prompt useless, will fix on next re-code
        if ( !!$('#full-contact .contacts .contact').filter(function() {return $(this).data('id') == contact_id;}).find('.star').length ) {
            $.prompt("Please set another conact as the primary contact before deleting this conact.");
        } else {
            $.prompt("Are you sure you want to delete this contact?", {
                buttons: { "Yes, Delete": true, "No": false },
                overlayspeed: "fast",
                submit: function(e,v,m,f){
                    // use e.preventDefault() to prevent closing when needed or return false. 
                    //e.preventDefault(); 
                    if ( v === true ) {
                        $.ajax({
                            url: "/php/ajax.php?ref=del_contact&contact_id="+contact_id+"&account_id="
                                 +that.account_id+"&cust_id="+that.cust_id,
                            type: 'GET',
                            success: function ( data ) {
                                
                                var $contact = $('#full-contact .contacts .contact').filter(function() {return $(this).data('id') == contact_id;});
                                var was_primary = !!$contact.find('.star').length;
                                $contact.remove();
                                
                                $default_contact = $('#full-contact .contacts .contact').first();
                                if ($default_contact.length) {
                                    if (was_primary) {
                                        $default_contact.find('.name').append('<img src="/images/star_selected.png" class="star" />');
                                    }
                                    $.bbq.removeState('id');
                                    $.bbq.pushState({id: $default_contact.data('id')}, 0);
                                } else {
                                    var state = $.bbq.getState();
                                    delete state.id;
                                    $.bbq.removeState('id');
                                    that.reset_contact();
                                }
                                
                                that.flag_reload_contact_on_close = true;
                                recent_updates.get_recent_updates();
                                
                            },
                            error: function ( data ) {
                            }
                        });
                    }
                }
            });
        }
    }
    
    this.del_address = function () {
        if ( double_click_check() ) { return false; }
        
        var addr_id = $('#f_addr_label_box').val();
        
        if ( addr_id == null ) { dc_prevent = false;return false;  }
        
        $.prompt("Are you sure you want to delete this address?", {
            buttons: { "Yes, Delete": true, "No": false },
            overlayspeed: "fast",
            submit: function(e,v,m,f){
                // use e.preventDefault() to prevent closing when needed or return false. 
                // e.preventDefault(); 
                if ( v === true ) {
                    $.ajax({
                        url: "/php/ajax.php?ref=del_address&addr_id="+addr_id+"&account_id="
                             +that.account_id+"&cust_id="+that.cust_id,
                        type: 'GET',
                        success: function ( data ) {
                            $('#f_addr_label_box option:selected').remove();
                            $('#f_addr_label_box').prop('selectedIndex', 0);
                            if ( $('#f_addr_label_box').val() != null){
                                that.get_address_info( $('select#f_addr_label_box').val());
                            } else {
                                that.reset_address();
                            }
                            that.flag_reload_contact_on_close = true;
                            recent_updates.get_recent_updates();
                        },
                        error: function ( data ) {
                        },
                        complete: function () {
                            dc_prevent = false;
                        }
                    });
                }
            }
        });
    }
    
    this.del_touchscreen = function() {
        $(this).closest('.touchscreen').remove();
        that.touchscreen_change = true;
    }
            
    this.get_contact_info = function (contact_id) { 
        return $.get(
            "/php/ajax.php?ref=get_contact_info&id="+contact_id, 
                function( data ) {                  
                    $('#f_contact_name')        .val( data['name'] );
                    $('#f_contact_email')       .val( data['email'] );
                    $('#f_contact_title')       .val( data['title'] );
                    $('#f_contact_work')        .val( format_10_digit(data['work_number']) );
                    $('#f_contact_work_ext')    .val( data['work_ext'] );
                    $('#f_contact_mobile')      .val( format_10_digit(data['mobile_number']));
                    $('#f_contact_mobile_ext')  .val( data['mobile_ext']);
                    $('#f_contact_fax')         .val( format_10_digit(data['fax_number']) );
                    $('#f_contact_main')        .val( format_10_digit(data['main_number']) );
                    $('#f_contact_main_ext')    .val( data['main_ext'] );
                    $('#f_contact_invoice')     .val( data['send_invoice'] );
                    $('#f_contact_id')          .val( data['id'] );
                    $('select#f_contact_primary').val(data['primary']);
                    if ( data['primary'] == 1 ) {
                        $('select#f_contact_primary').prop('disabled', true);
                    } else {
                        $('select#f_contact_primary').prop('disabled', false);
                    }

                    $('#full-contact .contacts .contact.selected').removeClass('selected');
                    $('#full-contact .contacts .contact').filter(function() {return $(this).data('id') == contact_id;}).addClass('selected');
                    
                    that.contact_change = false;
                },
            "json"
        ).promise();
    }
    
    this.get_address_info = function (id) {
        $.get(
            "/php/ajax.php?ref=get_address&id="+id,
                function ( data ) {
                    data = JSON.parse(data);
                    $('#f_addr_label').val( data['address_nickname'] );
                    $('#f_addr_address').val( data['address'] );
                    $('#f_addr_city').val( data['city'] );
                    $('#f_addr_state').val( data['state'] );
                    $('#f_addr_zipcode').val( data['zipcode'] );
                    that.customer_change    = false;
                    that.get_address_shipping_time();
                }
        );
    }
    
    this.get_touchscreen_form = function () {
        var $touchscreens = $('#full-details .touchscreens');
        var $touchscreen = $('#full-details .touchscreens .touchscreen.prototype').clone(true, true);
        
        var id = super_random();
        
        $touchscreen.removeClass('prototype');
        
        $touchscreen.find('label').each(function() {this.htmlFor += id;});
        $touchscreen.find(':input').each(function() {this.id += id;});
        $touchscreen.find('.purchase_date').datepicker(that.details_touchscreen_datepicker_settings);

        $touchscreens.append($touchscreen).scrollTop($touchscreens[0].scrollHeight);
        
        that.touchscreen_change = true;
    }
    
    this.get_shipping_time = function () {
        $.get(
            "/php/ajax.php?ref=get_shipping_time&city="+$('#f_customer_city').val()
            +"&state="+$('#f_customer_state').val()+"&zipcode="+$('#f_customer_zipcode').val(), 
                function( data ) {                  
                    if ( data.length == 1 ) {
                        $('#m_shipping_time').html(data+" day(s)");
                    } else {
                        $('#m_shipping_time').html(data);
                    }
                }
        );
    }
    
    this.on_view = function () {
        $.get(
            "/php/ajax.php?ref=on_view&customer_id="+that.cust_id+"&account_id="+that.account_id,
                function () {}
        );
    }
    
    this.get_address_shipping_time = function () {
        $.get(
            "/php/ajax.php?ref=get_shipping_time&city="+$('#f_addr_city').val()
            +"&state="+$('#f_addr_state').val()+"&zipcode="+$('#f_addr_zipcode').val(), 
                function( data ) {                  
                    if ( data.length == 1 ) {
                        $('#f_addr_transit_time').html(data+" day(s)");
                    } else {
                        $('#f_addr_transit_time').html(data);
                    }
                }
        );
    }
    
    this.set_address = function () {
        if ( double_click_check() ) { return false; }
        var addr = {};
        
        addr.id                     = $('#f_addr_label_box').val();
        if ( addr.id== null ) { dc_prevent = false;return false; }
        addr.customer_id            = that.cust_id;
        addr.display_name           = that.display_name;
        addr.account_id             = that.account_id;
        addr.addr_label             = $('#f_addr_label').val();
        addr.addr_address           = $('#f_addr_address').val();
        addr.addr_city              = $('#f_addr_city').val();
        addr.addr_state             = $('#f_addr_state').val();
        addr.addr_zipcode           = $('#f_addr_zipcode').val();
        
        $.ajax({
            url        : '/php/ajax.php?ref=set_address',
            dataType   : 'text',
            data       : addr,
            type       : 'POST',
            success   : function ( data ) {
                $('#f_addr_label_box option:selected').html(addr.addr_label);
            
                recent_updates.get_recent_updates();
                that.contact_change = false;
                that.flag_reload_contact_on_close = true;
                $.prompt(set_loading_screen('Address Saved',true));
                that.get_address_shipping_time();
            },
            error: function ( data ) {
                setTimeout(function(){$.prompt.goToState('state2')},2000);
            },
            complete: function ( data ) {
                dc_prevent = false;
            }
        });
    }
    
    this.set_contact = function () {
        if ( double_click_check() ) { return false; }
        if ( $('#f_contact_id').val() == 0 ) {
            $.prompt('Please add a contact to the account.');
            dc_prevent = false;
            return false;
        }
        var contact = {};
        
        contact.company_name        = $('#f_customer_name').val();
        contact.contact_name        = $('#f_contact_name').val();
        contact.contact_email       = $('#f_contact_email').val();
        contact.contact_title       = $('#f_contact_title').val();
        contact.contact_work_number = $('#f_contact_work').val();
        contact.contact_work_ext    = $('#f_contact_work_ext').val();
        contact.contact_mobile_number = $('#f_contact_mobile').val();
        contact.contact_mobile_ext = $('#f_contact_mobile_ext').val();
        contact.contact_fax_number  = $('#f_contact_fax').val();
        contact.contact_main_number = $('#f_contact_main').val();
        contact.contact_main_ext    = $('#f_contact_main_ext').val();
        contact.primary_contact     = $("select#f_contact_primary").val();
        contact.send_invoice        = $("select#f_contact_invoice").val();
        contact.id                  = $('#f_contact_id').val();
        contact.display_name        = that.display_name;
        contact.customer_id         = that.cust_id;
        contact.account_id          = that.account_id;
        
        $.prompt(set_loading_screen('Contact Saved'));
        $.ajax({
            url        : '/php/ajax.php?ref=set_contact',
            dataType   : 'text',
            data       : contact,
            type       : 'POST',
            success   : function ( data ) {
                
                var $contact = $('#full-contact .contacts .contact').filter(function() {return $(this).data('id') == contact.id;});
                
                $contact.find('.name .value').html(contact.contact_name);
                $contact.find('.title').html(contact.contact_title);
                if (contact.primary_contact == "1") {
                    $('#f_contact_primary').prop('disabled',true);
                    $('#full-contact .contacts .contact .star').remove();
                    $contact.find('.name').append('<img src="/images/star_selected.png" class="star" />');
                }
                if (contact.send_invoice == "1") {
                    $contact.find('.email_invoice').html('<img src="/images/check.png" />');
                } else {
                    $contact.find('.email_invoice').html('');
                }
                that.get_contact_info(contact.id);
                recent_updates.get_recent_updates();
                that.contact_change = false;
                that.flag_reload_contact_on_close = true;
                tasks.refresh_must_email_for_task();
                setTimeout(function(){$.prompt.goToState('state1')},1000);
            },
            error: function ( data ) {
                setTimeout(function(){$.prompt.goToState('state2')},1000);
            },
            complete: function ( data ) {
                dc_prevent = false;
            }
        });
    }
    
    this.set_customer = function () {
    
        if ( double_click_check() ) { return false; }
        var customer                = {};
        
        customer.name               = $('#f_customer_name').val();
        customer.website            = $('#f_customer_website').val();
        customer.main_address       = $('#f_customer_main_address').val();
        customer.city               = $('#f_customer_city').val();
        customer.state              = $('#f_customer_state').val();
        customer.zipcode            = $('#f_customer_zipcode').val();
        customer.fax_invoices       = $('#f_customer_fax_invoices').val();
        customer.not_send_invoices  = $('#f_customer_not_send_invoices').val();
        customer.display_name       = that.display_name;
        customer.customer_id        = that.cust_id;
        customer.account_id         = that.account_id;

        
        $.ajax({
            url        : '/php/ajax.php?ref=set_customer',
            dataType   : 'text',
            data       : customer,
            type       : 'POST',
            success   : function ( data ) {
                that.update_page_customer_info(customer);
                recent_updates.get_recent_updates();
                that.customer_change    = false;
                that.flag_reload_contact_on_close = true;
                $.prompt(set_loading_screen('Customer Information Saved',true));
                that.get_shipping_time();
            },
            error: function ( data ) {
                setTimeout(function(){$.prompt.goToState('state2')},2000);
            },
            complete: function ( data ) {
                dc_prevent = false;
            }
        });
    
    }
    
    this.set_details = function () {
        if ( double_click_check() ) { return false; }
        var details = {};
        
        details.mini_strings = ['','',''];
        details.bus_types           = [];
        details.competitor_types    = [];
        details.organization_types  = [];
        
        $('#full-details .details .groups .group').each(function() {
            var $group = $(this);
            var $groups = $group.parent();
            
            if ($groups.is('.business_types')) {
                details.bus_types.push($group.data('id'));
                details.mini_strings[0] += $group.data('label') + ", ";
            } else if ($groups.is('.competitors')) {
                details.competitor_types.push($group.data('id'));
                details.mini_strings[1] += $group.data('label') + ", ";
            } else if ($groups.is('.organizations')) {
                details.organization_types.push($group.data('id'));
                details.mini_strings[2] += $group.data('label') + ", ";
            }
        });
        
        details.mini_strings[0] = details.mini_strings[0].substring( 0, details.mini_strings[0].length - 2 );
        details.mini_strings[1] = details.mini_strings[1].substring( 0, details.mini_strings[1].length - 2 );
        details.mini_strings[2] = details.mini_strings[2].substring( 0, details.mini_strings[2].length - 2 );
        
        details.customer_id         = that.cust_id;
        details.display_name        = that.display_name;
        details.account_id          = that.account_id;
        details.pay_note            = $('#f_details_pay_note').val();
        details.ship_note           = $('#f_details_ship_note').val();
        details.discount_note       = $('#f_details_discount_note').val();
        details.want_newsletter     = $('#f_details_newsletter').val();
        details.has_echeck          = $('#f_details_echeck').val();
        
        //If this is set to use, force it to have a pdf attached!
        if ( $('#f_details_tax_exempt').val() == "1" && $('#details_tax_exempt_pdf').html() == "" ){
            $.prompt('Must attach Tax Exempt PDF before saving this as Yes.');
            dc_prevent = false;
            return false;
        }
        details.is_tax_exempt       = $('#f_details_tax_exempt').val();
        
        details.echeck_pdf_name     = $('a#details_echeck_pdf').attr('href').split('/ECheck-');
        if ( typeof details.echeck_pdf_name[1] != "undefined" ) {
            details.echeck_pdf_name     = "ECheck-"+details.echeck_pdf_name[1];
        } else { details.echeck_pdf_name        = ""; }
        
        details.tax_exempt_pdf_name = $('a#details_tax_exempt_pdf').attr('href').split('/Tax_Exempt-');
        if ( typeof details.tax_exempt_pdf_name[1] != "undefined" ) {
            details.tax_exempt_pdf_name = "Tax_Exempt-"+details.tax_exempt_pdf_name[1];
        } else { details.tax_exempt_pdf_name = ""; }
                
        $.prompt(set_loading_screen('Customer Details Saved'));

        $.ajax({
            url        : '/php/ajax.php?ref=set_details',
            dataType   : 'text',
            data       : details,
            type       : 'POST',
            success   : function ( data ) {
                recent_updates.get_recent_updates();
                that.detail_change = false;
                that.flag_reload_details_on_close = true;
                setTimeout(function(){$.prompt.goToState('state1')},1000);
            },
            error: function ( data ) {
                setTimeout(function(){$.prompt.goToState('state2')},1000);
            },
            complete: function ( data ) {
                dc_prevent = false;
            }
        });
    }
    
    this.set_screens = function () {    
        if ( double_click_check() ) { return false; }
        var details                 = {};
        
        details.customer_id         = that.cust_id;
        details.display_name        = that.display_name;
        details.account_id          = that.account_id;
        details.has_touchscreen     = $('#f_details_touchscreen').val();
        details.has_showroom        = $('#f_details_showroom').val();
        
        details.touchscreens        = [];
        $('#full-details .touchscreens .touchscreen').not('.prototype').each(function () {
            details.touchscreens.push({
                type_id: $(this).find('.type_id').val(),
                type: $(this).find('.type_id option:selected').eq(0).text(),
                screen_id: $(this).find('.screen_id').val(),
                purchase_date: $(this).find('.purchase_date').val(),
                id: $(this).data('id')
            });
        });
        
        $.ajax({
            url        : '/php/ajax.php?ref=set_screens',
            dataType   : 'text',
            data       : details,
            type       : 'POST',
            success   : function ( data ) {
                data = JSON.parse(data);
                $('.showroom_container .touchscreens .touchscreen').not('.prototype').each(function (i,v){
                    if ( $(v).data('id') == "new" ) {
                        $(v).data('id',data.pop());
                    }   
                });
                recent_updates.get_recent_updates();
                that.touchscreen_change = false;
                that.flag_reload_details_on_close = true;
                $.prompt(set_loading_screen('Customer Touchscreens Saved',true));
            },
            error: function ( data ) {
                setTimeout(function(){$.prompt.goToState('state2')},2000);
            },
            complete: function ( data ) {
                dc_prevent = false;
            }
        });
    }
    
    this.set_checked_value = function (id) {
        if ( $('#'+id).prop('checked') ) {
            return 1;
        } 
        return 0;
    }
    
    this.update_page_contact_names = function (contact) {
        $.each ( $('div.mini_rma_display').children('div.flex'), function (i,v) {
            if ( $(this).children('div.contact_id').html() == contact.id ) {
                $(this).children('span.col3').html(contact.contact_name);
            }
        });
        $.each ( $('div.contacts').children('div'), function (i,v) {
            if ( $(this).children('div.contact_id').html() == contact.id ) {
                $(this).children('div.left').children('span').html(contact.contact_name);
                $(this).children('div.right').html(contact.contact_title);
            }
        });
    }
    
    this.update_page_customer_info = function (customer) {
        $('#m_company_name').html(customer.name);
        $('div.left_menu div.section1 h2:first').html(customer.name);
        $('#m_phone').html(customer.phone);
        $('#m_phone2').html(customer.phone2);
        $('#m_city').html(customer.city);
        $('#m_state').html(customer.state);
    }
    
    this.reset_contact = function () {
        $('#f_contact_id').val('');
        $('#f_contact_name').val('');
        $('#f_contact_title').val('');
        $('#f_contact_primary').val('0');
        $('#f_contact_email').val('');
        $('#f_contact_main').val('');
        $('#f_contact_main_ext').val('');
        $('#f_contact_work').val('');
        $('#f_contact_work_ext').val('');
        $('#f_contact_mobile').val('');
        $('#f_contact_mobile_ext').val('');
        $('#f_contact_fax').val('');
        $('select#f_contact_primary').prop('disabled', false);
        $('#f_contact_invoice').val(0);
    }
    
    this.reset_address = function () {
        $('#f_addr_label').val('');
        $('#f_addr_address').val('');
        $('#f_addr_city').val('');
        $('#f_addr_state').val('');
        $('#f_addr_zipcode').val('');
    }
    
    this.cust_ajax_file_upload = function (type)
    {
        var ref = "";
        var file_name = "";
                
        if ( type == "tax_exempt" ) {
            var ref         = "tax_exempt";
            var file_name   = "details_tax_exempt_file";
        } else if ( type == "echeck" ) {
            var ref         = "echeck";
            var file_name   = "details_echeck_file";
        }
        $.ajaxFileUpload ({
                url:'/php/ajax.php?ref=upload_files&type='+ref
                +'&file_id='+file_name
                +'&cust_id='+that.cust_id,  
                secureuri:false,
                fileElementId: file_name,
                dataType: 'json',
                success: function (data)
                {
                    if ( data['error'] != "" ) {
                        $.prompt(data['error']);
                    } else {
                        var new_href        = "/uploads/customer/"+data['save_path']+data['file_name'];
                        if ( type == "tax_exempt" ) {
                            $('#details_tax_exempt_pdf').html('Tax_Exempt.pdf');
                            $('#details_tax_exempt_pdf').attr('href',new_href);                         
                        } else if ( type == "echeck" ) {
                            $('#details_echeck_pdf').html('ECheck.pdf');
                            $('#details_echeck_pdf').attr('href',new_href);
                        }
                    }
                    
                },
                error: function (data, status, e)
                {
                    $.prompt('Connection error to server, while saving. Please try again.');
                }
        });
        
        return false;
    };
    
    this.sync_with_fishbowl = function() {
        $('#last_sync_fishbowl').addClass('refreshing');
        $.ajax({
            url: '/php/ajax.php?ref=sync_with_fishbowl',
            data: {cust_id: that.cust_id},
            type: 'POST',
            success: function() {
                if ( that.customer_change || that.contact_change ) {
                    $.prompt("You haven't finished saving, would you like to stay on this page?", save_check_prompt(function() {that.reload_contact();}, function() {$('#last_sync_fishbowl').html('Sync complete. Please refresh the page.');}));
                } else {
                    that.reload_contact();
                    that.reload_details();
                }
            },
            error: function() {
                $('#last_sync_fishbowl').html('Error while syncing. Please try again.');
            }
        });
        
    }
    
    this.on_phone = function() {
        if ($('#is_phone').length && $('#on_phone_call_id').length) {
            that.on_phone_toggle($('#on_phone_call_id').val());
            if ($('#on_phone_tasks').length) {
                $.prompt('You have new tasks for this phone call.');
            }
        }
        $('.customer_on_phone_toggle').click(function() {that.on_phone_toggle(false);that.switch_landing_display();});
    }
    
    this.on_phone_toggle = function(on_phone_call_id_override) {
        if (that.is_phone_loading_first_ping) {
            return false;
        }
        if (that.is_on_phone) {
            return that.on_phone_end();
        }
        if (on_phone_call_id_override) {
            that.on_phone_call_id = on_phone_call_id_override;
            that.is_on_phone = true;
        }
        return that.on_phone_start();
    }
    
    this.on_phone_start = function() {
        $('.customer_on_phone_toggle').addClass('on').removeClass('off').attr('title','Click to hang up.');
        if (!that.is_on_phone) {that.on_phone_ping();}
        that.interval_on_phone_ping = setInterval(function() {that.on_phone_ping();}, 5000);
        that.is_on_phone = true;
        that.is_phone_loading_first_ping = true;
        return true;
    }
    
    this.on_phone_end = function() {
        $('.customer_on_phone_toggle').addClass('off').removeClass('on').attr('title','On the phone?');
        clearInterval(that.interval_on_phone_ping);
        that.interval_on_phone_ping = null;
        that.is_on_phone = false;
        that.on_phone_call_id = 0;
        return true;
    }
    
    this.on_phone_ping = function() {
        if (that.is_on_phone_ping) {return;}
        
        that.is_on_phone_ping = true;
        $.ajax({
            url: '/php/ajax.php?ref=customer_on_phone',
            data: {cust_id: that.cust_id, call_id: that.on_phone_call_id},
            type: 'GET',
            success: function(data) {
                data = $.parseJSON(data);
                that.on_phone_call_id = data.call_id;
                that.is_phone_loading_first_ping = false;
                if (data.tasks) {
                    $.prompt('You have new tasks for this phone call.');
                    tasks.reload();
                } else if (data.task_id > tasks.last_id) {
                    tasks.reload();
                }
            },
            complete: function() {
                that.is_on_phone_ping = false;
            }
        });
    }
    
    this.handle_select_keydown = function(e) {
        var $this = $(this);
        
        e.preventDefault();
        e.stopImmediatePropagation();
        switch (e.which) {
            case 13:
                $this.trigger('change');
                break;
            case 38:
                this.selectedIndex--;
                break;
            case 40:
                this.selectedIndex++;
                break;
            default:
                var selectedIndex = this.selectedIndex;
                var nextIndex = new Array();
                var foundIndex = 0;
                
                var regex = new RegExp('^'+String.fromCharCode(e.which), 'i');
                
                $this.find('option').each(function(index) {
                    var html = $(this).html();
                    if (html.match(regex)) {
                        nextIndex.push(index);
                        if (index == selectedIndex) {foundIndex = index;}
                    }
                });
                
                if (nextIndex.length) {
                    var newSelectedIndex = 0;
                    
                    if (!foundIndex) {
                        newSelectedIndex = nextIndex[0];
                    } else if (foundIndex == nextIndex[nextIndex.length - 1]) {
                        newSelectedIndex = nextIndex[0];
                    } else {
                        for (var i in nextIndex) {
                            if (nextIndex[i] > foundIndex) {
                                newSelectedIndex = nextIndex[i];
                                break;
                            }
                        }
                    }
                    
                    this.selectedIndex = newSelectedIndex;
                }
        }
        return false;
    }
    
    this.reload_communications = function() {
        if (that.flag_reload_communications) {return;}
        
        that.flag_reload_communications = true;
        $.ajax({
            url: '/php/ajax.php?ref=communications_reload',
            data: {cust_id: that.cust_id},
            success: function(data) {
                that.binds_off_communications();
                data = $.parseJSON(data);
                $('#full-communications_container').html(data.full);
                $('#mini-communications_container').html(data.mini);
                that.binds_on_communications();
                that.flag_reload_communications = false;
                window_controller.scrollbar_on('#full-communications_container, #mini-communications_container');
            }
        });
    }
    
    this.reload_contact_on_close = function() {
        if (that.flag_reload_contact_on_close) {
            that.flag_reload_contact_on_close = false;
            that.reload_contact();
            email.reload_page();
        }
    }
    
    this.reload_contact = function() {
        if (that.flag_reload_contact) {return;}
        
        that.flag_reload_contact = true;
        $.ajax({
            url: '/php/ajax.php?ref=contact_reload',
            data: {cust_id: that.cust_id},
            success: function(data) {
                that.binds_off_contact();
                data = $.parseJSON(data);
                $('#full-contact_container').html(data.full);
                $('#mini-contact_container').html(data.mini);
                that.binds_on_contact();
                recent_updates.get_recent_updates();
                that.flag_reload_contact = false;
                window_controller.scrollbar_on('#full-contact_container, #mini-contact_container');
            }
        });
    }
    
    this.reload_details_on_close = function() {
        if (that.flag_reload_details_on_close) {
            that.flag_reload_details_on_close = false;
            that.reload_details();
        }
    }
    
    this.reload_details = function() {
        if (that.flag_reload_details) {return;}
        
        that.flag_reload_details = true;
        $.ajax({
            url: '/php/ajax.php?ref=details_reload',
            data: {cust_id: that.cust_id},
            success: function(data) {
                that.binds_off_details();
                data = $.parseJSON(data);
                $('#full-details_container').html(data.full);
                $('#mini-details_container').html(data.mini);
                that.binds_on_details();
                recent_updates.get_recent_updates();
                that.flag_reload_details = false;
                window_controller.scrollbar_on('#full-details_container, #mini-details_container');
            }
        });
    }
    
    
//END CUSTOMER CLASS
}