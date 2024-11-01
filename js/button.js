
var skipcash_override_last = '';
var skipcash_override_last_interval = null;
function skipcash_button_do_override(that) {
	if (skipcash_override_last_interval) {
		clearInterval(skipcash_override_last_interval);
	}
	if (that.id !== 'payment_method_skipcash') {
		document.getElementById('woo_skipcash_button').style.display = 'none';
		document.getElementById('skipcash-button-description').style.display = 'none';

	}
	if (that.id !== 'payment_method_skipcash' && skipcash_override_last === 'payment_method_skipcash') {
		document.getElementById('place_order').style.display = 'block';
	}
	if (that.id === 'payment_method_skipcash') {
		document.getElementById('place_order').style.display = 'none';
		document.getElementById('woo_skipcash_button').style.display = 'block';
		document.getElementById('skipcash-button-description').style.display = 'block';
	}
	skipcash_override_last_interval = setTimeout(function () {
		if (that.id === 'payment_method_skipcash') {
			document.getElementById('place_order').style.display = 'none';
			document.getElementById('woo_skipcash_button').style.display = 'block';
			document.getElementById('skipcash-button-description').style.display = 'block';
		}
	}, 0); // ensure this is the last event
	skipcash_override_last = that.id;
}

jQuery( document.body ).on( 'updated_checkout', function () {

	if (!document.getElementById('woo_skipcash_button') || !document.getElementById('skipcash-button-description')) {
		return;
	}

	var inputs = getInputsWithName('payment_method');
	var selected = false;
	for (var i = 0; i < inputs.length; i++) {
		if (inputs[i].id === 'payment_method_skipcash' && inputs[i].checked) {
			selected = true;
			skipcash_button_do_override(inputs[i]); // initial status
		}
		
		inputs[i].onclick = function () {
			skipcash_button_do_override(this);
		}
	}
	if (!selected) {
		document.getElementById('woo_skipcash_button').style.display = 'none';
		document.getElementById('skipcash-button-description').style.display = 'none';

	}
} );
