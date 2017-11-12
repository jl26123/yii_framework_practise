var use_window_controller = true;

jQuery(document).ready(function($){
	
	cust			= new customer();
	orderhistory	= new orderhistory();
	recent_updates	= new recent_updates();
	rma				= new rma_vars();
	tasks			= new tasks();
	validator		= new validator();
	qcra			= new qcra_vars();
	rma_page		= new rma_page();
	email			= new email();
	
	
	//new style... 
	terms_submit_invoice = new terms_submit_invoice(new page_events());
	terms_submit_credit_memo = new terms_submit_credit_memo(new page_events());
	terms_submit_credit_app = new terms_submit_credit_app(new page_events());
	terms_view_invoice = new terms_view_invoice(new page_events());
	terms_view_credit_app = new terms_view_credit_app(new page_events());
	terms_view_credit_memo = new terms_view_credit_memo(new page_events());
	terms           = new terms(new page_events());
	
	cust.start();
	orderhistory.start();
	rma.start();
	rma_page.start();
	qcra.start();
	tasks.start();		
	validator.start();
	recent_updates.start();
	//I'm not starting it here, starting it in terms because it is slow, and it's first step is
	//to 'reload view', rather loading the view, same call that also reloads, also it was firing
	//events off on page load and it should be when the view loads which is technically when ajax 
	//calls reload view
	//terms.start();
	
	//unsure why this was commented, nicolas probably loaded on email request or something
	//email.start();	
	
	if (use_window_controller) {
		window_controller = new WindowController();
		window_controller.start();
	}
	
	//controls all the pdf fancyboxs	
	$('.pdf_fancybox').fancybox({
		openEffect  : 'none',
		closeEffect : 'none',
		iframe : {
			preload: false
		}
	});

    //Lazy load terms in because it's slow!
    terms.reload_view();
});