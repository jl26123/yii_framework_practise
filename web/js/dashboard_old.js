jQuery(document).ready(function($){
	dashboard		= new dashboard();
	dashboard.start();
	$('div.dash_task_scroll_box').jScrollPane({});


});

function dashboard() {
	var that		= this;
	
	this.start = function () {
		that.account_id			= $('#account_id').val();
		that.current_sort		= "id";
		that.current_dir		= "desc";
		that.current_min_date 	= 0;
		that.current_max_date 	= 13;
		that.current_type		= "rma";
		
		$('#rma_page_management div.results').jScrollPane();
		$('#rma_users').val(that.account_id	);
		that.set_lightbox_events();
		
		
		
		//DATE SLIDER
		$( "#rma_date_slider" ).slider({
			  range: true,
			  min: 0,
			  max: 13,
			  values: [ 0, 13 ],
			  steps: 1,
			  slide: function( event, ui ) {
				that.current_min_date = ui.values[0];
				that.current_max_date = ui.values[1];
				that.get_rma_page_management_html();
			  }
		});
	
		//User changeing box...
		$('#dash_accounts').on("change", function () {
			if ( $(this).val() != '' ) {
				that.get_account_info( $('#dash_accounts').val() );
			}
		});
		
		//update button
		$('#update_user_settings').on("click", function () {
			if ( $('#dash_accounts').val() != '' ) {
				that.update_user_tasks();
			}
		});

        // redistribute tasks button
        $('#redistribute_tasks').on("click", function() {
            acc_id = $('#dash_accounts').val();
            if(acc_id != '') {
                if(confirm("This will remove tasks from this user and place them back in the task pool.")) {
                    that.redistribute_tasks();
                }
            } else {
                $.prompt(set_loading_screen('Please select a user first!', true));
            }
        });
		
		//Slide menu up based on menu item.
		$('#dash_links span').on("click", function () {
			that.slide_menu_up( $(this).attr('class_name') );
		});
		
		//Slide menu down based on image
		$('div.main-right > div.left-dash > div > img.menu_closer').on("click", function () {
			that.slide_menu_down( $(this).parent('div').attr('class').split(' ')[0] );
			that.load_account_tasks( $('#account_id').val() );
		});
		
		//selecting the active element in task_management
		$('div#changeable_tasks').on("click","div.task label", function () {
			$.each ( $('div#changeable_tasks div.task label'), function () {
				$(this).removeClass('invert');
			});
			$(this).addClass('invert');
		});
		
		//clicking up arrow
		$('#task_manage_uparrow').on("click", function () {
			var ele = $('div#changeable_tasks div.task span label.invert').parents('div.task');
			if ( $(ele).length > 0 ) {
				if ( $(ele).prev('div.task').length > 0 ) {
					$(ele).prev('div.task').before( $(ele) );
				}
			}
		});
		
		//clicking down arrow
		$('#task_manage_downarrow').on("click", function () {
			var ele = $('div#changeable_tasks div.task span label.invert').parents('div.task');
			if ( $(ele).length > 0 ) {
				if ( $(ele).next('div.task').length > 0 ) {
					$(ele).next('div.task').after( $(ele) );
				}
			}
		});
		
		//clicking enable/disable picture
		$('#changeable_tasks').on("click","div.task img:nth-child(2)", function () {
			if ( $(this).attr('value') == 1 ) {
				$(this).attr('value',0)
				$(this).attr('src','/images/checkbox_unselected.png');
				$(this).siblings('span:nth-child(3)').html('Disabled');
			} else {
				$(this).attr('value',1)
				$(this).attr('src','/images/checkbox_selected.png');
				$(this).siblings('span:nth-child(3)').html('Enabled');
			}
		});
		
		//lighbox shit

		
		//RMA SORTING OPTIONS
		$.each ( $('#rma_page_management div.the_sorts p'), function () {
			$(this).on("click", function () {
				if ( $(this).hasClass('invert') ) {
					if ( $(this).children('img').attr('dir') == "desc" ) {
						$(this).children('img').attr('dir','asc');
						$(this).children('img').attr('src','/images/ascending.png');
						that.current_sort	= $(this).attr('sort');
						that.current_dir	= "asc";
					} else {
						$(this).children('img').attr('dir','desc');
						$(this).children('img').attr('src','/images/descending.png');
						that.current_sort 	= $(this).attr('sort');
						that.current_dir	= "desc";
					}
				} else {
					that.current_sort	= $(this).attr('sort');
					that.current_dir	= $(this).children('img').attr('dir');
				}
				
				that.get_rma_page_management_html();
				
				$.each ( $('#rma_page_management div.the_sorts p'), function () {
					$(this).removeClass('invert');
				});
				$(this).addClass('invert');
			});
		});
		
		//ON FILTER CHANGE RELOAD RESULTS
		$('#rma_filters').on("change", function () {
			that.get_rma_page_management_html();
		});
		$('#qcra_filters').on("change", function () {
			that.get_rma_page_management_html();
		});
		
		//ON USER CHANGE SET ACCOUNT_ID, RELOAD RESULTS!
		$('#rma_users').on("change", function () {
			that.account_id = $('#rma_users').val();
			that.get_rma_page_management_html();
		});
		
		//CLICKING RMA BUTTON
		$('#rma_page_rma_btn').on("click", function () {
			that.disable_header_btns();
			$(this).addClass('selected');
			$('#rma_filters').show();
			$('#qcra_filters').hide();
			that.current_type		= "rma";
			that.get_rma_page_management_html();
			
		});
		//CLICKING QCRA BUTTON
		$('#rma_page_qcra_btn').on("click", function () {
			that.disable_header_btns();
			$(this).addClass('selected');
			$('#rma_filters').hide();
			$('#qcra_filters').show();
			that.current_type		= "qcra";
			that.get_rma_page_management_html();
		});
		
		
		//Load Nick's lists.
		that.admin_user_management_loadList();
		that.admin_group_management_loadList();
		
	}
	
	
	this.disable_header_btns = function () {
		$.each( $('#rma_page_management div.header div.header_btns button'), function () {
			$(this).removeClass('selected');
		});
	}
	
	this.get_rma_page_management_html = function () {
		var gett 	= {};
		
		gett.sort		= { type: that.current_sort, order: that.current_dir };
		if ( that.current_type == "rma" ) {
			gett.filter 	= $('#rma_filters').val();
		} else if ( that.current_type == "qcra" ) {
			gett.filter 	= $('#qcra_filters').val();
		}
		gett.account_id	= that.account_id;
		gett.min_date	= that.current_min_date;
		gett.max_date	= that.current_max_date;
		gett.type		= that.current_type;

		if ( typeof that.get_rma_page_management_html_variable != "undefined" ) {
			that.get_rma_page_management_html_variable.abort();
		}
					
		that.get_rma_page_management_html_variable = 	
			$.ajax({
				url        : '/php/ajax.php?ref=get_rma_page_management_html',
				dataType   : 'text',
				data       : gett,
				type       : 'POST',
				success   : function ( data ) {
					$('#rma_page_management div.results .jspPane').empty();
					$('#rma_page_management div.results .jspPane').append(data);
					$('#rma_page_management div.results').data('jsp').reinitialise();
				}
			});

	}
	
	this.set_lightbox_events = function () {
		$.each ( $('div.dash_task_scroll_box div.dash_task div span.lightbox a'), function () {
			$(this).fancybox({
				maxWidth	: 700,
				maxHeight	: 700,
				fitToView	: false,
				width		: '700px',
				height		: '700px',
				autoSize	: false,
				closeClick	: false,
				openEffect	: 'none',
				closeEffect	: 'none',
				helpers		: {
					overlay	: { closeClick: false }
				}
			});
		});
	}
	

    this.redistribute_tasks = function() {
        acc_id = $('#dash_accounts').val();
		$.prompt(set_loading_screen('Redistributing tasks for user...',true));
        $.post('/php/ajax.php?ref=redistribute_tasks', {id:acc_id}, function(data) {
            if(data == 'success') {
				$.prompt.close();
                that.get_account_info(acc_id);
				$.prompt(set_loading_screen('Tasks have been redistributed successfully',true));
				return true;
            } else {
				$.prompt.close();
				$.prompt(set_loading_screen('There was a problem redistributing the tasks.',true));
				return false;
			}
        });
    }
	
	this.update_user_tasks = function () {
		var totalpercent = 0;
		var save = {};
		
		save.acc_id				= $('#dash_accounts').val();
		save.task_cap			= $('#dash_task_cap').val();
		save.part_time			= $('#dash_part_time').val();
		save.primary_task_user	= $('#dash_primary_task_user').val();
		save.task_priorities	= [];
		
		$.each ( $('#changeable_tasks div.task_holder div.task'), function (i,v) {
			var type_id = $(this).children('span:nth-child(1)').children('label').attr('type_id');
			var enabled = $(this).children('img:nth-child(2)').attr('value');
			save.task_priorities[ type_id ] = { 'priority':i+1,'enabled':enabled };
		});
		
		
		$.ajax({
			url        : '/php/ajax.php?ref=update_user_tasks',
			dataType   : 'text',
			data       : save,
			type       : 'POST',
			success   : function ( data ) {
				$.prompt(set_loading_screen('User has been saved.',true));
				that.get_account_info( $('#dash_accounts').val() );
			},
			error: function ( data ) {
				setTimeout(function(){$.prompt.goToState('state2')},500);
			}
		});
	}
	
	this.get_account_info = function (account_id) {
		if ( account_id != "" && account_id > 0 ) {
			$.get(
				"/php/ajax.php?ref=get_account_info&account_id="+account_id, 
					function ( data ) {
						data = $.parseJSON(data);
						
						//console.log(data);
						
						$('#dash_task_cap').val( data[0]['task_cap'] );
						$('#dash_part_time').val( data[0]['part_time'] );
						$('#dash_primary_task_user').val( data[0]['primary_task_user'] );
						
						var html = "";
						var ordered_tasks = [];
						//order correctly
						$.each ( data[0]['task_priorities'], function (i,v) {
							ordered_tasks[v['priority']-1]		= v;
							ordered_tasks[v['priority']-1].id	= i
						});
						
						//This adds in stuff that HAS been set...
						$.each ( ordered_tasks, function (i,v) {
							if ( typeof v != "undefined" ) {
								html += "<div class='task'>";
								html += "<span><label type_id='"+v['id']+"'>"+data[1][v['id']]['name']+"</label></span>";
								if ( v['enabled'] == 1 ) {
									html += "<img value='1' style='display: inline-block;' src='/images/checkbox_selected.png'></img><span>Enabled</span>";
								} else {
									html += "<img value='0' style='display: inline-block;' src='/images/checkbox_unselected.png'></img><span>Disabled</span>";
								}
								html += "</div>";
								
								delete data[1][v['id']];
							}
						});
						
						//This just adds stuff that has no value... and slaps it on the end... first save puts values in db...
						$.each ( data[1], function (i,v) {
							html += "<div class='task'>";
							html += "<span><label type_id='"+v['id']+"'>"+v['name']+"</label></span>";
							html += "<img value='0' style='display: inline-block;' src='/images/checkbox_unselected.png'></img><span>Disabled</span>";
							html += "</div>";
						})
						
						$('div.dash_item_container div.task_holder').empty();
						$('div.dash_item_container div.task_holder').append(html);
						

						that.load_account_tasks(account_id);
					}
			);
		}
	}
	
	this.load_account_tasks = function (account_id) {
		$('div.dash_task_scroll_box div.dash_task').empty();
		$('div.dash_task_scroll_box div.dash_task_completed').empty();
		
		$.get (
			"/php/ajax.php?ref=build_tasks_html&account_id="+account_id+"&user_account_id="+that.account_id,
				function ( data ) {
					$('div.dash_task_scroll_box div.dash_task').append(data);
					$('div.dash_tasks > div.dash_task_scroll_box').data('jsp').reinitialise();
					that.set_lightbox_events();
				}
		);
		$.get(
			"/php/ajax.php?ref=build_completed_tasks_html&account_id=" + account_id + "&user_account_id=" + that.account_id,
			function(data) {
				$('div.dash_task_scroll_box div.dash_task_completed').append(data);
				$('div.dash_comp_tasks > div.dash_task_scroll_box').data('jsp').reinitialise();
			}
		);
	}
	
	this.slide_menu_up = function (menu_name) {
		$('div.main-right div.left-dash div.'+menu_name).show();
		$('div.main-right div.left-dash div.'+menu_name).animate({top: "23px" }, { duration: 250, queue: false, complete: function () {
			if ( menu_name == "rma_page_management" ) {
				$('#rma_page_management div.results').data('jsp').reinitialise();
			}
		}});
	}
	
	this.slide_menu_down = function (menu_name) {
		$('div.main-right div.left-dash div.'+menu_name).animate({top: "847px" }, { duration: 250, queue: false, complete:
			function () {
				$('div.main-right div.left-dash div.'+menu_name).hide();
			}
		});
	}

	this.close_fancybox_and_reload = function () {
		$.fancybox.close();
		window.location = "http://mrdsink.net/dashboard.php";	
	}
	
	this.admin_user_management_loadList = function () {
        $.post('pages/dashboard/menu/administrator/ajax_pages/user_management.php', {}, function(data) {
            $('#user_management').html(data);
        });
    }

    this.admin_user_management_getUser = function(id) {
        $.post('pages/dashboard/menu/administrator/view_user.php', {id:id}, function(data) {
            dashboard.slide_menu_up('manage_user');
            $('#manage_user').html(data);
        });
    }

    this.admin_user_management_getUser_onsave = function(id) {
        $.post('pages/dashboard/menu/administrator/view_user.php', {id:id}, function(data) {
            $('#manage_user').html(data);
        });
    }

    this.admin_user_management_getCreateUserPage = function() {
        $.post('pages/dashboard/menu/administrator/create_user.php', {}, function(data) {
            dashboard.slide_menu_up('create_user');
            $('#create_user').html(data);
        });
    }

    this.admin_group_management_loadList = function() {
        $.post('pages/dashboard/menu/administrator/ajax_pages/group_management.php', {}, function(data) {
            $('#group_management').html(data);
        });
    }

    this.admin_group_management_getGroup = function(id) {
        $.post('pages/dashboard/menu/administrator/view_group.php', {id:id}, function(data) {
            dashboard.slide_menu_up('manage_group');
            $('#manage_group').html(data);
        });
    }

    this.admin_group_management_getCreateGroupPage = function() {
        $.post('pages/dashboard/menu/administrator/create_group.php', {}, function(data) {
            dashboard.slide_menu_up('create_group');
            $('#create_group').html(data);
        });
    }

    this.admin_group_management_getGroup_onsave = function(id) {
        $.post('pages/dashboard/menu/administrator/view_group.php', {id:id}, function(data) {
            $('#manage_group').html(data);
        });
    }
    
    this.admin_change_password = function() {
		$('#successbox').slideUp();
		$('#errorbox').slideUp();
		var pass1 = $('#newpassword1');
		var pass2 = $('#newpassword2');
		if(pass1.val() == pass2.val()) {
			if(pass1.val() == "" || pass2.val() == "") {
				$.prompt(set_loading_screen('Password fields must not be empty!', true));
			} else {
				// Update password for user.
				$.post('php/ajax.php?ref=account_settings', {change_password:1, pass:pass1.val(),account_id:$('#account_id').val()}, function(data) {
					if(data == 'success') {
						$('#successbox').html('Password updated successfully!');
						$('#successbox').fadeIn();
						setTimeout(function() {
							$('#successbox').fadeOut();
						}, 10000);
					} else {
						$('#errorbox').html('Error updating password. If this error persists, please contact the tech team.');
						$('#errorbox').fadeIn();
						setTimeout(function() {
							$('#errorbox').fadeOut();
						}, 10000);
					}
				});
			}
		} else {
			$.prompt(set_loading_screen('Password fields do not match!', true));
		}
	};
	this.admin_change_pin = function() {
		$('#successbox').slideUp();
		$('#errorbox').slideUp();
		var pin1 = $('#newpin1');
		var pin2 = $('#newpin2');
		if(pin1.val() == pin2.val()) {
			if(pin1.val() == "" || pin2.val() == "") {
				$.prompt(set_loading_screen('PIN fields must not be empty!', true));
			} else {
				// Update PIN for user.
				$.post('php/ajax.php?ref=account_settings', {change_pin:1, pin:pin1.val(),account_id:$('#account_id').val()}, function(data) {
					if(data == 'success') {
						$('#successbox').html('PIN updated successfully!');
						$('#successbox').fadeIn();
						setTimeout(function() {
							$('#successbox').fadeOut();
						}, 10000);
					} else {
						$('#errorbox').html('Error updating PIN. If this error persists, please contact the tech team.');
						$('#errorbox').fadeIn();
						setTimeout(function() {
							$('#errorbox').fadeOut();
						}, 10000);
					}
				});
			}
		} else {
			$.prompt(set_loading_screen('PIN fields do not match!', true));
		}
	};
    
    
}