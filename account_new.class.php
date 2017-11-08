<?php

	class account_new {
		use db;

		protected $account = false;
		protected $account_id = false;
		protected $changeable_tasks = false;
		protected $emails = false;
		protected $group_ids = false;
		protected $fishbowl_names = false;
		protected $task_priorities = false;
		protected $user_groups = false;
		
		protected static $accounts = false;
		protected static $fishbowl_id_to_account_id_link = false;
		
		final protected function __construct(array $data) {
			$this->account_id = $data['id'];
			$this->account = $data;
		}
		
		final public function get_account(){
			if ( $this->account === false) {
				$this->account = $this->get_accounts()[$this->account_id];///****static::?????
			}
			return $this->account;
		}
		
		final private static function get_accounts(){
			if ( self::$accounts === false ) {
				foreach ( self::db()->query("select * from accounts inner join accounts_settings on accounts_settings.id = accounts.id") as $row ){
					$row['full_name'] = $row['first_name']." ".$row['last_name'];					
					self::$accounts[$row['id']] = new self($row);
				}
			}
			return self::$accounts;
		}
		
		final public static function get_accounts_by_user_groups($id){
			$account_in_group = [];
			foreach ( self::get_accounts() as $account ){
				echo_me($account->get_user_groups());
			}
		}
		
		final public function get_changeable_tasks(){
			if ( $this->changeable_tasks === false ){
				$this->changeable_tasks = set_custom_keys(self::db()->query("select * from task_types where id not in ( 1,2,3,4 ) and enabled = 1"),'id',true);
			}
			return $this->changeable_tasks;
		}
		
		final public function get_emails(){
			if ( $this->emails === false ) {
				$temp = [];
				foreach ( self::db()->query("select id from emails where account_id = {$this->account_id} order by id desc") as $row ) {
					$temp[] = email::fetch_with_id($row['id']);
				}
				$this->emails = $temp;
			}
			return $this->emails;
		}
		
		final public function get_fishbowl_names(){
			if ( $this->fishbowl_names === false ) {
				$temp = [];
				foreach ( self::db()->query("select fishbowl_username from accounts_fishbowl where account_id = {$this->account_id}") as $row ){
					$temp[] = $row['fishbowl_username'];
				}
				$this->fishbowl_names = $temp;
			}
			return $this->fishbowl_names;
		}
		
		// array of [fishbowl_user_id] => [sinknet_account_id]
		final public static function get_fishbowl_id_to_account_id_link($id){
			if ( self::$fishbowl_id_to_account_id_link === false ) {
				foreach ( self::db()->query("select account_id,fishbowl_id from accounts_fishbowl ") as $row ){
					$ids[$row['fishbowl_id']] = $row['account_id'];
				}
				self::$fishbowl_id_to_account_id_link = $ids;
			} 
			return self::$fishbowl_id_to_account_id_link[$id];
		}
		
		final public function get_group_ids(){
			if ( $this->group_ids === false ) {
				$temp = [];
				foreach ( $this->get_user_groups() as $entry ) {
					$temp[] = $entry->get_value('group_id');
				}
				$this->group_ids = array_unique($temp);
			}
			return $this->group_ids;
		}

		final public function get_id(){
			return $this->account_id;
		}
		
		final public function get_task_priorities(){
			if ( $this->task_priorities === false ) {
				$temp = [];
				foreach ( self::db()->query("select tpo.task_id,tpo.priority,tpo.enabled,tt.name from task_priority_order as tpo inner join task_types as tt on tt.id = tpo.task_id where account_id = {$this->account_id}") as $row ) {
					$temp[$row['task_id']] = $row;
				}
				$this->task_priorities = $temp;
			}
			return $this->task_priorities;
		}
		
		final public function get_user_groups(){
			if ( $this->user_groups === false ) {
				$this->user_groups = account_user_groups::load_by_account_id($this->account_id);
			}
			return $this->user_groups;
		}
		
		final public function get_value($v){
			if ( isset($this->get_account()[$v]) ) {
				return $this->get_account()[$v];
			} else { return 0; }
		}
		/*
                 * Sets value of the rows that are stored in the data object.
                 * The data object each row's name is same as the name of the row of the table.
                 * The data object contains the data of this account that is stored in the accounts table and accounts_setting table.
                 */
                final private function set_value($content=false, $key=false){
                    if($key ===false){return false;}
                    $account = $this->get_account();
                    if(array_key_exists($key,$account)){
                        $this->account[$key] = $content;
                        return true;
                    }
                    return false;
                }
                
                final public function insert_attendance(){
                    if ( !self::db()->query(sprintf("select * from accounts_attendance where account_id = '%s' and date = '%s'",$this->get_id(),date('Y-m-d'))) ){
                        self::db()->query(sprintf("insert into accounts_attendance (account_id,date) values ('%s','%s')",$this->get_id(),date('Y-m-d')));   
                    }
                }

                final static function load($account_ids) {
                        if ( !is_array($account_ids) ) {
                                return self::get_accounts()[$account_ids];	
                        } else if ( is_array($account_ids) ) {
                                foreach ( $account_ids as $account_id ) {
                                        $temp[$account_id] = self::get_accounts()[$account_id];
                                }
                                return $temp;
                        }
                }

                final static function load_enabled(){
                        foreach ( self::get_accounts() as $account ) {
                                if ( $account->get_account()['enabled'] == 1 ){
                                        $temp[$account->get_account()['id']] = $account;
                                }
                        }
                        return $temp;
                }
		
		//forget why I did this, looking at it a second time, kinda silly code
		//TODO: better way to do this function
		final static function load_fishbowl_relations(){
			$accounts	= self::load_enabled();
			foreach( $accounts as $account ) {
				if ( $account->get_fishbowl_names() ) {
					foreach ( $account->get_fishbowl_names() as $fishbowl_name ){
						$t[strtolower($fishbowl_name)] = $account;
					}
				}
			}
			return $t;
		}
		
		final public function to_array(){
			return get_object_vars($this);			
		}
		
		final public function update_last_visited(){
			self::db()->query(sprintf("update accounts set date_last_visited = %s where id = %d","now()",$this->account_id));
            
                        if ( !isset($_SESSION['attendance_set']) || $_SESSION['attendance_set'] != date('Y-m-d') ){
                            $this->insert_attendance();
                            $_SESSION['attendance_set'] = date('Y-m-d');
                        }
                }
		
		final public static function get_manageable_users_from_rma_group() {
			$query = "select accounts.first_name,accounts.last_name,accounts.id
						from accounts
						inner join accounts_user_groups_entry on accounts.id = accounts_user_groups_entry.account_id
						where group_id = 9 and accounts.enabled = 1";
			
			return class_set_inner_array(SinkNet::db()->query($query));
		}
	//--------------------------------------properties setter--------------------------------------------------
                /* 
                 * Sets the $user_groups property. $groups is an array and contains the a group of group ids.
                 */
                final private function set_user_groups($groups){
                    if(is_array($groups)){
                        $this->user_groups = account_user_groups::customize($this->get_id(),$groups);
                    }
                    else if($groups===false){
                        $this->user_groups  = false;
                    }
                }
                
                /*
                 * Sets the group_ids property of this object.
                 * $groups_ids should be array contains id of the groups that the account belongs to. 
                 */
                final private function set_group_ids($group_ids){
                    if(is_array($group_ids)){
                        $this->group_ids = array_unique($group_ids);
                    }
                    else if($group_ids===false){
                        $this->group_ids = false;
                    }               
                }
                
                /*
                 * Adds new groups into user_groups. 
                 * $groups is an array of group ids.
                 */
                final private function add_user_groups($groups){
                    $new_groups = account_user_groups::customize($this->get_id(),$groups);
                    $unsorted = array_merge($this->get_user_groups(),$new_groups);
                    uasort($unsorted, function ($a,$b) {
                               return $a->get_value('group_id')-$b->get_value('group_id');
                       });
                    $this->user_groups =  $unsorted;
                }
                
                /*
                 * Adds new groups into group_ids.
                 * $group_id is an array of group ids. 
                 */
                final private function add_group_ids($group_ids){
                    $unsorted = array_merge($this->get_group_ids(),$group_ids); 
                    sort($unsorted);
                    $this->group_ids = $unsorted;
                }
                
                /*
                 * Removes the ids in the $groups from the user_groups.
                 */
                final private function delete_from_user_groups($groups){
                    foreach($this->get_user_groups() as $key=>$entry){
                        if(in_array($entry->get_value('group_id'),$groups)){
                            unset($this->user_groups[$key]);
                        }
                    }
                    $this->user_groups = array_values($this->user_groups); 
                }
                
                /*
                 * Removes the ids in the $groups from the groups_ids.
                 */
                final private function delete_from_groups_id($groups){
                    foreach($this->get_group_ids() as $key=>$value){
                        if(in_array($value,$groups)){
                            unset($this->group_ids[$key]);
                        }    
                    }
                    $this->group_ids = array_values($this->group_ids);
                }
	//--------------------------------------User management system:--------------------------------------------
	
		/*
		*Gets all the accounts in the system.
		*/
		final public static function load_all_accounts(){
		    return self::get_accounts();
		}
		
		/*
		* Gets enable accounts or disable accounts.
		* @flag: '1'-enable or '0'-disable
		*/
		final public static function ajax_get_enable_or_disable_user($flag){
                    $accounts = self::load_all_accounts();
                    $temp =[];
                    $count = 0;
                    foreach($accounts as $key => $account){
                        if($account->get_account()['enabled']==$flag){
                            $temp[$count]['id'] =$key;
                            $temp[$count]['full_name'] = $account->get_account()['full_name'];
                            $count++;
                        }
                        else if($flag==""){
                            $temp[$count]['id'] =$key;
                            $temp[$count]['full_name'] = $account->get_account()['full_name'];
                            $count++;
                        }
                    }
                    usort($temp,function($a,$b){
           			return strcmp($a['full_name'],$b['full_name']);
                    });
                    return $temp;
		}
                
                /*
                 * Packages the account's information based on the given id.
                 */
		final public static function ajax_get_account_info($id){
			$account = self::load($id);
			$temp= array();
			$temp['username']= $account->get_account()['username'];
			$temp['first_name'] = $account->get_account()['first_name'];
			$temp['last_name'] = $account->get_account()['last_name'];
			$temp['enabled'] = $account->get_account()['enabled'];
			$temp['color_maps_remain']= account_user_colors::get_remain_color();
			if($temp['enabled']==1){
				$temp['color_index'] = $account->get_account()['color_map'];	
				if($temp['color_index']!='0'){
					$temp['color_map'] = account_user_colors::get_all_color_map()[$temp['color_index']];
					$temp['color_maps_remain'][$temp['color_index']]=$temp['color_map'];
				}
				else{
					$temp['color_map']='';
				}
			}
			else{
				$temp['color_index']='0';
				$temp['color_map']='';
			}
			$temp['phone_ip_address'] = $account->get_account()['phone_ip_address'];
			$temp['phone_extension'] = $account->get_account()['phone_extension'];
			$temp['groups'] = $account->get_group_ids();
			$temp['all_groups']=account_user_groups::get_groups();
			return $temp;
		}
		/*
		* Create a user account according to the given information.
		*/
		final public static function ajax_create_user_account($raw_POST){
			$enabled= $raw_POST['enabled']=='1'?1:0;
			$groups = isset($raw_POST['groups'])?$raw_POST['groups']:null;
			//default color is 0
			$color = isset($raw_POST['color_map'])?$raw_POST['color_map']:0;
			$phone['phone_ip_address'] = isset($raw_POST['phone_ip_address'])?$raw_POST['phone_ip_address']:'';
			$phone['phone_extension'] = isset($raw_POST['phone_extension'])?$raw_POST['phone_extension']:0;
			$user_type="U"; //user default type is "U"
			$id = self::insert_account( $raw_POST['username'],$raw_POST['password'],$raw_POST['pin'],
			 $user_type,$enabled, $raw_POST['first_name'],$raw_POST['last_name']);

			if(isset($raw_POST['groups'])){
			 self::insert_user_in_groups($id,$raw_POST['groups']);
			}
                        //task_cap, part_time and primary_task_user and signature will not be set.
		 	self::insert_user_setting($id,0,0,0,$color,'',$phone['phone_ip_address'],$phone['phone_extension']);
    
		     return "success";
		}
		
                /*
                 * Packaging the data passed from ajax and use the data to update the user account.
                 */
		final public static function ajax_update_user_account($raw_POST){
			$user = array();
			$id = $raw_POST['id'];
                        $account = self::load($id)->get_account();
			$user['username'] = $raw_POST['username'];
			$user['first_name'] = $raw_POST['first_name'];
			$user['last_name'] = $raw_POST['last_name'];
			$user['password'] = $raw_POST['password'];
			$user['pin'] =$raw_POST['pin'];
			$user['enabled']= ($raw_POST['enabled']=='1')?1:0;
			$groups = isset($raw_POST['groups'])?$raw_POST['groups']:null;
			$setting = array();
			$setting['color_map']=$raw_POST['color_map'];
			$setting['phone_ip_address'] =isset($raw_POST['phone_ip_address'])?$raw_POST['phone_ip_address']:'';
			$setting['phone_extension'] = isset($raw_POST['phone_extension'])?$raw_POST['phone_extension']:0;  
                        
                        //user is changed from disenable to enable
                        if($user['enabled']==1 && $account['enabled']==0){
                            $logg = new log();
                            $logg->log("something".$setting['color_map'],"tesst");
                            //User will recover previous color, if previous color isn't used.
                            if($setting['color_map']==0 && $account['color_map']!=0 && array_key_exists($account['color_map'],account_user_colors::get_remain_color()))
                            {
                                $setting['color_map'] =  $account['color_map'];
                            }
                            //User's ip phone will be empty if the ip has been used by another user.
                            if($setting['phone_ip_address']==$account['phone_ip_address'] && in_array($account['phone_ip_address'],account_user_phone_ips::get_ip_using())){
                                $setting['phone_ip_address']="";
                            }
                        }
                        self::update_user_setting($id,$setting);
                        self::update_user_groups($id,$groups);
                        self::update_account_row($id,$user);
                        return 'success';
		    
		}
		
                /*
                 *  Insert a new account into accounts table, and also add the new account into memory.
                 */
		final public static function insert_account($username,$password,$pin,$user_type,$enabled,$first_name,$last_name){      
                    $data = array();           
                    $data['username'] = clean_string($username);
                    $data['password'] = clean_password_string($password);
                    $data['pin'] = clean_password_string($pin);
                    $data['user_type'] = clean_string($user_type);
                    $data['enabled'] = $enabled;
                    $data['first_name'] = clean_string($first_name);
                    $data['last_name'] = clean_string($last_name);
                    $data['full_name'] = $data['first_name']." ".$data['last_name'].
                            	    
		    $sql = sprintf("INSERT INTO accounts (username,password,pin,user_type,enabled,first_name,last_name) values ('%s','%s','%s','%s','%d','%s','%s')",
		        $data['username'],$data['password'],$data['pin'],$data['user_type'], $data['enabled'], $data['first_name'], $data['last_name']);
		    self::db()->query($sql);
                    $data['id'] = self::db()->last_id;
                    //add new account into memeory
                    self::$accounts[$data['id']]=new account_new($data);
		    return $data['id'];
		    
		}
		
                /*
                 * Insert a group of groups value into accounts_user_groups_entry if the account is exist. 
                 * Otherwise it will do nothing and return false;
                 * @Groups: Array;
                 */
		final public static function insert_user_in_groups($id,$groups){
                    $account = self::load($id);
                    if(isset($account)){
                      foreach($groups as $group){
                          $sql =  sprintf("INSERT INTO accounts_user_groups_entry (account_id, group_id) VALUES ('%d', '%d')",
                              $id,$group);
                          self::db()->query($sql);
                      }
                      //Insert groups into memory
                     $account->add_group_ids($groups);
                     $account->add_user_groups($groups);
                      return $id;
                    }
                    return false;
		    
		}
		
                /*
                 * Insert a group of setting of the given account into accounts_settings if the given account is exist.
                 * Otherwise, it will do nothing and return false.
                 */
		final public static function insert_user_setting($id,$task_cap,$part_time,$primary_task_user,$color_map,$signature,$phone_ip,$phone_ex){
		    $account = self::load($id);
                    if(isset($account)){ 
                        $phone_ip_clean = clean_string($phone_ip);
                        $signature_clean = clean_string($signature);
                        $sql =  sprintf("INSERT INTO accounts_settings (id,task_cap,part_time,primary_task_user,color_map,signature,phone_ip_address, phone_extension) "
                                . "VALUES (%d,%d,%d,%d,%d,'%s','%s',%d) ON DUPLICATE KEY UPDATE 
                                task_cap = %d, part_time = %d, primary_task_user = %d,color_map = %d, signature = '%s', phone_ip_address = '%s', phone_extension = %d;"
                            ,$id,$task_cap,$part_time,$primary_task_user,$color_map,$signature_clean,$phone_ip_clean,$phone_ex,
                            $task_cap,$part_time,$primary_task_user,$color_map,$signature_clean,$phone_ip_clean,$phone_ex);
                        self::db()->query($sql);
                        $account->set_value($task_cap,"task_cap");
                        $account->set_value($part_time,"part_time");
                        $account->set_value($primary_task_user,"primary_tak_user");
                        $account->set_value($color_map,"color_map");
                        $account->set_value($signature,"signature");
                        $account->set_value($phone_ip,"phone_ip_address");
                        $account->set_value($phone_ex,"phone_extension");
                        return $id;
                    }
                    return false;
		}
		
    
		
		/*
                 * Updates accounts_setting table based on the input. If some accounts setting change, update the setting in both databse and memory and return true. 
                 * Otherwise, return false.
                 * The info_array should be array, which contents the information changed. Format: $info_array['row_name'] = row_value;
                 */
		final public static function update_user_setting($id, $info_array){
                    $account = self::load($id);
		    if(isset($account) && is_array($info_array)){
                        $sql = "UPDATE accounts_settings SET ";
                        $info_clause = array();
                        $old_data = $account->get_account();
                        $change_data = array();//It is used to change memomry until sql is executed successfully.
                        //Compare the setting to decide whether information has been changed.
                        foreach($info_array as $key =>$value){
                            if( $key=='phone_ip_address' && clean_string($value) != $old_data[$key]){
                                $info_clause[] = "$key = \"". clean_string($value)."\"";
                                $change_data[$key] = clean_string($value);
                            }
                            else if(isset($old_data[$key]) && $value != $old_data[$key]){
                                $info_clause[] = "$key = $value";
                                $change_data[$key] = $value;
                            }
                        }
                        //If change, update infomation.
                        if(count($info_clause)>0){
                                $sql .=  implode(",", $info_clause). " WHERE id = %d;";
                                $sql = sprintf($sql,$id); 	  
                                self::db()->query($sql);
                                foreach($change_data as $key=>$value){
                                    $account->set_value($value,$key);
                                }
                                return true;
                        }
                    }
    		    return false;
		}
		
                /*
                 * Update the user's groups. If $groups == null, delete all the groups of this accounts.
                 * If any
                 */
		final public static function update_user_groups($id,$groups){
                   $account = self::load($id);
		    if(isset($account) && is_array($groups)){
                        $old_data = $account->get_group_ids();
                        $new_groups = array();
                        $delete_groups = array();
                        foreach($old_data as $key=>$value){
                            if(!in_array($value,$groups)){
                                $delete_groups[$key]=$value;
                            }
                        }
                        foreach($groups as $value){
                            if(!in_array($value,$old_data)){
                                $new_groups[] = $value;
                            }
                        }
                        //Remove the groups that are no longer used.
                        if(count($delete_groups)){
                              self::delete_user_select_groups($id,$delete_groups,true);
                        }
                        //Add the groups that will be used in the future
                        if(count($new_groups)){
                              self::insert_user_in_groups($id,$new_groups);
                        }
                        return true;
		    }
                    //Input groups = null, delete all groups used to belong to this account
		    else if($groups==null){
		        self::delete_user_groups($id);
                        $account->set_user_groups(false);
                        $account->set_group_ids(false);
		        return true;
		    }
		    else{
		        return false;
		    }
		}
		
		/*
		* Update the accounts table. $info_array is an array, each element of which represents a row of accounts table.
		*/
		final public static function update_account_row($id,$info_array){
                    $account = self::load($id);
		    if(isset($account) && is_array($info_array)){
                        $sql = "UPDATE accounts SET ";
                        $info_clause = array();
                        $old_data = $account->get_account();
                        $change_data = array();//It is used to change memomry until sql is executed successfully.
                        foreach($info_array as $key => $value){
                            if($key=='username'||$key =='first_name'||$key == 'last_name'){
                                    if(clean_string($value) != $old_data[$key]){
                                        $info_clause[] = "$key = \"".clean_string($value)."\"";
                                        $change_data[$key] = clean_string($value);
                                    }
                              }
                              else if(($key == 'password' || $key == 'pin') && ($value == '')){
                                  //if password or pin is empty, it will not be changed to be empty. 
                              }
                              else if(($key == 'password' || $key == 'pin') && ($value != '')){
                                  if(clean_password_string($value) != $old_data[$key]){
                                        $info_clause[] = "$key = \"".clean_password_string($value)."\"";
                                        $change_data[$key] =  clean_password_string($value);
                                  }
                              }
                              else if(isset($old_data[$key]) && $value != $old_data[$key]){
                                  $info_clause[] = "$key = ".$value;
                                  $change_data[$key] =  $value;
                              }
                        }
                        $sql .= implode(",",$info_clause). " WHERE id = %d;";
                        $sql = sprintf($sql,$id);
                        if(count($info_clause)){
                            self::db()->query($sql);
                            foreach($change_data as $key=>$value){
                                $account->set_value($value,$key);
                            }
                             return true;
                        }
                    }
		    return false;
		}
                
		
		/*
		* Delete the specific groups.
		* id----the user id, $groups----array contain group_id which should be delete.
		*/
		final public static function delete_user_select_groups($id,$groups,$key_is_index=false){
		    $sql = sprintf("DElETE FROM accounts_user_groups_entry WHERE account_id = %d and group_id in (%s)",$id,implode(',',$groups));
		    self::db()->query($sql);
                    $account = self::load($id);
                    $account->delete_from_user_groups($groups);
                    $account->delete_from_groups_id($groups);
		}
	

		//DELETE USER ACCOUNT CAN BE DELETED---------------------------------------------------ABANDON

		final public static function delete_user_setting($id){
    		$sql = sprintf("DELETE FROM accounts_settings WHERE id = %d;",$id);
    		self::db()->query($sql);
    		//remove the data in the memory
    		$old_data = self::get_accounts()[$id];
    		unset($old_data['task_cap']);
    		unset($old_data['part_time']);
    		unset($old_data['primary_task_user']);
    		unset($old_data['color_map']);
    		unset($old_data['signature']);
    		unset($old_data['phone_ip_address']);
    		unset($old_data['phone_extension']);
		}


		final public static function delete_user_account($id){
		    self::delete_user_groups($id);
		    self::delete_user_setting($id);
		    self::delete_account_row($id);
		    return 'success';
		    
		}

		
		final public static function delete_account_row($id){
		    $sql =sprintf("DELETE FROM accounts WHERE id=%d;",$id);
		    self::db()->query($sql);
		    //remove the data in the memory
		     unset(self::get_accounts()[$id]);

		}

		
		final public static function delete_user_groups($id){
		    
		    $sql = sprintf("DELETE FROM accounts_user_groups_entry WHERE account_id = %d;",$id);
		    self::db()->query($sql);
		    /* echo_me("test..debug");
		    debug("test...debug"); */
		    //set group method***********************
		}
		
	}

?>
