function qcra_vars() {
	var that = this;

	this.cust_id 				= $("input#customer_id").val();
	this.fishbowl_id			= $("input#fishbowl_id").val();
	this.username 				= $("input#username").val();
	this.account_id				= $("input#account_id").val();
	this.display_name			= $("input#display_name").val();
	this.$haspdf				= $('tr.has_pdf');
	this.$nopdf					= $('tr.no_pdf');
	this.path					= "";
	this.shipping_items			= "";
	this.qcra_change			= false;
	this.qcra_info				= "";
	//protection on both
	//creating cra/rma NEED TO DEAL
	this.adding_new_qcra		= false;
	this.tracking_request		= "";

	//start all the event listeners
	this.start = function () {
		//pdf attaching / closing
		that.pdf_close_allowed		= !$.isEmptyObject(array_intersect(["1","2","10"],$('#user_groups').val().split(',')));

		that.set_add_qcra_pdf_event();

		//ADD NEW QCRA
		$('button#qcra_add').on('click', function() {
			that.add_new_qcra();
		});

		//UPDATE QCRA
		$('#qcra_update').on('click', function () {
			that.set_qcra_form();
		});

		//CHANGING INVOICE
		$('#qcra_invoices select').on('change', function () {
			//prevent items from other orders being saved
			that.clear_included_products();
			that.clear_shipping_items();
			$('#qcra_not_added_products').empty();
			that.reset_shipping_items();
			if ( typeof $('#qcra_invoices > select > option:selected').attr('value') != "undefined" ) {
				that.getset_invoice_date ( $(this).val() );
				that.getset_included_products( $(this).val() );
				that.refresh_contact_list();
				$.each( $('.qcra_btns > button:nth-child(n+4):nth-child(-n+6)'), function (i,v) {
					if ( $(this).hasClass('qcra_selected') ) {
						if ( $(this).attr('value') > 1 ) {
							that.getset_total_cost_of_invoice( $('#qcra_invoices > select').val() );
						}
					}
				});
			}
			that.qcra_change = true;
		});

		//ADD PRODUCT
		$('#qcra_add_product_button').on('click', function () {
			that.add_included_product();
			that.set_missed_discount_total_cost();
			that.refresh_qcra_window();
			that.qcra_change = true;
		});

		//DELETE PRODUCT
		$('div.qcra_products div.products_box').on('click','table td div img', function () {
			that.del_included_product( $(this) );
			that.set_missed_discount_total_cost();
			that.refresh_qcra_window();
			that.qcra_change = true;
		});

		//ADD Shipping ITEM
		$('#qcra_add_shipping_items_button').on('click', function () {
			that.add_shipping_item();
			that.set_missed_discount_total_cost();
			that.refresh_qcra_window();
			that.qcra_change = true;
		});

		//DELETE SHIPPING ITEM
		$('div.qcra_shipping div.shipping_box').on('click','table td div img', function () {
			that.del_shipping_item( $(this) );
			that.set_missed_discount_total_cost();
			that.refresh_qcra_window();
			that.qcra_change = true;
		});

		//CHANGE CUSTOM NAME ON LESS SHIPPING
		$('div.qcra_shipping > div.shipping_box table').on("click","tr > td > div > span[value=8]", function () {
			var temp = $(this).parent('div');
			$(this).replaceWith('<input value="'+$(this).html()+'"></input>');
			$(temp).children('input:nth-child(2)').focus();
			that.qcra_change = true;
		});
		
		//focus out...
		$('div.qcra_shipping > div.shipping_box table').on("blur","tr > td > div > input",function () {
			$(this).replaceWith('<span value="8">'+$(this).val()+'</span>');
			that.qcra_change = true;
		});
		
		//for enter key
		$('div.qcra_shipping > div.shipping_box table').on("keyup","tr > td > div > input",function (event) {
			if(event.keyCode == 13) {
				$(this).focusout();
			}
		});

		//BUTTON CLICK
		$('.qcra_btns > button:nth-child(n+4):nth-child(-n+6)').on("click", function () {
			$.each( $('.qcra_btns > button:nth-child(n+4):nth-child(-n+6)'), function (i,v) {
				$(this).removeClass("qcra_selected");
			});
			if ( $(this).attr('id') == "qcra_md" ) {
				$(this).addClass("qcra_selected");
				that.set_form_as_md();
			} else if ( $(this).attr('id') == "qcra_mv" ) {
				$(this).addClass("qcra_selected");
				that.set_form_as_mv();
			} else if ( $(this).attr('id') == "qcra_sdv" ) {
				$(this).addClass("qcra_selected");
				that.set_form_as_sdv();
			}
			that.refresh_qcra_window();
			that.qcra_change = true;
		});

		//PRINT QCRA
		$('button#qcra_pdf').on("click", function() {
			$.each( $('.qcra_btns > button:nth-child(n+4):nth-child(-n+6)'), function (i,v) {
				if ( $(this).hasClass('qcra_selected') ) {
					if ( $(this).attr('id') == "qcra_md" ) {
						that.open_return_pdf("qcra_missed_discount");
					} else if ( $(this).attr('id') == "qcra_mv" ) {
						that.open_return_pdf("qcra_missed_void");
					} else if ( $(this).attr('id') == "qcra_sdv" ) {
						that.open_return_pdf("qcra_same_day_void");
					}
				}
			});
		});

		//ADD/CHANGE PDF
		$('#qcra_attached_pdf_button').on('click', function () {
			if ( that.pdf_close_allowed ) {
				$('#qcra_file').click();
			} else {
				$.prompt("Only accounting can add PDF's to the QCRA.");
			}
		});

		//ON CHANGE ADJUSTOR FOR INC PRODUCTS
		$('div.qcra_products > div.products_box table').on("keyup","td > input", function () {
			that.set_missed_discount_total_cost();
			that.qcra_change = true;
		});

		//ON CHANGE ADJUSTOR FOR LESS SHIPPING
		$('div.qcra_shipping > div.shipping_box table').on("keyup","td > input", function () {
			that.set_missed_discount_total_cost();
			that.qcra_change = true;
		});
		
		//Global change detection
		$('div.qcra_phtml div.rma-scroll-container div.rma-scroll div.rma_block :nth-child(2)').on('change',function () {
			that.qcra_change = true;
		});
		
		//comment change
		$('#qcra_comment').on("change",function(){
			that.qcra_change = true;
		});
		

		$('#qcra_prepaid').on("change", function() {
			that.set_missed_discount_total_cost();
		});
		$('#qcra_sales_tax').on("change", function() {
			that.set_missed_discount_total_cost();
		});
		
		//remove pdf
		$('#qcra_remove_pdf_button').on('click',function(){
			rma.remove_pdf("qcra");
			that.qcra_change = true;
		});
	}

	this.add_new_qcra = function () {
		if ( !that.adding_new_qcra ) {
			that.adding_new_qcra = true;
			$.get(
				"/php/ajax.php?ref=add_new_qcra&cust_id="+this.cust_id+"&account_id="+this.account_id+"&display_name="+this.display_name,
					function ( data ) {
						if ( data == "false" ) {
							$.prompt("No invoices on this account to create an QCRA for.");
						} else if ( data != "" ) {
							that.set_list(true,false,true);
							recent_updates.get_recent_updates();
						}
						setTimeout(
							function () {
								that.adding_new_qcra = false;
							},
							10000	
						);
					}
			);
		}
	}

	this.del_qcra = function () {
		$.prompt("Are you sure you want to delete this QCRA?", {
			buttons: { "Yes, Delete": true, "No": false },
			overlayspeed: "fast",
			submit: function(e,v,m,f){
				// use e.preventDefault() to prevent closing when needed or return false.
				// e.preventDefault();
				if ( v === true ) {
					var qcra_id = that.qcra_id;
					if ( typeof qcra_id != "undefined" ) {
						$.ajax({
							url: "/php/ajax.php?ref=del_qcra&qcra_id="+qcra_id+"&cust_id="+that.cust_id+"&account_id="+that.account_id,
							type: 'GET',
							success: function ( data ) {
								that.set_list(true);
								recent_updates.get_recent_updates();
							},
							error: function ( data ) {
								setTimeout(function () {$.prompt('Delete Failed, please try again.')},2000);
							}
						});
					}
				}
			}
		});
	}

 	this.set_list = function (setinfo,setactiverma,addtomini) {
		$.get(
			"/php/ajax.php?ref=get_rma_page_left_menu&customer_id="+that.cust_id,
				function ( data ) {
					$('#full-rma div.rma-left div.left-menu div.content').empty();
					if ( data == "" ) {
						$('div.rma-right').hide();
					} else {
						$('div.rma-right').show();
					}
					$('#full-rma div.rma-left div.left-menu div.content').append(data);


					if ( setinfo && !setactiverma) {
						var ticket = $('#full-rma div.rma-left > div.rma-top-area > div.left-menu div.content_container table tr:nth-child(1) td:nth-child(1)').html();
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
							state.id = "QCRA"+that.qcra_id;
							
							$.bbq.pushState(state, 2);
						} else {
							rma_page.set_active_page("QCRA"+that.qcra_id);
						}
					} else if ( setactiverma ) {
						if (use_window_controller) {
							var state = $.bbq.getState();
							
							state.a = 'rma';
							delete state.b;
							state.id = "QCRA"+that.qcra_id;
							
							$.bbq.pushState(state, 2);
							rma_page.set_active_ticket("QCRA"+that.qcra_id);
						} else {
							rma_page.set_active_ticket("QCRA"+that.qcra_id);
						}
					}
					
					if ( addtomini ) {
						rma_page.add_new_html_to_mini_box();
					}

					if ( !setinfo && !setactiverma && !addtomini ) {
						$('div.rma_right').hide();
					}

					that.refresh_qcra_window();
				}
		);
	}

	this.set_form_as_md = function () {
		$('#qcra_products_and_shipping').show();
		$('#qcra_credit_amount').attr('disabled',true);
		$('#qcra_contact_name').parent('div').show();
		$('#qcra_store').parent('div').show();
		$('#qcra_prepaid').parent('div').show();
		$('#qcra_sales_tax').parent('div').show();
		$('#qcra_credit_amount').parent('div').show();
		qcra.set_missed_discount_total_cost();
		$('#qcra_credit_type').parent('div').show();
		$('#qcra_credit_date').siblings('span').html('Credit Date:');
		if ( that.qcra_info['credit_date'] && that.qcra_info['credit_date'] != "0000-00-00" ) {
			$('#qcra_credit_date').val(pretty_datetime(that.qcra_info['credit_date'],true));
		} else {
			$('#qcra_credit_date').val('');
		}
	}

	this.set_form_as_mv = function () {
		$('#qcra_products_and_shipping').hide();
		$('#qcra_contact_name').parent('div').hide();
		$('#qcra_store').parent('div').show();
		$('#qcra_prepaid').parent('div').hide();
		$('#qcra_prepaid').val(0);
		$('#qcra_sales_tax').parent('div').hide();
		$('#qcra_sales_tax').val(0);
		$('#qcra_credit_amount').attr('disabled',true);
		$('#qcra_credit_amount').parent('div').show();
		$('#qcra_credit_amount').val( number_format(that.qcra_info['total'],2) );
		that.getset_total_cost_of_invoice( $('#qcra_invoices > select').val() );
		$('#qcra_credit_type').parent('div').show();
		$('#qcra_credit_date').siblings('span').html('Void Date:');
		if ( that.qcra_info['credit_date'] && that.qcra_info['credit_date'] != "0000-00-00" ) {
			$('#qcra_credit_date').val(pretty_datetime(that.qcra_info['credit_date'],true));
		} else {
			$('#qcra_credit_date').val('');
		}

	}

	this.set_form_as_sdv = function () {
		$('#qcra_products_and_shipping').hide();
		$('#qcra_contact_name').parent('div').hide();
		$('#qcra_store').parent('div').hide();
		$('#qcra_sales_tax').parent('div').hide();
		$('#qcra_sales_tax').val(0);
		$('#qcra_prepaid').parent('div').hide();
		$('#qcra_prepaid').val(0);
		$('#qcra_credit_amount').parent('div').hide();
		that.getset_total_cost_of_invoice( $('#qcra_invoices > select').val() );
		$('#qcra_credit_type').parent('div').hide();
		$('#qcra_credit_date').siblings('span').html('Void Date:');
		$('#qcra_credit_date').val( $('#qcra_created').html().substring(0,10) );
	}

	this.set_missed_discount_total_cost = function () {
		var inc_products	= [];
		var inc_shipping	= [];
		var sub_total		= 0;
		var minus_total		= 0;
		var sales_tax		= 0;
		var prepaid			= 0;
		if ( $('#qcra_prepaid').val() != 0 ) {
			prepaid = $('#qcra_prepaid option:selected').attr('percent')/100;
		}
		if ( $('#qcra_sales_tax').val() != 0 ) {
			sales_tax = $('#qcra_sales_tax option:selected').attr('percent')/100;
		}

		$.each( $('div.qcra_products > div.products_box table tr'), function(i,v) {
			if (i!=0){
				sub_total += $(this).children('td:nth-child(2)').children('input').val()*$(this).children('td:nth-child(3)').children('input').val();
			}
		});
		$.each( $('div.qcra_shipping > div.shipping_box table tr'), function(i,v) {
			if (i!=0){
				minus_total += $(this).children('td:nth-child(2)').children('input').val()*$(this).children('td:nth-child(3)').children('input').val()
			}
		});

		//take out prepaid if its there
		var prepaid_amt = sub_total*prepaid;
		sub_total = sub_total-prepaid_amt; // this will be minus 0 a lot.

		//calc sales tax
		var sales_tax_total = sub_total*sales_tax;

		//adjust for shipping
		sub_total = sub_total - minus_total;

		var grand_total = sub_total+sales_tax_total;
		$('#qcra_credit_amount').val( number_format( grand_total,2));
	}

	this.getset_total_cost_of_invoice = function (inv_id) {
		if ( inv_id != "Choose Invoice" ) {
			$.get(
				"/php/ajax.php?ref=get_total_cost&inv_id="+inv_id,
					function( data ) {
						$('#qcra_credit_amount').val( number_format(data,2) );
					}
			);
		}
	}

	this.getset_qcra_form = function (qcra_id) {
		if ( typeof qcra_id != "undefined" ) {
			that.qcra_id = qcra_id;
		}

		that.qcra_tracking_status 	= [];

		that.qcra_tracking_status.push(
			$.get(
				"/php/ajax.php?ref=get_qcra_info&qcra_id="+that.qcra_id+"&account_id="+that.account_id,
					function( data ) {
						data = $.parseJSON(data);
						//save to use later...
						that.qcra_info = data;
						that.path					= data['path'];

						$('#qcra_number').html("QCRA"+data['id']);
						$('#qcra_assigned').html(data['assigned']);
						rma_page.add_default_select_html( data['status_id'],data['statuses'],$('select#qcra_status') );
						$('#qcra_title').val(data['title']);
						$('#qcra_created').html(pretty_datetime(data['created']));
						$('#qcra_modified').html(pretty_datetime(data['last_updated']));

						//qcra_invoices
						rma_page.add_default_select_with_percent_html( data['prepaid_id'],data['prepaid_types'],$('select#qcra_prepaid') );
						rma_page.add_default_select_with_percent_html( data['sales_tax_id'],data['sales_tax_types'],$('select#qcra_sales_tax') );
						rma_page.add_contact_select_html( data['contact_id'],data['contacts'],"name",$('select#qcra_contact_name') );
						rma_page.add_default_select_html( data['common_error_id'],data['common_errors'], $('select#qcra_common_error'),"error" );
						$('#qcra_credit_date').val( pretty_datetime( data['credit_date'],true ) );
						rma_page.add_default_select_html( data['store_id'],data['stores'],$('select#qcra_store') );
						$('#qcra_reason_cc_info').val(data['reason_cc_info']);
						rma_page.add_default_select_html( data['credit_type_id'],data['credit_types'],$('select#qcra_credit_type') );

						that.set_invoice_html( data['invoices'],data['invoice_id'] );
						$('#qcra_invoice_date').html( pretty_datetime(data['invoice_date']) );


						$('#qcra_comment').val('').autoResize({
							extraSpace: 15,
							onResize: function() {
								that.refresh_qcra_window();
							}
						});
						rma_page.add_fb_user_name_box( data['fb_users_data'] );
						
						
						//set comments
						var qcra_comments_html = "";
						$.each ( data['comments'], function (i,v) {
							qcra_comments_html += rma_page.build_rma_comment_html(v);
						});

						$('#qcra_comment_display').html(qcra_comments_html);

						//ADD INCLUDED PRODUCTS TO SELECT OPTIONS
						qcra_products_html = "";
						$.each( data['products'], function (i,v) {
							qcra_products_html += "<option value='"+v['fishbowl_product_id']+"'>"+v['part_num']+"</option>";
						});
						$('#qcra_not_added_products').html(qcra_products_html);


						//ADD LESS SHIPPING ITEMS TO SELECT OPTIONS
						that.shipping_items = data['shipping_items'];
						that.reset_shipping_items();


						//Add included products from attached_products
						that.clear_included_products();
						that.clear_shipping_items();

						$.each( data['included_products'], function (i,v) {
							$('.qcra_products > .products_box table').append( that.add_product_html( v['product_id'],v['name'],v['cost'],v['quantity'] ) );
							$('#qcra_not_added_products option[value='+v['product_id']+']').remove();
						});

						$.each( data['less_shipping_items'], function(i,v) {
							$('div.qcra_shipping > div.shipping_box table').append( that.add_product_html( v['product_id'],v['name'],v['cost'],v['quantity'] ) );
							$('#qcra_shipping_items option[value='+v['product_id']+']').remove();
						});

						//add in custom additions...
						$.each( data['custom_shipping_items'], function(i,v) {
							$('div.qcra_shipping > div.shipping_box table').append( that.add_product_html( v['product_id'],v['name'],v['cost'],v['quantity'] ) );
						});


						//PDF SETTINGS
						var pdf_type = "qcra";
						$('a#'+pdf_type+'_attached_pdf').attr('prefix','/uploads/qcra/'+data['path']+'/');
						if ( data[pdf_type+'_pdf_name'] != "" ) {
							var pdf_name = data[pdf_type+'_pdf_name'].split('_');
							$('a#'+pdf_type+'_attached_pdf').attr('href','/uploads/qcra/'+data['path']+'/'+data[pdf_type+'_pdf_name']);
							$('a#'+pdf_type+'_attached_pdf').html(pdf_name[0]+".pdf");
							$('a#'+pdf_type+'_attached_pdf').attr('pdf_name',data[pdf_type+'_pdf_name']);
							$('button#'+pdf_type+'_attached_pdf_button').html('Change PDF');
						} else {
							$('a#'+pdf_type+'_attached_pdf').html('');
							$('a#'+pdf_type+'_attached_pdf').attr('pdf_name','');
							$('button#'+pdf_type+'_attached_pdf_button').html('Add PDF');
						}


						$.each( $('.qcra_btns > button:nth-child(n+4):nth-child(-n+6)'), function (i,v) {
							$(this).removeClass("qcra_selected");
						});

						if ( data['type'] == 1 ) {
							$('#qcra_md').addClass('qcra_selected');
							that.set_form_as_md();
						} else if ( data['type'] == 2 ) {
							$('#qcra_mv').addClass('qcra_selected');
							that.set_form_as_mv();
						} else if ( data['type'] == 3 ) {
							$('#qcra_sdv').addClass('qcra_selected');
							that.set_form_as_sdv();
						}

						//show since data is set
						$('div.rma_right > div.qcra_phtml').show();

						//refresh scroll bar
						that.refresh_qcra_window();
					}
			)
		);
	}

	this.set_qcra_form = function () {
		var runAJAX = true;
		if ( double_click_check() ) { return false; }
		//admin/dev/accounting
		if ( $('#qcra_status').val() == 2 && !that.pdf_close_allowed )  {
			$.prompt("Only accounting can set the status of QCRA's to closed.");
			dc_prevent = false;
		} else {
			var qcra = {};

			qcra.id				= that.qcra_id;
			qcra.cust_id		= that.cust_id;
			qcra.account_id		= that.account_id;
			qcra.status_id		= $('#qcra_status').val();
			qcra.title			= $('#qcra_title').val();
			if ( typeof $('#qcra_invoices > select > option:selected').attr('value') == "undefined" ) {
				qcra.invoice_id		= 0;
			} else {
				qcra.invoice_id		= $('#qcra_invoices > select').val();
			}

			qcra.inc_products	= [];
			$.each( $('div.qcra_products > div.products_box > table tr'), function(i,v) {
				if ( i != 0 ) {
					var temp = {};
					temp.product_id = $(this).children('td:nth-child(1)').children('div').children('span').attr('value');
					temp.cost		= $(this).children('td:nth-child(2)').children('input').val();
					temp.quantity	= $(this).children('td:nth-child(3)').children('input').val();
					temp.custom_name= $(this).children('td:nth-child(1)').children('div').children('span').html();
					qcra.inc_products.push( temp );
				}
			});


			qcra.inc_shipping	= [];
			$.each( $('div.qcra_shipping > div.shipping_box > table tr'), function(i,v) {
				var temp = {};
				temp.product_id = $(this).children('td:nth-child(1)').children('div').children('span').attr('value');
				temp.cost		= $(this).children('td:nth-child(2)').children('input').val();
				temp.quantity	= $(this).children('td:nth-child(3)').children('input').val();
				temp.custom_name= $(this).children('td:nth-child(1)').children('div').children('span').html();
				qcra.inc_shipping.push( temp );
			});

			qcra.contact_id		= $('#qcra_contact_name').val();
			qcra.contact_type	= $('#qcra_contact_name option:selected').attr('contact_type');
			qcra.store_id		= $('#qcra_store').val();
			qcra.reason_cc_info = $('#qcra_reason_cc_info').val();
			qcra.prepaid_id		= $('#qcra_prepaid').val();
			qcra.sales_tax_id	= $('#qcra_sales_tax').val();
			qcra.credit_date	= $('#qcra_credit_date').val();
			qcra.credit_amount	= $('#qcra_credit_amount').val();
			qcra.credit_type_id	= $('#qcra_credit_type').val();
			qcra.common_error_id= $('#qcra_common_error').val();
			qcra.comment		= $('#qcra_comment').val();
			qcra.qcra_pdf_name	= $('#qcra_attached_pdf').attr('pdf_name');
			
			
			
			$.each ( $('.qcra_btns > button:nth-child(n+4):nth-child(-n+6)'), function (i,v) {
				if ( $(this).hasClass('qcra_selected') ) {
					qcra.type = $(this).attr('value');
				}
			});
			
			if((qcra.store_id == "" || qcra.store_id == 0) && qcra.type < 2){
			         $.prompt('You must pick a storefront before saving the page');
			         dc_prevent = false;
			         runAJAX = false;
			         }
			         
			if(runAJAX == true){
			$.ajax({
				url        : '/php/ajax.php?ref=set_qcra_info',
				dataType   : 'text',
				data       : qcra,
				type       : 'POST',
				success   : function ( data ) {
					that.getset_qcra_form(that.qcra_id);
					that.set_list(false,true);
					recent_updates.get_recent_updates();
					that.qcra_change = false;
					$.prompt(set_loading_screen('QCRA has been saved.',true));
					if ( qcra.status_id == 2 && that.pdf_close_allowed ) {
						tasks.reload();
					}
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
	}

	this.refresh_qcra_window = function () {
		//$('div.rma-left div.left-menu div.content div.content').data('jsp').reinitialise();
		//$('div.rma-right div.qcra_phtml div.rma-scroll-container').data('jsp').reinitialise();
	}

	this.set_invoice_html = function (inv_array,invoice_id) {
		var temp_html = "<option>Choose Invoice</option>";
		$.each( inv_array.split(","), function(i,v) {
			if ( v == invoice_id ) {
				temp_html += "<option value='"+v+"' selected>"+v+"</option>";
			} else {
				temp_html += "<option value='"+v+"'>"+v+"</option>";
			}
		});
		$('#qcra_invoices').children('select').empty();
		$('#qcra_invoices').children('select').append(temp_html);
	}

	this.getset_invoice_date = function ( invoice_id ) {
		$.get(
			"/php/ajax.php?ref=get_invoice_date&invoice_id="+invoice_id,
				function( data ) {
					$('#qcra_invoice_date').html( pretty_datetime(data) );
				}
		);
	}

	this.getset_included_products = function ( invoice_id ) {
		$.get(
			"/php/ajax.php?ref=qcra_get_included_products&invoice_id="+invoice_id,
				function( data ) {
					data = $.parseJSON(data);

					var qcra_products_html = "";
					$.each( data, function (i,v) {
						qcra_products_html += "<option value='"+v['fishbowl_product_id']+"'>"+v['part_num']+"</option>";
					});
					$('#qcra_not_added_products').html(qcra_products_html);
				}
		);
	}

	this.add_included_product = function () {
		var ele		= $('#qcra_not_added_products').children('option:selected');
		if ( $(ele).text() == "" ) { return false; }
		$('.qcra_products > .products_box > table').append(that.add_product_html($(ele).val(),$(ele).text(),0,1));
		$(ele).remove();
	}

	this.add_product_html = function (id,name,cost,quantity) {
		var str = "";
		str += '<tr>';
		str += 		'<td><div><img src="/images/RMA_removeproduct.png"><span value="'+id+'"  cost="'+cost+'">'+name+'</span></div></td>';
		str += 		'<td><input value="'+number_format(cost,2)+'"></input></td>';
		str += 		'<td><input value="'+quantity+'"></input></div>';
		str += 		'<td>&nbsp;</td>';
		str += '</tr>';
						
		return str;
	}

	this.del_included_product = function ( ele ) {
		var ele		= $(ele).siblings('span');
		var addto	= $('#qcra_not_added_products');
		$(addto).append("<option value='"+$(ele).attr('value')+"'>"+$(ele).html()+"</option>");
		$(ele).parents('tr').remove();
	}



	this.add_shipping_item = function () {
		var ele		= $('#qcra_shipping_items').children('option:selected');
		if ( $(ele).text() == "" ) { return false; }
		$('.qcra_shipping > .shipping_box > table').append( that.add_product_html($(ele).val(),$(ele).text(),$(ele).attr('cost'),1));
		$(ele).remove();
	}

	this.del_shipping_item = function ( ele ) {
		var ele		= $(ele).siblings('span');
		var addto	= $('#qcra_shipping_items');
		$(addto).append("<option value='"+$(ele).attr('value')+"' cost='"+$(ele).attr('cost')+"'>"+$(ele).html()+"</option>");
		$(ele).parents('tr').remove();
	}

	this.open_return_pdf = function (type) {
		rma_page.open_in_fancybox('/php/ajax.php?ref=open_pdf'
			+ '&id='+that.qcra_id
			+ '&type='+type
		)
	}

	this.set_add_qcra_pdf_event = function () {
		var v = "qcra_file";
		$('#'+v).replaceWith('<input type="file" id="'+v+'" name="'+v+'" style="display:none;"></input>');

		$('#'+v).on('change', function (e) {
			if(!e.target.files) return;
			that.qcra_ajax_file_upload(v);
		});
	}

	this.refresh_contact_list = function () {
		if ( typeof $('#qcra_invoices > select > option:selected').attr('value') == "undefined" ) {
			var invoice_id		= [0];
		} else {
			var invoice_id		= [$('#qcra_invoices > select').val()];
		}
		$.get(
			"/php/ajax.php?ref=get_rma_contacts&invs="+invoice_id, 
				function ( data ) {
					data = $.parseJSON(data);
					rma_page.add_contact_select_html($('select#qcra_contact_name').val(),data,"name",$('select#qcra_contact_name'));					
				}
		);
	}

	this.reset_shipping_items = function () {
		$('#qcra_shipping_items').empty();
		var qcra_shipping_items = "";
		$.each( that.shipping_items, function (i,v) {
			qcra_shipping_items += "<option value='"+v['id']+"' cost='"+v['cost']+"'>"+v['name']+"</option>";
		});
		$('#qcra_shipping_items').html(qcra_shipping_items);
	}

	this.clear_included_products = function () {
		$.each ( $('div.qcra_products > .products_box > table tr'), function(i,v) {
			if ( i!=0 ) {
				$(this).remove();
			}
		});
	}
	
	this.clear_shipping_items = function () {
		$.each ( $('div.qcra_shipping > .shipping_box > table tr'), function(i,v) {
			if ( i!=0 ) {
				$(this).remove();
			}
		});
	}

	this.qcra_ajax_file_upload = function (type) {

		var file_name	= type;
		var ref			= "qcra_pdf";
		pdf_type 		= "qcra";
		var id_check = that.qcra_id;

        $.ajaxFileUpload
        (
            {
                url:'/php/ajax.php?ref=upload_files&type='+ref+'&file_id='+file_name+'&qcra_id='+that.qcra_id+'&cust_id='+that.cust_id,
                secureuri:false,
                fileElementId: file_name,
                dataType: 'json',
                success: function (data)
                {
					if ( id_check == that.qcra_id ) {
						if ( data['error'] != "" ) {
							$.prompt(data['error']);
						} else {
							var temp = data['file_name'].split('_');
							$('a#qcra_attached_pdf').html(temp[0]+".pdf");
							$('a#qcra_attached_pdf').attr('href',$('a#qcra_attached_pdf').attr('prefix')+data['file_name']);
							$('a#qcra_attached_pdf').attr('pdf_name',data['file_name']);
							that.qcra_change = true;
						}
					} else {
						$.prompt("PDF Saving Issue, Call Tech.");
					}
                },
                error: function (data, status, e)
                {
                    $.prompt('Connection error to server, while saving.');
                },
                complete: function () {
                	that.set_add_qcra_pdf_event();
                }
            }
        );

        return true;
    };
}