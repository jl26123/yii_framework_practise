function validator() {
	var that = this;
	
	
	this.start = function() {
		/*
		var phone_inputs = ["f_customer_phone","f_customer_phone2","f_contact_main","f_contact_work", "f_contact_mobile",
							"f_contact_fax","ca_phone_number","ca_fax_number","ca_fax_number2","ca_phone_number2",
							"ca_t_phone_number1","ca_t_fax_number1","ca_t_phone_number2","ca_t_fax_number2",
							"ca_b_fax_number","ca_b_phone_number"];
		var phone_mask = [{ "mask": "###-###-####"}];
		
		$.each ( phone_inputs, function (i,v) {
			$('#'+v).inputmask({ 
				mask: phone_mask, 
				greedy: false, 
				definitions: { '#': { validator: "[0-9]", cardinality: 1}} 
			});
		});
		*/
	}
	
	this.number = function(str, required) {
		if ( /^\d+$/.test(str) ) {
			return true;
		} else {
			return false;
		}	
	}
	
	this.number_amount = function(str, required) {
		if ( /^\d+$|^\d+\.\d+/.test(str) ) {
			return true;
		} else {
			return false;
		}	
	}
	
	this.extension_pdf = function (str) {
		if ( str.length > 4 && str.substring( str.length - 3 ) == "pdf" ) {
			return true;
		} else {
			return false;
		}
	}	
	
	
	
	
	
}
