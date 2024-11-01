<?php
/*
Plugin Name: SkipCash Payment Gateway
Plugin URI: https://skipcash.app/
Description: SkipCash payment gateway for WooCommerce.
Version: 2.3.1
Requires PHP: 7.4
Author: SkipCash
Author URI: https://skipcash.app/
License: GPLv2
License URI: https://www.gnu.org/licenses/gpl-2.0.txt
Text Domain: skipcash
WC requires at least: 5.6
WC tested up to: 6.5.2
*/

function skipcash_init_gateway_class()
{
        if (class_exists('WC_Gateway_Skipcash') || !class_exists('WC_Payment_Gateway')) {
                return;
        }
        class WC_Gateway_Skipcash extends WC_Payment_Gateway
        {

                /**
                 * Constructor for the gateway.
                 */
                public function __construct()
                {

                        $this->id = 'skipcash';
                        $this->has_fields = false;
                        $this->method_title = __('SkipCash payment gateway', 'skipcash');
                        /* translators: %s: Link to WC system status page */
                        $this->method_description = __('SkipCash payment gateway redirects customers to SkipCash to enter their payment information.', 'skipcash');

                        // Load the settings.
                        $this->init_form_fields();
                        $this->init_settings();

                        // Define user set variables.
                        $this->title = $this->get_option('title');
                        $this->description = $this->get_option('description');
                        $this->wc_button_description = $this->get_option('wc_button_description');
                        $this->button_text = $this->get_option('button_text');
                        $this->order_button_text = $this->get_option('wc_button_text');

                        $this->client_id = $this->get_option('client_id');
                        $this->key_id = $this->get_option('key_id');
                        $this->key_secret = $this->get_option('key_secret');
                        $this->same_window = 'yes' === $this->get_option('same_window', 'no');
                        $this->override_wc_button = 'yes' === $this->get_option('override_wc_button', 'yes');
                        $this->sandbox = 'yes' === $this->get_option('sandbox', 'no');
                        $this->sandbox_url = $this->get_option('sandbox_url');
                        $this->skipcash_url = 'https://api.skipcash.app/';

                        wp_enqueue_style('wc-skipcash-css', plugins_url('css/styles.css', __FILE__));
                        wp_enqueue_script('wc-skipcash-sdk-js', plugins_url('js/sdk.js', __FILE__)); // load as soon as possible

                        add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));

                        add_action('woocommerce_api_wc_gateway_skipcash_pay', array($this, 'pay'));
                        add_action('woocommerce_api_wc_gateway_skipcash_create_order', array($this, 'create_order'));

                        add_action('woocommerce_api_wc_gateway_skipcash_check', array($this, $this->same_window ? 'check' : 'check_popup'));

                        add_action('admin_enqueue_scripts', array($this, 'admin_script'));

                        if ($this->override_wc_button && !$this->same_window) {
                                add_action('woocommerce_review_order_after_submit', array($this, 'display_skipcash_button'));
                                add_action('wp_enqueue_scripts', array($this, 'payment_scripts'));
                        }
                }

                public function admin_script($hook)
                {
                        if (
                                $hook === 'woocommerce_page_wc-settings' && isset($_GET['tab']) && $_GET['tab'] === 'checkout'
                                && isset($_GET['section']) && $_GET['section'] === $this->id
                        ) {
                                wp_register_script('return-url-toggle', '');
                                wp_enqueue_script('return-url-toggle');
                                wp_add_inline_script(
                                        'return-url-toggle',
                                        "jQuery( function () { 
                                        var returnURLel = jQuery( '#return_url_info' );
                                        jQuery( '#woocommerce_skipcash_same_window' ).change( function() {
                                                if ( jQuery( this ).is( ':checked' ) ) {
                                                        returnURLel.show( 400 );
                                                } else {
                                                        returnURLel.hide( 400 );
                                                }
                                        } );
                                } );"
                                );
                        }
                }

                public function gen_uuid()
                {
                        return sprintf(
                                '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                                // 32 bits for "time_low"
                                mt_rand(0, 0xffff),
                                mt_rand(0, 0xffff),

                                // 16 bits for "time_mid"
                                mt_rand(0, 0xffff),

                                // 16 bits for "time_hi_and_version",
                                // four most significant bits holds version number 4
                                mt_rand(0, 0x0fff) | 0x4000,

                                // 16 bits, 8 bits for "clk_seq_hi_res",
                                // 8 bits for "clk_seq_low",
                                // two most significant bits holds zero and one for variant DCE1.1
                                mt_rand(0, 0x3fff) | 0x8000,

                                // 48 bits for "node"
                                mt_rand(0, 0xffff),
                                mt_rand(0, 0xffff),
                                mt_rand(0, 0xffff)
                        );
                }

                public function get_the_user_ip()
                {
                        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
                                $ip = $_SERVER['HTTP_CLIENT_IP'];
                        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                                $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
                        } else {
                                $ip = $_SERVER['REMOTE_ADDR'];
                        }

                        return $ip;
                }

                public function log($type, $message)
                {
                        $usr = $this->get_the_user_ip();
                        global $wpdb;
                        $table = $wpdb->prefix . 'skipcash_logs';
                        $data = array('log_type' => $type, 'log_message' => "[$usr] " . $message);
                        $format = array('%s', '%s');
                        $wpdb->insert($table, $data, $format);
                        return $wpdb->insert_id;
                }

                public function display_skipcash_button()
                {

                        $order_id = 'ORDER_ID';
                        // $order = new WC_Order( $order_id );
                        wp_enqueue_script('wc-skipcash-sdk-js', plugins_url('js/sdk.js', __FILE__));

                        $args = array(
                                'title' => $this->get_option('title'),
                                'description' => $this->get_option('description'),
                                'button_description' => $this->wc_button_description,
                                'key_id' => $this->get_option('key_id'),
                                'button_text' => $this->get_option('button_text'),
                                'sandbox' => $this->get_option('sandbox'),
                                'sandbox_url' => $this->get_option('sandbox_url'),
                                'client_id' => $this->client_id,
                                'success_redirect_url' => null,
                                'create_order_url' => add_query_arg(
                                        array(
                                                'wc-api' => 'wc_gateway_skipcash_create_order',
                                                'order_id' => $order_id
                                        ),
                                        home_url('/')
                                ),
                                'check_url' => add_query_arg(
                                        array(
                                                'wc-api' => 'wc_gateway_skipcash_check',
                                                'order_id' => $order_id
                                        ),
                                        home_url('/')
                                )
                        );
                        ?>
                        <?php if (!empty($this->wc_button_description)) { ?>
                                <p id="skipcash-button-description">
                                        <?php echo esc_html($this->wc_button_description); ?>
                                </p>
                        <?php } ?>
                        <div id="woo_skipcash_button"></div>
                        <div id="skipcash-message-box"></div>
                        <script>
                                window["skipcash"].sdk.defaults.sandBoxUrl = "<?php echo esc_url($args['sandbox_url']); ?>";
                                window["skipcash"].sdk.defaults.btnInnerHtml = "<?php echo esc_js($args['button_text']); ?>";
                                window["skipcash"].sdk.create({
                                        container: "woo_skipcash_button",
                                        clientId: <?php echo json_encode(esc_js($args['client_id'])); ?>,
                                        environment: <?php if ($args['sandbox']) {
                                                echo '"sandbox"';
                                        } else {
                                                echo '"production"';
                                        } ?>,
                                        checkUrl: "<?php echo $args['check_url']; ?>", // url is escaped already before
                                        beforeCreatePayment: function () {
                                                return new Promise((resolve, reject) => {
                                                        var checkout = getFormWithName('checkout');
                                                        <?php
                                                        $checkout_url = add_query_arg(
                                                                array(
                                                                        'wc-ajax' => 'checkout'
                                                                ),
                                                                home_url('/')
                                                        );
                                                        ?>
                                                        formSubmit('<?php echo esc_url($checkout_url); ?>', 'POST', checkout, function (
                                                                data) { //   /?wc-ajax=checkout
                                                                if (!data.order_id) {
                                                                        // no order ID, so submit again and display errors
                                                                        var checkout = jQuery('form.checkout'); // woocommerce thingy...
                                                                        checkout.submit();
                                                                        resolve([false, null]); // nothing to do
                                                                } else {
                                                                        window["skipcash"].sdk.defaults.successRedirectUrl = data.redirect;
                                                                        window["skipcash"].sdk.order_id = data.order_id;
                                                                        resolve([true, data]);
                                                                }
                                                        });

                                                });
                                        },
                                        onCreatePayment: function (data) {
                                                document.getElementById("skipcash-message-box").innerHTML = "Processing...";
                                                return new Promise((resolve, reject) => {
                                                        var req = new XMLHttpRequest();
                                                        req.onload = function () {
                                                                var response = JSON.parse(req.responseText);
                                                                if (req.status === 200 && response.resultObj && response.resultObj.id) {
                                                                        resolve(response.resultObj.id);
                                                                } else if (req.status === 200 && response.errorMessage) {
                                                                        reject(response.errorMessage);
                                                                } else {
                                                                        reject();
                                                                }
                                                        }

                                                        var clientId = <?php echo json_encode(esc_js($args['client_id'])); ?>;
                                                        var keyId = <?php echo json_encode(esc_js($args['key_id'])); ?>;

                                                        req.open("POST", "<?php echo esc_url($args['create_order_url']); ?>".replace('ORDER_ID',
                                                                data.order_id), true);
                                                        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                                                        req.send(JSON.stringify({
                                                                clientId: clientId,
                                                                keyId: keyId,
                                                                orderId: data.order_id
                                                        }));
                                                });
                                        },
                                        onSuccess: function () {
                                                document.getElementById("skipcash-message-box").innerHTML = "Payment was successful";
                                                setTimeout(() => {
                                                        window.location.replace(window["skipcash"].sdk.defaults.successRedirectUrl);
                                                }, 1000);
                                        },
                                        onCancel: function (message) {
                                                if (message) {
                                                        document.getElementById("skipcash-message-box").innerHTML = "Payment was cancelled: " + message;

                                                } else {
                                                        document.getElementById("skipcash-message-box").innerHTML = "Payment was cancelled";
                                                }
                                        },
                                        onError: function (message) {
                                                document.getElementById("skipcash-message-box").innerHTML = "Error message: " + message;
                                        },
                                        onFailure: function () {
                                                document.getElementById("skipcash-message-box").innerHTML = "Payment failed";
                                        },
                                });
                        </script>
                        <?php
                }

                public function payment_scripts()
                {
                        wp_enqueue_script('wc-skipcash-order-review', plugins_url('js/button.js', __FILE__), array('wc-skipcash-sdk-js'), false, true);
                }

                public function pay()
                {

                        wp_enqueue_script('wc-skipcash-sdk-js', plugins_url('js/sdk.js', __FILE__));

                        $order_id = sanitize_text_field($_GET['order_id']);
                        $order = new WC_Order($order_id);

                        load_template(
                                plugin_dir_path(__FILE__) . 'tmpls' . DIRECTORY_SEPARATOR . 'pay.php',
                                null,
                                array(
                                        'title' => $this->get_option('title'),
                                        'description' => $this->get_option('description'),
                                        'button_description' => $this->wc_button_description,
                                        'order' => $order,
                                        'key_id' => $this->get_option('key_id'),
                                        'sandbox' => $this->get_option('sandbox'),
                                        'sandbox_url' => $this->get_option('sandbox_url'),
                                        'button_text' => $this->get_option('button_text'),
                                        'client_id' => $this->client_id,
                                        'success_redirect_url' => $this->get_return_url($order),
                                        'create_order_url' => add_query_arg(
                                                array(
                                                        'wc-api' => 'wc_gateway_skipcash_create_order',
                                                        'order_id' => $order_id
                                                ),
                                                home_url('/')
                                        ),
                                        'check_url' => add_query_arg(
                                                array(
                                                        'wc-api' => 'wc_gateway_skipcash_check',
                                                        'order_id' => $order_id
                                                ),
                                                home_url('/')
                                        )
                                )
                        );
                        exit;
                }

                public function norm($str, $max)
                {
                        return mb_substr($str, 0, $max, 'UTF-8');
                }

                public function check()
                {

                        // _L( isset( WC()->session ) );
                        // _L( WC()->session->has_session() );
                        // _L( WC()->session );

                        if ($_GET['custom1'] == 'blocks') {

                                // Extract the data from the callback request.
                                $status = isset($_REQUEST['status']) ? sanitize_text_field($_REQUEST['status']) : '';
                                $order_id = isset($_REQUEST['transId']) ? absint($_REQUEST['transId']) : 0;

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

                        } else {

                                if (isset(WC()->session) && WC()->session->has_session() && !is_null(WC()->session->get('skipcash_oid'))) {

                                        // $order_id = WC()->session->get( 'order_awaiting_payment' );

                                        $order_id = WC()->session->get('skipcash_oid');
                                        $order = wc_get_order($order_id);
                                        $transaction_id = WC()->session->get('skipcash_tid');

                                        if (!empty($order) && !is_null($transaction_id) && isset($_GET['id']) && $transaction_id === $_GET['id']) {

                                                $url = !$this->sandbox ? $this->skipcash_url : $this->sandbox_url;

                                                $response = wp_remote_request(
                                                        $url . 'api/v1/payments/' . $transaction_id,
                                                        array(
                                                                'method' => 'GET',
                                                                'headers' => [
                                                                        'Accept' => 'application/json',
                                                                        'Content-Type' => 'application/json',
                                                                        'Authorization' => $this->client_id,
                                                                ]
                                                        )
                                                );

                                                $result_str = wp_remote_retrieve_body($response);
                                                $result = [];

                                                try {
                                                        $result = json_decode($result_str, true); // should always return json
                                                } catch (Exception $e) {
                                                        // pass
                                                }

                                                if (array_key_exists('resultObj', $result) && array_key_exists('statusId', $result['resultObj'])) {

                                                        $status_id = (int) $result['resultObj']['statusId'];

                                                        if ($status_id === 2) {

                                                                if ($order->has_status(wc_get_is_paid_statuses())) {
                                                                        $this->log(
                                                                                'check',
                                                                                "Payment is already complete order id $order_id, client id $this->client_id, transaction id $transaction_id"
                                                                        );
                                                                } else {
                                                                        $this->log(
                                                                                'check',
                                                                                "Payment success order id $order_id, client id $this->client_id, transaction id $transaction_id"
                                                                        );

                                                                        if (!$order->has_status(array('processing', 'completed'))) {

                                                                                $order->add_order_note(__('SkipCash payment completed', 'skipcash'));
                                                                                $order->payment_complete($transaction_id);

                                                                                if (isset(WC()->cart)) {
                                                                                        WC()->cart->empty_cart();
                                                                                }
                                                                        }
                                                                }

                                                                wp_redirect($this->get_return_url($order));
                                                                exit;

                                                        } else {
                                                                $status = strval($result['resultObj']['status']);
                                                                $this->log(
                                                                        'check',
                                                                        "Payment status $status status id $status_id order id $order_id, client id $this->client_id, transaction id $transaction_id"
                                                                );
                                                                $order->update_status('failed', sprintf(__('Payment %s via SkipCash.', 'skipcash'), $status));
                                                        }

                                                } else {
                                                        $this->log(
                                                                'check',
                                                                "Payment unknown response order id $order_id, client id $this->client_id, transaction id $transaction_id: $result_str"
                                                        );
                                                }

                                                wp_redirect($order->get_checkout_payment_url());
                                                exit;

                                        }
                                }

                                wp_die(__('SkipCash Request Failure', 'skipcash'));

                        }
                }

                public function check_popup()
                {

                        if (
                                !(array_key_exists('order_id', $_GET) && array_key_exists('client_id', $_GET)
                                        && array_key_exists('transaction_id', $_GET)) && !$this->same_window
                        ) {
                                echo '<!doctype html><html><body><script type="text/javascript">',
                                        'window.self.opener = window.self;window.self.close();</script></body></html>';
                                exit;
                        }

                        global $woocommerce;
                        $order_id = sanitize_text_field($_GET['order_id']);
                        $order = new WC_Order($order_id);
                        $client_id = sanitize_text_field($_GET['client_id']);
                        $transaction_id = sanitize_text_field($_GET['transaction_id']);

                        if (is_null($order) || empty($client_id) || empty($transaction_id)) {
                                $response = ['errorMessage' => 'Wrong request'];
                                echo json_encode($response);
                                exit;
                        }

                        if ($this->sandbox) {
                                $url = $this->sandbox_url;
                        } else {
                                $url = $this->skipcash_url;
                        }

                        $url = $url . 'api/v1/payments/' . $transaction_id;

                        $response = wp_remote_request(
                                $url,
                                array(
                                        'method' => 'GET',
                                        'headers' => [
                                                'Accept' => 'application/json',
                                                'Content-Type' => 'application/json',
                                                'Authorization' => $client_id
                                        ]
                                )
                        );
                        $result_str = wp_remote_retrieve_body($response);

                        $result = [];
                        try {
                                $result = json_decode($result_str, true); // should always return json
                        } catch (Exception $e) {
                                // pass
                        }

                        if (array_key_exists('resultObj', $result) && array_key_exists('statusId', $result['resultObj']) && $result['resultObj']['statusId'] === 2) {
                                $this->log('check', "Payment success order id $order_id, client id $client_id, transaction id $transaction_id");
                                $woocommerce->cart->empty_cart();
                                $order->payment_complete();
                        } else if (array_key_exists('resultObj', $result) && array_key_exists('statusId', $result['resultObj'])) {
                                $status = strval($result['resultObj']['statusId']);
                                $this->log('check', "Payment status $status order id $order_id, client id $client_id, transaction id $transaction_id");
                        } else {
                                $this->log('check', "Payment unknown response order id $order_id, client id $client_id, transaction id $transaction_id: $result_str");
                        }

                        $response = [];
                        try {
                                $response = [
                                        'errorMessage' => $result['errorMessage'],
                                        'returnCode' => $result['returnCode'],
                                        'resultObj' => [
                                                'statusId' => $result['resultObj']['statusId']
                                        ]
                                ]; // hide everything so that we won't expose information
                        } catch (Exception $e) {
                                $err = $e->getMessage();
                                $this->log('check', "Payment error order id $order_id, client id $client_id, transaction id $transaction_id: $err");
                                $response = ['errorMessage' => $err];
                        }

                        echo json_encode($response);
                        exit;

                }

                public function create_order()
                {

                        $body = json_decode(file_get_contents('php://input'), true);

                        $client_id = $body['clientId'];
                        $key_id = $body['keyId'];
                        $order_id = $body['orderId'];

                        if (empty($client_id) || empty($key_id) || empty($order_id)) {
                                $response = ['errorMessage' => 'Wrong request'];
                                echo json_encode($response);
                                exit;
                        }

                        echo json_encode($this->create_skipcash_order($order_id, $client_id, $key_id));
                        exit;
                }

                public function create_skipcash_order($order_id, $client_id, $key_id)
                {

                        $order = wc_get_order($order_id);

                        $amount = number_format((float) $order->get_total(), 2, '.', '');
                        $first_name = $this->norm($order->get_data()['billing']['first_name'], 59);
                        $last_name = $this->norm($order->get_data()['billing']['last_name'], 59);
                        $email = $this->norm($order->get_data()['billing']['email'], 255);

                        $data = [
                                'uid' => $this->gen_uuid(),
                                'keyId' => $key_id,
                                'amount' => $amount,
                                'firstName' => $first_name,
                                'lastName' => $last_name,
                        ];
                        $phone = $this->norm($order->get_data()['billing']['phone'], 15);
                        if (!empty($phone)) {
                                $data['phone'] = $phone;
                        }
                        $data['email'] = $email;
                        $street = $this->norm($order->get_data()['billing']['address_1'], 59);
                        if (!empty($street)) {
                                $data['street'] = $street;
                        }
                        $city = $this->norm($order->get_data()['billing']['city'], 31);
                        if (!empty($city)) {
                                $data['city'] = $city;
                        }
                        $state = $this->norm($order->get_data()['billing']['state'], 2);
                        if (!empty($state)) {
                                $data['state'] = $state;
                        }
                        $country = $this->norm($order->get_data()['billing']['country'], 2);
                        if (!empty($country)) {
                                $data['country'] = $country;
                        }
                        $postal_code = $this->norm($order->get_data()['billing']['postcode'], 10);
                        if (!empty($postal_code)) {
                                $data['postalCode'] = $postal_code;
                        }
                        $transaction_id = strval($order->get_id());
                        if (!empty($transaction_id)) {
                                $data['transactionId'] = $transaction_id;
                        }

                        $combined = [];
                        foreach ($data as $k => $v) {
                                $k[0] = strtoupper($k[0]);
                                $combined[] = "$k=$v";
                        }
                        $combined = implode(',', $combined);
                        $encrypted = hash_hmac('sha256', $combined, $this->key_secret, true);
                        $authorization = base64_encode($encrypted);

                        if ($this->sandbox) {
                                $url = $this->sandbox_url;
                        } else {
                                $url = $this->skipcash_url;
                        }
                        $url = $url . 'api/v1/payments';

                        $data_str = json_encode($data);

                        $response = wp_remote_request(
                                $url,
                                array(
                                        'method' => 'POST',
                                        'body' => $data_str,
                                        'headers' => [
                                                'Accept' => 'application/json',
                                                'Content-Type' => 'application/json',
                                                'Authorization' => $authorization
                                        ]
                                )
                        );
                        $result_str = wp_remote_retrieve_body($response);

                        $response = [];
                        try {
                                $result = json_decode($result_str, true);
                                $response = [
                                        'errorMessage' => $result['errorMessage'],
                                        'returnCode' => $result['returnCode'],
                                        'resultObj' => ['id' => $result['resultObj']['id']]
                                ]; // hide everything so that we won't expose information
                                $this->log('create_order', "Create order success, order id $transaction_id, client id $client_id, key id $key_id, response $result_str, data $data_str");
                        } catch (Exception $e) {
                                $err = $e->getMessage();
                                $this->log('create_order', "Create order error $err, order id $transaction_id, client id $client_id, key id $key_id, response $result_str, data $data_str");
                                $response = ['errorMessage' => $err];
                        }

                        return $response;
                }

                /**
                 * Initialise Gateway Settings Form Fields.
                 */
                public function init_form_fields()
                {
                        $this->form_fields = array(
                                'enabled' => array(
                                        'title' => __('Enable/Disable', 'skipcash'),
                                        'type' => 'checkbox',
                                        'label' => __('Enable SkipCash Payment', 'skipcash'),
                                        'default' => 'yes'
                                ),
                                'title' => array(
                                        'title' => __('Payment method title', 'skipcash'),
                                        'type' => 'text',
                                        'description' => __('This controls the title which the user sees during checkout.', 'skipcash'),
                                        'default' => __('Credit / Debit Cards', 'skipcash'),
                                        'desc_tip' => true,
                                ),
                                'description' => array(
                                        'title' => __('Payment method description', 'skipcash'),
                                        'type' => 'textarea',
                                        'default' => __('SkipCash is a payment app that offers a convenient and enjoyable experience throughout the payments journey for both consumers and merchants.', 'skipcash'),
                                ),
                                'client_id' => array(
                                        'title' => __('Client ID', 'skipcash'),
                                        'type' => 'text',
                                        'description' => __('Every Merchant has a public identifier called Client ID.', 'skipcash'),
                                        'default' => '',
                                        'desc_tip' => true,
                                ),
                                'key_id' => array(
                                        'title' => __('Key ID', 'skipcash'),
                                        'type' => 'text',
                                        'description' => __('The key ID is a public identifier of the private key. SkipCash uses it for the identification of the key and the Merchant.', 'skipcash'),
                                        'default' => '',
                                        'desc_tip' => true,
                                ),
                                'key_secret' => array(
                                        'title' => __('Secret', 'skipcash'),
                                        'type' => 'textarea',
                                        'description' => __('The key secret is used to calculate the signature.', 'skipcash'),
                                        'default' => '',
                                        'desc_tip' => true,
                                ),
                                'wc_button_text' => array(
                                        'title' => __('Woocommerce order button text', 'skipcash'),
                                        'type' => 'text',
                                        'description' => __('This controls the Woocommerce order button title which the user sees during checkout.', 'skipcash'),
                                        'default' => __('Proceed to Payment', 'skipcash'),
                                        'desc_tip' => true,
                                ),
                                'same_window' => array(
                                        'title' => __('Process payments in the same browser window or create popup window', 'skipcash'),
                                        'type' => 'checkbox',
                                        'label' => __('Stay in the same window', 'skipcash'),
                                        'default' => 'no',
                                ),
                                'return_url' => array(
                                        'id' => 'return_url_info',
                                        'title' => __('Return URL', 'skipcash'),
                                        'type' => 'info',
                                        'label' => __(
                                                'In order for SkipCash WooCommerce plugin to process payments in the same browser window, you have to set <strong>Return URL</strong> in your <strong>SkipCash Merchant Portal</strong> settings to: ',
                                                'skipcash'
                                        ) . '<br><code>' .
                                                add_query_arg(array('wc-api' => 'wc_gateway_skipcash_check'), home_url('/')) . '</code>',
                                        'hidden' => 'yes' !== $this->get_option('same_window', 'no'),
                                ),
                                'button_text' => array(
                                        'title' => __('SkipCash button text', 'skipcash'),
                                        'type' => 'text',
                                        'description' => __('This controls the order button title which the user sees during checkout.', 'skipcash'),
                                        'default' => __('Pay with', 'skipcash'),
                                        'desc_tip' => true,
                                ),
                                'wc_button_description' => array(
                                        'title' => __('SkipCash button description (empty to disable)', 'skipcash'),
                                        'type' => 'textarea',
                                        'default' => __('Please, click on the button below to pay with SkipCash.', 'skipcash'),
                                ),
                                'override_wc_button' => array(
                                        'title' => __('Override Woocommerce button with SkipCash button (experimental)', 'skipcash'),
                                        'type' => 'checkbox',
                                        'label' => __('Override Woocommerce button', 'skipcash'),
                                        'default' => 'yes'
                                ),
                                'sandbox' => array(
                                        'title' => __('Enable/Disable sandbox mode', 'skipcash'),
                                        'type' => 'checkbox',
                                        'label' => __('Enable Sandbox', 'skipcash'),
                                        'default' => 'no'
                                ),
                                'sandbox_url' => array(
                                        'title' => __('Sandbox URL', 'skipcash'),
                                        'type' => 'text',
                                        'description' => __('Sandbox backend url.', 'skipcash'),
                                        'default' => 'https://skipcashtest.azurewebsites.net/',
                                        'desc_tip' => true,
                                ),
                        );
                }

                /**
                 * Process the payment and return the result.
                 *
                 * @param  int $order_id Order ID.
                 * @return array
                 */
                public function process_payment($order_id)
                {

                        if ($this->same_window) {
                                $response = $this->create_skipcash_order($order_id, $this->client_id, $this->key_id);

                                if (
                                        array_key_exists('resultObj', $response) && array_key_exists('id', $response['resultObj'])
                                        && !empty($response['resultObj']['id']) && isset(WC()->session) && WC()->session->has_session()
                                ) {

                                        WC()->session->set('skipcash_oid', $order_id);
                                        WC()->session->set('skipcash_tid', $response['resultObj']['id']);

                                        $url = !$this->sandbox ? $this->skipcash_url : $this->sandbox_url;

                                        return array(
                                                'result' => 'success',
                                                'redirect' => $url . 'pay/' . $response['resultObj']['id'],
                                        );

                                } else {
                                        throw new Exception(__('SkipCash Request Failure', 'skipcash') . ': ' . $response['errorMessage']);
                                }
                        } else {
                                $order = new WC_Order($order_id);

                                if (!$this->override_wc_button) {
                                        $url = add_query_arg(
                                                array(
                                                        'wc-api' => 'wc_gateway_skipcash_pay',
                                                        'order_id' => $order_id
                                                ),
                                                home_url('/')
                                        );
                                } else {
                                        $url = $this->get_return_url($order);
                                }

                                // Return thankyou redirect
                                return array(
                                        'result' => 'success',
                                        'redirect' => $url
                                );
                        }

                }

                /**
                 * Generate Info HTML.
                 *
                 * @param string $key Field key.
                 * @param array  $data Field data.
                 * @since  1.0.0
                 * @return string
                 */
                public function generate_info_html($key, $data)
                {
                        $field_key = $this->get_field_key($key);
                        $defaults = array(
                                'title' => '',
                                'label' => '',
                                'disabled' => false,
                                'desc_tip' => false,
                                'description' => '',
                                'hidden' => false,
                        );

                        $data = wp_parse_args($data, $defaults);
                        $hidden = $data['hidden'] ? 'style="display:none"' : '';

                        ob_start();
                        ?>
                        <tr valign="top" id="<?php echo esc_attr($data['id']); ?>" <?php echo $hidden; ?>>
                                <th scope="row" class="titledesc">
                                        <label for="<?php echo esc_attr($field_key); ?>">
                                                <?php echo wp_kses_post($data['title']); ?>
                                                <?php echo $this->get_tooltip_html($data); // WPCS: XSS ok.       ?>
                                        </label>
                                </th>
                                <td class="forminp">
                                        <fieldset>
                                                <legend class="screen-reader-text"><span>
                                                                <?php echo wp_kses_post($data['title']); ?>
                                                        </span></legend>
                                                <p>
                                                        <?php echo wp_kses_post($data['label']); ?>
                                                </p>
                                                <?php echo $this->get_description_html($data); // WPCS: XSS ok.       ?>
                                        </fieldset>
                                </td>
                        </tr>
                        <?php

                        return ob_get_clean();
                }


        }

}

function skipcash_on_activate()
{
        global $wpdb;
        $create_table_query = "
                CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}skipcash_logs` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `log_type` VARCHAR(255) NOT NULL,
                        `log_message` text NOT NULL,
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        ) ENGINE=MyISAM DEFAULT CHARSET=utf8;
                        ";
        require_once (ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($create_table_query);
}

add_action('plugins_loaded', 'skipcash_init_gateway_class', 200);
add_action('woocommerce_init', 'skipcash_init_gateway_class');

function skipcash_add_gateway_class($methods)
{
        $methods[] = 'WC_Gateway_Skipcash';
        return $methods;
}

add_filter('woocommerce_payment_gateways', 'skipcash_add_gateway_class');

register_activation_hook(__FILE__, 'skipcash_on_activate');

add_filter('plugin_action_links', 'skipcash_action_links', 10, 4);
function skipcash_action_links($links, $file)
{
        if ($file == plugin_basename(__FILE__)) {
                //Settings link
                array_unshift($links, '<a href="' . network_admin_url('admin.php?page=wc-settings&tab=checkout&section=skipcash') .
                        '" title="' . esc_attr__('Settings', 'woocommerce') . '">' . esc_html__('Settings', 'woocommerce') . '</a>');
        }

        return $links;
}

add_action('before_woocommerce_init', function () {
        if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
                \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
        }
});

function skipcash_gateway_block_support()
{

        require_once __DIR__ . '/includes/class-wc-skipcash-gateway-blocks-support.php';

        add_action(
                'woocommerce_blocks_payment_method_type_registration',
                function (Automattic\WooCommerce\Blocks\Payments\PaymentMethodRegistry $payment_method_registry) {
                        $payment_method_registry->register(new WC_Gateway_Skipcash_Blocks_Support);
                }
        );

}
add_action('woocommerce_blocks_loaded', 'skipcash_gateway_block_support');