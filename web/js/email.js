function email() {
	
	var INTERVAL_AUTOSAVE = 5000;
	
	var that = this;
	
	that.defaults = {
		email_type: 1
	};
	that.options = {};
	
	that.dfd_preview = null;
	that.dfd_send = null;
	
	that.flag_cookie_deserialize = false;
	that.flag_invoice_check = false;
	that.flag_select_invoice_check_override = false;
	that.flag_loading = false;
	
	
	this.start = function(options) {
		that.flag_loading = true;
		if (typeof options == 'undefined') {var options = {};}
		
		that.dfd_preview = $.Deferred().resolve().promise();
		that.dfd_send = $.Deferred().resolve().promise();
		that.options = $.extend({}, that.defaults, options);
		
		that.binds_on();
		
		that.recipients_default();
		
		that.cookie_deserialize();
		that.autosave_on();
		
		that.preview_attachments();
		that.preview_body();
		that.flag_loading = false;
	}
	
	this.stop = function() {
		that.autosave_off();
		that.binds_off();
	}
	
	this.autosave_on = function() {
		that.interval_autosave = setInterval(that.cookie_serialize, INTERVAL_AUTOSAVE);
	}
	
	this.autosave_off = function() {
		clearInterval(that.interval_autosave);
	}
	
	this.binds_off = function() {
		$('#email .compose .actions .action_preview').unbind();
		$('#email .preview .actions .action_send').unbind();
		if ($('#email .compose .body .value').data('AutoResizer')) {
			$('#email .compose .body .value').data('AutoResizer').destroy();
		}
		$('#email .compose .to .add').unbind();
		$('#email .compose .canned_responses .selections').unbind();
		$('#email_attach_invoice').autocomplete({source: []}).autocomplete("destroy");
		$('#email_attach_invoice').unbind();
		$('#email .compose .canned_responses').unbind();
		that.flag_invoice_check = true;
		that.flag_select_invoice_check_override = false;
	}
	
	this.binds_on = function() {
		$('#email .compose .actions .action_preview').click(function(){that.preview_body(true)});
		$('#email .preview .actions .action_send').click(that.send);
		$('#email .compose .body .value').autoResize({
			extraSpace: 28,
			maxHeight: 9999,
			onResize: function() {
				if (that.flag_cookie_deserialize) {
					setTimeout(function() {
						var $container = $('#email .compose .container');
						$container.animate({scrollTop: '+=28px'}, 200);
					}, 200);
				}
			}
		});
		$('#email .compose .body textarea.value').on('keyup',function () {
			that.preview_body();
		});
		$('#email .compose .to .add').change(that.recipients_change);
		$('#email .compose .to .add').on('keydown',function(e){e.preventDefault();e.stopPropagation();return false;});
		$('#email .compose .canned_responses .add').change(that.canned_responses_change);
		$('#email .compose .canned_responses .arrange').change(that.canned_responses_change);
		//Close window
		$("div#close_email").on('click', function () {
			var state = $.bbq.getState();
			delete state.email;
			
			$.bbq.pushState(state, 2);
		});
		$('#email_attach_invoice').autocomplete({
			delay:		150,
			autoFocus:	true,
			source:		'/php/ajax.php?ref=get_invoices_search_all&customer_id='+$('#customer_id').val(), minLength:0,
			select: 	function(e,ui) {
				that.flag_invoice_check = false;
				that.flag_select_invoice_check_override=true;
				$('#email_attach_invoice').blur();
			}
		});
		$('#email_attach_invoice').on('blur',function(){
			setTimeout(function() {
				that.check_invoice(),50
			});
		}).on('change',function() {
			that.flag_invoice_check = true;
		});

	}
	
	this.build_canned_response_editables = function(lname,lstr,rname,rstr) {
		var html = custom_sprintf("<textarea name='{0}'>{1}</textarea><div class='middle-hyphen'>&#151;</div><textarea name='{2}'>{3}</textarea><br><br>",
			lname,
			lstr,
			rname,
			rstr
		);
		return html;
	}
	
	this.canned_responses_add = function($option) {
		var cookie_data = JSON.parse(Cookies.get(that.cookie_name()));
		if ($('#email .compose .canned_responses .canned_response .value').filter(function() {return $(this).val() == $option.attr('value');}).length) {return false;}
	
		var canned_response = $('#email .compose .canned_responses .canned_response.prototype').clone().removeClass('prototype');
		canned_response.find('.title').html($option.data('title'));
		canned_response.find('.excerpt').html($option.data('excerpt'));
		canned_response.find('.value').val($option.val());
		canned_response.find('.remove').click(that.canned_responses_remove);
		canned_response.find('.edit').click(that.canned_responses_edit);
		canned_response.on('dragend mouseup', that.canned_responses_dragend);
		canned_response.on('dragenter', that.canned_responses_dragenter);
		canned_response.on('dragover', that.canned_responses_dragover);
		canned_response.on('dragstart mousedown', that.canned_responses_dragstart);
		
		if ( !$.isEmptyObject($option.data('editables')) ) {
			$.each ( $option.data('editables'), function(i,v) {
				canned_response.find('.editables > ul').append("<li class=\""+i+"\">"+v+"</li>");
			});
			canned_response.find('.edit').removeClass('hide');
		}

		
		
		$('#email .compose .canned_responses .selections').append(canned_response);
		if ( $option.val() && cookie_data.data.canned_responses ){
			if ( !in_array($option.val(),cookie_data.data.canned_responses) && $option.data('body') != "" ){
				$('#email .compose .body .value').val( $('#email .compose .body .value').val()+"\n\r"+$option.data('body'));
			}
		}
		
		setTimeout(function(){
			$('#email .compose .body .value').data('AutoResizer').check();
		},500);
		
		var $container = $('#email .compose .container');
		$container.scrollTop($container[0].scrollHeight);
		
		that.check_editables();
		if ( !that.flag_loading ) { that.preview_body();that.preview_attachments(); }
		
		return true;
	}
	
	this.canned_responses_change = function() {
		that.canned_responses_add($(this).find(':selected').eq(0));
		$(this).val(null);
	}
	
	this.canned_responses_edit = function() {
		var $this = this;
		var html = "<h2>Editables</h2><br>";
		var id = $(this).siblings('input').val();
		var data = that.compile_data();
		$.each( $('.canned_responses .add option'), function() {
			if ( $(this).attr('value') == id ) {
				
				///discounts/solera discounts/solera full story
				
				if ( in_array(id,[7,10,16]) ) {
					if ( typeof data.data.editables.data[id] !== "undefined" ) {
						$.each( $($this).siblings('div.editables').children('ul').children('li'),function (i,v){
							html += that.build_canned_response_editables( 
										$(this).find('span:nth-child(1)').attr('class'),
										$(this).find('span:nth-child(1)').html(),
										$(this).find('span:nth-child(2)').attr('class'),
										$(this).find('span:nth-child(2)').html()
									);
						});
					} else {
						$.each( $(this).data('editables'),function (i,v){							
							var html_v = $.parseHTML("<div>"+v+"</div>");
							html += that.build_canned_response_editables( 
										i+"_left",
										$(html_v).find("."+i+"_left").html(),
										i+"_right",
										$(html_v).find("."+i+"_right").html()
									);
						});								
					}
				
				}
	
			}
		});
		$.prompt({
			state0: {
				html:html,
				buttons: { Save: true, Cancel: false },
				focus: 1,
				submit:function(e,v,m,f){
					if ( v == true ) {
						$.each ( f , function (ii,vv){
							$($this).siblings('div.editables').find("."+ii).html(vv);
						});
						$($this).siblings('input').addClass('changed');
						that.cookie_serialize();
						that.preview_body();
					}
				}
			}
		},{
			prefix: "email_editables",
		});
	}
	
	this.canned_responses_dragend = function(e) {
		$(e.target).closest('.selection').removeClass('active');
		if ( !that.flag_loading ) { that.preview_body(); }
	}
	
	this.canned_responses_dragenter = function(e) {
		var target = $(e.target).closest('.selection').get(0);
		
		var isbefore = false;
		for (var cur = target; cur; cur = cur.previousSibling) {
        	if (cur === that.canned_responses_dragsource) { 
            	isbefore = true;
            }
        }
		
		if (!isbefore) {
			target.parentNode.insertBefore(that.canned_responses_dragsource, target);
	    } else {
	    	target.parentNode.insertBefore(that.canned_responses_dragsource, target.nextSibling);
	    }
	}
	
	this.canned_responses_dragover = function(e) {
		e.preventDefault();
	}
	
	this.canned_responses_dragstart = function(e) {
		if ($(e.target).is('.remove')||$(e.target).is('.edit > img')) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
		
		that.canned_responses_dragsource = $(e.target).closest('.selection').get(0);
		$(that.canned_responses_dragsource).addClass('active');
	}
	
	this.canned_responses_remove = function() {
		//$(this).closest('.canned_response').remove();
		$(this).closest('.canned_response').effect('drop', 200, function() {
			$(this).remove();
			that.check_editables();
			if ( !that.flag_loading ) { that.preview_body();that.preview_attachments(); }
		});
	}
	
	this.check_editables = function () {
		var enable = false;
		$.each( $('#email .canned_responses .canned_response').not('prototype'),function(i,v){
			if ( $(this).find('.value').val() == 9 || $(this).find('.value').val() == 12 ) {
				enable = true;	
			}			
		});
		if ( enable ) {
			$('#email > section > section.compose > div.container > div.container > div.editables').removeClass('hide');
			return 1;
		} else {
			$('#email > section > section.compose > div.container > div.container > div.editables').addClass('hide');
			$('#email_attach_invoice').val('');
			return 0;
		}
	}
	
	this.check_invoice = function () {
		if ( that.flag_invoice_check && that.flag_select_invoice_check_override  ) {
			that.flag_invoice_check = false;
			that.flag_select_invoice_check_override = false;
			that.preview_attachments();
		} else if ( that.flag_invoice_check && $('#email_attach_invoice').val() != "") {
			that.flag_invoice_check = false;
			var invoice_id = $('#email_attach_invoice').val();
			if(Math.floor(invoice_id) == invoice_id && $.isNumeric(invoice_id)) {
				$.get(
					"/php/ajax.php?ref=get_qcra_check_invoice&invoice_id="+invoice_id+"&customer_id="+$('#customer_id').val(), 
						function( data ) {
							if ( data == "1") {
								//nothing, it's good
							} else { 
								$.prompt("This invoice is invalid.");
								$('#email_attach_invoice').val('');
							}
							that.preview_attachments();
						}
				);
			} else {
				$.prompt("This is an invalid invoice number.");
				$('#email_attach_invoice').val('');
			}

		}
	};
	
	this.clear = function() {
		$('#email .compose .body .value').val(null);
		$('#email .compose .subject .value').val(null);
		$('#email .compose .canned_responses .canned_response').not('.prototype').remove();
		$('#email .compose .to .recipient').not('.prototype').remove();
		$('#email_showroom_discount').val("");
		$('#email_future_product_orders').val("");
		$('#email_attach_invoice').val("");
		$('#email > section > section.compose > div.container > div.container > div.editables').addClass('hide');
	}
	
	this.compile_data = function() {
		var data = {
			customer_id: $('#customer_id').val(),
			email_type: that.options.email_type,
			data: {
				body: $('#email .compose .body .value').val(),
				canned_responses: [],
				subject: $('#email .compose .subject .value').val(),
				to: [],
				editables: { eai: "",data: {}}
			}
		};
		
		switch (+that.options.email_type) {
			case 1:
				data.data.invoice_id = $('#email_attach_invoice').val();
				break;
			case 2:
				data.data.invoice_id = that.options.invoice_id;
				break;
		}
		
		data.data.editables.eai = $('#email_attach_invoice').val();
		data.data.editables.bcc = $('input#bcc_checkbox').is(':checked');
		
		$('#email .compose .canned_responses .canned_response').not('.prototype').find('.value').each(function() {
			data.data.canned_responses.push($(this).val());
			if ( $(this).hasClass('changed') ){
				var temp = {};
				$.each ( $(this).siblings('.editables').children('ul').children('li'), function() {
					temp[$(this).attr('class')+"_left"] = $(this).find("."+$(this).attr('class')+"_left").html();
					temp[$(this).attr('class')+"_right"] = $(this).find("."+$(this).attr('class')+"_right").html();
				});
				data.data.editables.data[$(this).val()] = temp;
			}
		});
		
		$('#email .compose .to .recipient').not('.prototype').find('.value').each(function() {
			data.data.to.push($(this).val());
		});
		console.log(data);
		return data;
	}
	
	this.cookie_clear = function() {
		Cookies.set(that.cookie_name(), '', -1);
	}
	
	this.cookie_deserialize = function() {
		var data = JSON.parse(Cookies.get(that.cookie_name()));
		
		//IF it comes from a task with a canned response specifically for it, this auto adds it to the list.
		if ( $.bbq.getState().task_form != "" && typeof $.bbq.getState().task_form != "undefined" ) {
			setTimeout(function(){
				var task_type_id = 0;
				switch ( parseInt($('#task_type_id').val()) ) {
					case 2:
						task_type_id = 17;
						break;
					case 3:
						task_type_id = 20;
						break;
					case 6:
						task_type_id = 19;
						break;
					case 13:
					case 14:
					case 15:
						task_type_id = 13;
						break;			
					case 24:
						task_type_id = 16;
						break;
				}
				if ( task_type_id != 0 ) {
					$('#email .compose .canned_responses .add').val(task_type_id).change();
				}			
			},500);
		}
		
		if (data) {
			if ( typeof data.data.editables.esd === 'string' ) {
				that.cookie_serialize();
				that.cookie_deserialize();
				return false;
			}
			
			data.data.body = unescape(data.data.body);
			
			$.each(data.data.editables.data,function(i,v){
				$.each(v,function(ii,vv){
					data.data.editables.data[i][ii] = unescape(vv);
				});
			});
			
			$('#email .compose .body .value').val(data.data.body);
			$('#email .compose .subject .value').val(data.data.subject);
			$('#email_attach_invoice').val(data.data.editables.eai);
			
			if (data.data.to.length) {
				$('#email .compose .to .recipient').not('.prototype').remove();
				for (var i in data.data.to) {
					$('#email .compose .to .add').val(data.data.to[i]).change();
				}
			}
			
			if (data.data.canned_responses.length) {
				$('#email .compose .canned_responses .canned_response').not('.prototype').remove();
				for (var i in data.data.canned_responses) {
					$('#email .compose .canned_responses .add').val(data.data.canned_responses[i]).change();
					if ( typeof data.data.editables.data[data.data.canned_responses[i]] !== "undefined" ) {
						$.each ( data.data.editables.data[data.data.canned_responses[i]], function(i,v){
							$('#email .compose .canned_responses .canned_response').last().find("."+i).html(v);
							$('#email .compose .canned_responses .canned_response').last().find('.value').addClass('changed');
						});
					}
				}
			}
		}
		
		setTimeout(function(){
			//silly if code because resizer doesn't work with nothing there
			if ( $('#email .compose .body .value').val() == "" ) {$('#email .compose .body .value').val(' ');}
			$('#email .compose .body .value').data('AutoResizer').check();
			if ( $('#email .compose .body .value').val() == " " ) {$('#email .compose .body .value').val('');}
		},510);
		
		setTimeout(function() {
			that.flag_cookie_deserialize = true;
		}, 0);		
	}
	
	this.cookie_name = function() {
		var name = 'email_customer_'+$('#customer_id').val()+'_type_'+that.options.email_type;
		switch (+that.options.email_type) {
			case 1:
				if ( $.bbq.getState().task_form != "" && typeof $.bbq.getState().task_form != "undefined" ) {
					name += '_tid_'+$.bbq.getState().task_form;
				}
				break;
			case 2:
				name += '_so_'+that.options.invoice_id;
				break;
		}
		return name;
	}
	
	this.cookie_serialize = function() {
		var temp = that.compile_data();
		temp.data.body = custom_encode_string(temp.data.body);
		$.each(temp.data.editables.data,function(i,v){
			$.each(v,function(ii,vv){
				temp.data.editables.data[i][ii] = custom_encode_string(vv);
			});
		});

		Cookies.set(that.cookie_name(), JSON.stringify(temp), 1);
	}

	
	this.preview_attachments = function() {
		$('#email .compose .actions .attachments .action').remove();
		$.post('/php/ajax.php?ref=email_attachments', that.compile_data(), function(data) {
			for (var i in data) {
				$('<button type="button" class="action attachment action_preview_attachment" />').html(data[i].label).data('src',data[i].src).click(function() {
					$('#email .preview').addClass('locked');
					$('#email .preview .content').attr('srcdoc', null).attr('src', null).attr('src', $(this).data('src'));
				}).appendTo($('#email .compose .actions .attachments'));
			}
		}, 'json');
	}
	
	this.preview_body = function(force) {
		if ( force ) { $('#email .preview').removeClass('locked'); }
		if ( that.reload_preview_event ) { 
			clearTimeout(that.reload_preview_event);
		}
		if ( !$('#email .preview').hasClass('locked') ) {
			that.reload_preview_event = setTimeout(function(){
				if (that.dfd_preview.state == 'pending') {return false;}
			
				$('#email .preview .content').attr('srcdoc', null).attr('src', null).addClass('loading');
				that.dfd_preview = $.post('/php/ajax.php?ref=email_preview', that.compile_data(), function(data) {
					$('#email .preview .content').attr('srcdoc', data).attr('src', null).removeClass('loading');
				}).promise();
		
				that.reload_preview_event = false;
				return that.dfd_preview;
			},2000);
		} 			
	}

	this.recipients_add = function(value,name) {
		if ($('#email .compose .to .recipient .value').filter(function() {return $(this).val() == value;}).length) {return false;}
		
		var recipient = $('#email .compose .to .recipient.prototype').clone().removeClass('prototype');
		recipient.find('.label').html(value+" ( "+name+" ) ");
		recipient.find('.value').val(value);
		recipient.find('.remove').click(that.recipient_remove);
		
		$('#email .compose .recipients').append(recipient);
		return true;
	}
	
	this.recipients_default = function() {
		switch (+that.options.email_type) {
			case 2:
				$('#email .compose .to .add .invoice').each(function() {
					that.recipients_add($(this).val(),$(this).html());
				});
				break;
			default:
				$('#email .compose .to .add .primary').each(function() {
					that.recipients_add($(this).val(),$(this).html());
				});
				break;
		}
	}
	
	this.recipients_change = function() {
		if ( $(this).val() ) {
			that.recipients_add($(this).val(),$("option:selected",this).html());	
		}
		$(this).val(null);
	}
	
	this.recipient_remove = function() {
		$(this).closest('.recipient').remove();
	}
	
	this.reload_page = function() {
		that.stop();
		$.get(
			"/php/ajax.php?ref=reload_email&customer_id="+$("input#customer_id").val(), 
				function ( data ) {
					$('#email_container').empty();
					$('#email_container').append(data);
					that.start();
				}
		);
	}
	
	this.reset = function(options) {
		that.stop();
		that.clear();
		that.start(options);
	}
	
	this.send = function() {
		if (that.dfd_send.state == 'pending') {return false;}
		if ( double_click_check() ) { return false; }
		var data = that.compile_data();
		
		//Simple checks so e-mails are not blank!
		if ( !data.data.to.length ) {
			$.prompt("Please select a recipient.");
			dc_prevent = false;
			return false
		} else if ( !data.data.subject.length ) {
			$.prompt("Please enter a subject.");
			dc_prevent = false;
			return false;
		} else if ( !data.data.body.length ) {
			$.prompt("Please enter a personal message.");
			dc_prevent = false;
			return false;
		} else if ( that.check_editables() && $('#email_attach_invoice').val() == "" ) {
			$.prompt("Please select an invoice to attach to this estimate.");
			dc_prevent = false;
			return false;
		}
		
		//IF there's task_form var in bbq, then it's coming from a task, so let's add a log!
		//sets the variable task_id specifically for email::create
		if ( $.bbq.getState().task_form != "" && typeof $.bbq.getState().task_form != "undefined" ) {
			data.task_id = $.bbq.getState().task_form;
		}
		
		that.dfd_send = $.post('/php/ajax.php?ref=email_send', data, function(data) {
			that.autosave_off();
			that.cookie_clear();
			
			$.prompt('Your email has been sent!');
			
			var state = $.bbq.getState();
			delete state.email;
			
			$.bbq.pushState(state, 2);
			tasks.reload();
			if ( $.bbq.getState().task_form != "" && typeof $.bbq.getState().task_form != "undefined" ) {				
				$('#task_must_email').val(0);
				tasks.reload_comm_log();
			}
		}).promise();
		
		return that.dfd_send;
	}
	
}