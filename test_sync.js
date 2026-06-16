const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ibophltufhguhnuybaaj.supabase.co";
const supabaseAnonKey = "sb_publishable_5R0dtc7BcnTYG5A6m_iSjA__EFlOwVs";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const activeOwnerId = "o-001";

async function testSync() {
  try {
    console.log('1. Testing shop_owner query...');
    const shopRes = await supabase
      .from('shop_owner')
      .select('status, shop_name, owner_name')
      .eq('owner_id', activeOwnerId)
      .maybeSingle();
    if (shopRes.error) throw shopRes.error;
    console.log('Shop Owner Query Success:', shopRes.data);

    console.log('2. Testing order query...');
    const ordersRes = await supabase
      .from('order')
      .select('*, order_item(*), customer(*)')
      .eq('owner_id', activeOwnerId)
      .order('placed_at', { ascending: false });
    if (ordersRes.error) throw ordersRes.error;
    console.log('Orders Query Success: Fetched', ordersRes.data.length, 'orders.');

    console.log('3. Testing shop_product query...');
    const productsRes = await supabase
      .from('shop_product')
      .select('*, master_product(*)')
      .eq('owner_id', activeOwnerId);
    if (productsRes.error) throw productsRes.error;
    console.log('Products Query Success: Fetched', productsRes.data.length, 'products.');

    console.log('All queries succeeded!');
  } catch (err) {
    console.error('Query failed:', err);
  }
}

testSync();
