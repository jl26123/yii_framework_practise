function orderhistory() {
	var that = this;
	
	this.cust_id	= $("input#customer_id").val();
	this.username	= $('#username').val();
	this.account_id	= $('#account_id').val();
	this.so_request = [];
	this.scroll_flag= false;
	
	this.dont_maximize_list = [ 9];
	
	this.start = function () {
		that.build_sales_graph();

		if ( $('#find_invoice_id').val() != "" && !in_array(that.account_id,that.dont_maximize_list) ) {
			var soid = $('#find_invoice_id').val();
			$.bbq.pushState({a: 'orderhistory', id: soid}, 2);
		}
			
		// FIND BUTTON
		$('#full-orderhistory .list .search .query .action.submit').click(function() {
			var query = $('#full-orderhistory .list .query .field').val();
			if (query.length) {
				that.get_sales_list(query);		
			}
		});
		
		//enter to find
		$('#full-orderhistory .list .search .query .field').keyup(function (e) {
			if (e.which == 13) {
				if ( $(this).val().length ) {
					that.get_sales_list($(this).val());		
				}
				return false;
			}
		});
			
		//CLEAR BUTTON
		$('#full-orderhistory .list .query .action.clear').click(function() {
			that.get_sales_list("");
			$('#full-orderhistory .list .search .query .field').val("");
		});
		
		$('#full-orderhistory .view').on('click','#po_add_pdf', function() {
			$('#po_file').click();
		});
		$('#full-orderhistory .view').on('change', '#po_file', function() {
			that.oh_ajax_file_upload( $.bbq.getState().id );
		});
		
		$('#full-orderhistory .list .search .results .orders').on('click', '.order', function(event){
			$.bbq.pushState({id: $(this).data('id')}, 0);
		});
		
		$('#full-orderhistory').on('click','#po_rm_pdf',function() {
			that.del_po_pdf();
		});
		
		//initialize order history list
		$('#full-orderhistory .list .search .results').scroll(function() {
			var $this = $(this);
			var isAtBottom = (($this.scrollTop() + $this.height()) >= this.scrollHeight) && ($this.scrollTop() > 0);

			if ( isAtBottom && !that.scroll_flag ) {
				that.scroll_flag = true;
				
				oh = {
					entry_count: $('#full-orderhistory .list .search .results .orders tr').length,
					customer_id: that.cust_id,
					findme: $('#full-orderhistory .content .list .search .query .field').val()
				};
				
				$.ajax({
					url        : '/php/ajax.php?ref=get_more_sales_list',
					dataType   : 'text',
					data       : oh,
					type       : 'POST',
					success   : function ( data ) {
						data = JSON.parse(data);
						that.append_sales_list(data);
					},
					error: function ( data ) {
						//Nothing for now.
					},
					complete: function ( data ) {
						that.scroll_flag = false;
					}
				});
			}
		});
	
	}
	
	
	this.append_sales_list = function (data) {
		var $results = $('#full-orderhistory .list .search .results .orders');
		$.each ( data, function (i,v) {
				
			var $result = $('<tr class="order"><th class="soid"></th><td class="total"></td><td class="date"><time></time></td><td class="status"></td><td class="carrier"></td></tr>');
			
			$result.attr('data-id', v.invoice_id);
			$result.find('.soid').html(v.invoice_id);
			$result.find('.total').html('$'+v.so_total);
			$result.find('.date time').html(pretty_datetime(v.date_shipped,true,true)).attr('datetime', v.date_shipped);
			$result.find('.status').html(v.tracking_status);
			$result.find('.carrier').html(v.carrier);
			
			$results.append($result);
			
		});
	}
	
	this.del_po_pdf = function () {
		if ( $('#f_sales_order_pdf').html() == "" ) { return true; }
		$.prompt("Are you sure you want to delete this attached PO?", {
			buttons: { "Yes, Remove": true, "No": false },
			overlayspeed: "fast",
			submit: function(e,v,m,f){
				// use e.preventDefault() to prevent closing when needed or return false. 
				// e.preventDefault(); 
				if ( v === true ) {
					$.ajax({
						url: "/php/ajax.php?ref=del_so_pdf&invoice_id="+$('#full_oh_so_invoice_id').html(),
						type: 'GET',
						success: function ( data ) {
							$('#f_sales_order_pdf').html("");
							setTimeout(function () {$.prompt('Customer PO successfully removed.');},750);
						},
						error: function ( data ) {
							setTimeout(function () {$.prompt('Remove Failed, please try again.');},750);
						}
					});
				}
			}
		});
	}
	
	this.get_so_data = function ( eleornum ) {
		var deferred = $.Deferred();
		
		$('#full-orderhistory .view .order').empty();
		$('#full-orderhistory .list .search .results .orders .order').removeClass('selected');
		
		//abort previous request if there's a request, so it doesn't lock up on spam clickersf
		if ( typeof eleornum == "string" ) {
			var invoice_id = eleornum;
		} else { 
			var invoice_id = $(eleornum).html();
		}
		
		$.each ( that.so_request, function (i,v) {
			v.abort();
		});
		
		if ( typeof invoice_id != "undefined" ) {
			that.so_request[0] =
				$.get(
					"/php/ajax.php?ref=get_so_data&cust_id="+that.cust_id+"&invoice_id="+invoice_id+"&account_id="+that.account_id, 
						function( data ) {	
							$('#full-orderhistory .view .order').html(data);
							
							$('#full-orderhistory .list .search .results .orders .order').filter(function() {return $(this).data('id') == invoice_id;}).addClass('selected');
							if ( $('#f_sales_order_status').html() != "Delivered") {
								that.so_request[1] = 
									$.get(
										"/php/ajax.php?ref=get_tracking&inv_id="+invoice_id, 
											function( data ) {	
												data = JSON.parse(data);
												$('#f_sales_order_status').html(data['status']);
												if ( data['url'] != "" ) {
													$('#f_sales_order_tracking_url').html("<a target='_blank' href='"+data['url']+"' >"+data['tracking_num']+"</href>");
												}
												$('#f_sales_order_left_signed').html(data['left_at']+" / "+data['signed_by']);
												if ( data['status'].toLowerCase() == "delivered" ) {
													$('#f_sales_order_delivery').html( pretty_datetime_long(data['delivered_time'],false) );
												} else {
													$('#f_sales_order_delivery').html( pretty_datetime_long(data['eta'],true) );
												}
												
												$('#full-orderhistory .list .search .results .orders .order.selected .status').html(data['status']);
												
												deferred.resolve();
											}
									);
							} else { deferred.resolve(); }
						}
				);
		} 
		
		return deferred.promise();
	}
	
	this.get_sales_list = function ( findme ) {
		$.each ( that.so_request, function (i,v) {
			v.abort();
		});
		
		var $results = $('#full-orderhistory .list .search .results .orders');
		$results.empty();
		
		that.so_request[0] =
			jQuery.get("/php/ajax.php?ref=get_sales_list&customer_id="+that.cust_id+"&findme="+findme, function( data ) {
				data = $.parseJSON(data);
				that.append_sales_list(data);
			});
	}
		
	this.build_sales_graph = function () {
		var flotvalues=[];
		var flotvalues2=[];
		var monthnames=[];
		
		flotvalues	= JSON.parse($('div.flot_table_totals').html());
		flotvalues2 = JSON.parse($('div.flot_table_qty_totals').html());
		monthnames	= JSON.parse($('div.flot_table_months').html());
		
		var options = {
			series: {},
			grid: {
				show: true,
				markings: [{xaxis: {from: 0, to: 24}}]
			},   
			xaxis: {
				ticks: [monthnames[0],monthnames[4], monthnames[8], monthnames[12],
						monthnames[16], monthnames[20], monthnames[24]]
			},
			yaxes: [
						{ },
						{ position: "right" }
			]
		};
		
		$.plot( "#mini_sales_chart div.chart", 
				[ 
					{data: flotvalues, yaxis: 1, color: "#ee3d84" },
					{data: flotvalues2, yaxis: 2, color: "#508cb4" }
				],
				options
		);
		$.plot( "#full_sales_chart", 
				[ 
					{data: flotvalues, yaxis: 1, color: "#ee3d84" },
					{data: flotvalues2, yaxis: 2, color: "#508cb4" }
				],
				options
		);
		
		//global changes
		$('.flot-y1-axis').css('color','#ee3d84');
		$('.flot-y2-axis').css('color','#508cb4');
		
		// mini chart only
		$('#mini_sales_chart .flot-y1-axis').css('left','-4px');
		$('#mini_sales_chart .flot-y2-axis').css('left','-4px');
		$('#mini_sales_chart .flot-x1-axis').css('top','2px');
		
		//big chart
		$('#full_sales_chart .flot-y1-axis').css('left','-10px');
		$('#full_sales_chart .flot-x1-axis').css('top','6px').css('font-size','medium');
		$('#full_sales_chart .flot-y1-axis').css('font-size','medium');
		$('#full_sales_chart .flot-y2-axis').css('font-size','medium');
	}
	
	this.build_stainless_vs_porcelain_sales_graph = function () {
		var flotvalues	= $.extend({Porcelain: {total: 0, quantity: 0}, Stainless: {total: 0, quantity: 0}}, JSON.parse($('#task_form_pvs_data').html()));
		var monthnames	= JSON.parse($('div.flot_table_months').html());
		
		var options = {
			series: {},
			grid: {
				show: true,
				markings: [{xaxis: {from: 0, to: 24}}]
			},   
			xaxis: {
				ticks: [monthnames[0],monthnames[4], monthnames[8], monthnames[12],
						monthnames[16], monthnames[20], monthnames[24]]
			},
			yaxes: [
						{ },
						{ position: "right" }
			]
		};
		$.plot( "#task_form_pvs_chart_p", 
				[ 
					{data: flotvalues['Porcelain']['total'], yaxis: 1, color: "#ee3d84" },
					{data: flotvalues['Porcelain']['quantity'], yaxis: 2, color: "#508cb4" }
				],
				options
		);
		$.plot( "#task_form_pvs_chart_s", 
				[ 
					{data: flotvalues['Stainless']['total'], yaxis: 1, color: "#ee3d84" },
					{data: flotvalues['Stainless']['quantity'], yaxis: 2, color: "#508cb4" }
				],
				options
		);
	}
	
	
	
	this.oh_ajax_file_upload = function (inv_id) {
		var file_name = "po_file";
		var ref = "oh_po_pdf";
        $.ajaxFileUpload({
            url:'/php/ajax.php?ref=upload_files&type='+ref
            +'&file_id='+file_name
            +'&cust_id='+that.cust_id
            +'&inv_id='+inv_id,  
            secureuri:false,
            fileElementId: file_name,
            dataType: 'json',
            success: function (data)
            {
				if ( data['error'] != "" ) {
					$.prompt(data['error']);
				} else {
					var href = '/uploads/invoices/'+data['save_path']+data['file_name'];
					$('#f_sales_order_pdf').html(data['file_name']);
					$('#f_sales_order_pdf').attr('href',href);
					tasks.reload();
				}
            },
            error: function (data, status, e) {
            	console.log(e);
                $.prompt('Connection error to server, while saving. Please try again.');
            }
		});
        
        return false;
    };
	
//END CLASS
}



