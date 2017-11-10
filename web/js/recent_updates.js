function recent_updates() {
	var that 			= this;
	this.recent_updates = "";
	
	this.cust_id		= $("input#customer_id").val();
	this.display_name	= $('#display_name').val();
	
	this.loading = $.Deferred();
	

	this.start = function () {
		that.get_recent_updates();

		$("div#close_recent_updates").on('click', function () {
			var state = $.bbq.getState();
			delete state.b;
			
			$.bbq.pushState(state, 2);
		});
		
		$('#full-recent_updates .updates').on('click', '.update', function(e) {
			if ($(e.target).closest('.dossier').length) {
				e.stopPropagation();
				return;
			}
			$(this).toggleClass('collapse');
		});
	}
	
	this.get_recent_updates = function () {
		that.loading = $.Deferred();
		$.get(
			"/php/ajax.php?ref=get_recent_updates&cust_id="+that.cust_id, 
				function( data ) {
					data  = $.parseJSON(data);
					that.recent_updates = data;
					
					$('#customer_screen .thesis .recent_updates .data .updates').empty();
					
					$.each( data, function ( i,v ) {
						$.each ( v, function ( ii,vv ) {
							if ( vv['info']['type'] == 1 ) {
								$('#full-contact .recent_updates .data .updates').append(
									that.print_small_updates_html(vv)
								);
							} else if ( vv['info']['type'] == 2 ) {
								$('#full-details .recent_updates .data .updates').append(
									that.print_small_updates_html(vv)
								);
							} else if ( vv['info']['type'] == 3 ) {
								$('#full-rma .recent_updates .data .updates').append(
									that.print_small_updates_html(vv)
								);
							}
						});
					});
					that.loading.resolve();
				}
		);
	}
	
	this.print_small_updates_html = function ( data ) {
		var display_name 	= data['info']['first_name']+" "+data['info']['last_name'];
		
		return '<tr class="update"><td class="name">'+display_name+'</td><td class="date"><time datetime="'+data['info']['updated']+'">'+pretty_datetime(data['info']['updated'],true)+'</time></td><td class="section">'+data['info']['special_name']+'</td></tr>'
	}
	
	this.print_large_updates_html = function ( type ) {
		//$('#full-recent_updates .data .updates .update').each(function() {$(this).unbind().remove();});
		$('#full-recent_updates .updates').empty();
		$.each ( that.recent_updates[type], function ( i,v ) {
			if ( v['info']['type'] == type ) {
				
				var $update = $('<li class="update collapse"><div class="user"></div><div class="date"><time></time></div><div class="details"></div><div class="dossier"><div class="changes_container"><table class="data changes"><thead><th class="section">Section</th><th class="previous">Previous Value</th><th class="new">Changed To</th></thead><tbody></tbody></table></div></div></li>');
			
				$update.find('.user').html(v['info']['first_name']+" "+v['info']['last_name']);
				$update.find('.date time').html(pretty_datetime(v['info']['updated'])).attr('datetime', v['info']['updated']);
				$update.find('.details').html(v['info']['special_name']+" - "+v['sections']);
				
				var $changes = $update.find('.changes tbody');
				$.each (v['values'], function (j,w) {
					var $change = $('<tr class="change"><td class="section"></td><td class="previous"></td><td class="new"></td></tr>');
					$change.find('.section').html(w['display_name']);
					$change.find('.previous').html(w['prev_value']);
					$change.find('.new').html(w['new_value']);
					$changes.append($change);
					$change = null;
				});
				
				$('#full-recent_updates .updates').append($update);
				
				$update = null;
			}
		});
		jQuery.fragments = {};
	}

//END CLASS
}



