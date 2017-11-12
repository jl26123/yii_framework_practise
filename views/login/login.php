<?php

use app\assets\DefaultAsset;

DefaultAsset::register($this);
$this->title ="Sinknet";
?>

<div class="log_me_in">
	<form method="post">
		<img class="logo" src="/yii_basic/web/images/sinknetlogo.png"></img>
		<div class="inputs">
			<input type="text" id="username" name="username" placeholder="E-mail"></input>
			<img class="email_img" src="/yii_basic/web/images/login.png"></img>
			<input type="password" id="password" name="password" placeholder="Password"></input>
			<img class="password_img" src="/yii_basic/web/images/password.png"></img>
			<input type="password" id="pin" name="pin" placeholder="PIN"></input>
			<img class="pin_img" src="/yii_basic/web/images/pin.png"></img>
		</div>
		<input type="submit" class="login_btn" id="login_btn" value="Log In"></input>
	</form>
</div>
