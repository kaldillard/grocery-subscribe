// Check if user is logged in
async function checkAuth() {
  const session = await supabase.auth.getSession();
  
  if (session.data.session) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('account-details').style.display = 'block';
    await loadSubscriptionStatus();
  }
}

// Load current subscription
async function loadSubscriptionStatus() {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (subscription && subscription.tier !== 'free') {
    // Show current plan
    document.querySelector('.current-plan h2').textContent = 
      `Current Plan: ${subscription.tier}`;
    
    // Hide upgrade options, show manage button
    document.querySelector('.upgrade-options').style.display = 'none';
    document.querySelector('.manage-subscription').style.display = 'block';
  }
}

// Upgrade to Pro
async function upgradeToPro() {
  // Call your Supabase Edge Function to create Stripe session
  const { data } = await supabase.functions.invoke('create-checkout-session', {
    body: { 
      tier: 'pro',
      user_id: user.id,
      family_id: currentFamilyId,
      success_url: 'https://familygroceryhaul.com/success',
      cancel_url: 'https://familygroceryhaul.com/account'
    }
  });

  // Redirect to Stripe Checkout
  window.location.href = data.url;
}

// Open Stripe Customer Portal
async function openCustomerPortal() {
  const { data } = await supabase.functions.invoke('create-customer-portal', {
    body: { customer_id: subscription.stripe_customer_id }
  });

  window.location.href = data.url;
}