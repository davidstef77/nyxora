import connect from '../src/app/api/lib/db.js';
import Top from '../src/app/api/lib/models/Top.js';

async function setItemsFor(slug, items) {
  await Top.findOneAndUpdate({ slug }, { $set: { items } }, { runValidators: true });
  const t = await Top.findOne({ slug }).lean();
  console.log('Updated', slug, '->', t && t.items ? t.items.length : 'no top');
}

(async ()=>{
  try{
    await connect();
    const items = [
      { productSlug: 'i7-12', position: 1, customNote: '' },
      { productSlug: 'i5-225f', position: 2, customNote: '' }
    ];
    await setItemsFor('da', items);
    await setItemsFor('da-fixed', items);
    process.exit(0);
  }catch(e){
    console.error(e);
    process.exit(1);
  }
})();