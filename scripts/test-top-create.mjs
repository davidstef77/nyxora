import connect from '../src/app/api/lib/db.js';
import Top from '../src/app/api/lib/models/Top.js';

(async function(){
  try{
    await connect();
    const t = await Top.create({ title:'test-cli', slug:'test-cli', description:'cli create', items:[{ productSlug:'i7-12', position:1, customNote:'note' }, { productSlug:'i5-225f', position:2 }] });
    console.log('created id', t._id);
    const found = await Top.findById(t._id).lean();
    console.log('found', JSON.stringify(found, null, 2));
    process.exit(0);
  } catch(err){
    console.error(err);
    process.exit(1);
  }
})();