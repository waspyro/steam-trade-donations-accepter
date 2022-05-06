import Web from 'steamatic'
import minitmist from 'minimist'

const args = minitmist(process.argv.splice(2))
const web = await Web.Basic(args, {askFor2FA: true, logOn: false})
web.setRequestsUrlLogger(true, false)
await web.logOn()

while(true) {
  const {active} = await web.trade.poll()
  const donations = active.donations
  console.log('donations left', donations.length)
  const donation = donations[0]
  if(!donation) { //make infinite poll loop if user wants to accept all incoming offers
    let time = args.l || args.loop
    if(!time) break
    if(time === true) time = 30000
    await new Promise(resolve => setTimeout(resolve, Number(time)))
    continue
  }
  const {completed, confirmationRequired} = await donation.accept()
  if(completed) continue
  if(confirmationRequired)
    throw new Error('donation offer should not require confirmation, something gone wrong')
  //this probably some large offer, should wait some time till it's completed
  console.log('accepting this offer may require some time')
  await new Promise(resolve => donation.setSyncInterval(10000).once('completed', resolve))
}
