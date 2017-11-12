function rma_vars() {
	var that = this;
	
	//that.rma_id is set on form load
	this.cust_id 				= $("input#customer_id").val();
	this.fishbowl_id			= $("input#fishbowl_id").val();
	this.username 				= $("input#username").val();
	this.account_id				= $("input#account_id").val();
	this.display_name			= $("input#display_name").val();
	this.$haspdf				= $('tr.has_pdf');
	this.$nopdf					= $('tr.no_pdf');
	this.rma_pdf_files			= [ "rma_rma_file", "rma_cra_file", "rma_rl_file", "rma_wh_file" ];
	this.path					= "";
	this.rma_tracking_status 	= [];
	this.rma_change				= false;
	this.adding_new_rma 		= false;
	this.tracking_request		= "";
	this.invoices_unused		= "";
	

	//start all the event listeners
	this.start = function () {
				
		that.set_add_pictures_event();
		that.set_add_rma_pdf_event();
		that.set_rma_check_invoice_listener();
		$('.fancybox').fancybox();
						
		//ADD NEW RMA
		$('button#rma_add').on('click', function() {
			that.add_new_rma();
		});
		
		
		//UPDATE RMA
		$('button#rma_update').on('click', function() {
			that.update_rma_form();
		});
		
		//ADD INVOICE
		$('button#rma_add_invoice_button').on('click', function() {
			if ( $('#rma_add_invoice').val() != "" ) {
				that.add_new_invoice_html();
				that.refresh_rma_window();
			}
		});
		
		//DELETE INVOICE
		$('div#rma_invoices').on('click','div img', function () {
			that.del_invoice($(this));
			that.refresh_rma_window();
		});
		
		//ADD PRODUCT
		$('button#rma_add_product_button').on('click', function () {
			that.add_new_product_html();
			that.refresh_rma_window();
		});
		
		//DELETE PRODUCT		
		$('#full-rma div.rma_phtml > div.rma-scroll-container div.rma_products > div > table > tbody').on('click','tr > td > div > img', function () {
			that.del_product($(this));
			that.refresh_rma_window();
		});
		
		//ADD PICTURE(S)
		$('#rma_add_picture_btn').on('click', function () { 
			$('#rma_add_picture_file').click();
		});	
		
		//DEL PICTURE
		$('div.rma_pictures div.picture_text').on('click','div img', function () {
			$(this).parent('div').remove();
			that.rma_change = true;
		});
		
		//ADD/CHANGE PDF		
		$.each ( that.rma_pdf_files, function (i,v) {
			var pdf_type 	= v.split('_');
			pdf_type 		= pdf_type[1];
			$('#'+pdf_type+'_attached_pdf_button').on('click', function () {
				$('#rma_'+pdf_type+'_file').click();
			});
		});
		
		//CHANGE DETECTION
		//CHANGE DETECTION
		//CHANGE DETECTION
		
		$('div.rma_phtml div.rma_products div.products_box table').on('change','tr td', function () {
			that.rma_change = true;
		});
		
		$('div.rma_phtml  div.rma-scroll-container div.rma-scroll div.rma_block :nth-child(2)').on('change',function () {
			that.rma_change = true;
		});
		
		//comment change
		$('#rma_comment').on("change",function(){
			that.rma_change = true;
		});
		
		//PRINT RMA
		$('button#rma_customer_pdf').on("click", function() {
			that.open_return_pdf("rma");
		});
		
		//PRINT FAUCETS
		$('button#rma_faucet_pdf').on("click", function() {
			that.open_return_pdf("rma_faucet");
		});
		
		//PRINT GLASS
		$('button#rma_glass_pdf').on("click", function() {
			that.open_return_pdf("rma_glass");
		});
		
		//PRINT STAINLESS
		$('button#rma_stain_pdf').on("click", function() {
			that.open_return_pdf("rma_stainless");
		});
		
		//DATE LISTENERS
		$.each( $('div.rma_block input.makeadate'), function() {
			$(this).datepicker({
				onClose: function(dateText) {
					if ( dateText != "" ) {
						var temp = dateText.split('/');
						if ( typeof temp[0] != "undefined" && typeof temp[1] != "undefined" && typeof temp[2] != "undefined" ) {
							$(this).val(temp[0]+'-'+temp[1]+'-'+temp[2]);
						}
					}
				}
			});
		});
		
		//TRACKING ON CHANGE LISTENER
		$('#rma_return_tracking').on ('input', function () {
			clearTimeout(that.tracking_request);
			that.tracking_request = setTimeout(function() {
				that.get_return_tracking();
			}, 500);
		});
		$('#rma_sent_tracking').on ('input', function () {
			clearTimeout(that.tracking_request);
			that.tracking_request = setTimeout(function() {
				that.get_sent_tracking();
			}, 500);
		});
		
		//SEARCH BUTTON
		$('#rma_search_flip').on('click', function () {
			if ( $('#rma_add_invoice')[0].tagName.toLowerCase() == "input" ){
				$(this).siblings('input').replaceWith('<select id="rma_add_invoice"></select>');
				that.add_invoice_select_html(that.invoices_unused);
			} else {
				$(this).siblings('select').replaceWith('<input id="rma_add_invoice" type="text" value=""></input>');
			}
		});
		
		$('input#rma_add_invoice').on( "focus", function () {
			$('input#rma_add_invoice').autocomplete('search');
		});
		
		//pdf removers
		$('#rma_remove_pdf_button').on('click',function () {
			that.remove_pdf("rma");
		});
		$('#cra_remove_pdf_button').on('click',function () {
			that.remove_pdf("cra");
		});
		$('#rl_remove_pdf_button').on('click',function () {
			that.remove_pdf("rl");
		});
		$('#wh_remove_pdf_button').on('click',function () {
			that.remove_pdf("wh");
		});
	};
	
	
	this.remove_pdf = function (str) {
		if ( str != "qcra") { that.rma_change = true; };
		$('#'+str+'_attached_pdf').html("");
		$('#'+str+'_attached_pdf').attr('pdf_name','');
		$('#'+str+'_attached_pdf_button').html("Add PDF");
	}
	
	this.set_rma_check_invoice_listener = function () {
		$('input#rma_add_invoice').autocomplete({
			delay:		150,
			autoFocus:	true,
			source:		'/php/ajax.php?ref=get_rma_invoices_search&customer_id='+that.cust_id, minLength:0,
			select: 	function(e,ui) {
				
			},
			response:		function ( e, ui ) {
				search_data = ui;
			},
			open:		function ( e,ui) {
	
			}
		});
	}
	
	this.get_rma_check_invoice = function () {
			var invoice_id = $('input#rma_add_invoice').val();
			$.get(
				"/php/ajax.php?ref=get_rma_check_invoice&invoice_id="+invoice_id+"&customer_id="+that.cust_id, 
					function( data ) {
						if ( data === "1" ) {
							that.add_new_invoice_html(true);
						} else { 
							$.prompt("SinkNet cannot find this invoice.");
						}
					}
			);
	};
	
	this.set_rma_form = function (rma_id) {
		if ( typeof rma_id != "undefined" ) {
			that.rma_id = rma_id;
		}
		
		$.each ( that.rma_tracking_status, function (i,v) {
			v.abort();
		});
		
		that.rma_tracking_status 	= [];
		
		that.rma_tracking_status.push(  
			$.get(
				"/php/ajax.php?ref=get_rma_info&rma_id="+that.rma_id+"&fishbowl_id="+that.fishbowl_id+
				"&account_id="+that.account_id, 
					function( data ) {
						data = $.parseJSON(data);						
						that.product_reasons 		= data['product_reasons'];
						that.product_conditions		= data['product_conditions']
						that.path					= data['rma']['path'];
						that.invoices_unused		= data['invoice_unused'];
						
						rma_page.add_default_select_html( data['rma']['status_id'],data['statuses'],$('select#rma_status'),"status"  );
						that.add_invoice_html( data['invoice_dates'] );
						that.add_product_html( data['products'] );
						that.add_not_added_product_html( data['addable_products'] );
						that.add_pictures_html( data['pictures'] );
						rma_page.add_contact_select_html( data['rma']['contact_id'],data['contacts'],"name",$('select#rma_contact_name') );
						rma_page.add_ordered_select_html( data['rma']['store_id'],data['stores'], $('select#rma_store'),"store" );
						//rma_page.add_default_select_html( data['rma']['store_id'],data['warehouse_users'], $('select#warehouse_users'),"name" );
						rma_page.add_default_select_html( data['rma']['common_error_id'],data['common_errors'], $('select#rma_common_error'),"error" );
						rma_page.add_default_select_html( data['rma']['credit_type_id'],data['credit_types'], $('select#rma_credit_type'),"type" );
						rma_page.add_default_select_html( data['rma']['claim_status_id'],data['claim_statuses'], $('select#rma_claim_status'),"status" );
						rma_page.add_default_select_html( data['rma']['claim_service_id'],data['claim_services'], $('select#rma_claim_service'),"service" );
						rma_page.add_fb_user_name_box( data['fb_users_data'] );
						that.add_cost_returned_product_html(data);
						
						$.each ( that.rma_pdf_files, function (i,v) {
							var pdf_type 	= v.split('_')[1];							
							$('a#'+pdf_type+'_attached_pdf').attr('prefix','/uploads/rma/'+data['rma']['path']+'/');
							if ( data['rma'][pdf_type+'_pdf_name'] != "" ) {
								var pdf_name = data['rma'][pdf_type+'_pdf_name'].split('_');
								$('a#'+pdf_type+'_attached_pdf').attr('href','/uploads/rma/'+data['rma']['path']+'/'+data['rma'][pdf_type+'_pdf_name']);
								$('a#'+pdf_type+'_attached_pdf').html(pdf_name[0]+".pdf");
								$('a#'+pdf_type+'_attached_pdf').attr('pdf_name',data['rma'][pdf_type+'_pdf_name']);
								$('button#'+pdf_type+'_attached_pdf_button').html('Change PDF');
							} else {
								$('a#'+pdf_type+'_attached_pdf').html('');
								$('a#'+pdf_type+'_attached_pdf').attr('pdf_name','');
								$('button#'+pdf_type+'_attached_pdf_button').html('Add PDF');
							}
						});
						
						$('#rma_number').html("RMA"+data['rma']['id']);
						$('#rma_assigned').html(data['rma']['first_name']+' '+data['rma']['last_name']);
						$('#rma_created').html(pretty_datetime(data['rma']['created']));
						$('#rma_modified').html(pretty_datetime(data['rma']['last_updated']));
						$('#rma_title').val(data['rma']['title']);
						$('#rma_credit_date').val(pretty_date(data['rma']['credit_date']));
						$('#rma_credit_amount').val(data['rma']['credit_amount']);
						$('#rma_action_taken').val(data['rma']['action_taken']);	
						$('#rma_return_date').val(pretty_date(data['rma']['return_date']));
						$('#rma_claim_number').val(data['rma']['claim_number']);
						$('#rma_check_number').val(data['rma']['check_number']);
						$('#rma_items_returned').val(data['rma']['items_returned']);
						$('#rma_claim_amount').val(data['rma']['claim_amount']);
						$('#rma_items_sent').val(data['rma']['items_sent']);
						$('#rma_claim_submitted').val(pretty_date(data['rma']['claim_submitted']));
						$('#rma_return_tracking').val(data['rma']['return_tracking']);
						$('#rma_claim_finalized').val(pretty_date(data['rma']['claim_finalized']));
						$('#rma_sent_tracking').val(data['rma']['sent_tracking']);
						
						$('#rma_comment').val('').autoResize({
							extraSpace: 15,
							onResize: function() {
								$(this).closest('.jspScrollable').jScrollPane({autoReinitialise: true});
							}
						});
						
						//set comments
						var rma_comments_html = "";
						$.each ( data['comments'], function (i,v) {
							rma_comments_html += rma_page.build_rma_comment_html(v);
						});

						$('#rma_comment_display').html(rma_comments_html);
						
						//truncate this as it is going to check again
						$('#rma_return_status').html('');
						$('#rma_sent_status').html('');
						
						//show since data is set
						$('div.rma_right > div.rma_phtml').show();
						
						//reset scroll bar for new one
						that.refresh_rma_window();
						
						if ( $('#rma_return_tracking').val() != "" ) {
							that.rma_tracking_status.push( that.get_return_tracking() );
						}
						if ( $('#rma_sent_tracking').val() != "" ) {
							that.rma_tracking_status.push( that.get_sent_tracking() );
						}
					}
			)
		);
	}
	
	this.update_rma_form = function () {
		if ( double_click_check() ) { return false; }
		var rma = {};
		var reasonBlank = false;
		var conditionBlank = false;
		var relevantIssueRequired = false;
		var statusClosed = false;
		var runAJAX = true;
		
		rma.rma_id				= that.rma_id;
		rma.cust_id				= that.cust_id;
		rma.fishbowl_id			= that.fishbowl_id;
		rma.account_id			= that.account_id;
		rma.display_name		= that.display_name;
		rma.status_id			= $('#rma_status').val();
		rma.title				= $('#rma_title').val();
		rma.rma_pdf_name		= $('a#rma_attached_pdf').attr('pdf_name');
		rma.cra_pdf_name		= $('a#cra_attached_pdf').attr('pdf_name');
		rma.rl_pdf_name			= $('a#rl_attached_pdf').attr('pdf_name');
		rma.wh_pdf_name			= $('a#wh_attached_pdf').attr('pdf_name');
		rma.contact_id			= $('#rma_contact_name').val();
		rma.contact_type		= $('#rma_contact_name option:selected').attr('contact_type');
		rma.store_id			= $('#rma_store').val();
		rma.action_taken		= $('#rma_action_taken').val();
		rma.return_date			= $('#rma_return_date').val();
		rma.items_returned		= $('#rma_items_returned').val();
		rma.items_sent			= $('#rma_items_sent').val();
		rma.return_tracking		= $('#rma_return_tracking').val();
		rma.sent_tracking		= $('#rma_sent_tracking').val();
		rma.credit_date			= $('#rma_credit_date').val();
		rma.credit_amount		= $('#rma_credit_amount').val();
		rma.credit_type_id		= $('#rma_credit_type').val();
		rma.claim_status_id		= $('#rma_claim_status').val();
		rma.common_error_id		= $('#rma_common_error').val();
		rma.claim_number		= $('#rma_claim_number').val();
		rma.check_number		= $('#rma_check_number').val();
		rma.claim_amount		= $('#rma_claim_amount').val();
		rma.claim_submitted		= $('#rma_claim_submitted').val();
		rma.claim_finalized		= $('#rma_claim_finalized').val();
		rma.claim_service_id	= $('#rma_claim_service').val();
		rma.comment				= $('#rma_comment').val();
		rma.invoices			= [];
		rma.products			= [];
		rma.pictures			= [];
		
		$.each( $('div#rma_invoices div p'), function (i,v) {
			rma.invoices.push($(v).html());
		});
		
		if(rma.status_id == 5)statusClosed = true;
		
		$.each( $('#full-rma div.products_box tr'), function (i,v) {
			var temp = {};
			temp.reason			= $(this).children('td:nth-child(2)').children('select').val();
			if ( temp.reason == "blank" || temp.reason == "0") { temp.reason = 0; reasonBlank = true;}
			if ( temp.reason == "4" || temp.reason == "5") { relevantIssueRequired = true;}
			temp.condition		= $(this).children('td:nth-child(3)').children('select').val();
			if ( temp.condition == "blank" || temp.condition == "0") { temp.condition = 0; conditionBlank = true;}
			temp.quantity		= $(this).children('td:nth-child(4)').children('input').val();
			temp.product_id		= $(this).children('input').val();
			rma.products.push(temp);
		});
		
		if(reasonBlank == true){
			$.prompt('If you add a product the return reason must be picked before saving RMA. Please add reason and save again, or your changes will not be saved.');
			dc_prevent = false;
			runAJAX = false;
			}
		if(conditionBlank == true && statusClosed == true){
			         $.prompt('If products were returned the return condition must be added before closing RMA status and saving RMA. Please add a condition for the products and save again, or your changes will not be saved.');
			         dc_prevent = false;
			         runAJAX = false;
			         }
		if(relevantIssueRequired == true && rma.common_error_id	== 0){
			         $.prompt('If product return reason is warehouse or invoice error a personnel based relevant issue must be picked. Please add a relevant issue and save again, or your changes will not be saved.');
			         dc_prevent = false;
			         runAJAX = false;
			         }
		if(rma.store_id == "" || rma.store_id	== 0){
			         $.prompt('You must pick a storefront before saving the page');
			         dc_prevent = false;
			         runAJAX = false;
			         }
		$.each ( $('div.rma_pictures div.picture_text div'), function ( i,v) {
			rma.pictures.push($(this).children('a').html());
		});
		if(runAJAX == true){
		$.ajax({
			url        : '/php/ajax.php?ref=set_rma_info',
			dataType   : 'text',
			data       : rma,
			type       : 'POST',
			success   : function ( data ) {
				that.set_rma_list(false,true);
				that.set_rma_form(that.rma_id);
				recent_updates.get_recent_updates();
				that.rma_change = false;
				$.prompt(set_loading_screen('RMA has been saved.',true));
			},
			error: function ( data ) {
				setTimeout(function(){$.prompt.goToState('state2')},2000);
			},
			complete: function ( data ) {
				dc_prevent = false;
			}
		});
		}
	}
	
	
	this.set_rma_list = function (setinfo,setactiverma,addtomini) {
		$.get(
			"/php/ajax.php?ref=get_rma_page_left_menu&customer_id="+that.cust_id,
				function ( data ) {
					$('#full-rma div.rma-left div.left-menu div.content').empty();
					if ( data == "" ) {
						$('#full-rma div.rma-right').hide();
					} else {
						$('#full-rma div.rma-right').show();
					}
					$('#full-rma div.rma-left div.left-menu div.content').append(data);
					if ( setinfo && !setactiverma) { 			
						var ticket = $('#full-rma div.rma-left > div.rma-top-area > div.left-menu div.content_container table tr:nth-child(1) td:nth-child(1)').html();
						//console.log(ticket);
						if ( typeof ticket != "undefined" ) {
							if (use_window_controller) {
								var state = $.bbq.getState();
								
								state.a = 'rma';
								delete state.b;
								state.id = ticket;
								
								$.bbq.pushState(state, 2);
							} else {
								rma_page.set_active_page( ticket );
							}
						}
					} else if ( setinfo && setactiverma ) {
						if (use_window_controller) {
							var state = $.bbq.getState();
							
							state.a = 'rma';
							delete state.b;
							state.id = "RMA"+that.rma_id;
							
							$.bbq.pushState(state, 2);
						} else {
							rma_page.set_active_page("RMA"+that.rma_id);
						}
					} else if ( setactiverma ) {
						if (use_window_controller) {
							var state = $.bbq.getState();
							
							state.a = 'rma';
							delete state.b;
							state.id = "RMA"+that.rma_id;
							
							$.bbq.pushState(state, 2);
							rma_page.set_active_ticket("RMA"+that.rma_id);
						} else {
							rma_page.set_active_ticket("RMA"+that.rma_id);
						}
					}
					
					if ( addtomini ) {
						rma_page.add_new_html_to_mini_box();
					}
					
					if ( !setinfo && !setactiverma && !addtomini ) {
						$('div.rma_right').hide();
					}
					
					that.refresh_rma_window();
				}
		);
	}
		
	this.set_add_pictures_event = function () {
		$('#rma_add_picture_file').replaceWith('<input style="display: none;" type="file" id="rma_add_picture_file" name="rma_add_picture_file[]" multiple>');
		$('#rma_add_picture_file').on('change', function (e) {
			if(!e.target.files) return;
			that.check_picture_files(e.target.files);
		});
	}
	
	this.set_add_rma_pdf_event = function () {	
		$.each ( that.rma_pdf_files, function (i,v) {
			$('#'+v).replaceWith('<input type="file" id="'+v+'" name="'+v+'" style="display:none;"></input>');
			
			$('#'+v).on('change', function (e) {
				if(!e.target.files) return;
				that.rma_ajax_file_upload(v);
			});
		});
				
	}
	
	this.add_invoice_html = function (invoice_dates) {
		$('div#rma_invoices').empty();
		$('div#rma_invoice_dates').empty();
		
		if ( typeof invoice_dates != "undefined" ) {
			$.each ( invoice_dates, 
					function (i,v) {
						$('div#rma_invoices').prepend('<div class="relative"><span>Invoice:</span><p>'+i+'</p><img src="/images/RMA_removeproduct.png"></div>');
						$('div#rma_invoice_dates').prepend('<div class="relative"><span>Invoice Date:</span><p>'+pretty_datetime(v)+'</p><input type="hidden" value="'+i+'"></input></div>');
					}
			);
		} 
	};
	
	this.add_cost_returned_product_html = function(data){
		var html = "";
		$.each(data['attached_products_data'], function(i,v){
			var cost = 0;
			var qty = 0;
			$.each(data['products'], function(i1,v1){
				if(v['product_id']===v1['product_id']){
					cost = v['amount']/v['quantity']*v1['quantity'];
					qty = v1['quantity'];
				}
			});
			html += '<div class="rma_block"><span>'+v['part_num']+'--'+qty+'ea</span><span>$'+cost.toFixed(2)+'</span></div>';
		});
		$('div#returned_products_cost').html(html);
	};
	
	this.add_new_invoice_html = function (bypass) {
		var to_add	= $('#rma_add_invoice').val();
		var is_added = false;
		if ( $('#rma_add_invoice')[0].tagName.toLowerCase() == "input" & bypass != true  ){
			that.get_rma_check_invoice();
			return false;	
		}
		//check for already added
		$.each( $('#rma_invoices > div > p'),function () {
			if ( to_add == $(this).html() ){
				is_added = true;
			}
		});
		
		//$("select#rma_add_invoice option[value='"+to_add+"']").remove();
		if ( !is_added ) {
			$('div#rma_invoices').append('<div class="relative"><span>Invoice:</span><p>'+to_add+'</p><img src="/images/RMA_removeproduct.png"></div>');
			$('div#rma_invoice_dates').append('<div class="relative"><span>Invoice Date:</span><p id="invoice_date_'+to_add+'">Loading...</p><input type="hidden" value="'+to_add+'"></input></div>');
			that.set_invoice_date_html(to_add,$('#invoice_date_'+to_add));
			that.update_note_added_product_html();
			that.refresh_contact_list();
			that.rma_change = true;
		} else {
			$.prompt("The specified invoice is already added.");
		}
	};
	
	this.add_invoice_select_html = function (unused) {
		
		var temp = "<option value=''>Choose Invoice!</option>";
		$.each ( unused.slice(0,500), function (i,v) {
			temp = temp + "<option value='"+v+"'>"+v+"</option>";
		});
		$('select#rma_add_invoice').empty();
		$('select#rma_add_invoice').append(temp);
	}
	
	this.add_product_html = function (products,keep_current) {
		if ( keep_current != true ) {
			$.each( $('#full-rma div.rma_phtml > div.rma-scroll-container div.rma_products > div > table > tbody > tr'), function (i,v) {
				if ( i != 0 ) {
					$(this).remove();
				}
			});
		}
		if ( typeof products == "undefined" ) {
			return false;
		}
		$.each( products, 
			function (i,v) {
				$('#full-rma div.rma_phtml > div.rma-scroll-container div.rma_products > div > table > tbody').append(
					'<tr>'+
						'<td><div><img src="/images/RMA_removeproduct.png"></img><p>'+v['part_num']+'</p></div></td>'+
						'<td><select>'+that.generate_product_return_reason_select_html(v['reason_id'],that.product_reasons,'reason','2')+'</select></td>'+
						'<td><select>'+that.generate_product_select_html(v['condition_id'],that.product_conditions,'term','3')+'</select></td>'+
						'<td><input type="text" value="'+v['quantity']+'"></input></td>'+
						'<input type="hidden" value="'+v['product_id']+'"></input>'+
					'</tr>'
				);
			}
		);		
	}
	
	this.add_new_product_html = function () {
		var to_add 		= $('select#rma_not_added_products option:selected').text()
		var to_add_id	= $('select#rma_not_added_products option:selected').val()
		var temp 		= [];
		var tempobj		= {};
		
		if ( to_add == "" ) { return false; }
		
		$('select#rma_not_added_products option:selected').remove();
		
		tempobj.condition_id	= 0;
		tempobj.part_num		= to_add;
		tempobj.product_id		= to_add_id;
		tempobj.quantity		= 1;
		tempobj.reason_id		= 0;
		temp.push(tempobj);
		
		that.add_product_html(temp,true);
		that.rma_change = true;
	}
	
	this.add_not_added_product_html = function ( products ) {
		var temp = "";
		$.each ( products, function ( i,v ) {
			temp = temp + "<option value='"+v['product_id']+"'>"+v['part_num']+"</option>";
		});
		
		$('select#rma_not_added_products').empty();		
		$('select#rma_not_added_products').append(temp);
	}
	
	this.add_pictures_html = function ( pictures ) {
		var temp = "";
		$.each ( pictures, function ( i,v ) {
			temp = temp + that.set_picture_html(v);
		});
		$('div.rma_pictures div.picture_text').empty();
		$('div.rma_pictures div.picture_text').append(temp);		
	}
	
	this.add_new_pictures_html = function (files) {
		var temp = "";
		for(var i=0; i < files.length; i++) {
			temp = temp + that.set_picture_html(files[i]['name']);
		}
		$('div.rma_pictures div.picture_text').append(temp);
		that.refresh_rma_window();
		that.rma_change = true;
	}
	
	this.set_picture_html = function (name) {
		return "<div><img src='/images/RMA_removeproduct.png'></img>"+
			   "<a class='fancybox' data-fancybox-group='gallery' title='"+name+"' href='/uploads/rma/"+that.path+"/"+name.replace("#","%23")+"'>"+name+"</a>"+
			   "</div>";
	}
	
	this.update_note_added_product_html = function () {
		var temp = {};
		var tempnums = [];
		
		$.each ( $('div#rma_invoices div'), function () {
			tempnums.push($(this).children('p').html());
		});
		temp.nums 	= tempnums;
		temp.id		= that.rma_id;
		
		if ( tempnums.length > 0 ) {
			$.ajax({
				url        : '/php/ajax.php?ref=get_addable_products',
				dataType   : 'text',
				data       : temp,
				type       : 'POST',
				success   : function ( data ) {
					data = $.parseJSON(data);
					var listed = {};
					var addable = {};
					
					$.each( $('div.products_box tr'), function (ia,va) { 
						if (typeof $(va).children('input').val()!="undefined") {
							listed[parseInt($(va).children('input').val())] = va;
						}
					});
					$.each( data, function (i,v) { addable[parseInt(v['product_id'])] = v; });
	
					
					$.each( listed, function(i,v){
						//console.log(typeof addable[i]);
						if ( typeof addable[i] == "undefined" ){
							$(v).remove();	
						} else {
							delete addable[i];
						}
					});
					
					$('select#rma_not_added_products').empty();
					$.each( addable, function(i,v){
						$('select#rma_not_added_products').append('<option value="'+v['product_id']+'">'+v['part_num']+'</option>');
					});
				}
			});
		} else {
			$('select#rma_not_added_products').empty();
			$.each ( $('div.products_box tr'), function (i,v) {
				if ( i != 0 ){
					$(this).remove();
				}
			});
		}	
	}
		
	this.refresh_contact_list = function () {
		var invs = [];
		$.each( $('#rma_invoices').children('div'), function (i,v) {
			invs.push( $(this).children('p').html() );
		});
	
		$.get(
			"/php/ajax.php?ref=get_rma_contacts&invs="+invs.join(), 
				function ( data ) {
					data = $.parseJSON(data);
					rma_page.add_contact_select_html($('select#rma_contact_name').val(),data,"name",$('select#rma_contact_name'));					
				}
		);
	}
	
	this.generate_product_select_html = function ( id, array, name, child ) {
		var temp = "";
		if ( id == 0 ) { 
			var label = $('#full-rma div.rma_phtml > div.rma-scroll-container div.rma_products > div > table > tbody th:nth-child('+child+')').html();
			temp = "<option value='0'>Choose "+label+"</option>"; 
		}
		$.each ( array, function (i,v) {
			temp = temp + "<option value='"+v['id']+"'"+( v['id'] == id ? " selected" : "")+">"+v[name]+"</option>";
		});
		
		return temp;
	}
	
	this.generate_product_return_reason_select_html = function ( id, array, name, child ) {
		var temp = "";
		if ( id == 0 ) { 
			var label = $('#full-rma div.rma_phtml > div.rma-scroll-container div.rma_products > div > table > tbody th:nth-child('+child+')').html();
			temp = "<option value='0'>Choose "+label+"</option>"; 
		}
		$.each ( array, function (i,v) {
			if(v['id'] != '6' || id == '6')temp = temp + "<option value='"+v['id']+"'"+( v['id'] == id ? " selected" : "")+">"+v[name]+"</option>";
		});
		
		return temp;
	}
	
	this.add_new_rma = function () {
		if ( !that.adding_new_rma ) {
			that.adding_new_rma = true;
			$.get(
				"/php/ajax.php?ref=add_new_rma&cust_id="+this.cust_id+"&account_id="+this.account_id+"&display_name="+this.display_name, 
					function ( data ) {
						if ( data == "false" ) {
							$.prompt("No invoices on this account to create an RMA for.");
						} else if ( data != "" ) {
							that.set_rma_list(true,false,true);
							recent_updates.get_recent_updates();
						}
						setTimeout(
							function () {
								that.adding_new_rma = false;
							},
							10000	
						);
						
					}
			);
		}
	}
	
	this.del_invoice = function ($this) {
		var to_del = $this.siblings('p').html();
		$this.parent('div').remove();
		$.each ( $('div#rma_invoice_dates div'), function () {
			if ( $(this).children('input').val() == to_del ) {
				$(this).remove();
			}
		});
		$('select#rma_add_invoice').prepend("<option value='"+to_del+"'>"+to_del+"</option>");

		that.update_note_added_product_html();
		that.rma_change = true;
	}
	
	this.del_product = function ($this) {
		var to_del		= $this.siblings('p').html();
		var to_del_id	= $this.parents('tr').children('input').val();
		$this.parents('tr').remove();
		$('select#rma_not_added_products').append("<option value='"+to_del_id+"'>"+to_del+"</option>");		
		that.rma_change = true;
	}
	
	this.del_rma = function () {
		$.prompt("Are you sure you want to delete this RMA?", {
			buttons: { "Yes, Delete": true, "No": false },
			overlayspeed: "fast",
			submit: function(e,v,m,f){
				// use e.preventDefault() to prevent closing when needed or return false. 
				// e.preventDefault(); 
				if ( v === true ) {
					var rma_id = that.rma_id;
					if ( typeof rma_id != "undefined" ) {
						$.ajax({
							url: "/php/ajax.php?ref=del_rma&rma_id="+rma_id+"&cust_id="+that.cust_id+"&account_id="+that.account_id,
							type: 'GET',
							success: function ( data ) {
								that.set_rma_list(true);
								recent_updates.get_recent_updates();
							},
							error: function ( data ) {
								setTimeout(function () {$.prompt('Delete Failed, please try again.');},2000);
							}
						});
					}
				}
			}
		});
	}

	this.open_return_pdf = function (type) {
		rma_page.open_in_fancybox('/php/ajax.php?ref=open_pdf'
			+ '&id='+that.rma_id
			+ '&type='+type
		)
	}
	
	this.open_new_tab = function(url) {
	  var win=window.open(url, '_blank');
	  win.focus();
	}
	
	this.refresh_rma_window = function () {
		//$('div.rma-left div.left-menu div.content div.content').data('jsp').reinitialise();
		//$('div.rma-right div.rma_phtml div.rma-scroll-container').data('jsp').reinitialise();
	}
	
	this.get_return_tracking = function () {
		var request =
		$.get(
			"/php/ajax.php?ref=get_tracking_no_update&track="+$('#rma_return_tracking').val(), 
				function( data ) {	
					data = JSON.parse(data);
					if ( data['status'] == "Delivered" ) {
						$('#rma_return_status').html(data['status']+' '+pretty_datetime(data['delivered_time'],true) );
					} else { 
						$('#rma_return_status').html(data['status']);
					}
					that.refresh_rma_window();
				}
		);
		return request;
	}
	
	this.get_sent_tracking = function () {
		var request =
		$.get(
			"/php/ajax.php?ref=get_tracking_no_update&track="+$('#rma_sent_tracking').val(), 
				function( data ) {	
					data = JSON.parse(data);
					if ( data['status'] == "Delivered" ) {
						$('#rma_sent_status').html(data['status']+' '+pretty_datetime(data['delivered_time'],true) );
					} else { 
						$('#rma_sent_status').html(data['status']);
					}
					that.refresh_rma_window();
				}
		);
		return request;
	}
	
	this.set_invoice_date_html = function (num,ele) {
		$.get(
			"/php/ajax.php?ref=get_invoice_date&invoice_id="+num, 
				function ( data ) {
					$(ele).html(pretty_datetime(data));
				}
		);
	}

	
	this.check_picture_files = function (files) {
		var pictures_valid = true;
		//check for correct file type
		for(var i=0; i < files.length; i++) {
			var temp = files[i]['type'].split('/');
			if ( temp[0] != "image" ) {
				pictures_valid = false;
			}
		}
		//check for duplicates
		var tempnames = [];
		$.each ( $('div.rma_pictures div.picture_text div'), function ( i,v) {
			tempnames.push($(this).children('a').html());
		});
		var filenames = [];
		for(var i=0; i < files.length; i++) {
			for(var j=0; j < tempnames.length; j++) {
				if ( files[i]['name'] == tempnames[j] ) {
					$.prompt('Error, duplicate picture.');
					return;
				}
			}
			filenames.push(files[i]['name']);
		}
		
		if ( pictures_valid ) {
			if ( that.rma_ajax_file_upload("picture",filenames) ) {
				that.add_new_pictures_html(files);
			}
		} else {
			$.prompt('Invalid files, they must be pictures');
			return;
		}
	}
	
	this.rma_ajax_file_upload = function (type,pictures) {
		if ( type == "picture" ) {
			var file_name	= "rma_add_picture_file";
			var ref			= "rma_picture";
			var size_check	= 0;
			$.each ( $('#rma_add_picture_file')[0]['files'], function (i,v) {
				size_check += v['size'];
			});
			if ( size_check > 8388608 ) {
				$.prompt("Sum of picture(s) is greater than 8 Megabytes.");
				return false;
			}
		} else if ( type.substring(0,3) == "rma" ) {
			var file_name	= type;
			var ref			= "rma_pdf";
			var pdf_type 	= type.split('_');
			pdf_type 		= pdf_type[1];
		}
		
		var id_check = that.rma_id;
		
        $.ajaxFileUpload({
                url:'/php/ajax.php?ref=upload_files&type='+ref
	                +'&file_id='+file_name
	                +'&rma_id='+that.rma_id
	                +'&cust_id='+that.cust_id, 
	                secureuri:false,
                fileElementId: file_name,
                dataType: 'json',
                success: function (data)
                {
                	if ( data['error'] != "" ) {
                		if ( type == "picture" ) {
							$.each( pictures, function (i,v) {
								$.each( $('div.rma_pictures div.picture_text div a'), function (ii,vv) {
									if ( v == $(this).html() ) {
										$(this).parent('div').remove();
									}
								});
							});
						} 
						$.prompt(data['error']);
					} else {
						if ( id_check == that.rma_id ) {
							if ( type.substring(0,3) == "rma" ) {
								var temp = data['file_name'].split('_');
								$('a#'+pdf_type+'_attached_pdf').html(temp[0]+".pdf");
								$('a#'+pdf_type+'_attached_pdf').attr('href',$('a#'+pdf_type+'_attached_pdf').attr('prefix')+data['file_name']);
								$('a#'+pdf_type+'_attached_pdf').attr('pdf_name',data['file_name']);
								$('button#'+pdf_type+'_attached_pdf_button').html('Change PDF');
							}
						} 
					}
					that.rma_change = true;
                },
                error: function (data, status, e)
                {
                	console.log(e);
                    $.prompt('Connection error to server, while saving.');
					
					//remove the pictures so they can't be saved to the rma DB, since pictures didn't save to server

                },
	            complete: function (data) {
	            	that.set_add_pictures_event();
	            	that.set_add_rma_pdf_event();
	            },
       		});
        
        return true;
    };
}
