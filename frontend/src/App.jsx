import React, { useEffect, useState } from 'react';

// Flaw 15: Hardcoded Front-End Secret Keys Exposed in Client Code
const HARDCODED_DEV_SECRET = "FLAG{frontend_hardcoded_api_secret_key}";

function App() {
  const [activeTab, setActiveTab] = useState('shop');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [balance, setBalance] = useState(100.0);
  const [currentUser, setCurrentUser] = useState(null);

  // Modal & Form States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Exploit UI Inputs & Responses
  const [giftMessage, setGiftMessage] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [labelResult, setLabelResult] = useState('');
  const [orderIdInput, setOrderIdInput] = useState('1');
  const [receiptResult, setReceiptResult] = useState(null);
  const [ssrfUrl, setSsrfUrl] = useState('');
  const [ssrfResult, setSsrfResult] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState('');
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [checkoutStatus, setCheckoutStatus] = useState('');
  const [serializedCart, setSerializedCart] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const [adminDashData, setAdminDashData] = useState(null);
  const [debugData, setDebugData] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [lfiFilename, setLfiFilename] = useState('secret_config.php');
  const [lfiResult, setLfiResult] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');

  // Flaw 16: Hardcoded Sensitive Admin API Key in JS Memory
  const [apiKey] = useState("DEV_KEY_9918273645_BOUTIQUE_ADMIN");

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  // 1. SQLi Auth Bypass Form Action
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCurrentUser(data.user);
          setJwtToken(data.token);
          setShowLoginModal(false);
          setEmail('');
          setPassword('');
        } else {
          setLoginError(data.message || data.error || 'Login Failed');
        }
      })
      .catch((err) => setLoginError('Connection error: ' + err));
  };

  // 2. SSTI Preview Action
  const handleGiftCardSubmit = (e) => {
    e.preventDefault();
    fetch('/api/preview-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: giftMessage })
    })
      .then((res) => res.text())
      .then((html) => setPreviewHtml(html));
  };

  // 3. Command Injection Label Generator
  const handleGenerateLabel = (e) => {
    e.preventDefault();
    fetch('/api/admin/generate-label', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracking_id: trackingId })
    })
      .then((res) => res.json())
      .then((data) => setLabelResult(JSON.stringify(data, null, 2)));
  };

  // 4. IDOR Receipt Lookup
  const handleFetchReceipt = (e) => {
    e.preventDefault();
    fetch(`/api/account/receipt?order_id=${orderIdInput}`)
      .then((res) => res.json())
      .then((data) => setReceiptResult(data));
  };

  // 5. SSRF Design Fetcher
  const handleFetchDesign = (e) => {
    e.preventDefault();
    fetch('/api/fetch-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: ssrfUrl })
    })
      .then((res) => res.json())
      .then((data) => setSsrfResult(JSON.stringify(data, null, 2)));
  };

  // 6. Race Condition Coupon Redeemer
  const handleRedeem = () => {
    fetch('/api/redeem-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 2, code: couponCode })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBalance(data.new_balance);
          setCouponStatus(`Success! New balance: $${data.new_balance}`);
        } else {
          setCouponStatus(data.message);
        }
      });
  };

  // 7. Negative Price Logic Flaw Checkout
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 299.99, quantity: parseInt(checkoutQuantity) })
    })
      .then((res) => res.json())
      .then((data) => setCheckoutStatus(JSON.stringify(data, null, 2)));
  };

  // 8. Insecure Deserialization Importer
  const handleImportCart = (e) => {
    e.preventDefault();
    fetch('/api/import-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_data: serializedCart })
    })
      .then((res) => res.json())
      .then((data) => setImportStatus(JSON.stringify(data, null, 2)));
  };

  // 9. JWT Auth Admin Panel Fetch
  const handleFetchAdminDashboard = () => {
    fetch('/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    })
      .then((res) => res.json())
      .then((data) => setAdminDashData(data));
  };

  // 10. Debug Env Exposer
  const handleFetchDebug = () => {
    fetch('/api/debug-env')
      .then((res) => res.json())
      .then((data) => setDebugData(data));
  };

  // 11. File Upload (PHP)
  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append('file', uploadFile);

    fetch('/legacy/upload_item.php', {
      method: 'POST',
      body: formData
    })
      .then((res) => res.json())
      .then((data) => setUploadResult(data));
  };

  // 12. Local File Inclusion (PHP Download)
  const handleLfiDownload = (e) => {
    e.preventDefault();
    fetch(`/legacy/download_invoice.php?file=${lfiFilename}`)
      .then((res) => res.text())
      .then((text) => setLfiResult(text));
  };

  // 18. DOM Open Redirect Handler
  const handleRedirect = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <div style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', backgroundColor: '#faf8f5', minHeight: '100vh', color: '#2c2c2c' }}>
      {/* Flaw 19: Source Code Comment Leak */}
      {/* HIDDEN DEV NOTE: Backup endpoint available at /legacy/download_invoice.php?file=secret_config.php | Secret: FLAG{html_source_comment_leak} */}

      {/* Top Announcement Bar */}
      <div style={{ backgroundColor: '#1a1a1a', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem', textAlign: 'center', padding: '0.6rem 0' }}>
        Complimentary Express Global Shipping on Orders Over $500
      </div>

      {/* Main Luxury Header */}
      <header style={{ borderBottom: '1px solid #e8e3d9', padding: '1.5rem 3rem', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.2rem', letterSpacing: '4px', fontWeight: '300', fontFamily: 'serif',color: '#666' }}>AURA</h1>
          <span style={{ fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#666' }}>Haute Couture & Atelier</span>
        </div>

        {/* Global Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          <button onClick={() => setActiveTab('shop')} style={tabStyle(activeTab === 'shop')}>Boutique</button>
          <button onClick={() => setActiveTab('customizer')} style={tabStyle(activeTab === 'customizer')}>Gift Atelier</button>
          <button onClick={() => setActiveTab('orders')} style={tabStyle(activeTab === 'orders')}>Look Up Order</button>
          <button onClick={() => setActiveTab('services')} style={tabStyle(activeTab === 'services')}>Legacy Portals</button>
          <button onClick={() => setActiveTab('admin')} style={tabStyle(activeTab === 'admin')}>Admin suite</button>
        </nav>

        {/* User Session Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
            <span style={{ color: '#777', display: 'block' }}>VIP Account</span>
            <strong style={{ color: '#d4af37' }}>${balance.toFixed(2)}</strong>
          </div>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '0.85rem' }}>{currentUser.username} ({currentUser.role})</span>
              <button onClick={() => setCurrentUser(null)} style={{ padding: '0.4rem 0.8rem', background: 'none', border: '1px solid #ccc', cursor: 'pointer', fontSize: '0.75rem' }}>Sign Out</button>
            </div>
          ) : (
            <button onClick={() => setShowLoginModal(true)} style={{ padding: '0.6rem 1.4rem', backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem' }}>
              Member Login
            </button>
          )}
        </div>
      </header>

      {/* 🗝️ GUI LOGIN MODAL (SQL Injection Payload Ready) */}
      {showLoginModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h2 style={{ marginTop: 0, fontFamily: 'serif', fontWeight: 'normal' }}>Atelier Account Sign In</h2>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>Enter your VIP credentials to access private collections.</p>
            {loginError && <div style={{ color: '#b30000', fontSize: '0.85rem', margin: '0.5rem 0' }}>{loginError}</div>}
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Email Address</label>
                <input 
                  type="text" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="admin@auraboutique.local" 
                  style={inputStyle} 
                  required 
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  style={inputStyle} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="submit" style={darkButtonStyle}>Sign In</button>
                <button type="button" onClick={() => setShowLoginModal(false)} style={lightButtonStyle}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🛍️ TAB 1: MAIN BOUTIQUE STOREFRONT */}
      {activeTab === 'shop' && (
        <main style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 2rem' }}>
          {/* Hero Banner */}
          <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#ffffff', border: '1px solid #eae5d9', marginBottom: '3rem' }}>
            <span style={{ letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.8rem', color: '#a38f65' }}>New Arrival</span>
            <h2 style={{ fontSize: '2.8rem', fontWeight: '300', margin: '0.5rem 0 1rem 0', fontFamily: 'serif',color: '#666' }}>The Summer Silk Collection</h2>
            <p style={{ color: '#666', fontStyle: 'italic', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>Elegance tailored with exquisite materials and timeless craftsmanship.</p>
          </div>

          <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid #e0e0e0', paddingBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Curated Catalog</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
            {products.map((p) => (
              <div key={p.id} style={{ backgroundColor: '#ffffff', border: '1px solid #eae5d9', padding: '1.5rem', borderRadius: '2px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '2px' }} />
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 'normal', margin: '1rem 0 0.5rem 0', fontFamily: 'serif' }}>{p.name}</h4>
                  <p style={{ color: '#666', fontSize: '0.9rem', minHeight: '40px' }}>{p.description}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid #f2ede4', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1a1a1a' }}>${p.price}</span>
                  <button onClick={() => setShowCheckoutModal(true)} style={darkButtonStyle}>Acquire Piece</button>
                </div>
              </div>
            ))}
          </div>

          {/* Negative Price Logic Flaw Modal */}
          {showCheckoutModal && (
            <div style={modalOverlayStyle}>
              <div style={modalBoxStyle}>
                <h3 style={{ marginTop: 0, fontFamily: 'serif' }}>Order Confirmation</h3>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>Adjust quantity to complete your request (Flaw 7: Logic Flaw Test)</p>
                <form onSubmit={handleCheckoutSubmit}>
                  <label style={labelStyle}>Item Quantity</label>
                  <input type="number" value={checkoutQuantity} onChange={(e) => setCheckoutQuantity(e.target.value)} style={inputStyle} />
                  <div style={{ margin: '1rem 0' }}>
                    <button type="submit" style={darkButtonStyle}>Process Order</button>
                    <button type="button" onClick={() => setShowCheckoutModal(false)} style={{ ...lightButtonStyle, marginLeft: '10px' }}>Close</button>
                  </div>
                </form>
                {checkoutStatus && <pre style={codeBoxStyle}>{checkoutStatus}</pre>}
              </div>
            </div>
          )}

          {/* Coupon Redemption Bar (Race Condition) */}
          <section style={{ backgroundColor: '#ffffff', border: '1px solid #eae5d9', padding: '2rem', marginTop: '3rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>VIP Courtesy Voucher</h4>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>Redeem promotional credits directly to your boutique balance (Code: <code>LUXURY50</code>).</p>
            <div style={{ display: 'flex', gap: '1rem', maxWidth: '400px', marginTop: '1rem' }}>
              <input type="text" placeholder="LUXURY50" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={inputStyle} />
              <button onClick={handleRedeem} style={darkButtonStyle}>Redeem</button>
            </div>
            {couponStatus && <p style={{ fontSize: '0.85rem', color: '#d4af37', marginTop: '0.5rem' }}>{couponStatus}</p>}
          </section>
        </main>
      )}

      {/* 🎁 TAB 2: GIFT ATELIER & DESIGN FETCHER */}
      {activeTab === 'customizer' && (
        <main style={{ maxWidth: '900px', margin: '3rem auto', padding: '0 2rem' }}>
          {/* Flaw 2 & 17: SSTI and DOM XSS Card Customizer */}
          <section style={cardSectionStyle}>
            <h3 style={sectionHeaderStyle}>Boutique Gift Card Personalization</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Generate custom Jinja template elements for high-value gift packages (SSTI / XSS Playground).</p>
            <form onSubmit={handleGiftCardSubmit} style={{ marginTop: '1rem' }}>
              <input 
                type="text" 
                placeholder="Message, e.g. {{ config }} or <script>alert(1)</script>" 
                value={giftMessage} 
                onChange={(e) => setGiftMessage(e.target.value)} 
                style={{ ...inputStyle, marginBottom: '1rem' }} 
              />
              <button type="submit" style={darkButtonStyle}>Generate Live Preview</button>
            </form>

            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', color: '#777' }}>Output Preview Container:</h4>
              <div style={{ border: '1px goldenrod dashed', padding: '1.5rem', backgroundColor: '#fffdf9', borderRadius: '4px' }} dangerouslySetInnerHTML={{ __html: previewHtml || '<em>Your rendered gift card preview will appear here...</em>' }} />
            </div>
          </section>

          {/* Flaw 5: SSRF Fetcher */}
          <section style={{ ...cardSectionStyle, marginTop: '2rem' }}>
            <h3 style={sectionHeaderStyle}>External Design Inspector (SSRF)</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Fetch custom couture design schematics from external or internal web servers.</p>
            <form onSubmit={handleFetchDesign} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" placeholder="http://database:3306 or http://example.com" value={ssrfUrl} onChange={(e) => setSsrfUrl(e.target.value)} style={inputStyle} />
              <button type="submit" style={darkButtonStyle}>Fetch URL</button>
            </form>
            {ssrfResult && <pre style={codeBoxStyle}>{ssrfResult}</pre>}
          </section>
        </main>
      )}

      {/* 📦 TAB 3: ORDER LOOKUP & IDOR */}
      {activeTab === 'orders' && (
        <main style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 2rem' }}>
          {/* Flaw 4: IDOR Order Receipt */}
          <section style={cardSectionStyle}>
            <h3 style={sectionHeaderStyle}>Customer Receipt Retrieval (IDOR)</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Query client order transactions by numeric reference index.</p>
            <form onSubmit={handleFetchReceipt} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <input type="number" placeholder="Order ID (e.g. 1)" value={orderIdInput} onChange={(e) => setOrderIdInput(e.target.value)} style={inputStyle} />
              <button type="submit" style={darkButtonStyle}>Retrieve Order</button>
            </form>

            {receiptResult && (
              <div style={{ marginTop: '1.5rem', backgroundColor: '#fff', border: '1px solid #ddd', padding: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontFamily: 'serif' }}>Invoice Record #{receiptResult.id}</h4>
                <pre style={{ fontSize: '0.85rem', color: '#333' }}>{JSON.stringify(receiptResult, null, 2)}</pre>
              </div>
            )}
          </section>

          {/* Flaw 8: Insecure Deserialization */}
          <section style={{ ...cardSectionStyle, marginTop: '2rem' }}>
            <h3 style={sectionHeaderStyle}>Import Saved Session Cart (Pickle Deserialization)</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Paste your base64-encoded Python pickle string to load previous selections.</p>
            <form onSubmit={handleImportCart} style={{ marginTop: '1rem' }}>
              <textarea placeholder="Base64 encoded pickle string..." value={serializedCart} onChange={(e) => setSerializedCart(e.target.value)} style={{ ...inputStyle, height: '80px', marginBottom: '1rem' }} />
              <button type="submit" style={darkButtonStyle}>Deserialize Cart</button>
            </form>
            {importStatus && <pre style={codeBoxStyle}>{importStatus}</pre>}
          </section>
        </main>
      )}

      {/* 🐘 TAB 4: LEGACY PHP SERVICES */}
      {activeTab === 'services' && (
        <main style={{ maxWidth: '900px', margin: '3rem auto', padding: '0 2rem' }}>
          {/* Flaw 11: Unrestricted PHP File Upload */}
          <section style={cardSectionStyle}>
            <h3 style={sectionHeaderStyle}>Legacy Inventory Media Upload (File Upload RCE)</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Upload item images directly into legacy storage (`/legacy/upload_item.php`).</p>
            <form onSubmit={handleFileUpload} style={{ marginTop: '1rem' }}>
              <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} style={{ marginBottom: '1rem', display: 'block' }} />
              <button type="submit" style={darkButtonStyle}>Upload File</button>
            </form>
            {uploadResult && <pre style={codeBoxStyle}>{JSON.stringify(uploadResult, null, 2)}</pre>}
          </section>

          {/* Flaw 12: PHP Local File Inclusion */}
          <section style={{ ...cardSectionStyle, marginTop: '2rem' }}>
            <h3 style={sectionHeaderStyle}>Invoice Archive Reader (LFI / Path Traversal)</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Read server invoice logs (`/legacy/download_invoice.php?file=...`).</p>
            <form onSubmit={handleLfiDownload} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" placeholder="secret_config.php or ../../../../etc/passwd" value={lfiFilename} onChange={(e) => setLfiFilename(e.target.value)} style={inputStyle} />
              <button type="submit" style={darkButtonStyle}>Read File</button>
            </form>
            {lfiResult && <pre style={codeBoxStyle}>{lfiResult}</pre>}
          </section>

          {/* Flaw 18: DOM Open Redirect */}
          <section style={{ ...cardSectionStyle, marginTop: '2rem' }}>
            <h3 style={sectionHeaderStyle}>External Concierge Jump (DOM Open Redirect)</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Navigate to associated boutique partner domains.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" placeholder="https://evil-phishing.com" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} style={inputStyle} />
              <button onClick={handleRedirect} style={darkButtonStyle}>Jump Page</button>
            </div>
          </section>
        </main>
      )}

      {/* 👑 TAB 5: ADMIN SUITE & DEBUGGING */}
      {activeTab === 'admin' && (
        <main style={{ maxWidth: '900px', margin: '3rem auto', padding: '0 2rem' }}>
          {/* Flaw 3: OS Command Injection */}
          <section style={cardSectionStyle}>
            <h3 style={sectionHeaderStyle}>Shipping Manifest Generator (Command Injection)</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Trigger automated manifest printing pipelines for dispatch.</p>
            <form onSubmit={handleGenerateLabel} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" placeholder="TRK98123; cat /tmp/rce_flag.txt" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} style={inputStyle} />
              <button type="submit" style={darkButtonStyle}>Dispatch Label</button>
            </form>
            {labelResult && <pre style={codeBoxStyle}>{labelResult}</pre>}
          </section>

          {/* Flaw 9: JWT Authentication Dashboard */}
          <section style={{ ...cardSectionStyle, marginTop: '2rem' }}>
            <h3 style={sectionHeaderStyle}>Admin Dashboard Portal (JWT Verification Flaw)</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Access administrative reports using active JWT tokens.</p>
            <button onClick={handleFetchAdminDashboard} style={darkButtonStyle}>Fetch Admin Dashboard</button>
            {adminDashData && <pre style={codeBoxStyle}>{JSON.stringify(adminDashData, null, 2)}</pre>}
          </section>

          {/* Flaw 10: Debug Information Leak */}
          <section style={{ ...cardSectionStyle, marginTop: '2rem' }}>
            <h3 style={sectionHeaderStyle}>System Environment Inspector (Info Disclosure)</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Dump server process environment variables.</p>
            <button onClick={handleFetchDebug} style={darkButtonStyle}>Dump System Env</button>
            {debugData && <pre style={codeBoxStyle}>{JSON.stringify(debugData, null, 2)}</pre>}
          </section>
        </main>
      )}
    </div>
  );
}

// Inline CSS Styles for Luxury UI Aesthetics
const tabStyle = (active) => ({
  background: 'none',
  border: 'none',
  borderBottom: active ? '2px solid #d4af37' : '2px solid transparent',
  color: active ? '#1a1a1a' : '#777',
  padding: '0.5rem 0',
  cursor: 'pointer',
  fontWeight: active ? '600' : 'normal',
  fontSize: '0.85rem'
});

const labelStyle = { display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem', color: '#555' };
const inputStyle = { width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '2px', boxSizing: 'border-box', fontFamily: 'inherit' };
const darkButtonStyle = { padding: '0.75rem 1.5rem', backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem' };
const lightButtonStyle = { padding: '0.75rem 1.5rem', backgroundColor: '#e5e5e5', color: '#333', border: 'none', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem' };
const cardSectionStyle = { backgroundColor: '#ffffff', border: '1px solid #eae5d9', padding: '2rem', borderRadius: '2px' };
const sectionHeaderStyle = { margin: '0 0 0.5rem 0', fontFamily: 'serif', fontSize: '1.4rem', fontWeight: 'normal' };
const codeBoxStyle = { backgroundColor: '#1e1e1e', color: '#00ff66', padding: '1rem', borderRadius: '4px', overflowX: 'auto', marginTop: '1rem', fontSize: '0.85rem' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalBoxStyle = { backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '2px', width: '420px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' };

export default App;