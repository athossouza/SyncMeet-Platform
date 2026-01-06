const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function checkUserRole() {
    const email = 'athos@atveza.com'
    console.log(`🔍 Checking profile for: ${email}`)

    // 1. Get User ID from Auth (Optional, but good verification)
    // Actually, we can just query profiles by email if that column exists there.
    // Schema says: profiles has `email`.

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)

    if (error) {
        console.error('❌ Error fetching profile:', error)
        return
    }

    if (!profiles || profiles.length === 0) {
        console.error('❌ Profile not found!')
        // Check Auth users
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
        const authUser = users.find(u => u.email === email)
        if (authUser) {
            console.log('✅ Auth User EXISTS:', authUser.id)
            console.log('⚠️ But no entry in public.profiles')
        } else {
            console.log('❌ User not found in Auth either.')
        }
        return
    }

    const profile = profiles[0]
    console.log('✅ Profile Found:', profile)
    console.log(`🆔 ID: ${profile.id}`)
    console.log(`🎭 Role: ${profile.role}`)

    if (profile.role !== 'admin') {
        console.warn('⚠️ USER IS NOT ADMIN! This explains the Insert failure (RLS).')
    } else {
        console.log('✅ User is ADMIN.')
    }
}

checkUserRole()
