import nodemailer from 'nodemailer'

export async function sendAdminNotification(booking) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.yourmail.com',
    port: 587,
    auth: {
      user: 'fixandfresh@yourdomain.com',
      pass: 'YOUR_PASSWORD'
    }
  })

  await transporter.sendMail({
    from: '"Fix & Fresh" <fixandfresh@yourdomain.com>',
    to: 'admin@fixandfresh.com',
    subject: 'New Booking Received',
    text: `New booking from user ${booking.user_id} for service ${booking.service_id}`
  })
}
