import dotenv from 'dotenv'
dotenv.config()
import nodemailer from 'nodemailer'

console.log('📧 Configuración SMTP:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER
})

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),  // 👈 asegurate que sea number
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"SkillTrade" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    })
    console.log('📧 Email enviado:', info.messageId)
  } catch (err) {
    console.error('❌ Error enviando email:', err)
  }
}
