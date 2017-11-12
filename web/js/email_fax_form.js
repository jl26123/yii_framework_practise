jQuery(document).ready(function($){
	ef_form		= new email_fax_form();
	ef_form.start();
});

function email_fax_form() {
	var that = this;
	var is_sending = false;
	var prompt_states = {
						state0: {
							html: 'Sending..',
							buttons: ''
						},
						state2: {
							html: 'Send Failed, please try again.'
						}
					}
	this.fishbowl_id 			= $("input#fishbowl_id").val();
	this.start_screen_height	= "";
	
	this.autosave_interval = null;
	
	//start all the event listeners
	this.start = function () {
		//after form is built, adjust it!
		that.update_screen_height();
		
 		$('#preview_email_btn').on("click", function () {
			that.update_email_preview();
		}); 
		
 		$('#preview_invoice_btn').on("click", function () {
			that.preview_invoice();
		}); 
		
		$('div.to_header div.to_emails').on("click", "span", function () {
			$(this).remove();
			$('#email_autoadder').append('<option>'+$(this).html()+'</option>');
			that.update_screen_height();
		});
		
		$('#email_autoadder').on("change", function () {
			if ( $(this).children('option:selected').attr('notanemail') != "1" ) {
				$('div.to_header div.to_emails').append( 
					'<span>'+$(this).children('option:selected').html()+'<img src=\"/images/details_x.png\"></img></span>'
				);
				$(this).children('option:selected').remove();
				that.update_screen_height();
			}
		});
		
		that.cookie_deserialize();
		that.autosave_on();
		
		$('#send_invoice_btn').on("click", function () {
			that.sent_invoice();
		});
		
		$('#finish_fax_btn').on("click", function () {
			that.set_sent_fax_invoice();
		});
		
	}
	
	this.autosave_on = function() {
		$('#email_input').on('input', that.cookie_serialize);
		that.autosave_interval = setInterval(that.cookie_serialize, 1000);
	}
	
	this.autosave_off = function() {
		$('#email_input').off('input');
		clearInterval(that.autosave_interval);
		that.autosave_interval = null;
	}
	
	this.cookie_deserialize = function() {
		$('#email_input').val(Cookies.get(that.get_cookie_name()));
	}
	
	this.cookie_serialize = function() {
		Cookies.set(that.get_cookie_name(), $('#email_input').val(), 1);
	}
	
	this.cookie_delete = function() {
		Cookies.set(that.get_cookie_name(), '', -1);
	}
	
	this.update_screen_height = function () {
		//Base with one line is 30px
		if ( that.start_screen_height == "" ) {
			that.start_screen_height	= $('div.content > div.thy_body').height();
		}
		var to_height 		= $('div.content > div.to_header').height() - 30;
		$('div.content > div.thy_body').height( that.start_screen_height - to_height );
	}
	
 	this.update_email_preview = function () {
		$('#email_output').empty();
		
		var temp = $('#email_input').val().split('\n');
		var html = '';
		
		$.each ( temp, function (i,v) {
/* 			if ( v == "" ) {
				html += "";
			} else { */
				html += v+"<br>";
			//}
		});
		
		$('#user_message').html( html );
		$('div.thy_preview div.html_preview').show();
		$('div.thy_preview div.invoice_preview').hide();
	} 
	
 	this.preview_invoice = function () {
		$('div.thy_preview div.html_preview').hide();
		$('div.thy_preview div.invoice_preview').show();
		$('#email_preview_invoice').attr('src',$('#email_preview_invoice').attr('the_src'));
	} 
	
	this.set_sent_fax_invoice = function () {
		var info = {};
		
		info.display_name	= $('#display_name').val();
		info.account_id		= $('#account_id').val();
		info.task_id		= $('#task_id').val();
		
		$.ajax({
			url        : '/php/ajax.php?ref=set_sent_fax_invoice',
			dataType   : 'text',
			data       : info,
			type       : 'POST',
			success	   : function ( data ) {
				parent.dashboard.close_fancybox_and_reload();
			},
			error	   : function ( dontcare ) {
				$.prompt('Finish failed, please try again.');
			}
		});
	}
	
	this.sent_invoice = function () {
		if ( that.is_sending ) {
			return false;
		}
		that.is_sending = true;
		var info = {};
		
		info.account_id		= $('#account_id').val();
		info.customer_id	= $('#customer_id').val();
		info.task_id		= $('#task_id').val();
		info.soNum			= $('#soNum').val();
		info.message		= $('#email_input').val();
		info.tracking_link	= $('#tracking_link').html();
		info.tracking_type	= $('#tracking_type').html();
		info.tracking_eta	= $('#tracking_eta').html();
		info.signature_text	= $('div.signature_text').html();
		info.subject_line	= $('#subject_line').val();
		info.to_people		= [];
		$.each ( $('div.to_header div.to_emails span'), function () {
			var temp = $(this).html().split('<');
			info.to_people.push( temp[0] );
		});
		
		$('div.thy_body').scrollTop();
		if ( info.subject_line == "" || info.message == "" ) {
			$.prompt('Blank subject line or blank message...');
			that.is_sending = false;
		} else if ( info.to_people.length < 1 ) {
			$.prompt('This E-mail has no TO address...');
			that.is_sending = false;
		} else {
			$.prompt(prompt_states);
			$.ajax({
				url        : '/php/invoice_emailer.php',
				dataType   : 'text',
				data       : info,
				type       : 'POST',
				success	   : function ( data ) {
					if ( data == "failed" ) {
						setTimeout(function() { $.prompt.goToState('state2');that.is_sending = false; }, 1000);
					} else {
						
						that.autosave_off();
						that.cookie_delete();
						
						//task_id will be false if sending from order history screen... its not a task
						if ( info.task_id > 1 ) {
							parent.dashboard.close_fancybox_and_reload();
						} else {
							parent.close_fancybox();
						}
					}
				},
				error	   : function ( data ) {
					$.prompt.goToState('state2');
				}
			});
		}
	}
	
	this.get_cookie_name = function() {
		return 'email_fax_form_'+$('#soNum').val();
	}

}










