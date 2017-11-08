<?php

header('Cache-control: max-age=0, no-cache, no-store, must-revalidate', true);
header('Expires: Thu, 1 Jan 1970 00:00:00 GMT', true);
header('Pragma: no-cache', true);

require_once(dirname(__DIR__).'/inc/config.php');

if (!SinkNet::is_logged_in()) {
	echo "FAILURE TO BE LOGGED IN!";
	exit;
}

if ( !empty($_POST) ){ 
	$raw_POST = $_POST;
	$_POST = clean_post($_POST); 
}
if ( !empty($_GET) ){
	$raw_GET = $_GET;
	$_GET = clean_post($_GET); 
}

switch ($_GET['ref']) {

//CUSTOMER STUFF
    Case "add_new_customer":
        echo json_encode(customer_new::ajax_add_new_customer($raw_POST));
    break;
	Case "get_contact_info":
		echo json_encode(customer_contact::load_by_id($_GET['id'])->get_value_array());
	break;
	Case "get_address":
		echo json_encode(customer_address::load_by_id($_GET['id'])->get_value_array());
	break;
	Case "set_contact":
		SinkNet::get('recent_updates')->set_contact_update($raw_POST);
 		if ( customer_new::load($_POST['customer_id'])->get_customer()['want_newsletter'] && $_POST['contact_email'] != '' && SinkNet::get_settings(3) == "prod" ) {
			SinkNet::get('constant_contact')->update_or_add_contact($_POST['contact_email'],$_POST['contact_name'],"",$_POST['company_name']);
		}
		echo customer_contact::ajax_set_from_post($raw_POST);
	break;
	Case "set_address":
		echo SinkNet::get('recent_updates')->set_address_update($raw_POST);
		echo customer_address::ajax_set_from_post($raw_POST);

	break;
	Case "set_customer":
		echo SinkNet::get('recent_updates')->set_customer_update($raw_POST);
		echo customer_new::ajax_set_from_post($raw_POST);
	break;
	Case "add_contact":
  		SinkNet::get('recent_updates')->add_contact_update($raw_POST);
 		if ( customer_new::load($_POST['customer_id'])->get_customer()['want_newsletter'] && $_POST['contact_email'] != '' && SinkNet::get_settings(3) == "prod" ) {
			SinkNet::get('constant_contact')->update_or_add_contact($_POST['contact_email'],$_POST['contact_name'],"",$_POST['company_name']);
		} 
		echo json_encode(customer_contact::ajax_add_from_post($raw_POST));
	break;
	Case "del_contact":
		echo SinkNet::get('recent_updates')->del_contact_update($_GET);
		echo customer_contact::load_by_id($_GET['contact_id'])->del();
	break;
	Case "add_address":
		SinkNet::get('recent_updates')->add_address_update($raw_POST);
		echo customer_address::ajax_add_from_post($raw_POST)['id'];
	break;
	Case "del_address":
		echo SinkNet::get('recent_updates')->del_address_update($_GET);
		echo customer_address::load_by_id($_GET['addr_id'])->del();
	break;
	Case "get_shipping_time":
		session_write_close();
		echo tracking::get_transit_days($_GET['city'],$_GET['state'],$_GET['zipcode'],"tracking_ups");
	break;
	Case "sync_with_fishbowl":
		customer_new::sync_with_fishbowl($_POST['cust_id']);
		echo '{}';
	break;
	Case "customer_request_followup_change":
		SinkNet::get('tasks')->add_customer_followup_task($_POST['customer_id'],clean_string($_POST['reason']));
		echo '{}';
	break;
	Case "customer_on_phone":
		echo json_encode(customer_new::load($raw_GET['cust_id'])->on_phone(SinkNet::get_account_id(), +$raw_GET['call_id']));
	break;
	Case "contact_reload":
    	echo json_encode(block_contact::reload_contact(+$raw_GET['cust_id']));
	break;
	Case "get_task_has_must_email":
		echo SinkNet::get('tasks')->has_must_email(+$raw_GET['customer_id'],+$raw_GET['task_id']);
	break;
	Case "on_view":
		customer_new::load(+clean_string($_GET['customer_id']))->incrament_view_count();
		account_new::load(+clean_string($_GET['account_id']))->update_last_visited();
	break;
	Case "click_to_call":
		echo click_to_call::get(sinknet::get_account_id())->handle_request($_POST);
	break;


//COMMUNICATION
	Case "add_comm_note":
		echo customer_communication::ajax_add_from_post($raw_POST)['id'];
	break;
	Case "set_comm_note_priority":
		customer_communication::load_by_id($raw_GET['id'])->set_priority($raw_GET['priority']);
		echo '{}';
	break;
	Case "communications_reload":
    	echo json_encode(array(
			'full' => block_comm_full::get_html(+$raw_GET['cust_id']),
			'mini' => block_comm_mini::get_html(+$raw_GET['cust_id']),
		));
	break;



//ORDER HISTORY
	Case "get_so_data":
		echo SinkNet::get('order_history')->get_so_data($_GET['invoice_id']);
	break;
	Case "get_sales_list":
		if ( $raw_GET['findme'] != "" ) {
			echo json_encode(sales_new::ajax_minify_data_for_get_sales_list(sales_new::load_by_customer_id($raw_GET['customer_id'])->get_sales_by_sku(1,$raw_GET['findme'],sales_new::SALES_CUTOFF)));
		} else {
			echo json_encode(sales_new::ajax_minify_data_for_get_sales_list(sales_new::load_by_customer_id($raw_GET['customer_id'])->get_sales(1)));
		}
	break;
	Case "get_tracking":
		$track_info = tracking::get_tracking($_GET['inv_id']);
		$track_info->update_tracking();
		$track_info->set_new_tracking_status();
		echo json_encode($track_info->get_vars());
	break;
	Case "get_tracking_raw":
		$track_info = tracking::get_tracking($_GET['inv_id']);
		$track_info->update_tracking();
		echo json_encode($track_info->get_vars());
		break;
	Case "get_more_sales_list":
		if ( $raw_POST['findme'] != "" ) {
			echo json_encode(sales_new::ajax_minify_data_for_get_sales_list(sales_new::load_by_customer_id($raw_POST['customer_id'])->get_sales_by_sku(1,$raw_POST['findme'],$raw_POST['entry_count'].",".sales_new::SALES_FINDMORE)));
		} else {
			echo json_encode(sales_new::ajax_minify_data_for_get_sales_list(sales_new::load_by_customer_id($raw_POST['customer_id'])->get_sales(1,$raw_POST['entry_count'].",".sales_new::SALES_FINDMORE)));
		}
	break;
	Case "del_so_pdf":
		SinkNet::get('order_history')->del_so_pdf($_GET['invoice_id']);
	break;




//DETAILS SECTION
	Case "set_details":
		$customer = customer_new::load($raw_POST['customer_id']);
		
		if ( $customer->get_customer()['want_newsletter'] == 0 && $raw_POST['want_newsletter'] == 1 && SinkNet::get_settings(3) == "prod" ) {
            SinkNet::get('constant_contact')->set_email_addresses( $_POST['customer_id'],true);
        } else if ( $customer == 1 && $_POST['want_newsletter'] == 0 && SinkNet::get_settings(3) == "prod" ) {
            SinkNet::get('constant_contact')->set_email_addresses( $_POST['customer_id'],false);
		}
		
		SinkNet::get('recent_updates')->set_details_update($raw_POST);
		customer_new::ajax_set_details_window($raw_POST);

		echo '{}';
	break;
	Case "set_screens":
		echo SinkNet::get('recent_updates')->set_screens_update($raw_POST);
		echo json_encode(customer_new::ajax_set_touchscreens_window($raw_POST));
	break;
	Case "details_reload":
        session_write_close();
    	echo json_encode(array(
			'full' => block_details_full::get_html(+$_GET['cust_id']),
			'mini' => block_details_mini::get_html(+$_GET['cust_id']),
		));
	break;

//TASKS SECTION
    case 'redistribute_tasks':
        $acc_id = $_POST['id'];
        if(SinkNet::get('tasks')->redistribute_for_user($acc_id)) {
            echo 'success';
        }
    break;
    Case "tasks_reload":
    	echo json_encode(array(
			'full' => block_tasks_full::get_html(+$_GET['cust_id']),
			'mini' => block_tasks_mini::get_html(+$_GET['cust_id']),
		));
   	break;
   Case "add_tasks_custom": 
        $account_id = $_POST['account_id']; 
        $type_ids   = $_POST['type_ids']; 
        $limit      = $_POST['limit']; 
        if(SinkNet::get('tasks')->ajax_add_custom_tasks($account_id,$type_ids,$limit)) { 
            echo 'success'; 
        } 
     break; 
//RMA SECTION
	Case "get_rma_page_left_menu":
        session_write_close();
		echo block_rma_page_left_menu::get_html(+$_GET['customer_id']);
	break;
	Case "get_rma_contacts":
		echo json_encode(rma_page_new::get_shipto_contacts(explode(",",$raw_GET['invs'])));
	break;
	Case "get_rma_info":
		echo json_encode(rma_page_rma::ajax_get_rma(+$_GET['rma_id']));
	break;
	Case "get_addable_products":
		echo json_encode(rma_page_rma::load(+$_POST['id'])->get_addable_products($_POST['nums'],true));
	break;
	Case "del_rma":
		echo SinkNet::get('recent_updates')->del_rma_update($_GET);
		rma_page_rma::load(+$raw_GET['rma_id'])->del();
	break;
	Case "add_new_rma":
		if ( customer_new::load($_GET['cust_id'])->get_sales() ) {
			$rma_id	= rma_page_rma::add(+$raw_GET['cust_id'],+$raw_GET['account_id']);
			SinkNet::get('recent_updates')->set_rma_add($raw_GET,+$rma_id);
			echo $rma_id;
		} else { echo "false"; }
	break;
	Case "set_rma_info":
		echo SinkNet::get('recent_updates')->set_rma_update($raw_POST,rma_page_rma::ajax_get_rma(+$raw_POST['rma_id']));
		rma_page_rma::ajax_set_from_post($raw_POST);
	break;
	Case "get_rma_page_management_html":
		echo block_dashboard_rma_page_result::get_html($_POST);
	break;
	Case "get_rma_check_invoice":
		echo sales_new::invoice_exists(+$raw_GET['invoice_id'],+$raw_GET['customer_id']);
	break;
	Case "get_rma_invoices_search":
		echo json_encode(array_slice(sales_new::load_by_customer_id(+$raw_GET['customer_id'])->get_invoice_ids_search(+$raw_GET['term']),0,10));
	break;

//Invoices
	Case "get_invoice_date":
		echo sales_new::get_invoice_dates([+$raw_GET['invoice_id']])[+$raw_GET['invoice_id']];
	break;
	Case "get_invoices_search_all":
		echo json_encode(array_slice(sales_new::load_by_customer_id(+$raw_GET['customer_id'])->get_invoice_ids_search_all($raw_GET['term']),0,10));
	break;

//QCRA
	Case "get_qcra_info":
		echo json_encode( rma_page_qcra::ajax_get(+$raw_GET['qcra_id']));
	break;
	Case "qcra_get_included_products":
		echo json_encode( fishbowl_product::get_products_by_invoice_ids([+$raw_GET['invoice_id']]));
	break;
	Case "set_qcra_info":
		echo SinkNet::get('recent_updates')->set_qcra_update( $raw_POST,rma_page_qcra::ajax_get(+$raw_POST['id']) );
		echo rma_page_qcra::ajax_set_from_post($raw_POST);
	break;
	Case "add_new_qcra":
		if ( customer_new::load($raw_GET['cust_id'])->has_qcra_item() ) {
			$qcra_id	= rma_page_qcra::add(+$raw_GET['cust_id'],+$raw_GET['account_id']);
			SinkNet::get('recent_updates')->set_qcra_add($_GET,$qcra_id);
			echo $qcra_id;
		} else { echo "false"; }
	break;
	Case "del_qcra":
		echo SinkNet::get('recent_updates')->del_qcra_update($_GET);
		rma_page_qcra::load(+$raw_GET['qcra_id'])->del();
	break;
	Case "get_total_cost":
		echo SinkNet::get('sales')->get_invoice_total( $_GET['inv_id'] );
	break;
	Case "get_qcra_check_invoice":
		echo sales_new::invoice_exists(+$raw_GET['invoice_id'],+$raw_GET['customer_id'],true);
	break;



//TASKS
	Case "get_task_form":
		include($_SERVER['DOCUMENT_ROOT']."/pages/html_blocks/task_form.php");
		echo json_encode($htmlz);
	break;
	Case "set_form_questions":
		echo SinkNet::get('tasks')->set_form_questions($_POST);
	break;
	Case "task_add_phone_log":
		echo SinkNet::get('tasks')->add_phone_log($_POST);
	break;
	Case "task_add_email_log":
		echo_me(SinkNet::get('tasks')->add_email_log($_POST));
	break;
    Case "add_task":
        SinkNet::get('tasks')->add_task($raw_GET['customer_id'],$raw_GET['account_id'],$raw_GET['type_id']);
    break;
    Case "get_task_info":
        echo json_encode(sinknet::get('tasks')->get_task_info($raw_GET['id']));
    break;
    Case "set_time_to_start":
        SinkNet::get('tasks')->set_time_to_start($raw_GET['id'],$raw_GET['date']);
    break;




//RECENT_UPDATES
	Case "get_recent_updates":
        session_write_close();
		echo json_encode(SinkNet::get('recent_updates')->get_all_updates($_GET['cust_id']));
	break;




//EMAIL
	Case "email_attachments":
		switch ($_POST['email_type']) {
			case 2:
				$class_name = 'email_invoice';
				break;
			default:
				$class_name = 'email';
				break;
		}
		echo json_encode(call_user_func(array($class_name, 'get_attachment_previews'), Sinknet::get_account_id(), $raw_POST['customer_id'], $raw_POST['data']));
	break;

	Case "email_preview":
		switch ($_POST['email_type']) {
			case 2:
				$class_name = 'email_invoice';
				break;
			default:
				$class_name = 'email';
				break;
		}
		echo call_user_func(array($class_name, 'preview_body'), Sinknet::get_account_id(), $raw_POST['customer_id'], $raw_POST['data']);
	break;

	Case "email_send":
		$email = email::create(Sinknet::get_account_id(), $raw_POST['customer_id'], $raw_POST['data'], $raw_POST['email_type'], $raw_POST['task_id']);
		echo json_encode(array('success' => !!$email));
	break;
	Case "reload_email":
		echo block_email_full::get_html($raw_GET['customer_id']);
	break;




//DASHBOARD
	Case "get_account_info":
		$account = account_new::load(+$raw_GET['account_id']);
		$account->get_changeable_tasks();
		$account->get_task_priorities();
		$temp[] = $account->to_array();
		$temp[] = SinkNet::get('tasks')->get_account_tasks_count(+$raw_GET['account_id']);
		echo json_encode($temp);
	break;
	Case "update_user_tasks":
		echo SinkNet::get('account')->update_user_tasks( $_POST );
	break;
	Case "build_tasks_html":
		echo SinkNet::get('tasks')->build_tasks_html($_GET['account_id'],$_GET['user_account_id']);
	break;
	case 'build_completed_tasks_html':
		echo SinkNet::get('tasks')->build_tasks_completed_html($_GET['account_id'], $_GET['user_account_id']);
	break;
	case "get_dashboard_tasks":
		echo block_dashboard_task_right::get_html(+$raw_GET['account_id']);
	break;
/*
 * Comes up unused in script but it's used ajaxlike with iframes in pages
 */
	case "get_jasper_sales_order":
		echo jasper_server::get_sales_order($_GET['invoice_id'],true);
	break;

//FAX INVOICE
	Case "set_sent_fax_invoice":
		echo SinkNet::get('tasks')->set_sent_fax_invoice($_POST);
	break;


//PDF CLASS STUFF
	case "open_pdf":
		pdf::get($_GET['type'],$_GET['id'])->build_pdf();
	break;

//UPLOADER CLASS STUFF
	case "upload_files":
		$raw_GET['files'] = $_FILES;
		echo uploader::get($raw_GET)->upload();
	break;

//SUGGEST_LOOKUP CLASS STUFF
	case "suggest_lookup":
		suggest_lookup::get($_GET['type'], $_GET['term']);
	break;

//Dashboard account management
	case 'account_settings':
		if($_POST['change_password']) {
			echo (SinkNet::get('accounts')->update_password($_POST['account_id'],md5($_POST['pass']))) ? 'success' : 'failed';
		}
		if($_POST['change_pin']) {
			echo (SinkNet::get('accounts')->update_pin($_POST['account_id'],md5($_POST['pin']))) ? 'success' : 'failed';
		}
	break;
	case 'admin_save_user':
		SinkNet::get('accounts')->admin_save_user($_POST);
	break;
	case 'admin_create_user':
		echo SinkNet::get('accounts')->create_user($_POST['email'], md5($_POST['password1']), md5($_POST['pin1']), !!$_POST['enable'], $_POST['first_name'], $_POST['last_name'], array_keys($_POST['groups']));
	break;
	case 'admin_save_group':
		SinkNet::get('accounts')->update_group($_POST['gid'], $_POST['group_name'], $_POST['group_description']);
	break;
	case 'admin_create_group':
		SinkNet::get('accounts')->create_group($_POST['name'], $_POST['description']);
	break;

//MISC
	Case "get_tracking_no_update":
		$track_info = tracking::get_tracking_type($_GET['track']);
		$track_info->set_new_tracking_status();
		echo json_encode($track_info->get_vars());
	break;

//Terms... WWAD
    Case "terms_load_page":
        $class = "block_terms_".$raw_GET['page'];
        echo $class::get_html($raw_GET);
    break;
    Case "terms_validate_invoice":
        $terms = new terms($raw_GET['customer_id']);
        echo json_encode($terms->validate_invoice($raw_GET['invoice_id']));
    break;
    Case "terms_validate_fishbowl_id":
        $terms = new terms($raw_GET['customer_id']);
        echo $terms->validate_fishbowl_id($raw_GET['fishbowl_id']);
    break;
    Case "terms_add_invoice":
        $terms = new terms($raw_GET['customer_id']);
        echo $terms->get_credit_apps()[$raw_GET['credit_app_id']]->add_invoice($raw_GET['invoice_id']);
    break;
    Case "terms_add_credit_memo":
        $terms = new terms($raw_GET['customer_id']);
        echo $terms->get_invoice_by_id($raw_GET['id'])->add_credit_memo($raw_GET['amount'],$raw_GET['number']);
    break;
    Case "terms_add_credit_app":
        $terms = new terms($raw_POST['customer_id']);
        echo $terms->ajax_add_credit_app($raw_POST);
    break;
    Case "terms_delete_credit_memo":
        $terms = new terms($raw_GET['customer_id']);
        echo $terms->get_credit_memo_by_id($raw_GET['id'])->delete();
    break;
    Case "terms_delete_invoice":
        $terms = new terms($raw_GET['customer_id']);
        echo $terms->get_invoice_by_id($raw_GET['id'])->delete();
    break;
    Case "terms_reload":
        session_write_close();
        echo json_encode(array(
            'full' => block_terms_full::get_html(+$raw_GET['customer_id']),
            'mini' => block_terms_mini::get_html(+$raw_GET['customer_id']),
        ));
    break;

    //USER MANAGEMENT
    Case 'get_isenable_user':
        echo json_encode(account_new::ajax_get_enable_or_disable_user($raw_GET['is_enable']));   
    break;
    
    //Displays the user information on the update user panel.
    Case 'show_user_info':   
        $account = account_new::ajax_get_account_info($raw_GET['account_id']);
        echo json_encode($account);
    break;
    
    //display the create user panel
    Case 'create_new_user':
        echo block_dashboard_user_management_right::get_html();   
        break;
        
    Case 'color_map_box_change': 
        $color = account_user_colors::get_all_color_map()[$raw_GET['color_index']];
        echo json_encode($color);
        break;
        
    //create an account in the database
    Case 'create_user_account':
        echo  account_new::ajax_create_user_account($raw_POST);
        break;
        
   Case 'update_user_account':
       echo account_new::ajax_update_user_account($raw_POST);
   break;
   
    Case 'check_ip_is_using':
        $result = account_user_phone_ips::ajax_check_ip_is_using($raw_GET['phone_ip'],$raw_GET['account_id']);
        echo json_encode($result);
    break;
//TEMP CALL FOR DUPS... mebee PERM?
	Case "temp_dup_check_this":
		$query = "update customer set dup_check = 0 where id = ".$_GET['customer_id'];
		SinkNet::db()->query($query);
		zlog_path($_GET['account_id']." for company: ".$_GET['customer_id'],"dup_clicked");
		break;

	Default:
		echo "FAILURE AT REFFING LIFE";
		zlog(date("F j, Y, g:i a"). ": Tried to call ".$_GET['ref']." but got lost in cyberspace.\n");
	break;
}
?>