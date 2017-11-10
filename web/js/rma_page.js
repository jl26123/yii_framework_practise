function rma_page() {
	var that = this;
	
	//start all the event listeners
	this.start = function () {
		//Initiate scroll bars
		//$('div.rma-right div.rma_phtml div.rma-scroll-container').jScrollPane({autoReinitialise: true});
		//$('div.rma-right div.qcra_phtml div.rma-scroll-container').jScrollPane({autoReinitialise: true});
		//$('div.rma-left div.left-menu div.content').jScrollPane({autoReinitialise: true});
		
		$('div.rma-right > div.rma_phtml').hide();
		$('div.rma-right > div.qcra_phtml').hide();
		
		//CHECK FOR A FOUND RMA / QCRA ID		
		rma.set_rma_list(false,false,false);
		
		// //if person searches by rma_id, auto sets active one, to that rma_id
		// if ( $('#find_rma_page_id').val() != "" ) {
			// if (use_window_controller) {
				// $.bbq.pushState({a: 'rma', id: $('#find_rma_page_id').val()}, 2);
// 
			// } else {
				// if ( $('#find_rma_page_id').val().substring(0,3) == "RMA" ) {
					// rma.rma_id = $('#find_rma_page_id').val().substring(3);
					// rma.set_rma_form();
					// rma.set_rma_list(false,true);
				// } else if ( $('#find_rma_page_id').val().substring(0,4) == "QCRA" ) {
					// qcra.qcra_id = $('#find_rma_page_id').val().substring(4);
					// qcra.getset_qcra_form(qcra.cra_id);
					// qcra.set_list(false,true);
				// }
// 				
				// enlarge_window($("div.content-box.rma"),210,310,"rma");
// 				
			// }
// 			
		// } else {
		    // console.log('hit');
			// //bad coding, need to fix later, rma.set_rma_list and qcra.set_list need merged into one on this page
			// //rma.set_rma_list(false,false,false);
		// }
		
		
		
		//RMA TICKET LISTENERS
		$('#full-rma > section > div.rma-left > div.rma-top-area > div.left-menu').on("click", "div > table > tbody > tr", function () {
			if (use_window_controller) {
				var state = $.bbq.getState();
				
				state.a = 'rma';
				delete state.b;
				state.id = $(this).children('td').eq(0).html();
				
				$.bbq.pushState(state, 2);
				
			} else {
				
				$('div.rma-right').show();
				$('div.rma-right > div.rma_phtml').hide();
				$('div.rma-right > div.qcra_phtml').hide();
				
				var undo_action = function () {
					$('div.rma-right > div.rma_phtml').show();
				}
				var $this = $(this);
				
				var change_ticket = function () { 
					that.set_active_ticket( $($this).children('td:first').html() );
					
					if ( $($this).children('td:first').html().substring(0,3) == "RMA" ) {
						rma.rma_id	=	$($this).children('td:first').html().substr(3);
						rma.set_rma_form();
						rma.rma_change = false;
						qcra.qcra_change = false;
					} else if ( $($this).children('td:first').html().substring(0,4) == "QCRA" ) {
						qcra.cra_id = $($this).children('td:first').html().substr(4);
						qcra.getset_qcra_form(qcra.cra_id);
						rma.rma_change = false;
						qcra.qcra_change = false;
					}
				}
				
				if ( rma.rma_change || qcra.qcra_change ) {
					$.prompt("You haven't finished saving, would you like to stay on this page?",save_check_prompt(change_ticket,undo_action));
				} else {
					change_ticket();
				}
				
			}
			
		});
		
		//DEL rma
		//div.rma-left > div.rma-top-area > div.left-menu > div > table > tbody > tr:nth-child(1) > td:nth-child(1)
		$('button#rma_page_del').on('click', function () {
			if ( $('div.rma-left > div.rma-top-area > div.left-menu tr.selected td:nth-child(1)').html().substring(0,3) == "RMA" ) {
				rma.del_rma();
			} else if ( $('div.rma-left > div.rma-top-area > div.left-menu tr.selected td:nth-child(1)').html().substring(0,4) == "QCRA" ) {
				qcra.del_qcra();
			}
		});
		
		$('#full-rma .recent_updates .expand').click(function () {
			var state = $.bbq.getState();
			state.b = 'recent_updates';
			$.bbq.pushState(state, 2);
		});
	}
	
	this.set_active_page = function (str) {
		var deferred = $.Deferred();
		
		$('div.rma-right').show();
		$('div.rma-right > div.rma_phtml').hide();
		$('div.rma-right > div.qcra_phtml').hide();
		
		rma.rma_change = false;
		qcra.qcra_change = false;
		
		if (str && str.length) {
			if ( str.substring(0,3) == "RMA" ) {
				rma.rma_id		=  str.substring(3);
				rma.set_rma_form(rma.rma_id);
				$('div.rma-right > div.rma_phtml').show();
			} else if ( str.substring(0,4) == "QCRA" ) {
				qcra.cra_id	= str.substring(4);
				qcra.qcra_id	= str.substring(4);
				qcra.getset_qcra_form(qcra.qcra_id);
				$('div.rma-right > div.qcra_phtml').show();
			}
		}
		
		$.when(that.set_active_ticket(str)).then(function() {
			deferred.resolve();
		});
		
		return deferred.promise();
	}
	
	this.set_active_ticket = function (id) {
		var deferred = $.Deferred();
		
		$.each ( $('div.rma-top-area div.left-menu div.content tr'), function (i,v) {
			if ( id == $(this).children('td:first').html() ) {
				$(this).addClass('selected');
			} else {
				$(v).removeClass('selected');
			}
		});
		
		return deferred.resolve().promise();
	}
	

	
	this.open_in_fancybox = function(url) {
		$.fancybox(
			{
				openEffect  : 'none',
				closeEffect : 'none',
				iframe : {
					preload: false
				},
				href: url,
				type: 'iframe',
				helpers		: {
					overlay	: { closeClick: false }
				}
			}
		);
	}
	
	
	
	
	
//	
//	
// HTML BUILDING BLOCKS
// HTML BUILDING BLOCKS
// HTML BUILDING BLOCKS
///////////////////////////////////////////////////////////////////////////

	this.add_fb_user_name_box = function (obj) {
		var html	= "";
		if ( obj instanceof Object) {
			$.each ( obj, function (i,v) {
				html +=	"<div class='rma_block'><span>"+i+"-CSR:</span><span>"+v['csr']+"</span></div>";
				html +=	"<div class='rma_block'><span>"+i+"-Picker:</span><span>"+v['picker']+"</span></div>";
				html +=	"<div class='rma_block'><span>"+i+"-Shipper:</span><span>"+v['shipper']+"</span></div>";
			});
		}
		$('.fb_user_name_box').html(html);
	}

	this.add_new_html_to_mini_box = function () {
		var html	= "";
		var ele		= $('div.scroll_container div.rma_scroll div.selected');
		html	+= "<div class=\"flex\"><span class=\"bold\">"+$(ele).children('span:nth-child(1)').html()+"</span>";
		html	+= "<span>"+$(ele).children('span:nth-child(2)').html()+"</span>";
		html	+= "<span>"+$(ele).children('span:nth-child(3)').html()+"</span>";
		html	+= "</div>";
		$('div.mini_rma_display div.mini_rma_tickets').prepend(html);
	}

	this.add_contact_select_html = function ( id, array, name, element ) {
		var temp = "";
		var contact_type = "";
		
		if ( id == 0 ) { 
			var label = $(element).siblings('span').html();
			temp = "<option value='0'>Choose "+label.substring(0,label.length-1)+"</option>"; 
		}
		
		temp += "<option value='-1'>Other</option>";
		
		if ( array instanceof Array ) {
			$.each ( array, function (i,v) {
				temp = temp + "<option contact_type='"+v['type']+"' value='"+v['id']+"'"+( v['id'] == id ? " selected" : "")+">"+v['name']+"</option>";		
			});
		}
		$(element).empty();
		$(element).append(temp);	
	}
	
	//name refers to what the column name is from the db...
	this.add_default_select_html = function ( id, array, element, name ) {
		var temp = "";
		if ( id == 0 ) { 
			var label = $(element).siblings('span').html();
			temp = "<option value='0'>Choose "+label.substring(0,label.length-1)+"</option>"; 
		}
		/*
		 * Specifically RMA
		 */
		if ( typeof name != "undefined" ) {
			$.each ( array, function (i,v) {
				temp += "<option value='"+v['id']+"'"+( v['id'] == id ? " selected" : "")+">"+v[name]+"</option>";
			});
		/*
		 * Specifically QCRA
		 */
		} else {
			$.each ( array['data'], function (i,v) {
				temp += "<option value='"+v['id']+"'"+( v['id'] == id ? " selected" : "")+">"+v['option']+"</option>";	
			});
		}
		$(element).empty();
		$(element).append(temp);	
	}
	
	this.add_ordered_select_html = function ( id, array, element, name ) {
		var temp = "";
		console.log(array);
		if ( id == 0 ) { 
			var label = $(element).siblings('span').html();
			temp = "<option value='0'>Choose "+label.substring(0,label.length-1)+"</option>"; 
		}
		/*
		 * Specifically RMA
		 */
		if ( typeof name != "undefined" ) {
			$.each ( array, function (i,v) {
				if(v['id'] == id || v['enabled'] == 1)temp += "<option value='"+v['id']+"'"+( v['id'] == id ? " selected" : "")+">"+v[name]+"</option>";
			});
		/*
		 * Specifically QCRA
		 */
		} else {
			$.each ( array['data'], function (i,v) {
				if(v['id'] == id || v['enabled'] == 1)temp += "<option value='"+v['id']+"'"+( v['id'] == id ? " selected" : "")+">"+v['option']+"</option>";	
			});
		}
		$(element).empty();
		$(element).append(temp);	
	}
	
	/*
	 * Specifically QCRA
	 */
	this.add_default_select_with_percent_html = function ( id, array, element ) {
	    var real_array = [];
	    $.each ( array['data'], function (i,v) {
	       real_array.push(v);
        });

	    real_array.sort(function(a,b) {
	       return a.order - b.order; 
	    });

		temp = "<option value='0'>No</option>"; 
		$.each ( real_array, function (i,v) {
			temp += "<option percent='"+v['option']+"' value='"+v['id']+"'"+( v['id'] == id ? " selected" : "")+">"+v['option']+"%</option>";	
		});
		$(element).empty();
		$(element).append(temp);	
	}
	
	this.build_rma_comment_html = function (comment) {
		//sets for old style comments
		if ( comment['first_name'] == "Mr." && comment['last_name'] == "Direct" ) {
			comment['display_name'] = "Old Style Comment";
			comment['pretty_date']	= "";
		} else { 
			comment['display_name'] = comment['first_name']+' '+comment['last_name'];
			comment['pretty_date']	= pretty_datetime(comment['created'],false,true);
		}
	
		var html = "";
		html +=	'<div class="comment">';
		html +=	'<label>'+comment['display_name']+'<br>'+comment['pretty_date']+'</label>';
		html +=	'<span>'+comment['comment'].replace(/(?:\r\n|\r|\n)/g,"<br/>")+'</span></div>';
		return html;
	}	
}
