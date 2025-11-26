# Email Setup Guide

## Gmail SMTP Configuration

The error `535-5.7.8 Username and Password not accepted` means Gmail is rejecting your credentials.

### Solution: Use Gmail App Password

Gmail requires an **App Password** (not your regular password) when using SMTP.

### Steps to Fix:

1. **Enable 2-Step Verification** (if not already enabled):
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other (Custom name)" as the device
   - Enter a name like "Eczema Care App"
   - Click "Generate"
   - Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

3. **Update .env file**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=465
   EMAIL_USER=kraffay96@gmail.com
   EMAIL_PASS=your-16-character-app-password-here
   ```
   - Remove spaces from the app password when adding to .env
   - Example: If Google gives you `abcd efgh ijkl mnop`, use `abcdefghijklmnop`

4. **Restart the backend server**:
   ```bash
   npm run dev
   ```

### Alternative: Use OAuth2 (More Secure)

For production, consider using OAuth2 instead of App Passwords. This requires additional setup but is more secure.

### Testing

After updating the credentials, test by creating a consultation booking. You should see:
- ✅ Email sent successfully: [message-id]
- No authentication errors

### Troubleshooting

If you still get errors:
1. Make sure 2-Step Verification is enabled
2. Verify you're using the App Password (16 characters, no spaces)
3. Check that the email address in EMAIL_USER matches the account where you generated the App Password
4. Try regenerating the App Password if it still doesn't work

