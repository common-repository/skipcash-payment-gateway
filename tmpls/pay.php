<?php
get_header();
?>
<style>
#skipCashPayment>* {
    margin-bottom: 15px;
}
</style>
<div id="skipCashPayment" style="margin: 0 auto; max-width: 500px">
    <p><?php echo esc_html($args['button_description']); ?></p>
    <div id="woo_skipcash_button"></div>
    <div id="skipcash-message-box"></div>
</div>
<script>
window["skipcash"].sdk.defaults.sandBoxUrl = "<?php echo esc_url($args['sandbox_url']); ?>";
window["skipcash"].sdk.defaults.btnInnerHtml = "<?php echo esc_js($args['button_text']); ?>";
window["skipcash"].sdk.create({
    container: "woo_skipcash_button",
    clientId: <?php echo json_encode($args['client_id']); ?>,
    environment: <?php if ($args['sandbox']) { echo '"sandbox"'; } else { echo '"production"'; } ?>,
    checkUrl: "<?php echo $args['check_url']; ?>", // url already escaped
    beforeCreatePayment: function() {
        return new Promise((resolve, reject) => {
            resolve([true, null]); // proceed
        });
    },

    onCreatePayment: function() {
        document.getElementById("skipcash-message-box").innerHTML = "Processing...";
        return new Promise((resolve, reject) => {
            var req = new XMLHttpRequest();
            req.onload = function() {
                var response = JSON.parse(req.responseText);
                if (req.status === 200) {
                    resolve(response.resultObj.id);
                } else {
                    reject();
                }
            }

            var orderId = <?php echo json_encode(esc_js($args['order']->get_data()['id'])); ?>;
            var clientId = <?php echo json_encode(esc_js($args['client_id'])); ?>;
            var keyId = <?php echo json_encode(esc_js($args['key_id'])); ?>;

            req.open("POST", "<?php echo esc_url($args['create_order_url']); ?>", true);
            req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            req.send(JSON.stringify({
                clientId: clientId,
                keyId: keyId,
                orderId: orderId
            }));
        });
    },
    onSuccess: function() {
        document.getElementById("skipcash-message-box").innerHTML = "Payment was successful";
        setTimeout(() => {
            window.location.replace("<?php echo esc_url($args['success_redirect_url']); ?>");
        }, 1000);
    },
    onCancel: function(message) {
        if (message) {
            document.getElementById("skipcash-message-box").innerHTML = "Payment was cancelled: " + message;

        } else {
            document.getElementById("skipcash-message-box").innerHTML = "Payment was cancelled";
        }
    },
    onError: function(message) {
        document.getElementById("skipcash-message-box").innerHTML = "Error message: " + message;
    },
    onFailure: function() {
        document.getElementById("skipcash-message-box").innerHTML = "Payment failed";
    },
});
</script>
<?php
get_footer();