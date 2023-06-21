
const sgMail =  require('@sendgrid/mail')

const sendGridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendGridAPIKey)

const sendWelcomeEmail = (email, name)=>{

    sgMail.send({

        to:email,
        from:"jk@yellow.ai",
        subject: 'Thanks for joining in!',
        text: `welcome to the app, ${name}. Let me know how you get along with app`
        
    })

}

const sendCancelEmail = (email, name)=>{

    sgMail.send({
        to:email,
        from:'jk@yellow.ai',
        subject:'Your account is deleted. We are sorry to see you go ',
        text:`GoodBye ${name}, Your account has been deleted. Please share your valuable feedback to help us improve`
    })

}

module.exports = ({
    sendWelcomeEmail,
    sendCancelEmail
})