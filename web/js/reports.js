jQuery(document).ready(function($){
	reports = new reports();
	reports.start();
});

function reports() {
	var that = this;

	this.start = function () {
		that.bind_events();
	}

	this.get_settings = function() {
		var settings = {};
		
		settings.days 			= $('#days_back').val();
		settings.report_id		= $('#report_id').val();
		settings.location_id	= $('#location_id').val()
		
		return settings;
	}

	this.bind_events = function() {
		$('button#go').on('click',function(){
			$.post("/php/reports_ajax.php?ref=get_report",
					that.get_settings(),
					function ( data ) {
						$('#reports .middle').html(data);
						that.test2();
					}
			);
		});
		$('#report_id').on('change',function(){
			$.post("/php/reports_ajax.php?ref=get_options",
					that.get_settings(),
					function ( data ) {
						$('#options').html('');
						$('#options').html(data);
					}
			);
		});
	}
	
	this.test = function() {
		var data = JSON.parse($('#reports .middle').html());
		var colour = ['#0000ee','#FF0000','#FF00FF','#336600','#000000','#66FF00']
		$('#reports .middle').html('');
		var a = [];

		var count = 0;
		$.each(data,function(i,v) {
			a[count] = [];
			$.each(v,function(ii,vv){
				a[count].push( [ vv['date_shipped']*1000,vv['sales'] ] );
			});
			count++;
		});
		console.log(a);
		
		var options = {
			series: {},
			grid: {
				show: true,
			},   
			xaxis: {
				mode: "time",
				TickSize: [2, "day"]
			},
			yaxes: [

			]
		};
		
		var plot_data = [];
		
		$.each(a,function(i,v){
			plot_data[i] = {data: a[i], yaxis: 1, color:colour[i]};
		});
		
		console.log(plot_data);
		
		$.plot( "#reports .middle", 
				plot_data,
				options
		);
	}
	this.test2 = function() {
		var data = JSON.parse($('#reports .middle').html());
		$('#reports .middle').html('');
		
		var html = "<table><tr><th>--------Group by--------</th><th>--------Sales--------</th><th>--------QTY--------</th><th>--------Sales / QTY--------</th><th>--------# of invoices--------</th><th>--------sales / # of invoices--------</th></tr>";
		var sales = 0;
		var qty = 0;
		var invoice_count = 0;
		
		$.each( data,function(i,v){
			html+="<tr><td>"+i+"</td><td>"+v['sales']+"</td><td>"+v['qty']+"</td><td>"+(number_format(v['sales']/v['qty'],2,".",","))+"</td><td>"+v['invoice_count']+"</td><td>"+number_format(v['sales']/v['invoice_count'],2,".",",")+"</td></tr>";
			sales+=v['sales'];
			qty+=v['qty'];
			invoice_count+=v['invoice_count'];
		});
		html+="</table>";
		html+="<br><br><h1>"+number_format(sales,2,".",",")+"</h1><h1>"+qty+"</h1><h1>"+number_format(sales/qty,2,".",",")+"</h1><h1>"+invoice_count+"</h1><h1>"+number_format(sales/invoice_count,2,".",",")+"</h1>";
		$('#reports .middle').html(html); 
	}
}