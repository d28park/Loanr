const Bot = require('./lib/Bot')
const IDS = require('./lib/IdService')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

let bot = new Bot()

// ROUTING

bot.onEvent = function(session, message) {
  switch (message.type) {
    case 'Init':
      welcome(session)
      break
    case 'Message':
      onMessage(session, message)
      break
    case 'Command':
      onCommand(session, message)
      break
    case 'Payment':
      onPayment(session, message)
      break
    case 'PaymentRequest':
      welcome(session)
      break
  }
}

function onMessage(session, message) {
  console.log(session.get('stage'))
  switch (session.get('stage')) {
    case undefined:
      sendMessage(session, "Hello, would you like to start a loan contract?")
      break    
    case 'initialize':
      sendMessage(session, "Hello, would you like to start a loan contract?")
      break
    case 'set-user':
      let user = message.content.body

      // TODO - logic to get user and user address
      if (true) {
        session.set('user', user)
        session.set('stage', 'set-eth')
        session.reply("Please specify the ETH amount:")
      } else {
        session.reply("User: " + user + " not found.")
        session.set('stage', 'initialize')
      }
      break
    case 'set-eth':
      let eth = message.content.body

      // TODO - check isNumber and <= balance
      if (true) {
        session.set('eth', eth)
        session.set('stage', 'set-interest-rate')
        session.reply("Please specify the interest rate (%):")
      } else {
        session.reply(eth + " is not a valid value.")
        session.set('stage', 'initialize')
      }
      break
    case 'set-interest-rate':
      let interest = message.content.body

      // TODO - check isNumber and > 0
      if (true) {
        session.set('interest', interest)
        session.set('stage', 'set-days')
        session.reply("Please specify the number of remaining days:")
      } else {
        session.reply(interest + "% is not a valid value.")
        session.set('stage', 'initialize')
      }
      break
    case 'set-days':
      let days = message.content.body

      // TODO - check isNumber and > 0
      if (true) {
        session.set('days', days)
        session.set('stage', 'set-consequence')
        session.reply("Please specify the consequence:")
      } else {
        session.reply(days + " days is not a valid value.")
        session.set('stage', 'initialize')
      }
      break
    case 'set-consequence':
      let consequence = message.content.body

      // TODO - check null
      if (true) {
        session.set('consequence', consequence)
        session.set('stage', 'set-loan')
        sendLoan(session, 
          "Here are your loan details:\n ETH: " + 
          session.get('eth') + 
          "\n Interest Rate: " + 
          session.get('interest') + 
          "%\n Due In: " + 
          session.get('days') + 
          " days\n\n Send this loan to user " + 
          session.get('user') + 
          "?") 
      } else {
        session.reply("You must specify a consequence.")
        session.set('stage', 'initialize')
      }
      break
    case 'set-loan':
      break
  }
}

function onCommand(session, command) {
  switch (command.content.value) {
    case 'Yes':
      setUser(session)
      break
    case 'No':
      session.set('stage', 'initialize')
      break
    case 'CreateLoan':
      console.log('TRUFFLE')
      session.set('stage', 'initialize')
      break
    case 'CancelLoan':
      session.set('stage', 'initialize')
      break
    }
}

function onPayment(session, message) {
  if (message.fromAddress == session.config.paymentAddress) {
    // handle payments sent by the bot
    if (message.status == 'confirmed') {
      // perform special action once the payment has been confirmed
      // on the network
    } else if (message.status == 'error') {
      // oops, something went wrong with a payment we tried to send!
    }
  } else {
    // handle payments sent to the bot
    if (message.status == 'unconfirmed') {
      // payment has been sent to the ethereum network, but is not yet confirmed
      sendMessage(session, `Thanks for the payment! 🙏`);
    } else if (message.status == 'confirmed') {
      // handle when the payment is actually confirmed!
    } else if (message.status == 'error') {
      sendMessage(session, `There was an error with your payment!🚫`);
    }
  }
}

// STATES

function setUser(session) {
  session.set('stage', 'set-user')
  session.reply('Please specify the user requesting the loan:')
}

// HELPERS

function sendMessage(session, message) {
  session.reply(SOFA.Message({
    body: message,
    controls: 
      [
        {type: 'button', label: 'Yes', value: 'Yes'},
        {type: 'button', label: 'No', value: 'No'}
      ],
    showKeyboard: false,
  }))
}

function sendLoan(session, message) {
  console.log('asd')
  session.reply(SOFA.Message({
    body: message,
    controls:
      [
        {type: 'button', label: 'Yes', value: 'CreateLoan'},
        {type: 'button', label: 'No', value: 'CancelLoan'}
      ],
      showKeyboard: false,
  }))
}