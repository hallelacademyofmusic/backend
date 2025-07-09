# Email Notification Setup Guide

This guide will help you set up email notifications for class bookings using Gmail SMTP.

## Features Implemented

1. **New Booking Notification**: When a new class booking is created, the instructor receives an email with booking details and a link to review/confirm the booking.

2. **Confirmation Notifications**: When a booking status changes from "Pending" to "Confirmed":
   - Student receives an email with booking details and Google Calendar integration
   - Instructor receives a confirmation email with booking details

## Setup Instructions

### 1. Gmail App Password Setup

To use Gmail SMTP, you need to create an App Password:

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security" → "2-Step Verification" (enable if not already enabled)
3. Go to "App passwords" (under 2-Step Verification)
4. Select "Mail" and "Other (Custom name)"
5. Enter a name like "Strapi Backend"
6. Copy the generated 16-character password

### 2. Environment Variables

Create or update your `.env` file in the root directory:

```env
# Email Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
ADMIN_URL=http://localhost:1337/admin

# Other existing variables...
```

### 3. Install Dependencies

The required packages have been added to `package.json`:
- `@strapi/provider-email-nodemailer`: For sending emails via Gmail SMTP

Run the installation:
```bash
npm install
```

### 4. Configuration Files

The following files have been updated/created:

#### `config/plugins.js`
- Configured email plugin with Gmail SMTP settings

#### `src/api/class-booking/content-types/class-booking/lifecycles.js`
- Added lifecycle hooks for email notifications
- Handles both creation and status change events

## How It Works

### When a New Booking is Created:
1. Instructor receives an email with:
   - All booking details (title, time, location, etc.)
   - Direct link to the Strapi admin panel to review the booking
   - Clear call-to-action to confirm the booking

### When Booking Status Changes to "Confirmed":
1. **Student receives an email with:**
   - Confirmed booking details
   - Google Calendar link (pre-filled with event details)
   - Instructor information

2. **Instructor receives an email with:**
   - Confirmed booking details
   - Student information
   - Reminder to be available for the session

## Email Templates

The emails include:
- Professional HTML formatting
- All relevant booking information
- Clear call-to-action buttons
- Google Calendar integration
- Responsive design

## Testing

To test the email functionality:

1. Start your Strapi server:
   ```bash
   npm run develop
   ```

2. Create a new class booking through the API or admin panel

3. Check that the instructor receives the notification email

4. Change the booking status from "Pending" to "Confirmed"

5. Verify that both student and instructor receive confirmation emails

## Troubleshooting

### Common Issues:

1. **"Authentication failed" error:**
   - Ensure you're using an App Password, not your regular Gmail password
   - Verify 2-Step Verification is enabled on your Google account

2. **"Connection timeout" error:**
   - Check your internet connection
   - Verify Gmail SMTP settings are correct

3. **Emails not sending:**
   - Check the Strapi console for error messages
   - Verify environment variables are set correctly
   - Ensure instructor and student have valid email addresses

4. **"Undefined binding(s) detected" error:**
   - This was fixed by properly fetching related data in the lifecycle hooks
   - The current implementation should work correctly

### Debug Mode:

To see detailed email logs, you can add this to your `config/plugins.js`:

```javascript
module.exports = () => ({
  email: {
    config: {
      provider: '@strapi/provider-email-nodemailer',
      providerOptions: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        secure: false,
        debug: true, // Add this line for debugging
        logger: true, // Add this line for logging
      },
      settings: {
        defaultFrom: process.env.GMAIL_USER,
        defaultReplyTo: process.env.GMAIL_USER,
      },
    },
  },
});
```

## Security Notes

- Never commit your `.env` file to version control
- Use App Passwords instead of your main Gmail password
- Consider using environment-specific email configurations for production

## Customization

You can customize the email templates by editing the HTML content in the lifecycle hooks file:
`src/api/class-booking/content-types/class-booking/lifecycles.js`

The templates include:
- Booking details formatting
- Google Calendar integration
- Styling and branding
- Call-to-action buttons

## Recent Fixes

- Fixed email plugin configuration for Strapi v5
- Resolved database query issues in lifecycle hooks
- Simplified calendar integration to use Google Calendar links
- Improved error handling and data fetching
- **Fixed booking confirmation links to use UID instead of numeric ID** - The admin panel URLs now use the correct UID format (e.g., `ixt9x689x3x5tvfam0uh6p5j`) instead of numeric IDs 