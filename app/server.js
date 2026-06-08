const http = require('http');

const PORT = 8080;
const ROLE = process.env.APP_ROLE || 'frontend';

// Global shared style elements for our dark-theme banking & hospital application
const HTML_HEAD = (title, brand) => `
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | ${brand}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-base: #0b0f19;
            --bg-surface: #151f32;
            --bg-accent: #1e1b4b;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent: ${brand === 'MediCenter' ? '#8b5cf6' : '#6366f1'};
            --accent-glow: rgba(${brand === 'MediCenter' ? '139, 92, 246, 0.15' : '99, 102, 241, 0.15'});
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --border: rgba(148, 163, 184, 0.08);
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg-base);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
        }
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        /* Glassmorphism Styles */
        .glass-panel {
            background: rgba(21, 31, 50, 0.75);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border: 1px solid var(--border);
            border-radius: 20px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.45);
        }
        /* Buttons */
        .btn {
            font-family: inherit;
            font-weight: 600;
            padding: 0.8rem 1.8rem;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border: none;
        }
        .btn-primary {
            background: linear-gradient(135deg, var(--accent), #4f46e5);
            color: white;
            box-shadow: 0 4px 14px var(--accent-glow);
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }
        .btn-secondary {
            background: rgba(255, 255, 255, 0.04);
            color: var(--text-primary);
            border: 1px solid var(--border);
        }
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateY(-2px);
        }
        /* Header / Navbar */
        header.nav {
            padding: 1.5rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
            background: rgba(11, 15, 25, 0.6);
            backdrop-filter: blur(8px);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .logo {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: -0.05em;
            background: linear-gradient(135deg, #a5b4fc, var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .logo-symbol {
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, var(--accent), #4f46e5);
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 800;
            font-size: 1rem;
            -webkit-text-fill-color: initial;
        }
        .badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.6rem;
            border-radius: 9999px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge-live {
            background: rgba(16, 185, 129, 0.15);
            color: var(--success);
            border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .badge-canary {
            background: rgba(245, 158, 11, 0.15);
            color: var(--warning);
            border: 1px solid rgba(245, 158, 11, 0.3);
        }
        footer {
            text-align: center;
            padding: 2rem;
            font-size: 0.85rem;
            color: var(--text-secondary);
            border-top: 1px solid var(--border);
            background: rgba(11, 15, 25, 0.8);
        }
    </style>
</head>
`;

const HTML_HEADER_NAV = (brand, gateInfo) => `
<header class="nav">
    <div class="logo">
        <div class="logo-symbol">${brand[0]}</div>
        ${brand.toUpperCase()}
    </div>
    <div style="display: flex; align-items: center; gap: 1.5rem;">
        <span style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; color: var(--text-secondary)">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--success); display: inline-block; animation: pulse 1.5s infinite"></span>
            ${gateInfo}
        </span>
    </div>
</header>
<style>
@keyframes pulse {
    0% { transform: scale(0.9); opacity: 0.6; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(0.9); opacity: 0.6; }
}
</style>
`;

const HTML_FOOTER = (brand, gateInfo) => `
<footer>
    <p>© 2026 ${brand} Inc. All rights reserved.</p>
    <p style="margin-top: 0.5rem; font-size: 0.75rem; color: #334155">Powered by ${gateInfo} & cert-manager (SSL Terminated)</p>
</footer>
`;

/* ==========================================================================
   BANKING ROLES (APEX BANK)
   ========================================================================== */

const serveFrontend = (res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html lang="en">
${HTML_HEAD('Wealth Management', 'Apex Bank')}
<body>
    ${HTML_HEADER_NAV('Apex Bank', 'Apex Gateway Routing Enabled')}
    <div class="container" style="justify-content: center; align-items: center; text-align: center; min-height: 80vh;">
        <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
            <div>
                <span class="badge badge-live" style="margin-bottom: 1rem;">Institutional Grade</span>
                <h1 style="font-size: 4rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 1rem;">
                    Next-Generation <br/>
                    <span style="background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Wealth Management</span>
                </h1>
                <p style="font-size: 1.25rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto;">
                    Apex Bank provides high-performance secure banking infrastructure with automated algorithmic investments to accelerate your portfolio.
                </p>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                <a href="https://auth.apex.local" class="btn btn-primary">Open Online Banking</a>
                <a href="https://api.apex.local" class="btn btn-secondary">Developer Gateway</a>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 4rem; text-align: left;">
                <div class="glass-panel" style="padding: 1.5rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚡</div>
                    <h3 style="margin-bottom: 0.5rem; font-weight: 600;">Instant Transfers</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">Liquid assets settled instantly. Integrated natively with real-time clearing networks.</p>
                </div>
                <div class="glass-panel" style="padding: 1.5rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📈</div>
                    <h3 style="margin-bottom: 0.5rem; font-weight: 600;">Smart Portfolios</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">Algorithmic balance adjustment to hedge inflation and maximize yield.</p>
                </div>
                <div class="glass-panel" style="padding: 1.5rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🛡️</div>
                    <h3 style="margin-bottom: 0.5rem; font-weight: 600;">Hardware Security</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">Multi-party computation (MPC) keys with strict automated compliance limits.</p>
                </div>
            </div>
        </div>
    </div>
    ${HTML_FOOTER('Apex Bank', 'NGINX Gateway Fabric')}
</body>
</html>`);
};

const serveAuth = (res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html lang="en">
${HTML_HEAD('Secure Authentication', 'Apex Bank')}
<body>
    ${HTML_HEADER_NAV('Apex Bank', 'Apex Gateway Routing Enabled')}
    <div class="container" style="justify-content: center; align-items: center; min-height: 80vh;">
        <div class="glass-panel" style="width: 100%; max-width: 450px; padding: 2.5rem; display: flex; flex-direction: column; gap: 2rem;">
            <div style="text-align: center;">
                <h2 style="font-size: 2rem; font-weight: 700;">Welcome Back</h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.3rem;">Securely authenticate to access Apex Online Banking</p>
            </div>
            
            <form onsubmit="event.preventDefault(); window.location.href='https://dashboard.apex.local';" style="display: flex; flex-direction: column; gap: 1.25rem;">
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary)">USERNAME</label>
                    <input type="text" value="demouser" readonly style="font-family: inherit; font-size: 1rem; padding: 0.8rem 1rem; border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,0.01); color: var(--text-primary); outline: none;">
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary)">PASSWORD</label>
                    <input type="password" value="password123" readonly style="font-family: inherit; font-size: 1rem; padding: 0.8rem 1rem; border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,0.01); color: var(--text-primary); outline: none;">
                </div>

                <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.15); border-radius: 10px; padding: 0.8rem; font-size: 0.85rem; color: var(--warning); display: flex; gap: 0.5rem; align-items: flex-start; line-height: 1.4;">
                    <span style="font-size: 1.1rem; line-height: 1;">💡</span>
                    <span>Demo Mode Enabled: Credentials are pre-configured. Simply click the authenticate button.</span>
                </div>

                <button type="submit" class="btn btn-primary" style="margin-top: 0.5rem; width: 100%;">Authenticate Session</button>
            </form>
        </div>
    </div>
    ${HTML_FOOTER('Apex Bank', 'NGINX Gateway Fabric')}
</body>
</html>`);
};

const serveDashboard = (res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html lang="en">
${HTML_HEAD('Financial Dashboard', 'Apex Bank')}
<body>
    ${HTML_HEADER_NAV('Apex Bank', 'Apex Gateway Routing Enabled')}
    <div class="container" style="padding: 2rem 1rem; max-width: 1300px; gap: 2rem; justify-content: flex-start;">
        
        <!-- Welcome Message -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h1 style="font-size: 2.2rem; font-weight: 700;">Welcome back, Demo User</h1>
                <p style="color: var(--text-secondary); font-size: 0.95rem;">Interactive real-time transaction simulator</p>
            </div>
            <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border); padding: 0.6rem 1.2rem; border-radius: 12px; font-size: 0.9rem;">
                Last active: <span style="color: var(--accent); font-weight: 600;">Just now</span>
            </div>
        </div>

        <!-- Metric Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            <div class="glass-panel" style="padding: 1.8rem; position: relative; overflow: hidden;">
                <div style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">Checking Account</div>
                <div id="checking-balance" style="font-size: 2.4rem; font-weight: 700; margin-top: 0.5rem; color: var(--text-primary); transition: color 0.5s">$14,850.22</div>
                <div style="font-size: 0.85rem; color: var(--success); margin-top: 0.4rem; display: flex; align-items: center; gap: 0.2rem;">
                    <span>↑ 4.2%</span> <span style="color: var(--text-secondary)">this month</span>
                </div>
            </div>
            
            <div class="glass-panel" style="padding: 1.8rem;">
                <div style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">High-Yield Savings</div>
                <div id="savings-balance" style="font-size: 2.4rem; font-weight: 700; margin-top: 0.5rem;">$84,203.10</div>
                <div style="font-size: 0.85rem; color: var(--success); margin-top: 0.4rem; display: flex; align-items: center; gap: 0.2rem;">
                    <span>↑ 0.35% APY</span> <span style="color: var(--text-secondary)">compounding daily</span>
                </div>
            </div>

            <div class="glass-panel" style="padding: 1.8rem;">
                <div style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">Investment Portfolio</div>
                <div id="investment-balance" style="font-size: 2.4rem; font-weight: 700; margin-top: 0.5rem; color: var(--accent)">$128,450.00</div>
                <div style="font-size: 0.85rem; color: var(--success); margin-top: 0.4rem; display: flex; align-items: center; gap: 0.2rem;">
                    <span>↑ 12.8%</span> <span style="color: var(--text-secondary)">annual return</span>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; align-items: start; width: 100%;">
            <!-- Left Side: Transaction simulator & visual Chart -->
            <div style="display: flex; flex-direction: column; gap: 2rem;">
                <!-- Chart Panel -->
                <div class="glass-panel" style="padding: 1.8rem; height: 320px; display: flex; flex-direction: column; gap: 1rem;">
                    <div style="font-weight: 600; font-size: 1.1rem; display: flex; justify-content: space-between; align-items: center;">
                        <span>Monthly Spend Analytics</span>
                        <span style="color: var(--text-secondary); font-size: 0.85rem; font-weight: normal;">6-Month Overview</span>
                    </div>
                    <!-- Inline SVG Chart -->
                    <div style="flex-grow: 1; position: relative; display: flex; align-items: flex-end; padding-top: 1.5rem;">
                        <svg viewBox="0 0 600 180" style="width: 100%; height: 100%;">
                            <!-- Grid lines -->
                            <line x1="0" y1="30" x2="600" y2="30" stroke="var(--border)" stroke-dasharray="4"/>
                            <line x1="0" y1="90" x2="600" y2="90" stroke="var(--border)" stroke-dasharray="4"/>
                            <line x1="0" y1="150" x2="600" y2="150" stroke="var(--border)" stroke-dasharray="4"/>
                            
                            <!-- Graph line path -->
                            <path d="M 50 140 Q 150 70 250 110 T 450 50 T 550 80" fill="none" stroke="var(--accent)" stroke-width="4"/>
                            <!-- Gradient Area below the path -->
                            <path d="M 50 140 Q 150 70 250 110 T 450 50 T 550 80 L 550 180 L 50 180 Z" fill="url(#chart-grad)" opacity="0.1"/>
                            
                            <!-- Dots -->
                            <circle cx="50" cy="140" r="5" fill="var(--accent)"/>
                            <circle cx="150" cy="88" r="5" fill="var(--accent)"/>
                            <circle cx="250" cy="110" r="5" fill="var(--accent)"/>
                            <circle cx="350" cy="78" r="5" fill="var(--accent)"/>
                            <circle cx="450" cy="50" r="5" fill="var(--accent)"/>
                            <circle cx="550" cy="80" r="5" fill="var(--accent)"/>

                            <!-- Gradients definitions -->
                            <defs>
                                <linearGradient id="chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="var(--accent)"/>
                                    <stop offset="100%" stop-color="transparent"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                <!-- Live Ledger Panel -->
                <div class="glass-panel" style="padding: 1.8rem; display: flex; flex-direction: column; gap: 1rem;">
                    <h3 style="font-weight: 600; font-size: 1.1rem;">Recent Transactions Ledger</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border); color: var(--text-secondary); font-size: 0.85rem;">
                                    <th style="padding: 0.8rem;">TRANSACTION ID</th>
                                    <th style="padding: 0.8rem;">BENEFICIARY</th>
                                    <th style="padding: 0.8rem;">CATEGORY</th>
                                    <th style="padding: 0.8rem; text-align: right;">AMOUNT</th>
                                    <th style="padding: 0.8rem; text-align: center;">STATUS</th>
                                </tr>
                            </thead>
                            <tbody id="transaction-rows">
                                <tr style="border-bottom: 1px solid var(--border); font-size: 0.95rem;">
                                    <td style="padding: 1rem; color: var(--text-secondary); font-family: monospace;">TXN-85920</td>
                                    <td style="padding: 1rem; font-weight: 500;">AWS Cloud Infrastructure</td>
                                    <td style="padding: 1rem; color: var(--text-secondary)">Hosting</td>
                                    <td style="padding: 1rem; text-align: right; color: var(--danger); font-weight: 600;">-$425.80</td>
                                    <td style="padding: 1rem; text-align: center;"><span class="badge badge-live">Settled</span></td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border); font-size: 0.95rem;">
                                    <td style="padding: 1rem; color: var(--text-secondary); font-family: monospace;">TXN-85919</td>
                                    <td style="padding: 1rem; font-weight: 500;">Dividends Yield Payout</td>
                                    <td style="padding: 1rem; color: var(--text-secondary)">Investments</td>
                                    <td style="padding: 1rem; text-align: right; color: var(--success); font-weight: 600;">+$125.00</td>
                                    <td style="padding: 1rem; text-align: center;"><span class="badge badge-live">Settled</span></td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border); font-size: 0.95rem;">
                                    <td style="padding: 1rem; color: var(--text-secondary); font-family: monospace;">TXN-85918</td>
                                    <td style="padding: 1rem; font-weight: 500;">Starbucks Coffee</td>
                                    <td style="padding: 1rem; color: var(--text-secondary)">Dining</td>
                                    <td style="padding: 1rem; text-align: right; color: var(--danger); font-weight: 600;">-$14.50</td>
                                    <td style="padding: 1rem; text-align: center;"><span class="badge badge-live">Settled</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Right Side: Transfer simulator Form -->
            <div class="glass-panel" style="padding: 1.8rem; display: flex; flex-direction: column; gap: 1.5rem;">
                <h3 style="font-weight: 600; font-size: 1.1rem;">Quick Simulator Funds Transfer</h3>
                
                <form id="transfer-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary)">RECIPIENT / PAYEE</label>
                        <input id="payee-name" type="text" placeholder="e.g. Acme Corp" required style="font-family: inherit; font-size: 0.95rem; padding: 0.7rem 0.9rem; border-radius: 8px; border: 1px solid var(--border); background: rgba(255,255,255,0.01); color: var(--text-primary); outline: none;">
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary)">CATEGORY</label>
                        <select id="payee-category" style="font-family: inherit; font-size: 0.95rem; padding: 0.7rem 0.9rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary); outline: none;">
                            <option value="Transfer">Transfer</option>
                            <option value="Billing">Billing / Utilities</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Dining">Dining</option>
                        </select>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary)">AMOUNT (USD)</label>
                        <input id="transfer-amount" type="number" min="1" max="10000" step="0.01" placeholder="0.00" required style="font-family: inherit; font-size: 0.95rem; padding: 0.7rem 0.9rem; border-radius: 8px; border: 1px solid var(--border); background: rgba(255,255,255,0.01); color: var(--text-primary); outline: none;">
                    </div>

                    <button type="submit" class="btn btn-primary" style="width: 100%;">Execute Transfer</button>
                </form>

                <div id="status-toast" style="padding: 0.8rem; border-radius: 8px; font-size: 0.85rem; display: none; text-align: center; font-weight: 500;">
                </div>
            </div>
        </div>
    </div>

    <!-- Live Client Interactive JS -->
    <script>
        let balance = 14850.22;
        const checkingEl = document.getElementById('checking-balance');
        const transferForm = document.getElementById('transfer-form');
        const transactionRows = document.getElementById('transaction-rows');
        const statusToast = document.getElementById('status-toast');

        transferForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const payee = document.getElementById('payee-name').value;
            const category = document.getElementById('payee-category').value;
            const amt = parseFloat(document.getElementById('transfer-amount').value);

            if (isNaN(amt) || amt <= 0) return;

            if (amt > balance) {
                showToast("Insufficient checking balance to perform this operation.", false);
                return;
            }

            // Perform balance deduction
            balance -= amt;
            checkingEl.innerText = '$' + balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
            // Visual indicators for balance modification
            checkingEl.style.color = 'var(--danger)';
            setTimeout(() => {
                checkingEl.style.color = 'var(--text-primary)';
            }, 600);

            // Generate Txn ID
            const txnId = 'TXN-' + Math.floor(10000 + Math.random() * 90000);

            // Append row
            const newRow = document.createElement('tr');
            newRow.style.borderBottom = '1px solid var(--border)';
            newRow.style.fontSize = '0.95rem';
            newRow.style.animation = 'fadeIn 0.5s ease';
            newRow.innerHTML = \`
                <td style="padding: 1rem; color: var(--text-secondary); font-family: monospace;">\${txnId}</td>
                <td style="padding: 1rem; font-weight: 500;">\${payee}</td>
                <td style="padding: 1rem; color: var(--text-secondary)">\${category}</td>
                <td style="padding: 1rem; text-align: right; color: var(--danger); font-weight: 600;">-\$\${amt.toFixed(2)}</td>
                <td style="padding: 1rem; text-align: center;"><span class="badge badge-live">Settled</span></td>
            \`;

            transactionRows.insertBefore(newRow, transactionRows.firstChild);
            showToast("Transfer completed successfully!", true);

            // Reset Form fields
            document.getElementById('payee-name').value = '';
            document.getElementById('transfer-amount').value = '';
        });

        function showToast(msg, isSuccess) {
            statusToast.innerText = msg;
            statusToast.style.display = 'block';
            if (isSuccess) {
                statusToast.style.background = 'rgba(16, 185, 129, 0.15)';
                statusToast.style.color = 'var(--success)';
                statusToast.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            } else {
                statusToast.style.background = 'rgba(239, 68, 68, 0.15)';
                statusToast.style.color = 'var(--danger)';
                statusToast.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            }

            setTimeout(() => {
                statusToast.style.display = 'none';
            }, 4000);
        }
    </script>
    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
    ${HTML_FOOTER('Apex Bank', 'NGINX Gateway Fabric')}
</body>
</html>`);
};

const serveApi = (req, res, isCanary) => {
    const isBrowser = (req.headers['accept'] || '').includes('text/html');

    if (!isBrowser) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            service: 'apex-api',
            version: isCanary ? '2.0.0-canary' : '1.0.0',
            status: 'ok',
            timestamp: new Date().toISOString()
        }));
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    const badgeHtml = isCanary 
        ? `<span class="badge badge-canary">Canary Release (V2.0.0-canary)</span>`
        : `<span class="badge badge-live">Stable Release (V1.0.0)</span>`;

    res.end(`<!DOCTYPE html>
<html lang="en">
${HTML_HEAD(isCanary ? 'Canary API Portal' : 'Production API Portal', 'Apex Bank')}
<body>
    ${HTML_HEADER_NAV('Apex Bank', 'Apex Gateway Routing Enabled')}
    <div class="container" style="justify-content: flex-start; padding-top: 3rem; gap: 2rem;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h1 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em;">Apex Developer API Portal</h1>
                <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 0.3rem;">Internal Gateway Endpoint routing metrics</p>
            </div>
            ${badgeHtml}
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; align-items: start;">
            <!-- Left Panel: Endpoint Table -->
            <div class="glass-panel" style="padding: 1.8rem; display: flex; flex-direction: column; gap: 1.25rem;">
                <h3 style="font-weight: 600; font-size: 1.15rem;">Registered API Route Details</h3>
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border); color: var(--text-secondary); font-size: 0.85rem;">
                            <th style="padding: 0.8rem;">METHOD</th>
                            <th style="padding: 0.8rem;">ENDPOINT</th>
                            <th style="padding: 0.8rem;">DESCRIPTION</th>
                            <th style="padding: 0.8rem; text-align: right;">AVG LATENCY</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid var(--border); font-size: 0.95rem;">
                            <td style="padding: 1rem;"><span style="color: var(--success); font-weight: 700; font-family: monospace;">GET</span></td>
                            <td style="padding: 1rem; font-family: monospace; font-weight: 500;">/api/v1/identity/session</td>
                            <td style="padding: 1rem; color: var(--text-secondary)">Validate active mTLS/token session</td>
                            <td style="padding: 1rem; text-align: right; font-family: monospace;">8.2 ms</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border); font-size: 0.95rem;">
                            <td style="padding: 1rem;"><span style="color: var(--accent); font-weight: 700; font-family: monospace;">POST</span></td>
                            <td style="padding: 1rem; font-family: monospace; font-weight: 500;">/api/v1/transfers/execute</td>
                            <td style="padding: 1rem; color: var(--text-secondary)">Submit automated MPC fund transfers</td>
                            <td style="padding: 1rem; text-align: right; font-family: monospace;">18.5 ms</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border); font-size: 0.95rem;">
                            <td style="padding: 1rem;"><span style="color: var(--success); font-weight: 700; font-family: monospace;">GET</span></td>
                            <td style="padding: 1rem; font-family: monospace; font-weight: 500;">/api/v1/accounts/ledger</td>
                            <td style="padding: 1rem; color: var(--text-secondary)">Fetch recent ledger items</td>
                            <td style="padding: 1rem; text-align: right; font-family: monospace;">12.1 ms</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Right Panel: Live JSON response viewer -->
            <div class="glass-panel" style="padding: 1.8rem; display: flex; flex-direction: column; gap: 1rem;">
                <h3 style="font-weight: 600; font-size: 1.15rem;">Live JSON Response Payload</h3>
                <div style="background: #05080e; border: 1px solid var(--border); border-radius: 10px; padding: 1.2rem; font-family: monospace; font-size: 0.9rem; color: #a5b4fc; overflow-x: auto; line-height: 1.5;">
                    <pre>{
  <span style="color: #38bdf8">"service"</span>: <span style="color: var(--success)">"apex-api"</span>,
  <span style="color: #38bdf8">"version"</span>: <span style="color: var(--warning)">"${isCanary ? '2.0.0-canary' : '1.0.0'}"</span>,
  <span style="color: #38bdf8">"status"</span>: <span style="color: var(--success)">"ok"</span>,
  <span style="color: #38bdf8">"gateway"</span>: <span style="color: var(--success)">"nginx-gateway-fabric"</span>,
  <span style="color: #38bdf8">"tls"</span>: <span style="color: var(--success)">"cert-manager-issued"</span>
}</pre>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center;">
                    Client Request IP: <span style="color: var(--text-primary); font-family: monospace;">${req.socket.remoteAddress}</span>
                </div>
            </div>
        </div>
    </div>
    ${HTML_FOOTER('Apex Bank', 'NGINX Gateway Fabric')}
</body>
</html>`);
};

/* ==========================================================================
   HOSPITAL ROLES (MEDICENTER)
   ========================================================================== */

const serveHospitalFrontend = (res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html lang="en">
${HTML_HEAD('Clinical Care', 'MediCenter')}
<body>
    ${HTML_HEADER_NAV('MediCenter', 'Envoy Gateway Routing Enabled')}
    <div class="container" style="justify-content: center; align-items: center; text-align: center; min-height: 80vh;">
        <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
            <div>
                <span class="badge badge-live" style="margin-bottom: 1rem; background: rgba(139, 92, 246, 0.15); color: var(--accent); border: 1px solid rgba(139, 92, 246, 0.3);">HIPAA Compliant Portal</span>
                <h1 style="font-size: 4rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 1rem;">
                    Next-Generation <br/>
                    <span style="background: linear-gradient(135deg, #a78bfa, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Clinical Care</span>
                </h1>
                <p style="font-size: 1.25rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto;">
                    MediCenter provides high-performance electronic health records, telehealth consultations, and remote diagnostic metrics powered by Envoy.
                </p>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                <a href="https://auth.medicenter.local" class="btn btn-primary">Patient Portal Login</a>
                <a href="https://api.medicenter.local" class="btn btn-secondary">EHR API Docs</a>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 4rem; text-align: left;">
                <div class="glass-panel" style="padding: 1.5rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🧬</div>
                    <h3 style="margin-bottom: 0.5rem; font-weight: 600;">Smart Diagnosis</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">Automated telemetry monitoring for proactive health alerts and predictive analysis.</p>
                </div>
                <div class="glass-panel" style="padding: 1.5rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>
                    <h3 style="margin-bottom: 0.5rem; font-weight: 600;">Telehealth Route</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">Instantly routed virtual sessions. Integrated directly within your personal console.</p>
                </div>
                <div class="glass-panel" style="padding: 1.5rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔒</div>
                    <h3 style="margin-bottom: 0.5rem; font-weight: 600;">Encrypted EHR</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">Strict zero-knowledge security standard protecting patient privacy end-to-end.</p>
                </div>
            </div>
        </div>
    </div>
    ${HTML_FOOTER('MediCenter', 'Envoy Gateway')}
</body>
</html>`);
};

const serveHospitalAuth = (res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html lang="en">
${HTML_HEAD('Patient Authentication', 'MediCenter')}
<body>
    ${HTML_HEADER_NAV('MediCenter', 'Envoy Gateway Routing Enabled')}
    <div class="container" style="justify-content: center; align-items: center; min-height: 80vh;">
        <div class="glass-panel" style="width: 100%; max-width: 450px; padding: 2.5rem; display: flex; flex-direction: column; gap: 2rem;">
            <div style="text-align: center;">
                <h2 style="font-size: 2rem; font-weight: 700;">Clinical Portal</h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.3rem;">Securely authenticate to access MediCenter records</p>
            </div>
            
            <form onsubmit="event.preventDefault(); window.location.href='https://dashboard.medicenter.local';" style="display: flex; flex-direction: column; gap: 1.25rem;">
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary)">PATIENT ID</label>
                    <input type="text" value="patient01" readonly style="font-family: inherit; font-size: 1rem; padding: 0.8rem 1rem; border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,0.01); color: var(--text-primary); outline: none;">
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary)">ACCESS CODE</label>
                    <input type="password" value="password123" readonly style="font-family: inherit; font-size: 1rem; padding: 0.8rem 1rem; border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,0.01); color: var(--text-primary); outline: none;">
                </div>

                <div style="background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.15); border-radius: 10px; padding: 0.8rem; font-size: 0.85rem; color: var(--accent); display: flex; gap: 0.5rem; align-items: flex-start; line-height: 1.4;">
                    <span style="font-size: 1.1rem; line-height: 1;">💡</span>
                    <span>Demo Mode Enabled: Credentials are pre-configured. Simply click the authenticate button.</span>
                </div>

                <button type="submit" class="btn btn-primary" style="margin-top: 0.5rem; width: 100%;">Access Records</button>
            </form>
        </div>
    </div>
    ${HTML_FOOTER('MediCenter', 'Envoy Gateway')}
</body>
</html>`);
};

const serveHospitalDashboard = (res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html lang="en">
${HTML_HEAD('Clinical Dashboard', 'MediCenter')}
<body>
    ${HTML_HEADER_NAV('MediCenter', 'Envoy Gateway Routing Enabled')}
    <div class="container" style="padding: 2rem 1rem; max-width: 1300px; gap: 2rem; justify-content: flex-start;">
        
        <!-- Welcome Message -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h1 style="font-size: 2.2rem; font-weight: 700;">Patient Console: John Doe</h1>
                <p style="color: var(--text-secondary); font-size: 0.95rem;">Interactive real-time vital telemetry simulator</p>
            </div>
            <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border); padding: 0.6rem 1.2rem; border-radius: 12px; font-size: 0.9rem;">
                HR Status: <span style="color: var(--success); font-weight: 600;">Optimal</span>
            </div>
        </div>

        <!-- Metric Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            <div class="glass-panel" style="padding: 1.8rem; position: relative; overflow: hidden;">
                <div style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">Heart Rate</div>
                <div id="heart-rate" style="font-size: 2.4rem; font-weight: 700; margin-top: 0.5rem; color: var(--success); transition: color 0.5s">72 bpm</div>
                <div style="font-size: 0.85rem; color: var(--success); margin-top: 0.4rem; display: flex; align-items: center; gap: 0.2rem;">
                    <span>Normal Range</span> <span style="color: var(--text-secondary)">(60-100 bpm)</span>
                </div>
            </div>
            
            <div class="glass-panel" style="padding: 1.8rem;">
                <div style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">Blood Pressure</div>
                <div id="blood-pressure" style="font-size: 2.4rem; font-weight: 700; margin-top: 0.5rem;">120/80 mmHg</div>
                <div style="font-size: 0.85rem; color: var(--success); margin-top: 0.4rem; display: flex; align-items: center; gap: 0.2rem;">
                    <span>Systolic Optimal</span> <span style="color: var(--text-secondary)">(Under 130)</span>
                </div>
            </div>

            <div class="glass-panel" style="padding: 1.8rem;">
                <div style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">Blood Oxygen SpO2</div>
                <div id="oxygen-sat" style="font-size: 2.4rem; font-weight: 700; margin-top: 0.5rem; color: var(--accent)">99%</div>
                <div style="font-size: 0.85rem; color: var(--success); margin-top: 0.4rem; display: flex; align-items: center; gap: 0.2rem;">
                    <span>Excellent</span> <span style="color: var(--text-secondary)">(95-100%)</span>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; align-items: start; width: 100%;">
            <!-- Left Side: Clinical Ledger and Visual Telemetry -->
            <div style="display: flex; flex-direction: column; gap: 2rem;">
                <!-- Chart Panel -->
                <div class="glass-panel" style="padding: 1.8rem; height: 320px; display: flex; flex-direction: column; gap: 1rem;">
                    <div style="font-weight: 600; font-size: 1.1rem; display: flex; justify-content: space-between; align-items: center;">
                        <span>Telemetry History</span>
                        <span style="color: var(--text-secondary); font-size: 0.85rem; font-weight: normal;">6-Hour Vital Cycle</span>
                    </div>
                    <!-- Inline SVG Chart -->
                    <div style="flex-grow: 1; position: relative; display: flex; align-items: flex-end; padding-top: 1.5rem;">
                        <svg viewBox="0 0 600 180" style="width: 100%; height: 100%;">
                            <!-- Grid lines -->
                            <line x1="0" y1="30" x2="600" y2="30" stroke="var(--border)" stroke-dasharray="4"/>
                            <line x1="0" y1="90" x2="600" y2="90" stroke="var(--border)" stroke-dasharray="4"/>
                            <line x1="0" y1="150" x2="600" y2="150" stroke="var(--border)" stroke-dasharray="4"/>
                            
                            <!-- Graph line path -->
                            <path d="M 50 120 Q 150 140 250 80 T 450 110 T 550 60" fill="none" stroke="var(--accent)" stroke-width="4"/>
                            <!-- Gradient Area below the path -->
                            <path d="M 50 120 Q 150 140 250 80 T 450 110 T 550 60 L 550 180 L 50 180 Z" fill="url(#chart-grad)" opacity="0.1"/>
                            
                            <!-- Dots -->
                            <circle cx="50" cy="120" r="5" fill="var(--accent)"/>
                            <circle cx="150" cy="138" r="5" fill="var(--accent)"/>
                            <circle cx="250" cy="80" r="5" fill="var(--accent)"/>
                            <circle cx="350" cy="100" r="5" fill="var(--accent)"/>
                            <circle cx="450" cy="110" r="5" fill="var(--accent)"/>
                            <circle cx="550" cy="60" r="5" fill="var(--accent)"/>

                            <!-- Gradients definitions -->
                            <defs>
                                <linearGradient id="chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="var(--accent)"/>
                                    <stop offset="100%" stop-color="transparent"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                <!-- Live Medical Records Ledger -->
                <div class="glass-panel" style="padding: 1.8rem; display: flex; flex-direction: column; gap: 1rem;">
                    <h3 style="font-weight: 600; font-size: 1.1rem;">EHR Clinical Records Ledger</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border); color: var(--text-secondary); font-size: 0.85rem;">
                                    <th style="padding: 0.8rem;">RECORD ID</th>
                                    <th style="padding: 0.8rem;">DESCRIPTION</th>
                                    <th style="padding: 0.8rem;">ATTENDING DOCTOR</th>
                                    <th style="padding: 0.8rem; text-align: right;">DATE</th>
                                    <th style="padding: 0.8rem; text-align: center;">STATUS</th>
                                </tr>
                            </thead>
                            <tbody id="clinical-rows">
                                <tr style="border-bottom: 1px solid var(--border); font-size: 0.95rem;">
                                    <td style="padding: 1rem; color: var(--text-secondary); font-family: monospace;">EHR-2039</td>
                                    <td style="padding: 1rem; font-weight: 500;">Routine Comprehensive Physical</td>
                                    <td style="padding: 1rem; color: var(--text-secondary)">Dr. Sarah Connor</td>
                                    <td style="padding: 1rem; text-align: right; color: var(--text-primary);">05/12/2026</td>
                                    <td style="padding: 1rem; text-align: center;"><span class="badge badge-live">Completed</span></td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border); font-size: 0.95rem;">
                                    <td style="padding: 1rem; color: var(--text-secondary); font-family: monospace;">EHR-2038</td>
                                    <td style="padding: 1rem; font-weight: 500;">Lipid Profile & CBC Lab Panel</td>
                                    <td style="padding: 1rem; color: var(--text-secondary)">Quest Diagnostics</td>
                                    <td style="padding: 1rem; text-align: right; color: var(--text-primary)">04/28/2026</td>
                                    <td style="padding: 1rem; text-align: center;"><span class="badge badge-live">Completed</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Right Side: Virtual Appointment Simulator -->
            <div class="glass-panel" style="padding: 1.8rem; display: flex; flex-direction: column; gap: 1.5rem;">
                <h3 style="font-weight: 600; font-size: 1.1rem;">Schedule Virtual Telehealth Session</h3>
                
                <form id="appt-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary)">ATTENDING PHYSICIAN</label>
                        <select id="doc-name" style="font-family: inherit; font-size: 0.95rem; padding: 0.7rem 0.9rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary); outline: none;">
                            <option value="Dr. Sarah Connor">Dr. Sarah Connor (Primary Care)</option>
                            <option value="Dr. Stephen Strange">Dr. Stephen Strange (Neurology)</option>
                            <option value="Dr. Gregory House">Dr. Gregory House (Diagnostic)</option>
                        </select>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary)">SYMPTOM DESCRIPTION</label>
                        <input id="symptom-desc" type="text" placeholder="e.g. Mild headache, allergies" required style="font-family: inherit; font-size: 0.95rem; padding: 0.7rem 0.9rem; border-radius: 8px; border: 1px solid var(--border); background: rgba(255,255,255,0.01); color: var(--text-primary); outline: none;">
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary)">APPOINTMENT DATE</label>
                        <input id="appt-date" type="date" required style="font-family: inherit; font-size: 0.95rem; padding: 0.7rem 0.9rem; border-radius: 8px; border: 1px solid var(--border); background: rgba(255,255,255,0.01); color: var(--text-primary); outline: none;">
                    </div>

                    <button type="submit" class="btn btn-primary" style="width: 100%;">Request Telehealth Session</button>
                </form>

                <div id="status-toast" style="padding: 0.8rem; border-radius: 8px; font-size: 0.85rem; display: none; text-align: center; font-weight: 500;">
                </div>
            </div>
        </div>
    </div>

    <!-- Live Client Interactive JS -->
    <script>
        const apptForm = document.getElementById('appt-form');
        const clinicalRows = document.getElementById('clinical-rows');
        const statusToast = document.getElementById('status-toast');
        const hrEl = document.getElementById('heart-rate');

        // Dynamic Heart Rate vital simulation
        setInterval(() => {
            const hr = Math.floor(68 + Math.random() * 8);
            hrEl.innerText = hr + ' bpm';
            
            // flash success color
            hrEl.style.color = '#34d399';
            setTimeout(() => {
                hrEl.style.color = 'var(--success)';
            }, 500);
        }, 3000);

        apptForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const doctor = document.getElementById('doc-name').value;
            const desc = document.getElementById('symptom-desc').value;
            const dateVal = document.getElementById('appt-date').value;

            // Generate EHR ID
            const ehrId = 'EHR-' + Math.floor(2040 + Math.random() * 99);

            // Re-format Date
            const dateObj = new Date(dateVal);
            const dateStr = (dateObj.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                            dateObj.getDate().toString().padStart(2, '0') + '/' + 
                            dateObj.getFullYear();

            // Append row
            const newRow = document.createElement('tr');
            newRow.style.borderBottom = '1px solid var(--border)';
            newRow.style.fontSize = '0.95rem';
            newRow.style.animation = 'fadeIn 0.5s ease';
            newRow.innerHTML = \`
                <td style="padding: 1rem; color: var(--text-secondary); font-family: monospace;">\${ehrId}</td>
                <td style="padding: 1rem; font-weight: 500;">Consultation: \${desc}</td>
                <td style="padding: 1rem; color: var(--text-secondary)">\${doctor}</td>
                <td style="padding: 1rem; text-align: right; color: var(--text-primary);">\${dateStr}</td>
                <td style="padding: 1rem; text-align: center;"><span class="badge" style="background: rgba(139, 92, 246, 0.15); color: var(--accent); border: 1px solid rgba(139, 92, 246, 0.3);">Scheduled</span></td>
            \`;

            clinicalRows.insertBefore(newRow, clinicalRows.firstChild);
            showToast("Telehealth consultation scheduled successfully!", true);

            // Reset Form fields
            document.getElementById('symptom-desc').value = '';
            document.getElementById('appt-date').value = '';
        });

        function showToast(msg, isSuccess) {
            statusToast.innerText = msg;
            statusToast.style.display = 'block';
            if (isSuccess) {
                statusToast.style.background = 'rgba(139, 92, 246, 0.15)';
                statusToast.style.color = 'var(--accent)';
                statusToast.style.border = '1px solid rgba(139, 92, 246, 0.3)';
            } else {
                statusToast.style.background = 'rgba(239, 68, 68, 0.15)';
                statusToast.style.color = 'var(--danger)';
                statusToast.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            }

            setTimeout(() => {
                statusToast.style.display = 'none';
            }, 4000);
        }
    </script>
    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
    ${HTML_FOOTER('MediCenter', 'Envoy Gateway')}
</body>
</html>`);
};

const serveHospitalApi = (req, res, isCanary) => {
    const isBrowser = (req.headers['accept'] || '').includes('text/html');

    if (!isBrowser) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            service: 'medicenter-api',
            version: isCanary ? '2.0.0-canary' : '1.0.0',
            status: 'ok',
            timestamp: new Date().toISOString()
        }));
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    const badgeHtml = isCanary 
        ? `<span class="badge badge-canary" style="background: rgba(139, 92, 246, 0.15); color: var(--accent); border: 1px solid rgba(139, 92, 246, 0.3);">Canary EHR (V2.0.0-canary)</span>`
        : `<span class="badge badge-live">Stable EHR (V1.0.0)</span>`;

    res.end(`<!DOCTYPE html>
<html lang="en">
${HTML_HEAD(isCanary ? 'Canary EHR API' : 'Clinical API Portal', 'MediCenter')}
<body>
    ${HTML_HEADER_NAV('MediCenter', 'Envoy Gateway Routing Enabled')}
    <div class="container" style="justify-content: flex-start; padding-top: 3rem; gap: 2rem;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h1 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em;">EHR Developer API Portal</h1>
                <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 0.3rem;">Clinical gateway endpoints and schema validators</p>
            </div>
            ${badgeHtml}
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; align-items: start;">
            <!-- Left Panel: Endpoint Table -->
            <div class="glass-panel" style="padding: 1.8rem; display: flex; flex-direction: column; gap: 1.25rem;">
                <h3 style="font-weight: 600; font-size: 1.15rem;">Registered Clinical API Routes</h3>
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border); color: var(--text-secondary); font-size: 0.85rem;">
                            <th style="padding: 0.8rem;">METHOD</th>
                            <th style="padding: 0.8rem;">ENDPOINT</th>
                            <th style="padding: 0.8rem;">DESCRIPTION</th>
                            <th style="padding: 0.8rem; text-align: right;">AVG LATENCY</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid var(--border); font-size: 0.95rem;">
                            <td style="padding: 1rem;"><span style="color: var(--success); font-weight: 700; font-family: monospace;">GET</span></td>
                            <td style="padding: 1rem; font-family: monospace; font-weight: 500;">/api/v1/clinical/telemetry</td>
                            <td style="padding: 1rem; color: var(--text-secondary)">Fetch live patient biometric vitals</td>
                            <td style="padding: 1rem; text-align: right; font-family: monospace;">5.8 ms</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border); font-size: 0.95rem;">
                            <td style="padding: 1rem;"><span style="color: var(--accent); font-weight: 700; font-family: monospace;">POST</span></td>
                            <td style="padding: 1rem; font-family: monospace; font-weight: 500;">/api/v1/clinical/appointments</td>
                            <td style="padding: 1rem; color: var(--text-secondary)">Request clinical telehealth slots</td>
                            <td style="padding: 1rem; text-align: right; font-family: monospace;">14.2 ms</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border); font-size: 0.95rem;">
                            <td style="padding: 1rem;"><span style="color: var(--success); font-weight: 700; font-family: monospace;">GET</span></td>
                            <td style="padding: 1rem; font-family: monospace; font-weight: 500;">/api/v1/clinical/records</td>
                            <td style="padding: 1rem; color: var(--text-secondary)">Fetch FHIR-compliant patient records</td>
                            <td style="padding: 1rem; text-align: right; font-family: monospace;">10.4 ms</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Right Panel: Live JSON response viewer -->
            <div class="glass-panel" style="padding: 1.8rem; display: flex; flex-direction: column; gap: 1rem;">
                <h3 style="font-weight: 600; font-size: 1.15rem;">Live EHR JSON Response Payload</h3>
                <div style="background: #05080e; border: 1px solid var(--border); border-radius: 10px; padding: 1.2rem; font-family: monospace; font-size: 0.9rem; color: #a5b4fc; overflow-x: auto; line-height: 1.5;">
                    <pre>{
  <span style="color: #38bdf8">"service"</span>: <span style="color: var(--success)">"medicenter-api"</span>,
  <span style="color: #38bdf8">"version"</span>: <span style="color: var(--warning)">"${isCanary ? '2.0.0-canary' : '1.0.0'}"</span>,
  <span style="color: #38bdf8">"status"</span>: <span style="color: var(--success)">"ok"</span>,
  <span style="color: #38bdf8">"gateway"</span>: <span style="color: var(--success)">"envoy-gateway"</span>,
  <span style="color: #38bdf8">"tls"</span>: <span style="color: var(--success)">"cert-manager-issued"</span>
}</pre>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center;">
                    Client Request IP: <span style="color: var(--text-primary); font-family: monospace;">${req.socket.remoteAddress}</span>
                </div>
            </div>
        </div>
    </div>
    ${HTML_FOOTER('MediCenter', 'Envoy Gateway')}
</body>
</html>`);
};

// Dispatch server requests
const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Apex-Canary, X-MediCenter-Canary');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (ROLE === 'frontend') {
        serveFrontend(res);
    } else if (ROLE === 'auth') {
        serveAuth(res);
    } else if (ROLE === 'dashboard') {
        serveDashboard(res);
    } else if (ROLE === 'api') {
        serveApi(req, res, false);
    } else if (ROLE === 'api-canary') {
        serveApi(req, res, true);
    } else if (ROLE === 'hospital-frontend') {
        serveHospitalFrontend(res);
    } else if (ROLE === 'hospital-auth') {
        serveHospitalAuth(res);
    } else if (ROLE === 'hospital-dashboard') {
        serveHospitalDashboard(res);
    } else if (ROLE === 'hospital-api') {
        serveHospitalApi(req, res, false);
    } else if (ROLE === 'hospital-api-canary') {
        serveHospitalApi(req, res, true);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Role not configured');
    }
});

server.listen(PORT, () => {
    console.log(`System Component [Role: ${ROLE}] is running on port ${PORT}`);
});
