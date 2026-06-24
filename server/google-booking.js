const { google } = require('googleapis');
const { Resend } = require('resend');
const { sendBookingEmailViaSmtp, isSmtpConfigured, buildBookingEmailContent } = require('./smtp-mail');

function requireEnv(name) {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
}

function isGoogleConfigured() {
    return Boolean(
        process.env.GOOGLE_CLIENT_ID
        && process.env.GOOGLE_CLIENT_SECRET
        && process.env.GOOGLE_REFRESH_TOKEN
    );
}

function getOAuth2Client() {
    const oauth2Client = new google.auth.OAuth2(
        requireEnv('GOOGLE_CLIENT_ID'),
        requireEnv('GOOGLE_CLIENT_SECRET')
    );
    oauth2Client.setCredentials({
        refresh_token: requireEnv('GOOGLE_REFRESH_TOKEN')
    });
    return oauth2Client;
}

function parseDurationMinutes(raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
    return 90;
}

function buildEventTimes({ date, time, timezone, durationMinutes }) {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
        throw new Error('Invalid date or time');
    }

    const pad = (n) => String(n).padStart(2, '0');
    const dateKey = `${year}-${pad(month)}-${pad(day)}`;
    const startTotal = hour * 60 + minute;
    let endTotal = startTotal + durationMinutes;
    let endDateKey = dateKey;

    if (endTotal >= 24 * 60) {
        endTotal -= 24 * 60;
        const nextDay = new Date(year, month - 1, day + 1);
        endDateKey = `${nextDay.getFullYear()}-${pad(nextDay.getMonth() + 1)}-${pad(nextDay.getDate())}`;
    }

    const endHour = Math.floor(endTotal / 60);
    const endMinute = endTotal % 60;

    return {
        start: { dateTime: `${dateKey}T${pad(hour)}:${pad(minute)}:00`, timeZone: timezone },
        end: { dateTime: `${endDateKey}T${pad(endHour)}:${pad(endMinute)}:00`, timeZone: timezone }
    };
}

function extractMeetLink(event) {
    return event.hangoutLink
        || event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === 'video')?.uri
        || null;
}

async function createCalendarEventWithMeet(booking) {
    const auth = getOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth });
    const { start, end } = buildEventTimes(booking);
    const requestId = `hp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const isZh = booking.locale !== 'en';
    const description = isZh
        ? `Host Pocket 體驗預定\n\n主持人：${booking.hostName}\n地點：${booking.location}\n\n此活動包含 Google Meet 視訊連結，請準時加入。`
        : `Host Pocket experience booking\n\nHost: ${booking.hostName}\nLocation: ${booking.location}\n\nThis event includes a Google Meet link. Please join on time.`;

    const event = {
        summary: booking.title,
        description,
        location: booking.location,
        start,
        end,
        attendees: [{ email: booking.guestEmail }],
        conferenceData: {
            createRequest: {
                requestId,
                conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 30 }
            ]
        }
    };

    const response = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        conferenceDataVersion: 1,
        sendUpdates: 'all',
        requestBody: event
    });

    const meetLink = extractMeetLink(response.data);
    if (!meetLink) {
        throw new Error('Google Calendar did not return a Meet link');
    }

    return {
        meetLink,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink
    };
}

async function sendBookingEmailViaResend(booking, meetLink, htmlLink) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    if (!apiKey || !fromEmail) return { sent: false, reason: 'resend_not_configured' };

    const resend = new Resend(apiKey);
    const { subject, html } = buildBookingEmailContent(booking, meetLink, htmlLink);

    await resend.emails.send({
        from: fromEmail,
        to: booking.guestEmail,
        subject,
        html
    });

    return { sent: true };
}

async function createBooking(bookingInput) {
    const booking = {
        guestEmail: String(bookingInput.guestEmail || '').trim().toLowerCase(),
        title: String(bookingInput.title || 'Host Pocket Experience').trim(),
        hostName: String(bookingInput.hostName || 'Host').trim(),
        location: String(bookingInput.location || '').trim(),
        date: String(bookingInput.date || '').trim(),
        time: String(bookingInput.time || '').trim(),
        timezone: String(bookingInput.timezone || 'Asia/Taipei').trim(),
        durationMinutes: parseDurationMinutes(bookingInput.durationMinutes),
        locale: bookingInput.locale === 'en' ? 'en' : 'zh',
        dateLabel: bookingInput.dateLabel || '',
        timeLabel: bookingInput.timeLabel || ''
    };

    if (!booking.guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.guestEmail)) {
        throw new Error('Invalid guest email');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) {
        throw new Error('Invalid date format (expected YYYY-MM-DD)');
    }
    if (!/^\d{1,2}:\d{2}$/.test(booking.time)) {
        throw new Error('Invalid time format (expected HH:MM)');
    }

    const googleReady = isGoogleConfigured();
    const emailReady = Boolean(
        (process.env.RESEND_API_KEY && process.env.FROM_EMAIL)
        || isSmtpConfigured()
    );

    if (!googleReady && !emailReady) {
        throw new Error('Email not configured: set Google OAuth or SMTP (SMTP_USER + SMTP_APP_PASSWORD)');
    }

    let calendarResult = null;
    if (googleReady) {
        calendarResult = await createCalendarEventWithMeet(booking);
    }

    const meetLink = calendarResult?.meetLink || null;
    const htmlLink = calendarResult?.htmlLink || null;

    const resendResult = await sendBookingEmailViaResend(booking, meetLink, htmlLink);
    const smtpResult = resendResult.sent
        ? { sent: false }
        : await sendBookingEmailViaSmtp(booking, meetLink, htmlLink);

    const customEmailSent = resendResult.sent === true || smtpResult.sent === true;

    return {
        ok: true,
        meetLink,
        eventId: calendarResult?.eventId || null,
        htmlLink,
        calendarInviteSent: googleReady,
        customEmailSent
    };
}

module.exports = { createBooking, isGoogleConfigured };
