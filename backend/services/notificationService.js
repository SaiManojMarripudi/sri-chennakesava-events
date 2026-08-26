const { pool } = require('../config/db');

const {
    sendMessage
} = require('./notificationProvider');

// ==========================================
// CREATE NOTIFICATION RECORD
// ==========================================

async function createNotification({
    customerId,
    enquiryId = null,
    orderId = null,
    notificationType,
    channel,
    recipient,
    message
}) {

    if (
        !customerId ||
        !notificationType ||
        !channel ||
        !recipient ||
        !message
    ) {

        throw new Error(
            'Required notification data is missing.'
        );

    }


    const allowedChannels = [
        'WHATSAPP',
        'SMS'
    ];


    if (
        !allowedChannels.includes(
            channel
        )
    ) {

        throw new Error(
            `Unsupported notification channel: ${channel}`
        );

    }


    const [
        result
    ] = await pool.execute(
        `
        INSERT INTO customer_notifications
        (
            customer_id,
            enquiry_id,
            order_id,
            notification_type,
            channel,
            recipient,
            message,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
        `,
        [
            customerId,
            enquiryId,
            orderId,
            notificationType,
            channel,
            recipient,
            message
        ]
    );


    return {
        notificationId:
            result.insertId,

        status:
            'PENDING'
    };

}


// ==========================================
// MARK NOTIFICATION AS SENT
// ==========================================

async function markNotificationSent({
    notificationId,
    providerMessageId = null
}) {

    if (!notificationId) {

        throw new Error(
            'Notification ID is required.'
        );

    }


    await pool.execute(
        `
        UPDATE customer_notifications

        SET
            status = 'SENT',
            provider_message_id = ?,
            sent_at = CURRENT_TIMESTAMP

        WHERE notification_id = ?
        `,
        [
            providerMessageId,
            notificationId
        ]
    );

}


// ==========================================
// MARK NOTIFICATION AS DELIVERED
// ==========================================

async function markNotificationDelivered(
    notificationId
) {

    if (!notificationId) {

        throw new Error(
            'Notification ID is required.'
        );

    }


    await pool.execute(
        `
        UPDATE customer_notifications

        SET
            status = 'DELIVERED',
            delivered_at = CURRENT_TIMESTAMP

        WHERE notification_id = ?
        `,
        [
            notificationId
        ]
    );

}

// ==========================================
// MARK NOTIFICATION AS FAILED
// ==========================================

async function markNotificationFailed({
    notificationId,
    errorMessage
}) {

    if (!notificationId) {

        throw new Error(
            'Notification ID is required.'
        );

    }


    await pool.execute(
        `
        UPDATE customer_notifications

        SET
            status = 'FAILED',
            error_message = ?,
            failed_at = CURRENT_TIMESTAMP

        WHERE notification_id = ?
        `,
        [
            errorMessage ||
                'Unknown error.',
            notificationId
        ]
    );

}

// ==========================================
// SEND CUSTOMER NOTIFICATION
// ==========================================

async function sendCustomerNotification({

    customerId,

    enquiryId = null,

    orderId = null,

    notificationType,

    recipient,

    message

}) {

    if (
        !customerId ||
        !notificationType ||
        !recipient ||
        !message
    ) {

        throw new Error(
            'Required customer notification data is missing.'
        );

    }


    // ======================================
    // PREFERRED CHANNEL
    // ======================================

    const channel =
        'WHATSAPP';


    // ======================================
    // CREATE PENDING RECORD
    // ======================================

    const notification =
        await createNotification({

            customerId,

            enquiryId,

            orderId,

            notificationType,

            channel,

            recipient,

            message

        });


    try {

        // ==================================
        // DEVELOPMENT PROVIDER
        // ==================================

        const providerResult =
            await sendMessage({

                channel,

                recipient,

                message

            });


        if (
            !providerResult ||
            !providerResult.success
        ) {

            throw new Error(
                'Notification provider failed.'
            );

        }


        // ==================================
        // MARK AS SENT
        // ==================================

        await markNotificationSent({

            notificationId:
                notification.notificationId,

            providerMessageId:
                providerResult.providerMessageId ||
                null

        });


        // ==================================
        // DEVELOPMENT MODE
        // ASSUME DELIVERY SUCCESS
        // ==================================

        await markNotificationDelivered(
            notification.notificationId
        );


        return {

            notificationId:
                notification.notificationId,

            channel,

            status:
                'DELIVERED'

        };

    } catch (error) {

        await markNotificationFailed({

            notificationId:
                notification.notificationId,

            errorMessage:
                error.message

        });


        console.error(
            'Customer notification failed:',
            error
        );


        return {

            notificationId:
                notification.notificationId,

            channel,

            status:
                'FAILED'

        };

    }

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    createNotification,

    sendCustomerNotification,

    markNotificationSent,

    markNotificationDelivered,

    markNotificationFailed

};