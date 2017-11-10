jQuery(document).ready(function($){
	//CODE FOR SEARCH MENU
	//CODE FOR SEARCH MENU
	//CODE FOR SEARCH MENU
		
	$('div.lookup #submit').on( "click", function () {
		$('input#genlookup').focus();
	});
	
	$('input#genlookup').on( "focus", function () {
		if ( $('input#genlookup').val() != "" ) {
			$('input#genlookup').autocomplete('search');
		}
	});
	
	$('input#genlookup').on("keyup keypress", function(e) {
		var code = e.keyCode || e.which; 
		if (code  == 13) {               
			e.preventDefault();
			return false;
		}
	});
	
		
	var search_data = "";
	$('input#genlookup').autocomplete({
		delay:		50,
		autoFocus:	true,
		source:		'/php/ajax.php?ref=suggest_lookup&type=company', minLength:0,
		select: 	function(e,ui) {
						if ( typeof ui.item.hidden != "undefined" ) {
							
							var is_phone = false;
							var _e = e;
							while (typeof _e.originalEvent != "undefined") {
								_e = _e.originalEvent;
								is_phone |= $(_e.target).is('.suggest_lookup_phone');
							}
							is_phone = is_phone ? '&phone=1' : '';
							
							$('#customer_id').val(ui.item.hidden);
							if ( typeof ui.item.hidden2 != "undefined" ) {
								if ( ui.item.hidden_type == "RMA_PAGE" ) {
									window.location = 'customer_screen.php?dashboard_lookup='+ui.item.hidden+'&rma_page_id='+ui.item.hidden2+is_phone;
								} else if ( ui.item.hidden_type == "INVOICE" ) {
									window.location = 'customer_screen.php?dashboard_lookup='+ui.item.hidden+'&invoice_id='+ui.item.hidden2+is_phone;
								}
							} else {
								window.location = 'customer_screen.php?dashboard_lookup='+ui.item.hidden+is_phone;
							}
						}
						
						
					},

					
					
					
		response:		function ( e, ui ) {
				search_data = ui;

		},
		open:		function ( e,ui) {
				$.each ( $('ul.ui-autocomplete li.ui-menu-item'), function (i,v) {
					if ( search_data['content'][i]['is_company'] ) {
						$(this).children('a').html($(this).children('a').html() + '<img src="/images/phone.png" class="suggest_lookup_phone" title="On the phone?" />');
					}
					if ( search_data['content'][i]['in_fishbowl'] ) {
						$(this).children('a').html( $(this).children('a').html() + '<img src="/images/fishbowl_suggest_lookup.png" class="suggest_lookup_fishbowl" />' );
					}
				});
				
				var width = $('ul.ui-autocomplete').css('width');
				width = width.substring(0,width.length-2);
				width = (parseInt(width)+55) + 'px';
				$('ul.ui-autocomplete').css('width',width)
		}
	});	


});	