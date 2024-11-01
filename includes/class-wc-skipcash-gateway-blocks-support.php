<?php
use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

final class WC_Gateway_Skipcash_Blocks_Support extends AbstractPaymentMethodType
{

	private $gateway;

	protected $name = 'skipcash';

	public function __construct()
	{
		$this->initialize();
	}

	public function initialize()
	{
		$this->settings = get_option("woocommerce_{$this->name}_settings", array());
	}

	public function is_active()
	{
		return !empty ($this->settings['enabled']) && 'yes' === $this->settings['enabled'];
	}

	public function get_payment_method_script_handles()
	{

		wp_register_script(
			'wc-skipcash-blocks-integration',
			plugin_dir_url(__DIR__) . 'build/index.js',
			array(
				'wc-blocks-registry',
				'wc-settings',
				'wp-element',
				'wp-html-entities',
			),
			null, // or time() or filemtime( ... ) to skip caching
			true
		);

		$nonce = wp_create_nonce('handle_new_payment_submission_nonce');

		wp_localize_script(
			'wc-skipcash-blocks-integration',
			'skipcashNonce',
			array(
				'nonce' => $nonce,
			)
		);

		return array('wc-skipcash-blocks-integration');

	}

	public function get_payment_method_data()
	{
		return array(
			'title' => $this->get_setting('title'),
			'description' => $this->get_setting('description'),
			'button_description' => $this->get_setting('wc_button_description'),
			'button_text' => $this->get_setting('button_text'),
			'skipcash_url' => 'https://api.skipcash.app/',
			'sandbox' => $this->get_setting('sandbox'),
			'sandbox_url' => $this->get_setting('sandbox_url'),
			'client_id' => $this->get_setting('client_id'),
			'success_redirect_url' => null,
		);
	}

	/**
	 * Handles the payment submission via Ajax.
	 */
	public function handle_payment_submission()
	{
		// Check for nonce to ensure the request is secure.
		check_ajax_referer('handle_new_payment_submission_nonce', 'nonce');

		// Collect payment data from the AJAX request
		$settings = isset ($_POST['settings']) ? $_POST['settings'] : null;
		$order_id = isset ($_POST['order_id']) ? $_POST['order_id'] : null;

		if (!$settings) {
			wp_send_json_error('Missing settings', 400);
			return;
		}

		if (!$order_id) {
			wp_send_json_error('Missing order ID', 400);
			return;
		}

		$order = wc_get_order($order_id);
		$key_id = $this->get_setting('key_id');
		$key_secret = $this->get_setting('key_secret');

		$amount = number_format((float) $order->get_total(), 2, '.', '');
		$first_name = mb_substr($order->get_data()['billing']['first_name'], 0, 59, 'UTF-8');
		$last_name = mb_substr($order->get_data()['billing']['last_name'], 0, 59, 'UTF-8');
		$email = mb_substr($order->get_data()['billing']['email'], 0, 255, 'UTF-8');

		$data = [
			'uid' => sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000, mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)),
			'keyId' => $key_id,
			'amount' => $amount,
			'firstName' => $first_name,
			'lastName' => $last_name,
		];

		$phone = mb_substr($order->get_data()['billing']['phone'], 0, 15, 'UTF-8');
		if (!empty ($phone)) {
			$data['phone'] = $phone;
		}
		$data['email'] = $email;
		$street = mb_substr($order->get_data()['billing']['address_1'], 0, 59, 'UTF-8');
		if (!empty ($street)) {
			$data['street'] = $street;
		}
		$city = mb_substr($order->get_data()['billing']['city'], 0, 31, 'UTF-8');
		if (!empty ($city)) {
			$data['city'] = $city;
		}
		$state = mb_substr($order->get_data()['billing']['state'], 0, 2, 'UTF-8');
		if (!empty ($state)) {
			$data['state'] = $state;
		}
		$country = mb_substr($order->get_data()['billing']['country'], 0, 2, 'UTF-8');
		if (!empty ($country)) {
			$data['country'] = $country;
		}
		$postal_code = mb_substr($order->get_data()['billing']['postcode'], 0, 10, 'UTF-8');
		if (!empty ($postal_code)) {
			$data['postalCode'] = $postal_code;
		}
		$transaction_id = strval($order->get_id());
		if (!empty ($transaction_id)) {
			$data['transactionId'] = $transaction_id;
		}
		$data['custom1'] = 'blocks';

		// SkipCash API endpoint
		if ($settings['sandbox'] == 'yes') {
			$url = $settings['sandbox_url'];
		} else {
			$url = $settings['skipcash_url'];
		}
		$url = $url . 'api/v1/payments';

		$combined = [];
		foreach ($data as $key => $value) {
			$key[0] = strtoupper($key[0]);
			$combined[] = "$key=$value";
		}
		$combined = implode(',', $combined);
		$encrypted = hash_hmac('sha256', $combined, $key_secret, true);
		$authorization = base64_encode($encrypted);

		// Compose the headers, ensuring the Authorization header is included
		$headers = array(
			'Accept' => 'application/json',
			'Content-Type' => 'application/json',
			'Authorization' => $authorization
		);

		// Use wp_remote_post to send data to the SkipCash API
		$response = wp_remote_post(
			$url,
			array(
				'method' => 'POST',
				'body' => json_encode($data),
				'headers' => $headers,
				'timeout' => 45,
			)
		);

		if (is_wp_error($response)) {
			$error_message = $response->get_error_message();
			wp_send_json_error("Something went wrong: $error_message", 500);
		} else {
			// Assuming the response body contains the payUrl in a 'resultObj' object
			$body = json_decode(wp_remote_retrieve_body($response), true);

			if (isset ($body['resultObj']['payUrl'])) {
				$payUrl = $body['resultObj']['payUrl'];
				wp_send_json_success(array('payUrl' => $payUrl));
			} else {
				wp_send_json_error('Unexpected response from SkipCash: ' . print_r($body, 1), 500);
			}
		}
		wp_die();
	}

	/**
	 * Handles the payment gateway callback.
	 */
	public function handle_gateway_callback()
	{
		// Extract the data from the callback request.
		$status = isset ($_REQUEST['status']) ? sanitize_text_field($_REQUEST['status']) : '';
		$order_id = isset ($_REQUEST['transId']) ? absint($_REQUEST['transId']) : 0;

		if (!$order_id || !$status) {
			wp_die('Invalid callback request.', 'SkipCash Payment Gateway', 400);
		}

		$order = wc_get_order($order_id);
		if (!$order) {
			wp_die('Order not found.', 'SkipCash Payment Gateway', 404);
		}

		if (strtolower($status) === 'paid') {
			$order->update_status('processing', __('Payment received, order is now processing.', 'textdomain'));
			$return_url = $order->get_checkout_order_received_url();
			wp_redirect($return_url);
			exit;
		}

		// Fallback for other statuses or failed security checks
		wp_redirect(home_url());
		exit;
	}

	/**
	 * Gets the WC_Order return URL.
	 * We override this method if we need to add custom logic.
	 */
	public function get_return_url($order = null)
	{
		if ($order) {
			return $order->get_checkout_order_received_url();
		}
		return home_url();
	}

}

$wc_gateway_skipcash_blocks_support = new WC_Gateway_Skipcash_Blocks_Support();
add_action('woocommerce_api_wc_gateway_skipcash_checkd', array($wc_gateway_skipcash_blocks_support, 'handle_gateway_callback'));
add_action('wp_ajax_handle_payment_submission', array($wc_gateway_skipcash_blocks_support, 'handle_payment_submission'));
add_action('wp_ajax_nopriv_handle_payment_submission', array($wc_gateway_skipcash_blocks_support, 'handle_payment_submission'));

