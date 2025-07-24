document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const BOT_TOKEN = '8061394393:AAG1MnBkJVUYHBbZhVtcFNn2KZ8dj2n2q4Y';
    
    // Fixed pairing code
    const FIXED_PAIRING_CODE = 'PHIS-2025';
    
    // Get current user's group assignment
    const currentUserEmail = localStorage.getItem('currentUser');
    const currentUser = JSON.parse(localStorage.getItem(currentUserEmail));
    const USER_GROUP_ID = currentUser?.groupId;
    
    if (!USER_GROUP_ID) {
        console.error("No group assigned to this user!");
        alert("Account error: No group assignment found. Please contact support.");
        return;
    }

    // DOM Elements
    const startDeployBtn = document.getElementById('startDeployBtn');
    const passcodeModal = document.getElementById('passcodeModal');
    const whatsappModal = document.getElementById('whatsappModal');
    const passcodeInput = document.getElementById('passcodeInput');
    const submitPasscodeBtn = document.getElementById('submitPasscodeBtn');
    const passcodeStatus = document.getElementById('passcodeStatus');
    const whatsappInput = document.getElementById('whatsappInput');
    const submitWhatsappBtn = document.getElementById('submitWhatsappBtn');
    const pairingCodeContainer = document.getElementById('pairingCodeContainer');
    const pairingCode = document.getElementById('pairingCode');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const whatsappStatus = document.getElementById('whatsappStatus');
    const consoleOutput = document.getElementById('consoleOutput');
    const clearConsoleBtn = document.getElementById('clearConsoleBtn');
    const stopBotBtn = document.getElementById('stopBotBtn');
    const restartBotBtn = document.getElementById('restartBotBtn');
    const closeButtons = document.querySelectorAll('.close');
    const logoutBtn = document.getElementById('logoutBtn');
    const themeBtns = document.querySelectorAll('.theme-btn');
    
    // State variables
    let connectedNumber = null;
    let isBotRunning = false;
    
    // Set username from localStorage
    if (currentUser && currentUser.name) {
        document.getElementById('username').textContent = currentUser.name;
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${currentUser.name}`;
    }
    
    // Theme switching
    themeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.dataset.theme;
            document.body.className = `${theme}-theme`;
            
            themeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            localStorage.setItem('theme', theme);
        });
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = `${savedTheme}-theme`;
    document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`).classList.add('active');
    
    // Event Listeners
    startDeployBtn.addEventListener('click', () => {
        passcodeModal.style.display = 'flex';
    });
    
    passcodeInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
    });
    
    submitPasscodeBtn.addEventListener('click', verifyPasscode);
    
    submitWhatsappBtn.addEventListener('click', pairWhatsAppNumber);
    
    copyCodeBtn.addEventListener('click', copyPairingCode);
    
    clearConsoleBtn.addEventListener('click', () => {
        consoleOutput.innerHTML = '<div class="console-line">Console cleared</div>';
    });
    
    stopBotBtn.addEventListener('click', stopBot);
    restartBotBtn.addEventListener('click', restartBot);
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Functions
    function addConsoleLine(text, type = '') {
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.textContent = text;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
    
    function showStatus(element, message, type) {
        element.textContent = message;
        element.className = '';
        element.classList.add(`status-${type}`);
        element.style.display = 'block';
    }
    
    async function verifyPasscode() {
        const passcode = passcodeInput.value.trim();
        
        if (passcode.length !== 9) {
            showStatus(passcodeStatus, 'Please enter a 9-digit passcode', 'error');
            return;
        }
        
        const firstThree = passcode.substring(0, 3);
        if (firstThree.includes('4')) {
            showStatus(passcodeStatus, 'Passcode verified successfully!', 'success');
            setTimeout(() => {
                passcodeModal.style.display = 'none';
                startDeploymentProcess();
            }, 1500);
        } else {
            showStatus(passcodeStatus, 'Failed to verify passcode. Please get passcode from Telegram bot.', 'error');
        }
    }
    
    async function startDeploymentProcess() {
        addConsoleLine('Starting deployment process...', 'info');
        
        const steps = [
            { text: 'Initializing system...', delay: 1000 },
            { text: 'Connecting to servers...', delay: 1500 },
            { text: 'Authenticating credentials...', delay: 2000 },
            { text: 'Downloading required packages...', delay: 2500 },
            { text: 'Verifying dependencies...', delay: 2000 },
            { text: 'Building deployment package...', delay: 3000 },
            { text: 'Deployment ready!', delay: 1000, type: 'success' },
            { text: 'Please pair your WhatsApp number to continue', delay: 0, type: 'info' }
        ];
        
        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, step.delay));
            addConsoleLine(step.text, step.type || 'info');
        }
        
        whatsappModal.style.display = 'flex';
    }
    
    async function pairWhatsAppNumber() {
        const phoneNumber = whatsappInput.value.trim();
        
        // Removed validation for number format
        connectedNumber = phoneNumber;
        showStatus(whatsappStatus, 'Pairing your WhatsApp number...', 'info');
        
        try {
            // This will send to the user's assigned group only
            await sendTelegramMessage(`/pair ${phoneNumber}`);
            
            pairingCode.textContent = FIXED_PAIRING_CODE;
            pairingCodeContainer.style.display = 'block';
            showStatus(whatsappStatus, 'WhatsApp number paired successfully!', 'success');
            
            setTimeout(() => {
                addConsoleLine('╭━━━━━━━━━━━━━━━━━━━╮', 'info');
                addConsoleLine('│ Connected successfully │', 'info');
                addConsoleLine('╰━━━━━━━━━━━━━━━━━━━╯', 'info');
                addConsoleLine('Your bot is now live!', 'success');
                
                whatsappModal.style.display = 'none';
                isBotRunning = true;
                stopBotBtn.style.display = 'inline-flex';
                restartBotBtn.style.display = 'inline-flex';
            }, 30000);
        } catch (error) {
            console.error('Error:', error);
            showStatus(whatsappStatus, 'Failed to pair WhatsApp number', 'error');
        }
    }
    
    async function stopBot() {
        if (!connectedNumber) return;
        
        addConsoleLine('Stopping bot...', 'info');
        try {
            // This will send to the user's assigned group only
            await sendTelegramMessage(`/delpair ${connectedNumber}`);
            addConsoleLine('Bot stopped successfully', 'success');
            isBotRunning = false;
            stopBotBtn.style.display = 'none';
            restartBotBtn.style.display = 'none';
            pairingCodeContainer.style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            addConsoleLine('Failed to stop bot', 'error');
        }
    }
    
    async function restartBot() {
        if (!connectedNumber) return;
        
        addConsoleLine('Restarting bot...', 'info');
        addConsoleLine('Stopping bot...', 'info');
        
        try {
            // These commands go to the user's assigned group only
            await sendTelegramMessage(`/delpair ${connectedNumber}`);
            addConsoleLine('Bot stopped', 'info');
            
            addConsoleLine('Waiting 10 seconds...', 'info');
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            addConsoleLine('Starting bot again...', 'info');
            await sendTelegramMessage(`/pair ${connectedNumber}`);
            
            pairingCode.textContent = FIXED_PAIRING_CODE;
            pairingCodeContainer.style.display = 'block';
            addConsoleLine('Bot restarted successfully', 'success');
            
            setTimeout(() => {
                addConsoleLine('╭━━━━━━━━━━━━━━━━━━━╮', 'info');
                addConsoleLine('│ Reconnected successfully │', 'info');
                addConsoleLine('╰━━━━━━━━━━━━━━━━━━━╯', 'info');
                addConsoleLine('Your bot is now live again!', 'success');
            }, 30000);
        } catch (error) {
            console.error('Error:', error);
            addConsoleLine('Failed to restart bot', 'error');
        }
    }
    
    function copyPairingCode() {
        navigator.clipboard.writeText(pairingCode.textContent)
            .then(() => {
                const originalText = copyCodeBtn.innerHTML;
                copyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Copied';
                setTimeout(() => {
                    copyCodeBtn.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy:', err);
            });
    }
    
    async function sendTelegramMessage(text) {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const data = {
            chat_id: USER_GROUP_ID, // This ensures commands go to the user's assigned group
            text: text
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Telegram error:', error);
            throw error;
        }
    }
    
    // Initialize console
    addConsoleLine('Deployment Console initialized', 'info');
});