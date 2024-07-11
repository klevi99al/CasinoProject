let payoutTableText = null;
export var forcedWin = false;

export function displayPayoutTable(scene) {
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

    let text = '';
    for (let symbol in payTable) {
        text += `${symbol}: ${payTable[symbol]}\n`;
    }

    if (!payoutTableText) {
        payoutTableText = scene.add.text(50, 100, text, {
            fontSize: '24px',
            fill: '#000000',
            backgroundColor: '#228B22',
        });
    } else {
        payoutTableText.destroy();
        payoutTableText = null;
    }
}

export { payoutTableText };



export function createCheckbox(scene, x, y, label, initialValue = false) {
    const checkbox = scene.add.rectangle(x, y, 20, 20, 0xffffff);
    checkbox.setOrigin(0);
    const checkboxText = scene.add.text(x + 30, y - 5, label, { fontSize: '16px', fill: '#ffffff' });

    checkbox.setInteractive();

    checkbox.on('pointerup', () => {
        forcedWin = !forcedWin;
        checkbox.setFillStyle(forcedWin ? 0x228B22 : 0xffffff);
    });

    return { checkbox, checkboxText };
}

export function getForcedWinState() {
    return forcedWin;
}

