// ==========================================
// DEVELOPMENT NOTIFICATION PROVIDER
// ==========================================

async function sendMessage({
    channel,
    recipient,
    message
}) {

    console.log('');
    console.log('==========================================');
    console.log('CUSTOMER NOTIFICATION — DEVELOPMENT MODE');
    console.log('==========================================');
    console.log(`Channel   : ${channel}`);
    console.log(`Recipient : ${recipient}`);
    console.log('------------------------------------------');
    console.log(message);
    console.log('==========================================');
    console.log('');


    return {

        success: true,

        providerMessageId:
            `DEV-${Date.now()}`

    };

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    sendMessage
};