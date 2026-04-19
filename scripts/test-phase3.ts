import { connectDB } from '../app/lib/db';
import { SessionModel } from '../app/lib/models/Session';

async function testCurrentSession() {
  await connectDB();
  const todayDate = new Date().toISOString().slice(0, 10);
  
  console.log(`Checking session for: ${todayDate}`);
  const s = await SessionModel.findOne({ date: todayDate }).populate('populatedItems');
  
  if (!s) {
    console.log("No session exists for today yet in DB.");
  } else {
    console.log(`Found session: ${s._id}`);
    console.log(`Planned Items Count: ${s.plannedItems?.length}`);
    console.log(`Populated Items Count: ${s.populatedItems?.length}`);
    console.log(`Status: ${s.status}`);
  }
  process.exit(0);
}

testCurrentSession();
