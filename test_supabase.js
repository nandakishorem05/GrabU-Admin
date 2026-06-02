const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ibophltufhguhnuybaaj.supabase.co";
const supabaseAnonKey = "sb_publishable_5R0dtc7BcnTYG5A6m_iSjA__EFlOwVs";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('shop_owner').select('owner_id, shop_name, email, password');
  if (error) {
    console.error('Error fetching shop_owners:', error);
  } else {
    console.log('Shop Owners in database:');
    console.log(JSON.stringify(data, null, 2));
  }
}

test();
