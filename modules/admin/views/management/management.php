<?php


use yii\helper\Html;
use yii\widgets\ActiveForm;
use app\assets\AppAsset;
use yii\web\View;

$this->title = "User Management";
AppAsset::register($this);
//View::registerCssFile("@web/css/user_management.css");
?>

<div class="bin" id="accounts-management">
    <div class="close_window" id="close_user_management"></div>
    <header class="title">User Management</header>
    <section class="content">
        <div class="user_management">
        	<table>
        		<tr>
        			<td>
        				Filter:<!--  <?php var_dump($accounts[2]->groups); ?> -->
        			</td>
        			<td>
        				<select class="select-style" id="is_enable">
        					<option value="">Please Select</option>
        					<option value='1'>Enable Account</option>
        					<option value='0'>Disable Account</option>
        				</select>
        			</td>
        		</tr>
        	
        		<tr>
        			<td>
        				Full Name:
        			</td>
        			<td>
        				<select class="select-style" id="dash_full_name">
        					<option class="" value="">Please Select</option>
                            <?<?php foreach($accounts as $account){
                                echo sprintf("<option value='%d'>%s</option>",$account->id,$account->fullName);

                            }

                            ?>

        					
        				</select>
        			</td>
        		</tr>
        		<tr>
        			<td>
        				Username:
                                        <span id = "dash_username_warning" class="user-account-warning">test</span>
                                 
        			</td>
        			<td>
        				<input class="input-style input_warning1" type="text" id="dash_user_name" />
        			</td>
        		</tr>
        		<tr>
        			<td>
        				First Name:
        			</td>
        			<td>
        				<input class="input-style" type="text" id="dash_user_first" />
        			</td>
        		</tr>
        		<tr>
        			<td>
        				Last Name:
        			</td>
        			<td>
        				<input class="input-style" type="text" id="dash_user_last"/>
        			</td>
        		</tr>
        		<tr>
                    <td>
                        Password:
                        <span id = "dash_password_warning" class="user-account-warning">test</span>
                    </td>
                    <td>
                        <input  class="password-style" type="password" id="dash_user_password" placeholder="Leave blank for no change"/>
                    </td>
                </tr>
                <tr>
                    <td>
                        
                        Re-Password:
                    </td>
                    <td>
                        <input  class="password-style" type="password" id="dash_user_password_re" placeholder="Leave blank for no change"/>
                    </td>
                </tr>
        		<tr>
                    <td>
                        PIN:
                         <span id = "dash_pin_warning" class="user-account-warning">test</span>
                    </td>
                    <td>
                        <input  class="password-style" type="password" id="dash_user_pin" placeholder="Leave blank for no change"/>
                    </td>
                </tr>
                <tr>
                    <td>
                        Re-PIN:
                    </td>
                    <td>
                        <input class="password-style" type="password" id="dash_user_pin_re" placeholder="Leave blank for no change"/>
                    </td>
                </tr>
        		<tr>
        			<td>
        				Is Account Enabled:
        			</td>
        			<td>
        				<div class="inline-box-w50p">
            				<label>
            					No:
            				</label>
            				<input type="radio" name="dash_user_isenable" value='0'/>
        				</div>
        				<div class="inline-box-w50p">
            				<label>
            					Yes:
            				</label>
            				<input type="radio" name="dash_user_isenable" value='1'/>
        				</div>
        			</td>
        		</tr>
        		<tr>
        			<td>Color Map:</td>
        			<td>
        				<select class="select-style" id="dash_user_color">
        					<option value="0"> Select Color Maps </option>
        
        				</select>
        			</td>
        		
        		</tr>
        		<tr>
        			<td>Phone IP:
                                    <span id = "dash_phone_ip_warning" class="user-account-warning">test</span>
                                </td>
        			<td>
        				<input class="input-style" type="text" id="dash_user_phone"/>
        			</td>
        			
        		
        		</tr>
        		<tr>
        			<td>
        				Extension:
                                        <span id = "dash_phone_extension_warning" class="user-account-warning">test</span>
        			</td>
        			<td>
        				<input class="input-style" type="text" id="dash_user_phone_ex"/>
        			</td>
        		</tr>
        	</table>
        	
        	<div class="width-100">
               	<div class="left-float-w50">
               		<div class="m-b-10">Allowed Groups:</div>
        			<select  multiple="multiple" class="selection-size" id="select_groups">
        			</select>
        		</div>
   				<div class="left-float-w50">
   				<div class="m-b-10">Not Allowed Groups:</div>
                	<select multiple="multiple" class="selection-size" id="unselect_groups">
      
                	</select>
               </div>
    		</div>
        	<div class="clean-float">
                <div class="user-management-left-button">
        		  <button id='dash_user_update'>Update</button>
                </div>
            <div class="user-management-right-button">
        	<!-- 	<button id='dash_user_delete'>Delete</button> -->
        		<button id='dash_user_create'>New</button>
            </div>
        	</div>
        
        </div>
    </section>
</div>