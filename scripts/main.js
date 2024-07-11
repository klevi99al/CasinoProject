import Phaser from 'phaser';
import { forcedWin, createCheckbox, displayPayoutTable } from './utils';

const config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 1000,
    parent: 'phaser-game',
    scene: {
        preload: preload,
        create: create,
    }
};


new Phaser.Game(config);

let playerBalance = 500;
let spinValue = 100;
let paytableButton;
let payoutTableVisible = true;
let balanceText;
let winText;

function preload() {
    const symbols = ['BONUS', '9', '10', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'J', 'K', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'Q'];
    symbols.forEach(symbol => {
        this.load.image(`symbol${symbol}`, `/assets/images/${symbol}.png`);
    });

    this.load.audio('spinSound', '/assets/sounds/spin.mp3');
    
    this.load.image('slotMachineBorder', '/assets/images/slotMachineBorder.png');
}

function create() {
    
    createCheckbox(this, 50, 150, 'Force Win', false);
    
    balanceText = this.add.text(50, 800, `Balance: ${playerBalance}`, { fontSize: '24px', fill: '#ffffff' });
    this.add.text(50, 750, `Spin: ${spinValue}`, { fontSize: '24px', fill: '#ffffff' });
    winText = this.add.text(800, 50, ` `, { fontSize: '45px', fill: '#ffd801', fontWeight: 'bold' });
    winText.setAlpha(0);

    let bg = this.add.image(config.width / 2, config.height / 2, 'slotMachineBorder').setOrigin(0.35, 0.5);
    bg.setDisplaySize(1104, bg.height);

    const redMask = this.add.graphics();
    const rectWidth = 1000;
    const rectHeight = 600;
    redMask.fillStyle(0xff0000, 0);

    let horizontalOffset = -170;
    let verticalOffset = 0;

    redMask.fillRect((config.width / 2 - rectWidth / 2) - horizontalOffset, (config.height / 2 - rectHeight / 2) - verticalOffset, rectWidth, rectHeight);
    const mask = redMask.createGeometryMask();
    
    this.reelConfig = {
        reelWidth: 200,
        reelHeight: 200,
        rows: 3,
        cols: 5,
        spinDuration: 6000,
        spins: 10
    };

    this.reels = createReels.call(this, mask);
    this.isSpinning = false;
    this.spinButton = createSpinButton.call(this);
    this.winTextElement = document.getElementById('winText');

    paytableButton = this.add.text(50, 50, 'Paytable', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#228B22',
        padding: { x: 10, y: 5 },
    }).setInteractive();

    paytableButton.on('pointerup', () => {
        togglePayoutTable.call(this);
    });
}

function togglePayoutTable() {
    displayPayoutTable(this);
    payoutTableVisible = !payoutTableVisible;
}

function calculateSpaces() {
    let horizontalSpace = 0;
    let verticalSpace = 0;
    return { horizontalSpace, verticalSpace };
}

function createReels(mask) {
    const spaces = calculateSpaces.call(this);
    let reels = [];
    for (let col = 0; col < this.reelConfig.cols; col++) {
        let reel = [];
        for (let row = 0; row < this.reelConfig.rows; row++) {
            let x = col * (this.reelConfig.reelWidth + spaces.horizontalSpace);
            let y = row * (this.reelConfig.reelHeight + spaces.verticalSpace);
            let symbol = this.add.image(x, y, 'symbol9').setOrigin(-2.35, -1);
            symbol.setMask(mask);
            reel.push(symbol);
        }
        reels.push(reel);
    }
    return reels;
}

function createSpinButton() {
    const spinButton = this.add.text(this.scale.width / 2, this.scale.height - 100, 'Spin', {
        fontSize: '32px',
        fill: '#fff',
        backgroundColor: '#ff0000',
        padding: { x: 10, y: 5 },
    }).setOrigin(0, 0).setInteractive();

    spinButton.on('pointerdown', () => {
        if (this.isSpinning || playerBalance < spinValue) {
            return;
        }

        this.sound.play('spinSound');
        playerBalance -= spinValue;
        balanceText.setText(`Balance: ${playerBalance}`);


        this.isSpinning = true;
        this.tweens.add({
            targets: spinButton,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 100,
            yoyo: true,
            repeat: 0,
            ease: 'Cubic.easeInOut'
        });
        spinReels.call(this);
    });

    return spinButton;
}

export function spinReels() {
    const symbols = ['symbol9', 'symbol10', 'symbolA', 'symbolBONUS', 'symbolH1', 'symbolH2', 'symbolH3', 'symbolH4', 'symbolH5', 'symbolH6', 'symbolJ', 'symbolK', 'symbolM1', 'symbolM2', 'symbolM3', 'symbolM4', 'symbolM5', 'symbolM6', 'symbolQ'];
    
    for (let col = 0; col < this.reels.length; col++) {
        spinReel.call(this, col, symbols);
    }
}

function spinReel(col, symbols) {
    const duration = this.reelConfig.spinDuration / this.reelConfig.spins;
    const delay = col * 200;
    const totalHeight = this.reelConfig.reelHeight * (this.reelConfig.rows + 1);

    for (let i = 0; i < this.reelConfig.spins; i++) {
        this.reels[col].forEach((symbol, index) => {
            const targetY = symbol.y + totalHeight;
            this.tweens.add({
                targets: symbol,
                y: targetY,
                duration: duration,
                delay: delay + i * duration,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    symbol.y -= totalHeight;
                    if (i === this.reelConfig.spins - 1 && index === this.reelConfig.rows - 1) {
                        resetReelPosition.call(this, col, symbols);
                    }
                }
            });
        });
    }
}

function resetReelPosition(col, symbols) {
    const randomSymbols = Phaser.Utils.Array.Shuffle(symbols).slice(0, this.reelConfig.rows);

    for (let row = 0; row < this.reels[col].length; row++) {
        let symbol = this.reels[col][row];
        symbol.y = row * this.reelConfig.reelHeight; // Reset to initial Y position
        const randomSymbol = Phaser.Math.RND.pick(randomSymbols);
        symbol.setTexture(randomSymbol);
        console.log(`Updated symbol at col ${col}, row ${row} to ${randomSymbol}`);
    }
    const randomSymbol = Phaser.Math.RND.pick(randomSymbols);
    
    if(forcedWin){
        this.reels[0][0].setTexture(randomSymbol);
        this.reels[1][0].setTexture(randomSymbol);
        this.reels[2][0].setTexture(randomSymbol);
        this.reels[3][0].setTexture(randomSymbol);
        this.reels[4][0].setTexture(randomSymbol);
    }
    
    if (col === this.reelConfig.cols - 1) {
        calculateWin.call(this);
        this.isSpinning = false;
    }
}

function calculateWin() {
    const payTable = {
        'symbol9': 10,
        'symbol10': 20,
        'symbolA': 30,
        'symbolBONUS': 100,
        'symbolH1': 40,
        'symbolH2': 50,
        'symbolH3': 60,
        'symbolH4': 70,
        'symbolH5': 80,
        'symbolH6': 90,
        'symbolJ': 25,
        'symbolK': 35,
        'symbolM1': 45,
        'symbolM2': 55,
        'symbolM3': 65,
        'symbolM4': 75,
        'symbolM5': 85,
        'symbolM6': 95,
        'symbolQ': 15
    };

    let winAmount = 0;

    for (let row = 0; row < this.reelConfig.rows; row++) {
        let consecutiveCount = 1;
        let currentSymbol = this.reels[0][row].texture.key;

        for (let col = 1; col < this.reelConfig.cols; col++) {
            if (this.reels[col][row].texture.key === currentSymbol) {
                consecutiveCount++;
            } else {
                if (consecutiveCount >= 3) {
                    winAmount += payTable[currentSymbol] * consecutiveCount;
                }
                currentSymbol = this.reels[col][row].texture.key;
                consecutiveCount = 1;
            }
        }

        if (consecutiveCount >= 3) {
            winAmount += payTable[currentSymbol] * consecutiveCount;
        }
    }

    winText.setAlpha(1);
    winText.setText("You won: "+winAmount);
    playerBalance += winAmount;
    balanceText.setText(`Balance: ${playerBalance}`);

    this.time.delayedCall(3000, () => {
        this.tweens.add({
            targets: winText,
            alpha: 0,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                winText.setText('');
            }
        });
    });
}
