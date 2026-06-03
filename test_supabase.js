const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ibophltufhguhnuybaaj.supabase.co";
const supabaseAnonKey = "sb_publishable_5R0dtc7BcnTYG5A6m_iSjA__EFlOwVs";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProductQuery() {
  try {
    console.log('Testing products join query...');
    const { data, error } = await supabase
      .from('shop_product')
      .select('*, master_product(*)')
      .eq('owner_id', 'o-001');

    if (error) throw error;
    console.log('Success! Fetched', data.length, 'products for owner o-001.');
    if (data.length > 0) {
      console.log('Sample product:', JSON.stringify(data[0], null, 2));
    }
  } catch (err) {
    console.error('Product query failed:', err);
  }
}

testProductQuery();
