// ==========================================
// CUSTOMER NOTIFICATION TEMPLATES
// ==========================================


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(value) {

    if (!value) {
        return '—';
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleDateString(
        'en-IN',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }
    );

}


// ==========================================
// ENQUIRY RECEIVED
// ==========================================

function enquiryReceivedMessage(
    enquiry
) {

    return `SRI CHENNAKESAVA EVENTS

Thank you for contacting us for your event.

Your enquiry has been received successfully.
Our team will contact you very soon.

ENQUIRY DETAILS

Enquiry ID: #${enquiry.enquiry_id}
Name: ${enquiry.full_name}
Phone: ${enquiry.phone}
Email: ${enquiry.email || '—'}
Event: ${enquiry.event_type}
Event Date: ${formatDate(enquiry.event_date)}
Guests: ${enquiry.guest_count || '—'}
Budget: ${enquiry.budget || '—'}
Location: ${enquiry.event_location || '—'}

Thank you for choosing
SRI CHENNAKESAVA EVENTS.

Creating Moments. Celebrating Memories.`;

}


// ==========================================
// ENQUIRY ACCEPTED
// ==========================================

function enquiryAcceptedMessage(
    enquiry
) {

    return `SRI CHENNAKESAVA EVENTS

Great news! Your enquiry has been accepted. 🎉

Enquiry ID: #${enquiry.enquiry_id}

Event: ${enquiry.event_type}
Event Date: ${formatDate(enquiry.event_date)}

Our team will contact you shortly regarding the next steps.

Thank you for choosing SRI CHENNAKESAVA EVENTS.`;

}


// ==========================================
// ENQUIRY REJECTED
// ==========================================

function enquiryRejectedMessage(
    enquiry
) {

    return `SRI CHENNAKESAVA EVENTS

We regret to inform you that your enquiry could not be accepted at this time.

Enquiry ID: #${enquiry.enquiry_id}

Event: ${enquiry.event_type}
Event Date: ${formatDate(enquiry.event_date)}

Thank you for considering SRI CHENNAKESAVA EVENTS.

We appreciate your interest and hope to serve you on another occasion.`;

}


// ==========================================
// ORDER CONFIRMED
// ==========================================

function orderConfirmedMessage(
    order
) {

    return `SRI CHENNAKESAVA EVENTS

Your event booking has been confirmed. 🎉

BOOKING DETAILS

Booking Number: ${order.booking_number || '—'}
Event: ${order.event_type}
Event Date: ${formatDate(order.event_date)}
Location: ${order.event_location || '—'}
Total Amount: ₹${order.total_amount ?? '—'}

Thank you for choosing SRI CHENNAKESAVA EVENTS.

We look forward to making your celebration memorable.`;

}


// ==========================================
// ORDER UPCOMING
// ==========================================

function orderUpcomingMessage(
    order
) {

    return `SRI CHENNAKESAVA EVENTS

Your event booking is now marked as Upcoming.

BOOKING DETAILS

Booking Number: ${order.booking_number || '—'}
Event: ${order.event_type}
Event Date: ${formatDate(order.event_date)}
Location: ${order.event_location || '—'}

We are preparing to make your celebration special.

Thank you for choosing SRI CHENNAKESAVA EVENTS.`;

}


// ==========================================
// ORDER CANCELLED
// ==========================================

function orderCancelledMessage(
    order
) {

    return `SRI CHENNAKESAVA EVENTS

Your booking has been cancelled.

BOOKING DETAILS

Booking Number: ${order.booking_number || '—'}
Event: ${order.event_type}
Event Date: ${formatDate(order.event_date)}

Please contact our team if you need any further assistance.

Thank you for considering SRI CHENNAKESAVA EVENTS.`;

}


// ==========================================
// ORDER COMPLETED
// ==========================================

function orderCompletedMessage(
    order
) {

    return `SRI CHENNAKESAVA EVENTS

Your event booking has been completed successfully. 🎉

BOOKING DETAILS

Booking Number: ${order.booking_number || '—'}
Event: ${order.event_type}
Event Date: ${formatDate(order.event_date)}

Thank you for choosing SRI CHENNAKESAVA EVENTS.

We hope you enjoyed your celebration and look forward to serving you again.`;

}


// ==========================================
// BOOKING DETAILS CONFIRMED
// ==========================================

function bookingDetailsConfirmedMessage(
    order
) {

    return `SRI CHENNAKESAVA EVENTS

Your booking details have been confirmed successfully.

BOOKING DETAILS

Booking Number: ${order.booking_number || '—'}
Event: ${order.event_type}
Event Date: ${formatDate(order.event_date)}
Guests: ${order.guest_count || '—'}
Location: ${order.event_location || '—'}
Total Amount: ₹${order.total_amount ?? '—'}

Our team will continue with the next steps for your event.

Thank you for choosing SRI CHENNAKESAVA EVENTS.`;

}


// ==========================================
// BOOKING NUMBER GENERATED
// ==========================================

function bookingNumberGeneratedMessage(
    order
) {

    return `SRI CHENNAKESAVA EVENTS

Your official booking number has been generated successfully.

BOOKING DETAILS

Booking Number: ${order.booking_number}
Event: ${order.event_type}
Event Date: ${formatDate(order.event_date)}

Please keep this booking number for future communication.

Thank you for choosing SRI CHENNAKESAVA EVENTS.`;

}


// ==========================================
// AGREEMENT SIGNED
// ==========================================

function agreementSignedMessage(
    order
) {

    return `SRI CHENNAKESAVA EVENTS

Your booking agreement has been marked as signed successfully.

BOOKING DETAILS

Booking Number: ${order.booking_number || '—'}
Event: ${order.event_type}
Event Date: ${formatDate(order.event_date)}

Your booking is progressing successfully.

Thank you for choosing SRI CHENNAKESAVA EVENTS.`;

}


// ==========================================
// PAYMENT RECEIVED
// ==========================================

function paymentReceivedMessage(
    order
) {

    return `SRI CHENNAKESAVA EVENTS

We have received your payment successfully. ✅

PAYMENT DETAILS

Booking Number: ${order.booking_number || '—'}
Event: ${order.event_type}

Payment Amount: ₹${order.payment_amount ?? '—'}
Payment Type: ${order.payment_type || '—'}
Payment Method: ${order.payment_method || '—'}

Total Booking Amount: ₹${order.total_amount ?? '—'}
Total Paid: ₹${order.total_paid ?? '—'}
Balance: ₹${order.balance ?? '—'}

Payment Status: ${order.payment_status || '—'}

Thank you for choosing SRI CHENNAKESAVA EVENTS.`;

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    enquiryReceivedMessage,

    enquiryAcceptedMessage,

    enquiryRejectedMessage,

    orderConfirmedMessage,

    orderUpcomingMessage,

    orderCancelledMessage,

    orderCompletedMessage,

    bookingDetailsConfirmedMessage,

    bookingNumberGeneratedMessage,

    agreementSignedMessage,

    paymentReceivedMessage

};