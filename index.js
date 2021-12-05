import Web from 'steamatic'
import minitmist from 'minimist'

const args = minitmist(process.argv.splice(2))
const web = await Web.Basic(args, console.log)
web.requestHooks.beforeRequest.push((opts, next) => {
  console.log('>', opts.request.url.toString())
  next()
})

while(true) {
  await web.trade.poll()
  const donation = Array.from(web.trade.activeOffers.values()).find(offer => offer.items.our.length === 0)
  if(!donation) break
  else await donation.accept()
}





