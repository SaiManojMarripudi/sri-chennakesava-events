const {
    google
} = require('googleapis');

const {
    getAuthenticatedOAuthClient
} = require('./googleOAuthService');

// ==========================================
// CONFIGURATION
// ==========================================

const NOTIFICATION_EMAIL =
    process.env.GMAIL_NOTIFICATION_EMAIL ||
    'srichennakesavaevents@gmail.com';


// ==========================================
// FORMAT EMAIL VALUE
// ==========================================

function formatValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return 'Not provided';
    }

    return String(value);
}


// ==========================================
// CREATE RAW GMAIL MESSAGE
// ==========================================

function createRawMessage({
    to,
    subject,
    text,
    replyTo
}) {

    const headers = [
        `From: ${NOTIFICATION_EMAIL}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset="UTF-8"',
        'Content-Transfer-Encoding: 8bit'
    ];

    if (replyTo) {
        headers.push(
            `Reply-To: ${replyTo}`
        );
    }

    const message =
        headers.join('\r\n') +
        '\r\n\r\n' +
        text;

    return Buffer
        .from(message, 'utf8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}


// ==========================================
// SEND NEW ENQUIRY EMAIL
// ==========================================

async function sendNewEnquiryEmail({
    enquiry_id,
    full_name,
    phone,
    email,
    event_type,
    event_date,
    guest_count,
    budget,
    event_location,
    message
}) {

    // ======================================
    // GET AUTHENTICATED GOOGLE CLIENT
    // ======================================

    const auth =
        getAuthenticatedOAuthClient();

    if (!auth) {

        throw new Error(
            'Google account is not authorized.'
        );

    }


    // ======================================
    // CREATE GMAIL CLIENT
    // ======================================

    const gmail =
        google.gmail({
            version: 'v1',
            auth
        });


    // ======================================
    // EMAIL SUBJECT
    // ======================================

    const subject =
        '\uD83D\uDD14 New Enquiry - SRI CHENNAKESAVA EVENTS';


    // ======================================
    // EMAIL BODY
    // ======================================

    const emailBody = [

        'A new enquiry has been received through the SRI CHENNAKESAVA EVENTS website.',
        '',
        '==========================================',
        'NEW CLIENT ENQUIRY',
        '==========================================',
        '',
        `Enquiry ID      : ${formatValue(enquiry_id)}`,
        `Client Name     : ${formatValue(full_name)}`,
        `Phone           : ${formatValue(phone)}`,
        `Email           : ${formatValue(email)}`,
        `Event Type      : ${formatValue(event_type)}`,
        `Event Date      : ${formatValue(event_date)}`,
        `Guest Count     : ${formatValue(guest_count)}`,
        `Budget          : ${formatValue(budget)}`,
        `Event Location  : ${formatValue(event_location)}`,
        '',
        'Message:',
        formatValue(message),
        '',
        '==========================================',
        'SRI CHENNAKESAVA EVENTS',
        'Making Your Moments Memorable',
        '=========================================='

    ].join('\n');


    // ======================================
    // REPLY-TO
    // ======================================

    let replyTo = null;

    if (
        email &&
        typeof email === 'string' &&
        email.includes('@') &&
        !email.includes('\r') &&
        !email.includes('\n')
    ) {
        replyTo = email.trim();
    }


    // ======================================
    // CREATE RAW MESSAGE
    // ======================================

    const raw =
        createRawMessage({
            to: NOTIFICATION_EMAIL,
            subject,
            text: emailBody,
            replyTo
        });


    // ======================================
    // SEND EMAIL
    // ======================================

    const response =
        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw
            }
        });


    console.log(
        'New enquiry email sent successfully.',
        response.data.id
    );


    return {
        success: true,
        messageId: response.data.id
    };
}


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    sendNewEnquiryEmail
};