const Bot = require('./lib/Bot')
const IDS = require('./lib/IdService')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

let bot = new Bot()

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
			rejectPayment(session, message)
			break
		case 'PaymentRequest':
			rejectRequest(session, message)
			break
	}
}

function welcome(session) {
	session.reply("Hi! My name is Loanr. Type 'hi' to get started.")
	return
}
function onMessage(session, message) {
	// 'hi' is default hook to start the loan logic
	if (message.content.body == "hi" && session.get('stage') != 'set-user'){
		session.set('stage', 'set-contract')
		askYesNo(session, "Would you like to make a loan contract?", 'Yes', 'No')
		return
	}
	switch (session.get('stage')) {
		case 'set-user':
			let user = message.content.body
			if (true) {
				session.set('user', user)
				setEth(session)
				return
			} else {
				session.reply("User not found. Type 'hi' to try again.")
				return
			}
			break
		case 'set-amount':
			let amount = message.content.body
			if (true) {
				session.set('amount', amount)
				setInterestRate(session)
				return
			} else {
				session.reply("Amount not valid. Type 'hi' to try again.")
				return
			}
			break
		case 'set-rate':
			let rate = message.content.body
			if (true) {
				session.set('rate', rate)
				setDuration(session)
				return
			} else {
				session.reply("Wrong data type. Type 'hi' to try again.")
				return
			}
		case 'set-duration':
			let duration = message.content.body
			if (true) {
				session.set('duration', duration)
				setConsequence(session)
				return
			} else {
				session.reply("Duration is not valid. Type 'hi' to try again.")
				return
			}
			break
		case 'set-consequence':
			let consequence = message.content.body
			if (true) {
				session.set('consequence', consequence)
				finalizeLoan(session)
				return
			} else {
				session.reply("Error while setting consequence. Type 'hi' to try again.")
				return
			}
			break
		session.reply("Type 'hi' to get started!")
	}
}

function onCommand(session, command) {
	switch (session.get('stage')) {
		case 'set-contract':
			if (command.content.value == 'Yes') {
				setUser(session)
				return
			} else {
				session.reply("Operation aborted. Type 'hi' to try again.")
				return
			}
			break
		case 'finalize':
			if (command.content.value == 'Yes') {
				session.reply("Loan created. laksdjfsadf")
				/*
					LOGIC FOR PUBLISHING LOAN GOES HERE
				*/
			} else {
				session.reply("Loan cancelled. Type 'hi' to try again.")
				return
			}
			break
	}
}


// STAGE CHANGERS
function setUser(session) {
	session.set('stage', 'set-user')
	session.reply(SOFA.Message({
		body: "Please specify the user requesting the loan:",
		showKeyboard: true
	}))
}

function setEth(session) {
	session.set('stage', 'set-amount')
	session.reply(SOFA.Message({
		body: "How much ETH would you like to lend?",
		showKeyboard: true
	}))
}

function setInterestRate(session) {
	session.set('stage', 'set-rate')
	session.reply(SOFA.Message({
		body: "What percent interest rate would you like to set?",
		showKeyboard: true
	}))
}

function setDuration(session) {
	session.set('stage', 'set-duration')
	session.reply(SOFA.Message({
		body: "How many days should the loan duration be?:",
		showKeyboard: true
	}))
}

function setConsequence(session) {
	session.set('stage', 'set-consequence')
	session.reply(SOFA.Message({
		body: "Define a consequence for defaulting on this loan.",
		showKeyboard: true
	}))
}

// FINALIZER
function finalizeLoan(session) {
	if (true) {
		session.set('stage', 'finalize')
		askYesNo(session, 
			"Here are your loan details:\n>ETH: " + session.get('amount') + 
          	"\n>Interest Rate: " + session.get('rate') + 
          	"%\n>Due In: " + session.get('duration') + 
          	" days\n\n Send this loan to user " + session.get('user') + "?", 
          	"Confirm loan", "Cancel loan")
		return
	} else {
		session.reply("There was an error compiling the loan. Type 'hi' to try again.")
		return
	}
}

// ERROR CATCHERS
function rejectRequest(session, message) {
	session.reply("Error: I cannot give away money")
}

function rejectPayment(session, message) {
	session.reply("Error: I cannot accept payment until loan terms are set.")
}

// HELPERS 
function askYesNo(session, message, yes, no) {
	session.reply(SOFA.Message({
		body: message,
		controls:
			[
				{type: 'button', label: yes, value: 'Yes'},
				{type: 'button', label: no, value: 'No'}
			],
		showKeyboard: false,
	}))
}