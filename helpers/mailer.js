import User from '@/models/userModel';
import nodemailer from 'nodemailer'
import bcryptjs from 'bcryptjs'

export const sendEmail = async ({ email, emailType, userId }) => {

    try {

        const hashedToken = await bcryptjs.hash(userId.toString(), 10)


        if (emailType === "VERIFY") {

            await User.findByIdAndUpdate(userId,
                { verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000 }
            )

        } else if (emailType === "RESET") {

            await User.findByIdAndUpdate(userId,
                { forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000 }
            )

        }





        const transporter = nodemailer.createTransport({
            host: process.env.NODEMAILER_HOST,
            port: 587,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });


        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL_FROM,
            to: email,
            subject: emailType === 'VERIFY' ? "Verify your email" : "Reset your password",
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}
            or copy and paste the link below in your browser
            <br/>
            ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
            </p>`,

        }

        const mailResponse = await transporter.sendMail(mailOptions)
        return mailResponse


    }

    catch (error) {

        throw new Error(error.message)


    }



}