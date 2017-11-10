jQuery(document).ready(function($){
	dashboard		= new dashboard();
	dashboard.start();

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
		
		$('#rma_users').val(that.account_id	);
		that.set_lightbox_events();
		that.scrollbar_on();
		
		
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
			that.maximize($('#'+$(this).attr('class')) );
		});
		
		//selecting the active element in task_management
		$('#task_manage_holder').on("click","tr > td:nth-child(1)", function () {
			$.each ( $('#task_manage_holder tr'), function () {
				$(this).removeClass('invert');
			});
			$(this).parent('tr').addClass('invert');
		});
		
		//clicking up arrow
		$('#task_manage_uparrow').on("click", function () {
			var ele = $('#task_manage_holder table tr.invert');
			if ( $(ele).length > 0 ) {
				if ( $(ele).prev('tr').length > 0 ) {
					$(ele).prev('tr').before( $(ele) );
				}
			}
		});
		
		//clicking down arrow
		$('#task_manage_downarrow').on("click", function () {
			var ele = $('#task_manage_holder table tr.invert');
			if ( $(ele).length > 0 ) {
				if ( $(ele).next('tr').length > 0 ) {
					$(ele).next('tr').after( $(ele) );
				}
			}
		});
		
		//clicking enable/disable picture
		$('#task_manage_holder').on("click","tr > td:nth-child(2) > img", function () {
			if ( $(this).attr('value') == 1 ) {
				$(this).attr('value',0)
				$(this).attr('src','/images/checkbox_unselected.png');
			} else {
				$(this).attr('value',1)
				$(this).attr('src','/images/checkbox_selected.png');
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
		
		//ADD CLOSER EVENTS
		$.each( $('#dashboard div.close_window'), function(){ 
			$(this).on("click", function() {
				console.log($(this).parents('div.thesis').attr('id'));
				that.minimize( $('#'+$(this).parents('div.thesis').attr('id')) );
			});
		});
		
		//----------------------------USER MANAGEMENT PART----------------------------
		//Select enable or dis enable users to display
		$('#is_enable').on("change", function () {
			if ( $('#is_enable').val() != '' ) {
				that.select_enable_disable_user( $('#is_enable').val());
			}
		});

		//Open the 'create user panel' on the right side
		$('#dash_user_create').on("click",function(){
			
			that.create_user_page();
		});


		//update user
		$('#dash_user_update').on("click",function(){
			if($("#dash_full_name").val()==''){
				$.prompt(set_loading_screen('Please select a user to update.',true));
			}
			else if(that.check_before_submit("update")){
				that.update_user_account();
                                console.log("refresh");
                                //refresh create user pannel:
                                if($('#dashboard-tasks_container').children(".dashboard-add-user-account").length>0)
                                    that.create_user_page();
			}
			else{
				$.prompt(set_loading_screen('Please input correct information to update user.',true));
			}
		});
				
		//Select the user which will be updated, and implement the check rules for input tags.
		$('#dash_full_name').on('change',function(){
			if($('#dash_full_name').val()!=''){
				that.show_user_info($('#dash_full_name').val());
				that.add_input_field_check("update");
			}
		});

		//Select color and the selector's background will change.
		$('#dash_user_color').on("change", function (){
			$("#dash_user_color").css("background-color", "#ffffff");
			if($('#dash_user_color').val()!="0"){
				that.color_map_box_change($("#dash_user_color"));
			}

		});
				

		//Drops authorizations on the update panel 
		$('#unselect_groups').on('dblclick',function(){		
			if($('#unselect_groups').val()!=null){
				that.switch_groups_selection($('#unselect_groups'),$('#select_groups'));
			}
		});

		//Picks up authorizations on the update panel
		$('#select_groups').on('dblclick',function(){
	
			if($('#select_groups').val()!=null){
				
				that.switch_groups_selection($('#select_groups'),$('#unselect_groups'));
			}
		});

		//Setup the creater_user panels
		that.setup_create_user_panel();	
	};
	
	
	this.disable_header_btns = function () {
		$.each( $('#rma_page_management div.header div.header_btns button'), function () {
			$(this).removeClass('selected');
		});
	};
	
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
					$('#rma_page_management div.results').empty();
					$('#rma_page_management div.results').append(data);
				}
			});

	};
	
	this.set_lightbox_events = function () {
		$.each ( $('#dashboard .dashboard-tasks table td span.lightbox a'), function () {
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
	};
	
	this.maximize = function($window) {
		$window.removeClass('minimize').addClass('maximize');
		
        if ( $window.attr('id') == "dashboard-task_rescheduler_container"){
            SN.task_rescheduler.activate()
        }
	};

	this.minimize = function($window) {
		$window.removeClass('maximize').addClass('minimize');
		if ( $window.attr('id') == "dashboard-task_management_container"){
			that.load_account_tasks(that.account_id);
		} else if ( $window.attr('id') == "dashboard-task_rescheduler_container"){
		    SN.task_rescheduler.deactivate()
	    }
	    else if( $window.attr('id') == "dashboard-user_management_container"){
	    	that.load_account_tasks(that.account_id);
                that.empty_create_user_panel("update");
	    }
		
	};
	

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
    };
	
	
	
	this.update_user_tasks = function () {
		var save = {};
		
		save.acc_id				= $('#dash_accounts').val();
		save.task_cap			= $('#dash_task_cap').val();
		save.part_time			= $('#dash_part_time').val();
		save.primary_task_user	= $('#dash_primary_task_user').val();
		save.task_priorities	= [];
		
		$.each ( $('#task_manage_holder table tr'), function (i,v) {
			var type_id = $(this).children('td:nth-child(1)').attr('type_id');
			var enabled = $(this).children('td:nth-child(2)').children('img').attr('value');
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
	};
	
	this.get_account_info = function (account_id,isTaskRescheduler) {
		if ( account_id != "" ) {
                    that.load_account_tasks(account_id);
                    $.get(
                        "/php/ajax.php?ref=get_account_info&account_id="+account_id, 
                        function ( data ) {
                            data = $.parseJSON(data);

                            $('#dash_task_cap').val( data[0]['account']['task_cap'] );
                            $('#dash_part_time').val( data[0]['account']['part_time'] );
                            $('#dash_primary_task_user').val( data[0]['account']['primary_task_user'] );
                            $('#dash_task_due_now').html( data[1]['due_now'] );
                            $('#dash_task_todo').html( data[1]['todo'] );
                            $('#dash_task_complete').html( data[1]['complete'] );
                            //console.log(data);

                            var html = "";
                            var ordered_tasks = [];
                            //order correctly
                            $.each ( data[0]['task_priorities'], function (i,v) {
                                    ordered_tasks[v['priority']-1]		= v;
                            });

                            html += "<table>";
                            //This adds in stuff that HAS been set...
                            $.each ( ordered_tasks, function (i,v) {
                                    if ( typeof v != "undefined" ) {
                                            html += '<tr>';
                                            html += '<td type_id="'+v['task_id']+'">'+v['name']+'</td>';
                                            if ( v['enabled'] == 1 ) {
                                                    html += '<td><img value="1" src="/images/checkbox_selected.png"></td>';
                                            } else {
                                                    html += '<td><img value="0" src="/images/checkbox_unselected.png"></td>';
                                            }
                                            html += '</tr>';
                                            delete data[0]['changeable_tasks'][v['task_id']];
                                    }
                            });

                            //This just adds stuff that has no value... and slaps it on the end... first save puts values in db...
                            $.each ( data[0]['changeable_tasks'], function (i,v) {
                                            html += '<tr>';
                                            html += '<td type_id="'+v['id']+'">'+data[0]['changeable_tasks'][v['id']]['name']+'</td>';
                                            html += '<td><img value="0" src="/images/checkbox_unselected.png"></td>';
                                            html += '</tr>';
                            });

                            html += "</table>";

                            $('#task_manage_holder').empty();
                            $('#task_manage_holder').append(html)

                            if ( isTaskRescheduler ){
                                SN.task_rescheduler.activate();
                            }
                        }
                    );
		}
	};
	
	this.load_account_tasks = function (account_id) {
		$.get (
			"/php/ajax.php?ref=get_dashboard_tasks&account_id="+account_id,
				function ( data ) {
					$('#dashboard-tasks_container').empty();
					$('#dashboard-tasks_container').append(data);
					that.set_lightbox_events();
					that.scrollbar_on();
				}
		);
	};
	
	this.scrollbar_on = function($scope) {
		if (typeof $scope == "undefined" || !$scope) {
			var $scope = 'body';
		}
		$($scope).find('.overflowy').not('.scrollbar-inner').addClass('scrollbar-inner').scrollbar();
	};

	this.close_fancybox_and_reload = function () {
		$.fancybox.close();
		window.location = "/dashboard.php";	
	};

	/*------------------------USER MANAGEMENT PART----------------------------------*/
    
    /*
    * Select enable or disable user and show their full name in the full name selections.
    * ""----will show all of accounts in the database.
    * If current_id isn't false, current_id will be used to refresh accounts list and display the user's information
    * whose id is current_id.
    */
	this.select_enable_disable_user = function(is_enable,current_id = false,full_name=false,enabled=false){
            $.get (
                    "/php/ajax.php?ref=get_isenable_user&is_enable="+is_enable,
                            function ( data ) {
                                    data = $.parseJSON(data);
                                    $selector = $('#dash_full_name');
                                    $selector.empty();
                                    $selector.append("<option value=''>Full Name</option>");
                                    for(x in data){
                                            $selector.append($('<option></option>').attr("value",data[x]['id']).text(data[x]['full_name']));
                                    }
                                    if(current_id!==false&&current_id!==""){
                                        $('#is_enable').val(is_enable);
                                        that.show_user_info(current_id);
                                        $('#dash_full_name').val(current_id);
                                    }
                                    if(current_id===false&&full_name!==false){                                       
                                        $('#is_enable').val(enabled);
                                        id = $("#dash_full_name option:contains('"+full_name+"')").val();
                                        that.show_user_info(id);
                                        $('#dash_full_name').val(id);
                                    }
                            }
            );
	};

	/*
	* According to the id, display the selected user on the user_update_panel.
	*/
	this.show_user_info = function(id){
             $.get (
                "/php/ajax.php?ref=show_user_info&account_id="+id,
                    function ( data ) {
                            info = $.parseJSON(data);
                            $('#dash_user_name').val(info['username']).css("border","1px solid grey");
                            $('#dash_user_first').val(info['first_name']);
                            $('#dash_user_last').val(info['last_name']);
                            $('#dash_user_phone').val(info['phone_ip_address']).css("border","1px solid grey");
                            $('#dash_user_phone_ex').val(info['phone_extension']).css("border","1px solid grey");
                            $('#dash_user_password').val('').css("border","1px solid grey");
                            $('#dash_user_pin').val('').css("border","1px solid grey");
                            $('#dash_user_password_re').val('').css("border","1px solid grey");
                            $('#dash_user_pin_re').val('').css("border","1px solid grey");                           
                            if(info['enabled']=='1'){
                                    $("input[name='dash_user_isenable'][value='1']").prop('checked',true);
                            }
                            else{
                                    $("input[name='dash_user_isenable'][value='0']").prop('checked',true);
                            }           
                            that.refresh_color_map_select(info['color_maps_remain']);
                            $('#dash_user_color').val(info['color_index']).change();
                            $('#select_groups').children('option').remove();
                            $('#unselect_groups').children('option').remove();
                            for(x in info['all_groups']){
                                    option = $('<option></option').attr('value',""+info['all_groups'][x]['id']).text(info['all_groups'][x]['name']);
                                    if($.inArray(""+info['all_groups'][x]['id'],info['groups'])!=-1){
                                            $('#select_groups').append(option);
                                    }
                                    else{

                                            $('#unselect_groups').append(option);
                                    }
                            }
                    }
            );
	};


	/*
	* Display the create_user_panel on the screen right part.
	*/
	this.create_user_page = function(){
		$.get (
			"/php/ajax.php?ref=create_new_user",
				function ( data ) {
					$('#dashboard-tasks_container').empty();
					$('#dashboard-tasks_container').append(data);
					that.setup_create_user_panel();
				}
		);

	};

	/*
	* Change the selector's background color to the selected color.
	*/
	this.color_map_box_change = function($color_selector){

		$.get (
			"/php/ajax.php?ref=color_map_box_change&color_index="+$color_selector.val(),
				function ( data ) {
					color = $.parseJSON(data);
					$color_selector.css("background-color", color);
				}
		);
	};


	/*
	* Packaging the user information to create a new user based on the information on the create_user panel.
	*/
	this.dash_user_created = function(){
		var account = {};
		account.username = $("#dash_user_name_create").val();
		account.first_name = $("#dash_user_first_create").val();
		account.last_name = $("#dash_user_last_create").val();
		account.password = $('#dash_user_password_create').val();
		account.pin = $('#dash_user_pin_create').val();
		account.enabled = $("input[name=dash_user_isenable_create]:checked").val();
		account.color_map = $('#dash_user_color_create').val();
		account.phone_ip_address = $("#dash_user_phone_create").val();
		account.phone_extension = $('#dash_user_phone_ex_create').val();

		groups=[];
		$('#select_groups_create').children().each(function(index){
			groups[index] = $(this).val();
		});
		account.groups = groups;
		
		$.ajax({
			url        : '/php/ajax.php?ref=create_user_account',
			dataType   : 'text',
			data       : account,
			type       : 'POST',
			success   : function ( data ) {
				$.prompt(set_loading_screen('User has been saved.',true));			
                                //refresh the update_user panel
                                full_name =account.first_name+" "+ account.last_name;                          
                                that.select_enable_disable_user(account.enabled,false,full_name,account.enabled);
                                that.load_account_tasks(that.account_id);
                                //if not bound keyup event
                                if(!$('#dash_user_name').hasClass('key_up_bound')){
                                    that.add_input_field_check("update");
                                }
		
			},
			error: function ( data ) {
				setTimeout(function(){$.prompt.goToState('state2')},500);
			}
		});
	};
	
	/*
	* Switch the information between two multiple selectors
	*/
	this.switch_groups_selection = function($select,$target){
		id = $select.val();
		text = $select.children("option[value='"+id+"']").text();
		$select.children("option[value='"+id+"']").remove();
		html="<option value='"+id+"'>"+text+"</option>";
		$target.append(html);
	};
	
	/*
	* Packaging the user information to update an exist user based on the information on the update panel.
	*/
	this.update_user_account = function(){	
		var account = {};
		account.id = $('#dash_full_name').val();
		account.username = $("#dash_user_name").val();
		account.first_name = $("#dash_user_first").val();
		account.last_name = $("#dash_user_last").val();
		account.password = $('#dash_user_password').val();
		account.pin = $('#dash_user_pin').val();
		account.enabled = $("input[name=dash_user_isenable]:checked").val();
		account.color_map = $('#dash_user_color').val();
		account.phone_ip_address = $("#dash_user_phone").val();
		account.phone_extension = $('#dash_user_phone_ex').val();
		groups=[];
		$('#select_groups').children().each(function(index){
			groups[index] = $(this).val();
		});
		account.groups = groups;

		$.ajax({
			url        : '/php/ajax.php?ref=update_user_account',
			dataType   : 'text',
			data       : account,
			type       : 'POST',
			success   : function ( data ) {
				$.prompt(set_loading_screen('User has been updated.',true));
                                //refresh user list and user information
                                that.select_enable_disable_user(account.enabled,account.id);
                                

			},
			error: function ( data ) {
				setTimeout(function(){$.prompt.goToState('state2')},500);
			}
		});
		
	};
	

	//The rules are used to check user input information. It only does syntax check for input.
	this.check_valid = function(type,value,re_value='',create_or_update=''){
		if(type=="email"){
			testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
			if (testEmail.test(value))

    			return true;
			else
    			return false;
		}
		else if(type=="password"){
			if(value===re_value){
				if(create_or_update=='')
					return true;
				else if(create_or_update=='create'&& value.length>=6)
					return true;
				else if(create_or_update=='update' && (value==''||value.length>=6))
					return true;
				else
					return false;
			}
			else {
				return false;
			}
		}
		else if(type=="pin"){
			testPIN=/^\d{4}$/;
			if(value===re_value)
				if(create_or_update=='')
					return true;
				else if(create_or_update=='create'&& testPIN.test(value))
					return true;
				else if(create_or_update=='update' && (value==''||testPIN.test(value)))
					return true;
				else
					return false;
			else
				return false;

		}
		else if(type=='phone_extension'){
			testEXT=/^\d{1,3}$/
			if(value=='')
				return true;
			else if(testEXT.test(value)){
				return true;
			}
			else 
				return false;
		}
		else if(type=='phone_ip_address'){
			
			testIP= /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
			if(value=='')
				return true;
			else if(testIP.test(value))                               
                                return true;                  
			else
				return false;

		}
		else{
			return false;
		}
	};

	//Check the input information before clicking the create_user or update_user button?
        //Also, pop up the warning message if the input is in wrong format.
	this.check_before_submit = function(create_or_update){
		tail = (create_or_update==="create")?"_create":"";
		$username = $("#dash_user_name"+tail);
		$password = $("#dash_user_password"+tail);
		$repassword = $("#dash_user_password_re"+tail);
		$pin = $("#dash_user_pin"+tail);
		$repin = $("#dash_user_pin_re"+tail);
		$phoneip = $("#dash_user_phone"+tail);
		$phonext= $("#dash_user_phone_ex"+tail);
		is_pass= true;
		if(!that.check_valid('email',$username.val())){
			$username.css("border","1px solid OrangeRed");
                        that.pop_warning_message('username',create_or_update,6000);
			is_pass=false;
		}
		if(!that.check_valid('password',$password.val(),$repassword.val(),create_or_update)){
			$password.css("border","1px solid OrangeRed");
			$repassword.css("border","1px solid OrangeRed");
                        error_code = ($password.val().length>=6||$repassword.val().length>=6)?1:2;
                        that.pop_warning_message('password',create_or_update,6000,error_code);
			is_pass = false;
		}
		if(!that.check_valid('pin',$pin.val(),$repin.val(),create_or_update)){
			$pin.css("border","1px solid OrangeRed");
			$repin.css("border","1px solid OrangeRed");
                        error_code = (($pin.val().length===4&&$.isNumeric($pin.val()))||($repin.val().length===4 && $.isNumeric($repin.val())))?1:2;
                        that.pop_warning_message('pin',create_or_update,6000,error_code);
			is_pass = false;
		}

		if(!that.check_valid('phone_ip_address',$phoneip.val()) || (result = that.check_ip_is_using($phoneip.val(),$('#dash_full_name').val()))){
                        $phoneip.css("border","1px solid OrangeRed");
                        error_code=(typeof(result) != "undefined" && result)?1:2;
                        that.pop_warning_message('phone_ip',create_or_update,6000,error_code);
			is_pass = false;
		}

		if(!that.check_valid("phone_extension",$phonext.val())){
			$phonext.css("border","1px solid OrangeRed");
                        that.pop_warning_message('phone_extension',create_or_update,6000);
			is_pass = false;
		}

		return is_pass;

	};

	//Check the input field on the create_user panel or update_user panel when entering something.
        //Also, pop up the warning message if the input is in wrong format.
	this.add_input_field_check = function(create_or_update){
		tail = (create_or_update==="create")?"_create":"";
		$username = $("#dash_user_name"+tail);
		$password = $("#dash_user_password"+tail);
		$repassword = $("#dash_user_password_re"+tail);
		$pin = $("#dash_user_pin"+tail);
		$repin = $("#dash_user_pin_re"+tail);
		$phoneip = $("#dash_user_phone"+tail);
		$phonext= $("#dash_user_phone_ex"+tail);
		$username.keyup(function(){
			if(that.check_valid('email',$username.val()))
				$username.css("border","1px solid grey");
			else{
                                that.pop_warning_message('username',create_or_update,3000);
				$username.css("border","1px solid OrangeRed");
                        }
		}).addClass('key_up_bound');
		$password.keyup(function(){
			if(that.check_valid('password',$password.val(),$repassword.val(),create_or_update)){
				$password.css("border","1px solid grey");
				$repassword.css("border","1px solid grey");
			}
			else{
                                error_code = ($password.val().length>=6||$repassword.val().length>=6)?1:2;
                                that.pop_warning_message('password',create_or_update,3000,error_code);
				$password.css("border","1px solid OrangeRed");
				$repassword.css("border","1px solid OrangeRed");
			}
		});
		$repassword.keyup(function(){
			if(that.check_valid('password',$password.val(),$repassword.val(),create_or_update)){
				$password.css("border","1px solid grey");
				$repassword.css("border","1px solid grey");
			}
			else{
                                error_code = ($password.val().length>=6||$repassword.val().length>=6)?1:2;
                                that.pop_warning_message('password',create_or_update,3000,error_code);
				$password.css("border","1px solid OrangeRed");
				$repassword.css("border","1px solid OrangeRed");
			}
		});
		$pin.keyup(function(){
			if(that.check_valid('pin',$pin.val(),$repin.val(),create_or_update)){
				$pin.css("border","1px solid grey");
				$repin.css("border","1px solid grey");
			}
			else{
                                error_code = (($pin.val().length===4&&$.isNumeric($pin.val()))||($repin.val().length===4 && $.isNumeric($repin.val())))?1:2;
                                that.pop_warning_message('pin',create_or_update,3000,error_code);
				$pin.css("border","1px solid OrangeRed");
				$repin.css("border","1px solid OrangeRed");
			}
		});
		$repin.keyup(function(){
			if(that.check_valid('pin',$pin.val(),$repin.val(),create_or_update)){
				$pin.css("border","1px solid grey");
				$repin.css("border","1px solid grey");
			}
			else{
                                error_code = (($pin.val().length===4&&$.isNumeric($pin.val()))||($repin.val().length===4 && $.isNumeric($repin.val())))?1:2;
                                that.pop_warning_message('pin',create_or_update,3000,error_code);
				$pin.css("border","1px solid OrangeRed");
				$repin.css("border","1px solid OrangeRed");
			}
		});
		$phoneip.keyup(function(){
			if(that.check_valid('phone_ip_address',$phoneip.val())){
                            if(create_or_update==="create" && that.check_ip_is_using($phoneip.val())){
                                that.pop_warning_message('phone_ip',create_or_update,3000,1);
                                $phoneip.css("border","1px solid OrangeRed");
                            }
                            else if(create_or_update==="update" && that.check_ip_is_using($phoneip.val(),$('#dash_full_name').val())){
                                that.pop_warning_message('phone_ip',create_or_update,3000,1);
                                $phoneip.css("border","1px solid OrangeRed");
                            } 
                            else
                                $phoneip.css("border","1px solid grey");
                        }
			else{
                                that.pop_warning_message('phone_ip',create_or_update,3000,2);
				$phoneip.css("border","1px solid OrangeRed");
                        }

		});
		$phonext.keyup(function(){
			if(that.check_valid('phone_extension',$phonext.val()))
				$phonext.css("border","1px solid grey");
			else{
                            that.pop_warning_message('phone_extension',create_or_update,3000);
                            $phonext.css("border","1px solid OrangeRed");
                        }

		});
	};

	/*Setup the create user panel event*/
	this.setup_create_user_panel= function(){

		//Setup the color selector
		$('#dash_user_color_create').on("change", function (){
			$("#dash_user_color_create").css("background-color", "#ffffff");
			if($('#dash_user_color_create').val()!="0"){
				that.color_map_box_change($("#dash_user_color_create"));
			}

		});

		//Setup the unallowed groups panel
		$('#unselect_groups_create').on('dblclick',function(){
			if($('#unselect_groups_create').val()!=null){
				that.switch_groups_selection($(this),$('#select_groups_create'));
			}
		});

		//Setup the allowed groups panel
		$('#select_groups_create').on('dblclick',function(){
			
                    if($('#select_groups_create').val()!=null){
                            that.switch_groups_selection($(this),$('#unselect_groups_create'));
                    }
		});

		//Close the 'create user panel'.
		$('#close_create_user_pannel').on("click",function(){
			that.load_account_tasks(that.account_id);
		});

		//Create user button
		$('#dash_user_create_account').on("click",function(){
			if(that.check_before_submit("create")){
                                that.dash_user_created();
			}
			else{
				$.prompt(set_loading_screen('Please input correct information to create user.',true));
			}
			
		});
		//Check some input fields such as username,password,pin,ip_phone and extension
		that.add_input_field_check('create');

	};

	//Set every input field to be empty after creating a new user or updating a user
	this.empty_create_user_panel = function(create_or_update){
		tail = (create_or_update==="create")?"_create":"";
		$("#dash_user_name"+tail).val('').css("border","1px solid grey");
		$("#dash_user_password"+tail).val('').css("border","1px solid grey");
		$("#dash_user_password_re"+tail).val('').css("border","1px solid grey");
		$("#dash_user_pin"+tail).val('').css("border","1px solid grey");
		$("#dash_user_pin_re"+tail).val('').css("border","1px solid grey");
		$("#dash_user_phone"+tail).val('').css("border","1px solid grey");
		$("#dash_user_phone_ex"+tail).val('').css("border","1px solid grey");		
		$.each($("input[name='dash_user_isenable"+tail+"']"),function(){
			$(this).prop("checked",false);
		});
		$("#dash_user_first"+tail).val("");
		$("#dash_user_last"+tail).val("");
		$("#dash_user_color"+tail).val('').css("background",'#ffffff');
                if(create_or_update==="update"){
                    $("#dash_full_name").val("");
                    that.select_enable_disable_user("");
                    $("#is_enable").val("");
                    $('#select_groups').children('option').remove();
                    $('#unselect_groups').children('option').remove();
                    
                }


	};

	/*
	*Update the color_map selector on the update panel based on the value of input array
	*/
	that.refresh_color_map_select=function(color_array){
		if(color_array!=null){
			$selector = $('#dash_user_color');
			$selector.empty();
			$selector.append("<option value='0'>Select Color Maps</option>");
			for(x in color_array){
				$selector.append($('<option></option>').attr("value",x).css("background-color",color_array[x]));
			}
		}
	};
        
        /*
         * Return true if the ip is using by another account.
         * Return false if the  ip isn't using or is using by given account.
         */
        that.check_ip_is_using = function(cip,cid=false){
                var result=true;
                $.ajax({
                        url: "/php/ajax.php?ref=check_ip_is_using",
                        async:false,
                        type: "get", //send it through get method
                        data: { 
                          account_id: (cid===false)?'':cid, 
                          phone_ip: cip
                        },
                        success: function(data) {
                            result = $.parseJSON(data);                      
                        },
                        error: function(xhr) {
                     
                        }
                });
                return result;
        };

        /*
         * Pop up the warning message in the create user account panel or in the update user account panel.
         * box_name: field name
         * create_or_update: create panel or update panel
         * duration: how long the message will be displayed.
         * error_code: decide the error text.
         */
        that.pop_warning_message = function(box_name,create_or_update,duration,error_code=false){
            tail = (create_or_update==="create")?"_create":"";
            $message_box=null;
            switch(box_name){
                case 'phone_ip':
                    $message_box = $("#dash_phone_ip_warning"+tail);
                    if(error_code===1){//input is ip address but it has been used
                        $message_box.text("IP has been used!");
                    }else{
                        $message_box.text("It should be IP address!");
                    }
                break;
                case 'phone_extension':
                        $message_box = $("#dash_phone_extension_warning"+tail);
                        $message_box.text("At most three digits!");
                      
                break;
                case 'password':
                        $message_box = $("#dash_password_warning"+tail);
                        if(error_code===1)
                            $message_box.text("Two should be same!");
                        else
                            $message_box.text("At least 6 characters!");
                        
                break;
                case 'pin':
                        $message_box = $("#dash_pin_warning"+tail);
                        if(error_code===1)
                            $message_box.text("Two inputs should be same!");
                        else
                            $message_box.text("It should be 4 digit!");
                break;
                case 'username':
                        $message_box = $("#dash_username_warning"+tail);
                        $message_box.text("It should be an email address!");
                break;
                default:
                break;
            }
            $message_box.show().delay(duration).fadeOut();
            
        };

}