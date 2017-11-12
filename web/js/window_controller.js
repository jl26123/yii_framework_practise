var INTERVAL_CSS_ANIMATION = 125;
var MAXIMIZE_DELAY = 20;

WindowController = function() {
	var that = this;
	
	this.current_state = {};
	this.previous_hash = '';
	this.previous_state = {};
	that.flag_debug = false;
	
	this.start = function() {
		$(window).on('hashchange.WindowController', function(e) {that._onhashchange(e);});

		that.binds_on();
		that.jsp_on();
		that.scrollbar_on();
		
		$(function() {
			setTimeout(that._onhashchange, INTERVAL_CSS_ANIMATION * 2);
		});
		
	}
	
	this.binds_on = function() {

		$("div#open_rma").on('click',function(){
			var state = $.bbq.getState();
			state.a = 'rma';
			delete state.b;
			
			$.bbq.pushState(state, 2);
		});
		
		$("div#open_orderhistory").on('click',function(){
			var state = $.bbq.getState();
			state.a = 'orderhistory';
			delete state.b;
			
			$.bbq.pushState(state, 2);
		});
		
		$("div#open_marketing").on('click',function(){
			var state = $.bbq.getState();
			state.a = 'marketing';
			delete state.b;
			
			$.bbq.pushState(state, 2);
		});
		
		$("div#open_terms").on('click',function(){
			var state = $.bbq.getState();
			state.a = 'terms';
			delete state.b;
			
			$.bbq.pushState(state, 2);
		});
		
		$("div#close_rma").on('click',function(){
			var state = $.bbq.getState();
			delete state.a;
			delete state.b;
			delete state.id;
			
			$.bbq.pushState(state, 2);
		});
		
		$("div#close_orderhistory").on('click',function(){
			var state = $.bbq.getState();
			delete state.a;
			delete state.b;
			delete state.id;
			
			$.bbq.pushState(state, 2);
		});

		$("div#close_marketing").on('click',function(){
			var state = $.bbq.getState();
			delete state.a;
			delete state.b;
			
			$.bbq.pushState(state, 2);
		});
		
		$("div#close_terms").on('click',function(){
			var state = $.bbq.getState();
			delete state.a;
			delete state.b;
			delete state.page;
			delete state.invoice_id;
			delete state.credit_app_id;
			delete state.pdfid;
			
			$.bbq.pushState(state, 2);
		});
	}
	
	this.jsp_on = function() {
		//$('div.full_terms_container').jScrollPane({verticalGutter: 70});
	}
	
	this.scrollbar_on = function($scope) {
		if (typeof $scope == "undefined" || !$scope) {
			var $scope = 'body';
		}
		$($scope).find('.overflowy').not('.scrollbar-inner').addClass('scrollbar-inner').scrollbar();
	}
	
	this.stop = function() {
		$(window).off('hashchange.WindowController');
	}
	
	this._onhashchange = function(e) {
		that._execute_callbacks(that._build_callbacks(that.current_state, $.bbq.getState()));
	}
	
	this._build_callbacks = function(hash_from, hash_to) {
		var callbacks = new Array();
		var cb_debug = new Array();
		
		if (hash_from.email) {
			cb_debug.push('close_email()');
			callbacks.push(that.close_email);
		}
		
		if (hash_from.b) {
			switch (hash_from.b) {
				case 'recent_updates':
					cb_debug.push('close_recent_updates()');
					callbacks.push(that.close_recent_updates);
					break;
			}
		}
		
		if (hash_to.a != hash_from.a) {
			if (hash_from.a) {
				switch (hash_from.a) {
					case 'communications':
						cb_debug.push('close_communications()');
						callbacks.push(that.close_communications);
						break;
					case 'contact':
						cb_debug.push('close_contact()');
						callbacks.push(that.close_contact);
						break;
					case 'details':
						cb_debug.push('close_details()');
						callbacks.push(that.close_details);
						break;
					case 'marketing':
						cb_debug.push('close_marketing()');
						callbacks.push(that.close_marketing);
						break;
					case 'orderhistory':
						cb_debug.push('close_orderhistory()');
						callbacks.push(that.close_orderhistory);
						break;
					case 'rma':
						cb_debug.push('close_rma()');
						callbacks.push(that.close_rma);
						break;
					case 'tasks':
						cb_debug.push('close_tasks()');
						callbacks.push(that.close_tasks);
						break;
					case 'terms':
						cb_debug.push('close_terms()');
						callbacks.push(that.close_terms);
						break;
				}
			}
			if (hash_to.a) {
				switch (hash_to.a) {
					case 'communications':
						cb_debug.push('open_communications()');
						callbacks.push(that.open_communications);
						break;
					case 'contact':
						cb_debug.push('open_contacts()');
						callbacks.push(function() {that.open_contact(hash_to.id);});
						break;
					case 'details':
						cb_debug.push('open_details()');
						callbacks.push(that.open_details);
						break;
					case 'marketing':
						cb_debug.push('open_marketing()');
						callbacks.push(that.open_marketing);
						break;
					case 'orderhistory':
						cb_debug.push('open_orderhistory()');
						callbacks.push(function() {that.open_orderhistory(hash_to.id);});
						break;
					case 'rma':
						cb_debug.push('open_rma()');
						callbacks.push(function() {that.open_rma(hash_to.id);});
						break;
					case 'tasks':
						cb_debug.push('open_tasks()');
						callbacks.push(that.open_tasks);
						break;
					case 'terms':
						cb_debug.push('open_terms()');
						callbacks.push(function() {that.open_terms(hash_to.page,hash_to.invoice_id,hash_to.credit_app_id)});
						break;
				}
			}
		} else if (hash_to != hash_from) {
			
			if (hash_to.id != hash_from.id) {
				switch (hash_to.a) {
					case 'contact':
						cb_debug.push('update_contact()');
						callbacks.push(function() {that.update_contact(hash_to.id);});
						break;
					case 'orderhistory':
						cb_debug.push('update_orderhistory()');
						callbacks.push(function() {that.update_orderhistory(hash_to.id);});
						break;
					case 'rma':
						cb_debug.push('update_rma()');
						callbacks.push(function() {that.update_rma(hash_to.id);});
						break;
				}
			}
			
		}
		
		if (hash_to.task_form != hash_from.task_form || hash_to.task_status != hash_from.task_status) {
			
			if (hash_from.task_form) {
				cb_debug.push('close_task_form()');
				callbacks.push(that.close_task_form);
			}
			
			if (hash_to.task_form) {
				cb_debug.push('open_task_form()');
				callbacks.push(function() {that.open_task_form(hash_to.task_form, hash_to.task_status);});
			}
			
		}
		
		if (hash_to.b) {
			switch (hash_to.b) {
				case 'recent_updates':
					cb_debug.push('open_recent_updates()');
					callbacks.push(function () {that.open_recent_updates(hash_to.a);});
					break;
			}
		}
		
		if (hash_to.email) {
			cb_debug.push('open_email()');
			callbacks.push(function() {that.open_email(hash_to.email);});
		}
	
		
		//&& hash_to.a != hash_from.a
		//doug put in for termsss
		if ( hash_to.a == "terms"  ){
		    cb_debug.push('terms.set_window_view()');
		    callbacks.push(function() {terms.set_window_view();});
		}
		
		
		cb_debug.push('done()');
		callbacks.push(function() {
			that.previous_hash = window.location.hash;
			that.previous_state = that.current_state;
		});
		
		that.flag_debug && console.log(cb_debug);
		
		return callbacks;
	}
	
	this._execute_callbacks = function(callbacks) {
		var dfd = $.Deferred();
		
		var when = $.when(dfd);
		for (var i in callbacks) {
			when = when.then(callbacks[i], that._onhashchange_revert);
		}
		
		dfd.resolve();
		return dfd.promise();
	}
	
	this._onhashchange_revert = function() {
		history.pushState(null, '', that.previous_hash);
		that._execute_callbacks(that._build_callbacks(that.current_state, that.previous_state));
	}
	
	this.open_communications = function() {
		var deferred = $.Deferred();
		
		$.when(that.maximize($('#full-communications_container'))).then(function() {
			that.current_state.a = 'communications';
			delete that.current_state.b;
			
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	this.open_contact = function(id) {
		var deferred = $.Deferred();
		
		$.when(that.maximize($('#full-contact_container'))).then(function() {
			that.current_state.a = 'contact';
			delete that.current_state.b;
			
			if (typeof id != "undefined" && id) {
				$.when(cust.get_contact_info(id)).then(function() {
					that.current_state.id = id;
					deferred.resolve();
				});
			} else {
				deferred.resolve();
			}
		});
		
		return deferred.promise();
	}
	this.open_details = function() {
		var deferred = $.Deferred();
		
		$.when(that.maximize($('#full-details_container'))).then(function() {
			setTimeout(function(){ 
				$.each( $('#full-details .details textarea'),function(){ $(this).data('AutoResizer').check() ;} );	
			},300);
			that.current_state.a = 'details';
			delete that.current_state.b;
			
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	this.open_email = function(options) {
		var deferred = $.Deferred();
		
		email.clear();
		
		$.when(that.maximize($('#email_container'))).then(function() {
			email.reset(options);
			
			that.current_state.email = options;
			
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	this.open_marketing = function() {
		var deferred = $.Deferred();
		
		$.when(that.maximize($('#full-marketing_container'))).then(function() {
			that.current_state.a = 'marketing';
			delete that.current_state.b;
			
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	this.open_orderhistory = function(id) {
		var deferred = $.Deferred();
		
		$('div.orders_right').empty();
		$.when(that.maximize($('#full-orderhistory_container'))).then(function() {
			that.current_state.a = 'orderhistory';
			delete that.current_state.b;
			
			setTimeout( function () {
					orderhistory.build_sales_graph();
				}, 
			500
			);
			
			if (typeof id != "undefined" && id) {
				$.when(orderhistory.get_so_data(id)).then(function() {
					that.current_state.id = id;
					deferred.resolve();
				});
			} else {
				deferred.resolve();
			}
		});
		
		return deferred.promise();
	}
	this.open_recent_updates = function (target) {
		var deferred = $.Deferred();
		
		switch (target) {
			case 'contact':
				callback = function() {
					recent_updates.print_large_updates_html(1);
					$.when(that.maximize($('#recent_updates_container'))).then(function() {
						that.current_state.b = 'recent_updates';
						//$('div.full_recent_updates').data('jsp').reinitialise();
						deferred.resolve();
					});
				}
				break;
			case 'details':
				callback = function() {
					recent_updates.print_large_updates_html(2);
					$.when(that.maximize($('#recent_updates_container'))).then(function() {
						that.current_state.b = 'recent_updates';
						//$('div.full_recent_updates').data('jsp').reinitialise();
						deferred.resolve();
					});
				}
				break;
			case 'rma':
				callback = function() {
					recent_updates.print_large_updates_html(3);
					$.when(that.maximize($('#recent_updates_container'))).then(function() {
						that.current_state.b = 'recent_updates';
						//$('div.full_recent_updates').data('jsp').reinitialise();
						deferred.resolve();
					});
				}
				break;
			default:
				callback = deferred.reject;
				break;
		}
		
		if (recent_updates.loading.state() == 'resolved') {
			callback();
		} else {
			recent_updates.loading.done(callback);
		}
		
		return deferred.promise();
	}
	this.open_rma = function(id) {
		var deferred = $.Deferred();
		
		$.when(that.maximize($('#full-rma_container'))).then(function() {
			that.current_state.a = 'rma';
			delete that.current_state.b;
			
			if ( !id && !that.current_state.id ) {
                if ( $('#full-rma .rma_phtml').attr('style') == "display: block;" ) {
                    $.bbq.pushState({a:"rma",id:$('#rma_number').html()});
                } else if ( $('#full-rma .qcra_phtml').attr('style') == "display: block;" ) {
                    $.bbq.pushState({a:"rma",id:$('#qcra_number').html()});
                }
			}
			
			if (typeof id != "undefined" && id) {
				$.when(rma_page.set_active_page(id)).then(function() {
					that.current_state.id = id;
					deferred.resolve();
				});
			} else {
				deferred.resolve();
			}
		});
		return deferred.promise();
	}
	this.open_tasks = function() {
		var deferred = $.Deferred();
		
		$.when(that.maximize($('#full-tasks_container'))).then(function() {
			that.current_state.a = 'tasks';
			delete that.current_state.b;
			
			//$('div.task_form_box').data('jsp').reinitialise();
			
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	this.open_task_form = function(id, status) {
		var deferred = $.Deferred();
		
		$.when(tasks.get_task_form(id, status == 0)).then(function() {
			$.when(that.maximize($('#task_form_container'))).then(function() {
				setTimeout(function(){ 
					$.each( $('#task_form .form textarea'),function(){ $(this).data('AutoResizer').check() ;} );	
				},300);
				
				that.current_state.task_form = id;
				that.current_state.task_status = status;
				
				deferred.resolve();
			});
		});
		
		return deferred.promise();
	}
	this.open_terms = function(page,invoice_id,credit_app_id) {
		var deferred = $.Deferred();
		
		$.when(that.maximize($('#full-terms_container'))).then(function() {
			that.current_state.a = 'terms';
			delete that.current_state.b;
			
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	
	this.close_communications = function() {
		var deferred = $.Deferred();
		
		$.when(that.minimize($('#full-communications_container'))).then(function() {
			delete that.current_state.a;
			delete that.current_state.b;
			
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	this.close_contact = function() {
		var deferred = $.Deferred();
		
		var close = function () {
			cust.customer_change = false;
			cust.contact_change = false;
			cust.reload_contact_on_close();
			
			$.when(that.minimize($('#full-contact_container'))).then(function() {
				delete that.current_state.a;
				delete that.current_state.b;
				delete that.current_state.id;
				deferred.resolve();
			}); 
		}
		
		if ( cust.customer_change || cust.contact_change ) {
			$.prompt("You haven't finished saving, would you like to stay on this page?",save_check_prompt(close, deferred.reject));
		} else {
			close();
		}
		
		return deferred.promise();
	}
	this.close_details = function() {
		var deferred = $.Deferred();
		
		var close = function () { 
			cust.detail_change = false;
			cust.touchscreen_change = false;
			cust.reload_details_on_close();
			
			$.when(that.minimize($('#full-details_container'))).then(function() {
				delete that.current_state.a;
				delete that.current_state.b;
				deferred.resolve();
			});
		}
		
		if ( cust.detail_change || cust.touchscreen_change ) {
			$.prompt("You haven't finished saving, would you like to stay on this page?",save_check_prompt(close, deferred.reject));
		} else {
			close();
		}
		
		return deferred.promise();
	}
	this.close_email = function() {
		var deferred = $.Deferred();
		
		$.when(that.minimize($('#email_container'))).then(function() {
			email.autosave_off();
			$('#email .preview').removeClass('locked');
			dc_prevent = false;
			delete that.current_state.email;
			
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	this.close_marketing = function() {
		var deferred = $.Deferred();
		
		$.when(that.minimize($('#full-marketing_container'))).then(function() {
			delete that.current_state.a;
			delete that.current_state.b;
			
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	this.close_orderhistory = function() {
		var deferred = $.Deferred();
		
		$.when(that.minimize($('#full-orderhistory_container'))).then(function() {
			delete that.current_state.a;
			delete that.current_state.b;
			delete that.current_state.id;
			
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	this.close_recent_updates = function () {
		var deferred = $.Deferred();
		
		$.when(that.minimize($('#recent_updates_container'))).then(function() {
			delete that.current_state.b;
			
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	this.close_rma = function() {
		var deferred = $.Deferred();
		
		var close = function () {
			$.when(that.minimize($('#full-rma_container'))).then(function() {
				delete that.current_state.a;
				delete that.current_state.b;
				delete that.current_state.id;
				
				rma.rma_change		= false;
				qcra.qcra_change	= false;
				deferred.resolve();
			});
		}
		
		if ( rma.rma_change || qcra.qcra_change ) {
			$.prompt("You haven't finished saving, would you like to stay on this page?",save_check_prompt(close, deferred.reject));
		} else {
			close();
		}
		
		return deferred.promise();
	}
	this.close_tasks = function() {
		var deferred = $.Deferred();
		
		$.when(that.minimize($('#full-tasks_container'))).then(function() {
			delete that.current_state.a;
			delete that.current_state.b;
			
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	this.close_task_form = function() {
		var deferred = $.Deferred();
		
		$.when(tasks.close_task_form()).then(function() {
			$.when(that.minimize($('#task_form_container'))).then(function() {
				delete that.current_state.task_form;
				delete that.current_state.task_status;
				
				deferred.resolve();
			});
		}, deferred.reject);
		
		return deferred.promise();
	}
	this.close_terms = function() {
		var deferred = $.Deferred();
		
		$.when(that.minimize($('#full-terms_container'))).then(function() {
			delete that.current_state.a;
			delete that.current_state.b;
			
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	
	this.maximize = function($window) {
		var deferred = $.Deferred();
		$window.removeClass('hide');
		setTimeout(function() { 
			$window.removeClass('minimize').addClass('maximize');
			setTimeout(function() {deferred.resolve();}, INTERVAL_CSS_ANIMATION);
			return deferred.promise();
		},MAXIMIZE_DELAY);
	}

	this.minimize = function($window) {
		var deferred = $.Deferred();
		$window.removeClass('maximize').addClass('minimize');
		setTimeout(function() {$window.addClass('hide');deferred.resolve();}, INTERVAL_CSS_ANIMATION);
		return deferred.promise();
	}
	
	this.update_contact = function(id) {
		var deferred = $.Deferred();
		
		var close = function() {
			$.when(cust.select_contact(id)).then(function() {
				that.current_state.id = id;
				deferred.resolve();
			});
		}
		
		if ( cust.contact_change ) {
			$.prompt("You haven't finished saving, would you like to stay on this page?",save_check_prompt(close, deferred.reject));
		} else {
			close();
		}
		
		return deferred.promise();
	}
	
	this.update_orderhistory = function(id) {
		var deferred = $.Deferred();

		$.when(orderhistory.get_so_data(id)).then(function() {
			that.current_state.id = id;
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	
	this.update_rma = function(id) {
		var deferred = $.Deferred();
		
		var close = function () {
			$.when(rma_page.set_active_page(id)).then(function() {
				that.current_state.id = id;
				deferred.resolve();
			});
		}
		
		if ( rma.rma_change || qcra.qcra_change ) {
			$.prompt("You haven't finished saving, would you like to stay on this page?",save_check_prompt(close, deferred.reject));
		} else {
			close();
		}
		
		return deferred.promise();
	}
	
}