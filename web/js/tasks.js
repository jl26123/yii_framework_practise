function tasks() {
	var that = this;
	
	this.cust_id			= $("input#customer_id").val();
	this.task_id			= 0;
	this.display_name		= $('#display_name').val();
	this.account_id			= $('#account_id').val();
	this.task_loading		= false;
	this.phone_click_fix	= false;
	this.form_change		= false;
	this.last_id			= 0;
	this.flag_reload		= false;
	this.flag_task_loaded	= false;
	this.yes_no_hide_arr	= [119];
	this.must_send_email_task_ids = false;

	this.start = function () {
		that.binds_on();
		
		//LAST ID
		$('.task input[task_id]').each(function() {
			var task_id = +$(this).attr('task_id');$
			if (task_id > that.last_id) {
				that.last_id = task_id;
			}
		});
		if ( that.must_send_email_task_ids === false) {that.must_send_email_task_ids = $('#task_form').data('must_email').split(",");}
		
		that.task_loading = $.Deferred().reject().promise();
		that.flag_task_loaded = false;
		
	};
	
	this.binds_on = function() {
		
		$("#open_tasks").on('click',function(){
			var state = $.bbq.getState();
			state.a = 'tasks';
			delete state.b;
			
			$.bbq.pushState(state, 2);
		});
		
		$("#close_tasks").on('click',function(){
			var state = $.bbq.getState();
			delete state.a;
			delete state.b;
			
			$.bbq.pushState(state, 2);
		});
	
		//START-RESUME-view BUTTON
		$('.tasks .task button').on('click', function(){
			if ( $(this).siblings('input').data('type_id') != 11
				&& $(this).siblings('input').data('type_id') != 12 ) {
				if ( $(this).html() == "Start" || $(this).html() == "Resume" ) {
					$.bbq.pushState({task_form: $(this).siblings('input').attr('task_id'), task_status: 1}, 2);
				} else {
					$.bbq.pushState({task_form: $(this).siblings('input').attr('task_id'), task_status: 0}, 2);
				}
			} else if ( $(this).siblings('input').data('type_id') == 11 ) {
				//$.bbq.pushState({email: { email_type: 2, invoice_id: $(this).siblings('input').data('extra_info1')}}, 2);
				$.bbq.pushState("email[email_type]=2&email[invoice_id]="+$(this).siblings('input').data('extra_info1'), 2);
			}
		});
		
		//PHONE BTN
		$('#task_form_container').on('click', '#task_form_phone_btn', function () {
			that.open_phone_dialog();
		});
		
		//EMAIL BTN
		$('#task_form_container').on('click', '#task_form_email_btn', function () {
			$.bbq.pushState("email[email_type]=1", 0);
		});
		
		//CALL BTN
		$('#task_form_container').on('click', '#task_form_call_btn', function () {
			cust.ctc_prompt();
		});
				
		//PAUSE BTN
		$('#task_form_container').on('click' ,'#task_form_pause_btn', function(){
			that.set_form_questions("Paused Task",false);
		});
		
		//CANCEL BTN
		$('#task_form_container').on('click', '#task_form_cancel_btn', function(){
			var state = $.bbq.getState();
			delete state.task_form;
			delete state.task_status;
			
			$.bbq.pushState(state, 2);
		});
		
		//FINISH BTN
		$('#task_form_container').on('click','.form div.finish button', function () {
			that.set_form_questions("Finished Task",true);
		});
		
		//TASK QUESTION INPUT TYPE 4 RADIOS click listener
		$('#task_form_container').on('click', '.form div.radios button', function () {
			that.set_multi_radio_value($(this));
		});
		
		//TASK QUESTION INPUT TYPE 5 GROUPS click listener
		$('#task_form_container').on('click', '.form div.groups button', function () {
			that.set_groups_value($(this),2);
		});
		
		//TASK QUESTION INPUT TYPE 6 GROUPS click listener
		$('#task_form_container').on('click', '.form div.bus_types button', function () {
			that.set_groups_value($(this),1);
		});
		
		
		//QUESTION 119 ON CHANGE for AUTO SHOW/ AUTO HIDE
		$.each ( that.yes_no_hide_arr, function (i,v) {
			$('#task_form_container').on('change','.form div.yes_no[question_id="'+v+'"] > select', function () {
				that.set_special_task_type_conditions();
			});
		});		
	};
	
	this.binds_off = function() {
		$("#open_tasks").off();
		$("#close_tasks").off();
		$('.tasks .task button').off();
		$('#task_form_container').off();
	};
	
	this.open_phone_dialog = function () {
		that.phone_click_fix	= false;
		var phone_settings = {
			state0: {
				title: 'Called Customer',
				html: '<table class="form"><tr><th><label for="jqim_tform_phone">Phone Number:</label></th><td><input type="text" name="tform_phone" id="jqim_tform_phone" /></td><td><label><input id="lvm_checkbox" type="checkbox" name="tform_voicemail" /> LVM?</label></td></tr><tr><th><label for="jqim_tform_email">E-mail Address:</label></th><td><input type="text" name="tform_email" id="jqim_tform_email" value="" /></td><td></td></tr></table>',
				buttons: { Save:true, Cancel:false },
				submit: function (e,v,m,f) {					
					if ( v == true ) {
						if ( !that.phone_click_fix ) {
							if ( f.tform_phone != "" ) {
								that.add_phone_log(f.tform_phone,f.tform_voicemail);
							}
							if ( f.tform_email != "" ) {
								that.add_email_log(f.tform_email);
							}
							that.phone_click_fix	= true;
						}
					} else if ( v == false ) {
						//do nothing
					}
				}
			}
		};
		$.prompt(phone_settings);
	};
		
	this.add_phone_log = function (phone,lvm) {
		var log = {};
		
		log.task_id		= $('#task_id').val();
		log.account_id	= $('#account_id').val();
		log.phone		= phone;
		log.lvm			= lvm;
		log.status_id	= $('#status_id').val();
		
		$.ajax({
			url        : '/php/ajax.php?ref=task_add_phone_log',
			dataType   : 'text',
			data       : log,
			type       : 'POST',
			success   : function ( data ) {
				that.reload();
				that.reload_comm_log();
			}
		});
		
	};
	
	this.add_email_log = function (email) {
		var log = {};
		
		log.task_id		= $('#task_id').val();
		log.account_id	= $('#account_id').val();
		log.email		= email;
		
		$.ajax({
			url        : '/php/ajax.php?ref=task_add_email_log',
			dataType   : 'text',
			data       : log,
			type       : 'POST',
			success   : function ( data ) {
				that.reload();
				that.reload_comm_log();
			}
		});
		
	}
	
	this.get_task_form = function (task_id,disable) {
		if ( that.task_loading.state() != 'pending') {
			that.task_id = task_id;
			$('button#task_form_pause_btn').show();
			$('#task_form .form').empty();
			$('#task_form .communications').empty();
			that.flag_task_loaded = false;
			that.task_loading = $.get(
				"/php/ajax.php?ref=get_task_form&task_id="+task_id+"&cust_id="+that.cust_id, 
					function( data ) {
						data = $.parseJSON(data);
						//console.log(data[1]);
						$('#task_form .form').html(data[0]);
						$('#task_form .communications').html(data[1]);
						that.open_task_form($('#task_type_id').val());
						if ( disable ) {
							$('button#task_form_pause_btn').hide();
						}
						$('#task_form .form textarea').autoResize({
							extraSpace: 28,
							onResize: function() {
								setTimeout(function() {
									if (that.flag_task_loaded) {
										var $container = $('#task_form .form');
										$container.animate({scrollTop: '+=28px'}, 200);
									}
								}, 200);
							}
							
						});
						that.set_special_task_type_conditions();
						setTimeout(function() {that.flag_task_loaded = true;}, 200);
					}
			).promise();
		}
		return that.task_loading.promise();
	}
	
	this.set_special_task_type_conditions = function (){
		var type_id = +$('#task_type_id').val();
		switch ( type_id ) {
			case 24:
				that.set_boolean_question_based_on_another_question(119,120,"NO");
			break;	
			case 25:
			case 27:
				that.set_current_tracking_status();
			break;
		}
		
	};
	
	this.set_current_tracking_status = function (){
		$.get(
			"/php/ajax.php?ref=get_tracking_raw&inv_id="+$('#task_invoice_id').html(), 
				function( data ) {
					data = $.parseJSON(data);
					$('div#task_load_the_status').html(data['status']);
				}
		);
	}
	
	this.set_boolean_question_based_on_another_question = function (prev_id,this_id,value){
		if ( $('#task_form .form > div.yes_no[question_id="'+prev_id+'"] > select').val() == value ) {
			$('#task_form .form > div.yes_no[question_id="'+this_id+'"]').show();
			$('#task_form .form > div.yes_no[question_id="'+this_id+'"]').attr('must_fill',1);	
		} else {
			$('#task_form .form > div.yes_no[question_id="'+this_id+'"]').hide();
			$('#task_form .form > div.yes_no[question_id="'+this_id+'"]').attr('must_fill',0);
		}
	}
	
	this.set_radio_value = function ( ele ) {
		$(ele).parent('div.options').siblings('input').val( $(ele).attr('value') );
		$.each ( $(ele).parent('div').siblings('div.options'), function (i,v) {
			$(this).children('button').removeClass('inverse');
		});
		$(ele).addClass('inverse');
		that.set_form_to_changed();
	};
	
	this.set_multi_radio_value = function ( ele ) {
		if ( $(ele).hasClass('inverse') ) {
			$(ele).removeClass('inverse');
			$(ele).parents('div.radios').children('input#'+$(ele).attr('value')).remove();			
		} else {
			$(ele).addClass('inverse');
			$(ele).parents('div.radios').append('<input id="'+$(ele).attr('value')+'" type="hidden" value="'+$(ele).attr('value')+'"></input>');
		}
		that.set_form_to_changed();
	}
	
	this.set_groups_value = function ( ele,type ) {
		if ( type == 1 ) { var the_class = "bus_types"; } else if ( type == 2 ) { var the_class = "groups"; }
		if ( $(ele).hasClass('inverse') ) {
			$(ele).removeClass('inverse');
			$(ele).parents('div.'+the_class).children('input#'+$(ele).attr('value')).remove();			
		} else if ( $(ele).hasClass('exclusive') ) {
			$(ele).parents('div.'+the_class).find('.inverse').each(function() {
				that.set_groups_value(this, type);
			});
			$(ele).addClass('inverse');
			$(ele).parents('div.'+the_class).append('<input id="'+$(ele).attr('value')+'" type="hidden" value="'+$(ele).attr('value')+'"></input>');
		} else {
			$(ele).parents('div.'+the_class).find('.inverse.exclusive').each(function() {
				that.set_groups_value(this, type);
			});
			$(ele).addClass('inverse');
			$(ele).parents('div.'+the_class).append('<input id="'+$(ele).attr('value')+'" type="hidden" value="'+$(ele).attr('value')+'"></input>');
		}
		that.set_form_to_changed();
	}
	
	this.set_form_questions = function (message,complete) {
		if ( double_click_check() ) { return false; }
		var nosave	= false;
		var flag_reload_details = false;
		var errors	= [];
		
		//if finish is clicked, let's make sure everything is filled in...
		if ( complete ) {
			$.each ( $('#task_form .form div'), function () {
				if ( $(this).attr('must_fill') == 1 ) {
					if ( $(this).hasClass('textarea') || ( $(this).hasClass('yes_no') &&  !$(this).hasClass('hide') ) ) {
						if ( $(this).children(':input').eq(0).val() == "" || $(this).children(':input').eq(0).val() == "CHOOSE" ) {
								nosave = true;
								errors.push($(this).children('p').eq(0).html());
						}
					} else if ( $(this).hasClass('radios')) {
						if ( $(this).find('input').length == 0 ) {
							if ( $(this).attr('must_fill') == 1 ) {
								nosave = true;
								errors.push($(this).children('p').eq(0).html());
							}
						}
						if ( $(this).attr('question_id') == "50" ){
    						$.each ( $(this).find('input'), function() {
                                if ( $(this).val() == "19" ){
                                    if ( $(this).parent('div').siblings("div.yes_no[question_id='54']").children('select').val() != "YES" ){
                                        nosave = true;
                                        errors.push("Pricing was selected as a reason, \"If pricing was the reason for the Stainless / Porcelain ratio, was Ken Wegrzyn Notified?\" must be checked as YES");   
                                    }
                                }
    						});
                        }
					} else if ( $(this).hasClass('groups') || $(this).hasClass('bus_types') ) {
						if ( $(this).find('input').length == 0 ) {
							if ( $(this).attr('must_fill') == 1 ) {
								nosave = true;
								errors.push($(this).children('p').eq(0).html());
							}
						}
					} else if ( $(this).hasClass('file')) {
					    
						if ( $(this).find('input.value').val().length == 0 && $(this).attr('question_id') != 152 ) {
							nosave = true;
							errors.push($(this).children('p').eq(0).html());
						}
					} else if ( $(this).hasClass('input')) {
						if ( $(this).attr('must_fill') == 1 && $(this).children(':input').eq(0).val() == "" ) {
							nosave = true;
							errors.push($(this).children('p').eq(0).html());
						}
					}
				}
			});
			
			if ( in_array($('#task_type_id').val(),that.must_send_email_task_ids) && $('#task_must_email').val() == "1" ){
				$.prompt("Please send customer an e-mail before closing the task.");
				dc_prevent = false;
				return false;
			}
		}
		
		//if everything is filled in save!, pausing will always fall through
		if ( !nosave ) {
			var save = {};
			
			save.display_name	= that.display_name;
			save.account_id		= that.account_id;
			save.task_id		= $('input#task_id').val();
			save.status_id		= $('input#status_id').val();
			save.type_id		= $('input#task_type_id').val();
			save.extra_info1	= $('input#extra_info1').val();
			save.cust_id		= that.cust_id;
			save.status			= complete;
			
			$.each ( $('#task_form .form .info'), function () {
				if ( $(this).hasClass('groups') || $(this).hasClass('radios') || $(this).hasClass('bus_types')) {
					
					var question_id = $(this).attr('question_id');
					if ( $(this).attr('input_type') == 4 || $(this).attr('input_type') == 5 || $(this).attr('input_type') == 6 ) {
						save["q"+question_id] = [];
						
						$.each ( $(this).children('input'), function (i,v) {
							save["q"+question_id].push( $(this).val() );
						});
						
						if ( save["q"+question_id].length < 1 ) {
							save["q"+question_id] = "";
						}
						
						if ( $(this).attr('input_type') == 5 ) {
							flag_reload_details = true;
						}

						if ( $(this).attr('input_type') == 6 ) {
							flag_reload_details = true;
						}
					}
				} else if ( $(this).attr('input_type') == 7 ) {
					var question_id = $(this).attr('question_id');
					if ( question_id == 152 ) {
                            flag_reload_details = true;
                    }
					save["q"+question_id] = $(this).find('input.value').val();
					
				} else if ( $(this).hasClass('label') || $(this).hasClass('textarea') || $(this).hasClass('yes_no') || $(this).hasClass('input') ) {
					
					var question_id = $(this).attr('question_id');
					if ( typeof question_id != "undefined" ) {
					    if ( question_id == 46 ) {
                            flag_reload_details = true;
                        } 
                        save["q"+question_id] = $(this).children(':input').eq(0).val();  
						

					}
					
				}
			});
			
			$.ajax({
				url        : '/php/ajax.php?ref=set_form_questions',
				dataType   : 'text',
				data       : save,
				type       : 'POST',
				success   : function ( data ) {
					$.prompt(message);
					that.set_form_to_not_changed();
							
					$.bbq.pushState({}, 2);
					
					that.reload();
					if (flag_reload_details) {
						cust.reload_details();
					}
					
				},
				error	: function ( data ) {
					$.prompt("Saving failed, please try again.");
				},
				complete: function ( data ) {
					dc_prevent = false;
				}
			});
			
		} else {
			var error_text = '<p>Please fill in the following questions:</p><ul class="list">';
			$.each ( errors, function (i,v) {
				error_text += '<li>'+v+'</li>';
			});
			error_text += '</ul>';
			$.prompt(error_text, {title: 'Error: Missing Required Fields'});
			dc_prevent = false;
		}
	}
	
	
	
	this.close_task_form = function () {
		var deferred = $.Deferred();
		
		var close_from_settings = function () { 
			that.set_form_to_not_changed();
			$('#task_form .form').empty();
			$('#task_form .communications').empty();
			deferred.resolve();
		}
		
		if ( tasks.form_change ) {
			$.prompt("You haven't finished saving, would you like to stay on this page?",save_check_prompt(close_from_settings, deferred.reject));
		} else {
			close_from_settings();
		}
		
		return deferred.promise();
	}
	this.open_task_form = function (task_type_id) {
		var deferred = $.Deferred().done(function() {
			if ( task_type_id == 7 ) {
				setTimeout( function () {
						orderhistory.build_stainless_vs_porcelain_sales_graph();
					}, 350
				);
			}
			
			that.initialize_file_questions();
			that.refresh_listen_for_changes();
		});
		
		$.when(window_controller.maximize($('#full-task_form_container'))).then(deferred.resolve);
		return deferred.promise();
	}
	this.close_full_task = function () {
		minimize_window($("div.content-box.tasks"),440,950,610,410);
	}
	
	this.refresh_listen_for_changes = function () {
		$('#task_form .form').on('input','div.info > textarea,div.info > select',function(event) { 
			event.stopPropagation();
			that.set_form_to_changed();
		});
	}
	
	this.set_form_to_changed = function () {
		that.form_change = true;
	}
	this.set_form_to_not_changed = function () {
		that.form_change = false;
	}
	
	this.refresh_must_email_for_task = function() {
		$.ajax({
			url: '/php/ajax.php?ref=get_task_has_must_email&customer_id='+that.cust_id+'&task_id='+that.task_id,
			success: function (data) {
				$('#task_must_email').val(data);
			}
		})
	}
	
	this.initialize_file_questions = function() {
		$('#task_form .form .file').each(function() {
			var $button = $(this).find('button').eq(0);
			var $input = $(this).find('#'+$button.data('input')).eq(0);
			var $response_a = $(this).find('.response a').eq(0);
			var $value = $(this).find('input.value').eq(0);
			
			$button.click(function() {
				$input.click();
			});
			
			$input.change(function() {
				$.ajaxFileUpload
		        (
		            {
		                url: $button.data('url'), 
		                secureuri:false,
		                fileElementId: $button.data('input'),
		                dataType: 'json',
		                success: function (data)
		                {
							if ( data['error'] != "" ) {
								$.prompt(data['error']);
							} else {
								var href = data['save_dir']+data['save_path']+data['file_name'];
								$response_a.html(data['file_name']);
								$response_a.attr('href',href);
								$value.val(href);
							}

		                },
		                error: function (data, status, e)
		                {
		                	console.log(e);
		                    $.prompt('Connection error to server, while saving. Please try again.');

		                }
		            }
		        );
			});
			
		});
	};
	
	this.reload = function() {
		if (that.flag_reload) {return;}
		
		that.flag_reload = true;
		$.ajax({
			url: '/php/ajax.php?ref=tasks_reload',
			data: {cust_id: that.cust_id},
			success: function(data) {
				that.binds_off();
				data = $.parseJSON(data);
				$('#full-tasks_container').html(data.full);
				$('#mini-tasks_container').html(data.mini);
				that.last_id = data.last_id;
				that.binds_on();
				that.flag_reload = false;
				window_controller.scrollbar_on('#full-tasks_container, #mini-tasks_container');
			}
		});
	};
	
	this.reload_comm_log = function() {
		$.get(
				"/php/ajax.php?ref=get_task_form&task_id="+that.task_id+"&cust_id="+that.cust_id, 
					function( data ) {
						data = $.parseJSON(data);
						$('#task_form .communications').html(data[1]);
					}
		);
	};
	
//END CLASS
}



