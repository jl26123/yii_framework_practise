jQuery(document).ready(function($){
	management	= new management();
	management.start();

});

function management() {
	var that		= this;

	this.start = function () {
		$('#is_enable').on("change", function () {
			if ( $('#is_enable').val() != '' ) {
				that.select_enable_disable_user( $('#is_enable').val());
			}
		});

		//Select the user which will be updated, and implement the check rules for input tags.
		$('#dash_full_name').on('change',function(){
			if($('#dash_full_name').val()!=''){
				that.show_user_info($('#dash_full_name').val());
				/*that.add_input_field_check("update");*/
			}
		});



	}


	this.select_enable_disable_user = function(is_enable){

		$.get (
                    "/yii_basic/web/admin/management/ajax-enable?is_enable="+is_enable,
                            function ( data ) {
                                    data = $.parseJSON(data);
                                    $selector = $('#dash_full_name');
                                    $selector.empty();
                                    $selector.append("<option value=''>Full Name</option>");
                                    for(x in data){
                                            $selector.append($('<option></option>').attr("value",data[x]['id']).text(data[x]['full_name']));
                                    }
                                  	//console.log(data);
                            }
            );
	};


	/*
	* According to the id, display the selected user on the user_update_panel.
	*/
	this.show_user_info = function(id){
             $.get (
                "/yii_basic/web/admin/management/ajax-show-account-info?id="+id,
                    function ( data ) {
                            info = $.parseJSON(data);
                            console.log(info);
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
                            // that.refresh_color_map_select(info['color_maps_remain']);
                            $('#dash_user_color').val(info['color_index']).change();
                            $('#select_groups').children('option').remove();
                            $('#unselect_groups').children('option').remove();
                            for(x in info['all_groups']){
                                    option = $('<option></option').attr('value',""+info['groups'][x]['id']).text(info['groups'][x]['name']);
                                    if($.inArray(""+info['groups'][x]['id'],info['groups'])!=-1){
                                            $('#select_groups').append(option);
                                    }
                                    else{

                                            $('#unselect_groups').append(option);
                                    }
                            }
                    }
            );
	};

}