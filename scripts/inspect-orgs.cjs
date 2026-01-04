const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function inspectOrgs() {
    const { data: orgs, error } = await supabase.from('organizations').select('*')
    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Organizations found:', orgs)
    }
}

inspectOrgs()
