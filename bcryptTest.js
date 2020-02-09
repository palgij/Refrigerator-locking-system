const bcrypt = require('bcrypt');

const saltRounds = 10;
const myPlaintextPassword = '4b058e0b';
const someOtherPlaintextPassword = 'as';
const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);

console.log(hash);

checkPass(someOtherPlaintextPassword, hash);
checkPass(myPlaintextPassword, hash);
checkPass("nimda", hash);

async function checkPass(checkPass, toPassHash) {

	const match = await bcrypt.compare(checkPass, toPassHash);

	if (match) {
		console.log("MATCHED! -> " + checkPass + "\n");
		return;
	}

	console.log("FAIL! -> " + checkPass + "\n");
}